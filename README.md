# 🚌 BusNow MVP - Especificaciones (Firebase Backend)

> **MVP con backend completamente gestionado en Firebase (Firestore + Cloud Functions + Auth). Sin servidor propio Express: toda la lógica de tiempo real y cálculo de ETA vive en Firebase.**

---

## 📋 Resumen del MVP

### 🎯 Objetivo
Calcular y mostrar ETA (tiempo estimado de llegada) dinámico de buses y visualizar su movimiento en tiempo real. El conductor envía su ubicación cada 5 segundos a Firestore y el usuario ve las actualizaciones instantáneamente mediante listeners en tiempo real (onSnapshot). El cálculo de ETA se realiza vía Cloud Function callable que consume Google Directions API.

### � Sistema de Roles
La app tiene **dos roles diferenciados** con interfaces y permisos distintos:

**🚌 Conductor (Driver)**
- Interfaz simple y minimalista enfocada en el servicio
- Botón grande para Iniciar/Detener servicio
- Muestra estado del tracking GPS en tiempo real
- Envía ubicación automáticamente cada 5s cuando está activo
- Solo puede actualizar su propia ubicación en Firestore (`/buses/{uid}`)

**🧑 Pasajero (Passenger)**
- Interfaz completa con mapa, rutas y búsqueda
- Ve todos los buses activos en tiempo real
- Puede calcular ETA a cualquier destino
- Solo lectura de ubicaciones de buses

### �🔑 Decisiones Clave
- Backend = Firebase (Firestore, Auth, Functions). No se usa servidor Node propio.
- Tracking = Firestore listeners (pseudo WebSocket).
- ETA dinámico = Cloud Function `calculateETA` usando Google Directions API.
- Autenticación = Firebase Auth (Email/Password) con AsyncStorage para persistencia.
- Seguridad = Reglas de Firestore + Callable Functions + separación de claves.
- Roles = Definidos en `/users/{uid}` con campo `role: 'driver' | 'passenger'`.

---

## 🏗️ Arquitectura y Estructura

### 📁 Estructura de Carpetas Detallada

```
BusNow/
├── src/
│   ├── components/               # Componentes reutilizables UI
│   ├── screens/                  # Pantallas (Map, Home, Driver, etc.)
│   ├── services/
│   │   ├── firebaseApp.ts        # Inicialización Firebase
│   │   └── firebaseBusTracking.ts # Tracking en Firestore (envío/escucha)
│   ├── hooks/
│   │   └── useDynamicETA.ts      # Hook para ETA usando Cloud Function
│   ├── utils/                    # Helpers (polyline decode, etc.)
│   ├── context/                  # Settings / búsqueda / tema
│   └── styles/                   # Paleta y estilos compartidos
├── firebase/
│   └── functions/
│       ├── package.json          # Dependencias de Cloud Functions
│       └── index.js              # Function callable calculateETA
├── assets/                       # Iconos, imágenes
├── .env                          # Variables de entorno (cliente)
├── .env.example                  # Ejemplo sin secretos
├── firebase.json                 # Configuración de funciones
├── app.json                      # Configuración Expo
├── package.json                  # Dependencias frontend
└── README.md                     # Documentación del proyecto
```

---

## 🎯 FUNCIONALIDADES IMPLEMENTADAS (DETALLADO)

### 1️⃣ Core Funcionalidades MVP

1. Conductor (app con sesión iniciada) envía ubicación cada `EXPO_PUBLIC_LOCATION_UPDATE_INTERVAL` ms usando `firebaseBusTracking.ts` → documento `buses/{busId}`.
2. Usuario escucha cambios en colección/ documento de buses con `onSnapshot` → actualiza marcadores en mapa en tiempo real.
3. Usuario selecciona una parada → se guarda estado local `selectedStop`.
4. Hook `useDynamicETA` detecta cambios de ubicación del bus y llama Cloud Function `calculateETA` (callable) con `{ busLocation, stopLocation }`.
5. Respuesta incluye `durationSeconds`, `durationText`, `distanceMeters`, `distanceText`, `polyline` → se dibuja polyline decodificada en mapa y se muestra panel ETA.
6. Recalculo automático cada vez que el documento del bus cambia (nuevo snapshot) con un debounce mínimo para evitar spam.

