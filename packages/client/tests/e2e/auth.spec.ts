import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

const TEST_EMAIL = 'e2e-test@example.com';
const TEST_PASSWORD = 'E2eTestPass123!';

test.describe('Authentication', () => {
  test('login with valid credentials redirects to /contacts', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_EMAIL, TEST_PASSWORD);
    await loginPage.waitForRedirect('/app/contacts');

    await expect(page).toHaveURL(/\/app\/contacts/);
  });

  test('login with invalid credentials shows error message', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('wrong@example.com', 'wrongpassword');

    await expect(loginPage.errorMessage).toBeVisible();
  });

  test('logout redirects to /login', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_EMAIL, TEST_PASSWORD);
    await loginPage.waitForRedirect('/app/contacts');

    const logoutButton = page.getByTestId('sidebar-logout');
    await logoutButton.click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('accessing protected route when not logged in redirects to /login', async ({ page }) => {
    await page.goto('/app/contacts');
    await expect(page).toHaveURL(/\/login/);
  });
});
