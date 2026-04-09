import { test, expect, request } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { PipelinePage } from './pages/PipelinePage';

const TEST_EMAIL = 'e2e-test@example.com';
const TEST_PASSWORD = 'E2eTestPass123!';
const API_URL = process.env.E2E_API_URL || 'http://localhost:4000';

let accessToken: string;
let contactId: string;

test.beforeAll(async () => {
  const api = await request.newContext({ baseURL: API_URL });
  const loginRes = await api.post('/api/auth/login', {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });
  const loginBody = await loginRes.json();
  accessToken = loginBody.data.accessToken;

  // Create a contact for deal association
  const contactRes = await api.post('/api/contacts', {
    headers: { Authorization: `Bearer ${accessToken}` },
    data: {
      name: 'Pipeline Test Contact',
      email: `pipeline-${Date.now()}@example.com`,
      status: 'prospect',
    },
  });
  const contactBody = await contactRes.json();
  contactId = contactBody.data._id;

  await api.dispose();
});

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(TEST_EMAIL, TEST_PASSWORD);
  await loginPage.waitForRedirect('/app/contacts');
});

test.describe('Pipeline', () => {
  test('display pipeline board with columns', async ({ page }) => {
    const pipelinePage = new PipelinePage(page);
    await pipelinePage.goto();

    await expect(pipelinePage.column('discovery')).toBeVisible();
    await expect(pipelinePage.column('proposal')).toBeVisible();
    await expect(pipelinePage.column('negotiation')).toBeVisible();
    await expect(pipelinePage.column('closed_won')).toBeVisible();
    await expect(pipelinePage.column('closed_lost')).toBeVisible();
  });

  test('create deal via API appears in correct column', async ({ page }) => {
    // Seed a deal via API
    const api = await request.newContext({ baseURL: API_URL });
    await api.post('/api/deals', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        title: `E2E Test Deal ${Date.now()}`,
        value: 25000,
        contactId,
        stage: 'proposal',
        priority: 'high',
      },
    });
    await api.dispose();

    const pipelinePage = new PipelinePage(page);
    await pipelinePage.goto();

    // Deal should appear in the proposal column
    const proposalDeals = pipelinePage.dealsInColumn('proposal');
    await expect(proposalDeals.first()).toBeVisible();
  });

  test('deal card shows correct information', async ({ page }) => {
    const api = await request.newContext({ baseURL: API_URL });
    const dealTitle = `Info Deal ${Date.now()}`;
    await api.post('/api/deals', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        title: dealTitle,
        value: 50000,
        contactId,
        stage: 'discovery',
        priority: 'medium',
      },
    });
    await api.dispose();

    const pipelinePage = new PipelinePage(page);
    await pipelinePage.goto();

    const dealCard = pipelinePage.dealCards.filter({ hasText: dealTitle });
    await expect(dealCard).toBeVisible();
    await expect(dealCard).toContainText('$50,000');
  });
});
