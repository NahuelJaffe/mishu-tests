const { test, expect } = require('@playwright/test');

test('Home page loads correctly', async ({ page }) => {
  await page.goto('https://mishu.co.il');
  await expect(page).toHaveTitle(/Mishu/);
});

