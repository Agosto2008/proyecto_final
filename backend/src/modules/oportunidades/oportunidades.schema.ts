import { z } from 'zod';

export const crearOportunidadSchema = z.object({
  titulo: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres').max(150),
  descripcion: z.string().trim().min(10, 'La descripción debe tener al menos 10 caracteres'),
  tipo: z.enum(['PRUEBA', 'VACANTE', 'BECA', 'TORNEO', 'OTRO']),
  posicion_buscada: z.string().trim().max(100).nullable().optional(),
  categoria: z.string().trim().max(100).nullable().optional(),
  edad_minima: z.number().int().min(5).max(50).nullable().optional(),
  edad_maxima: z.number().int().min(5).max(50).nullable().optional(),
  pais_id: z.number().int().positive().nullable().optional(),
  ciudad: z.string().trim().max(100).nullable().optional(),
  fecha_limite: z.string().datetime({ message: 'Fecha límite inválida (debe ser formato ISO)' }).nullable().optional(),
  estado: z.enum(['ABIERTA', 'CERRADA', 'CANCELADA']).default('ABIERTA'),
});

export const actualizarOportunidadSchema = crearOportunidadSchema.partial();

export const queryOportunidadesSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
  busqueda: z.string().trim().optional(),
  tipo: z.enum(['PRUEBA', 'VACANTE', 'BECA', 'TORNEO', 'OTRO']).optional(),
  posicion: z.string().trim().optional(),
  pais_id: z.coerce.number().int().positive().optional(),
});

export type CrearOportunidadInput = z.infer<typeof crearOportunidadSchema>;
export type ActualizarOportunidadInput = z.infer<typeof actualizarOportunidadSchema>;
export type QueryOportunidadesInput = z.infer<typeof queryOportunidadesSchema>;