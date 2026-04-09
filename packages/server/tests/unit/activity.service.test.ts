import { ActivityService } from '../../src/modules/activities/activity.service';
import { IActivityRepository } from '../../src/modules/activities/activity.repository';
import { IContactRepository } from '../../src/modules/contacts/contact.repository';
import { IDealRepository } from '../../src/modules/deals/deal.repository';
import { IActivity } from '../../src/modules/activities/activity.model';
import { IContact } from '../../src/modules/contacts/contact.model';
import { IDeal } from '../../src/modules/deals/deal.model';
import { NotFoundError } from '../../src/shared/errors/NotFoundError';

const OWNER_ID = '507f1f77bcf86cd799439012';
const CONTACT_ID = '507f1f77bcf86cd799439011';
const DEAL_ID = '507f1f77bcf86cd799439013';

const mockActivity: Partial<IActivity> = {
  _id: 'act-1' as unknown as IActivity['_id'],
  contactId: CONTACT_ID as unknown as IActivity['contactId'],
  ownerId: OWNER_ID as unknown as IActivity['ownerId'],
  type: 'note',
  title: 'Meeting notes',
  body: 'Discussed pricing.',
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-01'),
};

const mockContact: Partial<IContact> = {
  _id: CONTACT_ID as unknown as IContact['_id'],
  name: 'John Doe',
  email: 'john@example.com',
};

const mockDeal: Partial<IDeal> = {
  _id: DEAL_ID as unknown as IDeal['_id'],
  title: 'Test Deal',
};

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

function createMockContactRepo(): jest.Mocked<Pick<IContactRepository, 'findById'>> {
  return { findById: jest.fn() };
}

function createMockDealRepo(): jest.Mocked<Pick<IDealRepository, 'findById'>> {
  return { findById: jest.fn() };
}

describe('ActivityService', () => {
  let service: ActivityService;
  let activityRepo: jest.Mocked<IActivityRepository>;
  let contactRepo: ReturnType<typeof createMockContactRepo>;
  let dealRepo: ReturnType<typeof createMockDealRepo>;

  beforeEach(() => {
    activityRepo = createMockActivityRepo();
    contactRepo = createMockContactRepo();
    dealRepo = createMockDealRepo();
    service = new ActivityService(
      activityRepo,
      contactRepo as unknown as IContactRepository,
      dealRepo as unknown as IDealRepository,
    );
  });

  describe('getAll', () => {
    it('should delegate to repository', async () => {
      const mockPaginated = {
        items: [mockActivity as IActivity],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
      activityRepo.findAll.mockResolvedValue(mockPaginated);

      const result = await service.getAll(OWNER_ID, { page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(activityRepo.findAll).toHaveBeenCalledWith(OWNER_ID, { page: 1, limit: 20 });
    });
  });

  describe('getTimeline', () => {
    it('should return activities for a contact', async () => {
      contactRepo.findById.mockResolvedValue(mockContact as IContact);
      const mockPaginated = {
        items: [mockActivity as IActivity],
        total: 1, page: 1, limit: 20, totalPages: 1, hasNext: false, hasPrev: false,
      };
      activityRepo.findByContact.mockResolvedValue(mockPaginated);

      const result = await service.getTimeline(CONTACT_ID, OWNER_ID, { page: 1, limit: 20 });

      expect(result.items).toHaveLength(1);
    });

    it('should throw NotFoundError for missing contact', async () => {
      contactRepo.findById.mockResolvedValue(null);

      await expect(
        service.getTimeline('nonexistent', OWNER_ID, { page: 1, limit: 20 }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('create', () => {
    it('should create activity when contact exists', async () => {
      contactRepo.findById.mockResolvedValue(mockContact as IContact);
      activityRepo.create.mockResolvedValue(mockActivity as IActivity);

      const result = await service.create(OWNER_ID, {
        contactId: CONTACT_ID,
        type: 'note',
        title: 'Meeting notes',
      });

      expect(result.title).toBe('Meeting notes');
      expect(activityRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ ownerId: OWNER_ID, contactId: CONTACT_ID }),
      );
    });

    it('should throw NotFoundError when contact not found', async () => {
      contactRepo.findById.mockResolvedValue(null);

      await expect(
        service.create(OWNER_ID, { contactId: 'nonexistent', type: 'call', title: 'Call' }),
      ).rejects.toThrow(NotFoundError);
    });

    it('should validate deal exists when dealId provided', async () => {
      contactRepo.findById.mockResolvedValue(mockContact as IContact);
      dealRepo.findById.mockResolvedValue(null);

      await expect(
        service.create(OWNER_ID, { contactId: CONTACT_ID, dealId: 'bad-deal', type: 'call', title: 'Call' }),
      ).rejects.toThrow(NotFoundError);
    });

    it('should allow activity with valid dealId', async () => {
      contactRepo.findById.mockResolvedValue(mockContact as IContact);
      dealRepo.findById.mockResolvedValue(mockDeal as unknown as IDeal);
      activityRepo.create.mockResolvedValue(mockActivity as IActivity);

      const result = await service.create(OWNER_ID, {
        contactId: CONTACT_ID,
        dealId: DEAL_ID,
        type: 'email',
        title: 'Follow up',
      });

      expect(result).toBeDefined();
      expect(dealRepo.findById).toHaveBeenCalledWith(DEAL_ID, OWNER_ID);
    });
  });

  describe('update', () => {
    it('should update activity', async () => {
      const updated = { ...mockActivity, title: 'Updated title' };
      activityRepo.update.mockResolvedValue(updated as IActivity);

      const result = await service.update('act-1', OWNER_ID, { title: 'Updated title' });

      expect(result.title).toBe('Updated title');
    });

    it('should throw NotFoundError for missing activity', async () => {
      activityRepo.update.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', OWNER_ID, { title: 'Updated' }),
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete activity', async () => {
      activityRepo.delete.mockResolvedValue(true);

      await service.delete('act-1', OWNER_ID);

      expect(activityRepo.delete).toHaveBeenCalledWith('act-1', OWNER_ID);
    });

    it('should throw NotFoundError for missing activity', async () => {
      activityRepo.delete.mockResolvedValue(false);

      await expect(service.delete('nonexistent', OWNER_ID)).rejects.toThrow(NotFoundError);
    });
  });
});
