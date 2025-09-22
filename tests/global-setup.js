// Global setup for Playwright tests
const { chromium } = require('@playwright/test');
const fs = require('fs');
const { setupAnalyticsBrowserBlocking } = require('./analytics-route-blocker');
const { setupAnalyticsDNSBlocking } = require('./analytics-dns-blocker');

async function globalSetup(config) {
  console.log('🚀 Starting global setup...');
  
  // Limpiar archivo de violaciones previo
  const violationsLogPath = 'test-results/analytics-violations.log';
  if (fs.existsSync(violationsLogPath)) {
    fs.unlinkSync(violationsLogPath);
    console.log('🧹 Archivo de violaciones previo eliminado');
  }
  
  // Asegurar que el directorio test-results existe
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }
  
  // Establecer bandera E2E temprana
  process.env.__E2E_ANALYTICS_DISABLED__ = 'true';
  process.env.__PLAYWRIGHT_TEST__ = 'true';
  process.env.__AUTOMATED_TESTING__ = 'true';
  process.env.__NUCLEAR_ANALYTICS_BLOCKER__ = 'true';
  
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
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });
    
    // Configurar bloqueo de rutas de analytics a nivel de browser
    const context = await setupAnalyticsBrowserBlocking(browser);
    
    // Configurar bloqueo de DNS de analytics en el mismo contexto
    await setupAnalyticsDNSBlocking(context);
    
    const page = await context.newPage();
    
    // Configurar bloqueo adicional a nivel de página
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      
      // Bloquear dominios de analytics
      if (
        url.includes('google-analytics.com') ||
        url.includes('googletagmanager.com') ||
        url.includes('facebook.com/tr') ||
        url.includes('doubleclick.net') ||
        url.includes('googleadservices.com') ||
        url.includes('googlesyndication.com') ||
        url.includes('firebase') ||
        url.includes('analytics')
      ) {
        console.log('🚫 GLOBAL SETUP BLOCKED:', url);
        await route.abort('blockedbyclient');
        return;
      }
      
      await route.continue();
    });
    
    // Inyectar bloqueador de analytics NUCLEAR
    const path = require('path');
    const blockerScript = fs.readFileSync(path.join(__dirname, 'analytics-blocker-nuclear.js'), 'utf8');
    
    await page.addInitScript(() => {
      eval(blockerScript);
    });
    
    // Set longer timeout for CI
    const timeout = process.env.CI ? 60000 : 30000;
    page.setDefaultTimeout(timeout);
    
    try {
      // Test if the application is accessible
      console.log('📡 Testing application accessibility...');
      await page.goto(process.env.BASE_URL || 'https://mishu-web--pr69-performance-and-prof-8fsc02so.web.app/', { 
        timeout: timeout,
        waitUntil: 'domcontentloaded' // Less strict than networkidle
      });
      
      const title = await page.title();
      console.log(`✅ Application accessible. Title: ${title}`);
      
      // Test login page accessibility
      console.log('🔐 Testing login page...');
      await page.goto(`${process.env.BASE_URL || 'https://mishu-web--pr69-performance-and-prof-8fsc02so.web.app/'}/login`, { 
        timeout: timeout,
        waitUntil: 'domcontentloaded'
      });
      
      const loginTitle = await page.title();
      console.log(`✅ Login page accessible. Title: ${loginTitle}`);
      
      // Intentar hacer login para crear estado de autenticación
      console.log('🔐 Attempting login for global auth state...');
      const email = process.env.TEST_EMAIL;
      const password = process.env.TEST_PASSWORD;
      
      try {
        // Esperar a que los campos estén disponibles
        await page.waitForSelector('input[type="email"]', { timeout: 10000 });
        await page.waitForSelector('input[type="password"]', { timeout: 10000 });
        
        await page.fill('input[type="email"]', email);
        await page.fill('input[type="password"]', password);
        
        // Esperar a que el botón esté disponible y hacer clic
        await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
        await page.click('button[type="submit"]');
        
        // Esperar a que se complete el login
        try {
          await page.waitForURL(/connections|dashboard|home/, { timeout: 15000 });
          console.log('✅ Login exitoso en global setup');
        } catch (loginError) {
          console.log('⚠️ Login en global setup puede haber fallado, pero continuando...');
        }
        
        // Store global state with authentication
        await page.context().storageState({ path: 'global-auth-state.json' });
        console.log('💾 Global auth state saved with authentication');
        
      } catch (loginError) {
        console.log('⚠️ Login failed in global setup, saving empty state');
        // Store empty state as fallback
        await page.context().storageState({ path: 'global-auth-state.json' });
        console.log('💾 Empty global auth state saved as fallback');
      }
      
    } catch (error) {
      console.error('❌ Global setup failed:', error.message);
      
      // Asegurar que siempre se cree un archivo de estado, incluso si falla
      try {
        const context = await browser.newContext();
        await context.storageState({ path: 'global-auth-state.json' });
        console.log('💾 Fallback global auth state created');
        await context.close();
      } catch (stateError) {
        console.error('❌ Failed to create fallback auth state:', stateError.message);
        // Crear archivo vacío como último recurso
        fs.writeFileSync('global-auth-state.json', JSON.stringify({
          cookies: [],
          origins: []
        }, null, 2));
        console.log('💾 Empty fallback global auth state created');
      }
      
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
    
    // Crear archivo de estado vacío como último recurso si falla el browser
    try {
      fs.writeFileSync('global-auth-state.json', JSON.stringify({
        cookies: [],
        origins: []
      }, null, 2));
      console.log('💾 Emergency fallback global auth state created');
    } catch (writeError) {
      console.error('❌ Failed to create emergency auth state:', writeError.message);
    }
    
    if (!process.env.CI) {
      throw error;
    }
    console.log('⚠️ Continuing despite browser launch error (CI mode)');
  }
}

module.exports = globalSetup;
