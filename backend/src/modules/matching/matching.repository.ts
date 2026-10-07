import { pool } from '../../database/pool.js';
import { RowDataPacket } from 'mysql2/promise';

export class MatchingRepository {
  async obtenerOportunidadesParaJugador(jugadorId: string) {
    // Algoritmo de compatibilidad simple basado en SQL: Posición, Edad, País
    const query = `
      SELECT 
        o.*,
        org.nombre_comercial AS organizacion_nombre,
        p.nombre AS pais_nombre,
        (
          (CASE WHEN o.posicion_buscada IS NULL OR o.posicion_buscada = j.posicion_principal THEN 40 ELSE 0 END) +
          (CASE WHEN (o.edad_minima IS NULL OR j.edad >= o.edad_minima) AND (o.edad_maxima IS NULL OR j.edad <= o.edad_maxima) THEN 35 ELSE 0 END) +
          (CASE WHEN o.pais_id IS NULL OR o.pais_id = j.pais_id THEN 25 ELSE 0 END)
        ) AS porcentaje_match
      FROM oportunidades o
      INNER JOIN organizaciones org ON o.organizacion_id = org.id
      LEFT JOIN paises p ON o.pais_id = p.id
      CROSS JOIN jugadores j ON j.id = :jugadorId
      WHERE o.estado = 'ABIERTA'
      HAVING porcentaje_match > 0
      ORDER BY porcentaje_match DESC, o.creado_en DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, { jugadorId });
    return rows;
  }

  async obtenerJugadoresParaOportunidad(oportunidadId: string) {
    const query = `
      SELECT 
        j.id AS jugador_id,
        u.nombre,
        u.apellido,
        j.posicion_principal,
        j.edad,
        p.nombre AS pais_nombre,
        (
          (CASE WHEN o.posicion_buscada IS NULL OR o.posicion_buscada = j.posicion_principal THEN 40 ELSE 0 END) +
          (CASE WHEN (o.edad_minima IS NULL OR j.edad >= o.edad_minima) AND (o.edad_maxima IS NULL OR j.edad <= o.edad_maxima) THEN 35 ELSE 0 END) +
          (CASE WHEN o.pais_id IS NULL OR o.pais_id = j.pais_id THEN 25 ELSE 0 END)
        ) AS porcentaje_match
      FROM jugadores j
      INNER JOIN usuarios u ON j.usuario_id = u.id
      LEFT JOIN paises p ON j.pais_id = p.id
      CROSS JOIN oportunidades o ON o.id = :oportunidadId
      HAVING porcentaje_match > 0
      ORDER BY porcentaje_match DESC
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, { oportunidadId });
    return rows;
  }
}

export const matchingRepository = new MatchingRepository();