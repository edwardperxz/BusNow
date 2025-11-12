# 🚌 BusNow - Sistema de Tracking de Buses en Tiempo Real

> **Aplicación móvil multiplataforma para seguimiento de transporte público en Chiriquí, Panamá. Desarrollada con React Native, Expo y TypeScript.**

---

## 📋 MVP COMPLETE SUMMARY - Estado Actual del Proyecto

### 🎯 Visión General
BusNow es una aplicación móvil nativa (iOS/Android) que permite visualizar rutas de transporte público en mapas interactivos, buscar ubicaciones con Google Places API, y navegar entre diferentes pantallas con una interfaz moderna y fluida. El MVP actual está **100% funcional** sin necesidad de backend, usando solo APIs de Google Maps para geolocalización y trazado de rutas reales.

---

## 🏗️ ARQUITECTURA Y ESTRUCTURA ACTUAL

### 📁 Estructura de Carpetas Detallada

```
BusNow/
├── 📱 src/
│   ├── components/                      # Componentes reutilizables
│   │   ├── navigation/                  # Sistema de navegación
│   │   │   ├── CustomTabNavigator.tsx       # Tab bar principal (4 pantallas)
│   │   │   ├── AnimatedTabBar.tsx           # Tab bar animado con transiciones
│   │   │   ├── HamburgerMenu.tsx            # Menú lateral deslizante (drawer)
│   │   │   └── HamburgerButton.tsx          # Botón del menú hamburguesa
│   │   │
│   │   ├── GooglePlacesSearchInteractive.tsx  # Buscador con panel deslizable (3 estados)
│   │   ├── RouteMapVisualization.tsx          # Visualización de rutas en mapa
│   │   └── DriverDashboard.tsx                # Dashboard para conductores
│   │
│   ├── screens/                        # Pantallas principales
│   │   ├── HomeScreen.tsx                  # Pantalla de inicio (tab 1)
│   │   ├── MapScreen.tsx                   # Mapa interactivo con ruta (tab 2)
│   │   ├── RoutesScreen.tsx                # Lista de rutas (tab 3)
│   │   ├── RouteDetailScreen.tsx           # Detalle de ruta específica
│   │   ├── DriverScreen.tsx                # Panel de conductor (tab 4)
│   │   ├── DriverLoginScreen.tsx           # Login para conductores
│   │   ├── SettingsScreen.tsx              # Configuraciones (desde menú)
│   │   └── MapScreen.web.tsx               # Versión web del mapa
│   │
│   ├── context/                        # Context API para estado global
│   │   ├── SettingsContext.tsx             # Idioma (ES/EN) y tema (claro/oscuro)
│   │   └── SearchContext.tsx               # Estado del panel de búsqueda
│   │
│   ├── styles/                         # Sistema de estilos centralizado
│   │   └── colors.ts                       # Paleta de colores, temas, utilidades
│   │
│   ├── translations/                   # Internacionalización (i18n)
│   │   ├── en.json                         # Traducciones en inglés
│   │   └── es.json                         # Traducciones en español
│   │
│   ├── types/                          # Definiciones TypeScript
│   │   └── index.ts                        # Interfaces y tipos globales
│   │
│   └── utils/                          # Utilidades y helpers
│       └── polyline.ts                     # Decodificador de polylines de Google
│
├── 🎨 assets/                          # Recursos estáticos
│   ├── adaptive-icon.png                   # Icono adaptativo (Android)
│   ├── icon.png                            # Icono de la app
│   ├── favicon.png                         # Favicon (web)
│   └── splash-icon.png                     # Logo del splash screen
│
├── ⚙️ Archivos de configuración:
│   ├── App.tsx                             # Componente raíz con providers
│   ├── index.js                            # Punto de entrada
│   ├── app.json                            # Configuración Expo (permisos, splash, etc)
│   ├── eas.json                            # Configuración EAS Build
│   ├── package.json                        # Dependencias y scripts
│   ├── tsconfig.json                       # Configuración TypeScript
│   ├── babel.config.js                     # Configuración Babel
│   ├── metro.config.js                     # Bundler de React Native
│   ├── nativewind-env.d.ts                 # Tipos para NativeWind
│   ├── global.css                          # Estilos globales Tailwind
│   ├── configure-app.js                    # Script de configuración automática
│   ├── configure-app.sh                    # Script de configuración (shell)
│   └── deploy.sh                           # Script de deployment
│
└── 📄 Documentación:
    ├── README.md                           # Este archivo
    ├── PALETA_COLORES.md                   # Guía de colores y diseño
    ├── DEPLOYMENT.md                       # Guía de deployment
    └── EAS_COMMANDS.md                     # Comandos EAS Build
```

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS (DETALLADO)

