import { Types } from 'mongoose';
import { ContactModel } from '../contacts/contact.model';
import { DealModel } from '../deals/deal.model';
import { ActivityModel } from '../activities/activity.model';
import { AiUsageModel } from '../../ai/AiUsageTracker';

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
  createdAt: Date;
}

export interface AnalyticsData {
  kpis: KpiData;
  contactsByStatus: StatusCount[];
  dealsByStage: StageCount[];
  aiUsageLast30Days: DailyAiUsage[];
  recentActivities: RecentActivity[];
}

export class AnalyticsService {
  async getAnalytics(ownerId: string, days: number = 30): Promise<AnalyticsData> {
    const ownerObjectId = new Types.ObjectId(ownerId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysAgo = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const [
      kpis,
      contactsByStatus,
      dealsByStage,
      aiUsageLast30Days,
      recentActivities,
    ] = await Promise.all([
      this.getKpis(ownerObjectId, startOfMonth),
      this.getContactsByStatus(ownerObjectId),
      this.getDealsByStage(ownerObjectId),
      this.getAiUsage(ownerObjectId, daysAgo),
      this.getRecentActivities(ownerObjectId),
    ]);

    return {
      kpis,
      contactsByStatus,
      dealsByStage,
      aiUsageLast30Days,
      recentActivities,
    };
  }

  private async getKpis(ownerId: Types.ObjectId, startOfMonth: Date): Promise<KpiData> {
    const [
      totalContacts,
      newContactsThisMonth,
      totalDeals,
      pipelineAgg,
      scoreAgg,
      contactsAtRisk,
    ] = await Promise.all([
      ContactModel.countDocuments({ ownerId, deletedAt: null }),
      ContactModel.countDocuments({ ownerId, deletedAt: null, createdAt: { $gte: startOfMonth } }),
      DealModel.countDocuments({ ownerId, deletedAt: null }),
      DealModel.aggregate([
        {
          $match: {
            ownerId,
            deletedAt: null,
            stage: { $in: ['discovery', 'proposal', 'negotiation'] },
          },
        },
        { $group: { _id: null, total: { $sum: '$value' } } },
      ]),
      ContactModel.aggregate([
        { $match: { ownerId, deletedAt: null, 'aiScore.value': { $exists: true } } },
        { $group: { _id: null, avg: { $avg: '$aiScore.value' } } },
      ]),
      ContactModel.countDocuments({ ownerId, deletedAt: null, sentiment: 'at-risk' }),
    ]);

    return {
      totalContacts,
      newContactsThisMonth,
      totalDeals,
      pipelineValue: pipelineAgg[0]?.total ?? 0,
      avgAiScore: Math.round(scoreAgg[0]?.avg ?? 0),
      contactsAtRisk,
    };
  }

  private async getContactsByStatus(ownerId: Types.ObjectId): Promise<StatusCount[]> {
    return ContactModel.aggregate([
      { $match: { ownerId, deletedAt: null } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $project: { _id: 0, status: '$_id', count: 1 } },
      { $sort: { count: -1 } },
    ]);
  }

  private async getDealsByStage(ownerId: Types.ObjectId): Promise<StageCount[]> {
    return DealModel.aggregate([
      { $match: { ownerId, deletedAt: null } },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
        },
      },
      { $project: { _id: 0, stage: '$_id', count: 1, totalValue: 1 } },
    ]);
  }

  private async getAiUsage(ownerId: Types.ObjectId, since: Date): Promise<DailyAiUsage[]> {
    return AiUsageModel.aggregate([
      { $match: { ownerId, createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            $dateToString: { format: '%Y-%m-%d', date: '$createdAt' },
          },
          calls: { $sum: 1 },
          tokensUsed: { $sum: '$totalTokens' },
          estimatedCost: { $sum: '$estimatedCostUsd' },
        },
      },
      { $project: { _id: 0, date: '$_id', calls: 1, tokensUsed: 1, estimatedCost: 1 } },
      { $sort: { date: 1 } },
    ]);
  }

  private async getRecentActivities(ownerId: Types.ObjectId): Promise<RecentActivity[]> {
    return ActivityModel.aggregate([
      { $match: { ownerId } },
      { $sort: { createdAt: -1 } },
      { $limit: 20 },
      {
        $lookup: {
          from: 'contacts',
          localField: 'contactId',
          foreignField: '_id',
          as: 'contact',
        },
      },
      { $unwind: { path: '$contact', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          type: 1,
          title: 1,
          contactId: 1,
          contactName: '$contact.name',
          createdAt: 1,
        },
      },
    ]);
  }
}
