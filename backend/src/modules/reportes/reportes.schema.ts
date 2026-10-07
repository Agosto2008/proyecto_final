import { z } from 'zod';

export const queryFiltroFechasSchema = z.object({
  fecha_inicio: z.string().datetime().optional(),
  fecha_fin: z.string().datetime().optional(),
});

export type QueryFiltroFechasInput = z.infer<typeof queryFiltroFechasSchema>;