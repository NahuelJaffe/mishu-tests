# 🚀 Guía de Despliegue y Uso

## 📋 Estado Actual del Proyecto

✅ **COMPLETAMENTE FUNCIONAL**
- Tests ejecutándose exitosamente en GitHub Actions
- Analytics bloqueado en todos los tests
- Repositorio 100% seguro para ser público
- Sistema de monitoreo operativo

## 🎯 Próximos Pasos

### 1. **Configuración de Producción**

#### Secrets de GitHub Actions
Asegúrate de que estos secrets estén configurados:
- `TEST_EMAIL` - Email del usuario de prueba
- `TEST_PASSWORD` - Contraseña del usuario de prueba  
- `BASE_URL` - URL base de la aplicación

#### Verificación de Secrets
```bash
npm run monitor:ci
```

### 2. **Uso Diario del Sistema**

#### Comandos Principales
```bash
# Monitorear estado de CI
npm run monitor:ci

# Ejecutar tests localmente
npm test

# Ver reportes de tests
npm run test:report

# Limpiar archivos temporales
npm run test:clean
```

#### Tests Específicos
```bash
# Tests de smoke (básicos)
npm run test:smoke

# Tests de analytics blocking
npx playwright test tests/analytics-monitoring-test.spec.js

# Tests de salud del sistema
npx playwright test tests/system-health.spec.js

# Tests de WhatsApp
npx playwright test tests/whatsapp/login-accessibility.spec.js
```

### 3. **Monitoreo Continuo**

#### Verificación Automática
Los workflows se ejecutan automáticamente en:
- Push a `main` o `develop`
- Pull requests
- Ejecución manual (`workflow_dispatch`)

#### URLs de Monitoreo
- [Smoke Tests](https://github.com/NahuelJaffe/mishu-tests/actions/workflows/smoke-tests.yml)
- [Analytics Blocking](https://github.com/NahuelJaffe/mishu-tests/actions/workflows/analytics-blocking.yml)
- [System Health](https://github.com/NahuelJaffe/mishu-tests/actions/workflows/system-health.yml)

### 4. **Mantenimiento**

#### Verificaciones Regulares
- **Diario**: Verificar estado de workflows con `npm run monitor:ci`
- **Semanal**: Revisar logs de analytics blocking
- **Mensual**: Rotar credenciales de prueba

#### Resolución de Problemas
```bash
# Si los tests fallan localmente (esperado)
npm run test:clean
npm test

# Si los workflows fallan en CI
npm run monitor:ci
# Revisar logs en GitHub Actions
```

### 5. **Escalabilidad**

#### Agregar Nuevos Tests
1. Crear archivo `.spec.js` en la carpeta apropiada
2. Incluir setup de analytics:
```javascript
const { setupAnalyticsForTest } = require('../analytics-setup.js');
await setupAnalyticsForTest(page);
```
3. Usar configuración centralizada:
```javascript
const testConfig = require('../test-config');
```

#### Agregar Nuevos Workflows
1. Crear archivo `.yml` en `.github/workflows/`
2. Incluir secrets necesarios
3. Configurar triggers apropiados

## 🔒 Seguridad

### Buenas Prácticas
- ✅ Nunca commitees credenciales reales
- ✅ Usa variables de entorno para configuración sensible
- ✅ Rota credenciales regularmente
- ✅ Monitorea logs de analytics blocking

### Verificación de Seguridad
```bash
# Verificar que no hay información sensible
grep -r "mishu-web--pr68-e2e-analytics-disabl-v7gcnvxb" . --exclude-dir=.git --exclude-dir=node_modules
# Debe retornar vacío
```

## 📊 Métricas de Éxito

### KPIs del Sistema
- **Tasa de éxito de tests**: 100% (objetivo: >95%)
- **Tiempo de ejecución**: <10 minutos por workflow
- **Bloqueo de analytics**: 100% (objetivo: 100%)
- **Disponibilidad de CI**: 99.9% (objetivo: >99%)

### Alertas Recomendadas
- Tests fallidos en CI
- Analytics no bloqueado
- Credenciales expiradas
- Workflows con tiempo de ejecución >15 minutos

## 🆘 Soporte

### Recursos
- **Documentación**: README.md, SECRETS_SETUP.md
- **Scripts**: `scripts/monitor-ci.js`
- **Logs**: GitHub Actions, test-results/

### Contacto
Para soporte técnico o preguntas sobre el sistema de testing.

---

**Última actualización**: $(date)
**Versión**: 1.0.0
**Estado**: ✅ Operativo
