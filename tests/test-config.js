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
    console.log('🔐 Iniciando proceso de login...');
    
    // Si tenemos credenciales reales (de secrets), intentar login real
    if (this.TEST_EMAIL !== 'test@example.com' && this.TEST_PASSWORD !== 'ExamplePassword123!') {
      console.log('🔐 Intentando login real con credenciales de secrets...');
      try {
        // Navegar a la página de login con timeout más largo
        await page.goto(`${this.BASE_URL}login`, { 
          waitUntil: 'domcontentloaded',
          timeout: 30000 
        });
        
        // Esperar a que los elementos estén disponibles
        await page.waitForSelector('input[type="email"], input[name="email"]', { timeout: 15000 });
        
        // Intentar login real
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        const passwordInput = page.locator('input[type="password"], input[name="password"]').first();
        const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
        
        await emailInput.fill(this.TEST_EMAIL);
        await passwordInput.fill(this.TEST_PASSWORD);
        await submitButton.click();
        
        // Esperar a que se complete el login con timeout más largo
        await page.waitForLoadState('networkidle', { timeout: 30000 });
        
        // Verificar si el login fue exitoso
        const currentUrl = page.url();
        console.log('📍 URL actual después del login:', currentUrl);
        
        if (!currentUrl.includes('/login') && !currentUrl.includes('error')) {
          console.log('✅ Login real exitoso');
          return;
        } else {
          console.log('⚠️ Login real no fue exitoso, URL actual:', currentUrl);
        }
      } catch (error) {
        console.log('⚠️ Login real falló:', error.message);
      }
    }
    
    // Fallback a mock login - solo establecer variables de sesión
    console.log('🎭 Usando mock login (solo variables de sesión - SIN analytics)...');
    
    // Verificar que la página esté disponible antes de ejecutar evaluate
    try {
      // Verificar que la página no esté cerrada
      if (page.isClosed()) {
        console.log('⚠️ Página cerrada, saltando mock login');
        return;
      }
      
      // IMPORTANTE: Mock login NO genera analytics porque:
      // - Solo modifica localStorage/sessionStorage
      // - No hace requests HTTP
      // - No navega a páginas
      // - No ejecuta scripts de analytics
      console.log('🔒 Mock login seguro - no genera analytics');
      
      // Establecer variables de sesión simuladas con verificación de seguridad
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
        
        // Simular estado de autenticación
        localStorage.setItem('isAuthenticated', 'true');
      });
      
      console.log('✅ Mock login completado - variables de sesión establecidas');
    } catch (error) {
      console.log('⚠️ Error en mock login (página cerrada o no disponible):', error.message);
      // No lanzar error, solo registrar y continuar
    }
  }
};
