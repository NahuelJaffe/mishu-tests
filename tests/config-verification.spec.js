const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

test.describe('Configuración del Sistema', () => {
  
  test('Verificar archivos de configuración críticos', async () => {
    const configFiles = [
      'package.json',
      'playwright.config.js',
      'tests/test-config.js',
      '.github/workflows/smoke-tests.yml',
      '.github/workflows/analytics-blocking.yml',
      '.github/workflows/system-health.yml'
    ];

    for (const file of configFiles) {
      const filePath = path.join(process.cwd(), file);
      const exists = fs.existsSync(filePath);
      console.log(`📁 ${file}: ${exists ? '✅ Presente' : '❌ Faltante'}`);
      expect(exists).toBe(true);
    }
  });

  test('Verificar scripts de analytics blocking', async () => {
    const analyticsFiles = [
      'tests/analytics-blocker-nuclear.js',
      'tests/analytics-setup.js',
      'tests/analytics-monitoring-test.spec.js',
      'tests/analytics-route-blocker.js',
      'tests/analytics-dns-blocker.js'
    ];

    for (const file of analyticsFiles) {
      const filePath = path.join(process.cwd(), file);
      const exists = fs.existsSync(filePath);
      console.log(`🚫 ${file}: ${exists ? '✅ Presente' : '❌ Faltante'}`);
      expect(exists).toBe(true);
    }
  });

  test('Verificar configuración de test-config.js', async () => {
    const testConfig = require('./test-config.js');
    
    // Verificar que las variables están definidas
    expect(testConfig.BASE_URL).toBeDefined();
    expect(testConfig.TEST_EMAIL).toBeDefined();
    expect(testConfig.TEST_PASSWORD).toBeDefined();
    expect(testConfig.API_BASE_URL).toBeDefined();
    
    // Verificar que no son URLs reales (seguridad)
    expect(testConfig.BASE_URL).not.toContain('mishu-web--pr68');
    expect(testConfig.TEST_EMAIL).not.toContain('test@mishu.com');
    expect(testConfig.TEST_PASSWORD).not.toContain('TestPassword123');
    
    console.log(`🌐 BASE_URL: ${testConfig.BASE_URL}`);
    console.log(`📧 TEST_EMAIL: ${testConfig.TEST_EMAIL}`);
    console.log(`🔑 TEST_PASSWORD: ${testConfig.TEST_PASSWORD.substring(0, 3)}***`);
    console.log(`🔗 API_BASE_URL: ${testConfig.API_BASE_URL}`);
  });

  test('Verificar estructura de workflows de GitHub Actions', async () => {
    const workflowFiles = [
      '.github/workflows/smoke-tests.yml',
      '.github/workflows/analytics-blocking.yml',
      '.github/workflows/system-health.yml'
    ];

    for (const workflow of workflowFiles) {
      const content = fs.readFileSync(path.join(process.cwd(), workflow), 'utf8');
      
      // Verificar elementos críticos
      expect(content).toContain('workflow_dispatch');
      expect(content).toContain('secrets.BASE_URL');
      expect(content).toContain('secrets.TEST_EMAIL');
      expect(content).toContain('secrets.TEST_PASSWORD');
      
      console.log(`⚙️ ${workflow}: ✅ Configuración válida`);
    }
  });

  test('Verificar scripts de utilidades', async () => {
    const utilityFiles = [
      'scripts/daily-health-check.js',
      'scripts/monitor-ci.js'
    ];

    for (const file of utilityFiles) {
      const filePath = path.join(process.cwd(), file);
      const exists = fs.existsSync(filePath);
      console.log(`🛠️ ${file}: ${exists ? '✅ Presente' : '❌ Faltante'}`);
      expect(exists).toBe(true);
    }
  });

  test('Verificar documentación', async () => {
    const docFiles = [
      'README.md',
      'SECRETS_SETUP.md',
      'DEPLOYMENT.md',
      'STATUS.md'
    ];

    for (const file of docFiles) {
      const filePath = path.join(process.cwd(), file);
      const exists = fs.existsSync(filePath);
      console.log(`📚 ${file}: ${exists ? '✅ Presente' : '❌ Faltante'}`);
      expect(exists).toBe(true);
    }
  });

});
