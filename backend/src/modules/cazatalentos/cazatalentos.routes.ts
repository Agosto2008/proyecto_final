import { Router } from 'express';
import { cazatalentosController } from './cazatalentos.controller.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { validate } from '../../shared/middlewares/validate.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { requireRole } from '../../shared/middlewares/roles.js';
import { ROLES } from '../../shared/constants/roles.js';
import { guardarCazatalentosSchema } from './cazatalentos.schema.js';

const router = Router();

router.get(
  '/me',
  authenticate,
  requireRole(ROLES.CAZATALENTOS),
  asyncHandler(cazatalentosController.me.bind(cazatalentosController))
);

router.put(
  '/me',
  authenticate,
  requireRole(ROLES.CAZATALENTOS),
  validate({ body: guardarCazatalentosSchema }),
  asyncHandler(cazatalentosController.guardarMe.bind(cazatalentosController))
);

export default router;