import { ContactScoringService } from '../../src/modules/contacts/contact.scoring.service';
import { IContactRepository } from '../../src/modules/contacts/contact.repository';
import { IContact } from '../../src/modules/contacts/contact.model';
import { IActivityRepository } from '../../src/modules/activities/activity.repository';
import { AiClient } from '../../src/ai/AiClient';
import { AiError } from '../../src/ai/errors/AiError';
import { NotFoundError } from '../../src/shared/errors/NotFoundError';
import { ScoringHistoryModel } from '../../src/modules/contacts/scoring-history.model';

jest.mock('../../src/modules/contacts/scoring-history.model', () => ({
  ScoringHistoryModel: {
    create: jest.fn().mockResolvedValue({}),
    find: jest.fn().mockReturnValue({
      sort: jest.fn().mockReturnValue({
        limit: jest.fn().mockReturnValue({
          lean: jest.fn().mockResolvedValue([]),
        }),
      }),
    }),
  },
}));

const OWNER_ID = '507f1f77bcf86cd799439012';
const CONTACT_ID = '507f1f77bcf86cd799439011';

const mockContact: Partial<IContact> = {
  _id: CONTACT_ID as unknown as IContact['_id'],
  name: 'John Doe',
  email: 'john@example.com',
  company: 'Acme Corp',
  title: 'CTO',
  status: 'prospect',
  tags: [],
  ownerId: OWNER_ID as unknown as IContact['ownerId'],
  aiScore: undefined,
  deletedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

const validScoringResponse = JSON.stringify({
  value: 75,
  reasoning: 'Strong engagement metrics and recent activity.',
  signals: {
    positive: ['Recent email opened', 'Company in target market'],
    negative: ['No meeting scheduled'],
  },
  recommendedAction: 'Schedule a demo call this week.',
});

function createMockContactRepo(): jest.Mocked<IContactRepository> {
  return {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    updateAiScore: jest.fn(),
    softDelete: jest.fn(),
    findByEmail: jest.fn(),
    bulkUpdateStatus: jest.fn(),
    findAllOwnerIds: jest.fn(),
    findIdsByOwner: jest.fn(),
    chatQuery: jest.fn(),
    searchByNameOrEmail: jest.fn(),
  };
}

function createMockActivityRepo(): jest.Mocked<IActivityRepository> {
  return {
    findAll: jest.fn(),
    findByContact: jest.fn(),
    findRecentByContact: jest.fn(),
    findByDeal: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };
}

function createMockAiClient(): jest.Mocked<Pick<AiClient, 'complete'>> & AiClient {
  return {
    complete: jest.fn(),
  } as unknown as jest.Mocked<Pick<AiClient, 'complete'>> & AiClient;
}

describe('ContactScoringService', () => {
  let service: ContactScoringService;
  let contactRepo: jest.Mocked<IContactRepository>;
  let activityRepo: jest.Mocked<IActivityRepository>;
  let aiClient: jest.Mocked<Pick<AiClient, 'complete'>> & AiClient;

  beforeEach(() => {
    contactRepo = createMockContactRepo();
    activityRepo = createMockActivityRepo();
    aiClient = createMockAiClient();
    service = new ContactScoringService(contactRepo, activityRepo, aiClient);
    jest.clearAllMocks();
  });

  describe('scoreContact', () => {
    it('should score a contact successfully', async () => {
      contactRepo.findById.mockResolvedValue(mockContact as IContact);
      activityRepo.findRecentByContact.mockResolvedValue([]);
      aiClient.complete.mockResolvedValue({
        content: validScoringResponse,
        stopReason: 'end_turn',
        usage: { inputTokens: 200, outputTokens: 100 },
        model: 'claude-sonnet-4-6',
        latencyMs: 500,
      });
      contactRepo.updateAiScore.mockResolvedValue(mockContact as IContact);

      const result = await service.scoreContact(CONTACT_ID, OWNER_ID);

      expect(result.score).toBe(75);
      expect(result.reasoning).toBe('Strong engagement metrics and recent activity.');
      expect(result.signals.positive).toHaveLength(2);
      expect(result.signals.negative).toHaveLength(1);
      expect(result.recommendedAction).toBe('Schedule a demo call this week.');
      expect(result.previousScore).toBeNull();
      expect(result.model).toBe('claude-sonnet-4-6');
      expect(contactRepo.updateAiScore).toHaveBeenCalledTimes(1);
      expect(ScoringHistoryModel.create).toHaveBeenCalledTimes(1);
    });

    it('should include previousScore when contact already has a score', async () => {
      const scoredContact = { ...mockContact, aiScore: { value: 50, scoredAt: new Date(), reasoning: 'old', signals: { positive: [], negative: [] } } };
      contactRepo.findById.mockResolvedValue(scoredContact as unknown as IContact);
      activityRepo.findRecentByContact.mockResolvedValue([]);
      aiClient.complete.mockResolvedValue({
        content: validScoringResponse,
        stopReason: 'end_turn',
        usage: { inputTokens: 200, outputTokens: 100 },
        model: 'claude-sonnet-4-6',
        latencyMs: 500,
      });
      contactRepo.updateAiScore.mockResolvedValue(scoredContact as unknown as IContact);

      const result = await service.scoreContact(CONTACT_ID, OWNER_ID);

      expect(result.previousScore).toBe(50);
    });

    it('should throw NotFoundError for missing contact', async () => {
      contactRepo.findById.mockResolvedValue(null);

      await expect(service.scoreContact('nonexistent', OWNER_ID)).rejects.toThrow(NotFoundError);
    });

    it('should throw AiError when AI returns invalid JSON', async () => {
      contactRepo.findById.mockResolvedValue(mockContact as IContact);
      activityRepo.findRecentByContact.mockResolvedValue([]);
      aiClient.complete.mockResolvedValue({
        content: 'not valid json',
        stopReason: 'end_turn',
        usage: { inputTokens: 200, outputTokens: 100 },
        model: 'claude-sonnet-4-6',
        latencyMs: 500,
      });

      await expect(service.scoreContact(CONTACT_ID, OWNER_ID)).rejects.toThrow(AiError);
    });

    it('should throw AiError when response fails Zod validation', async () => {
      contactRepo.findById.mockResolvedValue(mockContact as IContact);
      activityRepo.findRecentByContact.mockResolvedValue([]);
      aiClient.complete.mockResolvedValue({
        content: JSON.stringify({ value: 'not-a-number', reasoning: 123 }),
        stopReason: 'end_turn',
        usage: { inputTokens: 200, outputTokens: 100 },
        model: 'claude-sonnet-4-6',
        latencyMs: 500,
      });

      await expect(service.scoreContact(CONTACT_ID, OWNER_ID)).rejects.toThrow(AiError);
    });
  });

  describe('scoreBatch', () => {
    it('should handle partial failures and return correct counts', async () => {
      const ids = ['id1', 'id2', 'id3'];

      contactRepo.findById
        .mockResolvedValueOnce(mockContact as IContact)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockContact as IContact);

      activityRepo.findRecentByContact.mockResolvedValue([]);
      aiClient.complete.mockResolvedValue({
        content: validScoringResponse,
        stopReason: 'end_turn',
        usage: { inputTokens: 200, outputTokens: 100 },
        model: 'claude-sonnet-4-6',
        latencyMs: 500,
      });
      contactRepo.updateAiScore.mockResolvedValue(mockContact as IContact);

      const result = await service.scoreBatch(ids, OWNER_ID);

      expect(result.succeeded).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]!.contactId).toBe('id2');
    });

    it('should succeed for all contacts when no errors', async () => {
      contactRepo.findById.mockResolvedValue(mockContact as IContact);
      activityRepo.findRecentByContact.mockResolvedValue([]);
      aiClient.complete.mockResolvedValue({
        content: validScoringResponse,
        stopReason: 'end_turn',
        usage: { inputTokens: 200, outputTokens: 100 },
        model: 'claude-sonnet-4-6',
        latencyMs: 500,
      });
      contactRepo.updateAiScore.mockResolvedValue(mockContact as IContact);

      const result = await service.scoreBatch(['id1', 'id2'], OWNER_ID);

      expect(result.succeeded).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
    });
  });
});
