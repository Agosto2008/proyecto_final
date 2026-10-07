import { Router } from 'express';
import { organizacionesController } from './organizaciones.controller.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { validate } from '../../shared/middlewares/validate.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { requireRole } from '../../shared/middlewares/roles.js';
import { ROLES } from '../../shared/constants/roles.js';
import { guardarOrganizacionSchema, queryOrganizacionesSchema } from './organizaciones.schema.js';

const router = Router();

router.get(
  '/publicas',
  validate({ query: queryOrganizacionesSchema }),
  asyncHandler(organizacionesController.listarPublicas.bind(organizacionesController))
);

router.get(
  '/publicas/:id',
  asyncHandler(organizacionesController.obtenerPorId.bind(organizacionesController))
);

router.get(
  '/me',
  authenticate,
  requireRole(ROLES.ORGANIZACION),
  asyncHandler(organizacionesController.me.bind(organizacionesController))
);

router.put(
  '/me',
  authenticate,
  requireRole(ROLES.ORGANIZACION),
  validate({ body: guardarOrganizacionSchema }),
  asyncHandler(organizacionesController.guardarMe.bind(organizacionesController))
);

export default router;