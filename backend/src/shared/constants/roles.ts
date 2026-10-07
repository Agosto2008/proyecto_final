// src/shared/constants/roles.ts
export const ROLES = {
  ADMINISTRADOR: 'ADMIN',
  ADMIN: 'ADMIN',
  ORGANIZACION: 'ORGANIZACION',
  CAZATALENTOS: 'CAZATALENTOS',
  JUGADOR: 'JUGADOR',
} as const;

export type RolType = typeof ROLES[keyof typeof ROLES];