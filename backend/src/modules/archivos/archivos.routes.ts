import { Router } from 'express';
import { archivosController } from './archivos.controller.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { validate } from '../../shared/middlewares/validate.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { registrarArchivoSchema, queryArchivosEntidadSchema } from './archivos.schema.js';

const router = Router();

// Consulta pública de archivos por entidad
router.get(
  '/entidad/:entidadTipo/:entidadId',
  validate({ query: queryArchivosEntidadSchema }),
  asyncHandler(archivosController.listarPorEntidad.bind(archivosController))
);

// Registrar archivo (Autenticado)
router.post(
  '/',
  authenticate,
  validate({ body: registrarArchivoSchema }),
  asyncHandler(archivosController.registrar.bind(archivosController))
);

// Eliminar archivo (Propietario)
router.delete(
  '/:id',
  authenticate,
  asyncHandler(archivosController.eliminar.bind(archivosController))
);

export default router;