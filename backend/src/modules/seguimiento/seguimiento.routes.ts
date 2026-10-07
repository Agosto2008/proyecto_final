import { Router } from 'express';
import { seguimientoController } from './seguimiento.controller.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { validate } from '../../shared/middlewares/validate.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { seguirEntidadSchema, querySeguimientoSchema } from './seguimiento.schema.js';

const router = Router();

// Consultar lista de seguidos (Autenticado)
router.get(
  '/siguiendo',
  authenticate,
  validate({ query: querySeguimientoSchema }),
  asyncHandler(seguimientoController.listarSiguiendo.bind(seguimientoController))
);

// Contar seguidores de una entidad (Público)
router.get(
  '/seguidores/:entidadTipo/:entidadId',
  asyncHandler(seguimientoController.obtenerSeguidores.bind(seguimientoController))
);

// Seguir entidad (Autenticado)
router.post(
  '/',
  authenticate,
  validate({ body: seguirEntidadSchema }),
  asyncHandler(seguimientoController.seguir.bind(seguimientoController))
);

// Dejar de seguir entidad (Autenticado)
router.delete(
  '/:entidadTipo/:entidadId',
  authenticate,
  asyncHandler(seguimientoController.dejarDeSeguir.bind(seguimientoController))
);

export default router;