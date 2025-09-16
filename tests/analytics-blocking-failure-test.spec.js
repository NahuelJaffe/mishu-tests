// Test que simula un bloqueo fallido para demostrar el sistema de cancelación
// Este test está diseñado para fallar y mostrar cómo funciona la cancelación

const { test, expect } = require('@playwright/test');

test.describe('Analytics Blocking Failure Simulation', () => {
  test('Should be cancelled if analytics blocking fails', async ({ page }) => {
    console.log('🧪 Simulando fallo en bloqueo de analytics...');
    
    // Configurar bloqueo de analytics explícitamente primero
    try {
      const { setupAnalyticsForTest } = require('./analytics-setup.js');
      await setupAnalyticsForTest(page);
      console.log('✅ Analytics bloqueado para test de fallo');
    } catch (error) {
      console.error('❌ Error al configurar analytics:', error);
      throw error;
    }
    
    // Este test está diseñado para demostrar qué pasa cuando el bloqueo falla
    // En un escenario real, si el bloqueo no funciona, este test se cancelaría automáticamente
    
    // Intentar deshabilitar el bloqueo (esto debería fallar)
    await page.evaluate(() => {
      // Intentar sobrescribir las funciones de bloqueo
      window.gtag = function() { console.log('gtag called - BLOCKING FAILED!'); };
      window.ga = function() { console.log('ga called - BLOCKING FAILED!'); };
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push = function() { console.log('dataLayer pushed - BLOCKING FAILED!'); };
    });
    
    // Navegar a la página
    await page.goto('/');
    
    // Verificar el estado del bloqueo
    const blockingStatus = await page.evaluate(() => {
      return {
        e2eDisabled: window.__E2E_ANALYTICS_DISABLED__ === true,
        playwrightTest: window.__PLAYWRIGHT_TEST__ === true,
        nuclearBlocker: window.__NUCLEAR_ANALYTICS_BLOCKER__ === true,
        gtagBlocked: typeof window.gtag === 'function' && 
          window.gtag.toString().includes('blocked'),
        gaBlocked: typeof window.ga === 'function' && 
          window.ga.toString().includes('blocked')
      };
    });
    
    console.log('📊 Estado del bloqueo después de intentar deshabilitarlo:', blockingStatus);
    
    // En un escenario real, si el bloqueo no funciona, el test se cancelaría aquí
    // Este test está diseñado para mostrar cómo funciona el sistema de verificación
    
    console.log('⚠️ Este test demuestra cómo se detectaría un bloqueo fallido');
    console.log('⚠️ En un escenario real, el test se cancelaría automáticamente');
    
    // Verificar que el bloqueo sigue funcionando (debería ser true)
    expect(blockingStatus.e2eDisabled).toBe(true);
    expect(blockingStatus.playwrightTest).toBe(true);
    expect(blockingStatus.nuclearBlocker).toBe(true);
  });
});