### 2️⃣ Cloud Function `calculateETA`
Archivo: `functions/src/index.ts`

Responsable de:
- Recibir coordenadas de bus y parada
- Construir request a Google Directions API (modo driving, traffic real time)
- Parsear route y leg → devolver datos más polyline
- Manejo de errores estándar con `HttpsError`

Ejemplo (ya implementado) simplificado:
```js
exports.calculateETA = functions.https.onCall(async (data) => {
  const { busLocation, stopLocation } = data;
  // ... llamada axios a Directions ...
  return { ok: true, eta: { durationSeconds, distanceMeters, polyline } };
});
```

### 3️⃣ Tracking Firestore
Documento por bus (`buses/{busId}`) con esquema mínimo:
```json
{
  "busId": "bus-123",
  "latitude": 8.43,
  "longitude": -82.43,
  "heading": 90,
  "speed": 35,
  "updatedAt": 1731300000000,
  "updatedAtTimestamp": FirestoreServerTimestamp
}
```
Listeners en usuario y conductor reutilizan el mismo documento (no duplicación). Para múltiples buses, se observaría `collection('buses')` con filtros futuros (rutas activas, etc.).

### 4️⃣ Hook de ETA (`useDynamicETA.ts`)
- Escucha documento del bus.
- Trigger de cálculo al cambiar lat/long.
- Debounce simple (≥1500ms) para evitar llamada excesiva.
- Usa `httpsCallable` para invocar function.
- Devuelve `{ eta, loading, error }` listo para UI.

### 5️⃣ UI de Mapa
- Marcadores de buses basados en snapshot Firestore.
- Polyline se actualiza al cambiar `eta.polyline`.
- Panel ETA muestra tiempo en minutos y distancia.

### 6️⃣ Autenticación
- Firebase Auth (email/password) inicializable desde `firebaseApp.ts`.
- Conductores requieren login para emitir ubicación (reglas Firestore pueden restringir escritura a rol=driver).

### 7️⃣ Seguridad y Reglas Firestore
Archivo: `firestore.rules`

**Reglas implementadas**:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Lectura pública de buses (MVP)
    // Escritura solo para conductores autenticados con rol 'driver'
    match /buses/{busId} {
      allow read: if true;
      allow write: if request.auth != null && 
                     (request.auth.token.role == 'driver' || 
                      request.auth.token.admin == true);
    }

    // Denegar acceso por defecto a otras colecciones
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Implementación de roles**:
Para asignar el rol `driver` a un usuario, usar Firebase Admin SDK:
```javascript
admin.auth().setCustomUserClaims(uid, { role: 'driver' });
```

**Desplegar reglas**:
```bash
firebase deploy --only firestore:rules
```

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

### 8️⃣ Variables de Entorno

Se reutilizan las existentes (todas expuestas vía Expo porque son claves públicas de cliente). Agregada `FIREBASE_ADMIN_SDK_KEY` placeholder solo para despliegue seguro si se necesitara algún script adicional (no usada en app cliente).

```
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=...
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_LOCATION_UPDATE_INTERVAL=5000
FIREBASE_ADMIN_SDK_KEY= (no se expone en cliente, solo CI/CD o funciones)
```

Cloud Functions debe usar solo `process.env.GOOGLE_MAPS_API_KEY` o `functions.config().maps.key` (sin fallback a variables `EXPO_PUBLIC_*`).

#### **Decodificador de Polyline** (`utils/polyline.ts`)
```typescript
decodePolyline(encoded: string): Array<{latitude: number, longitude: number}>
```
- Algoritmo de decodificación de polylines de Google Maps
- Convierte string codificado en array de coordenadas
- Usado para trazar rutas en el mapa
- Optimizado para rendimiento (evita llamadas redundantes)

---

## 🔧 Stack Tecnológico MVP Firebase

| Capa | Tecnología | Uso |
|------|------------|-----|
| Frontend | React Native + Expo | UI móvil y web dev |
| Auth | Firebase Auth | Sesión conductor / usuarios futuros |
| Tiempo Real | Firestore listeners | Actualización de ubicación cada ≤5s |
| Backend Funcional | Cloud Functions callable | Cálculo ETA y futura lógica agregada |
| Mapas | Google Maps (Directions + Maps) | Rutas y ETA dinámico |
| Estado local | Hooks/Context | Configuración, tema, idioma |

