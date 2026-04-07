import { ContactCreate, ContactUpdate, ContactFilters, Pagination, PaginatedData } from '@ai-crm/shared';
import { ContactModel, IContact } from './contact.model';

export interface IContactRepository {
  findById(id: string): Promise<IContact | null>;
  findAll(filters: ContactFilters, pagination: Pagination): Promise<PaginatedData<IContact>>;
  create(data: ContactCreate): Promise<IContact>;
  update(id: string, data: ContactUpdate): Promise<IContact | null>;
  delete(id: string): Promise<boolean>;
  findByEmail(email: string): Promise<IContact | null>;
}

export class ContactRepository implements IContactRepository {
  async findById(id: string): Promise<IContact | null> {
    return ContactModel.findById(id).lean<IContact>();
  }

  async findAll(filters: ContactFilters, pagination: Pagination): Promise<PaginatedData<IContact>> {
    const query: Record<string, unknown> = {};

    if (filters.status) {
      query.status = filters.status;
    }
    if (filters.company) {
      query.company = { $regex: filters.company, $options: 'i' };
    }
    if (filters.search) {
      query.$or = [
        { name: { $regex: filters.search, $options: 'i' } },
        { email: { $regex: filters.search, $options: 'i' } },
        { company: { $regex: filters.search, $options: 'i' } },
      ];
    }
    if (filters.tags && filters.tags.length > 0) {
      query.tags = { $in: filters.tags };
    }

    const sortField = pagination.sortBy ?? 'createdAt';
    const sortOrder = pagination.sortOrder === 'asc' ? 1 : -1;

    const [items, total] = await Promise.all([
      ContactModel.find(query)
        .sort({ [sortField]: sortOrder })
        .skip((pagination.page - 1) * pagination.limit)
        .limit(pagination.limit)
        .lean<IContact[]>(),
      ContactModel.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / pagination.limit);
    return {
      items,
      total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    };
  }

  async create(data: ContactCreate): Promise<IContact> {
    const contact = await ContactModel.create(data);
    return contact.toObject() as IContact;
  }

  async update(id: string, data: ContactUpdate): Promise<IContact | null> {
    return ContactModel.findByIdAndUpdate(id, data, { new: true }).lean<IContact>();
  }

  async delete(id: string): Promise<boolean> {
    const result = await ContactModel.findByIdAndDelete(id);
    return result !== null;
  }

  async findByEmail(email: string): Promise<IContact | null> {
    return ContactModel.findOne({ email }).lean<IContact>();
  }
}
