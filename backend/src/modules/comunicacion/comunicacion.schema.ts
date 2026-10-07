import { z } from 'zod';

export const crearConversacionSchema = z.object({
  receptor_id: z.string().uuid('ID de receptor inválido'),
  mensaje_inicial: z.string().trim().min(1, 'El mensaje no puede estar vacío').max(2000, 'Máximo 2000 caracteres').optional(),
});

export const enviarMensajeSchema = z.object({
  conversacion_id: z.string().uuid('ID de conversación inválido'),
  contenido: z.string().trim().min(1, 'El contenido no puede estar vacío').max(2000, 'Máximo 2000 caracteres'),
});

export const queryMensajesSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(50),
});

export type CrearConversacionInput = z.infer<typeof crearConversacionSchema>;
export type EnviarMensajeInput = z.infer<typeof enviarMensajeSchema>;
export type QueryMensajesInput = z.infer<typeof queryMensajesSchema>;