import { pool } from '../../database/pool.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface CazatalentosRow extends RowDataPacket {
  id: string;
  usuario_id: string;
  organizacion_id: string | null;
  cargo: string | null;
  especialidad: string | null;
  experiencia_anios: number | null;
  biografia: string | null;
  perfil_publico: boolean;
  creado_en: string;
  actualizado_en: string;
}

export class CazatalentosRepository {
  async obtenerPorUsuarioId(usuarioId: string): Promise<CazatalentosRow | null> {
    const query = `
      SELECT c.*, o.nombre_comercial AS organizacion_nombre 
      FROM cazatalentos c
      LEFT JOIN organizaciones o ON c.organizacion_id = o.id
      WHERE c.usuario_id = :usuarioId
    `;
    const [rows] = await pool.execute<CazatalentosRow[]>(query, { usuarioId });
    return rows.length > 0 ? rows[0] : null;
  }

  async crear(usuarioId: string): Promise<string> {
    const query = `
      INSERT INTO cazatalentos (id, usuario_id) 
      VALUES (UUID(), :usuarioId)
    `;
    await pool.execute(query, { usuarioId });
    const scout = await this.obtenerPorUsuarioId(usuarioId);
    return scout!.id;
  }

  async actualizar(id: string, datos: Record<string, any>): Promise<boolean> {
    const asignaciones: string[] = [];
    const params: Record<string, any> = { id };

    Object.entries(datos).forEach(([clave, valor]) => {
      if (valor !== undefined) {
        asignaciones.push(`${clave} = :${clave}`);
        params[clave] = valor;
      }
    });

    if (asignaciones.length === 0) return false;

    const query = `UPDATE cazatalentos SET ${asignaciones.join(', ')} WHERE id = :id`;
    const [result] = await pool.execute<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }
}

export const cazatalentosRepository = new CazatalentosRepository();