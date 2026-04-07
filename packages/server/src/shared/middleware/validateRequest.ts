import { RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../errors/ValidationError';

export function validateRequest(
  schema: ZodSchema,
  source: 'body' | 'query' | 'params' = 'body',
): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      return next(new ValidationError(result.error.issues));
    }
    req[source] = result.data;
    next();
  };
}
