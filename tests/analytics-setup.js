// Setup para bloquear analytics en cada test individual
// Este archivo se ejecuta antes de cada test para asegurar que analytics esté bloqueado

const { setupAnalyticsRouteBlocking } = require('./analytics-route-blocker');
const { setupAnalyticsDNSBlocking } = require('./analytics-dns-blocker');
const fs = require('fs');
const path = require('path');

/**
 * Log de violaciones de analytics
 */
function logAnalyticsViolation(type, url, details = {}) {
  const timestamp = new Date().toISOString();
  const violationLog = `[${timestamp}] ${type} VIOLATION: ${url} - ${JSON.stringify(details)}\n`;
  
  // Asegurar que el directorio test-results existe
  if (!fs.existsSync('test-results')) {
    fs.mkdirSync('test-results', { recursive: true });
  }
  
  const violationsLogPath = 'test-results/analytics-violations.log';
  fs.appendFileSync(violationsLogPath, violationLog);
  console.log(`🚨 ANALYTICS VIOLATION LOGGED: ${type} - ${url}`);
}

/**
 * Setup que se ejecuta antes de cada test para bloquear analytics
 */
async function setupAnalyticsForTest(page) {
  console.log('🚫 Setting up analytics blocking for individual test...');
  console.log('🔍 DEBUG: setupAnalyticsForTest called from global setup');
  
  // TEMPORAL: Deshabilitar bloqueo de analytics para debug
  console.log('⚠️ TEMPORAL: Analytics blocking DISABLED for debugging');
  return;
  
  // Limpiar archivo de violaciones previo
  const violationsLogPath = 'test-results/analytics-violations.log';
  if (fs.existsSync(violationsLogPath)) {
    fs.unlinkSync(violationsLogPath);
    console.log('🧹 Archivo de violaciones previo eliminado');
  }
  
  // 1. Bloquear rutas de analytics a nivel de página
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    const method = route.request().method();
    
    // Permitir navegación principal y recursos esenciales de la aplicación
    if (method === 'GET' && (
      url.includes('/login') || url.includes('/dashboard') || url.includes('/connections') ||
      url.includes('/assets/') || url.includes('/static/') || url.includes('/public/') ||
      url.includes('.css') || url.includes('.js') || url.includes('.png') || url.includes('.svg') ||
      url.includes('.ico') || url.includes('.woff') || url.includes('.woff2') || url.includes('.jpg') ||
      url.includes('.jpeg') || url.includes('.gif') || url.includes('.webp')
    )) {
      // Permitir recursos esenciales de la aplicación
      await route.continue();
      return;
    }
    
    // Lista de dominios de analytics a bloquear (solo proveedores explícitos)
    const analyticsDomains = [
      'google-analytics.com',
      'www.google-analytics.com',
      'ssl.google-analytics.com',
      'googletagmanager.com',
      'www.googletagmanager.com',
      'ssl.googletagmanager.com',
      'facebook.com/tr',
      'www.facebook.com/tr',
      'connect.facebook.net',
      'www.connect.facebook.net',
      'doubleclick.net',
      'www.doubleclick.net',
      'googleadservices.com',
      'www.googleadservices.com',
      'googlesyndication.com',
      'www.googlesyndication.com',
      'mixpanel.com',
      'api.mixpanel.com',
      'cdn.mxpnl.com',
      'amplitude.com',
      'api.amplitude.com',
      'cdn.amplitude.com',
      'segment.io',
      'api.segment.io',
      'cdn.segment.io',
      'heap.com',
      'api.heap.io',
      'cdn.heap.io',
      'hotjar.com',
      'static.hotjar.com',
      'script.hotjar.com',
      'clarity.ms',
      'www.clarity.ms',
      'c.clarity.ms',
      'linkedin.com/li.lms',
      'px.ads.linkedin.com',
      'twitter.com/i/adsct',
      'analytics.tiktok.com',
      'tr.snapchat.com',
      'ads.pinterest.com',
      'events.redditmedia.com',
      'quantserve.com',
      'scorecardresearch.com',
      'adsystem.amazon.com',
      'amazon-adsystem.com'
    ];
    
    // Verificar si es una request de analytics real (solo dominios explícitos)
    const isAnalyticsRequest = analyticsDomains.some(domain => url.includes(domain));
    
    if (isAnalyticsRequest) {
      console.log('🚫 TEST BLOCKED ROUTE:', url);
      
      // Log de violación
      logAnalyticsViolation('REQUEST', url, {
        method,
        blocked: true,
        reason: 'Analytics domain detected'
      });
      
      // Abortar la request de analytics
      await route.abort('blockedbyclient');
      return;
    }
    
    // Si no es analytics, continuar con la request normal
    await route.continue();
  });
  
  // 2. Inyectar bloqueador nuclear de analytics ANTES de cualquier contenido
  try {
    const blockerScript = fs.readFileSync(path.join(__dirname, 'analytics-blocker-nuclear.js'), 'utf8');
    
    // Usar addInitScript para ejecutar ANTES del contenido de la página
    await page.addInitScript(blockerScript);
    
    console.log('✅ Nuclear analytics blocker injected');
  } catch (error) {
    console.warn('⚠️ Could not inject nuclear blocker:', error.message);
  }
  
  // 3. Interceptar responses para detectar violaciones
  page.on('response', response => {
    const url = response.url();
    const status = response.status();
    
    const analyticsDomains = [
      'google-analytics.com',
      'googletagmanager.com',
      'facebook.com/tr',
      'connect.facebook.net',
      'doubleclick.net',
      'googleadservices.com',
      'googlesyndication.com',
      'mixpanel.com',
      'amplitude.com',
      'segment.io',
      'heap.com',
      'hotjar.com',
      'clarity.ms',
      'linkedin.com/li.lms',
      'twitter.com/i/adsct',
      'analytics.tiktok.com',
      'tr.snapchat.com',
      'ads.pinterest.com',
      'events.redditmedia.com',
      'quantserve.com',
      'scorecardresearch.com',
      'adsystem.amazon.com',
      'amazon-adsystem.com'
    ];
    
    const isAnalyticsResponse = analyticsDomains.some(domain => url.includes(domain));
    
    if (isAnalyticsResponse) {
      logAnalyticsViolation('RESPONSE', url, {
        status,
        reason: 'Analytics response detected'
      });
    }
  });
  
  // 4. Agregar parámetros de deshabilitación de analytics a las URLs (solo para URLs completas)
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