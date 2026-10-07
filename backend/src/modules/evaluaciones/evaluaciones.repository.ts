import { pool } from '../../database/pool.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface EvaluacionRow extends RowDataPacket {
  id: string;
  jugador_id: string;
  evaluador_id: string;
  propuesta_id: string | null;
  puntaje_general: number;
  comentarios: string | null;
  recomendacion: string;
  creado_en: string;
  actualizado_en: string;
}

export class EvaluacionesRepository {
  async crear(
    evaluadorId: string,
    datos: {
      jugador_id: string;
      propuesta_id?: string | null;
      puntaje_general: number;
      comentarios?: string | null;
      recomendacion: string;
      detalles: Array<{ habilidad_id: number; puntaje: number; observaciones?: string | null }>;
    }
  ): Promise<string> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Insertar cabecera de la evaluación
      const queryEvaluacion = `
        INSERT INTO evaluaciones (id, jugador_id, evaluador_id, propuesta_id, puntaje_general, comentarios, recomendacion)
        VALUES (UUID(), :jugador_id, :evaluadorId, :propuesta_id, :puntaje_general, :comentarios, :recomendacion)
      `;

      await connection.execute(queryEvaluacion, {
        jugador_id: datos.jugador_id,
        evaluadorId,
        propuesta_id: datos.propuesta_id ?? null,
        puntaje_general: datos.puntaje_general,
        comentarios: datos.comentarios ?? null,
        recomendacion: datos.recomendacion,
      });

      // Obtener ID generado
      const [rows] = await connection.execute<RowDataPacket[]>(
        'SELECT id FROM evaluaciones WHERE evaluador_id = :evaluadorId ORDER BY creado_en DESC LIMIT 1',
        { evaluadorId }
      );
      const evaluacionId = rows[0].id;

      // Insertar detalle por habilidad
      for (const det of datos.detalles) {
        const queryDetalle = `
          INSERT INTO evaluacion_detalles (evaluacion_id, habilidad_id, puntaje, observaciones)
          VALUES (:evaluacionId, :habilidad_id, :puntaje, :observaciones)
        `;
        await connection.execute(queryDetalle, {
          evaluacionId,
          habilidad_id: det.habilidad_id,
          puntaje: det.puntaje,
          observaciones: det.observaciones ?? null,
        });

        // Marcar la habilidad como evaluada en el perfil del jugador
        await connection.execute(
          `UPDATE jugador_habilidades 
           SET evaluado = TRUE 
           WHERE jugador_id = :jugadorId AND habilidad_id = :habilidadId`,
          { jugadorId: datos.jugador_id, habilidadId: det.habilidad_id }
        );
      }

      await connection.commit();
      return evaluacionId;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async obtenerPorId(id: string) {
    const queryCabecera = `
      SELECT e.*, u.nombre AS evaluador_nombre, u.apellido AS evaluador_apellido
      FROM evaluaciones e
      INNER JOIN usuarios u ON e.evaluador_id = u.id
      WHERE e.id = :id
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(queryCabecera, { id });
    if (rows.length === 0) return null;

    const evaluacion = rows[0];

    const queryDetalles = `
      SELECT ed.*, h.nombre AS habilidad_nombre, h.categoria AS habilidad_categoria
      FROM evaluacion_detalles ed
      INNER JOIN habilidades h ON ed.habilidad_id = h.id
      WHERE ed.evaluacion_id = :id
    `;
    const [detalles] = await pool.execute<RowDataPacket[]>(queryDetalles, { id });

    return { ...evaluacion, detalles };
  }

  async listarPorJugador(jugadorId: string, options: { pagina: number; limite: number }) {
    const { pagina, limite } = options;
    const offset = (pagina - 1) * limite;

    const queryData = `
      SELECT e.*, u.nombre AS evaluador_nombre, u.apellido AS evaluador_apellido
      FROM evaluaciones e
      INNER JOIN usuarios u ON e.evaluador_id = u.id
      WHERE e.jugador_id = :jugadorId
      ORDER BY e.creado_en DESC
      LIMIT :limite OFFSET :offset
    `;

    const queryCount = `
      SELECT COUNT(*) AS total FROM evaluaciones WHERE jugador_id = :jugadorId
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(queryData, { jugadorId, limite, offset });
    const [countRows] = await pool.execute<(RowDataPacket & { total: number })[]>(queryCount, { jugadorId });

    const total = countRows[0]?.total || 0;

    return {
      data: rows,
      meta: {
        total,
        pagina,
        limite,
        total_paginas: Math.ceil(total / limite),
      },
    };
  }

  async listarMisEvaluaciones(evaluadorId: string) {
    const query = `
      SELECT e.*, j.nombre_deportivo, u.nombre AS jugador_nombre, u.apellido AS jugador_apellido
      FROM evaluaciones e
      INNER JOIN jugadores j ON e.jugador_id = j.id
      INNER JOIN usuarios u ON j.usuario_id = u.id
      WHERE e.evaluador_id = :evaluadorId
      ORDER BY e.creado_en DESC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, { evaluadorId });
    return rows;
  }
}

export const evaluacionesRepository = new EvaluacionesRepository();