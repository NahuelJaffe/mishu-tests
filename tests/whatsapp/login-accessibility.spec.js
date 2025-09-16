// Tests simplificados para verificar accesibilidad de la página de login
// Estos tests no requieren autenticación real y verifican elementos básicos

const { test, expect } = require('@playwright/test');
const testConfig = require('../test-config');

// Test suite para verificar accesibilidad de login
test.describe('Login Page Accessibility Tests', () => {
  
  /**
   * Setup de analytics para todos los tests
   */
  async function setupAnalyticsForLogin(page) {
    try {
      const { setupAnalyticsForTest } = require('../analytics-setup.js');
      await setupAnalyticsForTest(page);
      console.log('✅ Analytics bloqueado para test de login');
    } catch (error) {
      console.error('❌ Error al configurar analytics para login:', error);
      throw error;
    }
  }
  
  test('TC-01: Login page loads correctly', async ({ page }) => {
    // Configurar bloqueo de analytics
    await setupAnalyticsForLogin(page);
    
    // Navegar a la página de login
    await page.goto(`${testConfig.BASE_URL}login`);
    
    // Verificar que estamos en la página correcta
    await expect(page).toHaveURL(/login/);
    
    // Verificar que el título de la página es correcto
    await expect(page).toHaveTitle(/mishu|login/i);
    
    console.log('✅ Página de login cargada correctamente');
  });
  
  test('TC-02: Login form elements are present', async ({ page }) => {
    // Configurar bloqueo de analytics
    await setupAnalyticsForLogin(page);
    
    // Navegar a la página de login
    await page.goto(`${testConfig.BASE_URL}login`);
    
    // Verificar elementos del formulario
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")');
    
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    
    console.log('✅ Todos los elementos del formulario de login están presentes');
  });
  
  test('TC-03: Login form accepts input', async ({ page }) => {
    // Configurar bloqueo de analytics
    await setupAnalyticsForLogin(page);
    
    // Navegar a la página de login
    await page.goto(`${testConfig.BASE_URL}login`);
    
    // Probar que los campos aceptan input
    await page.fill('input[type="email"]', testConfig.TEST_EMAIL);
    await page.fill('input[type="password"]', testConfig.TEST_PASSWORD);
    
    // Verificar que los valores se ingresaron correctamente
    const emailValue = await page.inputValue('input[type="email"]');
    const passwordValue = await page.inputValue('input[type="password"]');
    
    expect(emailValue).toBe(testConfig.TEST_EMAIL);
    expect(passwordValue).toBe(testConfig.TEST_PASSWORD);
    
    console.log('✅ Formulario de login acepta input correctamente');
  });
  
  test('TC-04: Navigation links are accessible', async ({ page }) => {
    // Configurar bloqueo de analytics
    await setupAnalyticsForLogin(page);
    
    // Navegar a la página de login
    await page.goto(`${testConfig.BASE_URL}login`);
    
    // Verificar enlaces comunes (Forgot Password, Sign Up, etc.)
    const forgotPasswordLink = page.locator('a:has-text("Forgot"), a:has-text("Password"), a:has-text("Reset")');
    const signUpLink = page.locator('a:has-text("Sign Up"), a:has-text("Register"), a:has-text("Create Account")');
    
    // Al menos uno de estos enlaces debería estar presente
    const hasForgotPassword = await forgotPasswordLink.count() > 0;
    const hasSignUp = await signUpLink.count() > 0;
    
    expect(hasForgotPassword || hasSignUp).toBe(true);
    
    console.log('✅ Enlaces de navegación están accesibles');
  });
  
  test('TC-05: Page is responsive', async ({ page }) => {
    // Configurar bloqueo de analytics
    await setupAnalyticsForLogin(page);
    
    // Navegar a la página de login
    await page.goto(`${testConfig.BASE_URL}login`);
    
    // Probar diferentes tamaños de pantalla
    const viewports = [
      { width: 320, height: 568 },   // Mobile
      { width: 768, height: 1024 },  // Tablet
      { width: 1920, height: 1080 }  // Desktop
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      
      // Verificar que los elementos principales siguen siendo visibles
      const emailInput = page.locator('input[type="email"]');
      const passwordInput = page.locator('input[type="password"]');
      
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      
      console.log(`✅ Responsive: ${viewport.width}x${viewport.height} - elementos visibles`);
    }
  });
});
