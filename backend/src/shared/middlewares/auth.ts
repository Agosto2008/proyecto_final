import type { NextFunction, Request, Response } from 'express';
import '../types/auth.js';
import { UnauthorizedError } from '../errors/app-error.js';
import { verifyAccessToken } from '../utils/jwt.js';

/** Exige un token de acceso válido en la cabecera "Authorization: Bearer <token>". */
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const cabecera = req.headers.authorization;
  if (!cabecera?.startsWith('Bearer ')) {
    next(new UnauthorizedError('Falta el token de acceso'));
    return;
  }
  try {
    const payload = verifyAccessToken(cabecera.slice(7).trim());
    req.user = { id: payload.sub, roles: payload.roles };
    next();
  } catch {
    next(new UnauthorizedError('Token inválido o expirado'));
  }
}