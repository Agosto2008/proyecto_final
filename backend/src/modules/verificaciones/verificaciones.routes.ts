import { Router } from 'express';
import { verificacionesController } from './verificaciones.controller.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { validate } from '../../shared/middlewares/validate.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { requireRole } from '../../shared/middlewares/roles.js';
import { ROLES } from '../../shared/constants/roles.js';
import { 
  solicitarVerificacionSchema, 
  cambiarEstadoVerificacionSchema, 
  queryVerificacionesSchema 
} from './verificaciones.schema.js';

const router = Router();

router.use(authenticate);

// Ver mis solicitudes (Autenticado)
router.get(
  '/mis-solicitudes',
  asyncHandler(verificacionesController.listarMisSolicitudes.bind(verificacionesController))
);

// Solicitar verificación (Autenticado)
router.post(
  '/',
  validate({ body: solicitarVerificacionSchema }),
  asyncHandler(verificacionesController.solicitarVerificacion.bind(verificacionesController))
);

// Listar todas las solicitudes (Solo Administrador)
router.get(
  '/',
  requireRole(ROLES.ADMINISTRADOR),
  validate({ query: queryVerificacionesSchema }),
  asyncHandler(verificacionesController.listarTodas.bind(verificacionesController))
);

// Aprobar o rechazar verificación (Solo Administrador)
router.patch(
  '/:id/estado',
  requireRole(ROLES.ADMINISTRADOR),
  validate({ body: cambiarEstadoVerificacionSchema }),
  asyncHandler(verificacionesController.cambiarEstado.bind(verificacionesController))
);

export default router;