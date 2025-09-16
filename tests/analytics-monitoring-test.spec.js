// Test de monitoreo de analytics - NO falla si detecta violaciones, solo las reporta
// Este test está diseñado para monitorear y reportar violaciones de analytics

const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Analytics Monitoring Test', () => {
  
  test('Monitorear violaciones de analytics sin fallar', async ({ page, context }) => {
    console.log('🔍 Iniciando monitoreo de analytics...');
    
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
    await page.goto(process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/', {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    // Esperar un poco más para capturar requests tardías
    console.log('⏳ Esperando requests tardías...');
    await page.waitForTimeout(5000);
    
    // Navegar a otras páginas para capturar más tráfico
    console.log('🌐 Navegando a página de login...');
    await page.goto(`${process.env.BASE_URL || 'https://mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb.web.app/'}/login`, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    await page.waitForTimeout(3000);
    
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
    
    const summaryPath = 'test-results/analytics-monitoring-summary.json';
    fs.writeFileSync(summaryPath, JSON.stringify(summaryReport, null, 2));
    console.log('📊 Reporte de monitoreo guardado en:', summaryPath);
    
    // Reportar resultados sin fallar
    console.log('🔍 RESULTADOS DEL MONITOREO:');
    console.log('=====================================');
    console.log('Total requests capturadas:', networkRequests.length);
    console.log('Total responses capturadas:', networkResponses.length);
    console.log('Violaciones de analytics detectadas:', analyticsViolations.length);
    
    if (analyticsViolations.length > 0) {
      console.log('🚨 VIOLACIONES DETECTADAS:');
      analyticsViolations.forEach((violation, index) => {
        console.log(`  ${index + 1}. ${violation.type}: ${violation.url}`);
      });
      
      // Crear reporte detallado de violaciones
      const violationsReport = {
        timestamp: new Date().toISOString(),
        summary: {
          totalViolations: analyticsViolations.length,
          requestViolations: analyticsViolations.filter(v => v.type === 'REQUEST').length,
          responseViolations: analyticsViolations.filter(v => v.type === 'RESPONSE').length
        },
        violations: analyticsViolations.map(violation => ({
          type: violation.type,
          url: violation.url,
          timestamp: violation.timestamp,
          reason: violation.reason
        }))
      };
      
      const violationsPath = 'test-results/analytics-violations-detailed.json';
      fs.writeFileSync(violationsPath, JSON.stringify(violationsReport, null, 2));
      console.log('📋 Reporte detallado de violaciones guardado en:', violationsPath);
      
      // NO fallar el test, solo reportar
      console.log('⚠️ SE DETECTARON VIOLACIONES DE ANALYTICS - Revisar configuración de bloqueo');
    } else {
      console.log('✅ NO SE DETECTARON VIOLACIONES DE ANALYTICS');
    }
    
    // El test siempre pasa - solo reporta
    console.log('✅ Monitoreo de analytics completado');
  });
});
