import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { asyncHandler } from '../../shared/utils/asyncHandler';
import { sendSuccess } from '../../shared/utils/response';
import { env } from '../../config/env';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000,
  path: '/',
};

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  register = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.register(req.body);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 'Registration successful', 201);
  });

  login = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const result = await this.authService.login(req.body);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    sendSuccess(res, { user: result.user, accessToken: result.accessToken }, 'Login successful');
  });

  refresh = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.refreshToken as string | undefined;
    if (!token) {
      res.status(401).json({ success: false, message: 'Refresh token not found' });
      return;
    }

    const result = await this.authService.refresh(token);
    res.cookie('refreshToken', result.refreshToken, REFRESH_COOKIE_OPTIONS);
    sendSuccess(res, { accessToken: result.accessToken });
  });

  logout = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const token = req.cookies?.refreshToken as string | undefined;
    if (token) {
      await this.authService.logout(req.user!.userId, token);
    }
    res.clearCookie('refreshToken', { path: '/' });
    sendSuccess(res, null, 'Logged out');
  });

  getProfile = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const user = await this.authService.getProfile(req.user!.userId);
    sendSuccess(res, user);
  });
}
