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

## � **Cómo Actualizar Deploys**

### **🚀 Tipos de Actualizaciones**

#### **1. 📱 Updates Over-The-Air (OTA) - MÁS RÁPIDO**
Para cambios de código JavaScript/TypeScript (sin cambios nativos):

```bash
# Update para testing
npm run update:preview

# Update para producción
npm run update:prod

# Update con mensaje personalizado
eas update --branch preview --message "Nueva funcionalidad de tracking"
```

**✅ Casos de uso OTA:**
- Cambios en UI/UX y componentes React
- Corrección de bugs en JavaScript
- Cambios en colores/estilos (src/styles/colors.ts)
- Nuevas pantallas y navegación
- Lógica de negocio y APIs
- Configuración de .env (variables EXPO_PUBLIC_*)

#### **2. 🔨 Builds Completos - Para cambios nativos**
Cuando cambias configuración nativa o dependencias:

```bash
# Preview build (APK directo)
npm run build:preview

# Production build
npm run build:android  # Para Play Store
npm run build:ios      # Para App Store
```

**⚠️ Requiere build completo:**
- Nuevas dependencias nativas (react-native-*)
- Cambios en `app.json` (permisos, plugins, configuración)
- Nuevos plugins de Expo
- Cambios en `eas.json`
- Actualización de SDK de Expo

### **⚡ Workflow Recomendado para Updates**

#### **Desarrollo → Testing:**
```bash
# 1. Hacer cambios en código
# 2. Probar localmente
npm start

# 3. Update a preview para testing
npm run update:preview

# 4. Probar en dispositivo con build preview existente
```

#### **Testing → Producción:**
```bash
# 1. Verificar que todo funciona en preview
# 2. Update a producción
npm run update:prod

# 3. Usuarios existentes reciben update automáticamente
```

### **🎯 Script Interactivo de Updates**

```bash
# Usa el script automático que configura todo
npm run deploy
```

Este script incluye:
- ✅ Configuración automática de variables de entorno
- ✅ Opciones para updates OTA rápidos
- ✅ Builds completos cuando sea necesario
- ✅ Verificación de estado
- ✅ Monitoreo de deploys

### **⏱️ Tiempos de Deploy**

| Tipo de Update | Tiempo | Disponibilidad | Usuarios |
|----------------|--------|----------------|----------|
| **OTA Update** | 1-2 minutos | Inmediata en próximo launch | Automático |
| **Build Preview** | 5-15 minutos | Nuevo APK para descargar | Manual |
| **Build Production** | 5-15 minutos | Listo para tiendas | Tienda |

### **🔄 Comandos Específicos de Update**

#### **Updates Rápidos (OTA):**
```bash
# Update con mensaje descriptivo
eas update --branch preview --message "Fix: Corrección en colores de buses"

# Update inmediato sin mensaje
eas update --branch preview

# Rollback a versión anterior
eas update --branch preview --republish

# Ver historial de updates
eas update:list --branch preview
```

#### **Monitoreo de Updates:**
```bash
# Ver todos los updates desplegados
eas update:list

# Ver estado de builds
npm run build:status

# Ver logs de un build específico
eas build:view [BUILD_ID]

# Dashboard web completo
open https://expo.dev/accounts/edwardperxz/projects/busnow-app
```

### **📱 Experiencia del Usuario**

#### **Con OTA Updates:**
- ✅ **Automático**: Users reciben updates al abrir la app
- ✅ **Sin reinstalar**: La app se actualiza internamente
- ✅ **Inmediato**: Disponible en 1-2 minutos
- ✅ **Internet requerido**: Solo para descargar el update

#### **Con Builds Nuevos:**
- ⚠️ **Manual**: Users deben descargar nuevo APK
- ⚠️ **Reinstalar**: Preview builds requieren instalación
- ⚠️ **Play Store**: Production builds van a la tienda
- ✅ **Offline**: Una vez instalado, funciona sin internet

---

## �📈 **Updates Over-The-Air (OTA)**

```bash
# Update para preview
eas update --branch preview --message "Nueva funcionalidad de tracking"

# Update para production
eas update --branch production --message "Corrección de bugs críticos"
```

## 🔍 **Troubleshooting**

### **🔄 Problemas con Updates:**
```bash
# Update no aparece en dispositivo
eas update:list --branch preview  # Verificar que se desplegó

# Forzar descarga de update en app
# Cerrar app completamente y volver a abrir

# Verificar conexión de update
eas update:list --json | grep "preview"
```

### **🔨 Build Fallido:**
```bash
# Ver logs detallados
eas build:view [BUILD_ID]

# Limpiar cache y reintentar
eas build --platform android --profile preview --clear-cache

# Verificar configuración antes de build
npm run configure
eas project:info
```

### **⚙️ Variables de Entorno:**
```bash
# Verificar variables en EAS
eas env:list

# Verificar variables locales
cat .env | grep EXPO_PUBLIC

# Añadir variable a EAS
eas env:create VARIABLE_NAME

# Re-configurar app.json con variables
npm run configure
```

### **📱 Problemas de Instalación:**
```bash
# Android APK no instala
# 1. Habilitar "Instalar apps desconocidas" en Android
# 2. Descargar APK nuevo desde dashboard EAS
# 3. Limpiar cache de navegador si descarga falla

# iOS no instala
# 1. Verificar que dispositivo esté registrado en Apple Developer
# 2. Usar TestFlight para distribución
# 3. Verificar certificados de firma
```

### **🌐 Problemas de Red:**
```bash
# Update no se descarga
# Verificar conexión a internet del dispositivo
# Los OTA updates requieren internet solo para descarga inicial

# Build timeout
# Reintentar build, servidores EAS pueden estar ocupados
eas build --platform android --profile preview --clear-cache
```

## 📋 **Checklist Pre-Deploy**

- [ ] Tests locales pasando
- [ ] Variables de entorno configuradas
- [ ] Icons y splash screens actualizados
- [ ] Permisos verificados
- [ ] Bundle size optimizado
- [ ] Changelog actualizado
