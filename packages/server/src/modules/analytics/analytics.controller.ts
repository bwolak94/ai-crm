import { Request, Response } from 'express';
import { AnalyticsService } from './analytics.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';

export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  index = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const days = parseInt(req.query.days as string, 10) || 30;
    const data = await this.analyticsService.getAnalytics(req.user!.userId, days);
    sendSuccess(res, data);
  });
}
