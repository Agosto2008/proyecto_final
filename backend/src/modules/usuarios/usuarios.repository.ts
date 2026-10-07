import { pool } from '../../database/pool.js';
import { RowDataPacket, ResultSetHeader, PoolConnection } from 'mysql2/promise';

export interface UsuarioDetalleRow extends RowDataPacket {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string | null;
  fecha_nacimiento: string;
  pais_id: number;
  pais_nombre: string;
  ciudad: string | null;
  estado: string;
  email_verificado: boolean;
  telefono_verificado: boolean;
  ultimo_acceso: string | null;
  creado_en: string;
  actualizado_en: string;
  roles: string; // JSON Array en MySQL o CSV
}

export class UsuariosRepository {
  async obtenerPorId(id: string, connection?: PoolConnection): Promise<UsuarioDetalleRow | null> {
    const executor = connection || pool;
    const query = `
      SELECT 
        u.id, u.nombre, u.apellido, u.email, u.telefono, u.fecha_nacimiento,
        u.pais_id, p.nombre AS pais_nombre, u.ciudad, u.estado,
        u.email_verificado, u.telefono_verificado, u.ultimo_acceso,
        u.creado_en, u.actualizado_en,
        COALESCE(
          JSON_ARRAYAGG(r.nombre), 
          JSON_ARRAY()
        ) AS roles
      FROM usuarios u
      INNER JOIN paises p ON u.pais_id = p.id
      LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
      LEFT JOIN roles r ON ur.rol_id = r.id
      WHERE u.id = :id
      GROUP BY u.id, p.nombre
    `;

    const [rows] = await executor.execute<UsuarioDetalleRow[]>(query, { id });
    return rows.length > 0 ? rows[0] : null;
  }

  async actualizarPerfil(id: string, datos: Record<string, any>): Promise<boolean> {
    const asignaciones: string[] = [];
    const params: Record<string, any> = { id };

    Object.entries(datos).forEach(([clave, valor]) => {
      if (valor !== undefined) {
        asignaciones.push(`${clave} = :${clave}`);
        params[clave] = valor;
      }
    });

    if (asignaciones.length === 0) return false;

    const query = `
      UPDATE usuarios 
      SET ${asignaciones.join(', ')} 
      WHERE id = :id
    `;

    const [result] = await pool.execute<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }

  async listarPaginado(options: {
    pagina: number;
    limite: number;
    busqueda?: string;
    estado?: string;
    rol?: string;
  }) {
    const { pagina, limite, busqueda, estado, rol } = options;
    const offset = (pagina - 1) * limite;
    const params: Record<string, any> = { limite, offset };
    const condiciones: string[] = [];

    if (busqueda) {
      condiciones.push('(u.nombre LIKE :busqueda OR u.apellido LIKE :busqueda OR u.email LIKE :busqueda)');
      params.busqueda = `%${busqueda}%`;
    }

    if (estado) {
      condiciones.push('u.estado = :estado');
      params.estado = estado;
    }

    if (rol) {
      condiciones.push('r.nombre = :rol');
      params.rol = rol;
    }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

    const queryData = `
      SELECT 
        u.id, u.nombre, u.apellido, u.email, u.estado, u.creado_en,
        p.nombre AS pais_nombre,
        COALESCE(
          JSON_ARRAYAGG(r.nombre), 
          JSON_ARRAY()
        ) AS roles
      FROM usuarios u
      INNER JOIN paises p ON u.pais_id = p.id
      LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
      LEFT JOIN roles r ON ur.rol_id = r.id
      ${whereClause}
      GROUP BY u.id, p.nombre
      ORDER BY u.creado_en DESC
      LIMIT :limite OFFSET :offset
    `;

    const queryCount = `
      SELECT COUNT(DISTINCT u.id) AS total
      FROM usuarios u
      LEFT JOIN usuario_roles ur ON u.id = ur.usuario_id
      LEFT JOIN roles r ON ur.rol_id = r.id
      ${whereClause}
    `;

    const [rows] = await pool.execute<UsuarioDetalleRow[]>(queryData, params);
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

  async cambiarEstado(id: string, nuevoEstado: string): Promise<boolean> {
    const query = 'UPDATE usuarios SET estado = :nuevoEstado WHERE id = :id';
    const [result] = await pool.execute<ResultSetHeader>(query, { id, nuevoEstado });
    return result.affectedRows > 0;
  }

  async revocarSesiones(usuarioId: string): Promise<number> {
    const query = 'UPDATE sesiones SET revocado_en = NOW() WHERE usuario_id = :usuarioId AND revocado_en IS NULL';
    const [result] = await pool.execute<ResultSetHeader>(query, { usuarioId });
    return result.affectedRows;
  }

  async agregarRol(usuarioId: string, rolId: number): Promise<boolean> {
    const query = 'INSERT IGNORE INTO usuario_roles (usuario_id, rol_id) VALUES (:usuarioId, :rolId)';
    const [result] = await pool.execute<ResultSetHeader>(query, { usuarioId, rolId });
    return result.affectedRows > 0;
  }

  async removerRol(usuarioId: string, rolId: number): Promise<boolean> {
    const query = 'DELETE FROM usuario_roles WHERE usuario_id = :usuarioId AND rol_id = :rolId';
    const [result] = await pool.execute<ResultSetHeader>(query, { usuarioId, rolId });
    return result.affectedRows > 0;
  }
}

export const usuariosRepository = new UsuariosRepository();