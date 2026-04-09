import { api } from '@/shared/lib/axios';
import type { ApiResponse, PaginatedResponse, ActivityCreate, ActivityUpdate, ActivityFiltersInput } from '@ai-crm/shared';

export interface Activity extends ActivityCreate {
  _id: string;
  ownerId: string;
  contactName?: string;
  createdAt: string;
  updatedAt: string;
}

export const activitiesApi = {
  getByContact: async (
    contactId: string,
    filters?: Partial<ActivityFiltersInput>,
  ): Promise<PaginatedResponse<Activity>['data']> => {
    const res = await api.get<PaginatedResponse<Activity>>(
      `/api/contacts/${contactId}/activities`,
      { params: filters },
    );
    return res.data.data;
  },

  getAll: async (
    filters?: Partial<ActivityFiltersInput>,
  ): Promise<PaginatedResponse<Activity>['data']> => {
    const res = await api.get<PaginatedResponse<Activity>>('/api/activities', {
      params: filters,
    });
    return res.data.data;
  },

  create: async (data: ActivityCreate): Promise<Activity> => {
    const res = await api.post<ApiResponse<Activity>>(
      `/api/contacts/${data.contactId}/activities`,
      data,
    );
    return res.data.data;
  },

  update: async (id: string, data: ActivityUpdate): Promise<Activity> => {
    const res = await api.put<ApiResponse<Activity>>(
      `/api/activities/${id}`,
      data,
    );
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/activities/${id}`);
  },
};
