const { test, expect } = require('@playwright/test');

// Test específico para el flujo de recuperación de contraseña

/**
 * TC-03: Password recovery flow - ACTUALIZADO
 * Basado en la información del usuario sobre el botón "Forgot your password"
 */
test('TC-03: Password recovery flow - ACTUALIZADO', async ({ page }) => {
  await page.goto('https://mishu.co.il/login');
  
  // Buscar el botón "Forgot your password" que el usuario confirmó que existe
  const forgotPasswordLink = page.locator('text=/forgot.*password|forgot.*contraseña|reset.*password|reset.*contraseña/i');
  
  // Verificar que el enlace existe
  await expect(forgotPasswordLink).toBeVisible();
  console.log('✅ Botón "Forgot your password" encontrado');
  
  // Hacer clic en el enlace
  await forgotPasswordLink.click();
  
  // Verificar que estamos en la página de recuperación de contraseña
  await expect(page).toHaveURL(/forgot|reset|recover|password/i);
  console.log('✅ Redirigido a página de recuperación de contraseña');
  
  // Verificar que existe un campo para ingresar el email
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]');
  await expect(emailInput).toBeVisible();
  console.log('✅ Campo de email encontrado');
  
  // Ingresar el email de prueba
  await emailInput.fill('nahueljaffe+testmishu@gmail.com');
  
  // Buscar y hacer clic en el botón de envío
  const submitButton = page.locator('button[type="submit"], button:has-text("Send"), button:has-text("Submit"), button:has-text("Reset")');
  await expect(submitButton).toBeVisible();
  await submitButton.click();
  
  // Verificar mensaje de confirmación
  const confirmationMessage = page.locator('.success-message, .alert-success, [role="alert"], text=/sent|check.*email|confirmation/i');
  
  if (await confirmationMessage.count() > 0) {
    await expect(confirmationMessage).toBeVisible();
    const messageText = await confirmationMessage.textContent();
    console.log(`✅ Mensaje de confirmación: ${messageText}`);
  } else {
    // Verificar si hay redirección o cambio en la página
    const currentUrl = page.url();
    console.log(`ℹ️ URL después del envío: ${currentUrl}`);
    
    // Verificar que el formulario se limpió (indicando envío exitoso)
    const emailValue = await emailInput.inputValue();
    if (emailValue === '') {
      console.log('✅ Formulario se limpió, indicando envío exitoso');
    }
  }
  
  console.log('✅ Flujo de recuperación de contraseña completado');
});

/**
 * Test adicional para explorar más elementos de la página de login
 */
test('Exploración completa de la página de login', async ({ page }) => {
  await page.goto('https://mishu.co.il/login');
  
  console.log('=== EXPLORACIÓN DE LA PÁGINA DE LOGIN ===');
  console.log('URL:', page.url());
  console.log('Título:', await page.title());
  
  // Buscar todos los elementos interactivos
  const buttons = page.locator('button');
  const links = page.locator('a');
  const inputs = page.locator('input');
  
  const buttonCount = await buttons.count();
  const linkCount = await links.count();
  const inputCount = await inputs.count();
  
  console.log(`\nElementos encontrados:`);
  console.log(`- Botones: ${buttonCount}`);
  console.log(`- Enlaces: ${linkCount}`);
  console.log(`- Inputs: ${inputCount}`);
  
  // Listar todos los botones
  console.log('\nBotones encontrados:');
  for (let i = 0; i < buttonCount; i++) {
    const button = buttons.nth(i);
    const text = await button.textContent();
    const type = await button.getAttribute('type');
    if (text && text.trim()) {
      console.log(`  ${i + 1}. "${text.trim()}" (${type || 'button'})`);
    }
  }
  
  // Listar todos los enlaces
  console.log('\nEnlaces encontrados:');
  for (let i = 0; i < linkCount; i++) {
    const link = links.nth(i);
    const text = await link.textContent();
    const href = await link.getAttribute('href');
    if (text && text.trim()) {
      console.log(`  ${i + 1}. "${text.trim()}" -> ${href}`);
    }
  }
  
  // Listar todos los inputs
  console.log('\nInputs encontrados:');
  for (let i = 0; i < inputCount; i++) {
    const input = inputs.nth(i);
    const type = await input.getAttribute('type');
    const name = await input.getAttribute('name');
    const placeholder = await input.getAttribute('placeholder');
    console.log(`  ${i + 1}. type="${type}" name="${name}" placeholder="${placeholder}"`);
  }
  
  // Buscar elementos específicos que podrían existir
  const rememberMe = page.locator('input[type="checkbox"], text=/remember/i');
  const signUpLink = page.locator('text=/sign.*up|register|create.*account/i');
  const socialLogin = page.locator('text=/google|facebook|twitter|social/i');
  
  if (await rememberMe.count() > 0) {
    console.log('\n✅ Elemento "Remember me" encontrado');
  }
  
  if (await signUpLink.count() > 0) {
    console.log('✅ Enlace de registro encontrado');
  }
  
  if (await socialLogin.count() > 0) {
    console.log('✅ Opciones de login social encontradas');
  }
  
  console.log('\n=== FIN DE LA EXPLORACIÓN ===');
});
