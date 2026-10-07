import type { Request } from 'express';
import { hmacHex } from './crypto.js';

/** Datos de la petición que se guardan en sesiones y auditoría (sin información personal en claro). */
export interface ContextoPeticion {
  ipHash: string | null;
  dispositivo: string | null;
}

export function contextoDe(req: Request): ContextoPeticion {
  const ip = req.ip;
  return {
    ipHash: ip ? hmacHex(ip, 'ip') : null, // la IP real nunca se guarda
    dispositivo: req.get('user-agent')?.slice(0, 255) || null,
  };
}