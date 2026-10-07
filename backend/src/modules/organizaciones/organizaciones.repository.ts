import { pool } from '../../database/pool.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface OrganizacionRow extends RowDataPacket {
  id: string;
  usuario_id: string;
  nombre_comercial: string;
  tipo_organizacion: string;
  sitio_web: string | null;
  pais_id: number | null;
  ciudad: string | null;
  descripcion: string | null;
  verificada: boolean;
  creado_en: string;
  actualizado_en: string;
}

export class OrganizacionesRepository {
  async obtenerPorUsuarioId(usuarioId: string): Promise<OrganizacionRow | null> {
    const query = 'SELECT * FROM organizaciones WHERE usuario_id = :usuarioId';
    const [rows] = await pool.execute<OrganizacionRow[]>(query, { usuarioId });
    return rows.length > 0 ? rows[0] : null;
  }

  async obtenerPorId(id: string): Promise<OrganizacionRow | null> {
    const query = 'SELECT * FROM organizaciones WHERE id = :id';
    const [rows] = await pool.execute<OrganizacionRow[]>(query, { id });
    return rows.length > 0 ? rows[0] : null;
  }

  async crear(usuarioId: string): Promise<string> {
    const query = `
      INSERT INTO organizaciones (id, usuario_id, nombre_comercial, tipo_organizacion) 
      VALUES (UUID(), :usuarioId, 'Nueva Organización', 'CLUB')
    `;
    await pool.execute(query, { usuarioId });
    const org = await this.obtenerPorUsuarioId(usuarioId);
    return org!.id;
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

    const query = `UPDATE organizaciones SET ${asignaciones.join(', ')} WHERE id = :id`;
    const [result] = await pool.execute<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }

  async listarPublicas(options: {
    pagina: number;
    limite: number;
    busqueda?: string;
    tipo?: string;
    pais_id?: number;
  }) {
    const { pagina, limite, busqueda, tipo, pais_id } = options;
    const offset = (pagina - 1) * limite;
    const params: Record<string, any> = { limite, offset };
    const condiciones: string[] = [];

    if (busqueda) {
      condiciones.push('nombre_comercial LIKE :busqueda');
      params.busqueda = `%${busqueda}%`;
    }

    if (tipo) {
      condiciones.push('tipo_organizacion = :tipo');
      params.tipo = tipo;
    }

    if (pais_id) {
      condiciones.push('pais_id = :pais_id');
      params.pais_id = pais_id;
    }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

    const queryData = `
      SELECT o.*, p.nombre AS pais_nombre
      FROM organizaciones o
      LEFT JOIN paises p ON o.pais_id = p.id
      ${whereClause}
      ORDER BY o.nombre_comercial ASC
      LIMIT :limite OFFSET :offset
    `;

    const queryCount = `
      SELECT COUNT(*) AS total FROM organizaciones ${whereClause}
    `;

    const [rows] = await pool.execute<RowDataPacket[]>(queryData, params);
    const [countRows] = await pool.execute<(RowDataPacket & { total: number })[]>(queryCount, params);

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
}

export const organizacionesRepository = new OrganizacionesRepository();