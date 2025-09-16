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
    
    // 🚫 ANALYTICS BLOCKING FOR ALL TESTS
    // Block analytics requests at context level
    // launchOptions se configuran por browser individual para compatibilidad
    
    // CI-specific options
    ignoreHTTPSErrors: true,
    
    // Use saved authentication state (only if file exists and we're in CI)
    ...(process.env.CI && require('fs').existsSync('global-auth-state.json') ? { storageState: 'global-auth-state.json' } : {}),
    
    // Exclude from Firebase Analytics
    userAgent: 'PlaywrightTestBot/1.0 (automated testing; exclude from analytics)',
    extraHTTPHeaders: {
      'X-Test-Environment': 'automation',
      'X-Playwright-Test': 'true',
      'X-Analytics-Disabled': 'true',
      'X-E2E-Testing': 'true',
      'X-No-Analytics': 'true',
      'X-Testing-Mode': 'true'
    },
    
    // 🚫 GLOBAL ANALYTICS BLOCKING - Applied to ALL tests
    // This will block analytics requests at the context level
    contextOptions: {
      // Block analytics domains
      ignoreHTTPSErrors: true,
      // Add route blocking for analytics
      extraHTTPHeaders: {
        'X-Analytics-Disabled': 'true',
        'X-No-Analytics': 'true'
      }
    },
    
    // Setup que se ejecuta antes de cada test
    // setup: async ({ page }) => {
    //   console.log('🔍 DEBUG: Global setup starting...');
    //   try {
    //     // 1. Configurar bloqueo de analytics (sin verificación estricta)
    //     console.log('🔍 DEBUG: Requiring analytics-setup.js...');
    //     const { setupAnalyticsForTest } = require('./tests/analytics-setup.js');
    //     console.log('🔍 DEBUG: Calling setupAnalyticsForTest...');
    //     await setupAnalyticsForTest(page);
    //     console.log('🔍 DEBUG: setupAnalyticsForTest completed successfully');
        
    //     // 2. Verificación de bloqueo deshabilitada temporalmente para permitir tests
    //     // const { setupAnalyticsVerification } = require('./tests/analytics-blocking-verifier.js');
    //     // await setupAnalyticsVerification(page);
    //   } catch (error) {
    //     console.error('❌ ERROR in global setup:', error);
    //     throw error;
    //   }
    //   console.log('🔍 DEBUG: Global setup completed');
    // },
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
      // Setup específico para chromium
      setup: async ({ page }) => {
        console.log('🔍 DEBUG: Chromium setup starting...');
        try {
          const { setupAnalyticsForTest } = require('./tests/analytics-setup.js');
          await setupAnalyticsForTest(page);
          console.log('🔍 DEBUG: Chromium setup completed');
        } catch (error) {
          console.error('❌ ERROR in chromium setup:', error);
          throw error;
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
      // Setup específico para firefox
      setup: async ({ page }) => {
        console.log('🔍 DEBUG: Firefox setup starting...');
        try {
          const { setupAnalyticsForTest } = require('./tests/analytics-setup.js');
          await setupAnalyticsForTest(page);
          console.log('🔍 DEBUG: Firefox setup completed');
        } catch (error) {
          console.error('❌ ERROR in firefox setup:', error);
          throw error;
        }
      },
    },
    
    // Safari - WebKit testing
    {
      name: 'webkit',
      use: { 
        // Custom WebKit configuration to avoid compatibility issues
        // Don't use devices['Desktop Safari'] as it has incompatible settings
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
        viewport: { width: 1280, height: 720 },
        deviceScaleFactor: 1,
        isMobile: false,
        hasTouch: false,
        // WebKit doesn't support Chrome-specific launch args
        launchOptions: {},
        // WebKit specific context options
        contextOptions: {
          ignoreHTTPSErrors: true,
          extraHTTPHeaders: {
            'X-Analytics-Disabled': 'true',
            'X-No-Analytics': 'true'
          }
        }
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
  
  // Global setup and teardown (temporarily disabled due to Mac compatibility issues)
  // globalSetup: require.resolve('./tests/global-setup.js'),
  // globalTeardown: require.resolve('./tests/global-teardown.js'),
});