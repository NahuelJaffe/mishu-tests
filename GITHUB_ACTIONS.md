# GitHub Actions Setup para WhatsApp Monitor Tests

## 🚀 Configuración Completa

Este proyecto está configurado para ejecutar tests automatizados en GitHub Actions con soporte completo para Chrome, Firefox y Safari.

## 📋 Workflows Disponibles

### 1. **Test Individual por Navegador**
```yaml
# Ejecuta tests en cada navegador por separado
test:
  strategy:
    matrix:
      browser: [chromium, firefox, webkit]
```

### 2. **Test Completo Multi-Navegador**
```yaml
# Ejecuta todos los tests en todos los navegadores
test-all-browsers:
```

### 3. **Test por Módulos**
```yaml
# Ejecuta tests por módulo específico
test-specific-modules:
  strategy:
    matrix:
      module: [auth, connection, dashboard, security, ui, signup, profile, errors, notifications, help]
```

## 🎯 Cómo Usar

### **Ejecutar Tests Localmente**
```bash
# Instalar dependencias
npm install

# Instalar navegadores
npm run test:install-deps

# Ejecutar todos los tests
npm test

# Ejecutar por navegador específico
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Ejecutar por módulo
npm run test:auth
npm run test:connection
npm run test:dashboard
```

### **Ejecutar en GitHub Actions**

1. **Push a main/develop**: Se ejecutan automáticamente
2. **Pull Request**: Se ejecutan automáticamente
3. **Manual**: Ve a Actions → Playwright Tests → Run workflow

## 📊 Reportes y Artefactos

### **Reportes HTML**
- Se generan automáticamente después de cada ejecución
- Disponibles como artefactos descargables
- Incluyen screenshots, videos y traces de fallos

### **Artefactos Disponibles**
- `playwright-report-{browser}`: Reporte por navegador
- `playwright-report-all`: Reporte completo
- `test-results`: Resultados detallados

## 🔧 Configuración Avanzada

### **Variables de Entorno**
```yaml
env:
  CI: true  # Activa modo CI (más retries, timeouts optimizados)
```

### **Timeouts Configurados**
- **Test individual**: 60 minutos
- **Test completo**: 90 minutos
- **Action timeout**: 10 segundos
- **Navigation timeout**: 30 segundos

### **Navegadores Soportados**
- ✅ **Chrome** (Chromium) - Navegador principal
- ✅ **Firefox** - Navegador secundario  
- ✅ **Safari** (WebKit) - Testing WebKit
- ✅ **Mobile Chrome** (Pixel 5)
- ✅ **Mobile Safari** (iPhone 12)

## 📈 Monitoreo y Métricas

### **Indicadores de Éxito**
- ✅ Tests pasan en todos los navegadores
- ✅ Screenshots y videos capturados en fallos
- ✅ Reportes HTML generados
- ✅ Artefactos disponibles para descarga

### **Manejo de Fallos**
- **Retry automático**: 2 reintentos en CI
- **Screenshots**: Solo en fallos
- **Videos**: Solo en fallos
- **Traces**: Solo en primer retry

## 🛠️ Troubleshooting

### **Problemas Comunes**

1. **Timeout en CI**
   ```yaml
   # Aumentar timeout en workflow
   timeout-minutes: 120
   ```

2. **Navegador no se instala**
   ```bash
   # Instalar con dependencias del sistema
   npx playwright install --with-deps
   ```

3. **Tests fallan en Safari**
   ```javascript
   // Usar selectores más compatibles
   page.locator('text=Button Text') // En lugar de selectores CSS complejos
   ```

### **Logs y Debugging**
- **GitHub Actions logs**: Ve a la pestaña "Actions" en tu repo
- **Reportes HTML**: Descarga artefactos para análisis detallado
- **Traces**: Usa `npm run test:trace` para debugging local

## 🎯 Próximos Pasos

1. **Hacer push** del código a GitHub
2. **Verificar** que se ejecutan los workflows
3. **Revisar** reportes y artefactos
4. **Ajustar** configuración según necesidades
5. **Configurar** notificaciones (Slack, email, etc.)

## 📞 Soporte

Si tienes problemas con la configuración:
1. Revisa los logs de GitHub Actions
2. Verifica que las credenciales de test sean correctas
3. Asegúrate de que la aplicación esté accesible
4. Consulta la documentación de Playwright

---

**¡Los tests están listos para ejecutarse en GitHub Actions!** 🚀
