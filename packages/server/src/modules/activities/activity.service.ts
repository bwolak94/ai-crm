import { ActivityCreate, ActivityUpdate, ActivityFiltersInput, PaginatedData } from '@ai-crm/shared';
import { IActivityRepository } from './activity.repository';
import { IActivity } from './activity.model';
import { IContactRepository } from '../contacts/contact.repository';
import { IDealRepository } from '../deals/deal.repository';
import { NotFoundError } from '../../shared/errors/NotFoundError';

export class ActivityService {
  constructor(
    private readonly activityRepository: IActivityRepository,
    private readonly contactRepository: IContactRepository,
    private readonly dealRepository: IDealRepository,
  ) {}

  async getTimeline(
    contactId: string,
    ownerId: string,
    filters: ActivityFiltersInput,
  ): Promise<PaginatedData<IActivity>> {
    await this.ensureContactExists(contactId, ownerId);
    return this.activityRepository.findByContact(contactId, ownerId, filters);
  }

  async getByDeal(dealId: string, ownerId: string): Promise<IActivity[]> {
    await this.ensureDealExists(dealId, ownerId);
    return this.activityRepository.findByDeal(dealId, ownerId);
  }

  async create(ownerId: string, data: ActivityCreate): Promise<IActivity> {
    await this.ensureContactExists(data.contactId, ownerId);

    if (data.dealId) {
      await this.ensureDealExists(data.dealId, ownerId);
    }

    return this.activityRepository.create({ ...data, ownerId });
  }

  async update(id: string, ownerId: string, data: ActivityUpdate): Promise<IActivity> {
    const updated = await this.activityRepository.update(id, ownerId, data);
    if (!updated) {
      throw new NotFoundError('Activity');
    }
    return updated;
  }

  async delete(id: string, ownerId: string): Promise<void> {
    const deleted = await this.activityRepository.delete(id, ownerId);
    if (!deleted) {
      throw new NotFoundError('Activity');
    }
  }

  private async ensureContactExists(contactId: string, ownerId: string): Promise<void> {
    const contact = await this.contactRepository.findById(contactId, ownerId);
    if (!contact) {
      throw new NotFoundError('Contact');
    }
  }

  private async ensureDealExists(dealId: string, ownerId: string): Promise<void> {
    const deal = await this.dealRepository.findById(dealId, ownerId);
    if (!deal) {
      throw new NotFoundError('Deal');
    }
  }
}
