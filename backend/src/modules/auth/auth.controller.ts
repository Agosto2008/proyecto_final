import type { CookieOptions, Request, Response } from 'express';
import { env } from '../../config/env.js';
import { contextoDe } from '../../shared/utils/request-context.js';
import type { LoginInput, RegistroInput } from './auth.schemas.js';
import * as service from './auth.service.js';

const COOKIE_REFRESH = 'refresh_token';

// httpOnly: JavaScript del navegador no puede leerla (protege contra robo por XSS).
// path: la cookie solo viaja hacia /api/auth, no hacia el resto de la API.
const opcionesCookie: CookieOptions = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/api/auth',
};

function guardarRefreshCookie(res: Response, refreshToken: string): void {
  res.cookie(COOKIE_REFRESH, refreshToken, {
    ...opcionesCookie,
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000,
  });
}

export async function registro(req: Request, res: Response): Promise<void> {
  const body = res.locals.validated.body as RegistroInput;
  const resultado = await service.registrar(body, contextoDe(req));
  res.status(201).json(resultado);
}

export async function login(req: Request, res: Response): Promise<void> {
  const body = res.locals.validated.body as LoginInput;
  const { sesion, usuario } = await service.iniciarSesion(body, contextoDe(req));
  guardarRefreshCookie(res, sesion.refreshToken);
  res.json({
    accessToken: sesion.accessToken,
    tokenType: 'Bearer',
    expiresIn: sesion.expiresIn,
    usuario,
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const cookie = req.cookies?.[COOKIE_REFRESH] as string | undefined;
  try {
    const sesion = await service.renovarSesion(cookie, contextoDe(req));
    guardarRefreshCookie(res, sesion.refreshToken);
    res.json({ accessToken: sesion.accessToken, tokenType: 'Bearer', expiresIn: sesion.expiresIn });
  } catch (error) {
    res.clearCookie(COOKIE_REFRESH, opcionesCookie); // la cookie ya no sirve
    throw error;
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const cookie = req.cookies?.[COOKIE_REFRESH] as string | undefined;
  await service.cerrarSesion(cookie, contextoDe(req));
  res.clearCookie(COOKIE_REFRESH, opcionesCookie);
  res.status(204).end();
}

export async function me(req: Request, res: Response): Promise<void> {
  // authenticate ya garantizó que req.user existe
  const usuario = await service.obtenerPerfilActual(req.user!.id);
  res.json({ usuario });
}