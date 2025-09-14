// Script más agresivo para bloquear analytics completamente
// Este script se ejecuta antes de que se cargue cualquier contenido de la página

(function() {
  'use strict';
  
  // Marcar como ambiente de testing
  window.__E2E_ANALYTICS_DISABLED__ = true;
  window.__PLAYWRIGHT_TEST__ = true;
  window.__AUTOMATED_TESTING__ = true;
  
  // Bloquear todas las funciones de analytics antes de que se definan
  const blockFunction = function() {
    // No hacer nada - función bloqueada
  };
  
  // Bloquear Google Analytics (todas las versiones)
  window.gtag = blockFunction;
  window.ga = blockFunction;
  window.gaq = blockFunction;
  window._gaq = blockFunction;
  window.GoogleAnalyticsObject = 'ga';
  
  // Bloquear Facebook Pixel
  window.fbq = blockFunction;
  window._fbq = blockFunction;
  
  // Bloquear otros trackers comunes
  window.mixpanel = blockFunction;
  window.amplitude = blockFunction;
  window.segment = blockFunction;
  window._segment = blockFunction;
  window.heap = blockFunction;
  window._heap = blockFunction;
  window.hotjar = blockFunction;
  window._hj = blockFunction;
  
  // Bloquear Firebase Analytics
  window.firebase = window.firebase || {};
  window.firebase.analytics = window.firebase.analytics || {};
  window.firebase.analytics.logEvent = blockFunction;
  window.firebase.analytics.setUserId = blockFunction;
  window.firebase.analytics.setUserProperties = blockFunction;
  
  // Bloquear métodos de envío de datos
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    // Bloquear requests a dominios de analytics
    if (typeof url === 'string' && (
      url.includes('google-analytics.com') ||
      url.includes('googletagmanager.com') ||
      url.includes('facebook.com/tr') ||
      url.includes('doubleclick.net') ||
      url.includes('googleadservices.com') ||
      url.includes('googlesyndication.com') ||
      url.includes('firebase') ||
      url.includes('analytics')
    )) {
      console.log('🚫 Blocked analytics request:', url);
      return Promise.resolve(new Response('{}', { status: 200 }));
    }
    return originalFetch.apply(this, arguments);
  };
  
  // Bloquear XMLHttpRequest a dominios de analytics
  const originalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    xhr.open = function(method, url) {
      if (typeof url === 'string' && (
        url.includes('google-analytics.com') ||
        url.includes('googletagmanager.com') ||
        url.includes('facebook.com/tr') ||
        url.includes('doubleclick.net') ||
        url.includes('googleadservices.com') ||
        url.includes('googlesyndication.com') ||
        url.includes('firebase') ||
        url.includes('analytics')
      )) {
        console.log('🚫 Blocked analytics XHR:', url);
        // Simular respuesta exitosa
        setTimeout(() => {
          Object.defineProperty(xhr, 'readyState', { value: 4 });
          Object.defineProperty(xhr, 'status', { value: 200 });
          if (xhr.onreadystatechange) xhr.onreadystatechange();
        }, 0);
        return;
      }
      return originalOpen.apply(this, arguments);
    };
    return xhr;
  };
  
  // Interceptar y bloquear scripts de analytics
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(this, tagName);
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'src' && typeof value === 'string' && (
          value.includes('google-analytics.com') ||
          value.includes('googletagmanager.com') ||
          value.includes('facebook.net') ||
          value.includes('doubleclick.net') ||
          value.includes('googleadservices.com') ||
          value.includes('googlesyndication.com') ||
          value.includes('firebase') ||
          value.includes('analytics')
        )) {
          console.log('🚫 Blocked analytics script:', value);
          return;
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    return element;
  };
  
  console.log('🚫 Comprehensive analytics blocking enabled for automated testing');
})();
