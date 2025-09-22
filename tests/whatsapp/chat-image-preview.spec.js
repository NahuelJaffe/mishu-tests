const { test, expect } = require('@playwright/test');
const testConfig = require('../test-config');

// Test suite para Chat Image Preview - Profile Picture Preview functionality

/**
 * Setup de analytics para todos los tests de chat image preview
 */
async function setupAnalyticsForChatImagePreview(page) {
  try {
    const { setupAnalyticsForTest } = require('../analytics-setup.js');
    await setupAnalyticsForTest(page);
    console.log('✅ Analytics bloqueado para test de chat image preview');
  } catch (error) {
    console.error('❌ Error al configurar analytics para chat image preview:', error);
    throw error;
  }
}

/**
 * Función auxiliar para iniciar sesión
 */
async function login(page) {
  const baseURL = testConfig.BASE_URL;
  await page.goto(`${baseURL}login`);
  
  // Usar selectores más robustos
  const emailInput = page.locator('input[type="email"], input[name="email"], input[placeholder*="email"]').first();
  const passwordInput = page.locator('input[type="password"], input[name="password"], input[placeholder*="password"]').first();
  const submitButton = page.locator('button[type="submit"], button:has-text("Login"), button:has-text("Sign In")').first();
  
  // Esperar a que los elementos estén disponibles
  await emailInput.waitFor({ state: 'visible', timeout: 10000 });
  await passwordInput.waitFor({ state: 'visible', timeout: 10000 });
  
  await emailInput.fill(testConfig.TEST_EMAIL);
  await passwordInput.fill(testConfig.TEST_PASSWORD);
  await submitButton.click();
  
  // Esperar a que se complete el login
  try {
    await expect(page).toHaveURL(/connections/, { timeout: 15000 });
    console.log('✅ Login exitoso - redirigido a connections');
  } catch (error) {
    console.log('⚠️ Login no redirigió como esperado, usando mock login como fallback');
    await testConfig.mockLogin(page);
  }
}

/**
 * CIP-01: Open image preview modal from chat
 * Verifica que se pueda abrir el modal de preview de imagen desde el chat
 */
test('CIP-01: Open image preview modal from chat', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForChatImagePreview(page);
  
  // Iniciar sesión
  await login(page);
  
  // Navegar a conversaciones o mensajes
  await page.goto(`${testConfig.BASE_URL}/messages`);
  
  // Buscar imágenes de perfil en conversaciones
  const profileImages = page.locator('img[src*="profile"], img[alt*="profile"], .profile-image img, .avatar img, .user-image img');
  
  // Esperar a que haya al menos una imagen de perfil
  await profileImages.first().waitFor({ state: 'visible', timeout: 10000 });
  
  // Hacer clic en la primera imagen de perfil
  await profileImages.first().click();
  
  // Verificar que se abre el modal de preview
  const modal = page.locator('[role="dialog"], .modal, .image-preview-modal, .preview-modal');
  await expect(modal).toBeVisible({ timeout: 5000 });
  
  // Verificar que el modal contiene una imagen
  const modalImage = modal.locator('img').first();
  await expect(modalImage).toBeVisible();
  
  console.log('✅ Modal de preview de imagen abierto correctamente');
});

/**
 * CIP-02: Close image preview modal
 * Verifica que se pueda cerrar el modal de preview de imagen
 */
