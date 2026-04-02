import { ContactCreate, ContactUpdate, ContactFilters, Pagination, PaginatedData } from '@ai-crm/shared';
import { IContactRepository } from './contact.repository';
import { IContact } from './contact.model';
import { AppError } from '../../shared/errors/AppError';
import { NotFoundError } from '../../shared/errors/NotFoundError';

export class ContactService {
  constructor(private readonly contactRepository: IContactRepository) {}

  async findById(id: string): Promise<IContact> {
    const contact = await this.contactRepository.findById(id);
    if (!contact) {
      throw new NotFoundError('Contact');
    }
    return contact;
  }

  async findAll(filters: ContactFilters, pagination: Pagination): Promise<PaginatedData<IContact>> {
    return this.contactRepository.findAll(filters, pagination);
  }

  async create(data: ContactCreate): Promise<IContact> {
    const existing = await this.contactRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError('Contact with this email already exists', 409);
    }
    return this.contactRepository.create(data);
  }

  async update(id: string, data: ContactUpdate): Promise<IContact> {
    if (data.email) {
      const existing = await this.contactRepository.findByEmail(data.email);
      if (existing && String(existing._id) !== id) {
        throw new AppError('Contact with this email already exists', 409);
      }
    }

    const contact = await this.contactRepository.update(id, data);
    if (!contact) {
      throw new NotFoundError('Contact');
    }
    return contact;
  }

  async delete(id: string): Promise<void> {
    const deleted = await this.contactRepository.delete(id);
    if (!deleted) {
      throw new NotFoundError('Contact');
    }
  }
}
