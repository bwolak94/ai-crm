import { createApp } from './app';
import { connectDB } from './config/database';
import { env } from './config/env';
import pino from 'pino';

const logger = pino({ name: 'server' });

async function main(): Promise<void> {
  await connectDB();

  const app = createApp();

  app.listen(env.PORT, () => {
    logger.info({ port: env.PORT, env: env.NODE_ENV }, `Server running on port ${env.PORT}`);
  });
}

main().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
