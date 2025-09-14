// Helper para bloquear rutas de analytics a nivel de Playwright
// Este archivo se usa para interceptar requests ANTES de que salgan del navegador

const analyticsDomains = [
  'google-analytics.com',
  'googletagmanager.com', 
  'googleadservices.com',
  'googlesyndication.com',
  'doubleclick.net',
  'facebook.com/tr',
  'connect.facebook.net',
  'facebook.net',
  'firebase',
  'analytics',
  'mixpanel.com',
  'amplitude.com',
  'segment.com',
  'heap.io',
  'hotjar.com',
  'fullstory.com',
  'logrocket.com',
  'sentry.io',
  'bugsnag.com',
  'rollbar.com'
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
