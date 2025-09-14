# 🧪 Guía de Testing Manual - WhatsApp Monitor

Esta guía te ayudará a hacer pruebas manuales de la aplicación mientras esperamos los resultados de GitHub Actions.

## 📋 **Credenciales de Prueba**

```
Email: [CONFIGURAR_EMAIL]
Password: [CONFIGURAR_PASSWORD]
URL: [CONFIGURAR_BASE_URL]
```

## 🔍 **Tests de Autenticación**

### **TC-01: Login Válido**
1. **Navegar a**: [CONFIGURAR_BASE_URL]/login
2. **Verificar**: Página de login carga correctamente
3. **Ingresar email**: `[CONFIGURAR_EMAIL]`
4. **Ingresar password**: `[CONFIGURAR_PASSWORD]`
5. **Hacer clic**: Botón "Login" o "Submit"
6. **Verificar**: Redirección a `/connections` o `/dashboard`
7. **✅ Resultado esperado**: Login exitoso, URL cambia

### **TC-02: Login Inválido**
1. **Navegar a**: [CONFIGURAR_BASE_URL]/login
2. **Ingresar email**: `invalid@example.com`
3. **Ingresar password**: `wrongpassword`
4. **Hacer clic**: Botón "Login"
5. **Verificar**: Mensaje de error aparece
6. **✅ Resultado esperado**: Mensaje de error, permanece en login

### **TC-03: Recuperación de Contraseña**
1. **Navegar a**: [CONFIGURAR_BASE_URL]/login
2. **Buscar**: Enlace "Forgot your password?" o similar
3. **Hacer clic**: En el enlace
4. **Verificar**: Página de recuperación carga
5. **Ingresar email**: `[CONFIGURAR_EMAIL]`
6. **Hacer clic**: Botón "Send" o "Submit"
7. **✅ Resultado esperado**: Mensaje de confirmación

### **TC-04: Remember Me**
1. **Navegar a**: [CONFIGURAR_BASE_URL]/login
2. **Buscar**: Checkbox "Remember me"
3. **Marcar**: El checkbox (si existe)
4. **Hacer login**: Con credenciales válidas
5. **Cerrar navegador**: Completamente
6. **Abrir navegador**: Y navegar a [CONFIGURAR_BASE_URL]
7. **✅ Resultado esperado**: Sesión mantenida, no redirige a login

## 🔗 **Tests de Conexión WhatsApp**

### **TC-13: Código QR**
1. **Hacer login** con credenciales válidas
2. **Verificar**: Redirección a `/connections`
3. **Buscar**: Código QR o elemento de conexión
4. **Verificar**: Código QR es visible
5. **Buscar**: Instrucciones de escaneo
6. **✅ Resultado esperado**: QR visible, instrucciones presentes

### **TC-14: Estado de Conexión**
1. **Hacer login** con credenciales válidas
2. **Navegar a**: `/connections`
3. **Buscar**: Indicador de estado de conexión
4. **Verificar**: Estado visible (conectado/desconectado)
5. **✅ Resultado esperado**: Estado de conexión visible

### **TC-15: Múltiples Conexiones**
1. **Hacer login** con credenciales válidas
2. **Navegar a**: `/connections`
3. **Buscar**: Botón "Add connection" o "Add WhatsApp"
4. **Si existe**: Hacer clic
5. **Verificar**: Página de nueva conexión
6. **✅ Resultado esperado**: Funcionalidad de múltiples conexiones

## 🎨 **Tests de UI y Responsividad**

### **TC-25: Diseño Responsivo**
1. **Abrir**: Cualquier página de la aplicación
2. **Redimensionar ventana**: A diferentes tamaños
3. **Verificar**: Elementos se adaptan correctamente
4. **Probar**: 320px, 768px, 1024px, 1920px
5. **✅ Resultado esperado**: Layout se adapta sin problemas

### **TC-26: Cambio de Idioma**
1. **Buscar**: Selector de idioma o banderas
2. **Cambiar idioma**: Si está disponible
3. **Verificar**: Textos cambian al nuevo idioma
4. **✅ Resultado esperado**: Interfaz en idioma seleccionado