No existe servidor Express ni Socket.io: simplifica mantenimiento y costo en esta etapa inicial.

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
npm run deploy            # Script interactivo de deployment (./scripts/deploy.sh)
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

## 📊 Estado Actual del MVP

| Feature | Estado |
|---------|--------|
| Envío ubicación conductor (Firestore) | ✅ Implementado |
| Listener buses en tiempo real | ✅ Implementado |
| Cloud Function ETA | ✅ Implementada con tráfico real |
| Hook ETA dinámico | ✅ Implementado |
| Polyline dinámica en mapa | ✅ Implementado (carreteras reales) |
| Autenticación Firebase Auth | ✅ Implementada con AsyncStorage |
| Sistema de roles (Guest/User/Driver) | ✅ Implementado con autenticación opcional |
| Login/Registro con roles | ✅ Pantallas completas |
| Interfaz Driver simplificada | ✅ Implementada |
| Navegación por roles | ✅ Implementada |
| Reglas Firestore seguras | ✅ Desplegadas (auth requerida) |
| Optimización llamadas ETA (cache/debounce) | ✅ Debounce básico |
| Múltiples buses simultáneos | ✅ Escalable (colección) |
| Modo Demo para testing | ✅ Implementado |
| Manejo de errores avanzado | ⚠️ Pendiente (reintentos, fallback ETA previa) |
| Tests unitarios Functions | ⚠️ Pendiente |

Definición de DONE para este MVP Firebase: ubicación emitida y escuchada en tiempo real + ETA recalculado al mover bus + polyline mostrada.

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

## 🚀 Próximos Pasos Recomendados

1. Integrar UI de login conductor y proteger escritura de `buses/{busId}` por rol.
2. Añadir componente `ETADisplay` que consuma `useDynamicETA`.
3. Dibujar polyline dinámico en `MapScreen` (usar `eta.polyline`).
4. Cache local simple de última ETA para evitar flicker.
5. Reglas Firestore de seguridad y separación de entornos (dev/prod).
6. Implementar función adicional `calculateMultipleETAs` para varias paradas.
7. Cloud Function programada (pub/sub) para limpieza de buses inactivos (>2m sin update).
8. Añadir tests con Firebase Emulator (Functions + Firestore).
9. Migrar API Key a config segura (`firebase functions:config:set maps.key=...`).
10. Indicador visual de actualización (spinner/ pulso marcador bus).

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

## 🧪 Testing y Deployment (Firebase)

### 📋 Prerequisitos
1. **Instalar Firebase CLI**:
   ```bash
   npm install -g firebase-tools
   ```

2. **Iniciar sesión en Firebase**:
   ```bash
   firebase login
   ```

3. **Inicializar proyecto** (si no está configurado):
   ```bash
   firebase init
   # Seleccionar: Functions, Firestore
   ```

---

### 🔧 Desarrollo Local con Emuladores

Los emuladores permiten probar Functions y Firestore sin costo ni afectar producción:

```bash
# Iniciar emuladores
firebase emulators:start --only functions,firestore

# O con UI web
firebase emulators:start --only functions,firestore --import=./emulator-data
```

**Configurar app para usar emuladores** (en desarrollo):
```typescript
// src/services/firebaseApp.ts
if (__DEV__) {
  connectFirestoreEmulator(db, 'localhost', 8080);
  connectFunctionsEmulator(fn, 'localhost', 5001);
}
```

---

### 🚀 Deploy a Producción

#### **1. Deploy Cloud Functions**

```bash
# Navegar a carpeta de functions
cd functions

# Instalar dependencias
npm install

# Configurar API Key segura (recomendado)
firebase functions:config:set maps.key="TU_GOOGLE_MAPS_API_KEY_PRIVADA"

# Ver configuración actual
firebase functions:config:get

# Deploy
firebase deploy --only functions

# Deploy función específica
firebase deploy --only functions:calculateETA
```

**Nota importante sobre API Keys**:
- La Cloud Function usa solo: `functions.config().maps.key` o `process.env.GOOGLE_MAPS_API_KEY`
- No se debe usar fallback a `EXPO_PUBLIC_*` en backend
- **Recomendado**: Configurar `maps.key` con clave privada para evitar límites de cuota

