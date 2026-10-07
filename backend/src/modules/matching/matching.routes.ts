import { Router } from 'express';
import { matchingController } from './matching.controller.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { validate } from '../../shared/middlewares/validate.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { requireRole } from '../../shared/middlewares/roles.js';
import { ROLES } from '../../shared/constants/roles.js';
import { queryMatchingSchema } from './matching.schema.js';

const router = Router();

// Recomendar oportunidades para el jugador autenticado
router.get(
  '/oportunidades',
  authenticate,
  requireRole(ROLES.JUGADOR),
  validate({ query: queryMatchingSchema }),
  asyncHandler(matchingController.obtenerOportunidadesRecomendadas.bind(matchingController))
);

// Recomendar jugadores para una oportunidad de organización/cazatalentos
router.get(
  '/jugadores/:oportunidadId',
  authenticate,
  validate({ query: queryMatchingSchema }),
  asyncHandler(matchingController.obtenerJugadoresRecomendados.bind(matchingController))
);

export default router;