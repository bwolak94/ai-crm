import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/auth.api';
import type { Register } from '@ai-crm/shared';

export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: Register) => authApi.register(data),
    onSuccess: (data) => {
      localStorage.setItem('ai-crm-token', data.token);
      navigate('/contacts');
    },
  });
}
