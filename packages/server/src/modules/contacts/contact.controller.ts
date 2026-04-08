import { Request, Response } from 'express';
import { ContactService } from './contact.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';

export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  index = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.contactService.getAll(req.user!.userId, req.query as never);
    sendPaginated(res, result);
  });

  show = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const contact = await this.contactService.getById(req.params.id as string, req.user!.userId);
    sendSuccess(res, contact);
  });

  store = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const contact = await this.contactService.create(req.user!.userId, req.body);
    sendSuccess(res, contact, 'Contact created', 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const contact = await this.contactService.update(req.params.id as string, req.user!.userId, req.body);
    sendSuccess(res, contact, 'Contact updated');
  });

  destroy = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.contactService.delete(req.params.id as string, req.user!.userId);
    res.status(204).send();
  });

  bulkStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { ids, status } = req.body;
    const result = await this.contactService.bulkUpdateStatus(ids, req.user!.userId, status);
    sendSuccess(res, result);
  });
}
