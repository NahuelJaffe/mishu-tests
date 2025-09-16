// Test de análisis profundo de analytics blocking
// Este test está diseñado para identificar exactamente por qué siguen apareciendo usuarios

const { test, expect } = require('@playwright/test');

test.describe('Análisis Profundo de Analytics Blocking', () => {
  
  test('Análisis completo de bloqueo de analytics', async ({ page, context, browser }) => {
    console.log('🔍 INICIANDO ANÁLISIS PROFUNDO DE ANALYTICS BLOCKING');
    
    // 1. Verificar configuración del contexto
    console.log('📋 Verificando configuración del contexto...');
    const contextOptions = await page.context()._options;
    console.log('Context options:', JSON.stringify(contextOptions, null, 2));
    
    // 2. Verificar headers HTTP
    console.log('📋 Verificando headers HTTP...');
    const headers = await page.evaluate(() => {
      return {
        userAgent: navigator.userAgent,
        referrer: document.referrer,
        location: window.location.href
      };
    });
    console.log('Headers y navegación:', headers);
    
    // 3. Verificar variables globales de bloqueo
    console.log('📋 Verificando variables globales de bloqueo...');
    const globalVars = await page.evaluate(() => {
      return {
        __E2E_ANALYTICS_DISABLED__: window.__E2E_ANALYTICS_DISABLED__,
        __PLAYWRIGHT_TEST__: window.__PLAYWRIGHT_TEST__,
        __AUTOMATED_TESTING__: window.__AUTOMATED_TESTING__,
        __NUCLEAR_ANALYTICS_BLOCKER__: window.__NUCLEAR_ANALYTICS_BLOCKER__,
        gtag: typeof window.gtag,
        ga: typeof window.ga,
        fbq: typeof window.fbq,
        dataLayer: Array.isArray(window.dataLayer) ? window.dataLayer.length : 'not array',
        firebase: typeof window.firebase,
        google_tag_manager: typeof window.google_tag_manager
      };
    });
    console.log('Variables globales:', globalVars);
    
    // 4. Verificar funciones bloqueadas
    console.log('📋 Verificando funciones bloqueadas...');
    const blockedFunctions = await page.evaluate(() => {
      const testFunctions = {
        gtag: window.gtag.toString(),
        ga: window.ga.toString(),
        fbq: window.fbq.toString(),
        fetch: window.fetch.toString().substring(0, 100),
        XMLHttpRequest: window.XMLHttpRequest.toString().substring(0, 100)
      };
      return testFunctions;
    });
    console.log('Funciones bloqueadas:', blockedFunctions);
    
    // 5. Navegar a la página principal y monitorear requests
    console.log('📋 Navegando a página principal...');
    
    const requests = [];
    const responses = [];
    
    // Interceptar todas las requests
    page.on('request', request => {
      const url = request.url();
      if (url.includes('analytics') || url.includes('firebase') || url.includes('gtag') || 
          url.includes('facebook') || url.includes('google-analytics') || url.includes('googletagmanager')) {
        requests.push({
          url: url,
          method: request.method(),
          headers: request.headers(),
          timestamp: new Date().toISOString()
        });
        console.log('🚨 REQUEST DETECTADA:', url);
      }
    });
    
    page.on('response', response => {
      const url = response.url();
      if (url.includes('analytics') || url.includes('firebase') || url.includes('gtag') || 
          url.includes('facebook') || url.includes('google-analytics') || url.includes('googletagmanager')) {
        responses.push({
          url: url,
          status: response.status(),
          headers: response.headers(),
          timestamp: new Date().toISOString()
        });
        console.log('🚨 RESPONSE DETECTADA:', url, 'Status:', response.status());
      }
    });
    
    // Navegar a la página
    await page.goto(process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Esperar un poco más para capturar requests tardías
    await page.waitForTimeout(5000);
    
    // 6. Verificar scripts cargados
    console.log('📋 Verificando scripts cargados...');
    const loadedScripts = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script'));
      return scripts.map(script => ({
        src: script.src,
        content: script.textContent.substring(0, 200),
        hasAnalytics: script.src.includes('analytics') || script.src.includes('firebase') || 
                     script.src.includes('gtag') || script.src.includes('googletagmanager') ||
                     script.textContent.includes('analytics') || script.textContent.includes('firebase')
      })).filter(script => script.hasAnalytics || script.src);
    });
    console.log('Scripts cargados:', loadedScripts);
    
    // 7. Verificar elementos de tracking
    console.log('📋 Verificando elementos de tracking...');
    const trackingElements = await page.evaluate(() => {
      const elements = [];
      
      // Buscar imágenes de tracking
      const images = Array.from(document.querySelectorAll('img'));
      images.forEach(img => {
        if (img.src.includes('analytics') || img.src.includes('facebook') || img.src.includes('doubleclick')) {
          elements.push({ type: 'image', src: img.src });
        }
      });
      
      // Buscar iframes de tracking
      const iframes = Array.from(document.querySelectorAll('iframe'));
      iframes.forEach(iframe => {
        if (iframe.src.includes('analytics') || iframe.src.includes('facebook') || iframe.src.includes('doubleclick')) {
          elements.push({ type: 'iframe', src: iframe.src });
        }
      });
      
      return elements;
    });
    console.log('Elementos de tracking:', trackingElements);
    
    // 8. Verificar localStorage y sessionStorage
    console.log('📋 Verificando storage...');
    const storage = await page.evaluate(() => {
      const analyticsKeys = [];
      
      // localStorage
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.includes('analytics') || key.includes('firebase') || key.includes('gtag') || 
            key.includes('ga') || key.includes('fb') || key.includes('facebook')) {
          analyticsKeys.push({ storage: 'localStorage', key: key, value: localStorage.getItem(key) });
        }
      }
      
      // sessionStorage
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key.includes('analytics') || key.includes('firebase') || key.includes('gtag') || 
            key.includes('ga') || key.includes('fb') || key.includes('facebook')) {
          analyticsKeys.push({ storage: 'sessionStorage', key: key, value: sessionStorage.getItem(key) });
        }
      }
      
      return analyticsKeys;
    });
    console.log('Storage analytics:', storage);
    
    // 9. Verificar cookies
    console.log('📋 Verificando cookies...');
    const cookies = await context.cookies();
    const analyticsCookies = cookies.filter(cookie => 
      cookie.name.includes('analytics') || cookie.name.includes('firebase') || 
      cookie.name.includes('gtag') || cookie.name.includes('ga') || 
      cookie.name.includes('fb') || cookie.name.includes('facebook') ||
      cookie.domain.includes('analytics') || cookie.domain.includes('firebase') ||
      cookie.domain.includes('google') || cookie.domain.includes('facebook')
    );
    console.log('Cookies analytics:', analyticsCookies);
    
    // 10. Resumen del análisis
    console.log('📋 RESUMEN DEL ANÁLISIS:');
    console.log('=====================================');
    console.log('Requests bloqueadas:', requests.length);
    console.log('Responses detectadas:', responses.length);
    console.log('Scripts con analytics:', loadedScripts.length);
    console.log('Elementos de tracking:', trackingElements.length);
    console.log('Storage analytics:', storage.length);
    console.log('Cookies analytics:', analyticsCookies.length);
    
    // 11. Generar reporte detallado
    const report = {
      timestamp: new Date().toISOString(),
      globalVars,
      blockedFunctions,
      requests,
      responses,
      loadedScripts,
      trackingElements,
      storage,
      analyticsCookies,
      summary: {
        requestsBlocked: requests.length,
        responsesDetected: responses.length,
        scriptsWithAnalytics: loadedScripts.length,
        trackingElements: trackingElements.length,
        analyticsStorage: storage.length,
        analyticsCookies: analyticsCookies.length
      }
    };
    
    console.log('📋 REPORTE COMPLETO:', JSON.stringify(report, null, 2));
    
    // 12. Verificaciones de seguridad
    expect(globalVars.__E2E_ANALYTICS_DISABLED__).toBe(true);
    expect(globalVars.__NUCLEAR_ANALYTICS_BLOCKER__).toBe(true);
    expect(globalVars.gtag).toBe('function');
    expect(globalVars.ga).toBe('function');
    expect(globalVars.fbq).toBe('function');
    
    // Si hay requests o responses, algo está fallando
    if (requests.length > 0 || responses.length > 0) {
      console.log('❌ FALLO: Se detectaron requests/responses de analytics');
      console.log('Requests:', requests);
      console.log('Responses:', responses);
    }
    
    // Si hay scripts con analytics, algo está fallando
    if (loadedScripts.length > 0) {
      console.log('❌ FALLO: Se detectaron scripts con analytics');
      console.log('Scripts:', loadedScripts);
    }
    
    // Si hay elementos de tracking, algo está fallando
    if (trackingElements.length > 0) {
      console.log('❌ FALLO: Se detectaron elementos de tracking');
      console.log('Elementos:', trackingElements);
    }
    
    console.log('✅ ANÁLISIS COMPLETADO');
  });
  
  test('Test de bloqueo de Firebase específico', async ({ page }) => {
    console.log('🔍 TESTING FIREBASE BLOCKING ESPECÍFICO');
    
    // Navegar a la página
    await page.goto(process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Verificar Firebase específicamente
    const firebaseStatus = await page.evaluate(() => {
      return {
        firebaseExists: typeof window.firebase !== 'undefined',
        firebaseAnalytics: typeof window.firebase?.analytics !== 'undefined',
        firebaseConfig: window.firebaseConfig,
        firebaseOptions: window.firebaseOptions,
        firebaseLogEvent: typeof window.firebase?.analytics?.logEvent,
        firebaseSetUserId: typeof window.firebase?.analytics?.setUserId,
        firebaseSetUserProperties: typeof window.firebase?.analytics?.setUserProperties
      };
    });
    
    console.log('Firebase status:', firebaseStatus);
    
    // Intentar ejecutar Firebase analytics
    const firebaseTest = await page.evaluate(() => {
      try {
        if (window.firebase && window.firebase.analytics) {
          window.firebase.analytics.logEvent('test_event', { test: 'value' });
          return 'Firebase analytics executed';
        }
        return 'Firebase analytics not available';
      } catch (error) {
        return 'Firebase analytics blocked: ' + error.message;
      }
    });
    
    console.log('Firebase test result:', firebaseTest);
    
    // Verificar que Firebase está bloqueado
    expect(firebaseStatus.firebaseLogEvent).toBe('function');
    expect(firebaseTest).toContain('Firebase analytics blocked');
  });
});
