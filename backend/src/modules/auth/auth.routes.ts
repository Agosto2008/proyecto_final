import { Router } from 'express';
import { authenticate } from '../../shared/middlewares/auth.js';
import { loginLimiter, refreshLimiter, registroLimiter } from '../../shared/middlewares/rate-limit.js';
import { validate } from '../../shared/middlewares/validate.js';
import { asyncHandler } from '../../shared/utils/async-handler.js';
import * as controller from './auth.controller.js';
import { loginSchema, registroSchema } from './auth.schemas.js';

export const authRouter = Router();

authRouter.post('/registro', registroLimiter, validate({ body: registroSchema }), asyncHandler(controller.registro));
authRouter.post('/login', loginLimiter, validate({ body: loginSchema }), asyncHandler(controller.login));
authRouter.post('/refresh', refreshLimiter, asyncHandler(controller.refresh));
authRouter.post('/logout', asyncHandler(controller.logout));
authRouter.get('/me', authenticate, asyncHandler(controller.me));