#### **2. Deploy Reglas de Firestore**

```bash
# Deploy solo reglas de seguridad
firebase deploy --only firestore:rules

# Verificar reglas antes de deploy (dry run)
firebase deploy --only firestore:rules --debug
```

#### **3. Deploy Completo**

```bash
# Deploy todo (Functions + Firestore rules + Hosting si existe)
firebase deploy

# Deploy con mensaje
firebase deploy -m "Agregar calculateETA con tráfico real"
```

---

### 🔑 Configuración de Variables de Entorno

**En Cloud Functions** (seguras, no expuestas):
```bash
# Configurar múltiples variables
firebase functions:config:set \
  maps.key="$GOOGLE_MAPS_API_KEY" \
  app.env="production"

# Eliminar variable
firebase functions:config:unset maps.key

# Exportar a archivo local para emuladores (solo local, no versionar)
firebase functions:config:get > functions/.runtimeconfig.json
```

**En App Cliente** (públicas, vía Expo):
```bash
# .env o src/.env
EXPO_PUBLIC_FIREBASE_API_KEY=...
EXPO_PUBLIC_FIREBASE_PROJECT_ID=...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=...
```

---

### 📊 Monitoreo Post-Deploy

```bash
# Ver logs de Functions en tiempo real
firebase functions:log --only calculateETA

# Ver logs con filtro
firebase functions:log --only calculateETA --lines 100

# Abrir consola de Firebase
firebase open
```

**Dashboard de Firebase Console**:
- Functions: Métricas de invocaciones, errores, duración
- Firestore: Cantidad de lecturas/escrituras, índices
- Authentication: Usuarios activos, métodos de login

---

### ⚠️ Troubleshooting Común

**Error: "Permission denied"**
```bash
# Re-autenticarse
firebase login --reauth
```

**Error: "Cannot find module"**
```bash
cd functions
rm -rf node_modules package-lock.json
npm install
```

**Function no se actualiza**
```bash
# Forzar re-deploy
firebase deploy --only functions --force
```

**Emuladores no inician**
```bash
# Limpiar puertos
lsof -ti:5001 | xargs kill  # Functions
lsof -ti:8080 | xargs kill  # Firestore
```

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

**Desarrollador**: Ocassu Technologies  
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

## 🎉 Estado Final y Continuidad

El proyecto está alineado al enfoque Firebase-only. No hay servidor Node personalizado que mantener. Escalar implica añadir más funciones (p.ej. agregación histórica, limpieza, múltiples ETAs) y endurecer reglas y autenticación por roles.

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

*Desarrollado por Zeteki | Noviembre 2025*

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
   
   # Instalar dependencias de Cloud Functions
  cd functions
   npm install
  cd ..
   ```

3. **Configurar variables de entorno:**
   ```bash
   # Copiar archivo de configuración
   cp .env.example .env
   
   # Editar .env con tus credenciales de Firebase
   # Obtén las credenciales desde Firebase Console > Project Settings
   nano .env
   ```

4. **Configurar Firebase (primera vez):**
   ```bash
   # Login en Firebase CLI
   firebase login
   
   # Seleccionar proyecto
   firebase use app-busnow
   
   # Desplegar reglas de Firestore
   firebase deploy --only firestore:rules
   
   # (Opcional) Desplegar Cloud Functions
   firebase deploy --only functions
   ```

5. **Iniciar el proyecto:**
   ```bash
   npm start
   # o
   npx expo start
   ```

### **👥 Primer Uso - Crear Cuentas**

**Para probar como Conductor:**
1. Abre la app → Verás la pantalla de Login
2. Tap en "¿No tienes cuenta? Regístrate"
3. Selecciona el rol **🚌 Conductor**
4. Completa: Nombre, Email, Número de Bus, Contraseña
5. Tap "Registrarse"
6. Serás redirigido al **Panel del Conductor**
7. Tap "▶️ Iniciar Servicio" para comenzar a compartir ubicación

**Para probar como Pasajero:**
1. Abre la app en otro dispositivo/cuenta
2. Registra una cuenta con rol **🧑 Pasajero**
3. Verás el mapa con todos los buses activos
4. Busca un destino y selecciona un bus para ver el ETA

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
**🎨 Colores:** Ver `docs/DESIGN.md`

---

*Desarrollado por Zeteki*
