import { FollowUpService } from '../../src/ai/services/FollowUpService';
import { IContactRepository } from '../../src/modules/contacts/contact.repository';
import { IDealRepository } from '../../src/modules/deals/deal.repository';
import { IActivityRepository } from '../../src/modules/activities/activity.repository';
import { IContact } from '../../src/modules/contacts/contact.model';
import { IDeal } from '../../src/modules/deals/deal.model';
import { IActivity } from '../../src/modules/activities/activity.model';
import { AiClient } from '../../src/ai/AiClient';
import { AiError } from '../../src/ai/errors/AiError';
import { NotFoundError } from '../../src/shared/errors/NotFoundError';

const OWNER_ID = '507f1f77bcf86cd799439012';
const CONTACT_ID = '507f1f77bcf86cd799439011';
const DEAL_ID = '507f1f77bcf86cd799439013';

const mockContact: Partial<IContact> = {
  _id: CONTACT_ID as unknown as IContact['_id'],
  name: 'John Doe',
  email: 'john@example.com',
  company: 'Acme Corp',
  title: 'CTO',
  status: 'prospect',
  ownerId: OWNER_ID as unknown as IContact['ownerId'],
};

const mockDeal: Partial<IDeal> = {
  _id: DEAL_ID as unknown as IDeal['_id'],
  title: 'Enterprise License',
  stage: 'proposal',
  value: 50000,
};

const validFollowUpResponse = JSON.stringify({
  subject: 'Following up on our conversation',
  body: 'Hi John, I wanted to follow up on our recent discussion...',
  keyPoints: ['Discussed pricing', 'Demo next week'],
  callToAction: 'Can we schedule a call Thursday?',
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

function createMockActivityRepo(): jest.Mocked<IActivityRepository> {
  return {
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

describe('FollowUpService', () => {
  let service: FollowUpService;
  let contactRepo: jest.Mocked<IContactRepository>;
  let dealRepo: jest.Mocked<IDealRepository>;
  let activityRepo: jest.Mocked<IActivityRepository>;
  let aiClient: jest.Mocked<Pick<AiClient, 'complete'>> & AiClient;

  beforeEach(() => {
    contactRepo = createMockContactRepo();
    dealRepo = createMockDealRepo();
    activityRepo = createMockActivityRepo();
    aiClient = createMockAiClient();
    service = new FollowUpService(contactRepo, dealRepo, activityRepo, aiClient);
    jest.clearAllMocks();
  });

  describe('generate', () => {
    it('should generate a follow-up and create an activity', async () => {
      contactRepo.findById.mockResolvedValue(mockContact as IContact);
      activityRepo.findRecentByContact.mockResolvedValue([]);
      aiClient.complete.mockResolvedValue({
        content: validFollowUpResponse,
        stopReason: 'end_turn',
        usage: { inputTokens: 300, outputTokens: 200 },
        model: 'claude-sonnet-4-6',
        latencyMs: 800,
      });
      activityRepo.create.mockResolvedValue({} as IActivity);

      const result = await service.generate(
        { contactId: CONTACT_ID, tone: 'professional' },
        OWNER_ID,
      );

      expect(result.subject).toBe('Following up on our conversation');
      expect(result.body).toContain('follow up');
      expect(result.keyPoints).toHaveLength(2);
      expect(activityRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          contactId: CONTACT_ID,
          ownerId: OWNER_ID,
          type: 'email',
          title: 'Following up on our conversation',
          metadata: { aiGenerated: true, tone: 'professional' },
        }),
      );
    });

    it('should include deal context when dealId provided', async () => {
      contactRepo.findById.mockResolvedValue(mockContact as IContact);
      dealRepo.findById.mockResolvedValue(mockDeal as unknown as IDeal);
      activityRepo.findRecentByContact.mockResolvedValue([]);
      aiClient.complete.mockResolvedValue({
        content: validFollowUpResponse,
        stopReason: 'end_turn',
        usage: { inputTokens: 300, outputTokens: 200 },
        model: 'claude-sonnet-4-6',
        latencyMs: 800,
      });
      activityRepo.create.mockResolvedValue({} as IActivity);

      await service.generate(
        { contactId: CONTACT_ID, dealId: DEAL_ID, tone: 'friendly' },
        OWNER_ID,
      );

      expect(dealRepo.findById).toHaveBeenCalledWith(DEAL_ID, OWNER_ID);
      expect(activityRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ dealId: DEAL_ID }),
      );
    });

    it('should throw NotFoundError when contact not found', async () => {
      contactRepo.findById.mockResolvedValue(null);

      await expect(
        service.generate({ contactId: 'nonexistent', tone: 'professional' }, OWNER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw NotFoundError when deal not found', async () => {
      contactRepo.findById.mockResolvedValue(mockContact as IContact);
      dealRepo.findById.mockResolvedValue(null);

      await expect(
        service.generate({ contactId: CONTACT_ID, dealId: 'nonexistent', tone: 'professional' }, OWNER_ID),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw AiError when AI returns invalid JSON', async () => {
      contactRepo.findById.mockResolvedValue(mockContact as IContact);
      activityRepo.findRecentByContact.mockResolvedValue([]);
      aiClient.complete.mockResolvedValue({
        content: 'not json',
        stopReason: 'end_turn',
        usage: { inputTokens: 300, outputTokens: 200 },
        model: 'claude-sonnet-4-6',
        latencyMs: 800,
      });

      await expect(
        service.generate({ contactId: CONTACT_ID, tone: 'professional' }, OWNER_ID),
      ).rejects.toThrow(AiError);
    });
  });
});
