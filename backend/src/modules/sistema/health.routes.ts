import { Router } from 'express';
import { pool } from '../../database/pool.js';

export const healthRouter = Router();

healthRouter.get('/', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({
      status: 'ok',
      database: 'up',
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      status: 'error',
      database: 'down',
      timestamp: new Date().toISOString(),
    });
  }
});