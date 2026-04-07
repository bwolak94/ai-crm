import { UserModel, IUser } from './user.model';

export interface IUserRepository {
  findById(id: string): Promise<IUser | null>;
  findByEmail(email: string, withPassword?: boolean): Promise<IUser | null>;
  create(data: { email: string; password: string; name: string }): Promise<IUser>;
  addRefreshToken(userId: string, hashedToken: string): Promise<void>;
  removeRefreshToken(userId: string, hashedToken: string): Promise<void>;
  clearRefreshTokens(userId: string): Promise<void>;
  updateLastLogin(userId: string): Promise<void>;
}

export class MongoUserRepository implements IUserRepository {
  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id).lean<IUser>().exec();
  }

  async findByEmail(email: string, withPassword = false): Promise<IUser | null> {
    return UserModel.findByEmail(email, withPassword);
  }

  async create(data: { email: string; password: string; name: string }): Promise<IUser> {
    return UserModel.create(data);
  }

  async addRefreshToken(userId: string, hashedToken: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $push: { refreshTokens: hashedToken },
    });
  }

  async removeRefreshToken(userId: string, hashedToken: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $pull: { refreshTokens: hashedToken },
    });
  }

  async clearRefreshTokens(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $set: { refreshTokens: [] },
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await UserModel.findByIdAndUpdate(userId, {
      $set: { lastLoginAt: new Date() },
    });
  }
}
