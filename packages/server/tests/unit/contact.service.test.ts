import { ContactService } from '../../src/modules/contacts/contact.service';
import { IContactRepository } from '../../src/modules/contacts/contact.repository';
import { IContact } from '../../src/modules/contacts/contact.model';
import { ConflictError } from '../../src/shared/errors/ConflictError';
import { NotFoundError } from '../../src/shared/errors/NotFoundError';

const mockContact: Partial<IContact> = {
  _id: '507f1f77bcf86cd799439011' as unknown as IContact['_id'],
  name: 'John Doe',
  email: 'john@example.com',
  status: 'lead',
  tags: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

function createMockRepository(): jest.Mocked<IContactRepository> {
  return {
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    findByEmail: jest.fn(),
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
    it('should create a contact when email is unique', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockContact as IContact);

      const result = await service.create({
        name: 'John Doe',
        email: 'john@example.com',
        status: 'lead',
        tags: [],
        customFields: {},
      });

      expect(result.email).toBe('john@example.com');
      expect(repository.create).toHaveBeenCalledTimes(1);
    });

    it('should throw on duplicate email', async () => {
      repository.findByEmail.mockResolvedValue(mockContact as IContact);

      await expect(
        service.create({
          name: 'John Doe',
          email: 'john@example.com',
          status: 'lead',
          tags: [],
          customFields: {},
        }),
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('update', () => {
    it('should return null for missing id', async () => {
      repository.update.mockResolvedValue(null);

      await expect(service.update('nonexistent', { name: 'Updated' })).rejects.toThrow(NotFoundError);
    });
  });

  describe('findById', () => {
    it('should throw NotFoundError when contact does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findById('nonexistent')).rejects.toThrow(NotFoundError);
    });

    it('should return contact when found', async () => {
      repository.findById.mockResolvedValue(mockContact as IContact);

      const result = await service.findById('507f1f77bcf86cd799439011');
      expect(result.email).toBe('john@example.com');
    });
  });
});
