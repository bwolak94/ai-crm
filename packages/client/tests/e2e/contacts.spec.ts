import { test, expect } from '@playwright/test';

test('create contact flow', async ({ page }) => {
  await page.goto('/login');

  await page.fill('input[type="email"]', 'test@example.com');
  await page.fill('input[type="password"]', 'password123');
  await page.click('button[type="submit"]');

  await expect(page).toHaveURL(/\/contacts/);

  await page.click('text=Create');

  await page.fill('input[name="name"]', 'New Contact');
  await page.fill('input[name="email"]', 'new@example.com');
  await page.fill('input[name="phone"]', '+1234567890');
  await page.fill('input[name="company"]', 'Test Company');

  await page.click('button[type="submit"]');

  await expect(page.locator('text=New Contact')).toBeVisible();
});
