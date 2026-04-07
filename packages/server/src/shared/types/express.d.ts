import 'express';

declare module 'express' {
  interface Request {
    user?: {
      userId: string;
      email: string;
      role: string;
      iat: number;
      exp: number;
    };
  }
}
