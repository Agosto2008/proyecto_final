import type { NextFunction, Request, Response } from 'express';
import { logger } from '../../config/logger.js';
import {
  AppError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  ServiceUnavailableError,
} from '../errors/app-error.js';

const INTERNAL = new AppError(500, 'INTERNAL_ERROR', 'Error interno del servidor');

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

/** Convierte CUALQUIER error en un AppError seguro para enviar al cliente. */
function toAppError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  if (!isObject(err)) return INTERNAL;

  // Errores de express.json(): JSON mal formado o cuerpo demasiado grande
  if (err.type === 'entity.parse.failed') {
    return new BadRequestError('El cuerpo de la petición no es un JSON válido');
  }
  if (err.type === 'entity.too.large') {
    return new AppError(413, 'PAYLOAD_TOO_LARGE', 'El cuerpo de la petición es demasiado grande');
  }

  // Errores de MySQL (mysql2 los marca con code y errno).
  // Se traducen a mensajes genéricos: NUNCA se envía el texto original de MySQL.
  switch (err.errno) {
    case 1062: // ER_DUP_ENTRY: viola un UNIQUE
      return new ConflictError('Ya existe un registro con esos datos');
    case 1451: // ER_ROW_IS_REFERENCED_2: otro registro depende de este
      return new ConflictError('No se puede eliminar porque tiene registros relacionados');
    case 1452: // ER_NO_REFERENCED_ROW_2: la clave foránea apunta a algo que no existe
      return new BadRequestError('Se hace referencia a un registro que no existe');
    case 3819: // ER_CHECK_CONSTRAINT_VIOLATED: viola un CHECK
      return new BadRequestError('Los datos no cumplen una regla de validación');
    case 1048: // ER_BAD_NULL_ERROR
    case 1406: // ER_DATA_TOO_LONG
      return new BadRequestError('Algún dato falta o es demasiado largo');
  }

  // Base de datos caída o conexión perdida
  if (
    err.code === 'ECONNREFUSED' ||
    err.code === 'PROTOCOL_CONNECTION_LOST' ||
    err.code === 'ER_CON_COUNT_ERROR'
  ) {
    return new ServiceUnavailableError('La base de datos no está disponible');
  }

  return INTERNAL;
}

/** 404: ninguna ruta coincidió. */
export function notFoundHandler(req: Request, _res: Response, next: NextFunction): void {
  next(new NotFoundError(`Ruta no encontrada: ${req.method} ${req.path}`));
}

/** Manejador central: Express lo reconoce por tener 4 parámetros. */
export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  // Si ya se empezó a responder, no se puede cambiar la respuesta
  if (res.headersSent) {
    next(err);
    return;
  }

  const appError = toAppError(err);
  const log = req.log ?? logger;

  // 5xx = fallo nuestro (se registra con el detalle completo).
  // 4xx = fallo del cliente (basta un aviso breve).
  if (appError.statusCode >= 500) {
    log.error({ err }, appError.message);
  } else {
    log.warn({ code: appError.code }, appError.message);
  }

  res.status(appError.statusCode).json({
    error: {
      code: appError.code,
      message: appError.message,
      ...(appError.details ? { details: appError.details } : {}),
      requestId: req.id,
    },
  });
}
