import { z } from 'zod';

export const guardarOrganizacionSchema = z.object({
  nombre_comercial: z.string().trim().min(2, 'El nombre comercial debe tener al menos 2 caracteres').max(150),
  tipo_organizacion: z.enum(['CLUB', 'ACADEMIA', 'AGENCIA', 'OTRO']),
  sitio_web: z.string().trim().url('URL de sitio web inválida').nullable().optional(),
  pais_id: z.number().int().positive().nullable().optional(),
  ciudad: z.string().trim().max(100).nullable().optional(),
  descripcion: z.string().trim().nullable().optional(),
  verificada: z.boolean().optional(),
});

export const queryOrganizacionesSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
  busqueda: z.string().trim().optional(),
  tipo: z.enum(['CLUB', 'ACADEMIA', 'AGENCIA', 'OTRO']).optional(),
  pais_id: z.coerce.number().int().positive().optional(),
});

export type GuardarOrganizacionInput = z.infer<typeof guardarOrganizacionSchema>;
export type QueryOrganizacionesInput = z.infer<typeof queryOrganizacionesSchema>;