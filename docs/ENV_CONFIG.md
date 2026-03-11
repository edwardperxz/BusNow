# 🔧 Configuración de Variables de Entorno - BusNow

## 📋 **Sistema de Configuración Automática**

BusNow utiliza un sistema automático para manejar variables de entorno en `app.json`, permitiendo configuraciones flexibles para diferentes entornos.

## 🚀 **Uso Rápido**

```bash
# 1. Configurar variables en .env
cp .env.example .env
nano .env  # Editar con tus valores

# 2. Aplicar configuración automáticamente
npm run configure

# 3. El sistema se configura automáticamente antes de cualquier comando EAS
npm run build:preview
npm run deploy
```

## ⚙️ **Variables Disponibles**

### **📱 Project Configuration**
```env
# EAS Project ID (obligatorio)
EXPO_PUBLIC_PROJECT_ID=8c416071-7ede-4c04-ac94-bda93ae971ca
```

### **🗺️ Google Maps (opcional)**
```env
# API Keys de Google Maps
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=your_android_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=your_ios_key
```

### **🔥 Firebase (opcional)**
```env
# Firebase para push notifications
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_key
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project
```

### **🔧 Development**
```env
# Backend APIs
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000
EXPO_PUBLIC_WS_URL=ws://localhost:3001

# Debug settings
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_MOCK_DATA=true
```

## 🔄 **Funcionamiento Automático**

### **Script de Configuración (`configure-app.js`)**
- Lee variables de `.env`
- Actualiza `app.json` dinámicamente
- Hace backup automático
- Valida configuración

### **Hooks Automáticos en package.json**
```json
{
  "scripts": {
    "configure": "node configure-app.js",
    "preeas": "npm run configure"
  }
}
```

### **Integración con deploy.sh**
El script de deployment ejecuta automáticamente la configuración antes de cualquier build.

## 📁 **Archivos del Sistema**

### **`.env`** - Configuración activa
```env
# Tu configuración actual
EXPO_PUBLIC_PROJECT_ID=8c416071-7ede-4c04-ac94-bda93ae971ca
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=
# ... más variables
```

### **`.env.example`** - Plantilla
```env
# Plantilla para nuevos desarrolladores
EXPO_PUBLIC_PROJECT_ID=your_expo_project_id_here
# ... variables de ejemplo
```

### **`configure-app.js`** - Configurador automático
- Procesador de variables de entorno
- Validación de configuración
- Backup y recovery automático

## 🛠️ **Comandos Disponibles**

```bash
# Configurar manualmente
npm run configure

# Verificar configuración actual
eas project:info

# Build (configura automáticamente)
npm run build:preview

# Deploy completo (configura automáticamente)
npm run deploy

# Ver configuración actual de app.json
cat app.json | grep -A 5 "projectId"
```

## 🔍 **Troubleshooting**

### **Error: EXPO_PUBLIC_PROJECT_ID no definido**
```bash
# Verificar que .env existe
ls -la .env

# Verificar contenido
cat .env | grep PROJECT_ID

# Copiar desde ejemplo si no existe
cp .env.example .env
```

### **Error: Invalid UUID appId**
```bash
# Re-configurar con el ID correcto
npm run configure

# Verificar que se aplicó
eas project:info
```

### **Google Maps no funciona**
```bash
# Verificar que las API keys están configuradas
cat .env | grep GOOGLE_MAPS

# Re-configurar
npm run configure
```

## 📚 **Flujo de Trabajo**

### **1. Nuevo Desarrollador**
```bash
git clone ...
cd BusNow
npm install
cp .env.example .env
# Editar .env con valores reales
npm run configure
npm start
```

### **2. Build para Testing**
```bash
# El sistema configura automáticamente
npm run build:preview
```

### **3. Deployment a Producción**
```bash
# Actualizar variables para producción en .env
npm run deploy
```

## 🎯 **Ventajas del Sistema**

- ✅ **Automático**: Se ejecuta antes de cada comando EAS
- ✅ **Seguro**: Backup automático y recovery
- ✅ **Flexible**: Diferentes configuraciones por entorno
- ✅ **Simple**: Un solo comando para configurar todo
- ✅ **Validado**: Verificación de variables obligatorias

---

*💡 El sistema garantiza que `app.json` siempre esté sincronizado con tu configuración de `.env` antes de cualquier operación EAS.*
