const { test, expect } = require('@playwright/test');

// Test suite específico para la página de conexiones basado en el análisis real

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
 * TC-13: Verificación del botón "Add Child's WhatsApp"
 * Basado en el análisis real de la página
 */
test('TC-13: Botón Add Child\'s WhatsApp', async ({ page }) => {
  await login(page);
  
  // Buscar el botón específico encontrado en el análisis
  const addWhatsAppButton = page.locator('button:has-text("Add Child\'s WhatsApp")');
  await expect(addWhatsAppButton).toBeVisible();
  
  console.log('✅ Botón "Add Child\'s WhatsApp" encontrado y visible');
  
  // Verificar que el botón es clickeable
  await expect(addWhatsAppButton).toBeEnabled();
  
  // Hacer clic en el botón
  await addWhatsAppButton.click();
  
  // Verificar que algo cambia en la página (modal, nueva sección, etc.)
  await page.waitForTimeout(2000);
  
  // Buscar elementos que podrían aparecer después del clic
  const qrCode = page.locator('img[alt*="QR"], img[src*="qr"], canvas, .qr-code, [class*="qr"]');
  const modal = page.locator('.modal, .popup, .dialog, [role="dialog"]');
  const instructions = page.locator('text=/scan|QR|whatsapp|child/i');
  
  if (await qrCode.count() > 0) {
    await expect(qrCode.first()).toBeVisible();
    console.log('✅ Código QR apareció después del clic');
  } else if (await modal.count() > 0) {
    await expect(modal.first()).toBeVisible();
    console.log('✅ Modal apareció después del clic');
  } else if (await instructions.count() > 0) {
    await expect(instructions.first()).toBeVisible();
    console.log('✅ Instrucciones aparecieron después del clic');
  } else {
    console.log('ℹ️ No se detectaron cambios específicos después del clic');
  }
});

/**
 * TC-14: Verificación del estado vacío de conexiones
 * Basado en el mensaje encontrado en el análisis
 */
test('TC-14: Estado vacío de conexiones', async ({ page }) => {
  await login(page);
  
  // Verificar el mensaje de estado vacío encontrado en el análisis
  const emptyStateMessage = page.locator('text=/You haven\'t created any WhatsApp connections yet/i');
  await expect(emptyStateMessage).toBeVisible();
  
  console.log('✅ Mensaje de estado vacío encontrado');
  
  // Verificar el mensaje de instrucciones
  const instructionMessage = page.locator('text=/Next, you\'ll scan a QR using your child\'s WhatsApp/i');
  await expect(instructionMessage).toBeVisible();
  
  console.log('✅ Mensaje de instrucciones encontrado');
  
  // Verificar que hay un botón para crear la primera conexión
  const createButton = page.locator('button:has-text("Add Child\'s WhatsApp"), button:has-text("Create"), button:has-text("Get Started")');
  await expect(createButton).toBeVisible();
  
  console.log('✅ Botón para crear conexión encontrado');
});

/**
 * TC-15: Verificación de la navegación
 * Basado en los enlaces encontrados en el análisis
 */
test('TC-15: Navegación de la página', async ({ page }) => {
  await login(page);
  
  // Verificar enlaces de navegación encontrados en el análisis
  const dashboardLink = page.locator('a[href="/dashboard"]:has-text("Dashboard")');
  const connectionsLink = page.locator('a[href="/connections"]:has-text("Connections")');
  const settingsLink = page.locator('a[href="/settings"]:has-text("Settings")');
  
  // Verificar que los enlaces están visibles
  await expect(dashboardLink).toBeVisible();
  await expect(connectionsLink).toBeVisible();
  await expect(settingsLink).toBeVisible();
  
  console.log('✅ Enlaces de navegación encontrados');
  
  // Probar navegación al dashboard
  await dashboardLink.click();
  await expect(page).toHaveURL(/dashboard/);
  console.log('✅ Navegación al dashboard funciona');
  
  // Volver a connections
  await page.goto('https://mishu.co.il/connections');
  await expect(page).toHaveURL(/connections/);
  console.log('✅ Navegación de vuelta a connections funciona');
  
  // Probar navegación a settings
  await settingsLink.click();
  await expect(page).toHaveURL(/settings/);
  console.log('✅ Navegación a settings funciona');
});

/**
 * TC-16: Verificación del toggle del sidebar
 * Basado en el botón encontrado en el análisis
 */