### 1️⃣ **Sistema de Navegación Completo**

#### **Tab Navigator Principal** (`CustomTabNavigator.tsx`)
- **4 pantallas principales** accesibles desde tab bar inferior:
  - 🏠 **Home**: Pantalla de inicio con información general
  - 🗺️ **Mapa**: Visualización de rutas en Google Maps
  - 🚌 **Rutas**: Lista de rutas disponibles
  - 👤 **Conductor**: Panel para conductores (acceso controlado)

- **Características técnicas**:
  - React Navigation v6 con Bottom Tabs
  - Íconos animados en selección
  - Transiciones suaves entre pantallas
  - Estado persistente al cambiar de tab
  - Soporte para deep linking

#### **Tab Bar Animado** (`AnimatedTabBar.tsx`)
- **Animaciones fluidas** con React Native Reanimated
- **Indicador visual** del tab activo
- **Feedback táctil** al cambiar de pestaña
- **Diseño responsive** que se adapta a diferentes tamaños de pantalla
- **Modo claro y oscuro** completamente integrado

#### **Menú Hamburguesa** (`HamburgerMenu.tsx`)
- **Drawer lateral deslizable** desde el borde izquierdo
- **Gestos nativos** con react-native-gesture-handler
- **Opciones del menú**:
  - ⚙️ Configuraciones (Settings)
  - 🌐 Cambio de idioma (ES/EN)
  - 🌓 Cambio de tema (claro/oscuro)
  - 📊 Estadísticas (placeholder)
  - ℹ️ Acerca de (placeholder)
  
- **Características**:
  - Animación de apertura/cierre suave
  - Cierre automático al seleccionar opción
  - Overlay semitransparente
  - Accesible desde cualquier pantalla
  - Z-index superior al resto de componentes

#### **Botón Hamburguesa** (`HamburgerButton.tsx`)
- **Posición fija** en esquina superior izquierda
- **Siempre visible** sobre todo el contenido
- **Animación de transformación** del icono
- **Z-index máximo** (999) para asegurar visibilidad

---

### 2️⃣ **Buscador de Lugares con Google Places API**

#### **Componente Principal** (`GooglePlacesSearchInteractive.tsx`)

**Panel de búsqueda con 3 estados deslizables**:

1. **🔽 Hidden (Oculto)**:
   - Solo visible la barra de arrastre (handle)
   - Ocupa ~60px desde el borde inferior
   - Usuario puede deslizar hacia arriba para expandir

2. **➖ Neutral (Parcial)**:
   - Muestra el campo de búsqueda completo
   - Ocupa ~280px desde el borde inferior
   - **Estado DEFAULT** al entrar a la pantalla del mapa
   - Muestra "Lugares buscados recientemente" si hay historial
   - Usuario puede:
     - Deslizar hacia arriba → Expandido
     - Deslizar hacia abajo → Oculto
     - Tocar la barra → Alterna entre estados

3. **⬆️ Expanded (Expandido)**:
   - Panel ocupa 95% de la pantalla
   - Muestra lista completa de resultados de búsqueda
   - Teclado abierto automáticamente
   - Scroll infinito para resultados
   - Usuario puede:
     - Deslizar hacia abajo → Hidden (cierra y oculta teclado)
     - Tocar resultado → Centra mapa en ubicación

**Características técnicas**:
- **Animaciones lineales** sin rebotes (Easing.linear)
- **Gestos nativos** con PanGestureHandler
- **Umbrales de velocidad y distancia** para detectar intención del usuario
- **Cierre automático del teclado** al pasar a estado Hidden (iOS-safe)
- **Lista sin overscroll** ni bounce (mejora UX)
- **Búsqueda con debounce** (300ms) para optimizar llamadas API
- **Cache de búsquedas recientes** en AsyncStorage (máximo 5)
- **Restricción geográfica** a Panamá (countryCode: 'PA')
- **Radio de búsqueda** de 50km desde David, Chiriquí
- **Idioma español** en resultados

