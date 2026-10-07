import { z } from 'zod';

export const guardarPerfilJugadorSchema = z.object({
  nombre_deportivo: z.string().trim().max(100).optional(),
  posicion_principal: z.string().trim().max(100).optional(),
  posicion_secundaria: z.string().trim().max(100).nullable().optional(),
  categoria: z.string().trim().max(100).nullable().optional(),
  altura_cm: z.number().min(100).max(260).nullable().optional(),
  peso_kg: z.number().min(25).max(200).nullable().optional(),
  pierna_dominante: z.enum(['IZQUIERDA', 'DERECHA', 'AMBAS']).nullable().optional(),
  experiencia: z.string().trim().nullable().optional(),
  descripcion: z.string().trim().nullable().optional(),
  perfil_publico: z.boolean().optional(),
});

export const actualizarHabilidadesSchema = z.object({
  habilidades: z.array(
    z.object({
      habilidad_id: z.number().int().positive('ID de habilidad inválido'),
      nivel: z.number().int().min(0).max(100, 'El nivel debe estar entre 0 y 100'),
      experiencia_anios: z.number().int().min(0).nullable().optional(),
    })
  ).min(1, 'Debe enviar al menos una habilidad'),
});

export const crearPropuestaSchema = z.object({
  titulo: z.string().trim().min(3, 'El título debe tener al menos 3 caracteres').max(150),
  descripcion: z.string().trim().nullable().optional(),
  objetivos: z.string().trim().nullable().optional(),
  experiencia: z.string().trim().nullable().optional(),
  estado: z.enum(['BORRADOR', 'ENVIADA', 'ARCHIVADA']).default('BORRADOR'),
});

export const queryJugadoresPublicosSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
  busqueda: z.string().trim().optional(),
  posicion: z.string().trim().optional(),
  pierna: z.enum(['IZQUIERDA', 'DERECHA', 'AMBAS']).optional(),
  pais_id: z.coerce.number().int().positive().optional(),
});

export type GuardarPerfilJugadorInput = z.infer<typeof guardarPerfilJugadorSchema>;
export type ActualizarHabilidadesInput = z.infer<typeof actualizarHabilidadesSchema>;
export type CrearPropuestaInput = z.infer<typeof crearPropuestaSchema>;
export type QueryJugadoresPublicosInput = z.infer<typeof queryJugadoresPublicosSchema>;