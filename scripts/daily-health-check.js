#!/usr/bin/env node

/**
 * Script de verificación diaria de salud del sistema
 * Ejecutar diariamente para verificar el estado del proyecto
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Colores para la consola
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCIStatus() {
  log('\n🔍 Verificando estado de CI...', 'blue');
  try {
    execSync('npm run monitor:ci', { stdio: 'pipe' });
    log('✅ CI funcionando correctamente', 'green');
    return true;
  } catch (error) {
    log('❌ Problemas con CI', 'red');
    return false;
  }
}

function checkSecurity() {
  log('\n🔒 Verificando seguridad...', 'blue');
  
  // Verificar URLs sensibles en archivos de código fuente
  const fs = require('fs');
  const path = require('path');
  
  function checkFileForSensitiveContent(filePath) {
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      // Buscar URLs sensibles (excluyendo comentarios y strings de documentación)
      const sensitivePattern = /mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb/;
      if (sensitivePattern.test(content)) {
        // Verificar si está en comentarios o documentación
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i].trim();
          if (sensitivePattern.test(line) && !line.startsWith('//') && !line.startsWith('*') && !line.startsWith('#')) {
            return true;
          }
        }
      }
    } catch (error) {
      // Error leyendo archivo, ignorar
    }
    return false;
  }
  
  // Verificar archivos principales
  const criticalFiles = [
    'package.json',
    'playwright.config.js',
    'tests/test-config.js'
  ];
  
  for (const file of criticalFiles) {
    if (fs.existsSync(file) && checkFileForSensitiveContent(file)) {
      log(`❌ URLs sensibles detectadas en ${file}`, 'red');
      return false;
    }
  }
  
  // Verificar credenciales sensibles en archivos críticos
  for (const file of criticalFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');
      if (content.includes('test@mishu.com') || content.includes('TestPassword123')) {
        log(`❌ Credenciales sensibles detectadas en ${file}`, 'red');
        return false;
      }
    }
  }
  
  log('✅ Seguridad verificada', 'green');
  return true;
}

function checkAnalyticsBlocking() {
  log('\n🚫 Verificando bloqueo de analytics...', 'blue');
  
  const analyticsFiles = [
    'tests/analytics-blocker-nuclear.js',
    'tests/analytics-setup.js',
    'tests/analytics-monitoring-test.spec.js'
  ];
  
  let allPresent = true;
  analyticsFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`✅ ${file} presente`, 'green');
    } else {
      log(`❌ ${file} faltante`, 'red');
      allPresent = false;
    }
  });
  
  return allPresent;
}

function checkConfiguration() {
  log('\n⚙️ Verificando configuración...', 'blue');
  
  const configFiles = [
    'package.json',
    'playwright.config.js',
    'tests/test-config.js',
    '.github/workflows/qa-complete-tests.yml',
    '.github/workflows/smoke-tests.yml.disabled',
    '.github/workflows/analytics-blocking.yml.disabled',
    '.github/workflows/system-health.yml.disabled'
  ];
  
  let allPresent = true;
  configFiles.forEach(file => {
    if (fs.existsSync(file)) {
      log(`✅ ${file} presente`, 'green');
    } else {
      log(`❌ ${file} faltante`, 'red');
      allPresent = false;
    }
  });
  
  return allPresent;
}

function generateReport(results) {
  const timestamp = new Date().toISOString();
  const reportPath = 'health-check-report.json';
  
  const report = {
    timestamp,
    overall_status: results.every(r => r) ? 'HEALTHY' : 'ISSUES_DETECTED',
    checks: {
      ci_status: results[0],
      security: results[1],
      analytics_blocking: results[2],
      configuration: results[3]
    },
    summary: {
      total_checks: results.length,
      passed: results.filter(r => r).length,
      failed: results.filter(r => !r).length
    }
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📊 Reporte guardado en: ${reportPath}`, 'blue');
  
  return report;
}

function main() {
  log('🏥 VERIFICACIÓN DIARIA DE SALUD DEL SISTEMA', 'bold');
  log('==========================================', 'bold');
  
  const results = [
    checkCIStatus(),
    checkSecurity(),
    checkAnalyticsBlocking(),
    checkConfiguration()
  ];
  
  const report = generateReport(results);
  
  log('\n📋 RESUMEN FINAL:', 'bold');
  log(`✅ Checks pasados: ${report.summary.passed}/${report.summary.total_checks}`, 'green');
  log(`❌ Checks fallidos: ${report.summary.failed}/${report.summary.total_checks}`, 'red');
  
  if (report.overall_status === 'HEALTHY') {
    log('\n🎉 SISTEMA COMPLETAMENTE SALUDABLE', 'green');
    process.exit(0);
  } else {
    log('\n⚠️ PROBLEMAS DETECTADOS - REVISAR REPORTE', 'yellow');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { main };
