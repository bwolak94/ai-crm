import mongoose from 'mongoose';
import pino from 'pino';
import { env } from './env';

const logger = pino({ name: 'database' });

export async function connectDB(): Promise<void> {
  const maxRetries = 5;
  let retries = 0;

  mongoose.set('debug', env.NODE_ENV === 'development');

  mongoose.connection.on('connected', () => {
    logger.info('MongoDB connected');
  });

  mongoose.connection.on('error', (err) => {
    logger.error({ err }, 'MongoDB connection error');
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });

  while (retries < maxRetries) {
    try {
      await mongoose.connect(env.MONGODB_URI);
      return;
    } catch (err) {
      retries++;
      logger.error({ err, attempt: retries }, `MongoDB connection attempt ${retries}/${maxRetries} failed`);
      if (retries >= maxRetries) {
        throw new Error('Failed to connect to MongoDB after maximum retries');
      }
      const delay = Math.pow(2, retries) * 1000;
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}
