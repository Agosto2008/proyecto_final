import { Router } from 'express';
import { usuariosController } from './usuarios.controller.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { validate } from '../../shared/middlewares/validate.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { requireRole } from '../../shared/middlewares/roles.js';
import { ROLES } from '../../shared/constants/roles.js';
import { 
  actualizarPerfilSchema, 
  queryUsuariosSchema, 
  cambiarEstadoUsuarioSchema, 
  asignarRolSchema 
} from './usuarios.schema.js';

const router = Router();

// Rutas requeridas para cualquier usuario autenticado
router.get('/me', authenticate, asyncHandler(usuariosController.me.bind(usuariosController)));

router.patch(
  '/me',
  authenticate,
  validate({ body: actualizarPerfilSchema }),
  asyncHandler(usuariosController.actualizarMe.bind(usuariosController))
);

// Rutas exclusivas para ADMIN
router.get(
  '/',
  authenticate,
  requireRole(ROLES.ADMIN),
  validate({ query: queryUsuariosSchema }),
  asyncHandler(usuariosController.listar.bind(usuariosController))
);

router.get(
  '/:id',
  authenticate,
  requireRole(ROLES.ADMIN),
  asyncHandler(usuariosController.obtenerPorId.bind(usuariosController))
);

router.patch(
  '/:id/estado',
  authenticate,
  requireRole(ROLES.ADMIN),
  validate({ body: cambiarEstadoUsuarioSchema }),
  asyncHandler(usuariosController.cambiarEstado.bind(usuariosController))
);

router.post(
  '/:id/roles',
  authenticate,
  requireRole(ROLES.ADMIN),
  validate({ body: asignarRolSchema }),
  asyncHandler(usuariosController.asignarRol.bind(usuariosController))
);

router.delete(
  '/:id/roles/:rolId',
  authenticate,
  requireRole(ROLES.ADMIN),
  asyncHandler(usuariosController.removerRol.bind(usuariosController))
);

export default router;