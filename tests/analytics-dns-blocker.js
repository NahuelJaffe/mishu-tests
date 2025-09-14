// BLOQUEADOR DE DNS/NETWORK LEVEL PARA ANALYTICS
// Este script bloquea las solicitudes a nivel de red antes de que salgan del navegador

const ANALYTICS_DOMAINS = [
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
  // Explicit analytics providers only (avoid generic substrings like "analytics" or "firebase")
  'mixpanel.com',
  'api.mixpanel.com',
  'cdn.mxpnl.com',
  'amplitude.com',
  'api.amplitude.com',
  'cdn.amplitude.com',
  'segment.io',
  'api.segment.io',
  'cdn.segment.io',
  'heap.io',
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
  't.co',
  'tiktok.com/i18n/pixel',
  'analytics.tiktok.com',
  'snapchat.com',
  'tr.snapchat.com',
  'pinterest.com',
  'ads.pinterest.com',
  'reddit.com/api/v2',
  'events.redditmedia.com',
  'quantserve.com',
  'scorecardresearch.com',
  'googlesyndication.com',
  'adsystem.amazon.com',
  'amazon-adsystem.com',
  'adsystem.amazon-adsystem.com'
];

/**
 * Configura el bloqueo de DNS/Network a nivel de BrowserContext
 * Esto bloquea las solicitudes ANTES de que salgan del navegador
 */
async function setupAnalyticsDNSBlocking(context) {
  console.log('🚫 Setting up DNS-level analytics blocking...');
  
  // Bloquear todas las solicitudes a dominios de analytics
  await context.route(url => {
    const urlStr = url.toString().toLowerCase();
    const isBlocked = ANALYTICS_DOMAINS.some(domain => urlStr.includes(domain.toLowerCase()));
    
    if (isBlocked) {
      console.log('🚫 DNS BLOCKED:', url.toString());
      return true; // Bloquear la solicitud
    }
    
    return false; // Permitir otras solicitudes
  }, route => {
    // Abortar la solicitud completamente
    route.abort('blockedbyclient');
    console.log('🚫 DNS ABORTED:', route.request().url());
  });
  
  console.log('✅ DNS-level analytics blocking configured');
}

/**
 * Configura el bloqueo de DNS/Network a nivel de Page
 * Esto es una capa adicional de bloqueo
 */
async function setupAnalyticsPageDNSBlocking(page) {
  console.log('🚫 Setting up Page-level DNS analytics blocking...');
  
  // Bloquear todas las solicitudes a dominios de analytics a nivel de página
  await page.route(url => {
    const urlStr = url.toString().toLowerCase();
    const isBlocked = ANALYTICS_DOMAINS.some(domain => urlStr.includes(domain.toLowerCase()));
    
    if (isBlocked) {
      console.log('🚫 PAGE DNS BLOCKED:', url.toString());
      return true; // Bloquear la solicitud
    }
    
    return false; // Permitir otras solicitudes
  }, route => {
    // Abortar la solicitud completamente
    route.abort('blockedbyclient');
    console.log('🚫 PAGE DNS ABORTED:', route.request().url());
  });
  
  console.log('✅ Page-level DNS analytics blocking configured');
}

/**
 * Configura el bloqueo de DNS/Network a nivel de Browser
 * Esto es la capa más profunda de bloqueo
 */
async function setupAnalyticsBrowserDNSBlocking(browser) {
  console.log('🚫 Setting up Browser-level DNS analytics blocking...');
  
  // Crear un contexto con bloqueo de DNS
  const context = await browser.newContext();
  
  // Configurar bloqueo de DNS en el contexto
  await setupAnalyticsDNSBlocking(context);
  
  console.log('✅ Browser-level DNS analytics blocking configured');
  
  return context;
}

module.exports = {
  setupAnalyticsDNSBlocking,
  setupAnalyticsPageDNSBlocking,
  setupAnalyticsBrowserDNSBlocking,
  ANALYTICS_DOMAINS
};
