import { ErrorRequestHandler } from 'express';
import pino from 'pino';
import { AppError } from '../errors/AppError';
import { env } from '../../config/env';

const logger = pino({ name: 'errorHandler' });

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors && { errors: err.errors }),
    });
    return;
  }

  // Mongoose CastError (invalid ObjectId etc.)
  if (err.name === 'CastError') {
    res.status(400).json({
      success: false,
      message: `Invalid value for ${err.path}: ${err.value}`,
    });
    return;
  }

  // Mongoose ValidationError
  if (err.name === 'ValidationError' && err.errors && typeof err.errors === 'object') {
    const errors = Object.values(err.errors).map((e: any) => ({
      field: e.path as string,
      message: e.message as string,
    }));
    res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
    return;
  }

  // MongoDB duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern ?? {})[0] ?? 'unknown';
    res.status(409).json({
      success: false,
      message: `Duplicate value for field: ${field}`,
    });
    return;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      success: false,
      message: 'Invalid token',
    });
    return;
  }

  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      success: false,
      message: 'Token expired',
    });
    return;
  }

  logger.error({ err }, 'Unhandled error');

  res.status(500).json({
    success: false,
    message: env.NODE_ENV === 'production' ? 'Internal server error' : (err as Error).message,
  });
};
