// Test de demostración del sistema de verificación de bloqueo de analytics
// Este test muestra cómo funciona el sistema de cancelación automática

const { test, expect } = require('@playwright/test');

test.describe('Analytics Blocking Verification System', () => {
  test('Should pass if analytics blocking is working', async ({ page }) => {
    console.log('🧪 Ejecutando test con bloqueo de analytics...');
    
    // Este test solo se ejecutará si el bloqueo de analytics funciona
    // Si el bloqueo no funciona, el test se cancela automáticamente en el setup
    
    // Navegar a la página principal
    await page.goto('/');
    
    // Verificar que estamos en la página correcta
    await expect(page).toHaveTitle(/mishu/);
    
    // Verificar que no hay scripts de analytics
    const analyticsScripts = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts
        .map(script => script.src)
        .filter(src => 
          src.includes('google-analytics.com') ||
          src.includes('googletagmanager.com') ||
          src.includes('firebase') ||
          src.includes('analytics')
        );
    });
    
    console.log('📊 Scripts de analytics encontrados:', analyticsScripts.length);
    expect(analyticsScripts.length).toBe(0);
    
    // Verificar que las variables de bloqueo están activas
    const blockingStatus = await page.evaluate(() => {
      return {
        e2eDisabled: window.__E2E_ANALYTICS_DISABLED__ === true,
        playwrightTest: window.__PLAYWRIGHT_TEST__ === true,
        nuclearBlocker: window.__NUCLEAR_ANALYTICS_BLOCKER__ === true
      };
    });
    
    expect(blockingStatus.e2eDisabled).toBe(true);
    expect(blockingStatus.playwrightTest).toBe(true);
    expect(blockingStatus.nuclearBlocker).toBe(true);
    
    console.log('✅ Test completado exitosamente - Bloqueo de analytics funcionando');
  });
  
  test('Should verify Firebase Analytics is blocked', async ({ page }) => {
    console.log('🔥 Verificando bloqueo específico de Firebase Analytics...');
    
    // Navegar a la página principal
    await page.goto('/');
    
    // Verificar que Firebase Analytics está bloqueado
    const firebaseStatus = await page.evaluate(() => {
      if (!window.firebase || !window.firebase.analytics) {
        return { firebaseBlocked: true, message: 'Firebase not loaded' };
      }
      
      return {
        firebaseBlocked: window.firebase.analytics.logEvent.toString().includes('blocked'),
        message: 'Firebase loaded but blocked'
      };
    });
    
    console.log('🔥 Firebase status:', firebaseStatus);
    expect(firebaseStatus.firebaseBlocked).toBe(true);
    
    console.log('✅ Firebase Analytics bloqueado correctamente');
  });
  
  test('Should verify Google Analytics is blocked', async ({ page }) => {
    console.log('📊 Verificando bloqueo específico de Google Analytics...');
    
    // Navegar a la página principal
    await page.goto('/');
    
    // Verificar que Google Analytics está bloqueado
    const gaStatus = await page.evaluate(() => {
      return {
        gaBlocked: typeof window.ga === 'function' && 
          window.ga.toString().includes('blocked'),
        gtagBlocked: typeof window.gtag === 'function' && 
          window.gtag.toString().includes('blocked'),
        dataLayerEmpty: Array.isArray(window.dataLayer) && window.dataLayer.length === 0
      };
    });
    
    console.log('📊 Google Analytics status:', gaStatus);
    expect(gaStatus.gaBlocked).toBe(true);
    expect(gaStatus.gtagBlocked).toBe(true);
    expect(gaStatus.dataLayerEmpty).toBe(true);
    
    console.log('✅ Google Analytics bloqueado correctamente');
  });
});
