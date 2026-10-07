import { z } from 'zod';

export const queryMatchingSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
  compatibilidad_minima: z.coerce.number().int().min(0).max(100).default(50),
});

export type QueryMatchingInput = z.infer<typeof queryMatchingSchema>;