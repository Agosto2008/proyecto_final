import jwt from 'jsonwebtoken';
import { env } from '../../config/env.js';

const ISSUER = 'futurestar';

export interface AccessTokenPayload {
  sub: string;
  roles: string[];
}

export const ACCESS_TOKEN_SEGUNDOS = env.ACCESS_TOKEN_TTL_MINUTES * 60;

export function signAccessToken(usuarioId: string, roles: string[]): string {
  return jwt.sign({ roles }, env.JWT_ACCESS_SECRET, {
    algorithm: 'HS256',
    subject: usuarioId,
    issuer: ISSUER,
    expiresIn: ACCESS_TOKEN_SEGUNDOS,
  });
}

/** Lanza un error si el token es falso, está alterado, expiró o tiene otro formato. */
export function verifyAccessToken(token: string): AccessTokenPayload {
  const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET, {
    algorithms: ['HS256'],
    issuer: ISSUER,
  });
  if (typeof decoded === 'string' || typeof decoded.sub !== 'string' || !Array.isArray(decoded.roles)) {
    throw new Error('Payload del token inválido');
  }
  return {
    sub: decoded.sub,
    roles: decoded.roles.filter((r): r is string => typeof r === 'string'),
  };
}