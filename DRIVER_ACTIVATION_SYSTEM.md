# 🚌 Sistema de Activación de Conductor - Documentación Completa

## 📋 Resumen

Se implementó un **sistema de activación automática de conductores** basado en códigos únicos de empleado. Este sistema reemplaza la aprobación manual por una validación automática contra una base de datos predefinida de códigos.

---

## ✅ Cambios Implementados

### 1. **Tipos Actualizados** (`src/types/index.ts`)

#### Cambios en `UserProfile`:
```typescript
export interface UserProfile {
  // ... campos existentes ...
  
  // Sistema de conductor simplificado
  isDriver: boolean;              // true si es conductor activo
  driverStatus: 'none' | 'active' | 'suspended';  // Estados simplificados
  driverInfo?: ActiveDriverInfo;  // Info solo si está activo
}
```

#### Nueva Interfaz: `ActiveDriverInfo`
```typescript
export interface ActiveDriverInfo {
  employeeId: string;        // Código único del empleado
  company: string;           // Empresa transportista
  licenseNumber: string;
  busNumber: string;
  route?: string;
  activatedAt: Date;
  isOnline: boolean;
  // ... campos adicionales ...
}
```

#### Nueva Interfaz: `DriverCode`
```typescript
export interface DriverCode {
  employeeId: string;        // Código único (ID del documento)
  company: string;
  licenseNumber: string;
  busNumber: string;
  route?: string;
  isActive: boolean;         // Si el código puede usarse
  assignedTo?: string;       // UID del usuario que lo usó
  createdAt: Date;
}
```

**Eliminado**:
- ❌ `DriverApplication` interface (ya no hay solicitudes/aprobaciones)
- ❌ `driverStatus: 'pending' | 'approved' | 'rejected'` (simplificado a 'none' | 'active' | 'suspended')

---

### 2. **AuthContext Actualizado** (`src/context/AuthContext.tsx`)

#### Nueva Función: `activateDriverMode`
```typescript
activateDriverMode: (
  employeeId: string,
  company: string,
  licenseNumber: string
) => Promise<void>
```

**Proceso de Activación**:
1. Busca el código en Firestore (`driverCodes/{employeeId}`)
2. Valida que el código existe y está activo
3. Valida que no ha sido usado por otro usuario
4. Valida que la empresa coincide
5. Valida que la licencia coincide
6. Activa el modo conductor en el perfil del usuario
7. Marca el código como asignado al usuario

**Eliminado**:
- ❌ `applyForDriver()` function
- ❌ Imports de `DriverApplication`

---

### 3. **Nueva Pantalla: ActivateDriverScreen** (`src/screens/ActivateDriverScreen.tsx`)

#### Características:
- ✅ Formulario simple con 3 campos:
  - Número de Empleado
  - Empresa Transportista
  - Número de Licencia
- ✅ Validación automática al enviar
- ✅ Mensajes de error específicos y claros
- ✅ Vista de estado "Ya Eres Conductor" si está activo
- ✅ Información sobre cómo funciona el sistema
- ✅ Diseño limpio y profesional con tema dinámico

#### Estados Manejados:
- Usuario no conductor → Muestra formulario
- Usuario conductor activo → Muestra info y botón al panel
- Errores de validación → Alertas específicas

---

### 4. **Navegación Actualizada** (`src/components/navigation/CustomTabNavigator.tsx`)

#### Cambios:
```typescript
// Nuevo manejo de ruta
} else if (key === 'activateDriver') {
  if (!isAnonymous) {
    setActiveScreen('activateDriver');
  } else {
    setActiveScreen('auth');  // Redirige a login
  }
}

// Acceso a Panel Conductor
} else if (key === 'driver') {
  if (profile?.isDriver && profile?.driverStatus === 'active') {
    setActiveScreen('driver');
  } else {
    setActiveScreen('activateDriver');  // Redirige a activación
  }
}
```

**Eliminado**:
- ❌ `applyDriver` screen y ruta
- ❌ Import de `ApplyDriverScreen`
- ❌ Lógica de estados `pending` y `approved`

---

### 5. **Menú Hamburguesa Actualizado** (`src/components/navigation/HamburgerMenu.tsx`)

