import { AuthService } from '../../src/modules/auth/auth.service';
import { IUserRepository } from '../../src/modules/auth/user.repository';
import { IUser } from '../../src/modules/auth/user.model';
import { ConflictError } from '../../src/shared/errors/ConflictError';
import { UnauthorizedError } from '../../src/shared/errors/UnauthorizedError';
import { NotFoundError } from '../../src/shared/errors/NotFoundError';

jest.mock('../../src/shared/utils/jwt', () => ({
  signAccessToken: jest.fn().mockReturnValue('mock-access-token'),
  signRefreshToken: jest.fn().mockReturnValue('mock-refresh-token'),
  verifyToken: jest.fn().mockReturnValue({ userId: 'user-123' }),
}));

jest.mock('../../src/shared/utils/hash', () => ({
  hashToken: jest.fn().mockReturnValue('hashed-token'),
}));

const { verifyToken } = jest.requireMock('../../src/shared/utils/jwt') as {
  verifyToken: jest.Mock;
};

const USER_ID = '507f1f77bcf86cd799439012';

const mockUser: Partial<IUser> = {
  _id: USER_ID as unknown as IUser['_id'],
  email: 'test@example.com',
  name: 'Test User',
  role: 'user',
  password: 'hashed-password',
  refreshTokens: ['hashed-token'],
  comparePassword: jest.fn(),
};

function createMockRepository(): jest.Mocked<IUserRepository> {
  return {
    findById: jest.fn(),
    findByIdWithTokens: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    addRefreshToken: jest.fn(),
    removeRefreshToken: jest.fn(),
    clearRefreshTokens: jest.fn(),
    updateLastLogin: jest.fn(),
  };
}

describe('AuthService', () => {
  let service: AuthService;
  let repository: jest.Mocked<IUserRepository>;

  beforeEach(() => {
    repository = createMockRepository();
    service = new AuthService(repository);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return tokens', async () => {
      repository.findByEmail.mockResolvedValue(null);
      repository.create.mockResolvedValue(mockUser as IUser);
      repository.addRefreshToken.mockResolvedValue(undefined);

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(repository.create).toHaveBeenCalledTimes(1);
      expect(repository.addRefreshToken).toHaveBeenCalledTimes(1);
    });

    it('should throw ConflictError on duplicate email', async () => {
      repository.findByEmail.mockResolvedValue(mockUser as IUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User',
        }),
      ).rejects.toThrow(ConflictError);

      expect(repository.create).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const userWithPassword = {
        ...mockUser,
        comparePassword: jest.fn().mockResolvedValue(true),
      };
      repository.findByEmail.mockResolvedValue(userWithPassword as unknown as IUser);
      repository.updateLastLogin.mockResolvedValue(undefined);
      repository.addRefreshToken.mockResolvedValue(undefined);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBe('mock-access-token');
      expect(repository.updateLastLogin).toHaveBeenCalledWith(USER_ID);
    });

    it('should throw UnauthorizedError for wrong email', async () => {
      repository.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'wrong@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for wrong password', async () => {
      const userWithPassword = {
        ...mockUser,
        comparePassword: jest.fn().mockResolvedValue(false),
      };
      repository.findByEmail.mockResolvedValue(userWithPassword as unknown as IUser);

      await expect(
        service.login({ email: 'test@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('refresh', () => {
    it('should rotate tokens on valid refresh', async () => {
      verifyToken.mockReturnValue({ userId: USER_ID });
      repository.findByIdWithTokens.mockResolvedValue(mockUser as IUser);
      repository.removeRefreshToken.mockResolvedValue(undefined);
      repository.addRefreshToken.mockResolvedValue(undefined);

      const result = await service.refresh('valid-refresh-token');

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(repository.removeRefreshToken).toHaveBeenCalledWith(USER_ID, 'hashed-token');
      expect(repository.addRefreshToken).toHaveBeenCalledTimes(1);
    });

    it('should throw when token is not in DB (token reuse detection)', async () => {
      verifyToken.mockReturnValue({ userId: USER_ID });
      const userWithNoTokens = { ...mockUser, refreshTokens: [] };
      repository.findByIdWithTokens.mockResolvedValue(userWithNoTokens as unknown as IUser);

      await expect(service.refresh('stolen-token')).rejects.toThrow(UnauthorizedError);
      expect(repository.clearRefreshTokens).toHaveBeenCalledWith(USER_ID);
    });

    it('should throw when user not found', async () => {
      verifyToken.mockReturnValue({ userId: 'nonexistent' });
      repository.findByIdWithTokens.mockResolvedValue(null);

      await expect(service.refresh('some-token')).rejects.toThrow(UnauthorizedError);
    });

    it('should throw when token verification fails', async () => {
      verifyToken.mockImplementation(() => {
        throw new UnauthorizedError('Invalid or expired token');
      });

      await expect(service.refresh('expired-token')).rejects.toThrow(UnauthorizedError);
    });
  });

  describe('logout', () => {
    it('should remove the refresh token', async () => {
      repository.removeRefreshToken.mockResolvedValue(undefined);

      await service.logout(USER_ID, 'refresh-token');

      expect(repository.removeRefreshToken).toHaveBeenCalledWith(USER_ID, 'hashed-token');
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      repository.findById.mockResolvedValue(mockUser as IUser);

      const result = await service.getProfile(USER_ID);

      expect(result.email).toBe('test@example.com');
      expect(result.name).toBe('Test User');
    });

    it('should throw NotFoundError for missing user', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.getProfile('nonexistent')).rejects.toThrow(NotFoundError);
    });
  });
});
