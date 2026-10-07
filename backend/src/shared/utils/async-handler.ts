import type {
  NextFunction,
  Request,
  RequestHandler,
  Response,
} from 'express';

/**
 * Envuelve funciones async para que los errores
 * sean enviados automáticamente al middleware
 * de manejo de errores.
 */
export function asyncHandler(
  fn: (
    req: Request,
    res: Response,
    next: NextFunction
  ) => Promise<unknown>
): RequestHandler {
  return (
    req: Request,
    res: Response,
    next: NextFunction
  ): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

