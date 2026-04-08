import { Request, Response } from 'express';
import { DealService } from './deal.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';

export class DealController {
  constructor(private readonly dealService: DealService) {}

  index = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.dealService.getAll(req.user!.userId, req.query as never);
    sendPaginated(res, result);
  });

  show = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const deal = await this.dealService.getById(req.params.id as string, req.user!.userId);
    sendSuccess(res, deal);
  });

  store = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const deal = await this.dealService.create(req.user!.userId, req.body);
    sendSuccess(res, deal, 'Deal created', 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const deal = await this.dealService.update(req.params.id as string, req.user!.userId, req.body);
    sendSuccess(res, deal, 'Deal updated');
  });

  updateStage = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const deal = await this.dealService.updateStage(
      req.params.id as string,
      req.user!.userId,
      req.body.stage,
      req.user!.userId,
    );
    sendSuccess(res, deal, 'Stage updated');
  });

  destroy = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.dealService.delete(req.params.id as string, req.user!.userId);
    res.status(204).send();
  });

  pipeline = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.dealService.getPipelineView(req.user!.userId);
    sendSuccess(res, result);
  });
}
