import { pool } from '../../database/pool.js';
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export interface JugadorRow extends RowDataPacket {
  id: string;
  usuario_id: string;
  nombre_deportivo: string | null;
  posicion_principal: string | null;
  posicion_secundaria: string | null;
  categoria: string | null;
  altura_cm: number | null;
  peso_kg: number | null;
  pierna_dominante: string | null;
  experiencia: string | null;
  descripcion: string | null;
  perfil_publico: boolean;
  estado_perfil: string;
  creado_en: string;
  actualizado_en: string;
}

export class JugadoresRepository {
  async obtenerPorUsuarioId(usuarioId: string): Promise<JugadorRow | null> {
    const query = 'SELECT * FROM jugadores WHERE usuario_id = :usuarioId';
    const [rows] = await pool.execute<JugadorRow[]>(query, { usuarioId });
    return rows.length > 0 ? rows[0] : null;
  }

  async obtenerPorId(id: string): Promise<JugadorRow | null> {
    const query = 'SELECT * FROM jugadores WHERE id = :id';
    const [rows] = await pool.execute<JugadorRow[]>(query, { id });
    return rows.length > 0 ? rows[0] : null;
  }

  async crear(usuarioId: string): Promise<string> {
    const query = `
      INSERT INTO jugadores (id, usuario_id, estado_perfil) 
      VALUES (UUID(), :usuarioId, 'BORRADOR')
    `;
    await pool.execute(query, { usuarioId });
    const jugador = await this.obtenerPorUsuarioId(usuarioId);
    return jugador!.id;
  }

  async actualizar(jugadorId: string, datos: Record<string, any>): Promise<boolean> {
    const asignaciones: string[] = [];
    const params: Record<string, any> = { jugadorId };

    Object.entries(datos).forEach(([clave, valor]) => {
      if (valor !== undefined) {
        asignaciones.push(`${clave} = :${clave}`);
        params[clave] = valor;
      }
    });

    if (datos.perfil_publico !== undefined) {
      asignaciones.push("estado_perfil = CASE WHEN :perfil_publico = TRUE THEN 'ACTIVO' ELSE 'BORRADOR' END");
    }

    if (asignaciones.length === 0) return false;

    const query = `UPDATE jugadores SET ${asignaciones.join(', ')} WHERE id = :jugadorId`;
    const [result] = await pool.execute<ResultSetHeader>(query, params);
    return result.affectedRows > 0;
  }

  async guardarHabilidades(jugadorId: string, habilidades: Array<{ habilidad_id: number; nivel: number; experiencia_anios?: number | null }>): Promise<void> {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      await connection.execute('DELETE FROM jugador_habilidades WHERE jugador_id = :jugadorId', { jugadorId });

      for (const hab of habilidades) {
        const queryInsert = `
          INSERT INTO jugador_habilidades (jugador_id, habilidad_id, nivel, experiencia_anios)
          VALUES (:jugadorId, :habilidad_id, :nivel, :experiencia_anios)
        `;
        await connection.execute(queryInsert, {
          jugadorId,
          habilidad_id: hab.habilidad_id,
          nivel: hab.nivel,
          experiencia_anios: hab.experiencia_anios ?? null,
        });
      }

      await connection.commit();
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async obtenerHabilidades(jugadorId: string) {
    const query = `
      SELECT jh.habilidad_id, h.nombre, h.categoria, jh.nivel, jh.experiencia_anios, jh.evaluado
      FROM jugador_habilidades jh
      INNER JOIN habilidades h ON jh.habilidad_id = h.id
      WHERE jh.jugador_id = :jugadorId
      ORDER BY h.categoria ASC, h.nombre ASC
    `;
    const [rows] = await pool.execute<RowDataPacket[]>(query, { jugadorId });
    return rows;
  }

  async listarPublicos(options: {
    pagina: number;
    limite: number;
    busqueda?: string;
    posicion?: string;
    pierna?: string;
    pais_id?: number;
  }) {
    const { pagina, limite, busqueda, posicion, pierna, pais_id } = options;
    const offset = (pagina - 1) * limite;
    const params: Record<string, any> = { limite, offset };
    const condiciones: string[] = [];

    if (busqueda) {
      condiciones.push('(nombre LIKE :busqueda OR apellido LIKE :busqueda OR nombre_deportivo LIKE :busqueda)');
      params.busqueda = `%${busqueda}%`;
    }

    if (posicion) {
      condiciones.push('(posicion_principal = :posicion OR posicion_secundaria = :posicion)');
      params.posicion = posicion;
    }

    if (pierna) {
      condiciones.push('pierna_dominante = :pierna');
      params.pierna = pierna;
    }

    if (pais_id) {
      condiciones.push('pais_id = :pais_id');
      params.pais_id = pais_id;
    }

    const whereClause = condiciones.length > 0 ? `WHERE ${condiciones.join(' AND ')}` : '';

    // Lectura ESTRICTA desde la vista v_jugadores_publicos
    const queryData = `
      SELECT * FROM v_jugadores_publicos
      ${whereClause}
      ORDER BY creado_en DESC
      LIMIT :limite OFFSET :offset
    `;

    const queryCount = `
      SELECT COUNT(*) AS total FROM v_jugadores_publicos
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

  async crearPropuesta(jugadorId: string, datos: any): Promise<string> {
    const query = `
      INSERT INTO propuestas (id, jugador_id, titulo, descripcion, objetivos, experiencia, estado, enviada_en)
      VALUES (UUID(), :jugadorId, :titulo, :descripcion, :objetivos, :experiencia, :estado, 
              CASE WHEN :estado = 'ENVIADA' THEN NOW() ELSE NULL END)
    `;
    const params = {
      jugadorId,
      titulo: datos.titulo,
      descripcion: datos.descripcion ?? null,
      objetivos: datos.objetivos ?? null,
      experiencia: datos.experiencia ?? null,
      estado: datos.estado,
    };
    await pool.execute(query, params);
    return 'Propuesta creada exitosamente';
  }

  async listarPropuestas(jugadorId: string) {
    const query = 'SELECT * FROM propuestas WHERE jugador_id = :jugadorId ORDER BY creada_en DESC';
    const [rows] = await pool.execute<RowDataPacket[]>(query, { jugadorId });
    return rows;
  }
}

export const jugadoresRepository = new JugadoresRepository();