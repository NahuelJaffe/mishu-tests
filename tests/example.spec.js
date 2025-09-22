const { test, expect } = require('@playwright/test');

test('Home page loads correctly', async ({ page }) => {
  await page.goto('https://mishu-web--pr69-performance-and-prof-8fsc02so.web.app/');
  await expect(page).toHaveTitle(/mishu | Child Safety Monitoring/);
});

