import {
  IAiProvider,
  AiCompletionRequest,
  AiCompletionResponse,
} from './IAiProvider';

interface RecordedCall {
  request: AiCompletionRequest;
  response: AiCompletionResponse;
  timestamp: Date;
}

export class MockAiProvider implements IAiProvider {
  public readonly calls: RecordedCall[] = [];

  constructor(private readonly mockResponses: Map<string, string> = new Map()) {}

  async complete(request: AiCompletionRequest): Promise<AiCompletionResponse> {
    const startTime = Date.now();

    const lastUserMessage = [...request.messages]
      .reverse()
      .find((m) => m.role === 'user');
    const key = (lastUserMessage?.content ?? '').slice(0, 50);

    const content = this.mockResponses.get(key) ?? '{"result": "mock response"}';

    const response: AiCompletionResponse = {
      content,
      stopReason: 'end_turn',
      usage: { inputTokens: 100, outputTokens: 50 },
      model: 'mock-model',
      latencyMs: Date.now() - startTime,
    };

    this.calls.push({ request, response, timestamp: new Date() });

    return response;
  }

  getName(): string {
    return 'mock-model';
  }
}
