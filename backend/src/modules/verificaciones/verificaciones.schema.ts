import { z } from 'zod';

export const solicitarVerificacionSchema = z.object({
  entidad_tipo: z.enum(['JUGADOR', 'ORGANIZACION', 'CAZATALENTOS']),
  entidad_id: z.string().uuid('ID de entidad inválido'),
  tipo_documento: z.string().trim().min(2, 'Tipo de documento requerido').max(50),
  documento_url: z.string().url('URL del documento no válida'),
  comentarios: z.string().trim().max(1000).optional(),
});

export const cambiarEstadoVerificacionSchema = z.object({
  estado: z.enum(['APROBADO', 'RECHAZADO']),
  motivo_rechazo: z.string().trim().max(1000).optional(),
});

export const queryVerificacionesSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
  estado: z.enum(['PENDIENTE', 'APROBADO', 'RECHAZADO']).optional(),
  entidad_tipo: z.enum(['JUGADOR', 'ORGANIZACION', 'CAZATALENTOS']).optional(),
});

export type SolicitarVerificacionInput = z.infer<typeof solicitarVerificacionSchema>;
export type CambiarEstadoVerificacionInput = z.infer<typeof cambiarEstadoVerificacionSchema>;
export type QueryVerificacionesInput = z.infer<typeof queryVerificacionesSchema>;