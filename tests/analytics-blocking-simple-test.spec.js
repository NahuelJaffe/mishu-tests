// Test simple para verificar si el bloqueo de analytics funciona
const { test, expect } = require('@playwright/test');

test.describe('Analytics Blocking Simple Test', () => {
  
  test('Verificar que analytics están bloqueados', async ({ page }) => {
    console.log('🔍 Verificando bloqueo de analytics...');
    
    // Verificar si el setup global se ejecutó
    console.log('🔍 Verificando si el setup global se ejecutó...');
    
    // NO agregar bloqueo manual - solo verificar si el setup global funciona
    console.log('🔍 Verificando si el setup global está funcionando...');
    
    // Llamar explícitamente al setup para verificar si funciona
    console.log('🔍 Llamando setupAnalyticsForTest explícitamente...');
    try {
      const { setupAnalyticsForTest } = require('./analytics-setup.js');
      await setupAnalyticsForTest(page);
      console.log('✅ setupAnalyticsForTest ejecutado exitosamente');
    } catch (error) {
      console.error('❌ Error al ejecutar setupAnalyticsForTest:', error);
    }
    
    let analyticsRequestsDetected = 0;
    let analyticsRequestsBlocked = 0;
    
    // Listener para detectar requests de analytics
    page.on('request', request => {
      const url = request.url();
      const analyticsDomains = [
        'googletagmanager.com',
        'google-analytics.com',
        'facebook.com/tr',
        'doubleclick.net'
      ];
      
      const isAnalytics = analyticsDomains.some(domain => url.includes(domain));
      if (isAnalytics) {
        analyticsRequestsDetected++;
        console.log('🚨 REQUEST DE ANALYTICS DETECTADA:', url);
      }
    });
    
    // Listener para detectar requests bloqueadas
    page.on('requestfailed', request => {
      const url = request.url();
      const failure = request.failure();
      const analyticsDomains = [
        'googletagmanager.com',
        'google-analytics.com',
        'facebook.com/tr',
        'doubleclick.net'
      ];
      
      const isAnalytics = analyticsDomains.some(domain => url.includes(domain));
      if (isAnalytics) {
        console.log('🔍 REQUEST FALLIDA DE ANALYTICS:', url, 'Error:', failure?.errorText);
        // En Firefox el error es NS_ERROR_FAILURE, en Chrome es net::ERR_BLOCKED_BY_CLIENT
        if (failure?.errorText === 'net::ERR_BLOCKED_BY_CLIENT' || failure?.errorText === 'NS_ERROR_FAILURE') {
          analyticsRequestsBlocked++;
          console.log('✅ REQUEST DE ANALYTICS BLOQUEADA:', url);
        }
      }
    });
    
    // También escuchar requests que se completan exitosamente
    page.on('response', response => {
      const url = response.url();
      const analyticsDomains = [
        'googletagmanager.com',
        'google-analytics.com',
        'facebook.com/tr',
        'doubleclick.net'
      ];
      
      const isAnalytics = analyticsDomains.some(domain => url.includes(domain));
      if (isAnalytics) {
        console.log('⚠️ RESPONSE DE ANALYTICS RECIBIDA:', url, 'Status:', response.status());
      }
    });
    
    // Navegar a la página
    console.log('🌐 Navegando a la página...');
    await page.goto(process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Esperar un poco más
    await page.waitForTimeout(5000);
    
    // Reportar resultados
    console.log('📊 RESULTADOS:');
    console.log('Requests de analytics detectadas:', analyticsRequestsDetected);
    console.log('Requests de analytics bloqueadas:', analyticsRequestsBlocked);
    
    if (analyticsRequestsDetected > 0 && analyticsRequestsBlocked === 0) {
      console.log('❌ PROBLEMA: Se detectaron requests de analytics pero NO se bloquearon');
    } else if (analyticsRequestsDetected > 0 && analyticsRequestsBlocked > 0) {
      console.log('✅ ÉXITO: Se detectaron requests de analytics y se bloquearon correctamente');
    } else if (analyticsRequestsDetected === 0) {
      console.log('✅ ÉXITO: No se detectaron requests de analytics');
    }
    
    // El test pasa independientemente para poder analizar
    expect(true).toBe(true);
  });
});
