import { api } from '@/shared/lib/axios';
import type { ApiResponse, PaginatedResponse, ContactCreate, ContactUpdate, ContactFilters } from '@ai-crm/shared';

interface Contact extends ContactCreate {
  _id: string;
  createdAt: string;
  updatedAt: string;
}

export const contactsApi = {
  getAll: async (filters?: ContactFilters & { page?: number; limit?: number }): Promise<PaginatedResponse<Contact>['data']> => {
    const res = await api.get<PaginatedResponse<Contact>>('/api/contacts', { params: filters });
    return res.data.data;
  },

  getById: async (id: string): Promise<Contact> => {
    const res = await api.get<ApiResponse<Contact>>(`/api/contacts/${id}`);
    return res.data.data;
  },

  create: async (data: ContactCreate): Promise<Contact> => {
    const res = await api.post<ApiResponse<Contact>>('/api/contacts', data);
    return res.data.data;
  },

  update: async (id: string, data: ContactUpdate): Promise<Contact> => {
    const res = await api.put<ApiResponse<Contact>>(`/api/contacts/${id}`, data);
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/contacts/${id}`);
  },

  bulkUpdateStatus: async (ids: string[], status: string): Promise<{ updated: number }> => {
    const res = await api.patch<ApiResponse<{ updated: number }>>('/api/contacts/bulk-status', {
      ids,
      status,
    });
    return res.data.data;
  },
};
