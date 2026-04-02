import { ZodIssue } from 'zod';
import { AppError } from './AppError';

export class ValidationError extends AppError {
  public readonly errors: ZodIssue[];

  constructor(errors: ZodIssue[]) {
    super('Validation failed', 422);
    this.errors = errors;
  }
}
