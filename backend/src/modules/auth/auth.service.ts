import { randomUUID } from 'node:crypto';
import { env } from '../../config/env.js';
import { withTransaction } from '../../database/transaction.js';
import { registrarAuditoria } from '../sistema/auditoria.repository.js';
import {
  ConflictError,
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from '../../shared/errors/app-error.js';
import { hmacHex, randomToken, safeEqualHex, sha256Hex } from '../../shared/utils/crypto.js';
import { calcularEdad } from '../../shared/utils/fechas.js';
import { ACCESS_TOKEN_SEGUNDOS, signAccessToken } from '../../shared/utils/jwt.js';
import { hashPassword, obtenerHashFalso, verifyPassword } from '../../shared/utils/password.js';
import type { ContextoPeticion } from '../../shared/utils/request-context.js';
import type { LoginInput, RegistroInput } from './auth.schemas.js';
import * as repo from './auth.repository.js';

export interface UsuarioPublico {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  estado: string;
  roles: string[];
}

export interface SesionEmitida {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// PENDIENTE puede entrar: todavía no existe la verificación de correo (viene en otro módulo)
const ESTADOS_CON_ACCESO = ['PENDIENTE', 'ACTIVO'];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const DIA_MS = 24 * 60 * 60 * 1000;

function errno(error: unknown): number | undefined {
  return typeof error === 'object' && error !== null && 'errno' in error
    ? Number((error as { errno: unknown }).errno)
    : undefined;
}

function expiracionRefresh(): Date {
  return new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * DIA_MS);
}

/** El refresh token tiene la forma "<id de sesión>.<secreto aleatorio>". */
function parsearRefreshToken(token: string | undefined): { sesionId: string; secreto: string } | null {
  if (!token) return null;
  const partes = token.split('.');
  const [sesionId, secreto] = partes;
  if (partes.length !== 2 || !sesionId || !secreto || !UUID.test(sesionId)) return null;
  return { sesionId, secreto };
}

async function emitirSesion(
  usuarioId: string,
  roles: string[],
  ctx: ContextoPeticion,
): Promise<SesionEmitida> {
  const sesionId = randomUUID();
  const secreto = randomToken();

  await repo.crearSesion({
    id: sesionId,
    usuarioId,
    refreshTokenHash: sha256Hex(secreto), // en la BD solo se guarda el hash
    dispositivo: ctx.dispositivo,
    ipHash: ctx.ipHash,
    expiraEn: expiracionRefresh(),
  });

  return {
    accessToken: signAccessToken(usuarioId, roles),
    refreshToken: `${sesionId}.${secreto}`,
    expiresIn: ACCESS_TOKEN_SEGUNDOS,
  };
}

export async function registrar(input: RegistroInput, ctx: ContextoPeticion) {
  const edad = calcularEdad(input.fecha_nacimiento);

  if (input.rol === 'CAZATALENTOS' && edad < 18) {
    throw new ValidationError([
      { campo: 'body.fecha_nacimiento', mensaje: 'Los cazatalentos deben ser mayores de edad' },
    ]);
  }

  const id = randomUUID();
  const passwordHash = await hashPassword(input.password);

  try {
    // Usuario y rol se guardan juntos: si algo falla, no queda un usuario sin rol
    await withTransaction(async (conn) => {
      await repo.insertarUsuario(conn, {
        id,
        nombre: input.nombre,
        apellido: input.apellido,
        email: input.email,
        passwordHash,
        telefono: input.telefono ?? null,
        fechaNacimiento: input.fecha_nacimiento,
        paisId: input.pais_id,
        ciudad: input.ciudad ?? null,
      });
      await repo.asignarRol(conn, id, input.rol);
    });
  } catch (error) {
    if (errno(error) === 1062) throw new ConflictError('Ese correo ya está registrado');
    if (errno(error) === 1452) {
      throw new ValidationError([{ campo: 'body.pais_id', mensaje: 'El país indicado no existe' }]);
    }
    throw error;
  }

  await registrarAuditoria({
    usuarioId: id,
    accion: 'REGISTRO',
    entidad: 'usuarios',
    entidadId: id,
    ipHash: ctx.ipHash,
    detalles: { rol: input.rol },
  });

  return {
    usuario: {
      id,
      nombre: input.nombre,
      apellido: input.apellido,
      email: input.email,
      estado: 'PENDIENTE',
      roles: [input.rol],
    } satisfies UsuarioPublico,
    // Un jugador menor necesitará la autorización de su tutor (módulo de verificación)
    requiere_autorizacion_tutor: input.rol === 'JUGADOR' && edad < 18,
  };
}

export async function iniciarSesion(input: LoginInput, ctx: ContextoPeticion) {
  const usuario = await repo.buscarUsuarioPorEmail(input.email);

  // Si el correo no existe se verifica contra un hash falso: mismo tiempo de respuesta
  const hashAVerificar = usuario?.password_hash ?? (await obtenerHashFalso());
  const passwordCorrecta = await verifyPassword(hashAVerificar, input.password);

  if (!usuario || !passwordCorrecta) {
    await registrarAuditoria({
      usuarioId: usuario?.id ?? null,
      accion: 'LOGIN_FALLIDO',
      entidad: 'usuarios',
      entidadId: usuario?.id ?? null,
      ipHash: ctx.ipHash,
      detalles: { email_hash: hmacHex(input.email, 'email') }, // nunca el correo en claro
    });
    // Mismo mensaje en ambos casos: no se revela si el correo existe
    throw new UnauthorizedError('Correo o contraseña incorrectos');
  }

  if (!ESTADOS_CON_ACCESO.includes(usuario.estado)) {
    await registrarAuditoria({
      usuarioId: usuario.id,
      accion: 'LOGIN_BLOQUEADO',
      entidad: 'usuarios',
      entidadId: usuario.id,
      ipHash: ctx.ipHash,
      detalles: { estado: usuario.estado },
    });
    throw new ForbiddenError('Esta cuenta no está disponible. Contacta a soporte.');
  }

  const roles = await repo.obtenerRoles(usuario.id);
  const sesion = await emitirSesion(usuario.id, roles, ctx);
  await repo.actualizarUltimoAcceso(usuario.id);

  await registrarAuditoria({
    usuarioId: usuario.id,
    accion: 'LOGIN_OK',
    entidad: 'usuarios',
    entidadId: usuario.id,
    ipHash: ctx.ipHash,
  });

  return {
    sesion,
    usuario: {
      id: usuario.id,
      nombre: usuario.nombre,
      apellido: usuario.apellido,
      email: usuario.email,
      estado: usuario.estado,
      roles,
    } satisfies UsuarioPublico,
  };
}

export async function renovarSesion(refreshToken: string | undefined, ctx: ContextoPeticion) {
  const invalido = new UnauthorizedError('Sesión inválida o expirada');

  const partes = parsearRefreshToken(refreshToken);
  if (!partes) throw invalido;

  const sesion = await repo.buscarSesion(partes.sesionId);
  if (!sesion || sesion.revocado_en || sesion.expira_en.getTime() <= Date.now()) throw invalido;

  const hashPresentado = sha256Hex(partes.secreto);

  // Token con sesión válida pero secreto distinto = alguien usó un token ya rotado.
  // Puede ser un robo: se cierra la sesión completa por seguridad.
  if (!safeEqualHex(hashPresentado, sesion.refresh_token_hash)) {
    await repo.revocarSesion(sesion.id);
    await registrarAuditoria({
      usuarioId: sesion.usuario_id,
      accion: 'REFRESH_REUTILIZADO',
      entidad: 'sesiones',
      entidadId: sesion.id,
      ipHash: ctx.ipHash,
    });
    throw invalido;
  }

  if (!ESTADOS_CON_ACCESO.includes(sesion.usuario_estado)) {
    await repo.revocarSesion(sesion.id);
    throw invalido;
  }

  // Rotación: cada renovación entrega un refresh token nuevo y anula el anterior
  const nuevoSecreto = randomToken();
  const rotada = await repo.rotarSesion(
    sesion.id,
    sesion.refresh_token_hash,
    sha256Hex(nuevoSecreto),
    expiracionRefresh(),
  );
  if (!rotada) throw invalido;

  const roles = await repo.obtenerRoles(sesion.usuario_id);
  return {
    accessToken: signAccessToken(sesion.usuario_id, roles),
    refreshToken: `${sesion.id}.${nuevoSecreto}`,
    expiresIn: ACCESS_TOKEN_SEGUNDOS,
  } satisfies SesionEmitida;
}

export async function cerrarSesion(refreshToken: string | undefined, ctx: ContextoPeticion): Promise<void> {
  const partes = parsearRefreshToken(refreshToken);
  if (!partes) return; // idempotente: si no hay sesión válida, no hay nada que cerrar

  const sesion = await repo.buscarSesion(partes.sesionId);
  if (!sesion || !safeEqualHex(sha256Hex(partes.secreto), sesion.refresh_token_hash)) return;

  await repo.revocarSesion(sesion.id);
  await registrarAuditoria({
    usuarioId: sesion.usuario_id,
    accion: 'LOGOUT',
    entidad: 'sesiones',
    entidadId: sesion.id,
    ipHash: ctx.ipHash,
  });
}

export async function obtenerPerfilActual(usuarioId: string): Promise<UsuarioPublico> {
  const usuario = await repo.buscarUsuarioPorId(usuarioId);
  if (!usuario || !ESTADOS_CON_ACCESO.includes(usuario.estado)) {
    throw new UnauthorizedError('Sesión inválida o expirada');
  }
  return {
    id: usuario.id,
    nombre: usuario.nombre,
    apellido: usuario.apellido,
    email: usuario.email,
    estado: usuario.estado,
    roles: await repo.obtenerRoles(usuario.id),
  };
}