const { test, expect } = require('@playwright/test');

// Test suite para el registro de usuarios en WhatsApp Monitor

/**
 * TC-06: New user registration
 * Verifica que un nuevo usuario pueda registrarse correctamente
 */
test('TC-06: New user registration', async ({ page }) => {
  // Navegar a la página de registro
  await page.goto('https://mishu.co.il/register');
  
  // Verificar que estamos en la página de registro
  await expect(page).toHaveURL(/register|signup/);
  
  // Verificar que existen los campos del formulario de registro
  const emailField = page.locator('input[type="email"], input[name="email"]');
  const passwordField = page.locator('input[type="password"], input[name="password"]');
  const confirmPasswordField = page.locator('input[name="confirmPassword"], input[name="password_confirmation"]');
  const nameField = page.locator('input[name="name"], input[name="fullName"], input[name="username"]');
  
  await expect(emailField).toBeVisible();
  await expect(passwordField).toBeVisible();
  
  // Generar datos únicos para el test
  const timestamp = Date.now();
  const testEmail = `testuser${timestamp}@example.com`;
  const testPassword = 'TestPassword123!';
  const testName = `Test User ${timestamp}`;
  
  // Llenar el formulario de registro
  await emailField.fill(testEmail);
  await passwordField.fill(testPassword);
  
  // Llenar campos adicionales si existen
  if (await confirmPasswordField.count() > 0) {
    await confirmPasswordField.fill(testPassword);
  }
  
  if (await nameField.count() > 0) {
    await nameField.fill(testName);
  }
  
  // Verificar términos y condiciones si existe
  const termsCheckbox = page.locator('input[type="checkbox"][name="terms"], input[type="checkbox"][name="agreement"]');
  if (await termsCheckbox.count() > 0) {
    await termsCheckbox.check();
  }
  
  // Enviar el formulario
  const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")');
  await expect(submitButton).toBeVisible();
  await submitButton.click();
  
  // Verificar que el registro fue exitoso
  // Esto puede variar según la implementación: redirección, mensaje de éxito, etc.
  await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
  
  // Verificar redirección o mensaje de éxito
  const successMessage = page.locator('.success-message, .alert-success, [role="alert"]');
  const emailVerificationMessage = page.locator('text=/verify|check.*email|confirmation/i');
  
  if (await successMessage.count() > 0) {
    await expect(successMessage).toBeVisible();
    await expect(successMessage).toContainText(/success|registered|welcome/i);
  } else if (await emailVerificationMessage.count() > 0) {
    await expect(emailVerificationMessage).toBeVisible();
  } else {
    // Verificar redirección a página de login o dashboard
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/login|dashboard|verify/);
  }
  
  console.log(`User registration test completed with email: ${testEmail}`);
});

/**
 * TC-07: Duplicate email/phone check
 * Verifica que el sistema detecte emails duplicados
 */
test('TC-07: Duplicate email/phone check', async ({ page }) => {
  await page.goto('https://mishu.co.il/register');
  
  // Usar un email que ya existe (el email de prueba que usamos en otros tests)
  const existingEmail = 'nahueljaffe+testmishu@gmail.com';
  const testPassword = 'TestPassword123!';
  
  const emailField = page.locator('input[type="email"], input[name="email"]');
  const passwordField = page.locator('input[type="password"], input[name="password"]');
  
  await emailField.fill(existingEmail);
  await passwordField.fill(testPassword);
  
  // Enviar el formulario
  const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")');
  await submitButton.click();
  
  // Verificar que aparece un mensaje de error
  await page.waitForTimeout(2000); // Esperar respuesta del servidor
  
  const errorMessage = page.locator('.error-message, .alert-error, [role="alert"], .field-error');
  await expect(errorMessage).toBeVisible();
  
  // Verificar que el mensaje indica email duplicado
  const errorText = await errorMessage.textContent();
  expect(errorText.toLowerCase()).toMatch(/already|exists|duplicate|taken|registered/i);
  
  // Verificar que seguimos en la página de registro
  await expect(page).toHaveURL(/register|signup/);
  
  console.log('Duplicate email check test completed');
});

/**
 * TC-08: Password requirements validation
 * Verifica que se validen los requisitos de contraseña
 */
