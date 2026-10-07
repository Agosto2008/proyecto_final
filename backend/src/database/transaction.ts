import type { PoolConnection } from 'mysql2/promise';
import { pool } from './pool.js';

/**
 * Ejecuta varias consultas como una sola unidad: o se guardan todas (commit)
 * o no se guarda ninguna (rollback). Ejemplo: crear un usuario Y asignarle su rol.
 */
export async function withTransaction<T>(fn: (conn: PoolConnection) => Promise<T>): Promise<T> {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await fn(conn);
    await conn.commit();
    return result;
  } catch (error) {
    try {
      await conn.rollback();
    } catch {
      // Si el rollback falla, lo importante es propagar el error original
    }
    throw error;
  } finally {
    conn.release();
  }
}