import { Router } from 'express';
import { comunicacionController } from './comunicacion.controller.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import { validate } from '../../shared/middlewares/validate.js';
import { authenticate } from '../../shared/middlewares/auth.js';
import { 
  crearConversacionSchema, 
  enviarMensajeSchema, 
  queryMensajesSchema 
} from './comunicacion.schema.js';

const router = Router();

// Todas las rutas de mensajería requieren autenticación
router.use(authenticate);

// Obtenes mis conversaciones
router.get(
  '/conversaciones',
  asyncHandler(comunicacionController.listarConversaciones.bind(comunicacionController))
);

// Iniciar/Abrir conversación
router.post(
  '/conversaciones',
  validate({ body: crearConversacionSchema }),
  asyncHandler(comunicacionController.obtenerOCrearConversacion.bind(comunicacionController))
);

// Obtener mensajes de una conversación
router.get(
  '/conversaciones/:id/mensajes',
  validate({ query: queryMensajesSchema }),
  asyncHandler(comunicacionController.listarMensajes.bind(comunicacionController))
);

// Marcar mensajes como leídos
router.patch(
  '/conversaciones/:id/leer',
  asyncHandler(comunicacionController.marcarComoLeidos.bind(comunicacionController))
);

// Enviar un mensaje
router.post(
  '/mensajes',
  validate({ body: enviarMensajeSchema }),
  asyncHandler(comunicacionController.enviarMensaje.bind(comunicacionController))
);

export default router;