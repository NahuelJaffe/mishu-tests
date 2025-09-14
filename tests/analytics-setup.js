// Setup para bloquear analytics en cada test individual
// Este archivo se ejecuta antes de cada test para asegurar que analytics esté bloqueado

const { setupAnalyticsRouteBlocking } = require('./analytics-route-blocker');
const fs = require('fs');
const path = require('path');
// DNS-level blocker removed to avoid over-blocking own hosts

/**
 * Setup que se ejecuta antes de cada test para bloquear analytics
 */
async function setupAnalyticsForTest(page) {
  console.log('🚫 Setting up analytics blocking for individual test...');
  
  // 1. Bloquear rutas de analytics a nivel de página
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    
    // Lista de dominios de analytics a bloquear
    const analyticsDomains = [
      'google-analytics.com',
      'googletagmanager.com',
      'googleadservices.com',
      'googlesyndication.com',
      'doubleclick.net',
      'facebook.com/tr',
      'connect.facebook.net',
      'facebook.net',
      // avoid generic substrings like 'analytics' or 'firebase'
      'mixpanel.com',
      'amplitude.com',
      'segment.io',
      'heap.io',
      'hotjar.com'
    ];
    
    // Verificar si la URL contiene algún dominio de analytics
    const isAnalyticsRequest = analyticsDomains.some(domain => url.includes(domain));
    
    if (isAnalyticsRequest) {
      console.log('🚫 TEST BLOCKED ROUTE:', url);
      
      // Escribir una entrada en el log de violaciones para verificación post-ejecución
      try {
        const outDir = path.join(process.cwd(), 'test-results');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        fs.appendFileSync(path.join(outDir, 'analytics-violations.log'), `${new Date().toISOString()}\t${url}\n`);
      } catch (e) {
        console.warn('⚠️ Could not write analytics violation log:', e.message);
      }
      
      // Abortar la request completamente
      await route.abort('blockedbyclient');
      return;
    }
    
    // Si no es analytics, continuar con la request normal
    await route.continue();
  });
  
  // 2. Establecer únicamente la flag antes de que cargue cualquier script de la app (nuclear blocker removed)
  await page.addInitScript(() => {
    // @ts-ignore
    window.__E2E_ANALYTICS_DISABLED__ = true;
  });
  
  // 3. Agregar parámetros de deshabilitación de analytics a las URLs (solo si no es una URL relativa)
  const originalGoto = page.goto;
  page.goto = async function(url, options = {}) {
    // Solo agregar parámetros si es una URL completa
    if (url.startsWith('http')) {
      const separator = url.includes('?') ? '&' : '?';
      const urlWithParams = `${url}${separator}disableAnalytics=1&noTracking=1&testMode=1`;
      return originalGoto.call(this, urlWithParams, options);
    }
    
    return originalGoto.call(this, url, options);
  };
  
  console.log('✅ Analytics blocking setup completed for test');
}

module.exports = {
  setupAnalyticsForTest
};
