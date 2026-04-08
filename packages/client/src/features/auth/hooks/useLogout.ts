import { useNavigate } from 'react-router-dom';
import { useAuth } from './useAuth';

export function useLogout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return async () => {
    await logout();
    navigate('/login');
  };
}
