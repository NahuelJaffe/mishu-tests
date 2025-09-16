// Test específico para debuggear el problema de analytics
// Este test verifica si el bloqueo de analytics está funcionando

const { test, expect } = require('@playwright/test');

test.describe('🚫 Analytics Debug Test', () => {
  test('Verificar bloqueo de analytics en tiempo real', async ({ page }) => {
    console.log('🔍 Iniciando test de debug de analytics...');
    
    // 1. Configurar bloqueo de analytics
    const { setupAnalyticsForTest } = require('./analytics-setup.js');
    await setupAnalyticsForTest(page);
    
    // 2. Lista de requests bloqueados
    const blockedRequests = [];
    
    // 3. Interceptar todas las requests
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      
      // Lista de dominios de analytics a bloquear
      const analyticsDomains = [
        'google-analytics.com',
        'googletagmanager.com',
        'google.com/analytics',
        'firebase-analytics.com',
        'firebase.googleapis.com',
        'analytics.google.com',
        'www.google-analytics.com',
        'ssl.google-analytics.com',
        'www.googletagmanager.com',
        'facebook.com/tr',
        'connect.facebook.net',
        'doubleclick.net',
        'googlesyndication.com',
        'googleadservices.com',
        'amazon-adsystem.com',
        'adsystem.amazon.com',
        'bing.com/analytics',
        'hotjar.com',
        'mixpanel.com',
        'segment.com',
        'amplitude.com',
        'heap.io',
        'fullstory.com',
        'logrocket.com',
        'sentry.io',
        'datadoghq.com',
        'newrelic.com',
        'appdynamics.com',
        'dynatrace.com',
        'splunk.com',
        'elastic.co',
        'kibana',
        'grafana',
        'prometheus',
        'influxdata.com',
        'datadog.com',
        'newrelic.com',
        'appdynamics.com',
        'dynatrace.com',
        'splunk.com',
        'elastic.co',
        'kibana',
        'grafana',
        'prometheus',
        'influxdata.com'
      ];
      
      // Verificar si es una request de analytics
      const isAnalytics = analyticsDomains.some(domain => url.includes(domain));
      
      if (isAnalytics) {
        console.log(`🚫 BLOQUEANDO: ${url}`);
        blockedRequests.push(url);
        route.abort();
      } else {
        route.continue();
      }
    });
    
    // 4. Navegar a la página
    console.log('🌐 Navegando a la página...');
    await page.goto(`${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}`);
    
    // 5. Esperar un poco para que se carguen los scripts
    await page.waitForTimeout(3000);
    
    // 6. Verificar que se bloquearon requests de analytics
    console.log(`📊 Requests bloqueados: ${blockedRequests.length}`);
    console.log('🚫 URLs bloqueadas:', blockedRequests);
    
    // 7. Verificar que no hay scripts de analytics ejecutándose
    const analyticsScripts = await page.evaluate(() => {
      const scripts = Array.from(document.scripts);
      const analyticsScripts = scripts.filter(script => {
        const src = script.src || '';
        return src.includes('google-analytics') || 
               src.includes('googletagmanager') || 
               src.includes('firebase') ||
               src.includes('facebook') ||
               src.includes('analytics');
      });
      return analyticsScripts.map(script => script.src);
    });
    
    console.log(`📜 Scripts de analytics encontrados: ${analyticsScripts.length}`);
    console.log('📜 Scripts:', analyticsScripts);
    
    // 8. Verificar que las funciones de analytics están bloqueadas
    const analyticsFunctions = await page.evaluate(() => {
      return {
        gtag: typeof window.gtag,
        ga: typeof window.ga,
        fbq: typeof window.fbq,
        firebase: typeof window.firebase,
        dataLayer: typeof window.dataLayer,
        google_tag_manager: typeof window.google_tag_manager
      };
    });
    
    console.log('🔧 Funciones de analytics:', analyticsFunctions);
    
    // 9. Verificar que el bloqueo está activo
    const blockingStatus = await page.evaluate(() => {
      return {
        __E2E_ANALYTICS_DISABLED__: window.__E2E_ANALYTICS_DISABLED__,
        __PLAYWRIGHT_TEST__: window.__PLAYWRIGHT_TEST__,
        __AUTOMATED_TESTING__: window.__AUTOMATED_TESTING__
      };
    });
    
    console.log('🚫 Estado del bloqueo:', blockingStatus);
    
    // 10. Resultados del test
    expect(blockedRequests.length).toBeGreaterThan(0);
    expect(analyticsScripts.length).toBe(0);
    expect(blockingStatus.__E2E_ANALYTICS_DISABLED__).toBe(true);
    
    console.log('✅ Test de debug completado exitosamente');
  });
});

