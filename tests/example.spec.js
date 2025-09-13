const { test, expect } = require('@playwright/test');

test('Home page loads correctly', async ({ page }) => {
  await page.goto('https://mishu-web--pr67-faq-0n1j2wio.web.app/');
  await expect(page).toHaveTitle(/mishu | Child Safety Monitoring/);
});

