import { pool } from '../../database/pool.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface SeguimientoRow extends RowDataPacket {
  id: string;
  usuario_id: string;
  entidad_tipo: string;
  entidad_id: string;
  notas: string | null;
  creado_en: string;
}

export class SeguimientoRepository {
  async seguir(usuarioId: string, datos: { entidad_tipo: string; entidad_id: string; notas?: string | null }): Promise<string> {
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO seguimiento (id, usuario_id, entidad_tipo, entidad_id, notas)
      VALUES (:id, :usuarioId, :entidad_tipo, :entidad_id, :notas)
    `;

    await pool.execute(query, {
      id,
      usuarioId,
      entidad_tipo: datos.entidad_tipo,
      entidad_id: datos.entidad_id,
      notas: datos.notas ?? null,
    });

    return id;
  }

  async dejarDeSeguir(usuarioId: string, entidadTipo: string, entidadId: string): Promise<boolean> {
    const query = `
      DELETE FROM seguimiento 
      WHERE usuario_id = :usuarioId AND entidad_tipo = :entidadTipo AND entidad_id = :entidadId
    `;
    const [result] = await pool.execute<ResultSetHeader>(query, { usuarioId, entidadTipo, entidadId });
    return result.affectedRows > 0;
  }

  async existeSeguimiento(usuarioId: string, entidadTipo: string, entidadId: string): Promise<boolean> {
    const query = `
      SELECT id FROM seguimiento 
      WHERE usuario_id = :usuarioId AND entidad_tipo = :entidadTipo AND entidad_id = :entidadId
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, { usuarioId, entidadTipo, entidadId });
    return rows.length > 0;
  }

  async listarSiguiendo(usuarioId: string, options: { pagina: number; limite: number; entidad_tipo?: string }) {
    const { pagina, limite, entidad_tipo } = options;
    const offset = (pagina - 1) * limite;
    const params: Record<string, any> = { usuarioId, limite, offset };
    const condiciones: string[] = ['s.usuario_id = :usuarioId'];

    if (entidad_tipo) {
      condiciones.push('s.entidad_tipo = :entidad_tipo');
      params.entidad_tipo = entidad_tipo;
    }

    const whereClause = `WHERE ${condiciones.join(' AND ')}`;

    const queryData = `
      SELECT s.* 
      FROM seguimiento s
      ${whereClause}
      ORDER BY s.creado_en DESC
      LIMIT :limite OFFSET :offset
    `;

    const queryCount = `SELECT COUNT(*) AS total FROM seguimiento s ${whereClause}`;

    const [rows] = await pool.execute<RowDataPacket[]>(queryData, params);
    const [countRows] = await pool.execute<(RowDataPacket & { total: number })[]>(queryCount, params);

    const total = countRows[0]?.total || 0;

    return {
      data: rows,
      meta: { total, pagina, limite, total_paginas: Math.ceil(total / limite) },
    };
  }

  async contarSeguidores(entidadTipo: string, entidadId: string): Promise<number> {
    const query = `
      SELECT COUNT(*) AS total FROM seguimiento 
      WHERE entidad_tipo = :entidadTipo AND entidad_id = :entidadId
    `;
    const [rows] = await pool.execute<(RowDataPacket & { total: number })[]>(query, { entidadTipo, entidadId });
    return rows[0]?.total || 0;
  }
}

export const seguimientoRepository = new SeguimientoRepository();