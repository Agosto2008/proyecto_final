import { Router } from 'express';
import { postulacionesController } from './postulaciones.controller.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { validate } from '../../shared/middlewares/validate.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { requireRole } from '../../shared/middlewares/roles.js';
import { ROLES } from '../../shared/constants/roles.js';
import { 
  crearPostulacionSchema, 
  cambiarEstadoPostulacionSchema, 
  queryPostulacionesSchema 
} from './postulaciones.schema.js';

const router = Router();

// Postulaciones del jugador autenticado
router.get(
  '/mis-postulaciones',
  authenticate,
  requireRole(ROLES.JUGADOR),
  validate({ query: queryPostulacionesSchema }),
  asyncHandler(postulacionesController.listarMisPostulaciones.bind(postulacionesController))
);

// Ver postulantes de una oportunidad (Organización)
router.get(
  '/oportunidad/:oportunidadId',
  authenticate,
  requireRole(ROLES.ORGANIZACION),
  validate({ query: queryPostulacionesSchema }),
  asyncHandler(postulacionesController.listarPorOportunidad.bind(postulacionesController))
);

// Crear postulación (Jugador)
router.post(
  '/',
  authenticate,
  requireRole(ROLES.JUGADOR),
  validate({ body: crearPostulacionSchema }),
  asyncHandler(postulacionesController.crear.bind(postulacionesController))
);

// Cambiar estado de postulación (Organización)
router.patch(
  '/:id/estado',
  authenticate,
  requireRole(ROLES.ORGANIZACION),
  validate({ body: cambiarEstadoPostulacionSchema }),
  asyncHandler(postulacionesController.cambiarEstado.bind(postulacionesController))
);

export default router;