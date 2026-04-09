import { api } from '@/shared/lib/axios';
import type { ApiResponse, Login, Register } from '@ai-crm/shared';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthResponseData {
  user: AuthUser;
  accessToken: string;
}

interface RefreshResponseData {
  accessToken: string;
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

  refresh: async (): Promise<RefreshResponseData> => {
    const res = await api.post<ApiResponse<RefreshResponseData>>('/api/auth/refresh');
    return res.data.data;
  },

  logout: async (): Promise<void> => {
    await api.post('/api/auth/logout');
  },

  getProfile: async (): Promise<AuthUser> => {
    const res = await api.get<ApiResponse<AuthUser>>('/api/auth/profile');
    return res.data.data;
  },
};
