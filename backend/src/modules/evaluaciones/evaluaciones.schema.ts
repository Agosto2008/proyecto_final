import { z } from 'zod';

export const detalleEvaluacionHabilidadSchema = z.object({
  habilidad_id: z.number().int().positive('ID de habilidad inválido'),
  puntaje: z.number().int().min(0).max(100, 'El puntaje debe estar entre 0 y 100'),
  observaciones: z.string().trim().nullable().optional(),
});

export const crearEvaluacionSchema = z.object({
  jugador_id: z.string().uuid('ID de jugador inválido'),
  propuesta_id: z.string().uuid('ID de propuesta inválido').nullable().optional(),
  puntaje_general: z.number().int().min(0).max(100, 'El puntaje general debe estar entre 0 y 100'),
  comentarios: z.string().trim().nullable().optional(),
  recomendacion: z.enum(['RECOMENDADO', 'EN_OBSERVACION', 'NO_RECOMENDADO']).default('EN_OBSERVACION'),
  detalles: z.array(detalleEvaluacionHabilidadSchema).min(1, 'Debe incluir al menos una habilidad en la evaluación'),
});

export const queryEvaluacionesJugadorSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
});

export type CrearEvaluacionInput = z.infer<typeof crearEvaluacionSchema>;
export type QueryEvaluacionesJugadorInput = z.infer<typeof queryEvaluacionesJugadorSchema>;