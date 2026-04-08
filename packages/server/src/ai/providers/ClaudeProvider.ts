import Anthropic from '@anthropic-ai/sdk';
import {
  IAiProvider,
  AiCompletionRequest,
  AiCompletionResponse,
} from './IAiProvider';
import { AiError } from '../errors/AiError';
import { AiRateLimitError } from '../errors/AiRateLimitError';

export class ClaudeProvider implements IAiProvider {
  private readonly client: Anthropic;
  private readonly model: string;

  constructor(apiKey: string, model = 'claude-sonnet-4-6') {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async complete(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    const startTime = Date.now();

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: request.maxTokens ?? 1024,
        ...(request.system && { system: request.system }),
        messages: request.messages,
        ...(request.temperature !== undefined && { temperature: request.temperature }),
        ...(request.tools && {
          tools: request.tools.map((t) => ({
            name: t.name,
            description: t.description,
            input_schema: t.inputSchema as Anthropic.Tool['input_schema'],
          })),
        }),
      });

      const latencyMs = Date.now() - startTime;

      const textContent = response.content
        .filter((block): block is Anthropic.TextBlock => block.type === 'text')
        .map((block) => block.text)
        .join('');

      const toolCalls = response.content
        .filter((block): block is Anthropic.ToolUseBlock => block.type === 'tool_use')
        .map((block) => ({
          id: block.id,
          name: block.name,
          input: block.input as Record<string, unknown>,
        }));

      return {
        content: textContent,
        ...(toolCalls.length > 0 && { toolCalls }),
        stopReason: response.stop_reason === 'tool_use' ? 'tool_use' : 'end_turn',
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        model: response.model,
        latencyMs,
      };
    } catch (error: unknown) {
      if (error instanceof Anthropic.APIError) {
        if (error.status === 429) {
          const retryAfter = this.parseRetryAfter(error.headers);
          throw new AiRateLimitError(this.model, retryAfter);
        }
        throw new AiError(
          `Claude API error: ${error.message}`,
          this.model,
          error.status ?? 502,
        );
      }

      throw new AiError('Network error communicating with Claude', this.model);
    }
  }

  getName(): string {
    return this.model;
  }

  private parseRetryAfter(headers: Headers | undefined): number {
    const value = headers?.get('retry-after');
    if (value) {
      const seconds = parseInt(value, 10);
      if (!isNaN(seconds)) {
        return seconds * 1000;
      }
    }
    return 5000;
  }
}
