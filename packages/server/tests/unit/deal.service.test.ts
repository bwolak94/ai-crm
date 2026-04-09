import { DealService } from '../../src/modules/deals/deal.service';
import { IDealRepository } from '../../src/modules/deals/deal.repository';
import { IDeal } from '../../src/modules/deals/deal.model';
import { NotFoundError } from '../../src/shared/errors/NotFoundError';

const OWNER_ID = '507f1f77bcf86cd799439012';

const mockDeal: Partial<IDeal> = {
  _id: 'deal-1' as unknown as IDeal['_id'],
  title: 'Enterprise License',
  contactId: 'contact-1' as unknown as IDeal['contactId'],
  ownerId: OWNER_ID as unknown as IDeal['ownerId'],
  value: 50000,
  currency: 'USD',
  stage: 'proposal',
  priority: 'high',
  stageHistory: [],
  deletedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

function createMockDealRepo(): jest.Mocked<IDealRepository> {
  return {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByIdPopulated: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateStage: jest.fn(),
    softDelete: jest.fn(),
    getPipelineSummary: jest.fn(),
  };
}

describe('DealService', () => {
  let service: DealService;
  let repository: jest.Mocked<IDealRepository>;

  beforeEach(() => {
    repository = createMockDealRepo();
    service = new DealService(repository);
  });

  describe('getById', () => {
    it('should return deal when found', async () => {
      repository.findByIdPopulated.mockResolvedValue(mockDeal as IDeal);

      const result = await service.getById('deal-1', OWNER_ID);

      expect(result.title).toBe('Enterprise License');
    });

    it('should throw NotFoundError when not found', async () => {
      repository.findByIdPopulated.mockResolvedValue(null);

      await expect(service.getById('nonexistent', OWNER_ID)).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('should create a deal', async () => {
      repository.create.mockResolvedValue(mockDeal as IDeal);

      const result = await service.create(OWNER_ID, {
        title: 'Enterprise License',
        value: 50000,
        currency: 'USD',
        contactId: 'contact-1',
        stage: 'proposal',
        priority: 'high',
      });

      expect(result.value).toBe(50000);
      expect(repository.create).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId: OWNER_ID }),
      );
    });
  });

  describe('update', () => {
    it('should update deal fields', async () => {
      repository.findById.mockResolvedValue(mockDeal as IDeal);
      const updated = { ...mockDeal, value: 75000 };
      repository.update.mockResolvedValue(updated as IDeal);

      const result = await service.update('deal-1', OWNER_ID, { value: 75000 });

      expect(result.value).toBe(75000);
    });

    it('should throw NotFoundError when deal not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', OWNER_ID, { value: 75000 }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateStage', () => {
    it('should update deal stage', async () => {
      repository.findById.mockResolvedValue(mockDeal as IDeal);
      const updated = { ...mockDeal, stage: 'negotiation' };
      repository.updateStage.mockResolvedValue(updated as unknown as IDeal);

      const result = await service.updateStage('deal-1', OWNER_ID, 'negotiation', OWNER_ID);

      expect(result.stage).toBe('negotiation');
    });

    it('should throw NotFoundError when deal not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(
        service.updateStage('nonexistent', OWNER_ID, 'negotiation', OWNER_ID),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should soft-delete a deal', async () => {
      repository.findById.mockResolvedValue(mockDeal as IDeal);
      repository.softDelete.mockResolvedValue(true);

      await service.delete('deal-1', OWNER_ID);

      expect(repository.softDelete).toHaveBeenCalledWith('deal-1', OWNER_ID);
    });

    it('should throw NotFoundError when deal not found', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('nonexistent', OWNER_ID)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getPipelineView', () => {
    it('should return pipeline summary', async () => {
      const summary = [
        { stage: 'discovery', count: 3, totalValue: 30000, avgValue: 10000, currency: 'USD' },
        { stage: 'proposal', count: 2, totalValue: 80000, avgValue: 40000, currency: 'USD' },
      ];
      repository.getPipelineSummary.mockResolvedValue(summary);

      const result = await service.getPipelineView(OWNER_ID);

      expect(result.stages).toHaveLength(2);
      expect(result.stages[0]!.stage).toBe('discovery');
    });
  });
});