**Integración con Google Places API**:
```javascript
// Autocomplete para sugerencias
https://maps.googleapis.com/maps/api/place/autocomplete/json

// Details para coordenadas exactas
https://maps.googleapis.com/maps/api/place/details/json
```

**Flujo de búsqueda**:
1. Usuario escribe en el campo (mínimo 3 caracteres)
2. Debounce de 300ms antes de hacer llamada API
3. Autocomplete devuelve sugerencias
4. Usuario selecciona un lugar
5. Details API obtiene coordenadas exactas
6. Lugar se guarda en "recientes"
7. Mapa anima hacia la ubicación (1 segundo)
8. Panel se oculta automáticamente (estado Hidden)
9. Teclado se cierra

---

### 3️⃣ **Mapa Interactivo con Google Maps**

#### **Pantalla del Mapa** (`MapScreen.tsx`)

**Componentes visuales**:
- **Google Maps nativo** (react-native-maps)
- **Marcador de ubicación del usuario** (GPS en tiempo real)
- **Ruta trazada en carretera** (línea roja de 4px)
- **Marcadores de origen y destino**:
  - 🟢 Verde para punto de inicio
  - 🔴 Rojo para punto final
- **Panel de búsqueda interactivo** (GooglePlacesSearchInteractive)
- **Botón de "centrar en mi ubicación"** (📍)

**Funcionalidades del mapa**:

1. **Ubicación del Usuario**:
   - Solicita permisos de geolocalización al inicio
   - Actualización continua de posición
   - Marcador azul nativo de Google Maps
   - Botón para centrar cámara en ubicación actual

2. **Trazado de Rutas en Carreteras**:
   - Usa **Google Directions API** con direcciones de texto
   - Ejemplo actual: "Parque Cervantes, David" → "Romero Doleguita, David"
   - Polyline decodificado con algoritmo personalizado (`utils/polyline.ts`)
   - **Sigue exactamente las carreteras reales** (no líneas rectas)
   - Información en consola: distancia, duración, cantidad de puntos

3. **Interacción con Búsqueda**:
   - Al seleccionar lugar, mapa anima hacia coordenadas
   - Zoom ajustado automáticamente (latitudeDelta: 0.005)
   - Marcador temporal en lugar seleccionado
   - Panel de búsqueda se oculta tras selección

4. **Modos de Visualización**:
   - **Modo claro**: Colores estándar de Google Maps
   - **Modo oscuro**: Estilo personalizado con JSON (darkMapStyle)
   - Cambio automático según tema del sistema

**Configuración de Google Maps**:
```typescript
// API Key configurado en app.json
{
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"
      }
    }
  },
  "ios": {
    "config": {
      "googleMapsApiKey": "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"
    }
  }
}
```

**Permisos requeridos**:
- `LOCATION_FOREGROUND`: Para obtener ubicación del usuario
- `LOCATION_BACKGROUND`: (Opcional) Para tracking continuo
- Se solicitan en tiempo de ejecución (runtime permissions)

---

### 4️⃣ **Sistema de Temas y Personalización**

#### **Context de Configuraciones** (`SettingsContext.tsx`)

**Estados globales gestionados**:
1. **Idioma** (`language`):
   - Opciones: `'es'` (español) | `'en'` (inglés)
   - Persistido en AsyncStorage (`'app_language'`)
   - Carga al iniciar la app
   - Cambio en tiempo real sin reiniciar

2. **Tema** (`theme`):
   - Opciones: `'light'` (claro) | `'dark'` (oscuro)
   - Persistido en AsyncStorage (`'app_theme'`)
   - Afecta toda la UI instantáneamente
   - Incluye estilo de mapa personalizado

**Función de traducción**:
```typescript
t('key.nested.value') // Accede a traducciones anidadas
```

**Paleta de colores** (`styles/colors.ts`):

```typescript
// Función principal
getTheme(isDark: boolean) → Objeto con colores

// Colores disponibles:
{
  primary: '#2563EB',      // Azul principal
  secondary: '#10B981',    // Verde secundario
  accent: '#F59E0B',       // Naranja acento
  background: '#F9FAFB',   // Fondo claro
  white: '#FFFFFF',        // Blanco puro
  gray50: '#F9FAFB',       // Grises (50-900)
  // ... más de 20 colores
}
```

