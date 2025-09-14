// Global setup for Playwright tests
const { chromium } = require('@playwright/test');
const fs = require('fs');

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
        '--disable-gpu',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding'
      ]
    });
    
    const page = await browser.newPage();
    
    // Inyectar bloqueador de analytics más agresivo
    await page.addInitScript(() => {
      // Cargar y ejecutar el script de bloqueo
      const script = `(function() {
        'use strict';
        
        // Marcar como ambiente de testing
        window.__E2E_ANALYTICS_DISABLED__ = true;
        window.__PLAYWRIGHT_TEST__ = true;
        window.__AUTOMATED_TESTING__ = true;
        
        // Bloquear todas las funciones de analytics antes de que se definan
        const blockFunction = function() { /* blocked */ };
        
        // Bloquear Google Analytics (todas las versiones)
        window.gtag = blockFunction;
        window.ga = blockFunction;
        window.gaq = blockFunction;
        window._gaq = blockFunction;
        window.GoogleAnalyticsObject = 'ga';
        
        // Bloquear Facebook Pixel
        window.fbq = blockFunction;
        window._fbq = blockFunction;
        
        // Bloquear Firebase Analytics
        window.firebase = window.firebase || {};
        window.firebase.analytics = window.firebase.analytics || {};
        window.firebase.analytics.logEvent = blockFunction;
        window.firebase.analytics.setUserId = blockFunction;
        window.firebase.analytics.setUserProperties = blockFunction;
        
        console.log('🚫 Analytics blocking enabled in global setup');
      })();`;
      
      eval(script);
    });
    
    // Set longer timeout for CI
    const timeout = process.env.CI ? 60000 : 30000;
    page.setDefaultTimeout(timeout);
    
    try {
      // Test if the application is accessible
      console.log('📡 Testing application accessibility...');
      await page.goto(process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/', { 
        timeout: timeout,
        waitUntil: 'domcontentloaded' // Less strict than networkidle
      });
      
      const title = await page.title();
      console.log(`✅ Application accessible. Title: ${title}`);
      
      // Test login page accessibility
      console.log('🔐 Testing login page...');
      await page.goto(`${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}/login`, { 
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
