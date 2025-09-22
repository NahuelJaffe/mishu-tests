// Optimized auth helper that uses saved authentication state
// This reduces the number of logins from ~120 to just 1 per test run

async function loginOptimized(page) {
  // If we already have auth state, we should be logged in
  // Just verify we're on a valid authenticated page
  const currentUrl = page.url();
  
  if (currentUrl.includes('/login')) {
    // If we're on login page, the auth state might have expired
    // Fall back to manual login
    const baseURL = process.env.BASE_URL || 'https://your-app.example.com';
    const email = process.env.TEST_EMAIL;
    const password = process.env.TEST_PASSWORD;
    
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/connections|dashboard|home/, { timeout: 15000 });
  } else if (!currentUrl.includes('/connections') && !currentUrl.includes('/dashboard') && !currentUrl.includes('/home')) {
    // Navigate to a known authenticated page
    const baseURL = process.env.BASE_URL || 'https://your-app.example.com';
    await page.goto(`${baseURL}/connections`);
  }
  
  // Verify we're authenticated by checking we're not on login page
  await page.waitForURL(/connections|dashboard|home/, { timeout: 10000 });
}

module.exports = { loginOptimized };
