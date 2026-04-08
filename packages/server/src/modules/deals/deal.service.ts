import { DealCreate, DealUpdate, DealFiltersInput, PaginatedData } from '@ai-crm/shared';
import { IDealRepository } from './deal.repository';
import { IDeal, PipelineSummary } from './deal.model';
import { NotFoundError } from '../../shared/errors/NotFoundError';

export class DealService {
  constructor(private readonly dealRepository: IDealRepository) {}

  async getAll(ownerId: string, filters: DealFiltersInput): Promise<PaginatedData<IDeal>> {
    return this.dealRepository.findAll(ownerId, filters);
  }

  async getById(id: string, ownerId: string): Promise<IDeal> {
    const deal = await this.dealRepository.findByIdPopulated(id, ownerId);
    if (!deal) {
      throw new NotFoundError('Deal');
    }
    return deal;
  }

  async create(ownerId: string, data: DealCreate): Promise<IDeal> {
    return this.dealRepository.create({ ...data, ownerId });
  }

  async update(id: string, ownerId: string, data: DealUpdate): Promise<IDeal> {
    await this.ensureExists(id, ownerId);

    const updated = await this.dealRepository.update(id, ownerId, data);
    if (!updated) {
      throw new NotFoundError('Deal');
    }
    return updated;
  }

  async updateStage(id: string, ownerId: string, stage: string, userId: string): Promise<IDeal> {
    await this.ensureExists(id, ownerId);

    const updated = await this.dealRepository.updateStage(id, ownerId, stage, userId);
    if (!updated) {
      throw new NotFoundError('Deal');
    }
    return updated;
  }

  async delete(id: string, ownerId: string): Promise<void> {
    await this.ensureExists(id, ownerId);
    await this.dealRepository.softDelete(id, ownerId);
  }

  async getPipelineView(ownerId: string): Promise<{ stages: PipelineSummary[] }> {
    const stages = await this.dealRepository.getPipelineSummary(ownerId);
    return { stages };
  }

  private async ensureExists(id: string, ownerId: string): Promise<void> {
    const deal = await this.dealRepository.findById(id, ownerId);
    if (!deal) {
      throw new NotFoundError('Deal');
    }
  }
}
