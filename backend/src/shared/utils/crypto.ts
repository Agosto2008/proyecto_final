import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { env } from '../../config/env.js';

/** Hash rápido y determinista: sirve para tokens aleatorios largos (NO para contraseñas). */
export function sha256Hex(valor: string): string {
  return createHash('sha256').update(valor).digest('hex');
}

/** Cadena aleatoria criptográficamente segura (por defecto 48 bytes = 64 caracteres). */
export function randomToken(bytes = 48): string {
  return randomBytes(bytes).toString('base64url');
}

/**
 * Hash con clave secreta (HMAC). Se usa para IPs y correos en auditoría:
 * permite comparar "es la misma IP" sin guardar la IP real.
 */
export function hmacHex(valor: string, proposito: string): string {
  return createHmac('sha256', env.JWT_ACCESS_SECRET).update(`${proposito}:${valor}`).digest('hex');
}

/** Compara dos hashes hexadecimales en tiempo constante (evita ataques de temporización). */
export function safeEqualHex(a: string, b: string): boolean {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}