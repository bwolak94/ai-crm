import { api } from '@/shared/lib/axios';
import type { ApiResponse, AiScore } from '@ai-crm/shared';

export interface ScoringHistoryEntry extends AiScore {
  model?: string;
}

export interface FollowUpResult {
  subject: string;
  body: string;
  keyPoints: string[];
  callToAction: string;
}

export interface SentimentResult {
  sentiment: 'positive' | 'neutral' | 'at-risk';
  confidence: number;
  reasoning: string;
  flags: string[];
}

export interface SentimentHistoryEntry extends SentimentResult {
  activityId: string;
  createdAt: string;
}

export interface BatchScoringResult {
  succeeded: number;
  failed: number;
  errors: Array<{ contactId: string; message: string }>;
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
      `/api/contacts/${contactId}/score-history`,
    );
    return res.data.data;
  },

  triggerScoring: async (contactId: string): Promise<AiScore> => {
    const res = await api.post<ApiResponse<AiScore>>(
      `/api/contacts/${contactId}/score`,
    );
    return res.data.data;
  },

  triggerBulkScoring: async (contactIds: string[]): Promise<BatchScoringResult> => {
    const res = await api.post<ApiResponse<BatchScoringResult>>(
      '/api/ai/score/bulk',
      { contactIds },
    );
    return res.data.data;
  },

  generateFollowUp: async (
    contactId: string,
    tone: 'professional' | 'friendly' | 'urgent',
    dealId?: string,
  ): Promise<FollowUpResult> => {
    const res = await api.post<ApiResponse<FollowUpResult>>(
      `/api/contacts/${contactId}/follow-up`,
      { tone, dealId },
    );
    return res.data.data;
  },

  analyzeSentiment: async (contactId: string): Promise<SentimentResult[]> => {
    const res = await api.post<ApiResponse<SentimentResult[]>>(
      `/api/contacts/${contactId}/analyze-sentiment`,
    );
    return res.data.data;
  },

  getSentimentHistory: async (contactId: string): Promise<SentimentHistoryEntry[]> => {
    const res = await api.get<ApiResponse<SentimentHistoryEntry[]>>(
      `/api/contacts/${contactId}/sentiment-history`,
    );
    return res.data.data;
  },

  getUsage: async (): Promise<AiUsageData> => {
    const res = await api.get<ApiResponse<AiUsageData>>('/api/ai/usage');
    return res.data.data;
  },
};
