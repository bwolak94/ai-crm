import { ActivityCreate, ActivityUpdate, PaginatedData, ActivityFiltersInput } from '@ai-crm/shared';
import { FilterQuery } from 'mongoose';
import { ActivityModel, IActivity } from './activity.model';
import { buildPaginatedData } from '../../shared/utils/pagination';

export interface IActivityRepository {
  findAll(ownerId: string, filters: ActivityFiltersInput): Promise<PaginatedData<IActivity>>;
  findByContact(contactId: string, ownerId: string, filters: ActivityFiltersInput): Promise<PaginatedData<IActivity>>;
  findRecentByContact(contactId: string, ownerId: string, limit: number): Promise<IActivity[]>;
  findByDeal(dealId: string, ownerId: string): Promise<IActivity[]>;
  findById(id: string, ownerId: string): Promise<IActivity | null>;
  create(data: ActivityCreate & { ownerId: string }): Promise<IActivity>;
  update(id: string, ownerId: string, data: ActivityUpdate): Promise<IActivity | null>;
  delete(id: string, ownerId: string): Promise<boolean>;
}

export class MongoActivityRepository implements IActivityRepository {
  async findAll(ownerId: string, filters: ActivityFiltersInput): Promise<PaginatedData<IActivity>> {
    const query: FilterQuery<IActivity> = { ownerId };

    if (filters.type) {
      query.type = filters.type;
    }

    const skip = (filters.page - 1) * filters.limit;

    const [items, total] = await Promise.all([
      ActivityModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(filters.limit)
        .populate('contactId', 'name')
        .lean<IActivity[]>(),
      ActivityModel.countDocuments(query),
    ]);

    return buildPaginatedData(items, total, filters.page, filters.limit);
  }

  async findByContact(
    contactId: string,
    ownerId: string,
    filters: ActivityFiltersInput,
  ): Promise<PaginatedData<IActivity>> {
    const query: FilterQuery<IActivity> = { contactId, ownerId };

    if (filters.type) {
      query.type = filters.type;
    }

    const skip = (filters.page - 1) * filters.limit;

    const [items, total] = await Promise.all([
      ActivityModel.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(filters.limit)
        .lean<IActivity[]>(),
      ActivityModel.countDocuments(query),
    ]);

    return buildPaginatedData(items, total, filters.page, filters.limit);
  }

  async findRecentByContact(contactId: string, ownerId: string, limit: number): Promise<IActivity[]> {
    return ActivityModel.find({ contactId, ownerId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<IActivity[]>();
  }

  async findByDeal(dealId: string, ownerId: string): Promise<IActivity[]> {
    return ActivityModel.find({ dealId, ownerId })
      .sort({ createdAt: -1 })
      .lean<IActivity[]>();
  }

  async findById(id: string, ownerId: string): Promise<IActivity | null> {
    return ActivityModel.findOne({ _id: id, ownerId }).lean<IActivity>();
  }

  async create(data: ActivityCreate & { ownerId: string }): Promise<IActivity> {
    const activity = await ActivityModel.create(data);
    return activity.toObject() as IActivity;
  }

  async update(id: string, ownerId: string, data: ActivityUpdate): Promise<IActivity | null> {
    return ActivityModel.findOneAndUpdate(
      { _id: id, ownerId },
      data,
      { new: true },
    ).lean<IActivity>();
  }

  async delete(id: string, ownerId: string): Promise<boolean> {
    const result = await ActivityModel.findOneAndDelete({ _id: id, ownerId });
    return result !== null;
  }
}
