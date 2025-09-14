// Script para deshabilitar analytics en todos los tests
// Este archivo se ejecuta antes de cada página para deshabilitar analytics

/**
 * Script que se ejecuta en cada página para deshabilitar analytics
 * Se inyecta automáticamente por Playwright
 */
(function() {
  // Deshabilitar Firebase Analytics
  if (typeof window !== 'undefined') {
    // @ts-ignore
    window.__E2E_ANALYTICS_DISABLED__ = true;
    
    // Deshabilitar Google Analytics
    if (window.gtag) {
      window.gtag = function() {
        // No hacer nada - deshabilitar gtag
      };
    }
    
    // Deshabilitar Facebook Pixel
    if (window.fbq) {
      window.fbq = function() {
        // No hacer nada - deshabilitar fbq
      };
    }
    
    // Deshabilitar otros trackers comunes
    if (window.ga) {
      window.ga = function() {
        // No hacer nada - deshabilitar ga
      };
    }
    
    console.log('🚫 Analytics deshabilitados para tests automatizados');
  }
})();