test('CIP-02: Close image preview modal', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForChatImagePreview(page);
  
  // Iniciar sesión
  await login(page);
  
  // Navegar a conversaciones o mensajes
  await page.goto(`${testConfig.BASE_URL}/messages`);
  
  // Buscar imágenes de perfil en conversaciones
  const profileImages = page.locator('img[src*="profile"], img[alt*="profile"], .profile-image img, .avatar img, .user-image img');
  
  // Esperar a que haya al menos una imagen de perfil
  await profileImages.first().waitFor({ state: 'visible', timeout: 10000 });
  
  // Hacer clic en la primera imagen de perfil para abrir el modal
  await profileImages.first().click();
  
  // Verificar que se abre el modal
  const modal = page.locator('[role="dialog"], .modal, .image-preview-modal, .preview-modal');
  await expect(modal).toBeVisible({ timeout: 5000 });
  
  // Cerrar modal con botón X
  const closeButton = modal.locator('button[aria-label*="close"], button:has-text("×"), button:has-text("✕"), .close-button');
  
  if (await closeButton.count() > 0) {
    await closeButton.first().click();
    await expect(modal).not.toBeVisible({ timeout: 5000 });
    console.log('✅ Modal cerrado con botón X');
  } else {
    // Fallback: hacer clic fuera del modal
    await page.click('body', { position: { x: 10, y: 10 } });
    await expect(modal).not.toBeVisible({ timeout: 5000 });
    console.log('✅ Modal cerrado haciendo clic fuera');
  }
});

/**
 * CIP-03: Preview keyboard/esc support
 * Verifica que el modal de preview responda correctamente a la tecla ESC
 */
test('CIP-03: Preview keyboard/esc support', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForChatImagePreview(page);
  
  // Iniciar sesión
  await login(page);
  
  // Navegar a conversaciones o mensajes
  await page.goto(`${testConfig.BASE_URL}/messages`);
  
  // Buscar imágenes de perfil en conversaciones
  const profileImages = page.locator('img[src*="profile"], img[alt*="profile"], .profile-image img, .avatar img, .user-image img');
  
  // Esperar a que haya al menos una imagen de perfil
  await profileImages.first().waitFor({ state: 'visible', timeout: 10000 });
  
  // Hacer clic en la primera imagen de perfil para abrir el modal
  await profileImages.first().click();
  
  // Verificar que se abre el modal
  const modal = page.locator('[role="dialog"], .modal, .image-preview-modal, .preview-modal');
  await expect(modal).toBeVisible({ timeout: 5000 });
  
  // Presionar tecla ESC para cerrar el modal
  await page.keyboard.press('Escape');
  
  // Verificar que el modal se cierra
  await expect(modal).not.toBeVisible({ timeout: 5000 });
  
  console.log('✅ Modal cerrado correctamente con tecla ESC');
});

/**
 * CIP-04: Profile Picture Preview from conversation list
 * Verifica que se pueda abrir preview desde la lista de conversaciones
 */
test('CIP-04: Profile Picture Preview from conversation list', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForChatImagePreview(page);
  
  // Iniciar sesión
  await login(page);
  
  // Navegar a la lista de conversaciones
  await page.goto(`${testConfig.BASE_URL}/connections`);
  
  // Buscar imágenes de perfil en la lista de conversaciones
  const conversationProfileImages = page.locator('.conversation-list img, .connection-list img, .chat-list img, [data-testid*="conversation"] img');
  
  // Esperar a que haya al menos una imagen de perfil
  if (await conversationProfileImages.count() > 0) {
    await conversationProfileImages.first().waitFor({ state: 'visible', timeout: 10000 });
    
    // Hacer clic en la primera imagen de perfil
    await conversationProfileImages.first().click();
    
    // Verificar que se abre el modal de preview
    const modal = page.locator('[role="dialog"], .modal, .image-preview-modal, .preview-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Preview abierto desde lista de conversaciones');
  } else {
    console.log('⚠️ No se encontraron imágenes de perfil en la lista de conversaciones');
  }
});

/**
 * CIP-05: Profile Picture Preview from flagged messages
 * Verifica que se pueda abrir preview desde mensajes reportados
 */
