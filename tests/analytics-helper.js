// Helper para deshabilitar analytics en todos los tests

/**
 * Función para agregar parámetros de analytics a las URLs
 */
function addAnalyticsDisableParams(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}disableAnalytics=1`;
}

/**
 * Función para inyectar script de deshabilitación de analytics
 */
async function disableAnalytics(page) {
  await page.addInitScript(() => {
    // @ts-ignore
    window.__E2E_ANALYTICS_DISABLED__ = true;
    
    // Deshabilitar Google Analytics
    if (typeof window !== 'undefined') {
      if (window.gtag) {
        window.gtag = function() {
          console.log('🚫 gtag call blocked by test automation');
        };
      }
      
      // Deshabilitar Facebook Pixel
      if (window.fbq) {
        window.fbq = function() {
          console.log('🚫 fbq call blocked by test automation');
        };
      }
      
      // Deshabilitar otros trackers comunes
      if (window.ga) {
        window.ga = function() {
          console.log('🚫 ga call blocked by test automation');
        };
      }
      
      console.log('🚫 Analytics deshabilitados para tests automatizados');
    }
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
