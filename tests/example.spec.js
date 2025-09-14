const { test, expect } = require('@playwright/test');

test('Home page loads correctly', async ({ page }) => {
  await page.goto('https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/');
  await expect(page).toHaveTitle(/mishu | Child Safety Monitoring/);
});

