// Script para verificar que analytics está bloqueado
// Se ejecuta después de cargar la página para confirmar que no hay tracking

/**
 * Verifica que analytics esté completamente bloqueado
 */
async function verifyAnalyticsBlocked(page) {
  console.log('🔍 Verificando que analytics esté bloqueado...');
  
  // Verificar que las variables de bloqueo estén definidas
  const isBlocked = await page.evaluate(() => {
    return {
      e2eDisabled: window.__E2E_ANALYTICS_DISABLED__ === true,
      playwrightTest: window.__PLAYWRIGHT_TEST__ === true,
      automatedTesting: window.__AUTOMATED_TESTING__ === true,
      gtagBlocked: typeof window.gtag === 'function' && window.gtag.toString().includes('blocked'),
      gaBlocked: typeof window.ga === 'function' && window.ga.toString().includes('blocked'),
      fbqBlocked: typeof window.fbq === 'function' && window.fbq.toString().includes('blocked'),
      firebaseBlocked: window.firebase && 
        window.firebase.analytics && 
        window.firebase.analytics.logEvent.toString().includes('blocked')
    };
  });
  
  console.log('📊 Estado del bloqueo de analytics:', isBlocked);
  
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
        src.includes('googleadservices.com') ||
        src.includes('googlesyndication.com') ||
        src.includes('firebase') ||
        src.includes('analytics')
      );
  });
  
  if (analyticsScripts.length > 0) {
    console.warn('⚠️ Scripts de analytics detectados:', analyticsScripts);
  } else {
    console.log('✅ No se detectaron scripts de analytics');
  }
  
  // Verificar que no hay requests de analytics en la consola
  const networkRequests = await page.evaluate(() => {
    // Esta función se ejecuta en el contexto de la página
    // Verificar si hay requests de analytics pendientes
    return {
      hasAnalyticsRequests: window.performance && 
        window.performance.getEntriesByType('resource') &&
        window.performance.getEntriesByType('resource').some(entry => 
          entry.name.includes('google-analytics.com') ||
          entry.name.includes('googletagmanager.com') ||
          entry.name.includes('facebook.com/tr') ||
          entry.name.includes('doubleclick.net') ||
          entry.name.includes('firebase')
        )
    };
  });
  
  if (networkRequests.hasAnalyticsRequests) {
    console.warn('⚠️ Requests de analytics detectados en network');
  } else {
    console.log('✅ No se detectaron requests de analytics en network');
  }
  
  return {
    isBlocked,
    analyticsScripts,
    networkRequests
  };
}

/**
 * Intercepta requests de analytics para bloquearlos
 */
async function blockAnalyticsRequests(page) {
  // Interceptar requests de analytics
  await page.route('**/*', async (route) => {
    const url = route.request().url();
    
    // Bloquear dominios de analytics
    if (
      url.includes('google-analytics.com') ||
      url.includes('googletagmanager.com') ||
      url.includes('facebook.com/tr') ||
      url.includes('doubleclick.net') ||
      url.includes('googleadservices.com') ||
      url.includes('googlesyndication.com') ||
      url.includes('firebase') ||
      url.includes('analytics')
    ) {
      console.log('🚫 Blocked analytics request:', url);
      await route.abort('blockedbyclient');
      return;
    }
    
    // Permitir otros requests
    await route.continue();
  });
  
  console.log('🚫 Analytics request blocking enabled');
}

module.exports = {
  verifyAnalyticsBlocked,
  blockAnalyticsRequests
};
