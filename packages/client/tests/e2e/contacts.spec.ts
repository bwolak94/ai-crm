import { test, expect, request } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';
import { ContactsPage } from './pages/ContactsPage';
import { ContactDetailPage } from './pages/ContactDetailPage';

const TEST_EMAIL = 'e2e-test@example.com';
const TEST_PASSWORD = 'E2eTestPass123!';
const API_URL = process.env.E2E_API_URL || 'http://localhost:4000';

let accessToken: string;

test.beforeAll(async () => {
  const api = await request.newContext({ baseURL: API_URL });
  const res = await api.post('/api/auth/login', {
    data: { email: TEST_EMAIL, password: TEST_PASSWORD },
  });
  const body = await res.json();
  accessToken = body.data.accessToken;
  await api.dispose();
});

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(TEST_EMAIL, TEST_PASSWORD);
  await loginPage.waitForRedirect('/app/contacts');
});

test.describe('Contacts', () => {
  test('display contact list after creating via API', async ({ page }) => {
    const api = await request.newContext({ baseURL: API_URL });
    await api.post('/api/contacts', {
      headers: { Authorization: `Bearer ${accessToken}` },
      data: {
        name: 'API Seeded Contact',
        email: `seeded-${Date.now()}@example.com`,
        status: 'lead',
      },
    });
    await api.dispose();

    const contactsPage = new ContactsPage(page);
    await contactsPage.goto();

    await expect(contactsPage.contactItems.first()).toBeVisible();
  });

  test('create new contact via form appears in list', async ({ page }) => {
    const contactsPage = new ContactsPage(page);
    const uniqueEmail = `e2e-create-${Date.now()}@example.com`;

    await contactsPage.createContact({
      name: 'E2E Created Contact',
      email: uniqueEmail,
      company: 'E2E Corp',
    });

    await expect(contactsPage.contactForm).not.toBeVisible({ timeout: 5000 });
    await expect(contactsPage.contactByName('E2E Created Contact')).toBeVisible();
  });

  test('click contact navigates to detail page', async ({ page }) => {
    const contactsPage = new ContactsPage(page);
    const uniqueEmail = `e2e-detail-${Date.now()}@example.com`;

    await contactsPage.createContact({
      name: 'Detail Test Contact',
      email: uniqueEmail,
    });

    await expect(contactsPage.contactForm).not.toBeVisible({ timeout: 5000 });
    await contactsPage.clickContact('Detail Test Contact');

    await expect(page).toHaveURL(/\/app\/contacts\/.+/);
    await expect(page.getByText('Detail Test Contact')).toBeVisible();
  });

  test('edit contact persists changes', async ({ page }) => {
    const contactsPage = new ContactsPage(page);
    const uniqueEmail = `e2e-edit-${Date.now()}@example.com`;

    await contactsPage.createContact({
      name: 'Edit Me Contact',
      email: uniqueEmail,
    });

    await expect(contactsPage.contactForm).not.toBeVisible({ timeout: 5000 });
    await contactsPage.clickContact('Edit Me Contact');
    await expect(page).toHaveURL(/\/app\/contacts\/.+/);

    const detailPage = new ContactDetailPage(page);
    await detailPage.updateName('Edited Contact Name');

    await expect(detailPage.contactFormSubmit).toBeEnabled();
  });

  test('delete contact removes it from list', async ({ page }) => {
    const contactsPage = new ContactsPage(page);
    const uniqueEmail = `e2e-delete-${Date.now()}@example.com`;

    await contactsPage.createContact({
      name: 'Delete Me Contact',
      email: uniqueEmail,
    });

    await expect(contactsPage.contactForm).not.toBeVisible({ timeout: 5000 });
    await contactsPage.clickContact('Delete Me Contact');
    await expect(page).toHaveURL(/\/app\/contacts\/.+/);

    const detailPage = new ContactDetailPage(page);
    await detailPage.deleteContact();

    await expect(page).toHaveURL(/\/app\/contacts$/);
    await expect(contactsPage.contactByName('Delete Me Contact')).not.toBeVisible();
  });
});
