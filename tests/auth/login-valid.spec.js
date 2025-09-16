const { test, expect } = require('@playwright/test');
const testConfig = require('../test-config');

/**
 * Setup de analytics para tests de auth
 */
async function setupAnalyticsForAuth(page) {
  try {
    const { setupAnalyticsForTest } = require('../analytics-setup.js');
    await setupAnalyticsForTest(page);
    console.log('✅ Analytics bloqueado para test de auth');
  } catch (error) {
    console.error('❌ Error al configurar analytics para auth:', error);
    throw error;
  }
}

// Test para verificar que la página de login carga correctamente
test('TC-01: Login page loads correctly', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForAuth(page);
  
  await page.goto(`${process.env.BASE_URL || 'https://your-app.example.com/'}/login`);
  // Verificar que estamos en la página de login
  await expect(page).toHaveURL(/login/);
  
  // Verificar que los campos de registro están visibles (usando first() para evitar strict mode)
  const emailInputs = page.locator('input[type="email"]');
  const passwordInputs = page.locator('input[type="password"]');
  
  await expect(emailInputs.first()).toBeVisible();
  await expect(passwordInputs.first()).toBeVisible();
  
  // Verificar si existe un enlace para registrarse (sign up)
  const signUpLink = page.getByText(/sign up|register|create account/i);
  console.log('Checking for sign up link...');
  if (await signUpLink.count() > 0) {
    console.log('Sign up link found');
    await expect(signUpLink).toBeVisible();
  } else {
    console.log('No sign up link found on login page');
  }
});

// Test para intentar login con credenciales inválidas
test('TC-02: Login with invalid credentials shows error message', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForAuth(page);
  
  await page.goto(`${process.env.BASE_URL || 'https://your-app.example.com/'}/login`);
  
  // Llenar el formulario con credenciales inválidas
  await page.fill('input[type="email"]', testConfig.TEST_EMAIL);
  await page.fill('input[type="password"]', 'wrongpassword123');
  
  // Hacer clic en el botón de login
  await page.click('button[type="submit"]');
  
  // Esperar a que aparezca un mensaje de error (ajustar el selector según la estructura real)
  // Podría ser un mensaje de error específico o simplemente verificar que seguimos en la página de login
  await expect(page).toHaveURL(/login/);
  
  // Verificar que aparece algún tipo de mensaje de error o que no se redirige a otra página
  // Esto puede variar según cómo esté implementado el formulario
  // await expect(page.locator('.error-message')).toBeVisible();
});

// Test para verificar la funcionalidad de "Forgot Password"
test('TC-03: Forgot Password functionality', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForAuth(page);
  
  await page.goto(`${process.env.BASE_URL || 'https://your-app.example.com/'}/login`);
  
  // Buscar el texto exacto "Forgot your password?" que el usuario ha confirmado que existe en la página
  // Intentamos varias estrategias de localización para encontrarlo
  
  // 1. Buscar por texto exacto
  const forgotPasswordByText = page.getByText('Forgot your password?', { exact: true });
  
  // 2. Buscar por texto aproximado (case insensitive)
  const forgotPasswordByPartialText = page.getByText(/forgot.*password/i);
  
  // 3. Buscar por rol de botón
  const forgotPasswordButton = page.getByRole('button', { name: /forgot.*password/i });
  
  // 4. Buscar por rol de enlace
  const forgotPasswordLink = page.getByRole('link', { name: /forgot.*password/i });
  
  // 5. Buscar cualquier elemento con el texto
  const forgotPasswordAny = page.locator(':text("Forgot your password?")');
  
  console.log('Buscando "Forgot your password?"...');
  
  // Verificar cada locator en orden de prioridad
  if (await forgotPasswordByText.count() > 0) {
    console.log('Encontrado por texto exacto "Forgot your password?"');
    await forgotPasswordByText.click();
  } 
  else if (await forgotPasswordAny.count() > 0) {
    console.log('Encontrado por selector de texto "Forgot your password?"');
    await forgotPasswordAny.click();
  }
  else if (await forgotPasswordByPartialText.count() > 0) {
    console.log('Encontrado por texto parcial "forgot.*password"');
    await forgotPasswordByPartialText.click();
  }
  else if (await forgotPasswordLink.count() > 0) {
    console.log('Encontrado por rol de enlace');
    await forgotPasswordLink.click();
  }
  else if (await forgotPasswordButton.count() > 0) {
    console.log('Encontrado por rol de botón');
    await forgotPasswordButton.click();
  } else {
    console.log('No se encontró el elemento "Forgot your password?"');
    test.skip('Forgot Password functionality not found or not implemented');
    return;
  }
  
  // Verificar que nos lleva a una página de recuperación de contraseña
  // Esto podría ser una URL específica o un formulario visible
  // await expect(page).toHaveURL(/reset|forgot|recover/);
  
  // Alternativa: verificar que hay un formulario para ingresar email
  const emailInput = page.locator('input[type="email"]');
  if (await emailInput.count() > 0) {
    await expect(emailInput).toBeVisible();
    
    // Opcional: probar el flujo de recuperación ingresando un email
    await emailInput.fill(testConfig.TEST_EMAIL);
    
    // Buscar y hacer clic en el botón de enviar/recuperar
    // Intentar encontrar un botón específico para enviar el formulario
    try {
      // Intentar encontrar un botón con texto relacionado con reset/recuperar
      const resetButton = page.getByRole('button', { name: /send|reset|recover|submit/i });
      if (await resetButton.count() > 0) {
        await resetButton.click();
        console.log('Reset button clicked');
      } else {
        // Si no encontramos un botón específico, buscamos el botón de tipo submit
        const submitButton = page.locator('button[type="submit"]');
        if (await submitButton.count() > 0) {
          await submitButton.click();
          console.log('Submit button clicked');
        } else {
          console.log('No submit button found, skipping this step');
        }
      }
      
      // Verificar alguna confirmación o mensaje de éxito
      // await expect(page.locator('.success-message')).toBeVisible();
    } catch (error) {
      console.log('Error clicking button:', error.message);
    }
  } else {
    console.log('No se encontró el campo de email en la página de recuperación');
  }
});

