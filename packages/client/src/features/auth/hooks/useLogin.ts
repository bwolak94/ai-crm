import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import type { Login } from '@ai-crm/shared';

export function useLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  return useMutation({
    mutationFn: (data: Login) => login(data),
    onSuccess: () => {
      const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/app/contacts';
      navigate(from, { replace: true });
    },
  });
}