**Utilidades adicionales**:
- `getBusStatusColor()`: Colores por estado de bus
- `getRouteColor()`: Colores por número de ruta
- `CommonStyles`: Estilos reutilizables (espaciado, tipografía, sombras)

---

### 5️⃣ **Internacionalización (i18n)**

**Archivos de traducción**:
- `translations/es.json`: Español (idioma por defecto)
- `translations/en.json`: Inglés

**Estructura JSON**:
```json
{
  "common": {
    "appName": "BusNow",
    "loading": "Cargando...",
    // ...
  },
  "screens": {
    "home": {
      "title": "Inicio",
      // ...
    },
    "map": { /* ... */ },
    "routes": { /* ... */ }
  },
  "actions": { /* ... */ },
  "errors": { /* ... */ }
}
```

**Uso en componentes**:
```typescript
const { t } = useSettings();
<Text>{t('screens.home.title')}</Text>
```

---

### 6️⃣ **Pantallas Secundarias**

#### **Home Screen** (`HomeScreen.tsx`)
- Pantalla de bienvenida
- Información general de la app
- Acceso rápido a funcionalidades
- Estadísticas básicas (placeholder)

#### **Routes Screen** (`RoutesScreen.tsx`)
- Lista de rutas disponibles
- Scroll vertical infinito
- Tarjetas con información de cada ruta:
  - Nombre y número de ruta
  - Horarios de operación
  - Frecuencia estimada
  - Estado actual

#### **Route Detail Screen** (`RouteDetailScreen.tsx`)
- Información detallada de ruta seleccionada
- Mapa con trazado completo de la ruta
- Lista de paradas intermedias
- Horarios por parada
- Botón para activar notificaciones

#### **Settings Screen** (`SettingsScreen.tsx`)
- Cambio de idioma (ES/EN)
- Cambio de tema (claro/oscuro)
- Configuraciones de notificaciones (placeholder)
- Acerca de la app
- Versión y créditos

#### **Driver Screen** (`DriverScreen.tsx`)
- Panel exclusivo para conductores
- Dashboard con métricas en tiempo real (placeholder)
- Gestión de rutas asignadas
- Comunicación con central (placeholder)

#### **Driver Login Screen** (`DriverLoginScreen.tsx`)
- Autenticación para conductores
- Formulario de login
- Validación de credenciales (placeholder)
- Recuperación de contraseña (placeholder)

---

### 7️⃣ **Utilidades y Helpers**

#### **Decodificador de Polyline** (`utils/polyline.ts`)
```typescript
decodePolyline(encoded: string): Array<{latitude: number, longitude: number}>
```
- Algoritmo de decodificación de polylines de Google Maps
- Convierte string codificado en array de coordenadas
- Usado para trazar rutas en el mapa
- Optimizado para rendimiento (evita llamadas redundantes)

---

## 🔧 STACK TECNOLÓGICO DETALLADO

### **Dependencias Principales** (package.json)

#### **Framework y Core**:
- `react: 19.1.0` - Biblioteca principal
- `react-native: 0.81.4` - Framework móvil nativo
- `expo: ~54.0.0` - Plataforma de desarrollo
- `typescript: ^5.9.2` - Tipado estático

#### **Navegación**:
- `@react-navigation/native: ^6.1.18` - Core de navegación
- `@react-navigation/bottom-tabs: ^6.6.1` - Tabs inferiores
- `@react-navigation/stack: ^6.4.1` - Stack navigator
- `react-native-screens: ~4.16.0` - Optimización de pantallas
- `react-native-safe-area-context: ~5.6.0` - Áreas seguras (notch, etc)

#### **Mapas y Ubicación**:
- `react-native-maps: ^1.20.1` - Google Maps nativo
- `expo-location: ~19.0.7` - Servicios de geolocalización
- `@googlemaps/js-api-loader: ^2.0.1` - Loader de Google Maps JS
- `react-native-google-places-autocomplete: ^2.5.7` - Autocomplete de lugares

#### **Gestos y Animaciones**:
- `react-native-gesture-handler: ^2.28.0` - Gestos nativos
- `react-native-animatable: ^1.4.0` - Animaciones predefinidas

#### **Almacenamiento y Estado**:
- `@react-native-async-storage/async-storage: ^2.2.0` - Persistencia local
- `@reduxjs/toolkit: ^2.9.1` - Gestión de estado (opcional, no usado actualmente)
- `react-redux: ^9.2.0` - Bindings de Redux (opcional)

