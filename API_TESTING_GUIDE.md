# 🔌 Guía de Testing de APIs - WhatsApp Monitor

Esta guía te ayudará a hacer testing completo de las APIs de la aplicación WhatsApp Monitor.

## 🎯 **Objetivos del Testing de APIs**

- **Funcionalidad**: Verificar que las APIs funcionan correctamente
- **Seguridad**: Validar autenticación y autorización
- **Rendimiento**: Medir tiempos de respuesta
- **Compatibilidad**: Probar diferentes formatos de datos
- **Manejo de errores**: Verificar respuestas de error apropiadas

## 🛠️ **Herramientas Recomendadas**

### **1. Postman** (Recomendado)
- **Descarga**: https://www.postman.com/downloads/
- **Ventajas**: Interface gráfica, colecciones, variables, scripts
- **Uso**: Ideal para testing manual y automatizado

### **2. Insomnia**
- **Descarga**: https://insomnia.rest/download
- **Ventajas**: Interface limpia, fácil de usar
- **Uso**: Bueno para testing rápido

### **3. cURL** (Línea de comandos)
- **Ventajas**: Rápido, scriptable, disponible en todos los sistemas
- **Uso**: Para testing básico y scripts automatizados

### **4. HTTPie**
- **Descarga**: https://httpie.io/
- **Ventajas**: Sintaxis simple, colores, fácil de leer
- **Uso**: Alternativa moderna a cURL

## 🔍 **Identificación de APIs**

### **Método 1: Chrome DevTools**
1. **F12** → **Network**
2. **Hacer acciones** en la aplicación (login, navegar, etc.)
3. **Filtrar por XHR/Fetch**
4. **Identificar** endpoints de API

### **Método 2: Inspección de Código**
1. **Buscar** archivos JavaScript
2. **Buscar** patrones como `/api/`, `fetch()`, `axios`
3. **Identificar** URLs de endpoints

### **Método 3: Documentación**
1. **Revisar** documentación de la aplicación
2. **Buscar** endpoints documentados
3. **Verificar** versiones de API

## 📋 **APIs Probables a Testear**

Basándome en la aplicación WhatsApp Monitor, estas son las APIs que probablemente existan:

### **🔐 Autenticación**
```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
GET  /api/auth/me
```

### **👤 Usuario**
```
GET    /api/user/profile
PUT    /api/user/profile
POST   /api/user/change-password
DELETE /api/user/account
GET    /api/user/settings
PUT    /api/user/settings
```

### **📱 WhatsApp Connection**
```
GET    /api/whatsapp/connections
POST   /api/whatsapp/connections
GET    /api/whatsapp/connections/{id}
PUT    /api/whatsapp/connections/{id}
DELETE /api/whatsapp/connections/{id}
GET    /api/whatsapp/qr-code
POST   /api/whatsapp/connect
POST   /api/whatsapp/disconnect
```

### **💬 Mensajes**
```
GET    /api/messages
GET    /api/messages/{id}
POST   /api/messages/{id}/flag
DELETE /api/messages/{id}
GET    /api/conversations
GET    /api/conversations/{id}/messages
```

### **📊 Dashboard**
```
GET /api/dashboard/stats
GET /api/dashboard/recent-activity
GET /api/dashboard/connections-status
```

## 🧪 **Tests de API - Casos de Prueba**

### **TC-API-01: Login API**
```bash
# Test con credenciales válidas
curl -X POST https://mishu.co.il/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nahueljaffe+testmishu@gmail.com",
    "password": "Prueba1"
  }'

# Resultado esperado:
# Status: 200 OK
# Body: {"token": "...", "user": {...}, "expires": "..."}
```

### **TC-API-02: Login API - Credenciales Inválidas**
```bash
# Test con credenciales inválidas
curl -X POST https://mishu.co.il/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid@example.com",
    "password": "wrongpassword"
  }'

# Resultado esperado:
# Status: 401 Unauthorized
# Body: {"error": "Invalid credentials"}
```

### **TC-API-03: Obtener Perfil de Usuario**
```bash
# Test con token válido
curl -X GET https://mishu.co.il/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Resultado esperado:
# Status: 200 OK
# Body: {"id": "...", "email": "...", "name": "..."}
```

### **TC-API-04: Obtener Conexiones WhatsApp**
```bash
# Test con token válido
curl -X GET https://mishu.co.il/api/whatsapp/connections \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Resultado esperado:
# Status: 200 OK
# Body: {"connections": [...]}
```

### **TC-API-05: Obtener Código QR**
```bash
# Test con token válido
curl -X GET https://mishu.co.il/api/whatsapp/qr-code \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Resultado esperado:
# Status: 200 OK
# Body: {"qr_code": "data:image/png;base64,..."}
```

## 🔒 **Tests de Seguridad**

### **TC-SEC-01: Autenticación Requerida**
```bash
# Test sin token de autorización
curl -X GET https://mishu.co.il/api/user/profile

# Resultado esperado:
# Status: 401 Unauthorized
# Body: {"error": "Authentication required"}
```

### **TC-SEC-02: Token Inválido**
```bash
# Test con token inválido
curl -X GET https://mishu.co.il/api/user/profile \
  -H "Authorization: Bearer invalid_token"

# Resultado esperado:
# Status: 401 Unauthorized
# Body: {"error": "Invalid token"}
```

### **TC-SEC-03: Token Expirado**
```bash
# Test con token expirado
curl -X GET https://mishu.co.il/api/user/profile \
  -H "Authorization: Bearer expired_token"

# Resultado esperado:
# Status: 401 Unauthorized
# Body: {"error": "Token expired"}
```

