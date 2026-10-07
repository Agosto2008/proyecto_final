import { z } from 'zod';

export const guardarCazatalentosSchema = z.object({
  organizacion_id: z.string().uuid('ID de organización inválido').nullable().optional(),
  cargo: z.string().trim().max(100).nullable().optional(),
  especialidad: z.string().trim().max(100).nullable().optional(),
  experiencia_anios: z.number().int().min(0).max(60).nullable().optional(),
  biografia: z.string().trim().nullable().optional(),
  perfil_publico: z.boolean().optional(),
});

export type GuardarCazatalentosInput = z.infer<typeof guardarCazatalentosSchema>;