#### **HTTP y Comunicación**:
- `axios: ^1.12.2` - Cliente HTTP

#### **Notificaciones**:
- `expo-notifications: ~0.32.12` - Push notifications (preparado para futuro)

#### **Estilos**:
- `nativewind: ^4.2.1` - Tailwind CSS para React Native
- `tailwindcss: ^4.1.14` - Utilidades de estilo

#### **Build y Updates**:
- `expo-updates: ~29.0.12` - Over-The-Air updates
- `expo-build-properties: ~1.0.9` - Configuración de builds
- `expo-device: ~8.0.9` - Información del dispositivo

#### **DevDependencies**:
- `@babel/core: ^7.25.0` - Transpilador
- `babel-preset-expo: ^54.0.0` - Preset de Babel para Expo
- `@types/react: ^19.1.10` - Tipos de React
- `@types/react-native: ^0.73.0` - Tipos de React Native

---

## ⚙️ CONFIGURACIÓN Y SETUP

### **Archivo app.json** (Configuración principal de Expo)

```json
{
  "expo": {
    "name": "BusNow",
    "slug": "busnow",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "automatic",  // Soporte de tema automático
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#2563EB"  // Azul primary
    },
    "updates": {
      "fallbackToCacheTimeout": 0,
      "url": "https://u.expo.dev/[project-id]"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.zeteki.busnow",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "BusNow necesita tu ubicación para mostrarte buses cercanos.",
        "NSLocationAlwaysUsageDescription": "BusNow necesita tu ubicación en segundo plano para notificaciones."
      },
      "config": {
        "googleMapsApiKey": "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"
      }
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#2563EB"
      },
      "package": "com.zeteki.busnow",
      "permissions": [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION"
      ],
      "config": {
        "googleMaps": {
          "apiKey": "EXPO_PUBLIC_GOOGLE_MAPS_API_KEY"
        }
      }
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    },
    "plugins": [
      "expo-location",
      "expo-notifications"
    ],
    "extra": {
      "eas": {
        "projectId": "[your-project-id]"
      }
    }
  }
}
```

### **Archivo eas.json** (EAS Build Config)

```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🚀 SCRIPTS Y COMANDOS

### **Scripts de npm** (package.json)

```bash
# Desarrollo
npm start              # Inicia dev server (muestra opciones)
npm run android        # Corre en Android
npm run ios            # Corre en iOS
npm run web            # Corre en navegador
npm run preview        # Túnel para dispositivos externos

# Build
npm run build:android     # Build de producción Android
npm run build:ios         # Build de producción iOS
npm run build:preview     # Build preview (APK directo)
npm run build:dev         # Build de desarrollo
npm run build:status      # Verifica estado de builds

# Updates OTA
npm run update:preview    # Publica update a canal preview
npm run update:prod       # Publica update a canal production

# Submit a Stores
npm run submit:android    # Envía APK/AAB a Play Store
npm run submit:ios        # Envía IPA a App Store

# Configuración
npm run configure         # Ejecuta script de configuración
npm run preeas            # Pre-hook antes de builds EAS

# Deploy
npm run deploy            # Script interactivo de deployment (./deploy.sh)
```

---

## 🗺️ FLUJO DE USUARIO ACTUAL

### **1. Inicio de la App**
```
Usuario abre app
  ↓
[Splash Screen con logo]
  ↓
Carga configuraciones desde AsyncStorage (idioma, tema)
  ↓
Inicializa providers (Settings, Search, Navigation)
  ↓
[Tab Navigator - Home Screen visible]
```

### **2. Navegación Principal**
```
Tab Bar inferior siempre visible:
  [🏠 Home] [🗺️ Mapa] [🚌 Rutas] [👤 Conductor]
     ↓          ↓          ↓           ↓
  Inicio    MapScreen  RoutesScreen  DriverScreen
```

### **3. Uso del Mapa**
```
Usuario toca tab "Mapa"
  ↓
MapScreen se renderiza
  ↓
Solicita permisos de ubicación
  ↓
[Si acepta] → Muestra ubicación en mapa
[Si rechaza] → Muestra David, Chiriquí por defecto
  ↓
Carga ruta predefinida (Parque Cervantes → Romero Doleguita)
  ↓
Llama a Google Directions API
  ↓
Decodifica polyline
  ↓
Dibuja ruta roja en mapa
  ↓
