# Configuración de Secrets en GitHub

## 🔐 Secrets Requeridos

Necesitas crear los siguientes secrets en tu repositorio de GitHub:

### **1. Credenciales de Test**
- **Nombre**: `TEST_EMAIL`
- **Valor**: `nahueljaffe+testmishu@gmail.com`

- **Nombre**: `TEST_PASSWORD`  
- **Valor**: `Prueba1`

### **2. URL Base (Opcional)**
- **Nombre**: `BASE_URL`
- **Valor**: `https://mishu.co.il`

## 📋 Pasos para Configurar

### **1. Ir a GitHub Secrets**
1. Ve a tu repositorio en GitHub
2. Click en **Settings**
3. Click en **Secrets and variables** → **Actions**
4. Click en **New repository secret**

### **2. Crear cada Secret**
```
Nombre: TEST_EMAIL
Valor: nahueljaffe+testmishu@gmail.com

Nombre: TEST_PASSWORD
Valor: Prueba1

Nombre: BASE_URL
Valor: https://mishu.co.il
```

## ⚠️ Importante

- **NO** subas las credenciales al código
- **SÍ** úsalas como variables de entorno en GitHub Actions
- Las credenciales deben ser de una cuenta de **test/desarrollo**
- **NUNCA** uses credenciales de producción

## 🔧 Verificación

Después de configurar los secrets, puedes verificar que funcionan:
1. Ve a **Actions** en tu repo
2. Ejecuta cualquier workflow
3. En los logs deberías ver que los tests usan las credenciales correctas
