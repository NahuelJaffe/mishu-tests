// Verificador de bloqueo de analytics
// Este módulo verifica que el bloqueo esté funcionando antes de ejecutar tests

const { test } = require('@playwright/test');

/**
 * Verifica que el bloqueo de analytics esté funcionando correctamente
 * @param {Page} page - La página de Playwright
 * @returns {Promise<boolean>} - true si el bloqueo funciona, false si no
 */
async function verifyAnalyticsBlocking(page) {
  console.log('🔍 Verificando bloqueo de analytics...');
  
  try {
    // 1. Verificar que las variables de bloqueo estén definidas
    const blockingVariables = await page.evaluate(() => {
      return {
        e2eDisabled: window.__E2E_ANALYTICS_DISABLED__ === true,
        playwrightTest: window.__PLAYWRIGHT_TEST__ === true,
        automatedTesting: window.__AUTOMATED_TESTING__ === true,
        nuclearBlocker: window.__NUCLEAR_ANALYTICS_BLOCKER__ === true
      };
    });
    
    console.log('📊 Variables de bloqueo:', blockingVariables);
    
    // 2. Verificar que las funciones de analytics estén bloqueadas
    const analyticsFunctions = await page.evaluate(() => {
      return {
        gtagBlocked: typeof window.gtag === 'function' && 
          window.gtag.toString().includes('blocked'),
        gaBlocked: typeof window.ga === 'function' && 
          window.ga.toString().includes('blocked'),
        fbqBlocked: typeof window.fbq === 'function' && 
          window.fbq.toString().includes('blocked'),
        dataLayerEmpty: Array.isArray(window.dataLayer) && window.dataLayer.length === 0
      };
    });
    
    console.log('🚫 Funciones de analytics:', analyticsFunctions);
    
    // 3. Verificar que no hay scripts de analytics cargados
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
    
    console.log('📜 Scripts de analytics encontrados:', analyticsScripts.length);
    
    // 4. Verificar Firebase Analytics específicamente
    const firebaseStatus = await page.evaluate(() => {
      if (!window.firebase || !window.firebase.analytics) {
        return { firebaseBlocked: true };
      }
      
      return {
        firebaseBlocked: window.firebase.analytics.logEvent.toString().includes('blocked') &&
          window.firebase.analytics.setUserId.toString().includes('blocked')
      };
    });
    
    console.log('🔥 Firebase Analytics:', firebaseStatus);
    
    // 5. Evaluar si el bloqueo está funcionando
    const isBlockingWorking = 
      blockingVariables.e2eDisabled &&
      blockingVariables.playwrightTest &&
      blockingVariables.automatedTesting &&
      blockingVariables.nuclearBlocker &&
      analyticsFunctions.gtagBlocked &&
      analyticsFunctions.gaBlocked &&
      analyticsFunctions.dataLayerEmpty &&
      analyticsScripts.length === 0 &&
      firebaseStatus.firebaseBlocked;
    
    if (isBlockingWorking) {
      console.log('✅ BLOQUEO DE ANALYTICS FUNCIONANDO CORRECTAMENTE');
      return true;
    } else {
      console.log('❌ BLOQUEO DE ANALYTICS NO ESTÁ FUNCIONANDO');
      console.log('📋 Estado detallado:');
      console.log('  - Variables de bloqueo:', blockingVariables);
      console.log('  - Funciones de analytics:', analyticsFunctions);
      console.log('  - Scripts encontrados:', analyticsScripts.length);
      console.log('  - Firebase bloqueado:', firebaseStatus.firebaseBlocked);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Error verificando bloqueo de analytics:', error);
    return false;
  }
}

/**
 * Hook que se ejecuta antes de cada test para verificar el bloqueo
 * Si el bloqueo no funciona, el test se cancela
 */
async function setupAnalyticsVerification(page) {
  console.log('🚀 Configurando verificación de bloqueo de analytics...');
  
  // Navegar a la página principal para verificar el bloqueo
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  
  // Verificar que el bloqueo esté funcionando
  const isBlockingWorking = await verifyAnalyticsBlocking(page);
  
  if (!isBlockingWorking) {
    console.log('🚫 CANCELANDO TEST - Bloqueo de analytics no funciona');
    throw new Error('Analytics blocking is not working. Test cancelled to prevent data leakage.');
  }
  
  console.log('✅ Verificación de bloqueo completada - Test puede continuar');
}

module.exports = {
  verifyAnalyticsBlocking,
  setupAnalyticsVerification
};
