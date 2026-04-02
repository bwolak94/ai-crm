import { ErrorRequestHandler } from 'express';
import pino from 'pino';
import { AppError } from '../errors/AppError';
import { ValidationError } from '../errors/ValidationError';
import { env } from '../../config/env';

const logger = pino({ name: 'errorHandler' });

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ValidationError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');

  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : (err as Error).message,
  });
};
