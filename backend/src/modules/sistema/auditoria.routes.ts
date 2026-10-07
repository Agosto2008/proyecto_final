import { Router } from 'express';
import { ROLES } from '../../shared/constants/roles.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { requireRole } from '../../shared/middlewares/roles.js';
import { validate } from '../../shared/middlewares/validate.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import * as controller from './auditoria.controller.js';
import { listarAuditoriaSchema } from './auditoria.schema.js';

export const auditoriaRouter = Router();

// Solo administradores pueden leer la auditoría
auditoriaRouter.get(
  '/',
  authenticate,
  requireRole(ROLES.ADMIN),
  validate({ query: listarAuditoriaSchema }),
  asyncHandler(controller.listar),
);