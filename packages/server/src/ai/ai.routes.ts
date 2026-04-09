import { Router, Request, Response } from 'express';
import { z } from 'zod';
import mongoose from 'mongoose';
import { AiChatRequestSchema } from '@ai-crm/shared';
import { asyncHandler } from '../shared/utils/asyncHandler';
import { sendSuccess } from '../shared/utils/response';
import { authenticate } from '../shared/middleware/authenticate';
import { validateRequest } from '../shared/middleware/validateRequest';
import { aiLimiter } from '../shared/middleware/rateLimiter';
import { AiUsageModel } from './AiUsageTracker';
import { AiChatService } from './services/AiChatService';

interface UsageSummary {
  feature: string;
  totalRequests: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  totalTokens: number;
  totalCostUsd: number;
}

export function createAiRoutes(
  chatService: AiChatService,
  scoringService?: { scoreBatch: (ids: string[], ownerId: string) => Promise<unknown> },
): Router {
  const router = Router();

  router.use(authenticate);

  router.post(
    '/chat',
    aiLimiter,
    validateRequest(AiChatRequestSchema),
    asyncHandler(async (req: Request, res: Response): Promise<void> => {
      const result = await chatService.chat(req.body, req.user!.userId);
      sendSuccess(res, result);
    }),
  );

  if (scoringService) {
    const BulkScoreSchema = z.object({
      contactIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).min(1).max(100),
    });

    router.post(
      '/score/bulk',
      validateRequest(BulkScoreSchema),
      asyncHandler(async (req: Request, res: Response): Promise<void> => {
        const result = await scoringService.scoreBatch(req.body.contactIds, req.user!.userId);
        sendSuccess(res, result);
      }),
    );
  }

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
