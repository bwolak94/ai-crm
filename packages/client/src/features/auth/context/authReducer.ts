export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated';
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: AuthUser; accessToken: string } }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'RESTORE_SESSION'; payload: { user: AuthUser; accessToken: string } }
  | { type: 'TOKEN_REFRESHED'; payload: { accessToken: string } };

const TOKEN_KEY = 'ai-crm-token';

export function getInitialState(): AuthState {
  const accessToken = localStorage.getItem(TOKEN_KEY);

  if (!accessToken) {
    return { user: null, accessToken: null, status: 'unauthenticated' };
  }

  const user = decodeTokenPayload(accessToken);
  if (!user) {
    localStorage.removeItem(TOKEN_KEY);
    return { user: null, accessToken: null, status: 'unauthenticated' };
  }

  return { user, accessToken, status: 'authenticated' };
}

export function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return { ...state, status: 'loading' };

    case 'LOGIN_SUCCESS':
      localStorage.setItem(TOKEN_KEY, action.payload.accessToken);
      return {
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        status: 'authenticated',
      };

    case 'LOGIN_FAILURE':
      return { user: null, accessToken: null, status: 'unauthenticated' };

    case 'LOGOUT':
      localStorage.removeItem(TOKEN_KEY);
      return { user: null, accessToken: null, status: 'unauthenticated' };

    case 'RESTORE_SESSION':
      localStorage.setItem(TOKEN_KEY, action.payload.accessToken);
      return {
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        status: 'authenticated',
      };

    case 'TOKEN_REFRESHED':
      localStorage.setItem(TOKEN_KEY, action.payload.accessToken);
      return { ...state, accessToken: action.payload.accessToken };

    default:
      return state;
  }
}

function decodeTokenPayload(token: string): AuthUser | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]!)) as {
      userId: string;
      email: string;
      role: string;
      exp: number;
    };

    if (payload.exp * 1000 < Date.now()) return null;

    return {
      id: payload.userId,
      email: payload.email,
      name: payload.email.split('@')[0]!,
      role: payload.role,
    };
  } catch {
    return null;
  }
}
