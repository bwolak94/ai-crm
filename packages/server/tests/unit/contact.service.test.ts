import { ContactService } from '../../src/modules/contacts/contact.service';
import { IContactRepository } from '../../src/modules/contacts/contact.repository';
import { IContact } from '../../src/modules/contacts/contact.model';
import { ConflictError } from '../../src/shared/errors/ConflictError';
import { NotFoundError } from '../../src/shared/errors/NotFoundError';

const OWNER_ID = '507f1f77bcf86cd799439012';

const mockContact: Partial<IContact> = {
  _id: '507f1f77bcf86cd799439011' as unknown as IContact['_id'],
  name: 'John Doe',
  email: 'john@example.com',
  status: 'lead',
  tags: [],
  customFields: {},
  ownerId: OWNER_ID as unknown as IContact['ownerId'],
  deletedAt: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

function createMockRepository(): jest.Mocked<IContactRepository> {
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

describe('ContactService', () => {
  let service: ContactService;
  let repository: jest.Mocked<IContactRepository>;

  beforeEach(() => {
    repository = createMockRepository();
    service = new ContactService(repository);
  });

  describe('create', () => {
    const validData = {
      name: 'John Doe',
      email: 'john@example.com',
      status: 'lead' as const,
      tags: [],
      customFields: {},
    };

    it('should create a contact when email is unique', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockContact as IContact);

      const result = await service.create(OWNER_ID, validData);

      expect(result.email).toBe('john@example.com');
      expect(repository.create).toHaveBeenCalledWith({ ...validData, ownerId: OWNER_ID });
    });

    it('should throw ConflictError on duplicate email', async () => {
      repository.findByEmail.mockResolvedValue(mockContact as IContact);

      await expect(service.create(OWNER_ID, validData)).rejects.toThrow(ConflictError);
      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('getById', () => {
    it('should return contact when found', async () => {
      repository.findById.mockResolvedValue(mockContact as IContact);

      const result = await service.getById('507f1f77bcf86cd799439011', OWNER_ID);
      expect(result.email).toBe('john@example.com');
    });

    it('should throw NotFoundError when contact does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getById('nonexistent', OWNER_ID)).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('should update correct fields', async () => {
      repository.findById.mockResolvedValue(mockContact as IContact);
      const updated = { ...mockContact, name: 'John Updated' };
      repository.update.mockResolvedValue(updated as IContact);

      const result = await service.update('507f1f77bcf86cd799439011', OWNER_ID, { name: 'John Updated' });

      expect(result.name).toBe('John Updated');
      expect(repository.update).toHaveBeenCalledWith('507f1f77bcf86cd799439011', OWNER_ID, { name: 'John Updated' });
    });

    it('should throw NotFoundError for missing id', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.update('nonexistent', OWNER_ID, { name: 'Updated' })).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError when updating email to an existing one', async () => {
      repository.findById.mockResolvedValue(mockContact as IContact);
      const otherContact = { ...mockContact, _id: 'other-id' };
      repository.findByEmail.mockResolvedValue(otherContact as unknown as IContact);

      await expect(
        service.update('507f1f77bcf86cd799439011', OWNER_ID, { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictError);
    });

    it('should allow updating email to same contact own email', async () => {
      repository.findById.mockResolvedValue(mockContact as IContact);
      repository.findByEmail.mockResolvedValue(mockContact as IContact);
      const updated = { ...mockContact, email: 'john@example.com' };
      repository.update.mockResolvedValue(updated as IContact);

      const result = await service.update('507f1f77bcf86cd799439011', OWNER_ID, { email: 'john@example.com' });
      expect(result.email).toBe('john@example.com');
    });
  });

  describe('delete', () => {
    it('should soft-delete an existing contact', async () => {
      repository.findById.mockResolvedValue(mockContact as IContact);
      repository.softDelete.mockResolvedValue(true);

      await service.delete('507f1f77bcf86cd799439011', OWNER_ID);

      expect(repository.softDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011', OWNER_ID);
    });

    it('should throw NotFoundError for missing contact', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.delete('nonexistent', OWNER_ID)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAll', () => {
    it('should delegate to repository with filters', async () => {
      const mockPaginated = {
        items: [mockContact as IContact],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      };
      repository.findAll.mockResolvedValue(mockPaginated);

      const filters = { page: 1, limit: 20, sortBy: 'createdAt' as const, sortOrder: 'desc' as const };
      const result = await service.getAll(OWNER_ID, filters);

      expect(result.items).toHaveLength(1);
      expect(repository.findAll).toHaveBeenCalledWith(OWNER_ID, filters);
    });
  });

  describe('bulkUpdateStatus', () => {
    it('should return count of updated contacts', async () => {
      repository.bulkUpdateStatus.mockResolvedValue(3);

      const result = await service.bulkUpdateStatus(['id1', 'id2', 'id3'], OWNER_ID, 'customer');

      expect(result.updated).toBe(3);
    });
  });
});
