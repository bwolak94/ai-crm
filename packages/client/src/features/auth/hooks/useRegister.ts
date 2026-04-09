import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { Register } from '@ai-crm/shared';
import { authApi } from '../api/auth.api';

export function useRegister() {
  const { dispatch } = useAuth();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: Register) => authApi.register(data),
    onSuccess: (data) => {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: data.user, accessToken: data.accessToken },
      });
      navigate('/contacts');
    },
  });
}
