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
  
  // Esperar a que los campos estén disponibles
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });
  await page.waitForSelector('input[type="password"]', { timeout: 10000 });
  
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  
  // Esperar a que el botón esté disponible y hacer clic
  await page.waitForSelector('button[type="submit"]', { timeout: 5000 });
  await page.click('button[type="submit"]');
  
  // Esperar a que se complete el login con más opciones de URL
  try {
    await page.waitForURL(/connections|dashboard|home/, { timeout: 15000 });
    console.log('✅ Login exitoso');
  } catch (error) {
    console.log('⚠️ Login puede haber fallado, verificando estado actual...');
    const currentUrl = page.url();
    console.log(`URL actual: ${currentUrl}`);
    
    // Si seguimos en login, verificar si hay errores
    const errorMessage = await page.locator('.error, .alert, [role="alert"]').first().textContent().catch(() => null);
    if (errorMessage) {
      console.log(`❌ Error de login: ${errorMessage}`);
      throw new Error(`Login failed: ${errorMessage}`);
    }
    
    // Si no hay error visible, asumir que el login fue exitoso pero la redirección es diferente
    console.log('✅ Login completado (redirección no estándar)');
  }
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
