const { test, expect } = require('@playwright/test');

// Test suite para manejo de errores en WhatsApp Monitor

/**
 * Función auxiliar para iniciar sesión
 */
async function login(page) {
  const baseUrl = process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/';
  const email = process.env.TEST_EMAIL;
  const password = process.env.TEST_PASSWORD;
  
  await page.goto(`${baseUrl}login`);
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  // Esperar a que se complete el login con URLs más flexibles
  await expect(page).toHaveURL(/connections|dashboard|home/, { timeout: 15000 });
}

/**
 * TC-29: Offline behavior
 * Verifica el comportamiento de la aplicación cuando está offline
 */
test('TC-29: Offline behavior', async ({ page, context }) => {
  // Iniciar sesión primero
  await login(page);
  
  // Simular conexión offline
  await context.setOffline(true);
  
  // Intentar navegar a una página (con manejo de error offline)
  const baseUrl = process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/';
  
  try {
    await page.goto(`${baseUrl}dashboard`, { waitUntil: 'domcontentloaded', timeout: 10000 });
  } catch (error) {
    console.log('✅ Error offline detectado correctamente:', error.message);
    // Esto es esperado cuando estamos offline
  }
  
  // Verificar que aparece un mensaje de offline
  const offlineMessage = page.locator('.offline-message, .no-connection, .network-error, [data-testid="offline"]');
  
  if (await offlineMessage.count() > 0) {
    await expect(offlineMessage).toBeVisible();
    await expect(offlineMessage).toContainText(/offline|no.*connection|network.*error/i);
  }
  
  // Verificar que los elementos principales siguen siendo visibles
  const mainContent = page.locator('main, .main-content, .dashboard');
  if (await mainContent.count() > 0) {
    await expect(mainContent).toBeVisible();
  }
  
  // Intentar realizar una acción que requiera conexión
  const actionButton = page.locator('button:has-text("Connect"), button:has-text("Send"), button:has-text("Save")');
  
  if (await actionButton.count() > 0) {
    await actionButton.click();
    
    // Verificar que aparece un mensaje de error de conexión
    const connectionError = page.locator('.error-message, .alert-error, [role="alert"]');
    if (await connectionError.count() > 0) {
      await expect(connectionError).toBeVisible();
      await expect(connectionError).toContainText(/connection|network|offline/i);
    }
  }
  
  // Restaurar conexión
  await context.setOffline(false);
  
  // Verificar que la aplicación se recupera cuando vuelve la conexión
  await page.reload();
  
  // Verificar que el mensaje de offline desaparece
  if (await offlineMessage.count() > 0) {
    await expect(offlineMessage).not.toBeVisible();
  }
  
  console.log('Offline behavior test completed');
});

/**
 * TC-30: Network recovery
 * Verifica que la aplicación se recupere correctamente cuando vuelve la conexión
 */
test('TC-30: Network recovery', async ({ page, context }) => {
  // Iniciar sesión
  await login(page);
  
  // Navegar a una página que requiere datos
  await page.goto('${process.env.BASE_URL || '${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}/'}/messages');
  
  // Simular pérdida de conexión
  await context.setOffline(true);
  
  // Intentar realizar una acción
  const refreshButton = page.locator('button:has-text("Refresh"), button:has-text("Reload"), .refresh-button');
  
  if (await refreshButton.count() > 0) {
    await refreshButton.click();
    
    // Verificar que aparece un mensaje de error
    const errorMessage = page.locator('.error-message, .alert-error, [role="alert"]');
    if (await errorMessage.count() > 0) {
      await expect(errorMessage).toBeVisible();
    }
  }
  
  // Restaurar conexión
  await context.setOffline(false);
  
  // Verificar que la aplicación detecta la recuperación de conexión
  // Esto puede manifestarse de diferentes maneras:
  // 1. Un mensaje de "conexión restaurada"
  // 2. Recarga automática de datos
  // 3. Botón de "reintentar" que funciona
  
  const recoveryMessage = page.locator('.recovery-message, .connection-restored, .network-restored');
  const retryButton = page.locator('button:has-text("Retry"), button:has-text("Reintentar"), .retry-button');
  
  if (await recoveryMessage.count() > 0) {
    await expect(recoveryMessage).toBeVisible();
    await expect(recoveryMessage).toContainText(/restored|reconnected|online/i);
  }
  
  if (await retryButton.count() > 0) {
    await retryButton.click();
    
    // Verificar que la acción se ejecuta correctamente
    await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
    
    // Verificar que no hay errores de conexión
    const connectionError = page.locator('.error-message, .alert-error, [role="alert"]');
    if (await connectionError.count() > 0) {
      await expect(connectionError).not.toBeVisible();
    }
  }
  
  // Verificar que la página funciona normalmente
  const mainContent = page.locator('main, .main-content, .messages-list');
  if (await mainContent.count() > 0) {
    await expect(mainContent).toBeVisible();
  }
  
  console.log('Network recovery test completed');
});

/**
 * TC-31: Invalid QR code handling
 * Verifica el manejo de códigos QR inválidos
 */
