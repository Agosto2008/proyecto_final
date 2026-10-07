import { z } from 'zod';

export const queryPaisesSchema = z.object({
  busqueda: z.string().trim().optional(),
});

export const queryHabilidadesSchema = z.object({
  categoria: z.string().trim().optional(),
});

export type QueryPaisesInput = z.infer<typeof queryPaisesSchema>;
export type QueryHabilidadesInput = z.infer<typeof queryHabilidadesSchema>;