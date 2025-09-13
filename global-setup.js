const { chromium } = require('@playwright/test');

async function globalSetup(config) {
  console.log('🚀 Starting global setup...');
  
  const baseURL = process.env.BASE_URL || 'https://mishu-web--pr67-faq-0n1j2wio.web.app';
  const email = process.env.TEST_EMAIL || 'nahueljaffe+bugwpp@gmail.com';
  const password = process.env.TEST_PASSWORD || 'Tonna2-wahwon-gupreq';

  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  console.log('📡 Testing application accessibility...');
  await page.goto(baseURL);
  
  const title = await page.title();
  console.log(`✅ Application accessible. Title: ${title}`);
  
  console.log('🔐 Testing login page...');
  await page.goto(`${baseURL}/login`);
  
  const loginTitle = await page.title();
  console.log(`✅ Login page accessible. Title: ${loginTitle}`);
  
  // Realizar login y guardar estado
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  // Esperar redirección exitosa
  await page.waitForURL(/connections|dashboard|home/, { timeout: 15000 });
  
  console.log('💾 Global auth state saved');
  
  // Guardar estado de autenticación
  await page.context().storageState({ path: 'global-auth-state.json' });
  
  await browser.close();
  console.log('🏁 Global setup completed');
}

module.exports = globalSetup;
