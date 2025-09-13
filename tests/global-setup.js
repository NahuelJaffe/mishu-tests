// Global setup for Playwright tests
const { chromium } = require('@playwright/test');

async function globalSetup(config) {
  console.log('🚀 Starting global setup...');
  
  try {
    // Create a browser instance for global setup
    const browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set longer timeout for CI
    const timeout = process.env.CI ? 60000 : 30000;
    page.setDefaultTimeout(timeout);
    
    try {
      // Test if the application is accessible
      console.log('📡 Testing application accessibility...');
      await page.goto(process.env.BASE_URL || 'https://mishu-web--pr67-faq-0n1j2wio.web.app/', { 
        timeout: timeout,
        waitUntil: 'domcontentloaded' // Less strict than networkidle
      });
      
      const title = await page.title();
      console.log(`✅ Application accessible. Title: ${title}`);
      
      // Test login page accessibility
      console.log('🔐 Testing login page...');
      await page.goto(`${process.env.BASE_URL || 'https://mishu-web--pr67-faq-0n1j2wio.web.app/'}/login`, { 
        timeout: timeout,
        waitUntil: 'domcontentloaded'
      });
      
      const loginTitle = await page.title();
      console.log(`✅ Login page accessible. Title: ${loginTitle}`);
      
      // Store global state if needed
      await page.context().storageState({ path: 'global-auth-state.json' });
      console.log('💾 Global auth state saved');
      
    } catch (error) {
      console.error('❌ Global setup failed:', error.message);
      // Don't throw error in CI to allow tests to continue
      if (!process.env.CI) {
        throw error;
      }
      console.log('⚠️ Continuing despite global setup error (CI mode)');
    } finally {
      await browser.close();
      console.log('🏁 Global setup completed');
    }
    
  } catch (error) {
    console.error('❌ Browser launch failed:', error.message);
    if (!process.env.CI) {
      throw error;
    }
    console.log('⚠️ Continuing despite browser launch error (CI mode)');
  }
}

module.exports = globalSetup;
