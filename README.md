# Automated QA Tests

Este repositorio contiene tests automatizados de QA para una aplicación web usando Playwright.

## 🚀 Configuración Inicial

### Prerrequisitos
- Node.js 18+
- npm o yarn
- Git

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd mishu-tests

# Instalar dependencias
npm install

# Instalar browsers de Playwright
npx playwright install
```

## 🔐 Configuración de Secrets

Este proyecto usa variables de entorno para credenciales sensibles. **NUNCA** commits credenciales reales al repositorio.

### Variables de Entorno Requeridas

#### Para Desarrollo Local
Crea un archivo `.env.local` (no se commitea):
```bash
TEST_EMAIL=tu-email@ejemplo.com
TEST_PASSWORD=TuPasswordSeguro123!
BASE_URL=https://tu-app.ejemplo.com/
```

#### Para CI/CD (GitHub Actions)
Configura estos secrets en tu repositorio de GitHub:
- `TEST_EMAIL` - Email del usuario de prueba
- `TEST_PASSWORD` - Contraseña del usuario de prueba  
- `BASE_URL` - URL base de la aplicación

## 🧪 Ejecutar Tests

### Tests Básicos
```bash
# Ejecutar todos los tests
npm test

# Tests de smoke (básicos)
npm run test:smoke

# Tests con interfaz visual
npm run test:headed
```

### Tests Específicos
```bash
# Tests de accesibilidad de login
npx playwright test tests/whatsapp/login-accessibility.spec.js

# Tests de analytics blocking
npx playwright test tests/analytics-monitoring-test.spec.js

# Tests de un browser específico
npx playwright test --project=firefox
```

## 🔒 Seguridad

### ✅ Buenas Prácticas Implementadas
- **Analytics Blocking**: Todos los tests bloquean analytics automáticamente
- **Credenciales Seguras**: Variables de entorno para credenciales sensibles
- **URLs Genéricas**: URLs de ejemplo en lugar de URLs reales
- **Gitignore Completo**: Archivos sensibles excluidos del repositorio

### 🚫 Lo Que NO Debes Hacer
- ❌ Commitear credenciales reales
- ❌ Incluir URLs de producción en el código
- ❌ Subir archivos de configuración con datos sensibles
- ❌ Usar credenciales hardcodeadas en los tests

## 📊 Reportes

### Ver Reportes
```bash
# Abrir reporte HTML
npm run test:report

# Ver trace de un test fallido
npm run test:trace
```

### Limpiar Archivos Temporales
```bash
npm run test:clean
```

## 🛠️ Estructura del Proyecto

```
tests/
├── whatsapp/           # Tests de funcionalidad WhatsApp
├── auth/              # Tests de autenticación
├── api/               # Tests de API
├── analytics-*.spec.js # Tests de bloqueo de analytics
└── test-config.js     # Configuración centralizada
```

## 🔧 Configuración Avanzada

### Browsers Soportados
- **Chromium** (principal)
- **Firefox** (secundario)
- **WebKit/Safari** (testing)

### Configuración de CI
Los workflows de GitHub Actions están configurados para:
- Instalar dependencias automáticamente
- Ejecutar tests en múltiples browsers
- Generar reportes de resultados
- Bloquear analytics durante los tests

## 🐛 Troubleshooting

### Problemas Comunes

#### "No tests found"
```bash
# Verificar que los archivos .spec.js están en la ubicación correcta
ls tests/**/*.spec.js
```

#### "Analytics not blocked"
```bash
# Verificar que analytics-setup.js se está ejecutando
npx playwright test tests/analytics-monitoring-test.spec.js --project=chromium
```

#### "Login failed"
```bash
# Verificar que las credenciales están configuradas correctamente
echo $TEST_EMAIL
echo $BASE_URL
```

### Logs Detallados
```bash
# Ejecutar con logs detallados
DEBUG=pw:api npx playwright test
```

## 📝 Contribuir

1. Fork el repositorio
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -am 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

### Estándares de Código
- Usar `test-config.js` para configuración
- Incluir setup de analytics en todos los tests
- Documentar nuevos tests
- No incluir información sensible

## 🚀 GitHub Actions

El proyecto incluye workflows automatizados para testing continuo:

### Workflows Disponibles

1. **Smoke Tests** (`smoke-tests.yml`)
   - Tests básicos de funcionalidad
   - Monitoreo de analytics
   - Ejecuta en Chromium

2. **Analytics Blocking** (`analytics-blocking.yml`)
   - Verificación de bloqueo de analytics
   - Tests en Chromium, Firefox y WebKit
   - Asegura 0 analytics durante tests

3. **System Health** (`system-health.yml`)
   - Tests de salud del sistema
   - Tests de accesibilidad
   - Ejecuta en Firefox

### Verificar Estado de CI

```bash
# Verificar salud del sistema
npm run health:check

# Monitorear CI (requiere gh CLI)
npm run monitor:ci
```

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver `LICENSE` para más detalles.

---

**⚠️ IMPORTANTE**: Este repositorio es público. Nunca incluyas información sensible como credenciales, URLs de producción, o datos personales.