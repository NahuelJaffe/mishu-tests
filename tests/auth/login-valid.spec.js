const { test, expect } = require('@playwright/test');

test('TC-01: Login with valid credentials', async ({ page }) => {
  await page.goto('https://mishu.co.il/login');
  await page.fill('input[name="email"]', 'testuser@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL(/dashboard/);
});

