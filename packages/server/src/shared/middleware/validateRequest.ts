import { RequestHandler } from 'express';
import { ZodSchema } from 'zod';
import { ValidationError } from '../errors/ValidationError';

export function validateRequest(schema: ZodSchema): RequestHandler {
  return (req, _res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      return next(new ValidationError(result.error.issues));
    }
    req.body = result.data;
    next();
  };
}
