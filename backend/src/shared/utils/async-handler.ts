import type { NextFunction, Request, RequestHandler, Response } from 'express';

/**
 * Envuelve un controlador async para que cualquier error llegue al errorHandler.
 * Express 5 ya lo hace solo, pero esto mantiene el código compatible con Express 4
 * y deja explícita la intención.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
