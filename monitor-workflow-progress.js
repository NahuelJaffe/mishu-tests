#!/usr/bin/env node

const https = require('https');

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

function getStatusEmoji(status, conclusion) {
  if (conclusion === 'success') return '✅';
  if (conclusion === 'failure') return '❌';
  if (conclusion === 'cancelled') return '⏹️';
  if (conclusion === 'skipped') return '⏭️';
  if (status === 'in_progress') return '🔄';
  if (status === 'queued') return '⏳';
  if (status === 'completed') return '🏁';
  return '❓';
}

function getStatusColor(status, conclusion) {
  if (conclusion === 'success') return 'green';
  if (conclusion === 'failure') return 'red';
  if (conclusion === 'cancelled') return 'yellow';
  if (status === 'in_progress') return 'cyan';
  if (status === 'queued') return 'yellow';
  return 'white';
}

async function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const req = https.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
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

async function monitorWorkflowProgress() {
  console.log(colorize('🚀 MONITOREO DE PROGRESO - QA WORKFLOW CORREGIDO', 'bright'));
  console.log(colorize('=' .repeat(70), 'blue'));
  console.log();
  
  let checkCount = 0;
  
  while (true) {
    try {
      checkCount++;
      console.log(colorize(`📊 Verificación #${checkCount} - ${new Date().toLocaleTimeString()}`, 'cyan'));
      
      // Obtener información del repositorio
      const repoInfo = await makeRequest('https://api.github.com/repos/NahuelJaffe/mishu-tests');
      console.log(colorize(`📦 Repositorio: ${repoInfo.full_name}`, 'white'));
      console.log(colorize(`🔗 URL: ${repoInfo.html_url}`, 'blue'));
      console.log();
      
      // Obtener workflows
      const workflows = await makeRequest('https://api.github.com/repos/NahuelJaffe/mishu-tests/actions/workflows');
      const qaWorkflow = workflows.workflows.find(w => w.name === 'Complete QA Test Suite');
      
      if (qaWorkflow) {
        console.log(colorize(`🔄 Workflow QA: ${qaWorkflow.state}`, getStatusColor(qaWorkflow.state)));
        console.log(colorize(`📄 URL: ${qaWorkflow.html_url}`, 'blue'));
        console.log();
      }
      
      // Obtener runs recientes
      const runs = await makeRequest('https://api.github.com/repos/NahuelJaffe/mishu-tests/actions/runs?per_page=3');
      console.log(colorize('📈 Runs Recientes (últimos 3):', 'bright'));
      
      runs.workflow_runs.forEach((run, index) => {
        const emoji = getStatusEmoji(run.status, run.conclusion);
        const statusColor = getStatusColor(run.status, run.conclusion);
        const status = run.conclusion || run.status;
        
        console.log(colorize(`  ${emoji} ${run.name}`, statusColor));
        console.log(colorize(`     Estado: ${status}`, statusColor));
        console.log(colorize(`     Commit: ${run.head_commit.message.split('\n')[0]}`, 'white'));
        console.log(colorize(`     Fecha: ${new Date(run.created_at).toLocaleString()}`, 'white'));
        console.log(colorize(`     URL: ${run.html_url}`, 'blue'));
        
        // Mostrar información adicional si es el run más reciente
        if (index === 0) {
          const timeSinceStart = new Date() - new Date(run.created_at);
          const minutesRunning = Math.floor(timeSinceStart / 60000);
          console.log(colorize(`     ⏱️  Ejecutándose hace: ${minutesRunning} minutos`, 'yellow'));
          
          // Si el commit contiene "fix:" significa que es nuestro run corregido
          if (run.head_commit.message.includes('fix: Corregir errores críticos')) {
            console.log(colorize(`     🎯 ¡ESTE ES EL RUN CORREGIDO!`, 'bright'));
          }
        }
        console.log();
      });
      
      // Verificar si hay algún run en progreso
      const runningWorkflows = runs.workflow_runs.filter(run => 
        run.status === 'in_progress' || run.status === 'queued'
      );
      
      if (runningWorkflows.length > 0) {
        console.log(colorize(`🔄 ${runningWorkflows.length} workflow(s) ejecutándose...`, 'cyan'));
        console.log(colorize('⏳ Esperando 45 segundos para la próxima verificación...', 'yellow'));
        console.log(colorize('=' .repeat(70), 'blue'));
        console.log();
        
        await new Promise(resolve => setTimeout(resolve, 45000));
      } else {
        console.log(colorize('🏁 No hay workflows ejecutándose actualmente', 'green'));
        console.log(colorize('📋 Verificación completa. Monitoreo pausado.', 'yellow'));
        console.log(colorize('=' .repeat(70), 'blue'));
        break;
      }
      
    } catch (error) {
      console.log(colorize(`❌ Error en monitoreo: ${error.message}`, 'red'));
      console.log(colorize('⏳ Reintentando en 60 segundos...', 'yellow'));
      await new Promise(resolve => setTimeout(resolve, 60000));
    }
  }
  
  console.log(colorize('🎯 Monitoreo completado. Visita GitHub Actions para detalles:', 'bright'));
  console.log(colorize('https://github.com/NahuelJaffe/mishu-tests/actions', 'blue'));
  console.log();
  console.log(colorize('📊 RESUMEN DE CORRECCIONES APLICADAS:', 'bright'));
  console.log(colorize('✅ mockLogin más robusto con mejor manejo de errores', 'green'));
  console.log(colorize('✅ Analytics blocking corregido para no interferir navegación', 'green'));
  console.log(colorize('✅ Selectores CSS mejorados y más flexibles', 'green'));
  console.log(colorize('✅ Verificación de autenticación mejorada', 'green'));
  console.log(colorize('✅ Manejo graceful de errores en tests críticos', 'green'));
}

// Manejar interrupción
process.on('SIGINT', () => {
  console.log(colorize('\n🛑 Monitoreo interrumpido por el usuario', 'yellow'));
  console.log(colorize('📋 Para ver resultados, visita: https://github.com/NahuelJaffe/mishu-tests/actions', 'blue'));
  process.exit(0);
});

monitorWorkflowProgress().catch(console.error);
