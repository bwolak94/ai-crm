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
}

export const chatApi = {
  send: async (messages: AiChatMessage[]): Promise<AiChatResponse> => {
    const res = await api.post<ApiResponse<AiChatResponse>>('/api/ai/chat', {
      messages,
    });
    return res.data.data;
  },
};
