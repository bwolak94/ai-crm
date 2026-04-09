import { api } from '@/shared/lib/axios';
import type {
  ApiResponse,
  PaginatedResponse,
  DealCreate,
  DealUpdate,
  DealStageUpdate,
  DealFiltersInput,
} from '@ai-crm/shared';

export interface Deal extends DealCreate {
  _id: string;
  contactName?: string;
  createdAt: string;
  updatedAt: string;
  stageChangedAt?: string;
}

export const pipelineApi = {
  getAll: async (
    filters?: Partial<DealFiltersInput>,
  ): Promise<PaginatedResponse<Deal>['data']> => {
    const res = await api.get<PaginatedResponse<Deal>>('/api/deals', {
      params: filters,
    });
    return res.data.data;
  },

  getById: async (id: string): Promise<Deal> => {
    const res = await api.get<ApiResponse<Deal>>(`/api/deals/${id}`);
    return res.data.data;
  },

  create: async (data: DealCreate): Promise<Deal> => {
    const res = await api.post<ApiResponse<Deal>>('/api/deals', data);
    return res.data.data;
  },

  update: async (id: string, data: DealUpdate): Promise<Deal> => {
    const res = await api.put<ApiResponse<Deal>>(`/api/deals/${id}`, data);
    return res.data.data;
  },

  updateStage: async (id: string, data: DealStageUpdate): Promise<Deal> => {
    const res = await api.patch<ApiResponse<Deal>>(
      `/api/deals/${id}/stage`,
      data,
    );
    return res.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/api/deals/${id}`);
  },
};
