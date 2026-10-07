import { Router } from 'express';
import { jugadoresController } from './jugadores.controller.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { validate } from '../../shared/middlewares/validate.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { requireRole } from '../../shared/middlewares/roles.js';
import { ROLES } from '../../shared/constants/roles.js';
import { 
  guardarPerfilJugadorSchema, 
  actualizarHabilidadesSchema, 
  crearPropuestaSchema, 
  queryJugadoresPublicosSchema 
} from './jugadores.schema.js';

const router = Router();

// Consulta pública de catálogo
router.get(
  '/publicos',
  validate({ query: queryJugadoresPublicosSchema }),
  asyncHandler(jugadoresController.listarPublicos.bind(jugadoresController))
);

router.get(
  '/publicos/:id',
  asyncHandler(jugadoresController.obtenerPorId.bind(jugadoresController))
);

// Gestión de perfil propio (Solo ROL JUGADOR)
router.get(
  '/me',
  authenticate,
  requireRole(ROLES.JUGADOR),
  asyncHandler(jugadoresController.me.bind(jugadoresController))
);

router.put(
  '/me',
  authenticate,
  requireRole(ROLES.JUGADOR),
  validate({ body: guardarPerfilJugadorSchema }),
  asyncHandler(jugadoresController.guardarMe.bind(jugadoresController))
);

router.put(
  '/me/habilidades',
  authenticate,
  requireRole(ROLES.JUGADOR),
  validate({ body: actualizarHabilidadesSchema }),
  asyncHandler(jugadoresController.guardarHabilidadesMe.bind(jugadoresController))
);

router.post(
  '/me/propuestas',
  authenticate,
  requireRole(ROLES.JUGADOR),
  validate({ body: crearPropuestaSchema }),
  asyncHandler(jugadoresController.crearPropuesta.bind(jugadoresController))
);

router.get(
  '/me/propuestas',
  authenticate,
  requireRole(ROLES.JUGADOR),
  asyncHandler(jugadoresController.listarPropuestasMe.bind(jugadoresController))
);

export default router;