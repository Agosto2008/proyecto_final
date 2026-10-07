import { rateLimit } from 'express-rate-limit';
import { AppError } from '../errors/app-error.js';

function crearLimitador(ventanaMs: number, limite: number, mensaje: string, soloFallidos = false) {
  return rateLimit({
    windowMs: ventanaMs,
    limit: limite,
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: soloFallidos, // true = solo cuentan las respuestas con error
    handler: (_req, _res, next) => next(new AppError(429, 'TOO_MANY_REQUESTS', mensaje)),
  });
}

// Frena la adivinanza de contraseñas: 10 intentos FALLIDOS cada 15 minutos por IP
export const loginLimiter = crearLimitador(
  15 * 60_000,
  10,
  'Demasiados intentos fallidos. Intenta de nuevo en 15 minutos.',
  true,
);

// Frena el registro masivo de cuentas falsas
export const registroLimiter = crearLimitador(
  60 * 60_000,
  20,
  'Demasiados registros desde esta conexión. Intenta más tarde.',
);

export const refreshLimiter = crearLimitador(
  15 * 60_000,
  60,
  'Demasiadas renovaciones de sesión. Intenta más tarde.',
);