test('TC-08: Password requirements validation', async ({ page }) => {
  await page.goto('https://mishu.co.il/register');
  
  const emailField = page.locator('input[type="email"], input[name="email"]');
  const passwordField = page.locator('input[type="password"], input[name="password"]');
  
  // Usar un email válido
  const timestamp = Date.now();
  const testEmail = `testuser${timestamp}@example.com`;
  
  await emailField.fill(testEmail);
  
  // Probar contraseñas que no cumplen los requisitos
  const invalidPasswords = [
    '123', // Muy corta
    'password', // Sin números ni caracteres especiales
    'PASSWORD', // Solo mayúsculas
    '12345678', // Solo números
    'Pass1', // Muy corta
  ];
  
  for (const invalidPassword of invalidPasswords) {
    await passwordField.fill(invalidPassword);
    
    // Intentar enviar el formulario
    const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")');
    await submitButton.click();
    
    // Verificar que aparece un mensaje de error de contraseña
    const passwordError = page.locator('.password-error, .field-error, [data-field="password"] .error');
    
    if (await passwordError.count() > 0) {
      await expect(passwordError).toBeVisible();
      const errorText = await passwordError.textContent();
      expect(errorText.toLowerCase()).toMatch(/password|requirement|invalid|weak/i);
    } else {
      // Verificar que el formulario no se envía (seguimos en la página de registro)
      await expect(page).toHaveURL(/register|signup/);
    }
    
    // Limpiar el campo para la siguiente prueba
    await passwordField.clear();
  }
  
  // Probar una contraseña válida
  const validPassword = 'ValidPassword123!';
  await passwordField.fill(validPassword);
  
  const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")');
  await submitButton.click();
  
  // Verificar que no hay errores de contraseña
  const passwordError = page.locator('.password-error, .field-error, [data-field="password"] .error');
  if (await passwordError.count() > 0) {
    await expect(passwordError).not.toBeVisible();
  }
  
  console.log('Password requirements validation test completed');
});

/**
 * TC-09: Email verification flow
 * Verifica el flujo de verificación de email
 */
test('TC-09: Email verification flow', async ({ page }) => {
  // Este test simula el flujo de verificación de email
  // En un entorno real, esto requeriría interceptar emails o usar un servicio de testing
  
  await page.goto('https://mishu.co.il/register');
  
  const timestamp = Date.now();
  const testEmail = `testuser${timestamp}@example.com`;
  const testPassword = 'TestPassword123!';
  
  const emailField = page.locator('input[type="email"], input[name="email"]');
  const passwordField = page.locator('input[type="password"], input[name="password"]');
  
  await emailField.fill(testEmail);
  await passwordField.fill(testPassword);
  
  const submitButton = page.locator('button[type="submit"], button:has-text("Register"), button:has-text("Sign Up")');
  await submitButton.click();
  
  // Verificar que aparece un mensaje sobre verificación de email
  const verificationMessage = page.locator('text=/verify|check.*email|confirmation|sent/i');
  
  if (await verificationMessage.count() > 0) {
    await expect(verificationMessage).toBeVisible();
    
    // Verificar que hay un botón para reenviar el email de verificación
    const resendButton = page.locator('button:has-text("Resend"), button:has-text("Send Again"), a:has-text("Resend")');
    
    if (await resendButton.count() > 0) {
      await expect(resendButton).toBeVisible();
      
      // Hacer clic en reenviar
      await resendButton.click();
      
      // Verificar que aparece un mensaje de confirmación
      const resendMessage = page.locator('.success-message, .alert-success, text=/sent|resent/i');
      if (await resendMessage.count() > 0) {
        await expect(resendMessage).toBeVisible();
      }
    }
    
    // Simular el acceso al enlace de verificación
    // En un entorno real, esto requeriría interceptar el email
    const verificationLink = page.locator('a[href*="verify"], a[href*="confirm"]');
    
    if (await verificationLink.count() > 0) {
      // En un test real, aquí haríamos clic en el enlace de verificación
      console.log('Verification link found, but cannot test actual email verification in automated environment');
    }
    
    // Verificar que hay instrucciones claras para el usuario
    const instructions = page.locator('text=/check.*email|spam|inbox/i');
    if (await instructions.count() > 0) {
      await expect(instructions).toBeVisible();
    }
  } else {
    // Si no hay mensaje de verificación, verificar que el usuario fue redirigido
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/login|dashboard|verify/);
  }
  
  console.log('Email verification flow test completed');
});
