const fs = require('fs');

async function globalTeardown(config) {
  console.log('🧹 Starting global teardown...');
  
  // Limpiar archivo de estado de autenticación
  const authStateFile = 'global-auth-state.json';
  if (fs.existsSync(authStateFile)) {
    fs.unlinkSync(authStateFile);
    console.log(`🗑️ Cleaned up: ${authStateFile}`);
  }
  
  console.log('✅ Global teardown completed');
}

module.exports = globalTeardown;
