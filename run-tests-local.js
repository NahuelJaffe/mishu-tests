#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🔴 EJECUTANDO TESTS DE PRIORIDAD ALTA - MODO LOCAL');
console.log('=' .repeat(60));

// Tests de prioridad alta por categoría
const highPriorityTests = {
  'Authentication & Login': [
    'tests/whatsapp/auth.spec.js',
    'tests/whatsapp/real-login-test.spec.js', 
    'tests/auth/login-valid.spec.js'
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

console.log('📊 TESTS DE PRIORIDAD ALTA A EJECUTAR:');
let totalTests = 0;
Object.entries(highPriorityTests).forEach(([category, files]) => {
  console.log(`\n🔹 ${category}:`);
  files.forEach(file => {
    console.log(`   - ${file}`);
    totalTests++;
  });
});

console.log(`\n📈 Total: ${totalTests} archivos de test`);
console.log('🎯 Objetivo: 0 errores en tests de prioridad alta');
console.log('🌐 Browser: Firefox (compatible con macOS)');
console.log();

// Ejecutar tests por categoría
Object.entries(highPriorityTests).forEach(([category, files]) => {
  console.log(`\n🚀 Ejecutando: ${category}`);
  console.log('-' .repeat(40));
  
  files.forEach(file => {
    try {
      console.log(`\n▶️  ${file}`);
      
      // Usar solo Firefox para evitar problemas de navegadores en macOS
      const command = `npx playwright test ${file} --project=firefox --reporter=line --timeout=60000`;
      
      try {
        execSync(command, { 
          stdio: 'inherit',
          cwd: '/Users/nahueljaffe/Desktop/mishu-tests',
          timeout: 180000 // 3 minutos por archivo
        });
        console.log(`✅ ${file} - PASSED`);
      } catch (error) {
        console.log(`❌ ${file} - FAILED`);
        console.log(`   Error: ${error.message}`);
        
        // Si es un error de navegación (URL no encontrada), es esperado en local
        if (error.message.includes('NS_ERROR_UNKNOWN_HOST') || 
            error.message.includes('your-app.example.com')) {
          console.log(`   ℹ️  Error esperado: URL de placeholder para seguridad`);
        }
      }
    } catch (error) {
      console.log(`⚠️  Error ejecutando ${file}:`);
      console.log(`   ${error.message}`);
    }
  });
});

console.log('\n🏁 EJECUCIÓN COMPLETADA');
console.log('=' .repeat(60));
console.log();
console.log('📋 PRÓXIMOS PASOS:');
console.log('1. Los errores de URL son esperados (placeholders de seguridad)');
console.log('2. Los tests se ejecutarán correctamente en CI con secrets reales');
console.log('3. Para ejecutar en GitHub Actions, usar el botón "Run workflow"');
console.log('4. Revisar resultados en GitHub Actions para validación completa');
console.log();
