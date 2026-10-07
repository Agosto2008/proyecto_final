import { pool } from '../../database/pool.js';
import { RowDataPacket } from 'mysql2/promise';

export class ReportesRepository {
  async obtenerMétricasDashboard() {
    const queryUsuarios = `
      SELECT rol, COUNT(*) AS total 
      FROM usuarios 
      GROUP BY rol
    `;

    const queryOportunidades = `
      SELECT estado, COUNT(*) AS total 
      FROM oportunidades 
      GROUP BY estado
    `;

    const queryPostulaciones = `
      SELECT estado, COUNT(*) AS total 
      FROM postulaciones 
      GROUP BY estado
    `;

    const [usuarios] = await pool.execute<RowDataPacket[]>(queryUsuarios);
    const [oportunidades] = await pool.execute<RowDataPacket[]>(queryOportunidades);
    const [postulaciones] = await pool.execute<RowDataPacket[]>(queryPostulaciones);

    return {
      usuarios_por_rol: usuarios,
      oportunidades_por_estado: oportunidades,
      postulaciones_por_estado: postulaciones,
    };
  }

  async obtenerResumenOrganizacion(organizacionId: string) {
    const query = `
      SELECT 
        (SELECT COUNT(*) FROM oportunidades WHERE organizacion_id = :organizacionId) AS total_oportunidades,
        (SELECT COUNT(*) FROM oportunidades WHERE organizacion_id = :organizacionId AND estado = 'ABIERTA') AS oportunidades_activas,
        (SELECT COUNT(*) FROM postulaciones p 
         INNER JOIN oportunidades o ON p.oportunidad_id = o.id 
         WHERE o.organizacion_id = :organizacionId) AS total_postulaciones_recibidas,
        (SELECT COUNT(*) FROM postulaciones p 
         INNER JOIN oportunidades o ON p.oportunidad_id = o.id 
         WHERE o.organizacion_id = :organizacionId AND p.estado = 'ACEPTADA') AS postulaciones_aceptadas
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(query, { organizacionId });
    return rows[0] || {};
  }

  async obtenerDistribucionPosiciones() {
    const query = `
      SELECT posicion_principal, COUNT(*) AS total 
      FROM jugadores 
      WHERE posicion_principal IS NOT NULL 
      GROUP BY posicion_principal 
      ORDER BY total DESC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query);
    return rows;
  }
}

export const reportesRepository = new ReportesRepository();