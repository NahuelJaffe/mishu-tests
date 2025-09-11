// Helper para manejo de credenciales de autenticación

/**
 * Función auxiliar para iniciar sesión usando variables de entorno
 */
async function login(page) {
  // Obtener credenciales de variables de entorno
  const email = process.env.TEST_EMAIL || 'nahueljaffe+testmishu@gmail.com';
  const password = process.env.TEST_PASSWORD || 'Prueba1';
  const baseUrl = process.env.BASE_URL || 'https://mishu.co.il';
  
  console.log(`🔐 Intentando login con email: ${email}`);
  
  await page.goto(`${baseUrl}/login`);
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
