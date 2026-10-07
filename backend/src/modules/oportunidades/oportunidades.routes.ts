import { Router } from 'express';
import { oportunidadesController } from './oportunidades.controller.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { validate } from '../../shared/middlewares/validate.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { requireRole } from '../../shared/middlewares/roles.js';
import { ROLES } from '../../shared/constants/roles.js';
import { 
  crearOportunidadSchema, 
  actualizarOportunidadSchema, 
  queryOportunidadesSchema 
} from './oportunidades.schema.js';

const router = Router();

// Consulta pública de oportunidades
router.get(
  '/',
  validate({ query: queryOportunidadesSchema }),
  asyncHandler(oportunidadesController.listar.bind(oportunidadesController))
);

router.get(
  '/:id',
  asyncHandler(oportunidadesController.obtenerPorId.bind(oportunidadesController))
);

// Crear oportunidad (Solo ORGANIZACION)
router.post(
  '/',
  authenticate,
  requireRole(ROLES.ORGANIZACION),
  validate({ body: crearOportunidadSchema }),
  asyncHandler(oportunidadesController.crear.bind(oportunidadesController))
);

// Actualizar oportunidad (Solo ORGANIZACION)
router.put(
  '/:id',
  authenticate,
  requireRole(ROLES.ORGANIZACION),
  validate({ body: actualizarOportunidadSchema }),
  asyncHandler(oportunidadesController.actualizar.bind(oportunidadesController))
);

// Cerrar oportunidad (Solo ORGANIZACION)
router.delete(
  '/:id',
  authenticate,
  requireRole(ROLES.ORGANIZACION),
  asyncHandler(oportunidadesController.cerrar.bind(oportunidadesController))
);

export default router;