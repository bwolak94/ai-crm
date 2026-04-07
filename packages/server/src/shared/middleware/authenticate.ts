import { RequestHandler } from 'express';
import { verifyToken } from '../utils/jwt';
import { UnauthorizedError } from '../errors/UnauthorizedError';

interface AccessTokenPayload {
  userId: string;
  email: string;
  role: string;
  iat: number;
  exp: number;
}

export const authenticate: RequestHandler = (req, _res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return next(new UnauthorizedError('Authentication required'));
    }

    const token = authHeader.slice(7);
    const payload = verifyToken<AccessTokenPayload>(token);
    (req as any).user = payload;
    next();
  } catch (err) {
    next(err);
  }
};
