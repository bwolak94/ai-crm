import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { asyncHandler } from '../shared/utils/asyncHandler';
import { sendSuccess } from '../shared/utils/response';
import { authenticate } from '../shared/middleware/authenticate';
import { AiUsageModel } from './AiUsageTracker';

interface UsageSummary {
  feature: string;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
}

export function createAiRoutes(): Router {
  const router = Router();

  router.use(authenticate);

  router.get(
    '/usage',
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const stats = await AiUsageModel.aggregate<UsageSummary>([
        {
          $match: {
            ownerId: new mongoose.Types.ObjectId(req.user!.userId),
            createdAt: { $gte: thirtyDaysAgo },
          },
        },
        {
          $group: {
            _id: '$feature',
            totalRequests: { $sum: 1 },
            totalInputTokens: { $sum: '$inputTokens' },
            totalOutputTokens: { $sum: '$outputTokens' },
            totalTokens: { $sum: '$totalTokens' },
            totalCostUsd: { $sum: '$estimatedCostUsd' },
          },
        },
        {
          $project: {
            _id: 0,
            feature: '$_id',
            totalRequests: 1,
            totalInputTokens: 1,
            totalOutputTokens: 1,
            totalTokens: 1,
            totalCostUsd: { $round: ['$totalCostUsd', 6] },
          },
        },
        { $sort: { totalCostUsd: -1 } },
      ]);

      sendSuccess(res, stats);
    }),
  );

  return router;
}
