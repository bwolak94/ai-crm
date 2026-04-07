import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../../config/env';
import { UnauthorizedError } from '../errors/UnauthorizedError';

interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
}

interface RefreshTokenPayload {
  userId: string;
}

export function signAccessToken(payload: AccessTokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_ACCESS_EXPIRES as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET, options);
}

export function signRefreshToken(payload: RefreshTokenPayload): string {
  const options: SignOptions = { expiresIn: env.JWT_REFRESH_EXPIRES as SignOptions['expiresIn'] };
  return jwt.sign(payload, env.JWT_SECRET + '_refresh', options);
}

export function verifyToken<T = Record<string, unknown>>(
  token: string,
  isRefresh = false,
): T {
  try {
    const secret = isRefresh ? env.JWT_SECRET + '_refresh' : env.JWT_SECRET;
    return jwt.verify(token, secret) as T;
  } catch {
    throw new UnauthorizedError('Invalid or expired token');
  }
}
