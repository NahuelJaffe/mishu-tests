# GitHub Secrets Update Guide

## Required Secrets

Para que los tests de Playwright funcionen correctamente en GitHub Actions, necesitas actualizar los siguientes secrets en tu repositorio:

### 1. TEST_EMAIL
- **Valor**: `[CONFIGURAR_EMAIL]`
- **Descripción**: Email de usuario para tests de autenticación

### 2. TEST_PASSWORD
- **Valor**: `[CONFIGURAR_PASSWORD]`
- **Descripción**: Contraseña para tests de autenticación

### 3. BASE_URL
- **Valor**: `https://mishu-web--pr67-faq-0n1j2wio.web.app/`
- **Descripción**: URL base de la aplicación para testing

## Cómo actualizar los secrets

1. Ve a tu repositorio en GitHub
2. Navega a **Settings** → **Secrets and variables** → **Actions**
3. Para cada secret:
   - Si ya existe: Haz clic en **Update** junto al nombre del secret
   - Si no existe: Haz clic en **New repository secret**
   - Ingresa el nombre exacto del secret (TEST_EMAIL, TEST_PASSWORD, BASE_URL)
   - Pega el valor correspondiente
   - Haz clic en **Add secret** o **Update secret**

## Verificación

Una vez actualizados los secrets, los workflows de GitHub Actions deberían:
- Instalar correctamente los navegadores de Playwright
- Ejecutar los tests con las credenciales correctas
- Conectarse a la URL base correcta
- Generar reportes de test exitosos

## Troubleshooting

Si los tests siguen fallando después de actualizar los secrets:
1. Verifica que los nombres de los secrets coincidan exactamente
2. Asegúrate de que no hay espacios extra en los valores
3. Revisa los logs de GitHub Actions para errores específicos
4. Confirma que la URL base esté accesible desde el entorno de CI
