// playwright.config.js
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
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
    baseURL: process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/',
    
    // Global test options
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Timeouts - longer for CI
    actionTimeout: process.env.CI ? 15000 : 10000,
    navigationTimeout: process.env.CI ? 45000 : 30000,
    
    // CI-specific options
    ignoreHTTPSErrors: true,
    
    // Use saved authentication state
    storageState: 'global-auth-state.json',
    
    // Exclude from Firebase Analytics
    userAgent: 'PlaywrightTestBot/1.0 (automated testing; exclude from analytics)',
    extraHTTPHeaders: {
      'X-Test-Environment': 'automation',
      'X-Playwright-Test': 'true'
    },
    
    // Inyectar script para deshabilitar analytics en cada página
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
    },
  },
  projects: [
    // Chrome - Main browser for testing
    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'],
        // Configuración específica para CI
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
            'security.tls.insecure_fallback_hosts': 'mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app'
          },
          args: ['--disable-web-security']
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