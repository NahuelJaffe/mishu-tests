// Global setup for Playwright tests
const { chromium } = require('@playwright/test');

async function globalSetup(config) {
  console.log('🚀 Starting global setup...');
  
  // Create a browser instance for global setup
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  try {
    // Test if the application is accessible
    console.log('📡 Testing application accessibility...');
    await page.goto('https://mishu.co.il', { 
      timeout: 30000,
      waitUntil: 'networkidle' 
    });
    
    const title = await page.title();
    console.log(`✅ Application accessible. Title: ${title}`);
    
    // Test login page accessibility
    console.log('🔐 Testing login page...');
    await page.goto('https://mishu.co.il/login', { 
      timeout: 30000,
      waitUntil: 'networkidle' 
    });
    
    const loginTitle = await page.title();
    console.log(`✅ Login page accessible. Title: ${loginTitle}`);
    
    // Store global state if needed
    await page.context().storageState({ path: 'global-auth-state.json' });
    console.log('💾 Global auth state saved');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error.message);
    throw error;
  } finally {
    await browser.close();
    console.log('🏁 Global setup completed');
  }
}

module.exports = globalSetup;
