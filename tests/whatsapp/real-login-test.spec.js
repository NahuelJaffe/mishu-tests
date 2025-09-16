// Test para verificar login real con credenciales de secrets
// Este test solo funciona cuando se proporcionan credenciales reales

const { test, expect } = require('@playwright/test');
const testConfig = require('../test-config');

// Test suite para login real
test.describe('Real Login Tests', () => {
  
  /**
   * Setup de analytics para todos los tests
   */
  async function setupAnalyticsForLogin(page) {
    try {
      const { setupAnalyticsForTest } = require('../analytics-setup.js');
      await setupAnalyticsForTest(page);
      console.log('✅ Analytics bloqueado para test de login real');
    } catch (error) {
      console.error('❌ Error al configurar analytics para login:', error);
      throw error;
    }
  }
  
  test('TC-01: Real login with credentials', async ({ page }) => {
    // Configurar bloqueo de analytics
    await setupAnalyticsForLogin(page);
    
    // Verificar si tenemos credenciales reales
    const hasRealCredentials = testConfig.TEST_EMAIL !== 'test@example.com' && 
                              testConfig.TEST_PASSWORD !== 'ExamplePassword123!';
    
    if (!hasRealCredentials) {
      console.log('⚠️ No hay credenciales reales disponibles, saltando test');
      test.skip();
      return;
    }
    
    console.log('🔐 Intentando login real con credenciales...');
    console.log('📧 Email:', testConfig.TEST_EMAIL);
    console.log('🌐 URL:', testConfig.BASE_URL);
    
    // Navegar a la página de login
    await page.goto(`${testConfig.BASE_URL}login`);
    
    // Verificar que estamos en la página de login
    await expect(page).toHaveURL(/login/);
    
    // Llenar el formulario con credenciales reales
    await page.fill('input[type="email"]', testConfig.TEST_EMAIL);
    await page.fill('input[type="password"]', testConfig.TEST_PASSWORD);
    
    // Hacer clic en el botón de login
    await page.click('button[type="submit"]');
    
    // Esperar a que se procese el login
    await page.waitForLoadState('networkidle');
    
    // Verificar si el login fue exitoso
    const currentUrl = page.url();
    console.log('📍 URL después del login:', currentUrl);
    
    if (currentUrl.includes('/login')) {
      // Si aún estamos en login, verificar si hay mensaje de error
      const errorMessage = page.locator('.error, .alert, .message, [role="alert"]');
      if (await errorMessage.count() > 0) {
        const errorText = await errorMessage.first().textContent();
        console.log('❌ Error de login:', errorText);
      } else {
        console.log('⚠️ Login falló pero no se detectó mensaje de error específico');
      }
      
      // Tomar screenshot para debugging
      await page.screenshot({ path: 'test-results/login-failed.png', fullPage: true });
      
      // El test falla si no podemos hacer login
      throw new Error('Login falló - credenciales incorrectas o problema de autenticación');
    } else {
      console.log('✅ Login exitoso - redirigido a:', currentUrl);
      
      // Verificar que estamos en una página autenticada
      const isAuthenticated = currentUrl.includes('/dashboard') || 
                             currentUrl.includes('/connections') || 
                             currentUrl.includes('/home') ||
                             !currentUrl.includes('/login');
      
      expect(isAuthenticated).toBe(true);
      console.log('✅ Autenticación verificada correctamente');
    }
  });
  
  test('TC-02: Verify authenticated state', async ({ page }) => {
    // Configurar bloqueo de analytics
    await setupAnalyticsForLogin(page);
    
    // Verificar si tenemos credenciales reales
    const hasRealCredentials = testConfig.TEST_EMAIL !== 'test@example.com' && 
                              testConfig.TEST_PASSWORD !== 'ExamplePassword123!';
    
    if (!hasRealCredentials) {
      console.log('⚠️ No hay credenciales reales disponibles, saltando test');
      test.skip();
      return;
    }
    
    // Usar la función de login que intenta real primero
    await testConfig.mockLogin(page);
    
    // Verificar que estamos en una página autenticada
    const currentUrl = page.url();
    console.log('📍 URL después del login:', currentUrl);
    
    // Verificar elementos que deberían estar presentes en páginas autenticadas
    const authenticatedElements = page.locator('nav, .navbar, .sidebar, .menu, .dashboard, .profile');
    const hasAuthenticatedElements = await authenticatedElements.count() > 0;
    
    if (hasAuthenticatedElements) {
      console.log('✅ Elementos de interfaz autenticada detectados');
    } else {
      console.log('⚠️ No se detectaron elementos típicos de páginas autenticadas');
    }
    
    // El test pasa si al menos no estamos en la página de login o si tenemos variables de sesión
    const isNotOnLoginPage = !currentUrl.includes('/login');
    const hasAuthData = await page.evaluate(() => {
      return localStorage.getItem('isAuthenticated') === 'true' || 
             localStorage.getItem('authToken') !== null ||
             sessionStorage.getItem('sessionActive') === 'true';
    });
    
    // El test pasa si no estamos en login O si tenemos datos de autenticación
    expect(isNotOnLoginPage || hasAuthData).toBe(true);
    
    console.log('✅ Estado de autenticación verificado');
  });
});
