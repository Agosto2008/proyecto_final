import { Router } from 'express';
import { env } from './config/env.js';
import { healthRouter } from './modules/sistema/health.routes.js';
import { pruebasRouter } from './modules/sistema/pruebas.routes.js';

export const routes = Router();

routes.use('/health', healthRouter);

// Solo en desarrollo: rutas temporales para probar el PASO 5
if (env.NODE_ENV === 'development') {
  routes.use('/pruebas', pruebasRouter);
}

// Aquí se irán agregando los módulos: auth, usuarios, jugadores, etc.