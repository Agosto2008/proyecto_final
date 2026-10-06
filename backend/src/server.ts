import { env } from './config/env.js';
import { logger } from './config/logger.js';
import { pool, verifyConnection } from './database/pool.js';
import { app } from './app.js';

async function main() {
  await verifyConnection();

  const server = app.listen(env.PORT, () => {
    logger.info(`FutureStar API escuchando en http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} recibido. Cerrando servidor...`);
    server.close(async () => {
      await pool.end();
      logger.info('Servidor y pool de MySQL cerrados.');
      process.exit(0);
    });
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

// Red de seguridad: errores que nadie capturó
process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Promesa rechazada sin capturar');
  process.exit(1);
});
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Excepción sin capturar');
  process.exit(1);
});

main().catch((error) => {
  logger.fatal({ err: error }, 'No se pudo iniciar el servidor');
  process.exit(1);
});