import { Router } from 'express';
import { reportesController } from './reportes.controller.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { requireRole } from '../../shared/middlewares/roles.js';
import { ROLES } from '../../shared/constants/roles.js';

const router = Router();

router.use(authenticate);

// Métricas generales (Solo Admin)
router.get(
  '/dashboard',
  requireRole(ROLES.ADMINISTRADOR),
  asyncHandler(reportesController.obtenerDashboardAdmin.bind(reportesController))
);

// Resumen analítico de Organización
router.get(
  '/organizaciones/resumen',
  requireRole(ROLES.ORGANIZACION),
  asyncHandler(reportesController.obtenerResumenOrganizacion.bind(reportesController))
);

// Distribución de posiciones de jugadores (Público autenticado)
router.get(
  '/jugadores/posiciones',
  asyncHandler(reportesController.obtenerDistribucionPosiciones.bind(reportesController))
);

export default router;