#### Cambios en `getMenuItems()`:
```typescript
// Si es conductor activo → mostrar "Panel Conductor"
if (userProfile?.isDriver && userProfile?.driverStatus === 'active') {
  baseItems.push({ 
    key: 'driver', 
    label: 'Panel Conductor', 
    icon: '👨‍💼', 
    color: '#9C27B0' 
  });
}

// Si NO es conductor activo → mostrar "Activar Modo Conductor"
if (!isAnonymous && userProfile && 
    (!userProfile.isDriver || userProfile.driverStatus !== 'active')) {
  baseItems.push({ 
    key: 'activateDriver', 
    label: 'Activar Modo Conductor', 
    icon: '🚗', 
    color: '#FF5722' 
  });
}
```

#### Ícono del Header:
```typescript
// Muestra 🚌 solo si es conductor ACTIVO
{userProfile?.isDriver && userProfile?.driverStatus === 'active' ? '🚌' : '🧑'}
```

**Eliminado**:
- ❌ Opciones de `applyDriver`
- ❌ Estados `pending` y `rejected`
- ❌ Lógica condicional compleja de solicitudes

---

### 6. **Settings Screen Actualizado** (`src/screens/SettingsScreen.tsx`)

#### Nueva Sección: "Modo Conductor"

**Si es conductor activo**:
- ✅ Badge verde "Conductor Activo"
- ✅ Muestra: Empresa • Bus asignado
- ✅ Botón "Ir al Panel de Conductor"

**Si NO es conductor**:
- ✅ Card naranja "Activar Modo Conductor"
- ✅ Subtítulo: "Ingresa tu código de empleado"
- ✅ Click → Navega a `ActivateDriverScreen`
- ✅ Flecha de navegación (→)

**Oculto para usuarios anónimos**:
```typescript
{!isAnonymous && (
  <View>
    {/* Sección Modo Conductor */}
  </View>
)}
```

---

## 🔧 Configuración de Firestore

### Colección: `driverCodes`

```
driverCodes/
  ├── {employeeId}  (ID del documento)
  │   ├── employeeId: string
  │   ├── company: string
  │   ├── licenseNumber: string
  │   ├── busNumber: string
  │   ├── route: string (opcional)
  │   ├── isActive: boolean
  │   ├── assignedTo: string (opcional, uid del usuario)
  │   ├── assignedAt: Timestamp (opcional)
  │   └── createdAt: Timestamp
```

### Security Rules Requeridas:

```javascript
match /driverCodes/{codeId} {
  // Usuarios autenticados pueden leer (necesario para validación)
  allow read: if request.auth != null;
  
  // Solo admins pueden modificar
  allow write: if request.auth != null && 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

### Actualización de Rules para `users`:

```javascript
match /users/{userId} {
  // ... reglas existentes ...
  
  // Permitir actualización cuando se activa modo conductor
  allow update: if isOwner(userId) && 
                   // Puede cambiar isDriver y driverStatus al activar
                   (request.resource.data.driverStatus in ['none', 'active']);
}
```

---

## 📂 Archivos Eliminados/Obsoletos

### ❌ `ApplyDriverScreen.tsx`
- Ya no es necesario
- Reemplazado por `ActivateDriverScreen.tsx`
- Contenía lógica de solicitudes y aprobaciones manuales

### ❌ `FIREBASE_DRIVER_SETUP.md`
- Contenía instrucciones para sistema de aprobación manual
- Reemplazado por `DRIVER_CODES_EXAMPLES.md`

---

## 🎯 Flujo Completo del Usuario

### Para Usuarios Regulares:

```
1. Usuario registrado entra a la app
2. Va a Configuración
3. Ve sección "Modo Conductor"
4. Click en "Activar Modo Conductor"
5. Rellena formulario:
   - Número de Empleado
   - Empresa
   - Licencia
6. Submit → Validación automática
7. Si válido: ✅ Modo conductor activado
   - Navega automáticamente al Panel Conductor
   - Aparece opción "Panel Conductor" en menú
8. Si inválido: ❌ Mensaje de error específico
```

### Para Conductores Activos:

```
1. Usuario ya conductor entra a la app
2. Ve ícono 🚌 en el menú
3. Opciones disponibles:
   - "Panel Conductor" en menú hamburguesa
   - "Modo Conductor" en Configuración (muestra estado activo)
