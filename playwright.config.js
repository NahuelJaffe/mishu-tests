// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: process.env.CI ? 120000 : 60000, // Longer timeout for CI
  retries: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? [
    ['github'],
    ['html', { outputFolder: 'playwright-report' }],
    ['list']
  ] : [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }]
  ],
  use: {
    // Base URL for all tests
    baseURL: process.env.BASE_URL || 'https://mishu-web--pr67-faq-0n1j2wio.web.app/',
    
    // Global test options
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Timeouts - longer for CI
    actionTimeout: process.env.CI ? 15000 : 10000,
    navigationTimeout: process.env.CI ? 45000 : 30000,
    
    // CI-specific options
    ignoreHTTPSErrors: true,
  },
  projects: [
    // Chrome - Main browser for testing
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Chrome-specific options for CI stability
        launchOptions: {
          args: [
            '--disable-web-security',
            '--disable-features=VizDisplayCompositor',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--disable-gpu'
          ]
        }
      },
    },
    
    // Firefox - Secondary browser
    {
      name: 'firefox',
      use: { 
        ...devices['Desktop Firefox'],
        launchOptions: {
          firefoxUserPrefs: {
            'security.tls.insecure_fallback_hosts': 'mishu-web--pr67-faq-0n1j2wio.web.app'
          }
        }
      },
    },
    
    // Safari - WebKit testing
    {
      name: 'webkit',
      use: { 
        ...devices['Desktop Safari'],
        // WebKit doesn't support Chrome-specific launch args
        // Keep it simple for CI compatibility
      },
    },
    
    // Mobile testing (only in local development)
    ...(process.env.CI ? [] : [
      {
        name: 'Mobile Chrome',
        use: { ...devices['Pixel 5'] },
      },
      {
        name: 'Mobile Safari',
        use: { ...devices['iPhone 12'] },
      },
    ]),
  ],
  
  // Global setup and teardown (only in CI)
  ...(process.env.CI ? {
    globalSetup: require.resolve('./tests/global-setup.js'),
    globalTeardown: require.resolve('./tests/global-teardown.js'),
  } : {}),
});
