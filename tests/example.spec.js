const { test, expect } = require('@playwright/test');

test('Home page loads correctly', async ({ page }) => {
  await page.goto('https://your-app.example.com/');
  await expect(page).toHaveTitle(/mishu | Child Safety Monitoring/);
});

