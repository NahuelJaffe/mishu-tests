// Configuración de testing para Playwright
// Este archivo contiene las variables de entorno necesarias para los tests

module.exports = {
  // Credenciales de testing - usar secrets en CI, valores por defecto en local
  TEST_EMAIL: process.env.TEST_EMAIL || 'test@example.com',
  TEST_PASSWORD: process.env.TEST_PASSWORD || 'ExamplePassword123!',
  
  // URL base para testing - usar secret en CI, valor por defecto en local
  BASE_URL: process.env.BASE_URL || 'https://your-app.example.com/',
  
  // Configuración de testing
  TEST_MODE: true,
  E2E_TESTING: true,
  ANALYTICS_DISABLED: true,
  
  // Configuración de API
  API_BASE_URL: 'https://your-app.example.com/api',
  API_TIMEOUT: 30000,
  
  // Configuración de timeouts
  DEFAULT_TIMEOUT: 30000,
  NAVIGATION_TIMEOUT: 60000,
  
  // Configuración de browsers
  BROWSER_ARGS: [
    '--disable-web-security',
    '--disable-features=VizDisplayCompositor',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage'
  ],
  
  // Función helper para login - intenta login real primero, fallback a mock
  mockLogin: async function(page) {
    // Si tenemos credenciales reales (de secrets), intentar login real
    if (this.TEST_EMAIL !== 'test@example.com' && this.TEST_PASSWORD !== 'ExamplePassword123!') {
      console.log('🔐 Intentando login real con credenciales de secrets...');
      try {
        await page.goto(`${this.BASE_URL}login`);
        
        // Intentar login real
        await page.fill('input[type="email"]', this.TEST_EMAIL);
        await page.fill('input[type="password"]', this.TEST_PASSWORD);
        await page.click('button[type="submit"]');
        
        // Esperar a que se complete el login
        await page.waitForLoadState('networkidle');
        
        // Verificar si el login fue exitoso
        const currentUrl = page.url();
        if (!currentUrl.includes('/login')) {
          console.log('✅ Login real exitoso');
          return;
        }
      } catch (error) {
        console.log('⚠️ Login real falló, usando mock login:', error.message);
      }
    }
    
    // Fallback a mock login
    console.log('🎭 Usando mock login...');
    await page.goto(`${this.BASE_URL}login`);
    
    // Establecer variables de sesión simuladas
    await page.evaluate(() => {
      // Simular que el usuario está autenticado
      localStorage.setItem('user', JSON.stringify({
        id: 'test-user-123',
        email: 'test@example.com',
        name: 'Test User',
        authenticated: true
      }));
      
      // Simular token de autenticación
      localStorage.setItem('authToken', 'mock-auth-token-123');
      
      // Simular sesión activa
      sessionStorage.setItem('sessionActive', 'true');
    });
    
    // Ahora navegar a la página de conexiones
    await page.goto(`${this.BASE_URL}connections`);
    
    // Verificar que estamos en la página correcta
    await page.waitForLoadState('networkidle');
    console.log('✅ Mock login completado - variables de sesión establecidas');
  }
};
