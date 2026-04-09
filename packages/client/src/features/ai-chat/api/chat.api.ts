import { api } from '@/shared/lib/axios';
import type { ApiResponse, AiChatMessage } from '@ai-crm/shared';

export interface StructuredData {
  type: 'contacts' | 'pipeline' | 'contact_detail';
  payload: unknown;
  toolUsed?: string;
}

export interface AiChatResponse {
  content: string;
  data?: StructuredData;
  toolsUsed?: string[];
}

interface ServerChatResponse {
  message: string;
  data?: {
    type: 'contacts' | 'pipeline' | 'contact_detail';
    payload: unknown;
  };
  toolsUsed: string[];
}

export const chatApi = {
  send: async (messages: AiChatMessage[]): Promise<AiChatResponse> => {
    const res = await api.post<ApiResponse<ServerChatResponse>>('/api/ai/chat', {
      messages,
    });
    const raw = res.data.data;

    return {
      content: raw.message,
      data: raw.data
        ? {
            type: raw.data.type,
            payload: raw.data.payload,
            toolUsed: raw.toolsUsed?.[0],
          }
        : undefined,
      toolsUsed: raw.toolsUsed,
    };
  },
};
