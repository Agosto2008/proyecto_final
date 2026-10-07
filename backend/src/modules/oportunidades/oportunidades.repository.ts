import { pool } from '../../database/pool.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface OportunidadRow extends RowDataPacket {
  id: string;
  organizacion_id: string;
  titulo: string;
  descripcion: string;
  tipo: string;
  posicion_buscada: string | null;
  categoria: string | null;
  edad_minima: number | null;
  edad_maxima: number | null;
  pais_id: number | null;
  ciudad: string | null;
  fecha_limite: string | null;
  estado: string;
  creado_en: string;
  actualizado_en: string;
}

export class OportunidadesRepository {
  async crear(organizacionId: string, datos: Record<string, any>): Promise<string> {
    const id = crypto.randomUUID();
    const query = `
      INSERT INTO oportunidades (
        id, organizacion_id, titulo, descripcion, tipo, posicion_buscada, 
        categoria, edad_minima, edad_maxima, pais_id, ciudad, fecha_limite, estado
      ) VALUES (
        :id, :organizacionId, :titulo, :descripcion, :tipo, :posicion_buscada,
        :categoria, :edad_minima, :edad_maxima, :pais_id, :ciudad, :fecha_limite, :estado
      )
    `;

    await pool.execute(query, {
      id,
      organizacionId,
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      tipo: datos.tipo,
      posicion_buscada: datos.posicion_buscada ?? null,
      categoria: datos.categoria ?? null,
      edad_minima: datos.edad_minima ?? null,
      edad_maxima: datos.edad_maxima ?? null,
      pais_id: datos.pais_id ?? null,
      ciudad: datos.ciudad ?? null,
      fecha_limite: datos.fecha_limite ? new Date(datos.fecha_limite) : null,
      estado: datos.estado ?? 'ABIERTA',
    });

    return id;
  }

  async obtenerPorId(id: string): Promise<OportunidadRow | null> {
    const query = `
      SELECT o.*, org.nombre_comercial AS organizacion_nombre, p.nombre AS pais_nombre
      FROM oportunidades o
      INNER JOIN organizaciones org ON o.organizacion_id = org.id
      LEFT JOIN paises p ON o.pais_id = p.id
      WHERE o.id = :id
    `;
    const [rows] = await pool.execute<OportunidadRow[]>(query, { id });
    return rows.length > 0 ? rows[0] : null;
  }

  async actualizar(id: string, datos: Record<string, any>): Promise<boolean> {
    const asignaciones: string[] = [];
    const params: Record<string, any> = { id };

    Object.entries(datos).forEach(([clave, valor]) => {
      if (valor !== undefined) {
        if (clave === 'fecha_limite' && valor) {
          asignaciones.push(`${clave} = :${clave}`);
          params[clave] = new Date(valor);
        } else {
          asignaciones.push(`${clave} = :${clave}`);
          params[clave] = valor;
        }
      }
    });

    if (asignaciones.length === 0) return false;

    const query = `UPDATE oportunidades SET ${asignaciones.join(', ')} WHERE id = :id`;
    const [result] = await pool.execute<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }

  async listar(options: {
    pagina: number;
    limite: number;
    busqueda?: string;
    tipo?: string;
    posicion?: string;
    pais_id?: number;
  }) {
    const { pagina, limite, busqueda, tipo, posicion, pais_id } = options;
    const offset = (pagina - 1) * limite;
    const params: Record<string, any> = { limite, offset };
    const condiciones: string[] = ["o.estado = 'ABIERTA'"];

    if (busqueda) {
      condiciones.push('(o.titulo LIKE :busqueda OR o.descripcion LIKE :busqueda)');
      params.busqueda = `%${busqueda}%`;
    }

    if (tipo) {
      condiciones.push('o.tipo = :tipo');
      params.tipo = tipo;
    }

    if (posicion) {
      condiciones.push('o.posicion_buscada = :posicion');
      params.posicion = posicion;
    }

    if (pais_id) {
      condiciones.push('o.pais_id = :pais_id');
      params.pais_id = pais_id;
    }

    const whereClause = `WHERE ${condiciones.join(' AND ')}`;

    const queryData = `
      SELECT o.*, org.nombre_comercial AS organizacion_nombre, p.nombre AS pais_nombre
      FROM oportunidades o
      INNER JOIN organizaciones org ON o.organizacion_id = org.id
      LEFT JOIN paises p ON o.pais_id = p.id
      ${whereClause}
      ORDER BY o.creado_en DESC
      LIMIT :limite OFFSET :offset
    `;

    const queryCount = `
      SELECT COUNT(*) AS total 
      FROM oportunidades o 
      ${whereClause}
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

export const oportunidadesRepository = new OportunidadesRepository();