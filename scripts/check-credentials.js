#!/usr/bin/env node

// Script para verificar que las credenciales están configuradas correctamente

const { validateCredentials } = require('../tests/auth-helper');

console.log('🔍 Verificando configuración de credenciales...\n');

// Verificar variables de entorno
const email = process.env.TEST_EMAIL;
const password = process.env.TEST_PASSWORD;
const baseUrl = process.env.BASE_URL;

console.log('📋 Variables de entorno:');
console.log(`  TEST_EMAIL: ${email ? '✅ Configurado' : '❌ No configurado'}`);
console.log(`  TEST_PASSWORD: ${password ? '✅ Configurado' : '❌ No configurado'}`);
console.log(`  BASE_URL: ${baseUrl ? '✅ Configurado' : '❌ No configurado'}`);

console.log('\n🔐 Validación de credenciales:');
const isValid = validateCredentials();

if (isValid) {
  console.log('\n✅ Todas las credenciales están configuradas correctamente');
  console.log('🚀 Listo para ejecutar tests en GitHub Actions');
} else {
  console.log('\n⚠️ Credenciales no configuradas completamente');
  console.log('📖 Consulta SECRETS_SETUP.md para configurar los secrets en GitHub');
  process.exit(1);
}
