import type { NextFunction, Request, Response } from 'express';
import type { ZodType } from 'zod';
import { ValidationError, type ErrorDetail } from '../errors/app-error.js';

interface Schemas {
  body?: ZodType;
  query?: ZodType;
  params?: ZodType;
}

/**
 * Valida body, query y/o params con Zod.
 * - Si algo es inválido: responde 400 con la lista de campos incorrectos.
 * - Si todo es válido: deja los datos ya limpios y tipados en res.locals.validated
 *   (no se reasigna req.query porque en Express 5 es de solo lectura).
 */
export function validate(schemas: Schemas) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const details: ErrorDetail[] = [];
    const validated: { body?: unknown; query?: unknown; params?: unknown } = {};

    for (const key of ['body', 'query', 'params'] as const) {
      const schema = schemas[key];
      if (!schema) continue;

      const result = schema.safeParse(req[key]);
      if (result.success) {
        validated[key] = result.data;
      } else {
        for (const issue of result.error.issues) {
          details.push({
            campo: [key, ...issue.path.map(String)].join('.'),
            mensaje: issue.message,
          });
        }
      }
    }

    if (details.length > 0) {
      next(new ValidationError(details));
      return;
    }

    res.locals.validated = validated;
    next();
  };
}