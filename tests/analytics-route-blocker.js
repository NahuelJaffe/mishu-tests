// Helper para bloquear rutas de analytics a nivel de Playwright
// Este archivo se usa para interceptar requests ANTES de que salgan del navegador

const analyticsDomains = [
  // Google Analytics
  'google-analytics.com',
  'www.google-analytics.com',
  'ssl.google-analytics.com',
  'googletagmanager.com',
  'www.googletagmanager.com',
  'ssl.googletagmanager.com',
  'googleadservices.com',
  'www.googleadservices.com',
  'googlesyndication.com',
  'www.googlesyndication.com',
  'doubleclick.net',
  'www.doubleclick.net',
  
  // Facebook
  'facebook.com/tr',
  'www.facebook.com/tr',
  'connect.facebook.net',
  'www.connect.facebook.net',
  'facebook.net',
  'www.facebook.net',
  
  // Firebase (solo dominios específicos)
  'firebaseapp.com',
  'firebaseio.com',
  'firebase.googleapis.com',
  'firebaseinstallations.googleapis.com',
  'firebaseremoteconfig.googleapis.com',
  
  // Mixpanel
  'mixpanel.com',
  'api.mixpanel.com',
  'cdn.mxpnl.com',
  
  // Amplitude
  'amplitude.com',
  'api.amplitude.com',
  'cdn.amplitude.com',
  
  // Segment
  'segment.io',
  'api.segment.io',
  'cdn.segment.io',
  
  // Heap
  'heap.com',
  'api.heap.io',
  'cdn.heap.io',
  
  // Hotjar
  'hotjar.com',
  'static.hotjar.com',
  'script.hotjar.com',
  
  // Clarity
  'clarity.ms',
  'www.clarity.ms',
  'c.clarity.ms',
  
  // LinkedIn
  'linkedin.com/li.lms',
  'px.ads.linkedin.com',
  
  // Twitter
  'twitter.com/i/adsct',
  't.co',
  
  // TikTok
  'tiktok.com/i18n/pixel',
  'analytics.tiktok.com',
  
  // Snapchat
  'snapchat.com',
  'tr.snapchat.com',
  
  // Pinterest
  'pinterest.com',
  'ads.pinterest.com',
  
  // Reddit
  'reddit.com/api/v2',
  'events.redditmedia.com',
  
  // Amazon
  'quantserve.com',
  'scorecardresearch.com',
  'adsystem.amazon.com',
  'amazon-adsystem.com'
];

/**
 * Configura el bloqueo de rutas de analytics para una página
 */
async function setupAnalyticsRouteBlocking(page) {
  console.log('🚫 Setting up analytics route blocking...');
  
  // Interceptar TODAS las rutas que contengan dominios de analytics
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    
    // Verificar si la URL contiene algún dominio de analytics
    const isAnalyticsRequest = analyticsDomains.some(domain => url.includes(domain));
    
    if (isAnalyticsRequest) {
      console.log('🚫 BLOCKED ROUTE:', url);
      // Abortar la request completamente
      await route.abort('failed');
      return;
    }
    
    // Si no es analytics, continuar con la request normal
    await route.continue();
  });
  
  console.log('🚫 Analytics route blocking configured for:', analyticsDomains.join(', '));
}

/**
 * Configura el bloqueo de rutas de analytics para un contexto
 */
async function setupAnalyticsContextBlocking(context) {
  console.log('🚫 Setting up analytics context blocking...');
  
  // Interceptar TODAS las rutas que contengan dominios de analytics
  await context.route('**/*', async (route) => {
    const url = route.request().url();
    
    // Verificar si la URL contiene algún dominio de analytics
    const isAnalyticsRequest = analyticsDomains.some(domain => url.includes(domain));
    
    if (isAnalyticsRequest) {
      console.log('🚫 BLOCKED CONTEXT ROUTE:', url);
      // Abortar la request completamente
      await route.abort('failed');
      return;
    }
    
    // Si no es analytics, continuar con la request normal
    await route.continue();
  });
  
  console.log('🚫 Analytics context blocking configured');
}

/**
 * Configura el bloqueo de rutas de analytics para un browser
 * NOTA: browser.route() no existe en Playwright, se usa context.route()
 */
async function setupAnalyticsBrowserBlocking(browser) {
  console.log('🚫 Setting up analytics browser blocking...');
  
  // Crear un contexto con bloqueo de analytics
  const context = await browser.newContext();
  
  // Interceptar TODAS las rutas que contengan dominios de analytics
  await context.route('**/*', async (route) => {
    const url = route.request().url();
    
    // Verificar si la URL contiene algún dominio de analytics
    const isAnalyticsRequest = analyticsDomains.some(domain => url.includes(domain));
    
    if (isAnalyticsRequest) {
      console.log('🚫 BLOCKED BROWSER ROUTE:', url);
      // Abortar la request completamente
      await route.abort('failed');
      return;
    }
    
    // Si no es analytics, continuar con la request normal
    await route.continue();
  });
  
  console.log('🚫 Analytics browser blocking configured');
  return context;
}

module.exports = {
  setupAnalyticsRouteBlocking,
  setupAnalyticsContextBlocking,
  setupAnalyticsBrowserBlocking,
  analyticsDomains
};
