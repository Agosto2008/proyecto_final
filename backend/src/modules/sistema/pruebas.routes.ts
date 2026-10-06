// ARCHIVO TEMPORAL: solo para comprobar el PASO 5. Se borra al terminar.
import { Router } from 'express';
import { z } from 'zod';
import { pool } from '../../database/pool.js';
import { NotFoundError } from '../../shared/errors/app-error.js';
import { validate } from '../../shared/middlewares/validate.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';

export const pruebasRouter = Router();

const crearSchema = z.object({
  email: z.string().email(),
  edad: z.coerce.number().int().min(5).max(60),
  password: z.string().min(8),
});

// 1) Validación con Zod
pruebasRouter.post('/validar', validate({ body: crearSchema }), (_req, res) => {
  const datos = res.locals.validated.body as z.infer<typeof crearSchema>;
  res.json({ ok: true, email: datos.email, edad: datos.edad });
});

// 2) Error controlado (AppError)
pruebasRouter.get('/error-controlado', () => {
  throw new NotFoundError('Este jugador no existe');
});

// 3) Error inesperado (un bug)
pruebasRouter.get('/error-inesperado', () => {
  throw new Error('Detalle interno que el cliente NO debe ver: contraseña de BD = xyz');
});

// 4) Error de MySQL: país duplicado (viola UNIQUE; no modifica datos)
pruebasRouter.get(
  '/error-sql',
  asyncHandler(async () => {
    await pool.query(
      "INSERT INTO paises (nombre, codigo_iso) VALUES ('Guatemala', 'GTM')",
    );
  }),
);