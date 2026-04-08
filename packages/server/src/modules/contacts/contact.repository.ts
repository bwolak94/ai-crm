import { ContactCreate, ContactUpdate, PaginatedData, ContactFiltersInput } from '@ai-crm/shared';
import { FilterQuery } from 'mongoose';
import { ContactModel, IContact } from './contact.model';
import { buildPaginatedData } from '../../shared/utils/pagination';

export interface AiScoreData {
  value: number;
  scoredAt: Date;
  reasoning: string;
  signals: { positive: string[]; negative: string[] };
}

export interface ChatContactQuery {
  status?: string;
  search?: string;
  aiScoreMin?: number;
  aiScoreMax?: number;
  sentiment?: string;
  company?: string;
  createdAfter?: string;
  limit?: number;
}

export interface IContactRepository {
  findAll(ownerId: string, filters: ContactFiltersInput): Promise<PaginatedData<IContact>>;
  findById(id: string, ownerId: string): Promise<IContact | null>;
  findByEmail(email: string, ownerId: string): Promise<IContact | null>;
  create(data: ContactCreate & { ownerId: string }): Promise<IContact>;
  update(id: string, ownerId: string, data: ContactUpdate): Promise<IContact | null>;
  updateAiScore(id: string, ownerId: string, score: AiScoreData): Promise<IContact | null>;
  softDelete(id: string, ownerId: string): Promise<boolean>;
  bulkUpdateStatus(ids: string[], ownerId: string, status: string): Promise<number>;
  findAllOwnerIds(): Promise<string[]>;
  findIdsByOwner(ownerId: string): Promise<string[]>;
  chatQuery(ownerId: string, filters: ChatContactQuery): Promise<IContact[]>;
  searchByNameOrEmail(ownerId: string, query: string): Promise<IContact | null>;
}

export class MongoContactRepository implements IContactRepository {
  async findAll(ownerId: string, filters: ContactFiltersInput): Promise<PaginatedData<IContact>> {
    const query: FilterQuery<IContact> = { ownerId };

    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.company) {
      query.company = { $regex: filters.company, $options: 'i' };
    }
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $all: filters.tags };
    }

    const sortField = filters.sortBy;
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    const skip = (filters.page - 1) * filters.limit;

    const [items, total] = await Promise.all([
      ContactModel.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(filters.limit)
        .lean<IContact[]>(),
      ContactModel.countDocuments(query),
    ]);

    return buildPaginatedData(items, total, filters.page, filters.limit);
  }

  async findById(id: string, ownerId: string): Promise<IContact | null> {
    return ContactModel.findOne({ _id: id, ownerId }).lean<IContact>();
  }

  async findByEmail(email: string, ownerId: string): Promise<IContact | null> {
    return ContactModel.findOne({ email, ownerId }).lean<IContact>();
  }

  async create(data: ContactCreate & { ownerId: string }): Promise<IContact> {
    const contact = await ContactModel.create(data);
    return contact.toObject() as IContact;
  }

  async update(id: string, ownerId: string, data: ContactUpdate): Promise<IContact | null> {
    return ContactModel.findOneAndUpdate(
      { _id: id, ownerId },
      data,
      { new: true },
    ).lean<IContact>();
  }

  async softDelete(id: string, ownerId: string): Promise<boolean> {
    const result = await ContactModel.findOneAndUpdate(
      { _id: id, ownerId, deletedAt: null },
      { deletedAt: new Date() },
    );
    return result !== null;
  }

  async updateAiScore(id: string, ownerId: string, score: AiScoreData): Promise<IContact | null> {
    return ContactModel.findOneAndUpdate(
      { _id: id, ownerId },
      { aiScore: score },
      { new: true },
    ).lean<IContact>();
  }

  async bulkUpdateStatus(ids: string[], ownerId: string, status: string): Promise<number> {
    const result = await ContactModel.updateMany(
      { _id: { $in: ids }, ownerId, deletedAt: null },
      { status },
    );
    return result.modifiedCount;
  }

  async chatQuery(ownerId: string, filters: ChatContactQuery): Promise<IContact[]> {
    const query: FilterQuery<IContact> = { ownerId };

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.search) {
      query.$text = { $search: filters.search };
    }
    if (filters.company) {
      query.company = { $regex: filters.company, $options: 'i' };
    }
    if (filters.sentiment) {
      query.sentiment = filters.sentiment;
    }
    if (filters.aiScoreMin !== undefined || filters.aiScoreMax !== undefined) {
      query['aiScore.value'] = {};
      if (filters.aiScoreMin !== undefined) {
        (query['aiScore.value'] as Record<string, number>).$gte = filters.aiScoreMin;
      }
      if (filters.aiScoreMax !== undefined) {
        (query['aiScore.value'] as Record<string, number>).$lte = filters.aiScoreMax;
      }
    }
    if (filters.createdAfter) {
      query.createdAt = { $gte: new Date(filters.createdAfter) };
    }

    const limit = Math.min(filters.limit ?? 10, 50);
    return ContactModel.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean<IContact[]>();
  }

  async searchByNameOrEmail(ownerId: string, query: string): Promise<IContact | null> {
    return ContactModel.findOne({
      ownerId,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    }).lean<IContact>();
  }

  async findAllOwnerIds(): Promise<string[]> {
    const result = await ContactModel.distinct('ownerId', { deletedAt: null });
    return result.map(String);
  }

  async findIdsByOwner(ownerId: string): Promise<string[]> {
    const contacts = await ContactModel.find({ ownerId, deletedAt: null })
      .select('_id')
      .lean<Array<{ _id: string }>>();
    return contacts.map((c) => String(c._id));
  }
}
