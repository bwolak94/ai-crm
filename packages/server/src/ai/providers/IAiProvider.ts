export interface AiCompletionRequest {
  system?: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  maxTokens?: number;
  temperature?: number;
  tools?: AiTool[];
}

export interface AiCompletionResponse {
  content: string;
  toolCalls?: AiToolCall[];
  stopReason: 'end_turn' | 'tool_use';
  usage: { inputTokens: number; outputTokens: number };
  model: string;
  latencyMs: number;
}

export interface AiTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

export interface AiToolCall {
  id: string;
  name: string;
  input: Record<string, unknown>;
}

export interface IAiProvider {
  complete(request: AiCompletionRequest): Promise<AiCompletionResponse>;
  getName(): string;
}
