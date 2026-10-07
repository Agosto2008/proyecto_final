import { pool } from '../../database/pool.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface ArchivoRow extends RowDataPacket {
  id: string;
  usuario_id: string;
  entidad_tipo: string;
  entidad_id: string;
  tipo_archivo: string;
  url: string;
  titulo: string | null;
  descripcion: string | null;
  es_destacado: boolean;
  creado_en: string;
}

export class ArchivosRepository {
  async crear(usuarioId: string, datos: Record<string, any>): Promise<string> {
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO media (id, usuario_id, entidad_tipo, entidad_id, tipo_archivo, url, titulo, descripcion, es_destacado)
      VALUES (:id, :usuarioId, :entidad_tipo, :entidad_id, :tipo_archivo, :url, :titulo, :descripcion, :es_destacado)
    `;
    
    await pool.execute(query, {
      id,
      usuarioId,
      entidad_tipo: datos.entidad_tipo,
      entidad_id: datos.entidad_id,
      tipo_archivo: datos.tipo_archivo,
      url: datos.url,
      titulo: datos.titulo ?? null,
      descripcion: datos.descripcion ?? null,
      es_destacado: datos.es_destacado ?? false,
    });

    return id;
  }

  async obtenerPorId(id: string): Promise<ArchivoRow | null> {
    const query = 'SELECT * FROM media WHERE id = :id';
    const [rows] = await pool.execute<ArchivoRow[]>(query, { id });
    return rows.length > 0 ? rows[0] : null;
  }

  async listarPorEntidad(entidadTipo: string, entidadId: string, tipoArchivo?: string): Promise<ArchivoRow[]> {
    const condiciones = ['entidad_tipo = :entidadTipo', 'entidad_id = :entidadId'];
    const params: Record<string, any> = { entidadTipo, entidadId };

    if (tipoArchivo) {
      condiciones.push('tipo_archivo = :tipoArchivo');
      params.tipoArchivo = tipoArchivo;
    }

    const query = `
      SELECT * FROM media
      WHERE ${condiciones.join(' AND ')}
      ORDER BY es_destacado DESC, creado_en DESC
    `;

    const [rows] = await pool.execute<ArchivoRow[]>(query, params);
    return rows;
  }

  async eliminar(id: string): Promise<boolean> {
    const query = 'DELETE FROM media WHERE id = :id';
    const [result] = await pool.execute<ResultSetHeader>(query, { id });
    return result.affectedRows > 0;
  }
}

export const archivosRepository = new ArchivosRepository();