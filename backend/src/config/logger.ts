import { pino } from 'pino';
import { env } from './env.js';

export const logger = pino({
  level: env.LOG_LEVEL,
  // Nunca registrar credenciales ni datos sensibles en los logs
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'res.headers["set-cookie"]',
      'password',
      'password_hash',
      'refresh_token',
      '*.password',
      '*.password_hash',
      '*.refresh_token',
    ],
    censor: '[REDACTED]',
  },
  // En desarrollo: logs legibles y con color. En producción: JSON puro.
  ...(env.NODE_ENV === 'development'
    ? {
        transport: {
          target: 'pino-pretty',
          options: { colorize: true, translateTime: 'SYS:HH:MM:ss', ignore: 'pid,hostname' },
        },
      }
    : {}),
});