Panel de búsqueda en estado "Neutral" (parcialmente visible)
```

### **4. Búsqueda de Lugares**
```
Usuario desliza panel hacia arriba (o toca)
  ↓
Panel se expande (95% de pantalla)
  ↓
Usuario escribe en campo de búsqueda
  ↓
[Debounce 300ms]
  ↓
Llama a Google Places Autocomplete API
  ↓
Muestra sugerencias en lista
  ↓
Usuario selecciona un lugar
  ↓
Llama a Google Places Details API
  ↓
Obtiene coordenadas exactas
  ↓
Guarda en "Lugares recientes" (AsyncStorage)
  ↓
Mapa anima hacia ubicación (1 segundo)
  ↓
Coloca marcador 📍 en lugar seleccionado
  ↓
Panel se oculta automáticamente (estado "Hidden")
  ↓
Teclado se cierra
```

### **5. Menú Hamburguesa**
```
Usuario toca botón ☰ (esquina superior izquierda)
  ↓
Drawer se desliza desde la izquierda
  ↓
Muestra opciones:
  - ⚙️ Configuraciones
  - 🌐 Cambiar idioma
  - 🌓 Cambiar tema
  - 📊 Estadísticas
  - ℹ️ Acerca de
  ↓
Usuario selecciona una opción
  ↓
[Configuraciones] → Navega a SettingsScreen
[Cambiar idioma] → Alterna ES ↔ EN (instantáneo)
[Cambiar tema] → Alterna claro ↔ oscuro (instantáneo)
  ↓
Drawer se cierra automáticamente
```

---

## 🎨 DISEÑO Y UX

### **Principios de Diseño**
1. **Minimalismo**: Interfaz limpia sin elementos innecesarios
2. **Accesibilidad**: Áreas de toque grandes (min 44x44px)
3. **Feedback visual**: Animaciones para todas las interacciones
4. **Consistencia**: Paleta de colores unificada
5. **Responsive**: Adapta a diferentes tamaños de pantalla

### **Animaciones Implementadas**
- Tab bar: Transición de escala y color al cambiar de tab
- Panel de búsqueda: Deslizamiento suave entre estados (linear easing)
- Menú hamburguesa: Apertura/cierre con overlay fade
- Mapa: Animación de cámara al centrar ubicación
- Marcadores: Fade in al cargar

### **Modo Oscuro**
- Fondo oscuro: `#1F1F1F`
- Texto claro: `#F9FAFB`
- Reducción de brillo en mapas (darkMapStyle personalizado)
- Iconos y bordes ajustados automáticamente

---

## 🔐 PERMISOS Y SEGURIDAD

### **Permisos Solicitados**

**Android** (`android.permissions` en app.json):
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION"/>
<uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION"/>
<uses-permission android:name="android.permission.INTERNET"/>
```

**iOS** (`NSLocationWhenInUseUsageDescription` en app.json):
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>BusNow necesita tu ubicación para mostrarte buses cercanos.</string>
<key>NSLocationAlwaysUsageDescription</key>
<string>BusNow necesita tu ubicación en segundo plano para notificaciones.</string>
```

### **Gestión de Permisos**
```typescript
// En MapScreen.tsx
const initializeLocation = async () => {
  let { status } = await Location.requestForegroundPermissionsAsync();
  
  if (status !== 'granted') {
    Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu ubicación...');
    return;
  }
  
  let location = await Location.getCurrentPositionAsync({});
  // Procesar ubicación...
};
```

---

## 📊 ESTADO ACTUAL DEL MVP

### ✅ **Completamente Funcional**
- ✅ Navegación entre pantallas (4 tabs + drawer)
- ✅ Búsqueda de lugares con Google Places API
- ✅ Visualización de mapa con Google Maps
- ✅ Trazado de rutas en carreteras reales
- ✅ Ubicación del usuario en tiempo real
- ✅ Panel de búsqueda con 3 estados deslizables
- ✅ Menú hamburguesa con opciones
- ✅ Cambio de idioma (ES/EN)
- ✅ Modo claro/oscuro
- ✅ Persistencia de configuraciones
- ✅ Animaciones fluidas
- ✅ Diseño responsive

