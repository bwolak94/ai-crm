import { api } from '@/shared/lib/axios';
import type { ApiResponse, Login, Register } from '@ai-crm/shared';

interface AuthResponseData {
  token: string;
  user: { id: string; email: string; name: string };
}

export const authApi = {
  login: async (data: Login): Promise<AuthResponseData> => {
    const res = await api.post<ApiResponse<AuthResponseData>>('/api/auth/login', data);
    return res.data.data;
  },

  register: async (data: Register): Promise<AuthResponseData> => {
    const res = await api.post<ApiResponse<AuthResponseData>>('/api/auth/register', data);
    return res.data.data;
  },
};
