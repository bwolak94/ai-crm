import { ContactCreate, ContactUpdate, ContactFiltersInput, PaginatedData } from '@ai-crm/shared';
import { IContactRepository } from './contact.repository';
import { IContact } from './contact.model';
import { ConflictError } from '../../shared/errors/ConflictError';
import { NotFoundError } from '../../shared/errors/NotFoundError';

export class ContactService {
  constructor(private readonly contactRepository: IContactRepository) {}

  async getAll(ownerId: string, filters: ContactFiltersInput): Promise<PaginatedData<IContact>> {
    return this.contactRepository.findAll(ownerId, filters);
  }

  async getById(id: string, ownerId: string): Promise<IContact> {
    const contact = await this.contactRepository.findById(id, ownerId);
    if (!contact) {
      throw new NotFoundError('Contact');
    }
    return contact;
  }

  async create(ownerId: string, data: ContactCreate): Promise<IContact> {
    const existing = await this.contactRepository.findByEmail(data.email, ownerId);
    if (existing) {
      throw new ConflictError('Contact with this email already exists');
    }
    return this.contactRepository.create({ ...data, ownerId });
  }

  async update(id: string, ownerId: string, data: ContactUpdate): Promise<IContact> {
    await this.getById(id, ownerId);

    if (data.email) {
      const existing = await this.contactRepository.findByEmail(data.email, ownerId);
      if (existing && String(existing._id) !== id) {
        throw new ConflictError('Contact with this email already exists');
      }
    }

    const updated = await this.contactRepository.update(id, ownerId, data);
    if (!updated) {
      throw new NotFoundError('Contact');
    }
    return updated;
  }

  async delete(id: string, ownerId: string): Promise<void> {
    await this.getById(id, ownerId);
    await this.contactRepository.softDelete(id, ownerId);
  }

  async bulkUpdateStatus(
    ids: string[],
    ownerId: string,
    status: string,
  ): Promise<{ updated: number }> {
    const updated = await this.contactRepository.bulkUpdateStatus(ids, ownerId, status);
    return { updated };
  }
}
