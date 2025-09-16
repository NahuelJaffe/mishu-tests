# 🔐 GitHub Secrets Configuration

## ⚠️ IMPORTANTE - SEGURIDAD

**ESTE REPOSITORIO ES PÚBLICO**. Nunca incluyas información sensible en el código fuente. Todas las credenciales deben estar en GitHub Secrets.

## Secrets Requeridos

Configura estos secrets en la configuración de tu repositorio de GitHub:

### Autenticación
- `TEST_EMAIL` - Email del usuario de prueba (NO usar credenciales reales de producción)
- `TEST_PASSWORD` - Contraseña del usuario de prueba (NO usar credenciales reales de producción)

### URLs de Aplicación
- `BASE_URL` - URL base de la aplicación (default: https://your-app.example.com/)

## How to Set Up Secrets

1. Go to your GitHub repository
2. Click on **Settings** tab
3. In the left sidebar, click **Secrets and variables** > **Actions**
4. Click **New repository secret**
5. Add each secret with its corresponding value

## Example Secrets

```
TEST_EMAIL=your-test-email@example.com
TEST_PASSWORD=your-secure-password
BASE_URL=https://your-app-url.com/
```

## Notas de Seguridad

- **NUNCA** commitees credenciales reales al repositorio
- Usa contraseñas fuertes y únicas para cuentas de prueba
- Rota regularmente las credenciales de prueba
- Usa URLs específicas del entorno para diferentes etapas de testing
- **ESTE REPOSITORIO ES PÚBLICO** - toda información sensible debe estar en secrets

## Local Development

For local development, create a `.env` file in the project root:

```bash
TEST_EMAIL=your-test-email@example.com
TEST_PASSWORD=your-secure-password
BASE_URL=https://your-app-url.com/
```

Add `.env` to your `.gitignore` file to prevent accidental commits.