import request from 'supertest';
import mongoose from 'mongoose';
import { createApp } from '../../src/app';
import { ContactModel } from '../../src/modules/contacts/contact.model';
import { UserModel } from '../../src/modules/auth/user.model';

const app = createApp();

let accessToken: string;
let secondToken: string;

beforeAll(async () => {
  const mongoUri = process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/ai-crm-test';
  await mongoose.connect(mongoUri);

  // Create test user and get JWT
  const res1 = await request(app)
    .post('/api/auth/register')
    .send({ email: 'contacts-test@example.com', password: 'TestPass123!', name: 'Test User' });
  accessToken = res1.body.data.accessToken;

  // Create second user for ownership tests
  const res2 = await request(app)
    .post('/api/auth/register')
    .send({ email: 'other-user@example.com', password: 'TestPass123!', name: 'Other User' });
  secondToken = res2.body.data.accessToken;
});

afterEach(async () => {
  await ContactModel.deleteMany({});
});

afterAll(async () => {
  await UserModel.deleteMany({});
  await mongoose.connection.close();
});

const authHeader = () => `Bearer ${accessToken}`;
const otherAuthHeader = () => `Bearer ${secondToken}`;

describe('Contacts API', () => {
  const validContact = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    phone: '+1234567890',
    company: 'Acme Corp',
    status: 'lead',
    tags: ['vip'],
  };

  describe('POST /api/contacts', () => {
    it('should create a contact with valid data (201)', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader())
        .send(validContact);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe('jane@example.com');
      expect(res.body.data.name).toBe('Jane Doe');
      expect(res.body.data.company).toBe('Acme Corp');
    });

    it('should return 409 on duplicate email', async () => {
      await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader())
        .send(validContact);

      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader())
        .send(validContact);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should return 422 on invalid body', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader())
        .send({ name: 'J', email: 'not-an-email' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should return 401 on missing JWT', async () => {
      const res = await request(app)
        .post('/api/contacts')
        .send(validContact);

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/contacts', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader())
        .send(validContact);

      await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader())
        .send({ ...validContact, email: 'bob@example.com', name: 'Bob Smith', status: 'customer' });
    });

    it('should return paginated contacts', async () => {
      const res = await request(app)
        .get('/api/contacts')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(2);
      expect(res.body.data.total).toBe(2);
      expect(res.body.data.page).toBe(1);
    });

    it('should respect status filter', async () => {
      const res = await request(app)
        .get('/api/contacts?status=customer')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].status).toBe('customer');
    });

    it('should respect search query', async () => {
      const res = await request(app)
        .get('/api/contacts?search=Bob')
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
      expect(res.body.data.items.some((c: { name: string }) => c.name === 'Bob Smith')).toBe(true);
    });
  });

  describe('GET /api/contacts/:id', () => {
    it('should return contact when found', async () => {
      const createRes = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader())
        .send(validContact);

      const id = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/contacts/${id}`)
        .set('Authorization', authHeader());

      expect(res.status).toBe(200);
      expect(res.body.data.email).toBe('jane@example.com');
    });

    it('should return 404 for non-existent contact', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .get(`/api/contacts/${fakeId}`)
        .set('Authorization', authHeader());

      expect(res.status).toBe(404);
    });

    it('should return 404 for contact owned by another user', async () => {
      const createRes = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader())
        .send(validContact);

      const id = createRes.body.data._id;

      const res = await request(app)
        .get(`/api/contacts/${id}`)
        .set('Authorization', otherAuthHeader());

      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/contacts/:id', () => {
    it('should update an existing contact', async () => {
      const createRes = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader())
        .send(validContact);

      const id = createRes.body.data._id;

      const res = await request(app)
        .put(`/api/contacts/${id}`)
        .set('Authorization', authHeader())
        .send({ name: 'Jane Updated' });

      expect(res.status).toBe(200);
      expect(res.body.data.name).toBe('Jane Updated');
    });

    it('should return 404 for non-existent contact', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .put(`/api/contacts/${fakeId}`)
        .set('Authorization', authHeader())
        .send({ name: 'Updated' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/contacts/:id', () => {
    it('should soft-delete a contact (204)', async () => {
      const createRes = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader())
        .send(validContact);

      const id = createRes.body.data._id;

      const res = await request(app)
        .delete(`/api/contacts/${id}`)
        .set('Authorization', authHeader());

      expect(res.status).toBe(204);

      // Verify it's no longer returned
      const getRes = await request(app)
        .get(`/api/contacts/${id}`)
        .set('Authorization', authHeader());

      expect(getRes.status).toBe(404);
    });

    it('should return 404 for non-existent contact', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();

      const res = await request(app)
        .delete(`/api/contacts/${fakeId}`)
        .set('Authorization', authHeader());

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/contacts/bulk-status', () => {
    it('should update status for multiple contacts', async () => {
      const res1 = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader())
        .send(validContact);

      const res2 = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader())
        .send({ ...validContact, email: 'another@example.com', name: 'Another' });

      const ids = [res1.body.data._id, res2.body.data._id];

      const res = await request(app)
        .patch('/api/contacts/bulk-status')
        .set('Authorization', authHeader())
        .send({ ids, status: 'customer' });

      expect(res.status).toBe(200);
      expect(res.body.data.updated).toBe(2);
    });
  });

  describe('Full CRUD cycle', () => {
    it('should create, read, update, and delete a contact', async () => {
      // Create
      const createRes = await request(app)
        .post('/api/contacts')
        .set('Authorization', authHeader())
        .send(validContact);
      expect(createRes.status).toBe(201);
      const id = createRes.body.data._id;

      // Read
      const readRes = await request(app)
        .get(`/api/contacts/${id}`)
        .set('Authorization', authHeader());
      expect(readRes.status).toBe(200);
      expect(readRes.body.data.name).toBe('Jane Doe');

      // Update
      const updateRes = await request(app)
        .put(`/api/contacts/${id}`)
        .set('Authorization', authHeader())
        .send({ name: 'Jane Updated', status: 'customer' });
      expect(updateRes.status).toBe(200);
      expect(updateRes.body.data.name).toBe('Jane Updated');
      expect(updateRes.body.data.status).toBe('customer');

      // Delete
      const deleteRes = await request(app)
        .delete(`/api/contacts/${id}`)
        .set('Authorization', authHeader());
      expect(deleteRes.status).toBe(204);

      // Verify deleted
      const verifyRes = await request(app)
        .get(`/api/contacts/${id}`)
        .set('Authorization', authHeader());
      expect(verifyRes.status).toBe(404);
    });
  });
});
