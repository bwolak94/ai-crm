import { Login, Register } from '@ai-crm/shared';
import { IUserRepository } from './user.repository';
import { IUser } from './user.model';
import { ConflictError } from '../../shared/errors/ConflictError';
import { UnauthorizedError } from '../../shared/errors/UnauthorizedError';
import { signAccessToken, signRefreshToken, verifyToken } from '../../shared/utils/jwt';
import { hashToken } from '../../shared/utils/hash';

interface AuthResult {
  user: { id: string; email: string; name: string; role: string };
  accessToken: string;
  refreshToken: string;
}

interface TokenResult {
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  async register(data: Register): Promise<AuthResult> {
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError('Email already registered');
    }

    const user = await this.userRepository.create({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    const accessToken = signAccessToken({ userId: String(user._id), email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: String(user._id) });

    await this.userRepository.addRefreshToken(String(user._id), hashToken(refreshToken));

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async login(data: Login): Promise<AuthResult> {
    const user = await this.userRepository.findByEmail(data.email, true);
    if (!user) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isMatch = await user.comparePassword(data.password);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    await this.userRepository.updateLastLogin(String(user._id));

    const accessToken = signAccessToken({ userId: String(user._id), email: user.email, role: user.role });
    const refreshToken = signRefreshToken({ userId: String(user._id) });

    await this.userRepository.addRefreshToken(String(user._id), hashToken(refreshToken));

    return {
      user: this.sanitizeUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string): Promise<TokenResult> {
    const payload = verifyToken<{ userId: string }>(token, true);

    const userById = await this.findUserWithTokens(payload.userId);
    if (!userById) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const hashed = hashToken(token);
    if (!userById.refreshTokens.includes(hashed)) {
      await this.userRepository.clearRefreshTokens(payload.userId);
      throw new UnauthorizedError('Invalid refresh token — tokens revoked');
    }

    await this.userRepository.removeRefreshToken(payload.userId, hashed);

    const accessToken = signAccessToken({ userId: payload.userId, email: userById.email, role: userById.role });
    const refreshToken = signRefreshToken({ userId: payload.userId });

    await this.userRepository.addRefreshToken(payload.userId, hashToken(refreshToken));

    return { accessToken, refreshToken };
  }

  async logout(userId: string, token: string): Promise<void> {
    await this.userRepository.removeRefreshToken(userId, hashToken(token));
  }

  async getProfile(userId: string): Promise<{ id: string; email: string; name: string; role: string }> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedError('User not found');
    }
    return this.sanitizeUser(user);
  }

  private sanitizeUser(user: IUser): { id: string; email: string; name: string; role: string } {
    return {
      id: String(user._id),
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }

  private async findUserWithTokens(userId: string): Promise<IUser | null> {
    const { UserModel } = await import('./user.model');
    return UserModel.findById(userId).select('+refreshTokens').exec();
  }
}
