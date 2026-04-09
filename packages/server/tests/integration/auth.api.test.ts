import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../../src/app';
import { UserModel } from '../../src/modules/auth/user.model';

const app = createApp();

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/ai-crm-test';
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  await UserModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Auth API', () => {
  const validUser = {
    email: 'auth-test@example.com',
    password: 'SecurePass123!',
    name: 'Auth Test',
  };

  describe('POST /api/auth/register', () => {
    it('should register with valid data and return 201', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('auth-test@example.com');
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should return 409 on duplicate email', async () => {
      await request(app).post('/api/auth/register').send(validUser);

      const res = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 on invalid body', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'bad', password: '123' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validUser);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: validUser.password });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.user.email).toBe(validUser.email);
    });

    it('should return 401 on wrong credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validUser.email, password: 'wrong-password' });

      expect(res.status).toBe(401);
    });

    it('should return 401 for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nobody@example.com', password: 'password123' });

      expect(res.status).toBe(401);
    });
  });

  describe('POST /api/auth/refresh', () => {
    it('should return new tokens on valid refresh', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      const cookies = registerRes.headers['set-cookie'];

      const res = await request(app)
        .post('/api/auth/refresh')
        .set('Cookie', cookies as string[]);

      expect(res.status).toBe(200);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('should return 401 on missing cookie', async () => {
      const res = await request(app).post('/api/auth/refresh');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return 200 when authenticated', async () => {
      const registerRes = await request(app)
        .post('/api/auth/register')
        .send(validUser);

      const token = registerRes.body.data.accessToken;

      const res = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe(validUser.email);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/auth/profile');

      expect(res.status).toBe(401);
    });
  });
});
