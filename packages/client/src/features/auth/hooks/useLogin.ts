import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import type { AuthLogin } from '@ai-crm/shared';

export function useLogin() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: AuthLogin) => authApi.login(data),
    onSuccess: (data) => {
      localStorage.setItem('ai-crm-token', data.token);
      navigate('/contacts');
    },
  });
}
