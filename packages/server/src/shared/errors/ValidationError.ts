import { ZodIssue } from 'zod';
import { AppError } from './AppError';

export class ValidationError extends AppError {
  constructor(issues: ZodIssue[]) {
    const errors = issues.map((issue) => ({
      field: issue.path.join('.'),
      message: issue.message,
    }));
    super('Validation failed', 422, true, errors);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
