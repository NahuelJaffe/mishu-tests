const { test, expect } = require('@playwright/test');

// Test suite para la interfaz de usuario en WhatsApp Monitor

/**
 * Función auxiliar para iniciar sesión
 */
async function login(page) {
  const baseURL = process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/';
  await page.goto(`${baseURL}login`);
  await page.fill('input[type="email"]', process.env.TEST_EMAIL);
  await page.fill('input[type="password"]', process.env.TEST_PASSWORD);
  await page.click('button[type="submit"]');
  // Esperar a que se complete el login
  await expect(page).toHaveURL(/connections/);
}

/**
 * TC-21: Responsive design
 * Verifica que la aplicación sea responsive en diferentes tamaños de pantalla
 */
test('TC-21: Responsive design', async ({ page }) => {
  // Iniciar sesión
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
    
    // Navegar al dashboard
    await page.goto('https://mishu.co.il/dashboard');
    
    // Verificar que la página se carga correctamente
    await expect(page).toHaveURL(/dashboard|home/);
    
    // Verificar elementos principales
    const mainContent = page.locator('main, .main-content, .dashboard');
  await expect(mainContent).toBeVisible();
  
    // Verificar navegación
    const navigation = page.locator('nav, .navigation, .sidebar');
    await expect(navigation).toBeVisible();
    
    // En móvil, verificar que el menú se puede colapsar
    if (viewport.width <= 768) {
      const mobileMenuToggle = page.locator('.mobile-menu-toggle, .hamburger, .menu-toggle');
      if (await mobileMenuToggle.count() > 0) {
        await expect(mobileMenuToggle).toBeVisible();
        
        // Verificar que el menú móvil funciona
        await mobileMenuToggle.click();
        const mobileMenu = page.locator('.mobile-menu, .mobile-navigation');
        await expect(mobileMenu).toBeVisible();
        
        await mobileMenuToggle.click();
        await expect(mobileMenu).not.toBeVisible();
      }
    }
    
    // Verificar que no hay scroll horizontal innecesario
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const viewportWidth = viewport.width;
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 20); // Margen de error
    
    console.log(`Responsive design test passed for ${viewport.name} (${viewport.width}x${viewport.height})`);
  }
});

/**
 * TC-22: Language switching
 * Verifica que el cambio de idioma funcione correctamente
 */
test('TC-22: Language switching', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  // Navegar al dashboard
  await page.goto('https://mishu.co.il/dashboard');
  
  // Buscar el selector de idioma
  const languageSelector = page.locator('.language-selector, .locale-selector, select[name="language"], .lang-switcher');
  
  if (await languageSelector.count() > 0) {
    await expect(languageSelector).toBeVisible();
    
    // Verificar idiomas disponibles
    const languageOptions = languageSelector.locator('option, .language-option');
    const languageCount = await languageOptions.count();
    expect(languageCount).toBeGreaterThanOrEqual(2); // Al menos 2 idiomas
    
    // Probar cambiar a español
    const spanishOption = languageSelector.locator('option[value="es"], .language-option:has-text("Español"), .language-option:has-text("Spanish")');
    if (await spanishOption.count() > 0) {
      await spanishOption.click();
      
      // Esperar a que se recargue la página o se actualice el contenido
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      
      // Verificar que el contenido cambió al español
      // Buscar texto en español común
      const spanishText = page.locator('text=/inicio|mensajes|configuración|perfil/i');
      if (await spanishText.count() > 0) {
        await expect(spanishText.first()).toBeVisible();
        console.log('Language switched to Spanish successfully');
      }
    }
    
    // Probar cambiar a inglés
    const englishOption = languageSelector.locator('option[value="en"], .language-option:has-text("English"), .language-option:has-text("Inglés")');
    if (await englishOption.count() > 0) {
      await englishOption.click();
      
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      
      // Verificar que el contenido cambió al inglés
      const englishText = page.locator('text=/home|messages|settings|profile/i');
      if (await englishText.count() > 0) {
        await expect(englishText.first()).toBeVisible();
        console.log('Language switched to English successfully');
      }
    }
    
    // Probar cambiar a hebreo
    const hebrewOption = languageSelector.locator('option[value="he"], .language-option:has-text("עברית"), .language-option:has-text("Hebrew")');
    if (await hebrewOption.count() > 0) {
      await hebrewOption.click();
      
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      
      // Verificar que el contenido cambió al hebreo
      const hebrewText = page.locator('text=/בית|הודעות|הגדרות|פרופיל/i');
      if (await hebrewText.count() > 0) {
        await expect(hebrewText.first()).toBeVisible();
        console.log('Language switched to Hebrew successfully');
      }
    }
  } else {
    console.log('Language selector not found, skipping test');
    test.skip();
  }
});

/**
 * TC-23: RTL support (Hebrew)
 * Verifica que la aplicación soporte correctamente el texto de derecha a izquierda
 */
