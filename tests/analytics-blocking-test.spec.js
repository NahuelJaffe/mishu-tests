// Test para verificar que el bloqueo de analytics funciona correctamente
const { test, expect } = require('@playwright/test');

test.describe('Analytics Blocking Verification', () => {
  test('Should block analytics requests and show 0 users', async ({ page }) => {
    console.log('🔍 Testing analytics blocking...');
    
    // Navegar a la página principal
    await page.goto('/');
    
    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');
    
    // Verificar que no hay scripts de analytics cargados
    const analyticsScripts = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      return scripts
        .map(script => script.src)
        .filter(src => 
          src.includes('google-analytics.com') ||
          src.includes('googletagmanager.com') ||
          src.includes('facebook.net') ||
          src.includes('doubleclick.net') ||
          src.includes('firebase') ||
          src.includes('analytics')
        );
    });
    
    console.log('📊 Analytics scripts found:', analyticsScripts.length);
    expect(analyticsScripts.length).toBe(0);
    
    // Verificar que las variables de bloqueo están definidas
    const blockingStatus = await page.evaluate(() => {
      return {
        e2eDisabled: window.__E2E_ANALYTICS_DISABLED__ === true,
        playwrightTest: window.__PLAYWRIGHT_TEST__ === true,
        automatedTesting: window.__AUTOMATED_TESTING__ === true,
        nuclearBlocker: window.__NUCLEAR_ANALYTICS_BLOCKER__ === true,
        gtagBlocked: typeof window.gtag === 'function',
        gaBlocked: typeof window.ga === 'function',
        dataLayerEmpty: Array.isArray(window.dataLayer) && window.dataLayer.length === 0
      };
    });
    
    console.log('🚫 Blocking status:', blockingStatus);
    
    // Verificar que el bloqueo está activo
    expect(blockingStatus.e2eDisabled).toBe(true);
    expect(blockingStatus.playwrightTest).toBe(true);
    expect(blockingStatus.automatedTesting).toBe(true);
    expect(blockingStatus.nuclearBlocker).toBe(true);
    
    // Verificar que las funciones de analytics están bloqueadas
    expect(blockingStatus.gtagBlocked).toBe(true);
    expect(blockingStatus.gaBlocked).toBe(true);
    expect(blockingStatus.dataLayerEmpty).toBe(true);
    
    console.log('✅ Analytics blocking verification completed successfully');
  });
  
  test('Should block Firebase Analytics specifically', async ({ page }) => {
    console.log('🔍 Testing Firebase Analytics blocking...');
    
    // Navegar a la página principal
    await page.goto('/');
    
    // Esperar a que la página cargue
    await page.waitForLoadState('networkidle');
    
    // Verificar que Firebase Analytics está bloqueado
    const firebaseStatus = await page.evaluate(() => {
      return {
        firebaseExists: !!window.firebase,
        analyticsExists: !!(window.firebase && window.firebase.analytics),
        logEventBlocked: !!(window.firebase && 
          window.firebase.analytics && 
          window.firebase.analytics.logEvent &&
          window.firebase.analytics.logEvent.toString().includes('blocked')
        ),
        setUserIdBlocked: !!(window.firebase && 
          window.firebase.analytics && 
          window.firebase.analytics.setUserId &&
          window.firebase.analytics.setUserId.toString().includes('blocked')
        )
      };
    });
    
    console.log('🔥 Firebase blocking status:', firebaseStatus);
    
    // Verificar que Firebase Analytics está bloqueado
    if (firebaseStatus.firebaseExists) {
      expect(firebaseStatus.analyticsExists).toBe(true);
      expect(firebaseStatus.logEventBlocked).toBe(true);
      expect(firebaseStatus.setUserIdBlocked).toBe(true);
    }
    
    console.log('✅ Firebase Analytics blocking verification completed');
  });
});
