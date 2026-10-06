import { randomUUID } from 'node:crypto';
import { pinoHttp } from 'pino-http';
import { logger } from '../../config/logger.js';

const ID_VALIDO = /^[\w-]{1,64}$/;

export const requestLogger = pinoHttp({
  logger,
  // Cada petición recibe un ID único, también devuelto en la cabecera X-Request-Id.
  genReqId: (req, res) => {
    const entrante = req.headers['x-request-id'];
    const id = typeof entrante === 'string' && ID_VALIDO.test(entrante) ? entrante : randomUUID();
    res.setHeader('X-Request-Id', id);
    return id;
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return 'error';
    if (res.statusCode >= 400) return 'warn';
    return 'info';
  },
  // El health check se llama muy seguido y solo llena el log de ruido
  autoLogging: { ignore: (req) => req.url === '/api/health' || req.url === '/api/health/' },
  // Solo lo necesario: método, URL y código de respuesta
  serializers: {
    req: (req) => ({ id: req.id, method: req.method, url: req.url }),
    res: (res) => ({ statusCode: res.statusCode }),
  },
});