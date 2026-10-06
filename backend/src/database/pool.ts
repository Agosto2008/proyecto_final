import mysql from 'mysql2/promise';
import { env } from '../config/env.js';
import { logger } from '../config/logger.js';

logger.info((rows as unknown[])[0], 'Conexión a MySQL correcta');

export const pool = mysql.createPool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  connectionLimit: env.DB_POOL_LIMIT,
  charset: 'utf8mb4',
  timezone: 'Z',
  decimalNumbers: true,
  namedPlaceholders: true,
});

export async function verifyConnection(): Promise<void> {
  const [rows] = await pool.query(
    'SELECT DATABASE() AS base_datos, CURRENT_USER() AS usuario, VERSION() AS version'
  );
  console.log('Conexión a MySQL correcta:', (rows as unknown[])[0]);
}