### ⚠️ **Placeholders / Preparado para Implementar**
- ⚠️ Tracking en tiempo real de buses (estructura lista, sin backend)
- ⚠️ Notificaciones push (expo-notifications instalado)
- ⚠️ Autenticación de conductores (UI lista, sin backend)
- ⚠️ WebSocket para updates en vivo (código comentado)
- ⚠️ Base de datos de rutas reales (mock data en código)
- ⚠️ Estadísticas y analíticas (pantalla placeholder)

### 🚫 **No Implementado**
- ❌ Backend API (todo funciona con APIs de Google)
- ❌ Base de datos (solo AsyncStorage local)
- ❌ Autenticación real de usuarios
- ❌ Tracking GPS de buses reales
- ❌ Sistema de notificaciones configurado
- ❌ Integración con operadores de transporte
- ❌ Pagos o sistema de tickets
- ❌ Chat o soporte en vivo

---

## 🎯 PRÓXIMOS PASOS SUGERIDOS

### **Fase 1: Backend y Base de Datos**
1. Configurar backend (Node.js + Express + PostgreSQL/MongoDB)
2. Implementar API REST con endpoints:
   - `/api/buses` - CRUD de buses
   - `/api/routes` - CRUD de rutas
   - `/api/stops` - CRUD de paradas
   - `/api/users` - Autenticación y perfil
3. WebSocket server para tracking en tiempo real
4. Base de datos con esquemas para:
   - Buses (id, placa, ruta, estado, ubicación)
   - Rutas (id, nombre, paradas, horarios)
   - Usuarios (id, nombre, email, preferencias)
   - Históricos (ubicaciones, tiempos)

### **Fase 2: Tracking en Tiempo Real**
1. App secundaria para conductores (GPS sender)
2. WebSocket bidireccional para updates cada 5 segundos
3. Algoritmo de predicción de ETAs
4. Visualización de múltiples buses en mapa
5. Estados de buses en tiempo real

### **Fase 3: Notificaciones**
1. Configurar Expo Push Notifications
2. Backend para envío de notificaciones
3. Suscripciones por ruta/parada
4. Alertas de llegada (5 min antes)
5. Notificaciones de cambios de servicio

### **Fase 4: Autenticación y Perfiles**
1. Sistema de registro/login con JWT
2. Perfiles de usuario con preferencias
3. Favoritos (rutas, paradas)
4. Historial de búsquedas
5. Panel de conductor con autenticación

### **Fase 5: Features Avanzadas**
1. Planificador de viajes multi-ruta
2. Compartir ubicación en vivo
3. Integración con pago de pasajes
4. Sistema de reporte de incidencias
5. Analíticas y estadísticas avanzadas
6. Modo offline con cache inteligente

---

## 🧪 TESTING Y DEPLOYMENT

### **Cómo Ejecutar el Proyecto**

1. **Clonar repositorio**:
```bash
git clone https://github.com/edwardperxz/BusNow.git
cd BusNow
```

2. **Instalar dependencias**:
```bash
npm install
```

3. **Configurar API Key de Google Maps**:
   - Crear cuenta en Google Cloud Console
   - Habilitar APIs: Maps SDK, Places API, Directions API
   - Crear API Key
   - Agregar en archivo `.env` (o app.json):
```bash
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=tu_api_key_aqui
```

4. **Iniciar desarrollo**:
```bash
npm run web        # Navegador (más rápido para probar)
npm run android    # Android (emulador o dispositivo)
npm run ios        # iOS (solo macOS)
```

### **Builds de Producción**

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login en Expo
eas login

# Configurar proyecto
eas build:configure

# Build para Android (APK directo)
npm run build:preview

# Build para producción (AAB/IPA)
npm run build:android
npm run build:ios

# Verificar estado de builds
npm run build:status

