#!/usr/bin/env node

/**
 * Script de monitoreo de CI para GitHub Actions
 * Este script ayuda a monitorear el estado de los workflows
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// Configuración
const REPO_OWNER = 'NahuelJaffe';
const REPO_NAME = 'mishu-tests';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; // Opcional, para más detalles

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

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    });
    
    req.on('error', reject);
    req.end();
  });
}

async function getWorkflowRuns() {
  const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs?per_page=10`;
  const options = {
    headers: {
      'User-Agent': 'mishu-tests-monitor',
      ...(GITHUB_TOKEN && { 'Authorization': `token ${GITHUB_TOKEN}` })
    }
  };
  
  try {
    const response = await makeRequest(url, options);
    return response.workflow_runs || [];
  } catch (error) {
    log(`❌ Error al obtener workflows: ${error.message}`, 'red');
    return [];
  }
}

async function getWorkflowStatus() {
  log('🔍 Monitoreando workflows de GitHub Actions...', 'blue');
  log(`📁 Repositorio: ${REPO_OWNER}/${REPO_NAME}`, 'blue');
  log('');
  
  const runs = await getWorkflowRuns();
  
  if (runs.length === 0) {
    log('⚠️ No se encontraron ejecuciones de workflows', 'yellow');
    return;
  }
  
  // Agrupar por workflow
  const workflows = {};
  runs.forEach(run => {
    const workflowName = run.name;
    if (!workflows[workflowName]) {
      workflows[workflowName] = [];
    }
    workflows[workflowName].push(run);
  });
  
  // Mostrar estado de cada workflow
  Object.entries(workflows).forEach(([workflowName, runs]) => {
    const latestRun = runs[0];
    const status = latestRun.status;
    const conclusion = latestRun.conclusion;
    
    log(`\n📋 ${workflowName}`, 'bold');
    
    // Estado del último run
    let statusColor = 'yellow';
    let statusText = status;
    
    if (status === 'completed') {
      if (conclusion === 'success') {
        statusColor = 'green';
        statusText = '✅ SUCCESS';
      } else if (conclusion === 'failure') {
        statusColor = 'red';
        statusText = '❌ FAILED';
      } else if (conclusion === 'cancelled') {
        statusColor = 'yellow';
        statusText = '⏹️ CANCELLED';
      }
    } else if (status === 'in_progress') {
      statusColor = 'blue';
      statusText = '🔄 IN PROGRESS';
    } else if (status === 'queued') {
      statusColor = 'yellow';
      statusText = '⏳ QUEUED';
    }
    
    log(`   Estado: ${statusText}`, statusColor);
    log(`   Commit: ${latestRun.head_commit.message.substring(0, 50)}...`, 'reset');
    log(`   Fecha: ${new Date(latestRun.created_at).toLocaleString()}`, 'reset');
    log(`   URL: ${latestRun.html_url}`, 'blue');
    
    // Mostrar runs recientes
    if (runs.length > 1) {
      log(`   📊 Últimos ${Math.min(3, runs.length)} runs:`, 'reset');
      runs.slice(0, 3).forEach((run, index) => {
        const runStatus = run.status === 'completed' 
          ? (run.conclusion === 'success' ? '✅' : '❌')
          : run.status === 'in_progress' ? '🔄' : '⏳';
        log(`      ${index + 1}. ${runStatus} ${new Date(run.created_at).toLocaleString()}`, 'reset');
      });
    }
  });
  
  // Resumen general
  log('\n📊 RESUMEN:', 'bold');
  const successCount = runs.filter(r => r.status === 'completed' && r.conclusion === 'success').length;
  const failureCount = runs.filter(r => r.status === 'completed' && r.conclusion === 'failure').length;
  const inProgressCount = runs.filter(r => r.status === 'in_progress').length;
  
  log(`   ✅ Exitosos: ${successCount}`, 'green');
  log(`   ❌ Fallidos: ${failureCount}`, 'red');
  log(`   🔄 En progreso: ${inProgressCount}`, 'blue');
  
  if (inProgressCount > 0) {
    log('\n💡 Los workflows están ejecutándose. Revisa los resultados en unos minutos.', 'yellow');
  } else if (failureCount > 0) {
    log('\n⚠️ Hay workflows fallidos. Revisa los logs para más detalles.', 'yellow');
  } else {
    log('\n🎉 Todos los workflows están funcionando correctamente!', 'green');
  }
}

// Función principal
async function main() {
  try {
    await getWorkflowStatus();
  } catch (error) {
    log(`❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  main();
}

module.exports = { getWorkflowStatus };
