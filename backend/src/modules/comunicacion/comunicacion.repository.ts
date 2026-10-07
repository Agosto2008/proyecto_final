import { pool } from '../../database/pool.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface ConversacionRow extends RowDataPacket {
  id: string;
  usuario_1_id: string;
  usuario_2_id: string;
  ultimo_mensaje_en: string;
  creado_en: string;
}

export interface MensajeRow extends RowDataPacket {
  id: string;
  conversacion_id: string;
  emisor_id: string;
  contenido: string;
  leido: boolean;
  creado_en: string;
}

export class ComunicacionRepository {
  async buscarConversacionEntreUsuarios(usuarioA: string, usuarioB: string): Promise<ConversacionRow | null> {
    const query = `
      SELECT * FROM conversaciones 
      WHERE (usuario_1_id = :usuarioA AND usuario_2_id = :usuarioB)
         OR (usuario_1_id = :usuarioB AND usuario_2_id = :usuarioA)
      LIMIT 1
    `;
    const [rows] = await pool.execute<ConversacionRow[]>(query, { usuarioA, usuarioB });
    return rows.length > 0 ? rows[0] : null;
  }

  async crearConversacion(usuario1Id: string, usuario2Id: string): Promise<string> {
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO conversaciones (id, usuario_1_id, usuario_2_id)
      VALUES (:id, :usuario1Id, :usuario2Id)
    `;
    await pool.execute(query, { id, usuario1Id, usuario2Id });
    return id;
  }

  async obtenerConversacionPorId(id: string): Promise<ConversacionRow | null> {
    const query = 'SELECT * FROM conversaciones WHERE id = :id';
    const [rows] = await pool.execute<ConversacionRow[]>(query, { id });
    return rows.length > 0 ? rows[0] : null;
  }

  async listarConversacionesPorUsuario(usuarioId: string) {
    const query = `
      SELECT c.*, 
             u.id AS otro_usuario_id, u.nombre AS otro_usuario_nombre, u.apellido AS otro_usuario_apellido,
             (SELECT contenido FROM mensajes WHERE conversacion_id = c.id ORDER BY creado_en DESC LIMIT 1) AS ultimo_mensaje,
             (SELECT COUNT(*) FROM mensajes WHERE conversacion_id = c.id AND emisor_id != :usuarioId AND leido = 0) AS no_leidos
      FROM conversaciones c
      INNER JOIN usuarios u ON u.id = IF(c.usuario_1_id = :usuarioId, c.usuario_2_id, c.usuario_1_id)
      WHERE c.usuario_1_id = :usuarioId OR c.usuario_2_id = :usuarioId
      ORDER BY c.ultimo_mensaje_en DESC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, { usuarioId });
    return rows;
  }

  async crearMensaje(conversacionId: string, emisorId: string, contenido: string): Promise<string> {
    const id = crypto.randomUUID();
    const queryMensaje = `
      INSERT INTO mensajes (id, conversacion_id, emisor_id, contenido)
      VALUES (:id, :conversacionId, :emisorId, :contenido)
    `;
    const queryActualizarConv = `
      UPDATE conversaciones 
      SET ultimo_mensaje_en = NOW() 
      WHERE id = :conversacionId
    `;

    await pool.execute(queryMensaje, { id, conversacionId, emisorId, contenido });
    await pool.execute(queryActualizarConv, { conversacionId });

    return id;
  }

  async listarMensajes(conversacionId: string, options: { pagina: number; limite: number }) {
    const { pagina, limite } = options;
    const offset = (pagina - 1) * limite;

    const queryData = `
      SELECT m.*, u.nombre AS emisor_nombre, u.apellido AS emisor_apellido
      FROM mensajes m
      INNER JOIN usuarios u ON m.emisor_id = u.id
      WHERE m.conversacion_id = :conversacionId
      ORDER BY m.creado_en DESC
      LIMIT :limite OFFSET :offset
    `;

    const queryCount = `SELECT COUNT(*) AS total FROM mensajes WHERE conversacion_id = :conversacionId`;

    const [rows] = await pool.execute<RowDataPacket[]>(queryData, { conversacionId, limite, offset });
    const [countRows] = await pool.execute<(RowDataPacket & { total: number })[]>(queryCount, { conversacionId });

    const total = countRows[0]?.total || 0;

    return {
      data: rows,
      meta: { total, pagina, limite, total_paginas: Math.ceil(total / limite) },
    };
  }

  async marcarComoLeidos(conversacionId: string, usuarioId: string): Promise<boolean> {
    const query = `
      UPDATE mensajes 
      SET leido = 1 
      WHERE conversacion_id = :conversacionId AND emisor_id != :usuarioId AND leido = 0
    `;
    const [result] = await pool.execute<ResultSetHeader>(query, { conversacionId, usuarioId });
    return result.affectedRows > 0;
  }
}

export const comunicacionRepository = new ComunicacionRepository();