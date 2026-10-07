import { z } from 'zod';

export const registrarArchivoSchema = z.object({
  entidad_tipo: z.enum(['JUGADOR', 'ORGANIZACION', 'CAZATALENTOS', 'EVALUACION', 'PROPUESTA']),
  entidad_id: z.string().uuid('ID de entidad inválido'),
  tipo_archivo: z.enum(['IMAGEN', 'VIDEO', 'DOCUMENTO']),
  url: z.string().trim().url('URL de archivo inválida'),
  titulo: z.string().trim().max(150).nullable().optional(),
  descripcion: z.string().trim().nullable().optional(),
  es_destacado: z.boolean().default(false),
});

export const queryArchivosEntidadSchema = z.object({
  tipo_archivo: z.enum(['IMAGEN', 'VIDEO', 'DOCUMENTO']).optional(),
});

export type RegistrarArchivoInput = z.infer<typeof registrarArchivoSchema>;
export type QueryArchivosEntidadInput = z.infer<typeof queryArchivosEntidadSchema>;