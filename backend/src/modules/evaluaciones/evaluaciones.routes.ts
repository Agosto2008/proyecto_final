import { Router } from 'express';
import { evaluacionesController } from './evaluaciones.controller.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { validate } from '../../shared/middlewares/validate.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { requireRole } from '../../shared/middlewares/roles.js';
import { ROLES } from '../../shared/constants/roles.js';
import { crearEvaluacionSchema, queryEvaluacionesJugadorSchema } from './evaluaciones.schema.js';

const router = Router();

// Crear evaluación (Solo CAZATALENTOS y ORGANIZACION)
router.post(
  '/',
  authenticate,
  requireRole(ROLES.CAZATALENTOS, ROLES.ORGANIZACION),
  validate({ body: crearEvaluacionSchema }),
  asyncHandler(evaluacionesController.crear.bind(evaluacionesController))
);

// Listar evaluaciones realizadas por mi perfil
router.get(
  '/me',
  authenticate,
  requireRole(ROLES.CAZATALENTOS, ROLES.ORGANIZACION),
  asyncHandler(evaluacionesController.misEvaluaciones.bind(evaluacionesController))
);

// Obtener detalle de una evaluación por ID
router.get(
  '/:id',
  authenticate,
  asyncHandler(evaluacionesController.obtenerPorId.bind(evaluacionesController))
);

// Historial de evaluaciones de un jugador
router.get(
  '/jugador/:jugadorId',
  authenticate,
  validate({ query: queryEvaluacionesJugadorSchema }),
  asyncHandler(evaluacionesController.listarPorJugador.bind(evaluacionesController))
);

export default router;