import { Request, Response, NextFunction } from 'express';
import { ContactService } from './contact.service';
import { ApiResponse, PaginatedResponse } from '@ai-crm/shared';
import { IContact } from './contact.model';

export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  index = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
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
      const response: PaginatedResponse<IContact> = {
        success: true,
        data: result,
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  };

  show = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contact = await this.contactService.findById(req.params.id as string);
      const response: ApiResponse<IContact> = {
        success: true,
        data: contact,
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  };

  store = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contact = await this.contactService.create(req.body);
      const response: ApiResponse<IContact> = {
        success: true,
        data: contact,
        message: 'Contact created',
      };
      res.status(201).json(response);
    } catch (err) {
      next(err);
    }
  };

  update = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const contact = await this.contactService.update(req.params.id as string, req.body);
      const response: ApiResponse<IContact> = {
        success: true,
        data: contact,
        message: 'Contact updated',
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  };

  destroy = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      await this.contactService.delete(req.params.id as string);
      const response: ApiResponse<null> = {
        success: true,
        data: null,
        message: 'Contact deleted',
      };
      res.json(response);
    } catch (err) {
      next(err);
    }
  };
}
