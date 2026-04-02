import request from 'supertest';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { createApp } from '../../src/app';
import { ContactModel } from '../../src/modules/contacts/contact.model';

const app = createApp();

const TEST_JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
const token = jwt.sign({ userId: 'testuser123', email: 'test@test.com' }, TEST_JWT_SECRET, { expiresIn: '1h' });

const authHeader = `Bearer ${token}`;

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/ai-crm-test';
  await mongoose.connect(mongoUri);
});

afterEach(async () => {
  await ContactModel.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('Contacts API', () => {
  const validContact = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    status: 'lead',
    tags: ['vip'],
  };

  describe('POST /api/contacts', () => {
    it('should create a contact with valid data', async () => {
      const res = await request(app).post('/api/contacts').set('Authorization', authHeader).send(validContact);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('jane@example.com');
    });

    it('should return 422 on invalid body', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader)
        .send({ name: 'J', email: 'not-an-email' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 on missing JWT', async () => {
      const res = await request(app).post('/api/contacts').send(validContact);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/contacts', () => {
    it('should return paginated contacts', async () => {
      await ContactModel.create(validContact);

      const res = await request(app).get('/api/contacts').set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.total).toBe(1);
    });
  });

  describe('PUT /api/contacts/:id', () => {
    it('should update an existing contact', async () => {
      const contact = await ContactModel.create(validContact);

      const res = await request(app)
        .put(`/api/contacts/${contact._id}`)
        .set('Authorization', authHeader)
        .send({ name: 'Jane Updated' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Jane Updated');
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('should delete a contact', async () => {
      const contact = await ContactModel.create(validContact);

      const res = await request(app).delete(`/api/contacts/${contact._id}`).set('Authorization', authHeader);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
