import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { routes } from './routes.js';
import { requestLogger } from './shared/middlewares/request-logger.js';
import { errorHandler, notFoundHandler } from './shared/middlewares/error-handler.js';

export const app = express();

app.disable('x-powered-by');
app.use(requestLogger);
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use('/api', routes);

// Siempre al final y en este orden: primero el 404, luego el manejador de errores
app.use(notFoundHandler);
app.use(errorHandler);