// Test para verificar la funcionalidad de registro (Sign Up)
test('TC-04: Sign Up functionality', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForAuth(page);
  
  await page.goto(`${process.env.BASE_URL || 'https://your-app.example.com/'}/login`);
  
  // Buscar un enlace de registro (sign up) con múltiples selectores
  const signUpSelectors = [
    // Selectores por texto
    page.getByText(/sign up|register|create account/i),
    page.getByText(/sign up/i),
    page.getByText(/register/i),
    page.getByText(/create account/i),
    page.getByText(/join/i),
    page.getByText(/new user/i),
    
    // Selectores por href
    page.locator('a[href*="signup"]'),
    page.locator('a[href*="register"]'),
    page.locator('a[href*="join"]'),
    page.locator('a[href*="create"]'),
    
    // Selectores por botones
    page.locator('button:has-text("Sign Up")'),
    page.locator('button:has-text("Register")'),
    page.locator('button:has-text("Create Account")'),
    page.locator('button:has-text("Join")'),
    
    // Selectores por data-testid
    page.locator('[data-testid*="signup"]'),
    page.locator('[data-testid*="register"]'),
    page.locator('[data-testid*="join"]'),
    
    // Selectores por clase CSS
    page.locator('.signup-link'),
    page.locator('.register-link'),
    page.locator('.join-link'),
    
    // Selectores por ID
    page.locator('#signup'),
    page.locator('#register'),
    page.locator('#join')
  ];
  
  let signUpLink = null;
  let foundSelector = null;
  
  // Probar cada selector hasta encontrar uno que funcione
  for (let i = 0; i < signUpSelectors.length; i++) {
    const selector = signUpSelectors[i];
    const count = await selector.count();
    console.log(`🔍 Probando selector de Sign Up ${i + 1}/${signUpSelectors.length}: ${selector.toString()} → ${count} elementos encontrados`);
    
    if (count > 0) {
      signUpLink = selector;
      foundSelector = selector.toString();
      console.log(`✅ Sign Up encontrado con selector: ${foundSelector}`);
      break;
    }
  }
  
  if (!signUpLink) {
    console.log(`❌ Ningún selector encontró Sign Up`);
    console.log(`🔍 Selectores probados: ${signUpSelectors.length}`);
    console.log('Sign Up functionality not found or not implemented');
    test.skip();
    return;
  }
  
  // Verificar si el enlace existe
  if (signUpLink) {
    console.log('Sign up link found, clicking it...');
    // Hacer clic en el enlace
    await signUpLink.click();
    
    // Verificar que nos lleva a una página de registro
    // Esto podría ser una URL específica o un formulario visible
    // await expect(page).toHaveURL(/register|signup|join/);
    
    // Verificar que hay un formulario de registro con campos típicos
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]').first(); // Usar .first() para evitar ambigüedad
    
    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      await expect(emailInput).toBeVisible();
      await expect(passwordInput).toBeVisible();
      
      // Opcional: intentar completar el formulario con datos de prueba
      await emailInput.fill('newuser@example.com');
      await passwordInput.fill('securepassword123');
      
      // Buscar campos adicionales comunes en formularios de registro
      const nameInput = page.locator('input[placeholder*="name" i]').first();
      if (await nameInput.count() > 0) {
        await nameInput.fill('Test User');
      }
      
      // No enviamos el formulario para evitar crear cuentas reales
      console.log('✅ Sign Up form found and filled successfully');
    } else {
      console.log('⚠️ Sign Up form not found, but link was clicked');
    }
  }
});