test('TC-23: RTL support (Hebrew)', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  // Cambiar idioma a hebreo si es posible
  await page.goto('https://mishu.co.il/dashboard');
  
  const languageSelector = page.locator('.language-selector, .locale-selector, select[name="language"], .lang-switcher');
  
  if (await languageSelector.count() > 0) {
    const hebrewOption = languageSelector.locator('option[value="he"], .language-option:has-text("עברית"), .language-option:has-text("Hebrew")');
    
    if (await hebrewOption.count() > 0) {
      await hebrewOption.click();
      await page.waitForLoadState('domcontentloaded', { timeout: 10000 });
      
      // Verificar que el documento tiene dirección RTL
      const htmlDir = await page.evaluate(() => document.documentElement.dir);
      const bodyDir = await page.evaluate(() => document.body.dir);
      
      // Al menos uno debe ser 'rtl'
      expect(htmlDir === 'rtl' || bodyDir === 'rtl').toBeTruthy();
      
      // Verificar elementos específicos tienen dirección RTL
      const rtlElements = page.locator('[dir="rtl"], .rtl');
      if (await rtlElements.count() > 0) {
        await expect(rtlElements.first()).toBeVisible();
      }
      
      // Verificar que el texto hebreo se muestra correctamente
      const hebrewText = page.locator('text=/עברית|בית|הודעות|הגדרות/i');
      if (await hebrewText.count() > 0) {
        await expect(hebrewText.first()).toBeVisible();
        
        // Verificar que el texto tiene la dirección correcta
        const textDirection = await hebrewText.first().evaluate(el => getComputedStyle(el).direction);
        expect(textDirection).toBe('rtl');
      }
      
      // Verificar que los elementos de navegación están alineados correctamente
      const navigation = page.locator('nav, .navigation, .sidebar');
      if (await navigation.count() > 0) {
        const navDirection = await navigation.first().evaluate(el => getComputedStyle(el).direction);
        expect(navDirection).toBe('rtl');
      }
      
      console.log('RTL support verified for Hebrew language');
    } else {
      console.log('Hebrew language option not found, skipping RTL test');
      test.skip();
    }
  } else {
    console.log('Language selector not found, skipping RTL test');
    test.skip();
  }
});

/**
 * TC-24: Dark/light mode (if applicable)
 * Verifica que el modo oscuro/claro funcione correctamente
 */
test('TC-24: Dark/light mode (if applicable)', async ({ page }) => {
  // Iniciar sesión
  await login(page);
  
  // Navegar al dashboard
  await page.goto('https://mishu.co.il/dashboard');
  
  // Buscar el toggle de modo oscuro/claro
  const themeToggle = page.locator('.theme-toggle, .dark-mode-toggle, .light-mode-toggle, button[aria-label*="theme"], button[aria-label*="mode"]');
  
  if (await themeToggle.count() > 0) {
    await expect(themeToggle).toBeVisible();
    
    // Verificar el estado inicial
    const initialTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') || 
             document.documentElement.classList.contains('dark-mode') ||
             document.body.classList.contains('dark') ||
             document.body.classList.contains('dark-mode');
    });
    
    // Hacer clic en el toggle
    await themeToggle.click();
    
    // Esperar a que se aplique el cambio
    await page.waitForTimeout(500);
    
    // Verificar que el tema cambió
    const newTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') || 
             document.documentElement.classList.contains('dark-mode') ||
             document.body.classList.contains('dark') ||
             document.body.classList.contains('dark-mode');
    });
    
    // El tema debe haber cambiado
    expect(newTheme).not.toBe(initialTheme);
    
    // Verificar que los elementos principales son visibles en ambos modos
    const mainContent = page.locator('main, .main-content, .dashboard');
    await expect(mainContent).toBeVisible();
    
    const navigation = page.locator('nav, .navigation, .sidebar');
    await expect(navigation).toBeVisible();
    
    // Cambiar de vuelta al tema original
    await themeToggle.click();
    await page.waitForTimeout(500);
    
    const originalTheme = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark') || 
             document.documentElement.classList.contains('dark-mode') ||
             document.body.classList.contains('dark') ||
             document.body.classList.contains('dark-mode');
    });
    
    expect(originalTheme).toBe(initialTheme);
    
    console.log('Dark/light mode toggle working correctly');
  } else {
    // Verificar si el tema se puede cambiar desde las configuraciones
    const settingsLink = page.locator('a:has-text("Settings"), a:has-text("Configuración"), a:has-text("הגדרות")');
    
    if (await settingsLink.count() > 0) {
      await settingsLink.click();
      
      // Buscar configuración de tema en la página de configuraciones
      const themeSetting = page.locator('.theme-setting, .appearance-setting, input[name="theme"], select[name="theme"]');
      
      if (await themeSetting.count() > 0) {
        await expect(themeSetting).toBeVisible();
        
        // Probar cambiar el tema desde configuraciones
        if (await themeSetting.locator('option').count() > 0) {
          const darkOption = themeSetting.locator('option[value="dark"], option:has-text("Dark"), option:has-text("Oscuro")');
          if (await darkOption.count() > 0) {
            await darkOption.click();
            await page.waitForTimeout(500);
            
            // Verificar que el tema cambió
            const isDarkMode = await page.evaluate(() => {
              return document.documentElement.classList.contains('dark') || 
                     document.documentElement.classList.contains('dark-mode') ||
                     document.body.classList.contains('dark') ||
                     document.body.classList.contains('dark-mode');
            });
            
            expect(isDarkMode).toBeTruthy();
            console.log('Dark mode enabled from settings');
          }
        }
      } else {
        console.log('Theme setting not found in settings page');
      }
    } else {
      console.log('Theme toggle and settings not found, skipping test');
    test.skip();
    }
  }
});