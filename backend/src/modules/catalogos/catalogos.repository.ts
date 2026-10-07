import { pool } from '../../database/pool.js';
import { RowDataPacket } from 'mysql2/promise';

export interface PaisRow extends RowDataPacket {
  id: number;
  nombre: string;
  codigo_iso: string;
  codigo_telefono: string | null;
  activo: boolean;
}

export interface HabilidadRow extends RowDataPacket {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  activa: boolean;
}

export class CatalogosRepository {
  async obtenerPaises(busqueda?: string): Promise<PaisRow[]> {
    let query = 'SELECT id, nombre, codigo_iso, codigo_telefono, activo FROM paises WHERE activo = TRUE';
    const params: Record<string, any> = {};

    if (busqueda) {
      query += ' AND (nombre LIKE :busqueda OR codigo_iso LIKE :busqueda)';
      params.busqueda = `%${busqueda}%`;
    }

    query += ' ORDER BY nombre ASC';

    const [rows] = await pool.execute<PaisRow[]>(query, params);
    return rows;
  }

  async obtenerHabilidades(categoria?: string): Promise<HabilidadRow[]> {
    let query = 'SELECT id, nombre, descripcion, categoria, activa FROM habilidades WHERE activa = TRUE';
    const params: Record<string, any> = {};

    if (categoria) {
      query += ' AND categoria = :categoria';
      params.categoria = categoria;
    }

    query += ' ORDER BY categoria ASC, nombre ASC';

    const [rows] = await pool.execute<HabilidadRow[]>(query, params);
    return rows;
  }
}

export const catalogosRepository = new CatalogosRepository();