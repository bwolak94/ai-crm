import { DealCreate, DealUpdate, PaginatedData, DealFiltersInput } from '@ai-crm/shared';
import { FilterQuery, Types } from 'mongoose';
import { DealModel, IDeal, PipelineSummary } from './deal.model';
import { buildPaginatedData } from '../../shared/utils/pagination';

export interface IDealRepository {
  findAll(ownerId: string, filters: DealFiltersInput): Promise<PaginatedData<IDeal>>;
  findById(id: string, ownerId: string): Promise<IDeal | null>;
  findByIdPopulated(id: string, ownerId: string): Promise<IDeal | null>;
  create(data: DealCreate & { ownerId: string }): Promise<IDeal>;
  update(id: string, ownerId: string, data: DealUpdate): Promise<IDeal | null>;
  updateStage(id: string, ownerId: string, stage: string, userId: string): Promise<IDeal | null>;
  softDelete(id: string, ownerId: string): Promise<boolean>;
  getPipelineSummary(ownerId: string): Promise<PipelineSummary[]>;
}

export class MongoDealRepository implements IDealRepository {
  async findAll(ownerId: string, filters: DealFiltersInput): Promise<PaginatedData<IDeal>> {
    const query: FilterQuery<IDeal> = { ownerId };

    if (filters.stage) {
      query.stage = filters.stage;
    }
    if (filters.contactId) {
      query.contactId = filters.contactId;
    }
    if (filters.priority) {
      query.priority = filters.priority;
    }

    const sortField = filters.sortBy;
    const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
    const skip = (filters.page - 1) * filters.limit;

    const [items, total] = await Promise.all([
      DealModel.find(query)
        .sort({ [sortField]: sortOrder })
        .skip(skip)
        .limit(filters.limit)
        .lean<IDeal[]>(),
      DealModel.countDocuments(query),
    ]);

    return buildPaginatedData(items, total, filters.page, filters.limit);
  }

  async findById(id: string, ownerId: string): Promise<IDeal | null> {
    return DealModel.findOne({ _id: id, ownerId }).lean<IDeal>();
  }

  async findByIdPopulated(id: string, ownerId: string): Promise<IDeal | null> {
    return DealModel.findOne({ _id: id, ownerId })
      .populate('contactId', 'name email')
      .lean<IDeal>();
  }

  async create(data: DealCreate & { ownerId: string }): Promise<IDeal> {
    const deal = await DealModel.create(data);
    return deal.toObject() as IDeal;
  }

  async update(id: string, ownerId: string, data: DealUpdate): Promise<IDeal | null> {
    return DealModel.findOneAndUpdate(
      { _id: id, ownerId },
      data,
      { new: true },
    ).lean<IDeal>();
  }

  async updateStage(id: string, ownerId: string, stage: string, userId: string): Promise<IDeal | null> {
    const deal = await DealModel.findOne({ _id: id, ownerId });
    if (!deal) {
      return null;
    }

    const previousStage = deal.stage;
    const lastStageChange = deal.stageHistory.length > 0
      ? deal.stageHistory[deal.stageHistory.length - 1]!.changedAt
      : deal.createdAt;
    const daysInPreviousStage = Math.max(
      0,
      Math.floor((Date.now() - lastStageChange.getTime()) / (1000 * 60 * 60 * 24)),
    );

    deal.stageHistory.push({
      stage,
      changedAt: new Date(),
      changedBy: new Types.ObjectId(userId),
      previousStage,
      daysInPreviousStage,
    });

    deal.stage = stage as IDeal['stage'];

    if (stage === 'closed_won' || stage === 'closed_lost') {
      deal.closedAt = new Date();
    }

    await deal.save();
    return deal.toObject() as IDeal;
  }

  async softDelete(id: string, ownerId: string): Promise<boolean> {
    const result = await DealModel.findOneAndUpdate(
      { _id: id, ownerId, deletedAt: null },
      { deletedAt: new Date() },
    );
    return result !== null;
  }

  async getPipelineSummary(ownerId: string): Promise<PipelineSummary[]> {
    return DealModel.aggregate<PipelineSummary>([
      { $match: { ownerId: new Types.ObjectId(ownerId), deletedAt: null } },
      {
        $group: {
          _id: '$stage',
          count: { $sum: 1 },
          totalValue: { $sum: '$value' },
          avgValue: { $avg: '$value' },
          currency: { $first: '$currency' },
        },
      },
      {
        $project: {
          _id: 0,
          stage: '$_id',
          count: 1,
          totalValue: 1,
          avgValue: { $round: ['$avgValue', 2] },
          currency: 1,
        },
      },
      { $sort: { stage: 1 } },
    ]);
  }
}