### **TC-27: Modo Oscuro/Claro**
1. **Buscar**: Toggle de modo oscuro/claro
2. **Cambiar modo**: Si está disponible
3. **Verificar**: Colores cambian
4. **✅ Resultado esperado**: Modo visual cambia

## 📱 **Tests de Navegación**

### **TC-11: Menú de Navegación**
1. **Hacer login** con credenciales válidas
2. **Buscar**: Menú de navegación o sidebar
3. **Hacer clic**: En diferentes opciones del menú
4. **Verificar**: Navegación funciona correctamente
5. **✅ Resultado esperado**: Navegación fluida

### **TC-12: Acciones Rápidas**
1. **Hacer login** con credenciales válidas
2. **Buscar**: Botones de acciones rápidas
3. **Hacer clic**: En diferentes acciones
4. **Verificar**: Acciones ejecutan correctamente
5. **✅ Resultado esperado**: Funcionalidad de acciones rápidas

## 🔒 **Tests de Seguridad**

### **TC-33: Gestión de Sesión**
1. **Hacer login** con credenciales válidas
2. **Esperar**: 30 minutos de inactividad
3. **Intentar acción**: Cualquier acción en la app
4. **Verificar**: Redirección a login por sesión expirada
5. **✅ Resultado esperado**: Sesión expira correctamente

### **TC-34: Encriptación de Datos**
1. **Verificar**: URL comienza con `https://`
2. **Verificar**: Certificado SSL válido (candado verde)
3. **Inspeccionar**: Formularios tienen `action="https://..."`
4. **✅ Resultado esperado**: Conexión segura HTTPS

### **TC-36: Logout**
1. **Hacer login** con credenciales válidas
2. **Buscar**: Menú de usuario o avatar
3. **Hacer clic**: Opción "Logout" o "Sign out"
4. **Verificar**: Redirección a página de login
5. **✅ Resultado esperado**: Logout exitoso

## 📊 **Tests de Mensajes**

### **TC-17: Visualización de Mensajes**
1. **Hacer login** con credenciales válidas
2. **Navegar a**: Sección de mensajes
3. **Verificar**: Mensajes se muestran correctamente
4. **Buscar**: Estado vacío si no hay mensajes
5. **✅ Resultado esperado**: Mensajes o estado vacío visible

### **TC-18: Agrupación de Mensajes**
1. **Navegar a**: Sección de mensajes
2. **Verificar**: Mensajes agrupados por conversación
3. **Hacer clic**: En diferentes conversaciones
4. **✅ Resultado esperado**: Agrupación funciona

## 🛠️ **Herramientas de Testing**

### **Chrome DevTools**
1. **F12** para abrir DevTools
2. **Console**: Para ver errores JavaScript
3. **Network**: Para verificar requests
4. **Elements**: Para inspeccionar HTML

### **Verificación de Responsividad**
1. **F12** → **Toggle device toolbar**
2. **Seleccionar dispositivos**: iPhone, iPad, Desktop
3. **Verificar**: Layout se adapta

### **Verificación de Accesibilidad**
1. **F12** → **Lighthouse**
2. **Generar reporte**: De accesibilidad
3. **Revisar**: Puntuación y recomendaciones

## 📝 **Plantilla de Reporte**

```
Test: [Nombre del test]
Fecha: [Fecha]
Navegador: [Chrome/Firefox/Safari]
Resultado: ✅ PASÓ / ❌ FALLÓ
Observaciones: [Detalles del resultado]
Screenshots: [Si es necesario]
```

## 🚨 **Errores Comunes a Reportar**

- **404**: Página no encontrada
- **500**: Error del servidor
- **Timeout**: Tiempo de espera agotado
- **JavaScript errors**: Errores en consola
- **Layout breaks**: Problemas de diseño
- **Slow loading**: Carga lenta

## 📞 **Soporte**

Si encuentras errores críticos:
1. **Screenshot** del error
2. **Pasos para reproducir**
3. **Navegador y versión**
4. **Mensaje de error** (si hay)

---

**¡Recuerda documentar todo lo que encuentres para mejorar los tests automatizados!** 🚀
