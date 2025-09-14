// Helper para manejo de credenciales de autenticación
const { disableAnalytics, gotoWithAnalyticsDisabled } = require('./analytics-helper');

/**
 * Función auxiliar para iniciar sesión usando variables de entorno
 */
async function login(page) {
  // Obtener credenciales de variables de entorno
  const email = process.env.TEST_EMAIL || 'nahueljaffe+bugwpp@gmail.com';
  const password = process.env.TEST_PASSWORD || 'Tonna2-wahwon-gupreq';
  const baseUrl = process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/';
  
  console.log(`🔐 Intentando login con email: ${email}`);
  
  // Deshabilitar analytics antes de navegar
  await disableAnalytics(page);
  
  // Navegar con parámetros de analytics deshabilitados
  await gotoWithAnalyticsDisabled(page, `${baseUrl}/login`);
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  
  // Esperar a que se complete el login
  await page.waitForURL(/connections/);
  console.log('✅ Login exitoso');
}

/**
 * Función para verificar que las credenciales están configuradas
 */
function validateCredentials() {
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;
  
  if (!email || !password) {
    console.warn('⚠️ Credenciales no configuradas en variables de entorno');
    console.warn('Usando credenciales por defecto (no recomendado para CI)');
    return false;
  }
  
  console.log('✅ Credenciales configuradas correctamente');
  return true;
}

module.exports = {
  login,
  validateCredentials
};
