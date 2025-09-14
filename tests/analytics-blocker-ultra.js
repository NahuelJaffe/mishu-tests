// Script ULTRA AGRESIVO para bloquear analytics completamente
// Este script se ejecuta ANTES de que se cargue cualquier contenido de la página
// Bloquea TODOS los posibles métodos de tracking

(function() {
  'use strict';
  
  console.log('🚫 ULTRA ANALYTICS BLOCKER: Iniciando bloqueo completo...');
  
  // Marcar como ambiente de testing
  window.__E2E_ANALYTICS_DISABLED__ = true;
  window.__PLAYWRIGHT_TEST__ = true;
  window.__AUTOMATED_TESTING__ = true;
  window.__NO_ANALYTICS__ = true;
  window.__TESTING_MODE__ = true;
  
  // Función de bloqueo que no hace NADA
  const blockFunction = function() {
    console.log('🚫 Analytics call blocked');
    return false;
  };
  
  // Bloquear TODAS las funciones de analytics conocidas
  const analyticsFunctions = [
    'gtag', 'ga', 'gaq', '_gaq', 'GoogleAnalyticsObject',
    'fbq', '_fbq', 'fbevents',
    'mixpanel', 'amplitude', 'segment', '_segment',
    'heap', '_heap', 'hotjar', '_hj',
    'dataLayer', 'gtm', 'google_tag_manager',
    'pixel', 'track', 'identify', 'alias', 'group', 'page', 'screen',
    'analytics', 'tracking', 'metrics', 'telemetry'
  ];
  
  analyticsFunctions.forEach(func => {
    window[func] = blockFunction;
    window['_' + func] = blockFunction;
  });
  
  // Bloquear Firebase Analytics COMPLETAMENTE
  window.firebase = window.firebase || {};
  window.firebase.analytics = window.firebase.analytics || {};
  Object.keys(window.firebase.analytics).forEach(key => {
    if (typeof window.firebase.analytics[key] === 'function') {
      window.firebase.analytics[key] = blockFunction;
    }
  });
  
  // Bloquear dataLayer
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push = blockFunction;
  window.dataLayer.unshift = blockFunction;
  
  // Bloquear TODAS las solicitudes de red a dominios de analytics
  const analyticsDomains = [
    'google-analytics.com', 'googletagmanager.com', 'googleadservices.com',
    'googlesyndication.com', 'doubleclick.net', 'googleadservices.com',
    'facebook.com/tr', 'connect.facebook.net', 'facebook.net',
    'firebase', 'analytics', 'mixpanel.com', 'amplitude.com',
    'segment.com', 'heap.io', 'hotjar.com', 'fullstory.com',
    'logrocket.com', 'sentry.io', 'bugsnag.com', 'rollbar.com'
  ];
  
  // Interceptar fetch ANTES de que se defina
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    const urlString = typeof url === 'string' ? url : (url && url.toString ? url.toString() : '');
    
    if (analyticsDomains.some(domain => urlString.includes(domain))) {
      console.log('🚫 BLOCKED FETCH:', urlString);
      return Promise.resolve(new Response('{"blocked": true}', { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    
    return originalFetch.apply(this, arguments);
  };
  
  // Interceptar XMLHttpRequest ANTES de que se use
  const originalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    xhr.open = function(method, url) {
      const urlString = typeof url === 'string' ? url : (url && url.toString ? url.toString() : '');
      
      if (analyticsDomains.some(domain => urlString.includes(domain))) {
        console.log('🚫 BLOCKED XHR:', urlString);
        // Simular respuesta exitosa inmediatamente
        setTimeout(() => {
          Object.defineProperty(xhr, 'readyState', { value: 4, writable: false });
          Object.defineProperty(xhr, 'status', { value: 200, writable: false });
          Object.defineProperty(xhr, 'responseText', { value: '{"blocked": true}', writable: false });
          if (xhr.onreadystatechange) xhr.onreadystatechange();
          if (xhr.onload) xhr.onload();
        }, 0);
        return;
      }
      
      return originalOpen.apply(this, arguments);
    };
    
    xhr.send = function(data) {
      const url = xhr._url || '';
      if (analyticsDomains.some(domain => url.includes(domain))) {
        console.log('🚫 BLOCKED XHR SEND:', url);
        return;
      }
      return originalSend.apply(this, arguments);
    };
    
    return xhr;
  };
  
  // Interceptar creación de elementos script ANTES de que se carguen
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(this, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute;
      const originalSetSrc = Object.getOwnPropertyDescriptor(HTMLScriptElement.prototype, 'src')?.set;
      
      element.setAttribute = function(name, value) {
        if (name === 'src' && typeof value === 'string') {
          if (analyticsDomains.some(domain => value.includes(domain))) {
            console.log('🚫 BLOCKED SCRIPT:', value);
            return; // No establecer el src
          }
        }
        return originalSetAttribute.call(this, name, value);
      };
      
      if (originalSetSrc) {
        Object.defineProperty(element, 'src', {
          set: function(value) {
            if (typeof value === 'string' && analyticsDomains.some(domain => value.includes(domain))) {
              console.log('🚫 BLOCKED SCRIPT SRC:', value);
              return; // No establecer el src
            }
            return originalSetSrc.call(this, value);
          },
          get: function() {
            return this.getAttribute('src');
          }
        });
      }
    }
    
    return element;
  };
  
  // Bloquear navigator.sendBeacon (usado para analytics)
  const originalSendBeacon = navigator.sendBeacon;
  navigator.sendBeacon = function(url, data) {
    const urlString = typeof url === 'string' ? url : (url && url.toString ? url.toString() : '');
    
    if (analyticsDomains.some(domain => urlString.includes(domain))) {
      console.log('🚫 BLOCKED BEACON:', urlString);
      return true; // Simular envío exitoso
    }
    
    return originalSendBeacon.call(this, url, data);
  };
  
  // Bloquear Image requests (usados para tracking pixels)
  const originalImage = window.Image;
  window.Image = function() {
    const img = new originalImage();
    const originalSetSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src')?.set;
    
    if (originalSetSrc) {
      Object.defineProperty(img, 'src', {
        set: function(value) {
          if (typeof value === 'string' && analyticsDomains.some(domain => value.includes(domain))) {
            console.log('🚫 BLOCKED IMAGE PIXEL:', value);
            return; // No cargar la imagen
          }
          return originalSetSrc.call(this, value);
        },
        get: function() {
          return this.getAttribute('src');
        }
      });
    }
    
    return img;
  };
  
  // Bloquear todas las llamadas a console.log que puedan ser analytics
  const originalConsoleLog = console.log;
  console.log = function(...args) {
    const message = args.join(' ');
    if (analyticsDomains.some(domain => message.includes(domain))) {
      console.log('🚫 BLOCKED CONSOLE ANALYTICS:', message);
      return;
    }
    return originalConsoleLog.apply(this, arguments);
  };
  
  // Bloquear localStorage y sessionStorage para analytics
  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function(key, value) {
    if (typeof key === 'string' && (
      key.includes('analytics') || 
      key.includes('tracking') || 
      key.includes('gtag') || 
      key.includes('ga_') ||
      key.includes('fb_') ||
      key.includes('mixpanel') ||
      key.includes('amplitude')
    )) {
      console.log('🚫 BLOCKED LOCALSTORAGE:', key);
      return;
    }
    return originalSetItem.call(this, key, value);
  };
  
  const originalSessionSetItem = sessionStorage.setItem;
  sessionStorage.setItem = function(key, value) {
    if (typeof key === 'string' && (
      key.includes('analytics') || 
      key.includes('tracking') || 
      key.includes('gtag') || 
      key.includes('ga_') ||
      key.includes('fb_') ||
      key.includes('mixpanel') ||
      key.includes('amplitude')
    )) {
      console.log('🚫 BLOCKED SESSIONSTORAGE:', key);
      return;
    }
    return originalSessionSetItem.call(this, key, value);
  };
  
  console.log('🚫 ULTRA ANALYTICS BLOCKER: Bloqueo completo activado');
  console.log('🚫 Dominios bloqueados:', analyticsDomains.join(', '));
  console.log('🚫 Funciones bloqueadas:', analyticsFunctions.join(', '));
})();
