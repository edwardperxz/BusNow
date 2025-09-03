# 🚌 BusNow - Sistema de Tracking de Buses en Tiempo Real

> **Una aplicación móvil multiplataforma para el seguimiento de transporte público en tiempo real, desarrollada con React Native y Expo.**

## � **Descripción del Proyecto**

BusNow es una solución integral para el monitoreo y seguimiento de buses de transporte público en tiempo real. La aplicación permite a los usuarios visualizar la ubicación exacta de los buses, conocer tiempos de llegada estimados, recibir notificaciones push y navegar rutas de manera interactiva.

### 🎯 **Problema que Resuelve:**
- **Incertidumbre en tiempos de espera** del transporte público
- **Falta de información en tiempo real** sobre ubicación de buses
- **Planificación ineficiente** de viajes en transporte público
- **Comunicación deficiente** entre operadores y usuarios

### 💡 **Solución Propuesta:**
- **Tracking GPS en tiempo real** de toda la flota de buses
- **Estimaciones precisas** de tiempos de llegada usando algoritmos predictivos
- **Notificaciones inteligentes** para alertas y actualizaciones de servicio
- **Interfaz intuitiva** con mapas interactivos y navegación sencilla

---

## 🚀 **Guía de Instalación para Colaboradores**

### **📋 Prerrequisitos**

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js (v18 o superior)**
   ```bash
   # Verificar instalación
   node --version
   npm --version
   ```

2. **Git**
   ```bash
   # Verificar instalación
   git --version
   ```

3. **Expo CLI** (Opcional, pero recomendado)
   ```bash
   npm install -g @expo/cli
   ```

4. **Para desarrollo móvil:**
   - **Android:** Android Studio + Android SDK
   - **iOS:** Xcode (solo en macOS)
   - **Alternativa:** Expo Go app en tu dispositivo móvil

### **⚡ Instalación Rápida**

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/edwardperxz/BusNow.git
   cd BusNow
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   # Copiar archivo de configuración
   cp .env.example .env
   
   # Editar .env con tus configuraciones
   nano .env  # o usar tu editor preferido
   ```

4. **Iniciar el proyecto:**
   ```bash
   npm start
   ```

### **🔧 Configuración del Entorno de Desarrollo**

#### **Variables de Entorno (.env)**
```env
# API Configuration
EXPO_PUBLIC_API_BASE_URL=http://localhost:3000/api
EXPO_PUBLIC_WS_URL=ws://localhost:3000

# Project Settings
EXPO_PUBLIC_PROJECT_ID=busnow-dev
EXPO_PUBLIC_DEBUG_MODE=true

# Mock Data (para desarrollo)
EXPO_PUBLIC_MOCK_DATA=true

# Location Settings
EXPO_PUBLIC_LOCATION_UPDATE_INTERVAL=5000
EXPO_PUBLIC_LOCATION_ACCURACY_THRESHOLD=10
```

#### **Google Maps API (Opcional)**
Para usar mapas reales en lugar de simulados:
1. Obtener API Key de [Google Cloud Console](https://console.cloud.google.com/)
2. Actualizar `app.json`:
   ```json
   "android": {
     "config": {
       "googleMaps": {
         "apiKey": "TU_ANDROID_API_KEY"
       }
     }
   },
   "ios": {
     "config": {
       "googleMapsApiKey": "TU_IOS_API_KEY"
     }
   }
   ```

---

## 🏃‍♂️ **Comandos de Desarrollo**

### **Iniciar Desarrollo:**
```bash
# Desarrollo general (muestra opciones)
npm start

# Desarrollo web (recomendado para pruebas rápidas)
npm run web

# Desarrollo Android
npm run android

# Desarrollo iOS
npm run ios

# Desarrollo con túnel (para dispositivos externos)
npm run preview
```

### **Compilación:**
```bash
# Compilar para Android
npm run build:android

# Compilar para iOS
npm run build:ios
```

### **Limpieza de Cache:**
```bash
# Limpiar cache de Expo
npx expo start --clear

# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

---

## 🛠️ **Tech Stack**

