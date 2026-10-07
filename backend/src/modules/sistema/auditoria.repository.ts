import { randomUUID } from 'node:crypto';
import type { RowDataPacket } from 'mysql2/promise';
import { logger } from '../../config/logger.js';
import { pool } from '../../database/pool.js';

export interface RegistroAuditoria {
  usuarioId: string | null;
  accion: string;
  entidad: string;
  entidadId?: string | null;
  ipHash?: string | null;
  detalles?: Record<string, unknown> | null;
}

/**
 * Anota una acción importante en la tabla auditoria.
 * Nunca lanza error: si la auditoría falla, se registra en el log pero no se
 * rompe la operación del usuario.
 */
export async function registrarAuditoria(registro: RegistroAuditoria): Promise<void> {
  try {
    await pool.execute(
      `INSERT INTO auditoria (id, usuario_id, accion, entidad, entidad_id, ip_hash, detalles)
       VALUES (:id, :usuarioId, :accion, :entidad, :entidadId, :ipHash, :detalles)`,
      {
        id: randomUUID(),
        usuarioId: registro.usuarioId,
        accion: registro.accion,
        entidad: registro.entidad,
        entidadId: registro.entidadId ?? null,
        ipHash: registro.ipHash ?? null,
        detalles: registro.detalles ? JSON.stringify(registro.detalles) : null,
      },
    );
  } catch (error) {
    logger.error({ err: error, accion: registro.accion }, 'No se pudo registrar la auditoría');
  }
}

export interface FiltrosAuditoria {
  accion?: string;
  entidad?: string;
  usuarioId?: string;
  desde?: string; // AAAA-MM-DD, inclusive
  hasta?: string; // AAAA-MM-DD, inclusive
  limite: number;
  offset: number;
}

export interface FilaAuditoria {
  id: string;
  usuario_id: string | null;
  usuario_email: string | null;
  accion: string;
  entidad: string;
  entidad_id: string | null;
  ip_hash: string | null;
  detalles: unknown;
  creado_en: Date;
}

/** MySQL devuelve el JSON ya convertido; otros motores lo devuelven como texto. */
function normalizarDetalles(valor: unknown): unknown {
  if (typeof valor !== 'string') return valor;
  try {
    return JSON.parse(valor);
  } catch {
    return valor;
  }
}

export async function listarAuditoria(
  filtros: FiltrosAuditoria,
): Promise<{ filas: FilaAuditoria[]; total: number }> {
  // Las condiciones son texto fijo; los valores siempre viajan como parámetros
  const condiciones: string[] = [];
  const params: Record<string, string | number> = {};

  if (filtros.accion) {
    condiciones.push('a.accion = :accion');
    params.accion = filtros.accion;
  }
  if (filtros.entidad) {
    condiciones.push('a.entidad = :entidad');
    params.entidad = filtros.entidad;
  }
  if (filtros.usuarioId) {
    condiciones.push('a.usuario_id = :usuarioId');
    params.usuarioId = filtros.usuarioId;
  }
  if (filtros.desde) {
    condiciones.push('a.creado_en >= :desde');
    params.desde = `${filtros.desde} 00:00:00`;
  }
  if (filtros.hasta) {
    condiciones.push('a.creado_en < DATE_ADD(:hasta, INTERVAL 1 DAY)');
    params.hasta = `${filtros.hasta} 00:00:00`;
  }

  const where = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

  const [conteo] = await pool.query<(RowDataPacket & { total: number })[]>(
    `SELECT COUNT(*) AS total FROM auditoria a ${where}`,
    params,
  );

  const [filas] = await pool.query<(RowDataPacket & FilaAuditoria)[]>(
    `SELECT a.id, a.usuario_id, u.email AS usuario_email, a.accion, a.entidad,
            a.entidad_id, a.ip_hash, a.detalles, a.creado_en
       FROM auditoria a
       LEFT JOIN usuarios u ON u.id = a.usuario_id
       ${where}
      ORDER BY a.creado_en DESC, a.id DESC
      LIMIT :limite OFFSET :offset`,
    { ...params, limite: filtros.limite, offset: filtros.offset },
  );

  return {
    filas: filas.map((f) => ({ ...f, detalles: normalizarDetalles(f.detalles) })),
    total: Number(conteo[0]?.total ?? 0),
  };
}