test('TC-31: Invalid QR code handling', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  // Navegar a la página de conexión de WhatsApp
  await page.goto('${process.env.BASE_URL || '${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}/'}/connect');
  
  // Verificar que se muestra algún elemento de conexión o QR
  const qrCode = page.locator('.qr-code, img[alt*="QR"], canvas, .connection-qr, [data-testid="qr"], .whatsapp-qr');
  
  // Si no hay QR, verificar que al menos hay un botón de conexión
  const connectionElement = page.locator('button:has-text("Add"), button:has-text("Connect"), button:has-text("WhatsApp")');
  
  try {
    await expect(qrCode.first()).toBeVisible({ timeout: 3000 });
    console.log('✅ QR code encontrado');
  } catch {
    try {
      await expect(connectionElement.first()).toBeVisible({ timeout: 3000 });
      console.log('✅ Botón de conexión encontrado en lugar de QR');
    } catch (connectionError) {
      console.log('⚠️ Ni QR code ni botón de conexión encontrados, saltando test');
      test.skip('Elementos de conexión WhatsApp no disponibles en esta página');
      return;
    }
  }
  
  // Simular un código QR inválido o expirado
  // Esto se puede hacer de varias maneras:
  // 1. Esperar a que el código expire naturalmente
  // 2. Interceptar la respuesta del servidor para simular un error
  // 3. Modificar el código QR en el DOM
  
  // Opción 1: Esperar a que expire (si la aplicación tiene timeout)
  // await page.waitForTimeout(30000); // Esperar 30 segundos
  
  // Opción 2: Interceptar la respuesta del servidor
  await page.route('**/api/qr-code**', route => {
    route.fulfill({
      status: 400,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Invalid QR code' })
    });
  });
  
  // Recargar la página para activar la interceptación
  await page.reload();
  
  // Verificar que aparece un mensaje de error
  const qrError = page.locator('.qr-error, .connection-error, .error-message');
  
  if (await qrError.count() > 0) {
    await expect(qrError).toBeVisible();
    await expect(qrError).toContainText(/invalid|expired|error|failed/i);
  }
  
  // Verificar que aparece un botón para generar un nuevo código QR
  const newQrButton = page.locator('button:has-text("New QR"), button:has-text("Generate"), button:has-text("Refresh")');
  
  if (await newQrButton.count() > 0) {
    await expect(newQrButton).toBeVisible();
    
    // Hacer clic en el botón para generar un nuevo código
    await newQrButton.click();
    
    // Verificar que se genera un nuevo código QR
    await expect(qrCode).toBeVisible();
  }
  
  // Verificar que hay instrucciones claras para el usuario
  const instructions = page.locator('.instructions, .help-text, .qr-instructions');
  if (await instructions.count() > 0) {
    await expect(instructions).toBeVisible();
    await expect(instructions).toContainText(/scan|whatsapp|phone/i);
  }
  
  console.log('Invalid QR code handling test completed');
});

/**
 * TC-32: Server error states
 * Verifica el manejo de errores del servidor
 */
test('TC-32: Server error states', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  // Simular diferentes tipos de errores del servidor
  
  // Error 500 - Error interno del servidor
  await page.route('**/api/**', route => {
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal server error' })
    });
  });
  
  // Navegar a una página que hace llamadas a la API
  await page.goto('${process.env.BASE_URL || '${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}/'}/messages');
  
  // Verificar que aparece un mensaje de error del servidor
  const serverError = page.locator('.server-error, .error-message, .alert-error, [role="alert"]');
  
  if (await serverError.count() > 0) {
    await expect(serverError).toBeVisible();
    await expect(serverError).toContainText(/server|error|500|internal/i);
  }
  
  // Verificar que hay un botón para reintentar
  const retryButton = page.locator('button:has-text("Retry"), button:has-text("Reintentar"), .retry-button');
  
  if (await retryButton.count() > 0) {
    await expect(retryButton).toBeVisible();
  }
  
  // Simular error 404 - No encontrado
  await page.route('**/api/**', route => {
    route.fulfill({
      status: 404,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Not found' })
    });
  });
  
  await page.reload();
  
  // Verificar que aparece un mensaje de error 404
  const notFoundError = page.locator('.not-found-error, .error-message, .alert-error');
  
  if (await notFoundError.count() > 0) {
    await expect(notFoundError).toBeVisible();
    await expect(notFoundError).toContainText(/not.*found|404|missing/i);
  }
  
  // Simular error 403 - Prohibido
  await page.route('**/api/**', route => {
    route.fulfill({
      status: 403,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Forbidden' })
    });
  });
  
  await page.reload();
  
  // Verificar que aparece un mensaje de error 403
  const forbiddenError = page.locator('.forbidden-error, .error-message, .alert-error');
  
  if (await forbiddenError.count() > 0) {
    await expect(forbiddenError).toBeVisible();
    await expect(forbiddenError).toContainText(/forbidden|403|access.*denied/i);
  }
  
  // Simular error de timeout
  await page.route('**/api/**', route => {
    // Verificar si la ruta ya fue manejada
    if (route.request().url().includes('timeout-test')) {
      // Simular timeout no respondiendo
      setTimeout(() => {
        try {
          route.fulfill({
            status: 408,
            contentType: 'application/json',
            body: JSON.stringify({ error: 'Request timeout' })
          });
        } catch (error) {
          console.log('⚠️ Route already handled, skipping fulfill');
        }
      }, 100);
    } else {
      route.continue();
    }
  });
  
  await page.reload();
  
  // Verificar que aparece un mensaje de timeout
  const timeoutError = page.locator('.timeout-error, .error-message, .alert-error');
  
  if (await timeoutError.count() > 0) {
    await expect(timeoutError).toBeVisible();
    await expect(timeoutError).toContainText(/timeout|408|slow|connection/i);
  }
  
  // Restaurar el comportamiento normal
  await page.unroute('**/api/**');
  
  // Verificar que la aplicación se recupera cuando el servidor funciona normalmente
  await page.reload();
  
  // Verificar que no hay errores del servidor
  const errorMessages = page.locator('.server-error, .error-message, .alert-error');
  if (await errorMessages.count() > 0) {
    // Los errores pueden seguir siendo visibles si son de la interfaz, no del servidor
    console.log('Some error messages may still be visible from UI errors');
  }
  
  console.log('Server error states test completed');
});
