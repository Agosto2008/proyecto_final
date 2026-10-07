import { z } from 'zod';

export const seguirEntidadSchema = z.object({
  entidad_tipo: z.enum(['JUGADOR', 'ORGANIZACION', 'CAZATALENTOS']),
  entidad_id: z.string().uuid('ID de entidad inválido'),
  notas: z.string().trim().max(500, 'Las notas no pueden exceder los 500 caracteres').nullable().optional(),
});

export const querySeguimientoSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
  entidad_tipo: z.enum(['JUGADOR', 'ORGANIZACION', 'CAZATALENTOS']).optional(),
});

export type SeguirEntidadInput = z.infer<typeof seguirEntidadSchema>;
export type QuerySeguimientoInput = z.infer<typeof querySeguimientoSchema>;