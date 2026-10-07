import { z } from 'zod';
import { parseFechaISO } from '../../shared/utils/fechas.js';

const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(150, 'Máximo 150 caracteres')
  .pipe(z.email('Correo electrónico inválido'));

const passwordSchema = z
  .string()
  .min(8, 'La contraseña debe tener al menos 8 caracteres')
  .max(128, 'La contraseña no puede superar 128 caracteres');

const fechaNacimientoSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Usa el formato AAAA-MM-DD')
  .refine((v) => parseFechaISO(v) !== null, 'La fecha no existe')
  .refine((v) => v >= '1900-01-01', 'La fecha es demasiado antigua')
  .refine((v) => v <= new Date().toISOString().slice(0, 10), 'La fecha no puede ser futura');

export const registroSchema = z.object({
  nombre: z.string().trim().min(1, 'El nombre es obligatorio').max(100),
  apellido: z.string().trim().min(1, 'El apellido es obligatorio').max(100),
  email: emailSchema,
  password: passwordSchema,
  telefono: z
    .string()
    .trim()
    .regex(/^\+?[0-9\s-]{6,30}$/, 'Teléfono inválido')
    .optional(),
  fecha_nacimiento: fechaNacimientoSchema,
  pais_id: z.coerce.number().int().positive(),
  ciudad: z.string().trim().min(1).max(100).optional(),
  // ADMIN nunca se puede pedir desde el registro público
  rol: z.enum(['JUGADOR', 'CAZATALENTOS']),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es obligatoria').max(128),
});

export type RegistroInput = z.infer<typeof registroSchema>;
export type LoginInput = z.infer<typeof loginSchema>;