### **Frontend & Móvil**
- **React Native 0.79.5** - Framework multiplataforma
- **Expo SDK 53** - Herramientas de desarrollo y deploy
- **TypeScript 5.8.3** - Tipado estático
- **React Navigation 7.x** - Navegación entre pantallas
- **React Native Maps** - Mapas interactivos

### **Estado Global & Datos**
- **Redux Toolkit 2.9.0** - Gestión de estado
- **React Redux 9.2.0** - Conexión React-Redux
- **Axios 1.11.0** - Cliente HTTP para APIs

### **Servicios Nativos**
- **Expo Location** - Servicios de geolocalización
- **Expo Notifications** - Notificaciones push
- **Expo Device** - Información del dispositivo

### **Herramientas de Desarrollo**
- **Babel** - Transpilación de código
- **Metro** - Bundler de React Native
- **TypeScript** - Desarrollo tipado

### 🎯 **Funcionalidades Implementadas:**

✅ **Tracking en tiempo real de buses**
- WebSocket para actualizaciones en vivo
- Seguimiento de ubicación, velocidad y estado
- Actualización automática cada 5 segundos

✅ **Mapa interactivo**
- Google Maps con marcadores animados
- Trazado de rutas en carreteras reales
- Ubicación del usuario en tiempo real
- Paradas de bus con información detallada

✅ **Notificaciones push**
- Alertas de llegada de buses
- Notificaciones de servicios
- Configuración personalizable

✅ **Estimación de tiempo de llegada**
- Cálculos en tiempo real
- Algoritmos de predicción
- Confiabilidad de estimaciones

✅ **Rutas y horarios**
- Base de datos de rutas
- Horarios de operación
- Frecuencia de buses

✅ **Soporte iOS y Android**
- Expo con compilación nativa
- Permisos de ubicación
- Optimización para ambas plataformas

---

## 🚀 **CÓMO EJECUTAR LA APP:**

### **1. Ejecutar en Navegador Web (Más Rápido):**
```bash
npm run web
```

### **2. Ejecutar en Android:**
```bash
npm run android
```

### **3. Ejecutar en iOS:**
```bash
npm run ios
```

### **4. Compilar APK para Distribución:**
```bash
npm run build:android
```

---

## 🏗️ **Arquitectura del Proyecto:**

```
BusNow/
├── src/
│   ├── components/         # Componentes reutilizables
│   │   ├── MapComponent.tsx      # Mapa principal con Google Maps
│   │   ├── BusMarker.tsx         # Marcadores de buses animados
│   │   └── RouteSelector.tsx     # Selector de rutas
│   │
│   ├── screens/           # Pantallas principales
│   │   ├── HomeScreen.tsx        # Pantalla de inicio
│   │   └── MapScreen.tsx         # Pantalla del mapa
│   │
│   ├── services/          # Servicios de backend
│   │   ├── apiService.ts         # API REST y WebSocket
│   │   ├── locationService.ts    # Servicios de geolocalización
│   │   └── notificationService.ts # Notificaciones push
│   │
│   ├── store/             # Estado global Redux
│   │   ├── index.ts              # Configuración del store
│   │   ├── trackingSlice.ts      # Estado de tracking
│   │   ├── notificationSlice.ts  # Estado de notificaciones
│   │   └── settingsSlice.ts      # Configuraciones
│   │
│   ├── types/             # Tipos TypeScript
│   │   └── index.ts              # Definiciones de datos
│   │
│   └── utils/             # Utilidades
│
├── App.tsx                # Componente principal
├── package.json           # Dependencias
├── app.json              # Configuración Expo
└── tsconfig.json         # Configuración TypeScript
```

---

## 🔧 **Tecnologías Utilizadas:**

- **React Native + Expo** - Framework multiplataforma
- **TypeScript** - Tipado estático
- **Redux Toolkit** - Gestión de estado
- **React Navigation** - Navegación entre pantallas
- **Google Maps** - Mapas interactivos
- **WebSocket** - Comunicación en tiempo real
- **Expo Location** - Servicios de geolocalización
- **Expo Notifications** - Notificaciones push

---

## 🌟 **Características Destacadas:**

### **📍 Mapa Interactivo:**
- Visualización de rutas completas
- Buses en movimiento en tiempo real
- Paradas con información detallada
- Ubicación del usuario siempre visible

