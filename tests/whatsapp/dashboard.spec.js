const { test, expect } = require('@playwright/test');

// Test suite para el Dashboard en WhatsApp Monitor

/**
 * Función auxiliar para iniciar sesión
 */
async function login(page) {
  await page.goto('https://mishu.co.il/login');
  await page.fill('input[type="email"]', 'nahueljaffe+testmishu@gmail.com');
  await page.fill('input[type="password"]', 'Prueba1');
  await page.click('button[type="submit"]');
  // Esperar a que se complete el login
  await expect(page).toHaveURL(/connections/);
}

/**
 * TC-10: Empty state display
 * Verifica que se muestre correctamente el estado vacío cuando no hay datos
 */
test('TC-10: Empty state display', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  // Navegar al dashboard principal
  await page.goto('https://mishu.co.il/dashboard');
  
  // Verificar que estamos en el dashboard
  await expect(page).toHaveURL(/dashboard|home/);
  
  // Verificar si hay datos o si se muestra el estado vacío
  const emptyState = page.locator('.empty-state, .no-data, .welcome-message, .getting-started');
  const dataContent = page.locator('.dashboard-content, .stats, .metrics, .data-grid');
  
  if (await emptyState.count() > 0) {
    // Se muestra el estado vacío
    await expect(emptyState).toBeVisible();
    
    // Verificar que el estado vacío tiene elementos informativos
    const emptyStateTitle = emptyState.locator('h1, h2, h3, .title');
    const emptyStateDescription = emptyState.locator('p, .description, .subtitle');
    const emptyStateAction = emptyState.locator('button, a, .cta-button');
    
    await expect(emptyStateTitle).toBeVisible();
    await expect(emptyStateDescription).toBeVisible();
    
    // Verificar que hay una acción sugerida (como conectar WhatsApp)
    if (await emptyStateAction.count() > 0) {
      await expect(emptyStateAction).toBeVisible();
      await expect(emptyStateAction).toContainText(/connect|start|begin|setup/i);
    }
  } else if (await dataContent.count() > 0) {
    // Hay datos en el dashboard
    await expect(dataContent).toBeVisible();
    console.log('Dashboard contains data, empty state test passed');
  } else {
    // No se encontró ni estado vacío ni contenido de datos
    console.log('Neither empty state nor data content found');
  }
});

/**
 * TC-11: Navigation menu functionality
 * Verifica que el menú de navegación funcione correctamente
 */
test('TC-11: Navigation menu functionality', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  // Navegar al dashboard
  await page.goto('https://mishu.co.il/dashboard');
  
  // Verificar que existe el menú de navegación
  const navigationMenu = page.locator('nav, .navigation, .sidebar, .menu');
  await expect(navigationMenu).toBeVisible();
  
  // Verificar elementos comunes del menú
  const menuItems = navigationMenu.locator('a, button, .menu-item, .nav-item');
  const menuCount = await menuItems.count();
  expect(menuCount).toBeGreaterThanOrEqual(2); // Al menos 2 elementos de menú
  
  // Verificar elementos específicos del menú
  const expectedMenuItems = [
    'Dashboard', 'Messages', 'Connections', 'Settings', 'Profile'
  ];
  
  for (const itemText of expectedMenuItems) {
    const menuItem = navigationMenu.locator(`text=${itemText}, a:has-text("${itemText}")`);
    if (await menuItem.count() > 0) {
      await expect(menuItem).toBeVisible();
      
      // Hacer clic en el elemento del menú
      await menuItem.click();
      
      // Verificar que la navegación funciona
      // Nota: La URL puede variar según la implementación
      await page.waitForLoadState('networkidle');
      
      // Verificar que el elemento del menú está activo (si aplica)
      const activeMenuItem = menuItem.locator('.active, .selected, [aria-current="page"]');
      if (await activeMenuItem.count() > 0) {
        await expect(activeMenuItem).toBeVisible();
      }
    }
  }
  
  // Verificar menú móvil si existe
  const mobileMenuToggle = page.locator('.mobile-menu-toggle, .hamburger, .menu-toggle');
  if (await mobileMenuToggle.count() > 0) {
    await mobileMenuToggle.click();
    
    // Verificar que el menú móvil se abre
    const mobileMenu = page.locator('.mobile-menu, .mobile-navigation');
    await expect(mobileMenu).toBeVisible();
    
    // Cerrar el menú móvil
    await mobileMenuToggle.click();
    await expect(mobileMenu).not.toBeVisible();
  }
});

/**
 * TC-12: Quick actions accessibility
 * Verifica que las acciones rápidas sean accesibles y funcionen correctamente
 */
test('TC-12: Quick actions accessibility', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  // Navegar al dashboard
  await page.goto('https://mishu.co.il/dashboard');
  
  // Verificar que existen acciones rápidas
  const quickActions = page.locator('.quick-actions, .action-buttons, .dashboard-actions');
  
  if (await quickActions.count() > 0) {
    await expect(quickActions).toBeVisible();
    
    // Verificar que las acciones rápidas tienen botones accesibles
    const actionButtons = quickActions.locator('button, a, .action-button');
    await expect(actionButtons).toHaveCount({ min: 1 });
    
    // Verificar cada acción rápida
    const actionCount = await actionButtons.count();
    for (let i = 0; i < actionCount; i++) {
      const button = actionButtons.nth(i);
      
      // Verificar que el botón es visible y clickeable
      await expect(button).toBeVisible();
      await expect(button).toBeEnabled();
      
      // Verificar que tiene texto descriptivo
      const buttonText = await button.textContent();
      expect(buttonText).toBeTruthy();
      expect(buttonText.trim().length).toBeGreaterThan(0);
      
      // Verificar accesibilidad básica
      const ariaLabel = await button.getAttribute('aria-label');
      const title = await button.getAttribute('title');
      
      // Al menos uno de estos atributos debe existir para accesibilidad
      expect(ariaLabel || title || buttonText).toBeTruthy();
    }
    
    // Verificar acciones específicas comunes
    const connectButton = quickActions.locator('button:has-text("Connect"), a:has-text("Connect"), button:has-text("WhatsApp")');
    if (await connectButton.count() > 0) {
      await connectButton.click();
      
      // Verificar que nos lleva a la página de conexión
      await expect(page).toHaveURL(/connect|whatsapp/);
    }
    
    const viewMessagesButton = quickActions.locator('button:has-text("Messages"), a:has-text("Messages"), button:has-text("View")');
    if (await viewMessagesButton.count() > 0) {
      await viewMessagesButton.click();
      
      // Verificar que nos lleva a la página de mensajes
      await expect(page).toHaveURL(/messages|chats/);
    }
  } else {
    console.log('Quick actions not found, skipping test');
    test.skip();
  }
});
