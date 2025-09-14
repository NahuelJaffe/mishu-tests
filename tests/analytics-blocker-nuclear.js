// BLOQUEADOR NUCLEAR DE ANALYTICS - IMPOSIBLE DE EVADIR
// Este script se ejecuta ANTES que cualquier contenido de la página

(function() {
  'use strict';
  
  console.log('🚫 NUCLEAR ANALYTICS BLOCKER ACTIVATED');
  
  // ===== 1. MARCAR AMBIENTE DE TESTING =====
  window.__E2E_ANALYTICS_DISABLED__ = true;
  window.__PLAYWRIGHT_TEST__ = true;
  window.__AUTOMATED_TESTING__ = true;
  window.__NUCLEAR_ANALYTICS_BLOCKER__ = true;
  
  // ===== 2. BLOQUEAR TODAS LAS FUNCIONES GLOBALES =====
  const noop = function() { return false; };
  const noopPromise = function() { return Promise.resolve(); };
  
  // Google Analytics - TODAS las versiones
  window.gtag = noop;
  window.ga = noop;
  window.gaq = noop;
  window._gaq = noop;
  window.GoogleAnalyticsObject = 'ga';
  window.dataLayer = [];
  window.dataLayer.push = noop;
  
  // Facebook Pixel
  window.fbq = noop;
  window._fbq = noop;
  
  // Otros trackers
  window.mixpanel = noop;
  window.amplitude = noop;
  window.segment = noop;
  window._segment = noop;
  window.heap = noop;
  window._heap = noop;
  window.hotjar = noop;
  window._hj = noop;
  window.clarity = noop;
  window._clarity = noop;
  
  // Firebase Analytics - BLOQUEO COMPLETO
  window.firebase = window.firebase || {};
  window.firebase.analytics = window.firebase.analytics || {};
  window.firebase.analytics.logEvent = noop;
  window.firebase.analytics.setUserId = noop;
  window.firebase.analytics.setUserProperties = noop;
  window.firebase.analytics.setCurrentScreen = noop;
  window.firebase.analytics.setAnalyticsCollectionEnabled = noop;
  
  // ===== 3. BLOQUEAR FETCH COMPLETAMENTE =====
  const originalFetch = window.fetch;
  window.fetch = function(url, options) {
    const urlStr = typeof url === 'string' ? url : url.toString();
    
    // BLOQUEAR TODOS LOS DOMINIOS DE ANALYTICS
    const blockedDomains = [
      'google-analytics.com',
      'googletagmanager.com', 
      'facebook.com/tr',
      'facebook.net',
      'doubleclick.net',
      'googleadservices.com',
      'googlesyndication.com',
      'firebase',
      'analytics',
      'mixpanel.com',
      'amplitude.com',
      'segment.io',
      'heap.com',
      'hotjar.com',
      'clarity.ms',
      'linkedin.com/li.lms',
      'twitter.com/i/adsct',
      'tiktok.com/i18n/pixel',
      'snapchat.com',
      'pinterest.com',
      'reddit.com/api/v2'
    ];
    
    if (blockedDomains.some(domain => urlStr.includes(domain))) {
      console.log('🚫 NUCLEAR BLOCKED FETCH:', urlStr);
      return Promise.resolve(new Response('{}', { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' }
      }));
    }
    
    return originalFetch.apply(this, arguments);
  };
  
  // ===== 4. BLOQUEAR XMLHttpRequest COMPLETAMENTE =====
  const originalXHR = window.XMLHttpRequest;
  window.XMLHttpRequest = function() {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;
    const originalSend = xhr.send;
    
    xhr.open = function(method, url) {
      const urlStr = typeof url === 'string' ? url : url.toString();
      
      const blockedDomains = [
        'google-analytics.com',
        'googletagmanager.com',
        'facebook.com/tr',
        'facebook.net',
        'doubleclick.net',
        'googleadservices.com',
        'googlesyndication.com',
        'firebase',
        'analytics'
      ];
      
      if (blockedDomains.some(domain => urlStr.includes(domain))) {
        console.log('🚫 NUCLEAR BLOCKED XHR:', urlStr);
        // Simular respuesta exitosa inmediatamente
        setTimeout(() => {
          Object.defineProperty(xhr, 'readyState', { value: 4, writable: false });
          Object.defineProperty(xhr, 'status', { value: 200, writable: false });
          Object.defineProperty(xhr, 'responseText', { value: '{}', writable: false });
          if (xhr.onreadystatechange) xhr.onreadystatechange();
        }, 0);
        return;
      }
      
      return originalOpen.apply(this, arguments);
    };
    
    xhr.send = function(data) {
      // Si ya fue bloqueado en open, no hacer nada
      if (xhr.readyState === 4) return;
      return originalSend.apply(this, arguments);
    };
    
    return xhr;
  };
  
  // ===== 5. BLOQUEAR sendBeacon =====
  const originalSendBeacon = Navigator.prototype.sendBeacon;
  Navigator.prototype.sendBeacon = function(url, data) {
    const urlStr = typeof url === 'string' ? url : url.toString();
    
    const blockedDomains = [
      'google-analytics.com',
      'googletagmanager.com',
      'facebook.com/tr',
      'analytics'
    ];
    
    if (blockedDomains.some(domain => urlStr.includes(domain))) {
      console.log('🚫 NUCLEAR BLOCKED BEACON:', urlStr);
      return true; // Simular éxito
    }
    
    return originalSendBeacon.apply(this, arguments);
  };
  
  // ===== 6. BLOQUEAR CREACIÓN DE SCRIPTS =====
  const originalCreateElement = document.createElement;
  document.createElement = function(tagName) {
    const element = originalCreateElement.call(this, tagName);
    
    if (tagName.toLowerCase() === 'script') {
      const originalSetAttribute = element.setAttribute;
      element.setAttribute = function(name, value) {
        if (name === 'src' && typeof value === 'string') {
          const blockedDomains = [
            'google-analytics.com',
            'googletagmanager.com',
            'facebook.net',
            'doubleclick.net',
            'googleadservices.com',
            'googlesyndication.com',
            'firebase',
            'analytics'
          ];
          
          if (blockedDomains.some(domain => value.includes(domain))) {
            console.log('🚫 NUCLEAR BLOCKED SCRIPT:', value);
            return; // No establecer el src
          }
        }
        return originalSetAttribute.call(this, name, value);
      };
    }
    
    return element;
  };
  
  // ===== 7. BLOQUEAR STORAGE COMPLETAMENTE =====
  const originalSetItem = Storage.prototype.setItem;
  Storage.prototype.setItem = function(key, value) {
    const analyticsKeys = [
      'ga', 'gtm', 'gtag', 'firebase', 'analytics', 
      'mixpanel', 'amplitude', 'segment', 'heap', 
      'hotjar', 'clarity', 'fb', 'facebook'
    ];
    
    if (analyticsKeys.some(analyticsKey => key.toLowerCase().includes(analyticsKey))) {
      console.log('🚫 NUCLEAR BLOCKED STORAGE:', key);
      return; // No guardar
    }
    
    return originalSetItem.call(this, key, value);
  };
  
  // ===== 8. BLOQUEAR IMÁGENES DE TRACKING =====
  const originalImage = window.Image;
  window.Image = function() {
    const img = new originalImage();
    
    Object.defineProperty(img, 'src', {
      set: function(value) {
        if (value && (
          value.includes('google-analytics.com') ||
          value.includes('facebook.com/tr') ||
          value.includes('analytics') ||
          value.includes('doubleclick.net')
        )) {
          console.log('🚫 NUCLEAR BLOCKED IMAGE:', value);
          return; // No establecer el src
        }
        img.setAttribute('src', value);
      },
      get: function() {
        return img.getAttribute('src');
      }
    });
    
    return img;
  };
  
  // ===== 9. BLOQUEAR CONSOLE LOGS DE ANALYTICS =====
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;
  const originalConsoleError = console.error;
  
  console.log = function(...args) {
    const message = args.join(' ').toLowerCase();
    if (message.includes('analytics') || message.includes('firebase') || 
        message.includes('gtag') || message.includes('ga(')) {
      return; // No mostrar logs de analytics
    }
    originalConsoleLog.apply(this, arguments);
  };
  
  console.warn = function(...args) {
    const message = args.join(' ').toLowerCase();
    if (message.includes('analytics') || message.includes('firebase')) {
      return;
    }
    originalConsoleWarn.apply(this, arguments);
  };
  
  console.error = function(...args) {
    const message = args.join(' ').toLowerCase();
    if (message.includes('analytics') || message.includes('firebase')) {
      return;
    }
    originalConsoleError.apply(this, arguments);
  };
  
  // ===== 10. BLOQUEAR WEB VITALS Y PERFORMANCE =====
  if (window.performance && window.performance.mark) {
    const originalMark = window.performance.mark;
    window.performance.mark = function(name) {
      if (typeof name === 'string' && (
        name.includes('analytics') || name.includes('gtag') || name.includes('firebase')
      )) {
        console.log('🚫 NUCLEAR BLOCKED PERFORMANCE MARK:', name);
        return;
      }
      return originalMark.apply(this, arguments);
    };
  }
  
  // ===== 11. BLOQUEAR MUTATION OBSERVER =====
  if (window.MutationObserver) {
    const originalMO = window.MutationObserver;
    window.MutationObserver = function(callback) {
      const wrappedCallback = function(mutations) {
        // Filtrar mutaciones relacionadas con analytics
        const filteredMutations = mutations.filter(mutation => {
          const target = mutation.target;
          if (target.tagName === 'SCRIPT' && target.src) {
            const blockedDomains = [
              'google-analytics.com',
              'googletagmanager.com',
              'facebook.net',
              'analytics'
            ];
            return !blockedDomains.some(domain => target.src.includes(domain));
          }
          return true;
        });
        
        if (filteredMutations.length > 0) {
          callback(filteredMutations);
        }
      };
      
      return new originalMO(wrappedCallback);
    };
  }
  
  // ===== 12. BLOQUEAR INTERSECTION OBSERVER =====
  if (window.IntersectionObserver) {
    const originalIO = window.IntersectionObserver;
    window.IntersectionObserver = function(callback, options) {
      const wrappedCallback = function(entries) {
        // Filtrar entradas relacionadas con analytics
        const filteredEntries = entries.filter(entry => {
          const target = entry.target;
          return !target.src || !target.src.includes('analytics');
        });
        
        if (filteredEntries.length > 0) {
          callback(filteredEntries);
        }
      };
      
      return new originalIO(wrappedCallback, options);
    };
  }
  
  // ===== 13. BLOQUEAR REQUESTIDLE回调 =====
  if (window.requestIdleCallback) {
    const originalRIC = window.requestIdleCallback;
    window.requestIdleCallback = function(callback, options) {
      const wrappedCallback = function(deadline) {
        // Solo ejecutar si no es relacionado con analytics
        try {
          callback(deadline);
        } catch (e) {
          if (!e.message.includes('analytics')) {
            throw e;
          }
        }
      };
      
      return originalRIC(wrappedCallback, options);
    };
  }
  
  // ===== 14. BLOQUEAR TIMERS =====
  const originalSetTimeout = window.setTimeout;
  const originalSetInterval = window.setInterval;
  
  window.setTimeout = function(callback, delay) {
    if (typeof callback === 'string' && callback.includes('analytics')) {
      console.log('🚫 NUCLEAR BLOCKED TIMEOUT SCRIPT');
      return 0;
    }
    return originalSetTimeout.apply(this, arguments);
  };
  
  window.setInterval = function(callback, delay) {
    if (typeof callback === 'string' && callback.includes('analytics')) {
      console.log('🚫 NUCLEAR BLOCKED INTERVAL SCRIPT');
      return 0;
    }
    return originalSetInterval.apply(this, arguments);
  };
  
  // ===== 15. BLOQUEAR POSTMESSAGE =====
  const originalPostMessage = window.postMessage;
  window.postMessage = function(message, targetOrigin) {
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    
    if (messageStr.includes('analytics') || messageStr.includes('gtag') || 
        messageStr.includes('firebase')) {
      console.log('🚫 NUCLEAR BLOCKED POSTMESSAGE');
      return;
    }
    
    return originalPostMessage.apply(this, arguments);
  };
  
  // ===== 16. BLOQUEAR WEBSOCKET =====
  if (window.WebSocket) {
    const originalWebSocket = window.WebSocket;
    window.WebSocket = function(url, protocols) {
      const urlStr = typeof url === 'string' ? url : url.toString();
      
      if (urlStr.includes('analytics') || urlStr.includes('firebase')) {
        console.log('🚫 NUCLEAR BLOCKED WEBSOCKET:', urlStr);
        // Crear un WebSocket falso
        const fakeWS = {
          readyState: 1,
          send: function() { return true; },
          close: function() { return true; },
          addEventListener: function() { return true; },
          removeEventListener: function() { return true; }
        };
        return fakeWS;
      }
      
      return new originalWebSocket(url, protocols);
    };
  }
  
  // ===== 17. BLOQUEAR EVENT LISTENERS =====
  const originalAddEventListener = EventTarget.prototype.addEventListener;
  EventTarget.prototype.addEventListener = function(type, listener, options) {
    if (typeof listener === 'function') {
      const listenerStr = listener.toString();
      if (listenerStr.includes('analytics') || listenerStr.includes('gtag') || 
          listenerStr.includes('firebase')) {
        console.log('🚫 NUCLEAR BLOCKED EVENT LISTENER');
        return;
      }
    }
    
    return originalAddEventListener.apply(this, arguments);
  };
  
  // ===== 18. BLOQUEAR DATALAYER MANIPULATIONS =====
  Object.defineProperty(window, 'dataLayer', {
    get: function() {
      return [];
    },
    set: function(value) {
      console.log('🚫 NUCLEAR BLOCKED DATALAYER SET');
      return [];
    },
    configurable: false,
    writable: false
  });
  
  // ===== 19. BLOQUEAR GTM =====
  window.google_tag_manager = noop;
  window.google_tag_services = noop;
  
  // ===== 20. BLOQUEAR FIREBASE CONFIG =====
  window.firebaseConfig = {};
  window.firebaseOptions = {};
  
  console.log('🚫 NUCLEAR ANALYTICS BLOCKER FULLY ACTIVATED - IMPOSSIBLE TO EVADE');
})();
