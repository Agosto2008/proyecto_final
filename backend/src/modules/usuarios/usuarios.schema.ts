import { z } from 'zod';

export const actualizarPerfilSchema = z.object({
  nombre: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  apellido: z.string().trim().min(2, 'El apellido debe tener al menos 2 caracteres').optional(),
  telefono: z.string().trim().nullable().optional(),
  ciudad: z.string().trim().nullable().optional(),
  pais_id: z.number().int().positive('ID de país inválido').optional(),
});

export const queryUsuariosSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
  busqueda: z.string().trim().optional(),
  estado: z.enum(['PENDIENTE', 'ACTIVO', 'SUSPENDIDO', 'ELIMINADO']).optional(),
  rol: z.string().trim().optional(),
});

export const cambiarEstadoUsuarioSchema = z.object({
  estado: z.enum(['PENDIENTE', 'ACTIVO', 'SUSPENDIDO', 'ELIMINADO'], {
    required_error: 'El estado es requerido',
  }),
});

export const asignarRolSchema = z.object({
  rol_id: z.number().int().positive('ID de rol inválido'),
});

export type ActualizarPerfilInput = z.infer<typeof actualizarPerfilSchema>;
export type QueryUsuariosInput = z.infer<typeof queryUsuariosSchema>;
export type CambiarEstadoUsuarioInput = z.infer<typeof cambiarEstadoUsuarioSchema>;
export type AsignarRolInput = z.infer<typeof asignarRolSchema>;