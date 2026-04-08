import { AppError } from '../../shared/errors/AppError';

export class AiError extends AppError {
  public readonly provider: string;

  constructor(message: string, provider: string, statusCode = 502) {
    super(message, statusCode);
    this.provider = provider;
    Object.setPrototypeOf(this, AiError.prototype);
  }
}
