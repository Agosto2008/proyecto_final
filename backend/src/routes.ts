import { Router } from 'express';

import { authRouter } from './modules/auth/auth.routes.js';
import sistemaRoutes from './modules/sistema/sistema.routes.js';
import catalogosRoutes from './modules/catalogos/catalogos.routes.js';
import usuariosRoutes from './modules/usuarios/usuarios.routes.js';
import jugadoresRoutes from './modules/jugadores/jugadores.routes.js';
import organizacionesRoutes from './modules/organizaciones/organizaciones.routes.js';
import cazatalentosRoutes from './modules/cazatalentos/cazatalentos.routes.js';
import evaluacionesRoutes from './modules/evaluaciones/evaluaciones.routes.js';
import archivosRoutes from './modules/archivos/archivos.routes.js';
import oportunidadesRoutes from './modules/oportunidades/oportunidades.routes.js';
import postulacionesRoutes from './modules/postulaciones/postulaciones.routes.js';
import seguimientoRoutes from './modules/seguimiento/seguimiento.routes.js';
import comunicacionRoutes from './modules/comunicacion/comunicacion.routes.js';
import matchingRoutes from './modules/matching/matching.routes.js';
import verificacionesRoutes from './modules/verificaciones/verificaciones.routes.js';
import reportesRoutes from './modules/reportes/reportes.routes.js';

const router = Router();

router.use('/auth', authRouter);

router.use('/sistema', sistemaRoutes);
router.use('/catalogos', catalogosRoutes);
router.use('/usuarios', usuariosRoutes);
router.use('/jugadores', jugadoresRoutes);
router.use('/organizaciones', organizacionesRoutes);
router.use('/cazatalentos', cazatalentosRoutes);
router.use('/evaluaciones', evaluacionesRoutes);
router.use('/archivos', archivosRoutes);
router.use('/oportunidades', oportunidadesRoutes);
router.use('/postulaciones', postulacionesRoutes);
router.use('/seguimiento', seguimientoRoutes);
router.use('/comunicacion', comunicacionRoutes);
router.use('/matching', matchingRoutes);
router.use('/verificaciones', verificacionesRoutes);
router.use('/reportes', reportesRoutes);

export default router;