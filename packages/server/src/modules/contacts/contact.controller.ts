import { Request, Response } from 'express';
import { ContactService } from './contact.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess, sendPaginated } from '../../shared/utils/response';

export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  index = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { status, company, search, tags, page = '1', limit = '20', sortBy, sortOrder } = req.query;

    const filters = {
      status: status as string | undefined,
      company: company as string | undefined,
      search: search as string | undefined,
      tags: tags ? (tags as string).split(',') : undefined,
    };

    const pagination = {
      page: parseInt(page as string, 10),
      limit: Math.min(parseInt(limit as string, 10), 100),
      sortBy: sortBy as string | undefined,
      sortOrder: sortOrder as 'asc' | 'desc' | undefined,
    };

    const result = await this.contactService.findAll(filters, pagination);
    sendPaginated(res, result.items, result.total, result.page, result.limit);
  });

  show = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const contact = await this.contactService.findById(req.params.id as string);
    sendSuccess(res, contact);
  });

  store = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const contact = await this.contactService.create(req.body);
    sendSuccess(res, contact, 'Contact created', 201);
  });

  update = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const contact = await this.contactService.update(req.params.id as string, req.body);
    sendSuccess(res, contact, 'Contact updated');
  });

  destroy = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    await this.contactService.delete(req.params.id as string);
    sendSuccess(res, null, 'Contact deleted');
  });
}
