import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import { AuthLogin, AuthRegister } from '@ai-crm/shared';
import { UserModel } from './user.model';
import { AppError } from '../../shared/errors/AppError';
import { env } from '../../config/env';

export class AuthService {
  async register(data: AuthRegister): Promise<{ token: string; user: { id: string; email: string; name: string } }> {
    const existing = await UserModel.findOne({ email: data.email });
    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    const hashedPassword = await bcrypt.hash(data.password, 12);
    const user = await UserModel.create({
      email: data.email,
      password: hashedPassword,
      name: data.name,
    });

    const token = this.generateToken(user.id, user.email);

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  async login(data: AuthLogin): Promise<{ token: string; user: { id: string; email: string; name: string } }> {
    const user = await UserModel.findOne({ email: data.email }).select('+password');
    if (!user) {
      throw new AppError('Invalid credentials', 401);
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid credentials', 401);
    }

    const token = this.generateToken(user.id, user.email);

    return {
      token,
      user: { id: user.id, email: user.email, name: user.name },
    };
  }

  private generateToken(userId: string, email: string): string {
    const options: SignOptions = { expiresIn: env.JWT_EXPIRES_IN as SignOptions['expiresIn'] };
    return jwt.sign({ userId, email }, env.JWT_SECRET, options);
  }
}
