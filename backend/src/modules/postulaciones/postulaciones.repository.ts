import { pool } from '../../database/pool.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface PostulacionRow extends RowDataPacket {
  id: string;
  oportunidad_id: string;
  jugador_id: string;
  mensaje_presentacion: string | null;
  estado: string;
  notas_organizacion: string | null;
  creado_en: string;
  actualizado_en: string;
}

export class PostulacionesRepository {
  async crear(jugadorId: string, datos: Record<string, any>): Promise<string> {
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO postulaciones (id, oportunidad_id, jugador_id, mensaje_presentacion, estado)
      VALUES (:id, :oportunidad_id, :jugadorId, :mensaje_presentacion, 'PENDIENTE')
    `;

    await pool.execute(query, {
      id,
      jugadorId,
      oportunidad_id: datos.oportunidad_id,
      mensaje_presentacion: datos.mensaje_presentacion ?? null,
    });

    return id;
  }

  async obtenerPorId(id: string): Promise<PostulacionRow | null> {
    const query = `
      SELECT p.*, o.titulo AS oportunidad_titulo, o.organizacion_id
      FROM postulaciones p
      INNER JOIN oportunidades o ON p.oportunidad_id = o.id
      WHERE p.id = :id
    `;
    const [rows] = await pool.execute<PostulacionRow[]>(query, { id });
    return rows.length > 0 ? rows[0] : null;
  }

  async existePostulacion(jugadorId: string, oportunidadId: string): Promise<boolean> {
    const query = `
      SELECT id FROM postulaciones 
      WHERE jugador_id = :jugadorId AND oportunidad_id = :oportunidadId
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, { jugadorId, oportunidadId });
    return rows.length > 0;
  }

  async cambiarEstado(id: string, estado: string, notas?: string): Promise<boolean> {
    const query = `
      UPDATE postulaciones 
      SET estado = :estado, notas_organizacion = :notas 
      WHERE id = :id
    `;
    const [result] = await pool.execute<ResultSetHeader>(query, {
      id,
      estado,
      notas: notas ?? null,
    });
    return result.affectedRows > 0;
  }

  async listarPorJugador(jugadorId: string, options: { pagina: number; limite: number; estado?: string }) {
    const { pagina, limite, estado } = options;
    const offset = (pagina - 1) * limite;
    const params: Record<string, any> = { jugadorId, limite, offset };
    const condiciones: string[] = ['p.jugador_id = :jugadorId'];

    if (estado) {
      condiciones.push('p.estado = :estado');
      params.estado = estado;
    }

    const whereClause = `WHERE ${condiciones.join(' AND ')}`;

    const queryData = `
      SELECT p.*, o.titulo AS oportunidad_titulo, o.tipo AS oportunidad_tipo, org.nombre_comercial AS organizacion_nombre
      FROM postulaciones p
      INNER JOIN oportunidades o ON p.oportunidad_id = o.id
      INNER JOIN organizaciones org ON o.organizacion_id = org.id
      ${whereClause}
      ORDER BY p.creado_en DESC
      LIMIT :limite OFFSET :offset
    `;

    const queryCount = `SELECT COUNT(*) AS total FROM postulaciones p ${whereClause}`;

    const [rows] = await pool.execute<RowDataPacket[]>(queryData, params);
    const [countRows] = await pool.execute<(RowDataPacket & { total: number })[]>(queryCount, params);

    const total = countRows[0]?.total || 0;

    return {
      data: rows,
      meta: { total, pagina, limite, total_paginas: Math.ceil(total / limite) },
    };
  }

  async listarPorOportunidad(oportunidadId: string, options: { pagina: number; limite: number; estado?: string }) {
    const { pagina, limite, estado } = options;
    const offset = (pagina - 1) * limite;
    const params: Record<string, any> = { oportunidadId, limite, offset };
    const condiciones: string[] = ['p.oportunidad_id = :oportunidadId'];

    if (estado) {
      condiciones.push('p.estado = :estado');
      params.estado = estado;
    }

    const whereClause = `WHERE ${condiciones.join(' AND ')}`;

    const queryData = `
      SELECT p.*, u.nombre, u.apellido, j.posicion_principal, j.edad
      FROM postulaciones p
      INNER JOIN jugadores j ON p.jugador_id = j.id
      INNER JOIN usuarios u ON j.usuario_id = u.id
      ${whereClause}
      ORDER BY p.creado_en DESC
      LIMIT :limite OFFSET :offset
    `;

    const queryCount = `SELECT COUNT(*) AS total FROM postulaciones p ${whereClause}`;

    const [rows] = await pool.execute<RowDataPacket[]>(queryData, params);
    const [countRows] = await pool.execute<(RowDataPacket & { total: number })[]>(queryCount, params);

    const total = countRows[0]?.total || 0;

    return {
      data: rows,
      meta: { total, pagina, limite, total_paginas: Math.ceil(total / limite) },
    };
  }
}

export const postulacionesRepository = new PostulacionesRepository();