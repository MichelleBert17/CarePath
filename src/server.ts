import app from './app';
import { config } from './config/env';
import { logger } from './config/logger';
import prisma from './config/database';

const start = async (): Promise<void> => {
  try {
    await prisma.$connect();
    logger.info('Database connected');

    app.listen(config.port, () => {
      logger.info(`CarePath API running on port ${config.port} [${config.nodeEnv}]`);
    });
  } catch (err) {
    logger.error('Failed to start server', { err });
    await prisma.$disconnect();
    process.exit(1);
  }
};

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received — shutting down');
  await prisma.$disconnect();
  process.exit(0);
});

start();
