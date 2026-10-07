import { z } from 'zod';

export const crearPostulacionSchema = z.object({
  oportunidad_id: z.string().uuid('ID de oportunidad inválido'),
  mensaje_presentacion: z.string().trim().max(1000, 'El mensaje no puede exceder los 1000 caracteres').optional(),
});

export const cambiarEstadoPostulacionSchema = z.object({
  estado: z.enum(['PENDIENTE', 'EN_REVISION', 'ACEPTADA', 'RECHAZADA']),
  notas_organizacion: z.string().trim().max(1000).optional(),
});

export const queryPostulacionesSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
  estado: z.enum(['PENDIENTE', 'EN_REVISION', 'ACEPTADA', 'RECHAZADA']).optional(),
});

export type CrearPostulacionInput = z.infer<typeof crearPostulacionSchema>;
export type CambiarEstadoPostulacionInput = z.infer<typeof cambiarEstadoPostulacionSchema>;
export type QueryPostulacionesInput = z.infer<typeof queryPostulacionesSchema>;