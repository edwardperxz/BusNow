# ⚡ Comandos Rápidos EAS - BusNow

## 🚀 **Quick Start**

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Estado del proyecto
eas project:info
```

## 🔨 **Builds**

```bash
# Build de preview (APK directo)
npm run build:preview

# Build de producción
npm run build:android    # Android para Play Store
npm run build:ios        # iOS para App Store

# Ver estado de builds
npm run build:status

# Ver logs de un build específico
eas build:view [BUILD_ID]
```

## 📱 **Profiles Disponibles**

### **Preview**
- ✅ APK directo para Android
- ✅ Distribución interna
- ✅ Datos de prueba habilitados
- ✅ Fácil instalación para testing

### **Production**
- ✅ Optimizado para tiendas
- ✅ Variables de entorno de producción
- ✅ Auto-incremento de versión
- ✅ Bundle optimizado

### **Development**
- ✅ Development client
- ✅ Hot reload habilitado
- ✅ Debug mode
- ✅ Distribución interna

## 📤 **Updates Over-The-Air**

```bash
# Update de preview
npm run update:preview

# Update de producción
npm run update:prod

# Update con mensaje personalizado
eas update --branch preview --message "Nueva funcionalidad de mapas"
```

## 🏪 **Submission a Tiendas**

```bash
# Google Play Store
npm run submit:android

# Apple App Store  
npm run submit:ios

# Envío manual
eas submit --platform android --profile production
```

## 🔍 **Monitoring & Debug**

```bash
# Lista de builds
eas build:list

# Detalles de un build
eas build:view [BUILD_ID]

# Cancelar build
eas build:cancel [BUILD_ID]

# Variables de entorno
eas env:list
eas env:create VARIABLE_NAME

# Credenciales
eas credentials
```

## 📊 **URLs Útiles**

- **Dashboard:** https://expo.dev/accounts/edwardperxz/projects/busnow-app
- **Builds:** https://expo.dev/accounts/edwardperxz/projects/busnow-app/builds
- **Updates:** https://expo.dev/accounts/edwardperxz/projects/busnow-app/updates

## 🛠️ **Troubleshooting**

```bash
# Limpiar cache de build
eas build --platform android --profile preview --clear-cache

# Re-configurar proyecto
eas build:configure

# Verificar configuración
eas config

# Debug de variables de entorno
eas env:list --environment preview
```

## 📋 **Workflow Típico**

1. **Desarrollo:** Usar `expo start`
2. **Testing:** `npm run build:preview` → Descargar APK → Probar
3. **Updates:** `npm run update:preview` → Verificar → `npm run update:prod`
4. **Release:** `npm run build:android` → `npm run submit:android`

## 🎯 **Script Interactivo**

```bash
# Script con menú interactivo
npm run deploy

# O directamente
./deploy.sh
```

---

*💡 Tip: Usa `npm run build:preview` para pruebas rápidas y `npm run update:preview` para cambios menores sin rebuild completo.*
