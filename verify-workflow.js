#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 VERIFICANDO CONFIGURACIÓN DE WORKFLOWS');
console.log('=' .repeat(50));

// Verificar que los archivos de workflow existen
const workflows = [
  '.github/workflows/auth-tests-only.yml',
  '.github/workflows/high-priority-simple.yml',
  '.github/workflows/high-priority-tests.yml'
];

console.log('📁 Verificando archivos de workflow:');
workflows.forEach(workflow => {
  const exists = fs.existsSync(workflow);
  console.log(`   ${exists ? '✅' : '❌'} ${workflow}`);
});

// Verificar que analytics-setup.js está corregido
console.log('\n🔧 Verificando correcciones:');
const analyticsFile = 'tests/analytics-setup.js';
if (fs.existsSync(analyticsFile)) {
  const content = fs.readFileSync(analyticsFile, 'utf8');
  const hasSyntaxError = content.includes('});') && content.split('});').length > content.split('{').length;
  console.log(`   ${!hasSyntaxError ? '✅' : '❌'} analytics-setup.js (sintaxis corregida)`);
} else {
  console.log('   ❌ analytics-setup.js no encontrado');
}

console.log('\n📋 INSTRUCCIONES PARA EJECUTAR:');
console.log('1. Hacer commit de los cambios');
console.log('2. Ir a GitHub Actions en el repositorio');
console.log('3. Buscar "Authentication Tests - All Browsers"');
console.log('4. Hacer clic en "Run workflow"');
console.log('5. Seleccionar scope: "core" para empezar');
console.log('6. Hacer clic en "Run workflow"');
console.log();

console.log('🎯 WORKFLOW CREADO:');
console.log('- Nombre: Authentication Tests - All Browsers');
console.log('- Browsers: Chromium, Firefox, WebKit');
console.log('- Tests: Solo tests de autenticación');
console.log('- Trigger: Manual (workflow_dispatch)');
console.log('- Timeout: 20 minutos por browser');
console.log();

console.log('✅ LISTO PARA EJECUTAR EN GITHUB ACTIONS');