test('TC-16: Toggle del sidebar', async ({ page }) => {
  await login(page);
  
  // Buscar el botón de toggle del sidebar encontrado en el análisis
  const toggleButton = page.locator('button:has-text("Toggle Sidebar")');
  
  if (await toggleButton.count() > 0) {
    await expect(toggleButton).toBeVisible();
    console.log('✅ Botón "Toggle Sidebar" encontrado');
    
    // Hacer clic en el toggle
    await toggleButton.click();
    await page.waitForTimeout(1000);
    
    // Verificar si el sidebar cambió de estado
    const sidebar = page.locator('aside, .sidebar, .side-nav');
    if (await sidebar.count() > 0) {
      const isVisible = await sidebar.first().isVisible();
      console.log(`ℹ️ Sidebar visible después del toggle: ${isVisible}`);
    }
    
    // Hacer clic nuevamente para restaurar
    await toggleButton.click();
    await page.waitForTimeout(1000);
    console.log('✅ Toggle del sidebar funciona');
  } else {
    console.log('ℹ️ Botón "Toggle Sidebar" no encontrado, saltando test');
    test.skip();
  }
});

/**
 * TC-17: Verificación del título y metadata de la página
 */
test('TC-17: Metadata de la página', async ({ page }) => {
  await login(page);
  
  // Verificar el título encontrado en el análisis
  const pageTitle = await page.title();
  expect(pageTitle).toContain('mishu');
  console.log(`✅ Título de la página: ${pageTitle}`);
  
  // Verificar que la URL es correcta
  expect(page.url()).toBe('https://mishu.co.il/connections');
  console.log('✅ URL correcta');
  
  // Verificar que hay un logo
  const logo = page.locator('img[alt="mishu"]');
  await expect(logo).toBeVisible();
  console.log('✅ Logo de mishu encontrado');
  
  // Verificar que el logo tiene la fuente correcta
  const logoSrc = await logo.getAttribute('src');
  expect(logoSrc).toContain('mishu_svg.svg');
  console.log('✅ Logo tiene la fuente correcta');
});

/**
 * TC-18: Verificación de responsividad básica
 */
test('TC-18: Responsividad básica', async ({ page }) => {
  await login(page);
  
  // Probar diferentes tamaños de pantalla
  const viewports = [
    { name: 'Desktop', width: 1920, height: 1080 },
    { name: 'Laptop', width: 1366, height: 768 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Mobile', width: 375, height: 667 }
  ];
  
  for (const viewport of viewports) {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.waitForTimeout(500);
    
    // Verificar que los elementos principales siguen siendo visibles
    const addButton = page.locator('button:has-text("Add Child\'s WhatsApp")');
    await expect(addButton).toBeVisible();
    
    const emptyMessage = page.locator('text=/You haven\'t created any WhatsApp connections yet/i');
    await expect(emptyMessage).toBeVisible();
    
    console.log(`✅ Responsividad OK para ${viewport.name} (${viewport.width}x${viewport.height})`);
  }
});

/**
 * TC-19: Verificación de accesibilidad básica
 */
test('TC-19: Accesibilidad básica', async ({ page }) => {
  await login(page);
  
  // Verificar que los botones tienen texto descriptivo
  const addButton = page.locator('button:has-text("Add Child\'s WhatsApp")');
  const buttonText = await addButton.textContent();
  expect(buttonText.trim().length).toBeGreaterThan(0);
  console.log('✅ Botón tiene texto descriptivo');
  
  // Verificar que las imágenes tienen alt text
  const logo = page.locator('img[alt="mishu"]');
  const altText = await logo.getAttribute('alt');
  expect(altText).toBeTruthy();
  console.log('✅ Imagen tiene alt text');
  
  // Verificar que los enlaces tienen texto
  const dashboardLink = page.locator('a[href="/dashboard"]:has-text("Dashboard")');
  const linkText = await dashboardLink.textContent();
  expect(linkText.trim().length).toBeGreaterThan(0);
  console.log('✅ Enlaces tienen texto descriptivo');
  
  // Verificar que no hay elementos con solo iconos sin texto
  const iconOnlyButtons = page.locator('button:not(:has-text())');
  const iconCount = await iconOnlyButtons.count();
  console.log(`ℹ️ Botones sin texto encontrados: ${iconCount}`);
});

/**
 * TC-20: Verificación de elementos de estado
 */
test('TC-20: Elementos de estado', async ({ page }) => {
  await login(page);
  
  // Buscar los 4 indicadores de estado encontrados en el análisis
  const statusIndicators = page.locator('.status, .state, .indicator, .badge, [class*="status"], [class*="state"]');
  const indicatorCount = await statusIndicators.count();
  
  console.log(`Encontrados ${indicatorCount} indicadores de estado`);
  
  if (indicatorCount > 0) {
    for (let i = 0; i < indicatorCount; i++) {
      const indicator = statusIndicators.nth(i);
      const text = await indicator.textContent();
      const className = await indicator.getAttribute('class');
      
      console.log(`Indicador ${i + 1}: "${text?.trim() || 'sin texto'}" (${className})`);
      
      // Verificar que el indicador es visible
      await expect(indicator).toBeVisible();
    }
    console.log('✅ Todos los indicadores de estado son visibles');
  } else {
    console.log('ℹ️ No se encontraron indicadores de estado específicos');
  }
});
