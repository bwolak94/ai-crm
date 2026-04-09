import pino from 'pino';
import { IAiProvider, AiCompletionRequest, AiCompletionResponse } from './providers/IAiProvider';
import { AiUsageTracker } from './AiUsageTracker';
import { AiRateLimitError } from './errors/AiRateLimitError';
import { AiError } from './errors/AiError';

const logger = pino({ name: 'ai-client' });

const MAX_RETRIES = 3;
const TIMEOUT_MS = 60_000;

interface AiCallContext {
  feature: string;
  ownerId: string;
  entityId?: string;
}

export class AiClient {
  private readonly enabled: boolean;

  constructor(
    private readonly provider: IAiProvider,
    private readonly usageTracker: AiUsageTracker,
    enabled = true,
  ) {
    this.enabled = enabled;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  async complete(
    request: AiCompletionRequest,
    context: AiCallContext,
  ): Promise<AiCompletionResponse> {
    if (!this.enabled) {
      throw new AiError(
        'AI features are not configured. Set ENABLE_AI=true and provide an ANTHROPIC_API_KEY.',
        'none',
        503,
      );
    }

    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        logger.info(
          { feature: context.feature, attempt, provider: this.provider.getName() },
          'AI request started',
        );

        const response = await this.withTimeout(
          this.provider.complete(request),
          TIMEOUT_MS,
        );

        logger.info(
          {
            feature: context.feature,
            latencyMs: response.latencyMs,
            inputTokens: response.usage.inputTokens,
            outputTokens: response.usage.outputTokens,
          },
          'AI request completed',
        );

        this.usageTracker.record(response, context.feature, context.ownerId, context.entityId);

        return response;
      } catch (error: unknown) {
        lastError = error as Error;

        if (error instanceof AiRateLimitError && attempt < MAX_RETRIES) {
          const delay = Math.min(error.retryAfterMs, 1000 * Math.pow(2, attempt));
          logger.warn(
            { attempt, delayMs: delay, feature: context.feature },
            'Rate limited, retrying',
          );
          await this.sleep(delay);
          continue;
        }

        break;
      }
    }

    logger.error(
      { err: lastError, feature: context.feature },
      'AI request failed after all retries',
    );

    if (lastError instanceof AiError) {
      throw lastError;
    }
    throw new AiError(
      `AI request failed: ${lastError?.message ?? 'Unknown error'}`,
      this.provider.getName(),
    );
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    let timer: ReturnType<typeof setTimeout>;
    const timeout = new Promise<never>((_resolve, reject) => {
      timer = setTimeout(
        () => reject(new AiError('AI request timed out', this.provider.getName(), 504)),
        ms,
      );
    });
    try {
      return await Promise.race([promise, timeout]);
    } finally {
      clearTimeout(timer!);
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
