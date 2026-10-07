import { z } from 'zod';
import { parseFechaISO } from '../../shared/utils/fechas.js';

const fecha = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato AAAA-MM-DD')
  .refine((v) => parseFechaISO(v) !== null, 'La fecha no existe');

export const listarAuditoriaSchema = z.object({
  pagina: z.coerce.number().int().min(1).default(1),
  limite: z.coerce.number().int().min(1).max(100).default(20),
  accion: z.string().trim().min(1).max(100).optional(),
  entidad: z.string().trim().min(1).max(100).optional(),
  usuario_id: z
    .string()
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, 'UUID inválido')
    .optional(),
  desde: fecha.optional(),
  hasta: fecha.optional(),
});

export type ListarAuditoriaInput = z.infer<typeof listarAuditoriaSchema>;