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
    const analyticsDomains = [
      'google-analytics.com',
      'googletagmanager.com',
      'facebook.net',
      'connect.facebook.net',
      'doubleclick.net',
      'googleadservices.com',
      'googlesyndication.com',
      'firebaseapp.com',
      'firebaseio.com',
      'firebase.googleapis.com',
      'mixpanel.com',
      'amplitude.com',
      'segment.io',
      'heap.com',
      'hotjar.com',
      'clarity.ms',
      'linkedin.com/li.lms',
      'twitter.com/i/adsct',
      'analytics.tiktok.com',
      'tr.snapchat.com',
      'ads.pinterest.com',
      'events.redditmedia.com',
      'quantserve.com',
      'scorecardresearch.com',
      'adsystem.amazon.com',
      'amazon-adsystem.com'
    ];
    
    return scripts
      .map(script => script.src)
      .filter(src => analyticsDomains.some(domain => src.includes(domain)));
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
    const analyticsDomains = [
      'google-analytics.com',
      'googletagmanager.com',
      'facebook.com/tr',
      'connect.facebook.net',
      'doubleclick.net',
      'googleadservices.com',
      'googlesyndication.com',
      'firebaseapp.com',
      'firebaseio.com',
      'firebase.googleapis.com',
      'mixpanel.com',
      'amplitude.com',
      'segment.io',
      'heap.com',
      'hotjar.com',
      'clarity.ms',
      'linkedin.com/li.lms',
      'twitter.com/i/adsct',
      'analytics.tiktok.com',
      'tr.snapchat.com',
      'ads.pinterest.com',
      'events.redditmedia.com',
      'quantserve.com',
      'scorecardresearch.com',
      'adsystem.amazon.com',
      'amazon-adsystem.com'
    ];
    
    return {
      hasAnalyticsRequests: window.performance && 
        window.performance.getEntriesByType('resource') &&
        window.performance.getEntriesByType('resource').some(entry => 
          analyticsDomains.some(domain => entry.name.includes(domain))
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
    
    // Lista de dominios de analytics específicos
    const analyticsDomains = [
      'google-analytics.com',
      'googletagmanager.com',
      'facebook.com/tr',
      'connect.facebook.net',
      'doubleclick.net',
      'googleadservices.com',
      'googlesyndication.com',
      'firebaseapp.com',
      'firebaseio.com',
      'firebase.googleapis.com',
      'mixpanel.com',
      'amplitude.com',
      'segment.io',
      'heap.com',
      'hotjar.com',
      'clarity.ms',
      'linkedin.com/li.lms',
      'twitter.com/i/adsct',
      'analytics.tiktok.com',
      'tr.snapchat.com',
      'ads.pinterest.com',
      'events.redditmedia.com',
      'quantserve.com',
      'scorecardresearch.com',
      'adsystem.amazon.com',
      'amazon-adsystem.com'
    ];
    
    // Bloquear dominios de analytics
    if (analyticsDomains.some(domain => url.includes(domain))) {
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
