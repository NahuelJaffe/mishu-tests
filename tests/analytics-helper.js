// Helper para deshabilitar analytics en todos los tests

/**
 * Función para agregar parámetros de analytics a las URLs
 */
function addAnalyticsDisableParams(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}disableAnalytics=1`;
}

/**
 * Función para inyectar script de deshabilitación de analytics ULTRA AGRESIVO
 */
async function disableAnalytics(page) {
  // Cargar y ejecutar el bloqueador ultra agresivo
  const fs = require('fs');
  const path = require('path');
  const blockerScript = fs.readFileSync(path.join(__dirname, 'analytics-blocker-ultra.js'), 'utf8');
  
  await page.addInitScript(() => {
    eval(blockerScript);
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
