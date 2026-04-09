import { api } from '@/shared/lib/axios';
import type { ApiResponse, AiScore } from '@ai-crm/shared';

export interface ScoringHistoryEntry extends AiScore {
  model?: string;
}

export interface AiUsageData {
  totalTokens: number;
  estimatedCost: number;
  breakdown: { feature: string; tokens: number; cost: number }[];
  period: string;
}

export const aiApi = {
  getScoreHistory: async (contactId: string): Promise<ScoringHistoryEntry[]> => {
    const res = await api.get<ApiResponse<ScoringHistoryEntry[]>>(
      `/api/contacts/${contactId}/scores`,
    );
    return res.data.data;
  },

  triggerScoring: async (contactId: string): Promise<AiScore> => {
    const res = await api.post<ApiResponse<AiScore>>(
      `/api/contacts/${contactId}/score`,
    );
    return res.data.data;
  },

  triggerBulkScoring: async (contactIds: string[]): Promise<{ jobId: string }> => {
    const res = await api.post<ApiResponse<{ jobId: string }>>(
      '/api/ai/score/bulk',
      { contactIds },
    );
    return res.data.data;
  },

  getUsage: async (): Promise<AiUsageData> => {
    const res = await api.get<ApiResponse<AiUsageData>>('/api/ai/usage');
    return res.data.data;
  },
};
