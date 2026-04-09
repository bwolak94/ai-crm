import { request } from '@playwright/test';

const API_URL = process.env.E2E_API_URL || 'http://localhost:4000';

export default async function globalSetup() {
  const api = await request.newContext({ baseURL: API_URL });

  // Create test user for E2E tests
  const registerRes = await api.post('/api/auth/register', {
    data: {
      email: 'e2e-test@example.com',
      password: 'E2eTestPass123!',
      name: 'E2E Test User',
    },
  });

  if (registerRes.ok()) {
    const body = await registerRes.json();
    process.env.E2E_ACCESS_TOKEN = body.data.accessToken;
  } else {
    // User may already exist — try login
    const loginRes = await api.post('/api/auth/login', {
      data: {
        email: 'e2e-test@example.com',
        password: 'E2eTestPass123!',
      },
    });
    if (loginRes.ok()) {
      const body = await loginRes.json();
      process.env.E2E_ACCESS_TOKEN = body.data.accessToken;
    }
  }

  await api.dispose();
}