### **TC-SEC-04: Rate Limiting**
```bash
# Test de rate limiting (hacer muchas requests rápidas)
for i in {1..100}; do
  curl -X GET https://mishu.co.il/api/user/profile \
    -H "Authorization: Bearer YOUR_TOKEN_HERE"
done

# Resultado esperado:
# Después de cierto número de requests:
# Status: 429 Too Many Requests
# Body: {"error": "Rate limit exceeded"}
```

## 📊 **Tests de Rendimiento**

### **TC-PERF-01: Tiempo de Respuesta**
```bash
# Test de tiempo de respuesta
curl -w "@curl-format.txt" -X GET https://mishu.co.il/api/user/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# curl-format.txt:
#      time_namelookup:  %{time_namelookup}\n
#         time_connect:  %{time_connect}\n
#      time_appconnect:  %{time_appconnect}\n
#     time_pretransfer:  %{time_pretransfer}\n
#        time_redirect:  %{time_redirect}\n
#   time_starttransfer:  %{time_starttransfer}\n
#                      ----------\n
#           time_total:  %{time_total}\n
```

### **TC-PERF-02: Carga Concurrente**
```bash
# Test de carga concurrente (usando Apache Bench)
ab -n 100 -c 10 -H "Authorization: Bearer YOUR_TOKEN_HERE" \
   https://mishu.co.il/api/user/profile
```

## 🧪 **Tests de Validación de Datos**

### **TC-VAL-01: Email Inválido**
```bash
# Test con email inválido
curl -X POST https://mishu.co.il/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "invalid-email",
    "password": "password123"
  }'

# Resultado esperado:
# Status: 400 Bad Request
# Body: {"error": "Invalid email format"}
```

### **TC-VAL-02: Campos Requeridos**
```bash
# Test sin campos requeridos
curl -X POST https://mishu.co.il/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{}'

# Resultado esperado:
# Status: 400 Bad Request
# Body: {"error": "Email and password are required"}
```

### **TC-VAL-03: Tipos de Datos**
```bash
# Test con tipos de datos incorrectos
curl -X POST https://mishu.co.il/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": 123,
    "password": true
  }'

# Resultado esperado:
# Status: 400 Bad Request
# Body: {"error": "Invalid data types"}
```

## 📝 **Colección de Postman**

### **Configuración de Variables**
```json
{
  "base_url": "https://mishu.co.il",
  "api_version": "v1",
  "test_email": "nahueljaffe+testmishu@gmail.com",
  "test_password": "Prueba1",
  "auth_token": ""
}
```

### **Script de Pre-request (Login)**
```javascript
// Script para obtener token automáticamente
pm.sendRequest({
    url: pm.variables.get("base_url") + "/api/auth/login",
    method: 'POST',
    header: {
        'Content-Type': 'application/json'
    },
    body: {
        mode: 'raw',
        raw: JSON.stringify({
            email: pm.variables.get("test_email"),
            password: pm.variables.get("test_password")
        })
    }
}, function (err, response) {
    if (response.json().token) {
        pm.variables.set("auth_token", response.json().token);
    }
});
```

### **Script de Test (Validación)**
```javascript
// Script para validar respuestas
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response time is less than 2000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(2000);
});

pm.test("Response has required fields", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('id');
    pm.expect(jsonData).to.have.property('email');
});
```

## 🔍 **Monitoreo y Logging**

### **Headers Importantes a Verificar**
```
Content-Type: application/json
Authorization: Bearer <token>
X-Request-ID: <unique-id>
X-Rate-Limit-Remaining: <number>
X-Rate-Limit-Reset: <timestamp>
```

### **Códigos de Estado HTTP**
```
200 OK - Éxito
201 Created - Recurso creado
400 Bad Request - Solicitud inválida
401 Unauthorized - No autenticado
403 Forbidden - No autorizado
404 Not Found - Recurso no encontrado
429 Too Many Requests - Rate limit
500 Internal Server Error - Error del servidor
```

## 📊 **Reporte de Testing**

### **Plantilla de Reporte**
```
API Test Report
================

Test: [Nombre del test]
Endpoint: [URL del endpoint]
Method: [GET/POST/PUT/DELETE]
Date: [Fecha]
Status: ✅ PASS / ❌ FAIL

Request:
- Headers: [Headers enviados]
- Body: [Body de la request]

Response:
- Status Code: [Código de respuesta]
- Headers: [Headers de respuesta]
- Body: [Body de respuesta]
- Response Time: [Tiempo en ms]

Issues Found:
- [Lista de problemas encontrados]

Recommendations:
- [Recomendaciones para mejorar]
```

## 🚀 **Automatización de Tests**

### **Script de Automatización (Node.js)**
```javascript
const axios = require('axios');

async function testAPI() {
    try {
        // Login
        const loginResponse = await axios.post('https://mishu.co.il/api/auth/login', {
            email: 'nahueljaffe+testmishu@gmail.com',
            password: 'Prueba1'
        });
        
        const token = loginResponse.data.token;
        
        // Test profile
        const profileResponse = await axios.get('https://mishu.co.il/api/user/profile', {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('✅ API Tests Passed');
    } catch (error) {
        console.log('❌ API Tests Failed:', error.message);
    }
}

testAPI();
```

## 🎯 **Checklist de Testing**

- [ ] **Autenticación** - Login, logout, refresh token
- [ ] **Autorización** - Permisos de usuario
- [ ] **Validación** - Campos requeridos, tipos de datos
- [ ] **Seguridad** - Rate limiting, CORS, HTTPS
- [ ] **Rendimiento** - Tiempos de respuesta
- [ ] **Manejo de errores** - Códigos de estado apropiados
- [ ] **Documentación** - Endpoints documentados
- [ ] **Versionado** - Compatibilidad de versiones

---

**¡Con esta guía podrás hacer un testing completo de APIs!** 🚀
