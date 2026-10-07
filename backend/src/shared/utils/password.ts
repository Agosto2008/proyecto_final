import { argon2id, hash, verify } from 'argon2';

// Parámetros recomendados por OWASP para argon2id
const OPCIONES = { type: argon2id, memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, OPCIONES);
}

export async function verifyPassword(hashGuardado: string, plain: string): Promise<boolean> {
  try {
    return await verify(hashGuardado, plain);
  } catch {
    return false;
  }
}

// Hash de mentira, calculado una sola vez. Se usa cuando el correo no existe para
// que el login tarde lo mismo que con un correo real (evita adivinar qué correos existen).
let hashFalso: Promise<string> | null = null;
export function obtenerHashFalso(): Promise<string> {
  hashFalso ??= hashPassword('contrasena-falsa-solo-para-igualar-tiempos');
  return hashFalso;
}