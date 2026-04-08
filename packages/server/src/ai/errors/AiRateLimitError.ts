import { AiError } from './AiError';

export class AiRateLimitError extends AiError {
  public readonly retryAfterMs: number;

  constructor(provider: string, retryAfterMs = 5000) {
    super('AI provider rate limit exceeded', provider, 429);
    this.retryAfterMs = retryAfterMs;
    Object.setPrototypeOf(this, AiRateLimitError.prototype);
  }
}