### **🚌 Tracking Avanzado:**
- Estado de cada bus (activo, inactivo, mantenimiento)
- Información de capacidad (ocupación)
- Velocidad y dirección en tiempo real
- Historial de ubicaciones

### **⏰ Estimaciones Precisas:**
- Algoritmos de predicción de llegada
- Consideración de tráfico y condiciones
- Confiabilidad de las estimaciones
- Notificaciones de retrasos

---

## ⚙️ **Arquitectura del Sistema**

### **🏗️ Estructura del Proyecto:**

```
BusNow/
├── � src/
│   ├── components/              # Componentes reutilizables
│   │   ├── MapComponent.tsx          # Mapa principal con Google Maps
│   │   ├── BusMarker.tsx             # Marcadores de buses animados  
│   │   └── RouteSelector.tsx         # Selector de rutas
│   │
│   ├── screens/                # Pantallas principales
│   │   ├── HomeScreen.tsx            # Dashboard principal con estadísticas
│   │   └── MapScreen.tsx             # Pantalla del mapa interactivo
│   │
│   ├── services/               # Servicios y APIs
│   │   ├── apiService.ts             # Cliente HTTP y WebSocket
│   │   ├── locationService.ts        # Servicios de geolocalización
│   │   └── notificationService.ts    # Gestión de notificaciones
│   │
│   ├── store/                  # Estado global Redux
│   │   ├── index.ts                  # Configuración del store
│   │   ├── trackingSlice.ts          # Estado de tracking de buses
│   │   ├── notificationSlice.ts      # Estado de notificaciones
│   │   └── settingsSlice.ts          # Configuraciones de usuario
│   │
│   ├── styles/                 # Estilos y temas
│   │   └── colors.ts                 # Sistema de colores centralizado
│   │
│   ├── types/                  # Definiciones TypeScript
│   │   └── index.ts                  # Interfaces y tipos
│   │
│   └── utils/                  # Utilidades y helpers
│       ├── dateUtils.ts              # Funciones de fecha/hora
│       ├── locationUtils.ts          # Cálculos geográficos
│       └── formatUtils.ts            # Formateo de datos
│
├── 📄 assets/                   # Recursos estáticos
│   ├── images/                       # Imágenes e iconos
│   └── fonts/                        # Fuentes personalizadas
│
├── 🔧 Configuración:
│   ├── App.tsx                       # Componente raíz
│   ├── index.js                      # Punto de entrada
│   ├── app.json                      # Configuración Expo
│   ├── babel.config.js               # Configuración Babel
│   ├── metro.config.js               # Configuración Metro
│   ├── tsconfig.json                 # Configuración TypeScript
│   ├── package.json                  # Dependencias y scripts
│   └── .env                          # Variables de entorno
```

### **� Flujo de Datos:**

```
Usuario ← → UI (React Native) ← → Redux Store ← → Services ← → APIs
                    ↓                    ↓              ↓
              Componentes         Estado Global    WebSocket/HTTP
                    ↓                    ↓              ↓
               Navegación         Actualizaciones   Datos Tiempo Real
```

### **📡 Arquitectura de Comunicación:**

1. **HTTP/REST API** - Operaciones CRUD y configuración inicial
2. **WebSocket** - Actualizaciones en tiempo real de posiciones
3. **Push Notifications** - Alertas y notificaciones del sistema
4. **Local Storage** - Cache de datos y configuraciones offline

---

## 🎯 **Funcionalidades Implementadas**

### ✅ **Core Features:**

#### **🚌 Tracking en Tiempo Real**
- **WebSocket** para actualizaciones cada 5 segundos
- **Seguimiento GPS** de ubicación, velocidad y estado
- **Estados de bus**: Activo, Inactivo, Mantenimiento, Retrasado
- **Capacidad en tiempo real**: Ocupación de asientos

#### **🗺️ Mapa Interactivo**
- **Google Maps** integrado con marcadores animados
- **Trazado de rutas** en carreteras reales
- **Ubicación del usuario** con permisos de geolocalización
- **Paradas de bus** con información detallada

#### **📱 Notificaciones Push**
- **Alertas de llegada** personalizables por ruta
- **Notificaciones de servicio** (interrupciones, cambios)
- **Configuración granular** por usuario

