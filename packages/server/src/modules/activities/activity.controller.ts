import { Request, Response } from 'express';
import { ActivityService } from './activity.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';

export class ActivityController {
  constructor(private readonly activityService: ActivityService) {}

  index = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.activityService.getAll(req.user!.userId, req.query as never);
    sendPaginated(res, result);
  });

  timeline = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.activityService.getTimeline(
      req.params.contactId as string,
      req.user!.userId,
      req.query as never,
    );
    sendPaginated(res, result);
  });

  byDeal = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const activities = await this.activityService.getByDeal(
      req.params.dealId as string,
      req.user!.userId,
    );
    sendSuccess(res, activities);
  });

  store = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const data = { ...req.body, contactId: req.params.contactId as string };
    const activity = await this.activityService.create(req.user!.userId, data);
    sendSuccess(res, activity, 'Activity created', 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const activity = await this.activityService.update(
      req.params.id as string,
      req.user!.userId,
      req.body,
    );
    sendSuccess(res, activity, 'Activity updated');
  });

  destroy = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.activityService.delete(req.params.id as string, req.user!.userId);
    res.status(204).send();
  });
}
