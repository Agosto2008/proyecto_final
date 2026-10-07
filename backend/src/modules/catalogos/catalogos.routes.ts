import { Router } from 'express';
import { catalogosController } from './catalogos.controller.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { validate } from '../../shared/middlewares/validate.js';
import { queryPaisesSchema, queryHabilidadesSchema } from './catalogos.schema.js';

const router = Router();

router.get(
  '/paises',
  validate({ query: queryPaisesSchema }),
  asyncHandler(catalogosController.listarPaises.bind(catalogosController))
);

router.get(
  '/habilidades',
  validate({ query: queryHabilidadesSchema }),
  asyncHandler(catalogosController.listarHabilidades.bind(catalogosController))
);

export default router;