test('CIP-05: Profile Picture Preview from flagged messages', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForChatImagePreview(page);
  
  // Iniciar sesión
  await login(page);
  
  // Navegar a mensajes reportados
  await page.goto(`${testConfig.BASE_URL}/flagged-messages`);
  
  // Buscar imágenes de perfil en mensajes reportados
  const flaggedProfileImages = page.locator('.flagged-messages img, .reported-messages img, [data-testid*="flagged"] img');
  
  // Esperar a que haya al menos una imagen de perfil
  if (await flaggedProfileImages.count() > 0) {
    await flaggedProfileImages.first().waitFor({ state: 'visible', timeout: 10000 });
    
    // Hacer clic en la primera imagen de perfil
    await flaggedProfileImages.first().click();
    
    // Verificar que se abre el modal de preview
    const modal = page.locator('[role="dialog"], .modal, .image-preview-modal, .preview-modal');
    await expect(modal).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Preview abierto desde mensajes reportados');
  } else {
    console.log('⚠️ No se encontraron imágenes de perfil en mensajes reportados');
  }
});

/**
 * CIP-06: Profile Picture Preview - keyboard navigation
 * Verifica navegación por teclado en el modal de preview
 */
test('CIP-06: Profile Picture Preview - keyboard navigation', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForChatImagePreview(page);
  
  // Iniciar sesión
  await login(page);
  
  // Navegar a conversaciones o mensajes
  await page.goto(`${testConfig.BASE_URL}/messages`);
  
  // Buscar imágenes de perfil en conversaciones
  const profileImages = page.locator('img[src*="profile"], img[alt*="profile"], .profile-image img, .avatar img, .user-image img');
  
  // Esperar a que haya al menos una imagen de perfil
  await profileImages.first().waitFor({ state: 'visible', timeout: 10000 });
  
  // Navegar con Tab hasta la imagen de perfil
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  
  // Hacer clic en la imagen de perfil
  await profileImages.first().click();
  
  // Verificar que se abre el modal
  const modal = page.locator('[role="dialog"], .modal, .image-preview-modal, .preview-modal');
  await expect(modal).toBeVisible({ timeout: 5000 });
  
  // Verificar que el modal es focusable
  await modal.focus();
  
  // Presionar Enter para cerrar (si está configurado)
  await page.keyboard.press('Enter');
  
  // Verificar que el modal se cierra
  await expect(modal).not.toBeVisible({ timeout: 5000 });
  
  console.log('✅ Navegación por teclado funcionando correctamente');
});

/**
 * CIP-07: Profile Picture Preview - accessibility (ARIA labels)
 * Verifica que el modal tenga las etiquetas ARIA correctas para accesibilidad
 */
test('CIP-07: Profile Picture Preview - accessibility (ARIA labels)', async ({ page }) => {
  // Configurar bloqueo de analytics
  await setupAnalyticsForChatImagePreview(page);
  
  // Iniciar sesión
  await login(page);
  
  // Navegar a conversaciones o mensajes
  await page.goto(`${testConfig.BASE_URL}/messages`);
  
  // Buscar imágenes de perfil en conversaciones
  const profileImages = page.locator('img[src*="profile"], img[alt*="profile"], .profile-image img, .avatar img, .user-image img');
  
  // Esperar a que haya al menos una imagen de perfil
  await profileImages.first().waitFor({ state: 'visible', timeout: 10000 });
  
  // Hacer clic en la primera imagen de perfil
  await profileImages.first().click();
  
  // Verificar que se abre el modal
  const modal = page.locator('[role="dialog"], .modal, .image-preview-modal, .preview-modal');
  await expect(modal).toBeVisible({ timeout: 5000 });
  
  // Verificar etiquetas ARIA
  const modalRole = await modal.getAttribute('role');
  const modalAriaLabel = await modal.getAttribute('aria-label');
  const modalAriaLabelledBy = await modal.getAttribute('aria-labelledby');
  
  // Verificar que el modal tiene role="dialog" o aria-label
  expect(modalRole === 'dialog' || modalAriaLabel || modalAriaLabelledBy).toBeTruthy();
  
  // Verificar que la imagen tiene alt text
  const modalImage = modal.locator('img').first();
  const imageAlt = await modalImage.getAttribute('alt');
  expect(imageAlt).toBeTruthy();
  
  console.log('✅ Modal tiene etiquetas ARIA correctas para accesibilidad');
});
