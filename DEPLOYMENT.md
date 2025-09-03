# 🚀 Guía de Deployment EAS para BusNow

## 📱 **Builds Disponibles**

### **Preview Build (Testing)**
```bash
# Android APK para testing interno
eas build --platform android --profile preview

# iOS para testing (TestFlight)
eas build --platform ios --profile preview
```

### **Production Build**
```bash
# Android AAB para Google Play Store
eas build --platform android --profile production

# iOS para App Store
eas build --platform ios --profile production
```

## 🔧 **Configuración por Perfil**

### **Development**
- Cliente de desarrollo con hot reload
- Distribución interna solamente
- Debug mode habilitado

### **Preview** 
- APK para Android (fácil instalación)
- Distribución interna
- Datos de prueba habilitados

### **Production**
- Builds optimizados para tiendas
- Variables de entorno de producción
- Auto-incremento de versión

## 📊 **Monitoreo de Builds**

- **Dashboard EAS:** https://expo.dev/accounts/edwardperxz/projects/busnow-app
- **Estado de builds:** `eas build:list`
- **Logs de build:** `eas build:view [BUILD_ID]`

## 🔑 **Variables de Entorno**

### **Preview:**
- `EXPO_PUBLIC_MOCK_DATA=true`
- `EXPO_PUBLIC_DEBUG_MODE=true`

### **Production:**
- `EXPO_PUBLIC_API_BASE_URL=https://api.busnow.app`
- `EXPO_PUBLIC_WS_URL=wss://api.busnow.app`
- `EXPO_PUBLIC_MOCK_DATA=false`

## 📱 **Instalación de Builds**

### **Android Preview:**
1. Descargar APK desde EAS dashboard
2. Habilitar "Instalar apps desconocidas"
3. Instalar APK directamente

### **iOS Preview:**
1. Registrar dispositivo en Apple Developer
2. Descargar desde TestFlight
3. Instalar siguiendo instrucciones

## 🚢 **Submission a Tiendas**

### **Google Play Store:**
```bash
eas submit --platform android --profile production
```

### **Apple App Store:**
```bash
eas submit --platform ios --profile production
```

## 📈 **Updates Over-The-Air (OTA)**

```bash
# Update para preview
eas update --branch preview --message "Nueva funcionalidad de tracking"

# Update para production
eas update --branch production --message "Corrección de bugs críticos"
```

## 🔍 **Troubleshooting**

### **Build Fallido:**
```bash
# Ver logs detallados
eas build:view [BUILD_ID]

# Limpiar cache
eas build --platform android --profile preview --clear-cache
```

### **Variables de Entorno:**
```bash
# Verificar variables
eas env:list

# Añadir variable
eas env:create VARIABLE_NAME
```

## 📋 **Checklist Pre-Deploy**

- [ ] Tests locales pasando
- [ ] Variables de entorno configuradas
- [ ] Icons y splash screens actualizados
- [ ] Permisos verificados
- [ ] Bundle size optimizado
- [ ] Changelog actualizado
