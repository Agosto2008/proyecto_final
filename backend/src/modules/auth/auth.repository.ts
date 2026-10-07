import type { Pool, ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import { pool } from '../../database/pool.js';

// Acepta el pool normal o una conexión dentro de una transacción
type Db = Pick<Pool, 'execute'>;

export interface UsuarioAuth extends RowDataPacket {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  password_hash: string;
  estado: 'PENDIENTE' | 'ACTIVO' | 'SUSPENDIDO' | 'ELIMINADO';
}

export interface SesionAuth extends RowDataPacket {
  id: string;
  usuario_id: string;
  refresh_token_hash: string;
  expira_en: Date;
  revocado_en: Date | null;
  usuario_estado: UsuarioAuth['estado'];
}

export interface NuevoUsuario {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  passwordHash: string;
  telefono: string | null;
  fechaNacimiento: string;
  paisId: number;
  ciudad: string | null;
}

export async function buscarUsuarioPorEmail(email: string): Promise<UsuarioAuth | null> {
  const [filas] = await pool.execute<UsuarioAuth[]>(
    `SELECT id, nombre, apellido, email, password_hash, estado
       FROM usuarios WHERE email = :email LIMIT 1`,
    { email },
  );
  return filas[0] ?? null;
}

export async function buscarUsuarioPorId(id: string): Promise<UsuarioAuth | null> {
  const [filas] = await pool.execute<UsuarioAuth[]>(
    `SELECT id, nombre, apellido, email, password_hash, estado
       FROM usuarios WHERE id = :id LIMIT 1`,
    { id },
  );
  return filas[0] ?? null;
}

export async function obtenerRoles(usuarioId: string): Promise<string[]> {
  const [filas] = await pool.execute<(RowDataPacket & { nombre: string })[]>(
    `SELECT r.nombre
       FROM usuario_roles ur JOIN roles r ON r.id = ur.rol_id
      WHERE ur.usuario_id = :usuarioId
      ORDER BY r.nombre`,
    { usuarioId },
  );
  return filas.map((f) => f.nombre);
}

export async function insertarUsuario(db: Db, u: NuevoUsuario): Promise<void> {
  await db.execute(
    `INSERT INTO usuarios
       (id, nombre, apellido, email, password_hash, telefono, fecha_nacimiento, pais_id, ciudad)
     VALUES
       (:id, :nombre, :apellido, :email, :passwordHash, :telefono, :fechaNacimiento, :paisId, :ciudad)`,
    { ...u },
  );
}

export async function asignarRol(db: Db, usuarioId: string, rol: string): Promise<void> {
  const [resultado] = await db.execute<ResultSetHeader>(
    `INSERT INTO usuario_roles (usuario_id, rol_id)
     SELECT :usuarioId, id FROM roles WHERE nombre = :rol`,
    { usuarioId, rol },
  );
  if (resultado.affectedRows !== 1) {
    throw new Error(`El rol ${rol} no existe en la tabla roles`);
  }
}

export async function crearSesion(datos: {
  id: string;
  usuarioId: string;
  refreshTokenHash: string;
  dispositivo: string | null;
  ipHash: string | null;
  expiraEn: Date;
}): Promise<void> {
  await pool.execute(
    `INSERT INTO sesiones (id, usuario_id, refresh_token_hash, dispositivo, ip_hash, expira_en)
     VALUES (:id, :usuarioId, :refreshTokenHash, :dispositivo, :ipHash, :expiraEn)`,
    { ...datos },
  );
}

export async function buscarSesion(id: string): Promise<SesionAuth | null> {
  const [filas] = await pool.execute<SesionAuth[]>(
    `SELECT s.id, s.usuario_id, s.refresh_token_hash, s.expira_en, s.revocado_en,
            u.estado AS usuario_estado
       FROM sesiones s JOIN usuarios u ON u.id = s.usuario_id
      WHERE s.id = :id LIMIT 1`,
    { id },
  );
  return filas[0] ?? null;
}

/**
 * Cambia el refresh token de la sesión por uno nuevo. La condición en el WHERE
 * hace que solo funcione si el token anterior sigue siendo el vigente:
 * así dos renovaciones simultáneas no pueden ganar las dos.
 */
export async function rotarSesion(
  id: string,
  hashAnterior: string,
  hashNuevo: string,
  expiraEn: Date,
): Promise<boolean> {
  const [resultado] = await pool.execute<ResultSetHeader>(
    `UPDATE sesiones
        SET refresh_token_hash = :hashNuevo, expira_en = :expiraEn
      WHERE id = :id AND refresh_token_hash = :hashAnterior AND revocado_en IS NULL`,
    { id, hashAnterior, hashNuevo, expiraEn },
  );
  return resultado.affectedRows === 1;
}

export async function revocarSesion(id: string): Promise<void> {
  await pool.execute(
    `UPDATE sesiones SET revocado_en = CURRENT_TIMESTAMP WHERE id = :id AND revocado_en IS NULL`,
    { id },
  );
}

export async function actualizarUltimoAcceso(usuarioId: string): Promise<void> {
  await pool.execute(`UPDATE usuarios SET ultimo_acceso = CURRENT_TIMESTAMP WHERE id = :usuarioId`, {
    usuarioId,
  });
}