import { api } from '@/shared/lib/axios';
import type { ApiResponse, AuthLogin, AuthRegister } from '@ai-crm/shared';

interface AuthResponseData {
  token: string;
  user: { id: string; email: string; name: string };
}

export const authApi = {
  login: async (data: AuthLogin): Promise<AuthResponseData> => {
    const res = await api.post<ApiResponse<AuthResponseData>>('/api/auth/login', data);
    return res.data.data;
  },

  register: async (data: AuthRegister): Promise<AuthResponseData> => {
    const res = await api.post<ApiResponse<AuthResponseData>>('/api/auth/register', data);
    return res.data.data;
  },
};
