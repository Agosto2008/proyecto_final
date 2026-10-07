import { pool } from '../../database/pool.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface VerificacionRow extends RowDataPacket {
  id: string;
  usuario_id: string;
  entidad_tipo: string;
  entidad_id: string;
  tipo_documento: string;
  documento_url: string;
  comentarios: string | null;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  motivo_rechazo: string | null;
  revisado_por: string | null;
  creado_en: string;
}

export class VerificacionesRepository {
  async crearSolicitud(usuarioId: string, datos: any): Promise<string> {
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO solicitudes_verificacion 
        (id, usuario_id, entidad_tipo, entidad_id, tipo_documento, documento_url, comentarios, estado)
      VALUES 
        (:id, :usuarioId, :entidad_tipo, :entidad_id, :tipo_documento, :documento_url, :comentarios, 'PENDIENTE')
    `;

    await pool.execute(query, {
      id,
      usuarioId,
      entidad_tipo: datos.entidad_tipo,
      entidad_id: datos.entidad_id,
      tipo_documento: datos.tipo_documento,
      documento_url: datos.documento_url,
      comentarios: datos.comentarios ?? null,
    });

    return id;
  }

  async obtenerPorId(id: string): Promise<VerificacionRow | null> {
    const query = 'SELECT * FROM solicitudes_verificacion WHERE id = :id';
    const [rows] = await pool.execute<VerificacionRow[]>(query, { id });
    return rows.length > 0 ? rows[0] : null;
  }

  async existeSolicitudPendiente(usuarioId: string, entidadTipo: string, entidadId: string): Promise<boolean> {
    const query = `
      SELECT id FROM solicitudes_verificacion 
      WHERE usuario_id = :usuarioId AND entidad_tipo = :entidadTipo AND entidad_id = :entidadId AND estado = 'PENDIENTE'
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, { usuarioId, entidadTipo, entidadId });
    return rows.length > 0;
  }

  async listarMisSolicitudes(usuarioId: string) {
    const query = `
      SELECT * FROM solicitudes_verificacion 
      WHERE usuario_id = :usuarioId 
      ORDER BY creado_en DESC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, { usuarioId });
    return rows;
  }

  async listarTodas(options: { pagina: number; limite: number; estado?: string; entidad_tipo?: string }) {
    const { pagina, limite, estado, entidad_tipo } = options;
    const offset = (pagina - 1) * limite;
    const condiciones: string[] = [];
    const params: Record<string, any> = { limite, offset };

    if (estado) {
      condiciones.push('sv.estado = :estado');
      params.estado = estado;
    }

    if (entidad_tipo) {
      condiciones.push('sv.entidad_tipo = :entidad_tipo');
      params.entidad_tipo = entidad_tipo;
    }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

    const queryData = `
      SELECT sv.*, u.nombre, u.apellido, u.email
      FROM solicitudes_verificacion sv
      INNER JOIN usuarios u ON sv.usuario_id = u.id
      ${whereClause}
      ORDER BY sv.creado_en DESC
      LIMIT :limite OFFSET :offset
    `;

    const queryCount = `SELECT COUNT(*) AS total FROM solicitudes_verificacion sv ${whereClause}`;

    const [rows] = await pool.execute<RowDataPacket[]>(queryData, params);
    const [countRows] = await pool.execute<(RowDataPacket & { total: number })[]>(queryCount, params);

    const total = countRows[0]?.total || 0;

    return {
      data: rows,
      meta: { total, pagina, limite, total_paginas: Math.ceil(total / limite) },
    };
  }

  async actualizarEstado(id: string, adminId: string, estado: string, motivoRechazo?: string | null): Promise<boolean> {
    const query = `
      UPDATE solicitudes_verificacion
      SET estado = :estado, motivo_rechazo = :motivoRechazo, revisado_por = :adminId
      WHERE id = :id
    `;
    const [result] = await pool.execute<ResultSetHeader>(query, {
      id,
      estado,
      motivoRechazo: motivoRechazo ?? null,
      adminId,
    });
    return result.affectedRows > 0;
  }

  async marcarPerfilComoVerificado(entidadTipo: string, entidadId: string): Promise<void> {
    let tabla = '';
    if (entidadTipo === 'JUGADOR') tabla = 'jugadores';
    else if (entidadTipo === 'ORGANIZACION') tabla = 'organizaciones';
    else if (entidadTipo === 'CAZATALENTOS') tabla = 'cazatalentos';

    if (tabla) {
      const query = `UPDATE ${tabla} SET verificado = 1 WHERE id = :entidadId`;
      await pool.execute(query, { entidadId });
    }
  }
}

export const verificacionesRepository = new VerificacionesRepository();