4. Puede iniciar/detener modo conductor desde panel
```

---

## 🔐 Validaciones Implementadas

### ✅ Validación de Código:
- Código debe existir en `driverCodes`
- Código debe tener `isActive: true`
- Código no debe estar asignado (`assignedTo` vacío o igual al usuario actual)

### ✅ Validación de Empresa:
- Comparación case-insensitive
- Debe coincidir exactamente con `driverCodes.company`

### ✅ Validación de Licencia:
- Comparación case-insensitive
- Debe coincidir exactamente con `driverCodes.licenseNumber`

### ✅ Validación de Autenticación:
- Usuario no puede ser anónimo
- Debe estar autenticado con Firebase Auth

### ✅ Prevención de Reuso:
- Una vez asignado, el código no puede usarse por otro usuario
- Se guarda `assignedTo` y `assignedAt` en el documento del código

---

## 📱 Interfaces de Usuario

### 1. ActivateDriverScreen
- **Ruta**: `activateDriver`
- **Acceso desde**: 
  - Configuración → "Activar Modo Conductor"
  - Menú → "Activar Modo Conductor"
- **Estados**:
  - Formulario (usuario no conductor)
  - Ya activado (conductor activo)

### 2. SettingsScreen - Sección Modo Conductor
- **Visibilidad**: Solo usuarios NO anónimos
- **Variantes**:
  - Card naranja → Activar (no conductor)
  - Card verde → Activo (conductor)

### 3. HamburgerMenu
- **Opción dinámica**:
  - "Activar Modo Conductor" (no conductor)
  - "Panel Conductor" (conductor activo)

---

## 🧪 Testing

### Datos de Prueba:
Ver `DRIVER_CODES_EXAMPLES.md` para códigos de ejemplo

### Casos de Prueba:
1. ✅ Activación exitosa con código válido
2. ❌ Código inexistente
3. ❌ Empresa incorrecta
4. ❌ Licencia incorrecta
5. ❌ Código desactivado (`isActive: false`)
6. ❌ Código ya usado por otro usuario
7. ✅ Usuario intenta con su propio código usado (permitido)

---

## 🚀 Ventajas del Nuevo Sistema

### vs Sistema de Aprobación Manual:

| Aspecto | Sistema Anterior | Sistema Nuevo |
|---------|-----------------|---------------|
| **Tiempo de activación** | Horas/días (espera admin) | Instantáneo |
| **Intervención humana** | Siempre requerida | Automática |
| **Estados** | 4 (none, pending, approved, rejected) | 3 (none, active, suspended) |
| **Complejidad** | Alta (formularios, notificaciones, panel admin) | Baja (código + validación) |
| **Experiencia UX** | Frustrante (espera) | Fluida (inmediata) |
| **Escalabilidad** | Limitada por admins | Ilimitada |
| **Seguridad** | Basada en revisión manual | Basada en códigos únicos |
| **Gestión** | Panel admin + notificaciones | Pre-generación de códigos |

### Beneficios Clave:
- ✅ **Activación instantánea** sin esperas
- ✅ **Menos código** y mantenimiento más simple
- ✅ **Mejor UX** para conductores
- ✅ **Seguro** mediante códigos únicos y validaciones
- ✅ **Escalable** sin límite de conductores
- ✅ **Trazable** (quién usó qué código)
- ✅ **Profesional** (tipo sistema de códigos de activación de software)

---

## 📊 Próximos Pasos Sugeridos

### Corto Plazo:
1. ✅ Agregar códigos de ejemplo a Firestore
2. ✅ Probar flujo completo de activación
3. ⏳ Implementar panel admin para gestionar códigos
4. ⏳ Agregar búsqueda de códigos disponibles/usados

### Mediano Plazo:
5. ⏳ Sistema de generación automática de códigos
6. ⏳ Notificación push cuando código es activado
7. ⏳ Dashboard de métricas de conductores activos
8. ⏳ Función de desactivar/reactivar códigos

### Largo Plazo:
9. ⏳ Expiración automática de códigos (ej: 1 año)
10. ⏳ Integración con sistema de nómina/RH
11. ⏳ Validación adicional con foto del conductor
12. ⏳ Sistema de códigos temporales (conductores suplentes)

---

## 📝 Notas Finales

- Todos los archivos obsoletos del sistema anterior pueden eliminarse
- El sistema es compatible con la estructura existente de `UserProfile`
- Los conductores existentes (si los hay) deben migrarse manualmente
- Security rules deben actualizarse en Firebase Console
- Los códigos de conductor deben pre-generarse en Firestore

---

## ✨ Créditos

**Sistema diseñado para**: BusNow - Transporte Inteligente  
**Fecha de implementación**: 13 de Noviembre, 2025  
**Arquitectura**: Validación automática con códigos únicos
