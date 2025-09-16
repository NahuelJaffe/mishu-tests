#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m'
};

function colorize(text, color) {
  return `${colors[color]}${text}${colors.reset}`;
}

function runHighPriorityTests() {
  console.log(colorize('🔴 EJECUTANDO TESTS DE PRIORIDAD ALTA', 'bright'));
  console.log(colorize('=' .repeat(60), 'blue'));
  console.log();
  
  // Tests de prioridad alta por categoría
  const highPriorityTests = {
    'Authentication & Login': [
      'tests/whatsapp/auth.spec.js',
      'tests/whatsapp/real-login-test.spec.js', 
      'tests/auth/login-valid.spec.js',
      'tests/whatsapp/login-accessibility.spec.js',
      'tests/whatsapp/login-exploration.spec.js'
    ],
    'Connection Management': [
      'tests/whatsapp/connection.spec.js',
      'tests/whatsapp/connection-detailed.spec.js'
    ],
    'Message Monitoring': [
      'tests/whatsapp/message-monitoring.spec.js'
    ],
    'Security': [
      'tests/whatsapp/security.spec.js'
    ]
  };
  
  console.log(colorize('📊 TESTS DE PRIORIDAD ALTA A EJECUTAR:', 'cyan'));
  let totalTests = 0;
  Object.entries(highPriorityTests).forEach(([category, files]) => {
    console.log(colorize(`\n🔹 ${category}:`, 'yellow'));
    files.forEach(file => {
      console.log(colorize(`   - ${file}`, 'white'));
      totalTests++;
    });
  });
  
  console.log(colorize(`\n📈 Total: ${totalTests} archivos de test`, 'green'));
  console.log(colorize('🎯 Objetivo: 0 errores en tests de prioridad alta', 'bright'));
  console.log();
  
  // Ejecutar tests por categoría
  Object.entries(highPriorityTests).forEach(([category, files]) => {
    console.log(colorize(`\n🚀 Ejecutando: ${category}`, 'cyan'));
    console.log(colorize('-' .repeat(40), 'blue'));
    
    files.forEach(file => {
      try {
        console.log(colorize(`\n▶️  ${file}`, 'white'));
        const command = `npx playwright test ${file} --reporter=line`;
        
        try {
          execSync(command, { 
            stdio: 'inherit',
            cwd: process.cwd(),
            timeout: 120000 // 2 minutos por archivo
          });
          console.log(colorize(`✅ ${file} - PASSED`, 'green'));
        } catch (error) {
          console.log(colorize(`❌ ${file} - FAILED`, 'red'));
          console.log(colorize(`   Error: ${error.message}`, 'red'));
        }
      } catch (error) {
        console.log(colorize(`⚠️  Error ejecutando ${file}:`, 'yellow'));
        console.log(colorize(`   ${error.message}`, 'yellow'));
      }
    });
  });
  
  console.log(colorize('\n🏁 EJECUCIÓN COMPLETADA', 'bright'));
  console.log(colorize('=' .repeat(60), 'blue'));
  console.log();
  console.log(colorize('📋 PRÓXIMOS PASOS:', 'cyan'));
  console.log(colorize('1. Revisar resultados de cada test', 'white'));
  console.log(colorize('2. Corregir errores identificados', 'white'));
  console.log(colorize('3. Ejecutar nuevamente hasta 0 errores', 'white'));
  console.log(colorize('4. Hacer commit de correcciones', 'white'));
  console.log();
}

// Manejar interrupción
process.on('SIGINT', () => {
  console.log(colorize('\n🛑 Ejecución interrumpida por el usuario', 'yellow'));
  process.exit(0);
});

runHighPriorityTests().catch(console.error);
