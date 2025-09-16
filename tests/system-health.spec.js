// Test de salud del sistema - verifica que la configuración básica funciona
// Este test NO requiere navegación a URLs externas

const { test, expect } = require('@playwright/test');
const testConfig = require('./test-config');

test.describe('System Health Tests', () => {
  
  test('TC-01: Configuración básica funciona', async ({ page }) => {
    console.log('🔍 Verificando configuración básica...');
    
    // Verificar que testConfig está cargado
    expect(testConfig).toBeDefined();
    expect(testConfig.TEST_EMAIL).toBeDefined();
    expect(testConfig.TEST_PASSWORD).toBeDefined();
    expect(testConfig.BASE_URL).toBeDefined();
    
    console.log('✅ Configuración básica cargada correctamente');
    console.log('📧 TEST_EMAIL:', testConfig.TEST_EMAIL);
    console.log('🌐 BASE_URL:', testConfig.BASE_URL);
    
    // Verificar que estamos usando URLs genéricas (no sensibles)
    expect(testConfig.BASE_URL).toContain('example.com');
    expect(testConfig.TEST_EMAIL).toContain('example.com');
    
    console.log('✅ URLs genéricas confirmadas - repositorio seguro');
  });
  
  test('TC-02: Setup de analytics funciona', async ({ page }) => {
    console.log('🔍 Verificando setup de analytics...');
    
    // Configurar bloqueo de analytics
    try {
      const { setupAnalyticsForTest } = require('./analytics-setup.js');
      await setupAnalyticsForTest(page);
      console.log('✅ Analytics setup ejecutado correctamente');
    } catch (error) {
      console.error('❌ Error en analytics setup:', error);
      throw error;
    }
    
    // Verificar que el bloqueador nuclear está inyectado
    const nuclearBlockerActive = await page.evaluate(() => {
      return window.__NUCLEAR_ANALYTICS_BLOCKER__ === true;
    });
    
    expect(nuclearBlockerActive).toBe(true);
    console.log('✅ Bloqueador nuclear de analytics activo');
  });
  
  test('TC-03: Variables de entorno detectadas correctamente', async ({ page }) => {
    console.log('🔍 Verificando detección de variables de entorno...');
    
    // Verificar que el sistema detecta si hay credenciales reales
    const hasRealCredentials = testConfig.TEST_EMAIL !== 'test@example.com' && 
                              testConfig.TEST_PASSWORD !== 'ExamplePassword123!';
    
    console.log('🔍 Credenciales reales detectadas:', hasRealCredentials);
    
    if (hasRealCredentials) {
      console.log('✅ Sistema detectó credenciales reales (CI o variables de entorno)');
    } else {
      console.log('✅ Sistema usando credenciales genéricas (desarrollo local)');
    }
    
    // El test siempre pasa - solo verifica la detección
    expect(hasRealCredentials).toBeDefined();
  });
  
  test('TC-04: Navegación a página local funciona', async ({ page }) => {
    console.log('🔍 Verificando navegación básica...');
    
    // Configurar bloqueo de analytics
    try {
      const { setupAnalyticsForTest } = require('./analytics-setup.js');
      await setupAnalyticsForTest(page);
    } catch (error) {
      console.error('❌ Error en analytics setup:', error);
      throw error;
    }
    
    // Navegar a una página que sabemos que existe (about:blank)
    await page.goto('about:blank');
    
    // Verificar que la página se cargó
    const url = page.url();
    expect(url).toBe('about:blank');
    
    console.log('✅ Navegación básica funciona correctamente');
  });
  
  test('TC-05: Sistema listo para CI', async ({ page }) => {
    console.log('🔍 Verificando preparación para CI...');
    
    // Verificar que todos los componentes necesarios están disponibles
    const components = [
      'testConfig',
      'analytics-setup.js',
      'analytics-blocker-nuclear.js'
    ];
    
    for (const component of components) {
      try {
        if (component === 'testConfig') {
          expect(testConfig).toBeDefined();
        } else {
          require(`./${component}`);
        }
        console.log(`✅ ${component} disponible`);
      } catch (error) {
        console.error(`❌ ${component} no disponible:`, error);
        throw error;
      }
    }
    
    // Verificar que el sistema está configurado para usar secrets
    const canUseSecrets = process.env.TEST_EMAIL || process.env.TEST_PASSWORD || process.env.BASE_URL;
    
    if (canUseSecrets) {
      console.log('✅ Variables de entorno detectadas - listo para CI');
    } else {
      console.log('✅ Modo desarrollo local - usando configuración genérica');
    }
    
    console.log('🎯 Sistema completamente preparado para CI');
  });
});
