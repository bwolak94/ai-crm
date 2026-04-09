import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

const TEST_EMAIL = 'e2e-test@example.com';
const TEST_PASSWORD = 'E2eTestPass123!';

test.beforeEach(async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login(TEST_EMAIL, TEST_PASSWORD);
  await loginPage.waitForRedirect('/app/contacts');
  await page.goto('/app/ai-chat');
});

test.describe('AI Chat', () => {
  test('shows empty state with suggested queries', async ({ page }) => {
    await expect(page.getByTestId('suggested-queries')).toBeVisible();
    await expect(page.getByText('Ask anything about your CRM')).toBeVisible();
  });

  test('suggested query chip pre-fills and sends message', async ({ page }) => {
    const suggestions = page.getByTestId('suggested-queries');
    const firstChip = suggestions.locator('button').first();
    const chipText = await firstChip.textContent();

    await firstChip.click();

    // Should show user message
    const messages = page.getByTestId('ai-chat-message');
    await expect(messages.first()).toBeVisible();
    await expect(messages.first()).toContainText(chipText!.trim());
  });

  test('type and send a message shows user bubble', async ({ page }) => {
    const input = page.getByTestId('ai-chat-input');
    const sendButton = page.getByTestId('ai-chat-send');

    await input.fill('Show me all contacts');
    await sendButton.click();

    const messages = page.getByTestId('ai-chat-message');
    await expect(messages.first()).toBeVisible();
    await expect(messages.first()).toContainText('Show me all contacts');
  });

  test('Enter key sends message', async ({ page }) => {
    const input = page.getByTestId('ai-chat-input');

    await input.fill('Hello AI');
    await input.press('Enter');

    const messages = page.getByTestId('ai-chat-message');
    await expect(messages.first()).toBeVisible();
    await expect(messages.first()).toContainText('Hello AI');
  });
});
