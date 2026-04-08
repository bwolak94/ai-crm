import { createContext, useReducer, useCallback, useMemo, type ReactNode } from 'react';
import type { Login } from '@ai-crm/shared';
import { authApi } from '../api/auth.api';
import { authReducer, getInitialState, type AuthState, type AuthUser } from './authReducer';

interface AuthContextValue {
  state: AuthState;
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (credentials: Login) => Promise<void>;
  logout: () => Promise<void>;
  dispatch: React.Dispatch<Parameters<typeof authReducer>[1]>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, undefined, getInitialState);

  const login = useCallback(async (credentials: Login): Promise<void> => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const data = await authApi.login(credentials);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: data.user, accessToken: data.accessToken },
      });
    } catch {
      dispatch({ type: 'LOGIN_FAILURE' });
      throw new Error('auth.loginError');
    }
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch {
      // Proceed with local logout even if API call fails
    }
    dispatch({ type: 'LOGOUT' });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      state,
      user: state.user,
      isAuthenticated: state.status === 'authenticated',
      login,
      logout,
      dispatch,
    }),
    [state, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
