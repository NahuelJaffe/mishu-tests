// Global teardown for Playwright tests
const fs = require('fs');

async function globalTeardown(config) {
  console.log('🧹 Starting global teardown...');
  
  try {
    // Clean up temporary files
    const tempFiles = [
      'global-auth-state.json',
      'storageState.json'
    ];
    
    tempFiles.forEach(file => {
      if (fs.existsSync(file)) {
        fs.unlinkSync(file);
        console.log(`🗑️ Cleaned up: ${file}`);
      }
    });
    
    console.log('✅ Global teardown completed');
  } catch (error) {
    console.error('❌ Global teardown failed:', error.message);
  }
}

module.exports = globalTeardown;
