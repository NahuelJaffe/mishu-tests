// Helper para deshabilitar analytics en todos los tests

/**
 * Función para agregar parámetros de analytics a las URLs
 */
function addAnalyticsDisableParams(url) {
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}disableAnalytics=1`;
}

/**
 * Función para inyectar script de deshabilitación de analytics NUCLEAR
 */
async function disableAnalytics(page) {
  // Establecer solo la flag E2E antes de cualquier script de la página
  await page.addInitScript(() => {
    // @ts-ignore
    window.__E2E_ANALYTICS_DISABLED__ = true;
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
