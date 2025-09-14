// Helper para deshabilitar analytics en todos los tests

/**
 * Función para agregar parámetros de analytics a las URLs
 */
function addAnalyticsDisableParams(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}disableAnalytics=1`;
}

/**
 * Función para inyectar script de deshabilitación de analytics más agresivo
 */
async function disableAnalytics(page) {
  await page.addInitScript(() => {
    'use strict';
    
    // Marcar como ambiente de testing
    window.__E2E_ANALYTICS_DISABLED__ = true;
    window.__PLAYWRIGHT_TEST__ = true;
    window.__AUTOMATED_TESTING__ = true;
    
    // Bloquear todas las funciones de analytics antes de que se definan
    const blockFunction = function() {
      // No hacer nada - función bloqueada
    };
    
    // Bloquear Google Analytics (todas las versiones)
    window.gtag = blockFunction;
    window.ga = blockFunction;
    window.gaq = blockFunction;
    window._gaq = blockFunction;
    window.GoogleAnalyticsObject = 'ga';
    
    // Bloquear Facebook Pixel
    window.fbq = blockFunction;
    window._fbq = blockFunction;
    
    // Bloquear otros trackers comunes
    window.mixpanel = blockFunction;
    window.amplitude = blockFunction;
    window.segment = blockFunction;
    window._segment = blockFunction;
    window.heap = blockFunction;
    window._heap = blockFunction;
    window.hotjar = blockFunction;
    window._hj = blockFunction;
    
    // Bloquear Firebase Analytics
    window.firebase = window.firebase || {};
    window.firebase.analytics = window.firebase.analytics || {};
    window.firebase.analytics.logEvent = blockFunction;
    window.firebase.analytics.setUserId = blockFunction;
    window.firebase.analytics.setUserProperties = blockFunction;
    
    // Bloquear métodos de envío de datos
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
      // Bloquear requests a dominios de analytics
      if (typeof url === 'string' && (
        url.includes('google-analytics.com') ||
        url.includes('googletagmanager.com') ||
        url.includes('facebook.com/tr') ||
        url.includes('doubleclick.net') ||
        url.includes('googleadservices.com') ||
        url.includes('googlesyndication.com') ||
        url.includes('firebase') ||
        url.includes('analytics')
      )) {
        console.log('🚫 Blocked analytics request:', url);
        return Promise.resolve(new Response('{}', { status: 200 }));
      }
      return originalFetch.apply(this, arguments);
    };
    
    console.log('🚫 Comprehensive analytics blocking enabled');
  });
}

/**
 * Función para navegar a una URL con analytics deshabilitados
 */
async function gotoWithAnalyticsDisabled(page, url) {
  const urlWithParams = addAnalyticsDisableParams(url);
  await page.goto(urlWithParams);
}

module.exports = {
  addAnalyticsDisableParams,
  disableAnalytics,
  gotoWithAnalyticsDisabled
};
