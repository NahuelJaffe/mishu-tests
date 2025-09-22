// Test de captura de red para verificar que no se envían requests de analytics
// Este test captura todo el tráfico de red y verifica que no hay requests a proveedores de analytics

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Analytics Network Capture', () => {
  
  test('Capturar y verificar tráfico de red sin analytics', async ({ page, context }) => {
    console.log('🔍 Iniciando captura de tráfico de red...');
    
    // Limpiar archivo de violaciones previo
    const violationsLogPath = 'test-results/analytics-violations.log';
    if (fs.existsSync(violationsLogPath)) {
      fs.unlinkSync(violationsLogPath);
      console.log('🧹 Archivo de violaciones previo eliminado');
    }
    
    // Asegurar que el directorio test-results existe
    if (!fs.existsSync('test-results')) {
      fs.mkdirSync('test-results', { recursive: true });
    }
    
    // Arrays para capturar requests y responses
    const networkRequests = [];
    const networkResponses = [];
    const analyticsViolations = [];
    
    // Interceptar todas las requests
    page.on('request', request => {
      const url = request.url();
      const method = request.method();
      const headers = request.headers();
      const timestamp = new Date().toISOString();
      
      networkRequests.push({
        url,
        method,
        headers,
        timestamp
      });
      
      // Verificar si es una request de analytics
      const analyticsDomains = [
        'google-analytics.com',
        'www.google-analytics.com',
        'ssl.google-analytics.com',
        'googletagmanager.com',
        'www.googletagmanager.com',
        'ssl.googletagmanager.com',
        'facebook.com/tr',
        'www.facebook.com/tr',
        'connect.facebook.net',
        'www.connect.facebook.net',
        'doubleclick.net',
        'www.doubleclick.net',
        'googleadservices.com',
        'www.googleadservices.com',
        'googlesyndication.com',
        'www.googlesyndication.com',
        'mixpanel.com',
        'api.mixpanel.com',
        'cdn.mxpnl.com',
        'amplitude.com',
        'api.amplitude.com',
        'cdn.amplitude.com',
        'segment.io',
        'api.segment.io',
        'cdn.segment.io',
        'heap.com',
        'api.heap.io',
        'cdn.heap.io',
        'hotjar.com',
        'static.hotjar.com',
        'script.hotjar.com',
        'clarity.ms',
        'www.clarity.ms',
        'c.clarity.ms',
        'linkedin.com/li.lms',
        'px.ads.linkedin.com',
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
      
      const isAnalyticsRequest = analyticsDomains.some(domain => url.includes(domain));
      
      if (isAnalyticsRequest) {
        const violation = {
          type: 'REQUEST',
          url,
          method,
          headers,
          timestamp,
          reason: 'Analytics request detected'
        };
        
        analyticsViolations.push(violation);
        console.log('🚨 VIOLACIÓN DE ANALYTICS (REQUEST):', url);
        
        // Registrar en archivo de violaciones
        const violationLog = `[${timestamp}] REQUEST VIOLATION: ${method} ${url}\n`;
        fs.appendFileSync(violationsLogPath, violationLog);
      }
    });
    
    // Interceptar todas las responses
    page.on('response', response => {
      const url = response.url();
      const status = response.status();
      const headers = response.headers();
      const timestamp = new Date().toISOString();
      
      networkResponses.push({
        url,
        status,
        headers,
        timestamp
      });
      
      // Verificar si es una response de analytics
      const analyticsDomains = [
        'google-analytics.com',
        'googletagmanager.com',
        'facebook.com/tr',
        'connect.facebook.net',
        'doubleclick.net',
        'googleadservices.com',
        'googlesyndication.com',
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
      
      const isAnalyticsResponse = analyticsDomains.some(domain => url.includes(domain));
      
      if (isAnalyticsResponse) {
        const violation = {
          type: 'RESPONSE',
          url,
          status,
          headers,
          timestamp,
          reason: 'Analytics response detected'
        };
        
        analyticsViolations.push(violation);
        console.log('🚨 VIOLACIÓN DE ANALYTICS (RESPONSE):', url, 'Status:', status);
        
        // Registrar en archivo de violaciones
        const violationLog = `[${timestamp}] RESPONSE VIOLATION: ${status} ${url}\n`;
        fs.appendFileSync(violationsLogPath, violationLog);
      }
    });
    
    // Configurar bloqueo de analytics
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      
      const analyticsDomains = [
        'google-analytics.com',
        'googletagmanager.com',
        'facebook.com/tr',
        'connect.facebook.net',
        'doubleclick.net',
        'googleadservices.com',
        'googlesyndication.com',
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
      
      const isAnalyticsRequest = analyticsDomains.some(domain => url.includes(domain));
      
      if (isAnalyticsRequest) {
        console.log('🚫 BLOQUEANDO REQUEST DE ANALYTICS:', url);
        await route.abort('blockedbyclient');
        return;
      }
      
      await route.continue();
    });
    
    // Navegar a la página principal
    console.log('🌐 Navegando a la página principal...');
    await page.goto(process.env.BASE_URL || 'https://mishu-web--pr69-performance-and-prof-8fsc02so.web.app/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Esperar un poco más para capturar requests tardías
    console.log('⏳ Esperando requests tardías...');
    await page.waitForTimeout(5000);
    
    // Navegar a otras páginas para capturar más tráfico
    console.log('🌐 Navegando a página de login...');
    await page.goto(`${process.env.BASE_URL || 'https://mishu-web--pr69-performance-and-prof-8fsc02so.web.app/'}/login`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    
    // Generar reporte HAR mínimo
    const harData = {
      log: {
        version: '1.2',
        creator: {
          name: 'Playwright Analytics Capture',
          version: '1.0.0'
        },
        pages: [
          {
            startedDateTime: new Date().toISOString(),
            id: 'page_1',
            title: 'Analytics Capture Test',
            pageTimings: {
              onLoad: 0,
              onContentLoad: 0
            }
          }
        ],
        entries: networkRequests.map((req, index) => {
          const response = networkResponses[index] || {};
          return {
            pageref: 'page_1',
            startedDateTime: req.timestamp,
            time: 0,
            request: {
              method: req.method,
              url: req.url,
              headers: Object.entries(req.headers).map(([name, value]) => ({ name, value })),
              queryString: [],
              cookies: [],
              headersSize: -1,
              bodySize: -1
            },
            response: {
              status: response.status || 0,
              statusText: response.status ? 'OK' : 'Blocked',
              headers: Object.entries(response.headers || {}).map(([name, value]) => ({ name, value })),
              content: {
                size: 0,
                mimeType: 'text/plain'
              },
              redirectURL: '',
              headersSize: -1,
              bodySize: -1
            },
            cache: {},
            timings: {
              blocked: 0,
              dns: -1,
              connect: -1,
              send: 0,
              wait: 0,
              receive: 0,
              ssl: -1
            }
          };
        })
      }
    };
    
    // Guardar reporte HAR
    const harPath = 'test-results/analytics-capture.har';
    fs.writeFileSync(harPath, JSON.stringify(harData, null, 2));
    console.log('💾 Reporte HAR guardado en:', harPath);
    
    // Generar reporte de resumen
    const summaryReport = {
      timestamp: new Date().toISOString(),
      totalRequests: networkRequests.length,
      totalResponses: networkResponses.length,
      analyticsViolations: analyticsViolations.length,
      violations: analyticsViolations,
      blockedDomains: [
        'google-analytics.com',
        'googletagmanager.com',
        'facebook.com/tr',
        'doubleclick.net',
        'mixpanel.com',
        'amplitude.com',
        'segment.io',
        'heap.com',
        'hotjar.com',
        'clarity.ms'
      ]
    };
    
    const summaryPath = 'test-results/analytics-summary.json';
    fs.writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2));
    console.log('📊 Reporte de resumen guardado en:', summaryPath);
    
    // Verificaciones de seguridad
    console.log('🔍 Verificando resultados...');
    console.log('Total requests capturadas:', networkRequests.length);
    console.log('Total responses capturadas:', networkResponses.length);
    console.log('Violaciones de analytics detectadas:', analyticsViolations.length);
    
    if (analyticsViolations.length > 0) {
      console.log('🚨 VIOLACIONES DETECTADAS:');
      analyticsViolations.forEach(violation => {
        console.log(`  - ${violation.type}: ${violation.url}`);
      });
    }
    
    // Verificar que no hay violaciones (esto debería pasar si el bloqueo funciona)
    expect(analyticsViolations.length).toBe(0);
    
    // Verificar que se creó el archivo de violaciones (debería estar vacío o no existir)
    if (fs.existsSync(violationsLogPath)) {
      const violationContent = fs.readFileSync(violationsLogPath, 'utf8');
      expect(violationContent.trim()).toBe('');
    }
    
    console.log('✅ Captura de tráfico completada sin violaciones de analytics');
  });
  
  test('Verificar bloqueo de Firebase específicamente', async ({ page }) => {
    console.log('🔍 Verificando bloqueo específico de Firebase...');
    
    // Configurar captura de requests de Firebase
    const firebaseRequests = [];
    
    page.on('request', request => {
      const url = request.url();
      if (url.includes('firebase') || url.includes('firebaseapp.com') || url.includes('firebaseio.com')) {
        firebaseRequests.push({
          url,
          method: request.method(),
          timestamp: new Date().toISOString()
        });
        console.log('🚨 REQUEST DE FIREBASE DETECTADA:', url);
      }
    });
    
    // Configurar bloqueo específico de Firebase
    await page.route('**/*', async (route) => {
      const url = route.request().url();
      
      if (url.includes('firebase') || url.includes('firebaseapp.com') || url.includes('firebaseio.com')) {
        console.log('🚫 BLOQUEANDO REQUEST DE FIREBASE:', url);
        await route.abort('blockedbyclient');
        return;
      }
      
      await route.continue();
    });
    
    // Navegar a la página
    await page.goto(process.env.BASE_URL || 'https://mishu-web--pr69-performance-and-prof-8fsc02so.web.app/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Esperar para capturar requests tardías
    await page.waitForTimeout(5000);
    
    console.log('Requests de Firebase detectadas:', firebaseRequests.length);
    
    // Verificar que no hay requests de Firebase
    expect(firebaseRequests.length).toBe(0);
    
    console.log('✅ Firebase bloqueado correctamente');
  });
});