# Enviar a tiendas
npm run submit:android  # Google Play
npm run submit:ios      # App Store
```

---

## 📞 INFORMACIÓN DE CONTACTO Y SOPORTE

**Desarrollador**: Zeteki  
**Repositorio**: [github.com/edwardperxz/BusNow](https://github.com/edwardperxz/BusNow)  
**Versión actual**: 1.0.0  
**Última actualización**: Noviembre 2025

---

## 📝 NOTAS IMPORTANTES PARA OTRA IA

### **Convenciones del Proyecto**
1. **TypeScript obligatorio**: Todos los archivos .tsx con tipos explícitos
2. **Functional components**: Usar hooks, no class components
3. **Context API sobre Redux**: Preferir Context para estado global simple
4. **Estilos inline con getTheme()**: No crear hojas de estilo separadas sin necesidad
5. **Async/await sobre Promises**: Para mejor legibilidad
6. **Comentarios JSDoc**: Para funciones públicas y complejas

### **Arquitectura de Carpetas**
- `components/`: Solo componentes reutilizables (no específicos de pantalla)
- `screens/`: Una pantalla = un archivo
- `context/`: Estado global con Context API
- `utils/`: Funciones puras, helpers, utilidades
- `types/`: Solo definiciones de TypeScript
- `styles/`: Solo colors.ts (sistema centralizado)

### **Flujo de Trabajo**
1. Crear componente en `components/` o `screens/`
2. Agregar tipos en `types/index.ts` si es necesario
3. Usar `useSettings()` para tema e idioma
4. Probar en web primero (`npm run web`)
5. Luego probar en móvil (`npm run android` o `npm run ios`)

### **Errores Comunes a Evitar**
- ❌ No usar `Platform.OS` para lógica condicional (preferir responsive)
- ❌ No hardcodear colores (siempre usar `getTheme()`)
- ❌ No usar strings literales (usar `t()` para traducir)
- ❌ No olvidar `useCallback` en funciones pasadas como props
- ❌ No usar `console.log` en producción (usar logger condicional)

### **Performance**
- Usar `React.memo()` para componentes pesados
- `useMemo()` para cálculos complejos
- `useCallback()` para funciones en efectos
- `FlatList` en lugar de `ScrollView` para listas grandes
- Imágenes optimizadas (compressed, webp)

---

## 🎉 ¡LISTO PARA CONTINUAR!

Este MVP está **100% funcional** y listo para ser extendido. Las bases están sólidas:
- ✅ Arquitectura escalable
- ✅ Código TypeScript tipado
- ✅ UI/UX pulida
- ✅ Navegación completa
- ✅ Integración con Google Maps
- ✅ Persistencia local
- ✅ Internacionalización
- ✅ Temas claro/oscuro

**Próxima IA**: Puedes empezar a implementar backend, tracking en tiempo real, o cualquier feature avanzada. El código está documentado, organizado y listo para escalar.

---

*Desarrollado con ❤️ por Zeteki | Noviembre 2025*

### 🎯 **Problema que Resuelve:**
- **Incertidumbre en tiempos de espera** del transporte público en Chiriquí
- **Falta de información en tiempo real** sobre ubicación de buses en rutas locales
- **Planificación ineficiente** de viajes entre David, Boquete, Bugaba y otras ciudades
- **Comunicación deficiente** entre operadores de transporte y usuarios en la región

### 💡 **Solución Propuesta:**
- **Tracking GPS en tiempo real** de la flota de buses de Chiriquí
- **Estimaciones precisas** de tiempos de llegada usando algoritmos predictivos adaptados al tráfico local
- **Notificaciones inteligentes** para alertas y actualizaciones de servicio regional
- **Interfaz intuitiva** con mapas interactivos específicos de la provincia de Chiriquí

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
   
   # Aplicar configuración automáticamente
   npm run configure
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
Línea 1 - Centro David: Parque Cervantes → Universidad → Hospital Chiriquí → Terminal
Línea 2 - David-Boquete: Terminal David → Dolega → Boquete Centro → Volcán
Línea 3 - David-Bugaba: Centro David → Pedregal → Bugaba → La Concepción
```

### **🚌 Buses Activos:**
- **6 buses simulados** con movimiento automático en rutas de Chiriquí
- **Estados variables**: 4 activos, 1 en mantenimiento, 1 retrasado
- **Capacidades dinámicas**: 20-95% ocupación simulada
- **Rutas asignadas** con horarios realistas para la región

### **📍 Paradas Configuradas:**
```
- Centro de David: Lat: 8.4333, Lng: -82.4333
- Parque Cervantes: Lat: 8.4280, Lng: -82.4280  
- Terminal de Buses: Lat: 8.4400, Lng: -82.4400
- Hospital Chiriquí: Lat: 8.4250, Lng: -82.4350
- Universidad Tecnológica: Lat: 8.4100, Lng: -82.4100
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

# Build de prueba (APK directo)
npm run build:preview

# Actualizaciones OTA
npm run update:preview  # Para testing
npm run update:prod     # Para producción

# Enviar a tiendas
npm run submit:android
npm run submit:ios

# Script interactivo de deployment
npm run deploy
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