#### **⏰ Estimación de Tiempo de Llegada (ETA)**
- **Algoritmos predictivos** basados en históricos
- **Consideración de tráfico** y condiciones en tiempo real
- **Confiabilidad de estimaciones** con métricas de precisión

#### **🛣️ Rutas y Horarios**
- **Base de datos** de rutas completas
- **Horarios de operación** con frecuencias
- **Planificación de viajes** con rutas sugeridas

### ✅ **Technical Features:**

#### **📱 Multiplataforma**
- **iOS y Android** con código compartido
- **Web responsive** para administración
- **Expo managed workflow** para desarrollo ágil

#### **🔒 Seguridad y Rendimiento**
- **Validación TypeScript** en tiempo de desarrollo
- **Manejo de errores** robusto con fallbacks
- **Optimización de bundle** para carga rápida
- **Cache inteligente** para funcionalidad offline

---

## 🧪 **Datos de Prueba Incluidos (temporales)**

### **🚍 Rutas Simuladas:**
```
Línea 1 - Centro: Plaza Mayor → Universidad → Hospital → Centro Comercial
Línea 2 - Norte: Terminal Norte → Estadio → Centro → Universidad
Línea 3 - Sur: Aeropuerto → Centro → Zona Industrial
```

### **🚌 Buses Activos:**
- **6 buses simulados** con movimiento automático
- **Estados variables**: 4 activos, 1 en mantenimiento, 1 retrasado
- **Capacidades dinámicas**: 20-95% ocupación simulada
- **Rutas asignadas** con horarios realistas

### **📍 Paradas Configuradas:**
```
- Plaza Mayor (Centro): Lat: -12.0464, Lng: -77.0428
- Universidad (Norte): Lat: -12.0464, Lng: -77.0428  
- Terminal Norte: Lat: -12.0264, Lng: -77.0528
- Centro Comercial: Lat: -12.0664, Lng: -77.0328
- Hospital Central: Lat: -12.0564, Lng: -77.0228
```

---

## 🔑 **Configuración Avanzada**


### **🚀 Deployment:**
```bash
# Configurar EAS Build
npm install -g eas-cli
eas login
eas build:configure

# Build para tiendas
eas build --platform android --profile production
eas build --platform ios --profile production

# Publicar actualizaciones OTA
eas update --branch production --message "Nueva actualización"
```

---

## 🤝 **Contribución**

### **📝 Proceso de Desarrollo:**

1. **Fork** del repositorio
2. **Crear rama** para nueva feature: `git checkout -b feature/nueva-funcionalidad`
3. **Desarrollar** siguiendo las convenciones del proyecto
4. **Probar** en múltiples plataformas
5. **Commit** con mensajes descriptivos
6. **Push** y crear **Pull Request**

### **🎨 Convenciones de Código:**

- **TypeScript** obligatorio para todos los archivos
- **Nombres descriptivos** para variables y funciones
- **Comentarios JSDoc** para funciones públicas
- **Imports organizados** por tipo (terceros, relativos, tipos)
- **Componentes funcionales** con hooks

### **🧪 Testing:**

```bash
# Ejecutar en dispositivo físico
npm run android  # o npm run ios

# Probar en web para desarrollo rápido  
npm run web

# Verificar builds de producción
npm run build:android
```

---

## 📚 **Recursos y Documentación**

- **[Expo Documentation](https://docs.expo.dev/)**
- **[React Native Docs](https://reactnative.dev/docs/getting-started)**
- **[Redux Toolkit Guide](https://redux-toolkit.js.org/)**
- **[React Navigation Docs](https://reactnavigation.org/docs/getting-started)**
- **[Google Maps API](https://developers.google.com/maps/documentation)**

---

## 🎉 **¡Empezar a Desarrollar!**

```bash
# Clonar e instalar
git clone https://github.com/edwardperxz/BusNow.git
cd BusNow
npm install

# Iniciar desarrollo
npm run web  # ← ¡Más rápido para empezar!
```

**🌐 Web:** http://localhost:8081  
**📱 Mobile:** Escanea QR con Expo Go  
**🎨 Colores:** Ver `PALETA_COLORES.md`

---

*Desarrollado por Zeteki*
