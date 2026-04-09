import { api } from '@/shared/lib/axios';
import type { ApiResponse } from '@ai-crm/shared';

interface KpiData {
  totalContacts: number;
  newContactsThisMonth: number;
  totalDeals: number;
  pipelineValue: number;
  avgAiScore: number;
  contactsAtRisk: number;
}

interface StatusCount {
  status: string;
  count: number;
}

interface StageCount {
  stage: string;
  count: number;
  totalValue: number;
}

interface DailyAiUsage {
  date: string;
  calls: number;
  tokensUsed: number;
  estimatedCost: number;
}

interface RecentActivity {
  _id: string;
  type: string;
  title: string;
  contactId: string;
  contactName: string;
  createdAt: string;
}

export interface AnalyticsData {
  kpis: KpiData;
  contactsByStatus: StatusCount[];
  dealsByStage: StageCount[];
  aiUsageLast30Days: DailyAiUsage[];
  recentActivities: RecentActivity[];
}

export const analyticsApi = {
  get: async (days: number = 30): Promise<AnalyticsData> => {
    const res = await api.get<ApiResponse<AnalyticsData>>('/api/analytics', {
      params: { days },
    });
    return res.data.data;
  },
};
