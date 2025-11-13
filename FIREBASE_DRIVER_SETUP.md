# Configuración de Firebase para Sistema de Conductores

## 📋 Resumen del Sistema

Implementamos un sistema de **verificación de conductores con aprobación administrativa** donde:
- Todos los usuarios se registran como pasajeros normales
- Los conductores deben **solicitar** y ser **aprobados** por un administrador
- Un usuario puede ser pasajero y conductor simultáneamente
- El estado del conductor se gestiona mediante `driverStatus`: `none`, `pending`, `approved`, `rejected`, `suspended`

---

## 🔧 Configuración en Firebase Console

### 1. Firebase Authentication - Ya Configurado ✅
- **Email/Password**: Ya habilitado
- No requiere configuración adicional por ahora

### 2. Firestore Database - Estructura de Datos

#### Colección: `users` (Ya existe)
```javascript
users/{userId} = {
  // Datos básicos (ya existentes)
  uid: string,
  email: string,
  name: string,
  phone?: string,
  role: 'user' | 'admin',
  
  // NUEVO: Campos de conductor
  isDriver: boolean,              // true si es conductor activo
  driverStatus: 'none' | 'pending' | 'approved' | 'rejected' | 'suspended',
  
  // NUEVO: Solicitud de conductor (si existe)
  driverApplication?: {
    licenseNumber: string,
    busNumber: string,
    licensePhotoURL: string,
    yearsExperience?: number,
    reason?: string,
    appliedAt: Timestamp,
    reviewedAt?: Timestamp,
    reviewedBy?: string,        // uid del admin que revisó
    rejectionReason?: string     // si fue rechazada
  },
  
  // NUEVO: Info de conductor activo (solo si aprobado)
  driverInfo?: {
    licenseNumber: string,
    busNumber: string,
    licensePhotoURL: string,
    approvedAt: Timestamp,
    approvedBy: string
  },
  
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

#### Colección: `driverApplications` (NUEVA - Para Panel Admin)
```javascript
driverApplications/{applicationId} = {
  userId: string,               // Referencia al usuario
  userName: string,             // Para mostrar en lista
  userEmail: string,
  
  // Datos de la solicitud
  licenseNumber: string,
  busNumber: string,
  licensePhotoURL: string,
  yearsExperience?: number,
  reason?: string,
  
  // Estado
  status: 'pending' | 'approved' | 'rejected',
  
  // Fechas
  createdAt: Timestamp,
  reviewedAt?: Timestamp,
  reviewedBy?: string,          // uid del admin
  rejectionReason?: string,
  
  // Metadata
  deviceInfo?: object,
  ipAddress?: string
}
```

### 3. Firestore Security Rules

Agregar estas reglas en **Firestore → Rules**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper: usuario autenticado
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Función helper: es el propietario del documento
    function isOwner(userId) {
      return isSignedIn() && request.auth.uid == userId;
    }
    
    // Función helper: es administrador
    function isAdmin() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Función helper: es conductor aprobado
    function isApprovedDriver() {
      return isSignedIn() && 
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isDriver == true &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.driverStatus == 'approved';
    }
    
    // Colección de usuarios
    match /users/{userId} {
      // Leer: propio perfil o admin
      allow read: if isOwner(userId) || isAdmin();
      
      // Crear: solo durante registro (campos limitados)
      allow create: if isSignedIn() && 
                       isOwner(userId) &&
                       request.resource.data.role == 'user' &&
                       request.resource.data.isDriver == false &&
                       request.resource.data.driverStatus == 'none';
      
      // Actualizar perfil básico: solo el propietario
      allow update: if isOwner(userId) && 
                       // No puede cambiar role, isDriver, driverStatus directamente
                       request.resource.data.role == resource.data.role &&
                       request.resource.data.isDriver == resource.data.isDriver &&
                       // Solo puede cambiar driverStatus de 'none' a 'pending' (solicitud)
                       (request.resource.data.driverStatus == resource.data.driverStatus ||
                        (resource.data.driverStatus == 'none' && request.resource.data.driverStatus == 'pending'));
      
      // Admin puede actualizar cualquier cosa
      allow update: if isAdmin();
      
      // Eliminar: solo admin
      allow delete: if isAdmin();
    }
    
    // Colección de solicitudes de conductor
    match /driverApplications/{applicationId} {
      // Leer: propietario o admin
      allow read: if isSignedIn() && 
                     (resource.data.userId == request.auth.uid || isAdmin());
      
      // Crear: usuario autenticado, solo su propia solicitud
      allow create: if isSignedIn() && 
                       request.resource.data.userId == request.auth.uid &&
                       request.resource.data.status == 'pending';
      
      // Actualizar/Eliminar: solo admin
      allow update, delete: if isAdmin();
    }
    
    // Otras colecciones existentes...
    match /routes/{routeId} {
      allow read: if true;
      allow write: if isAdmin() || isApprovedDriver();
    }
    
    match /buses/{busId} {
      allow read: if true;
      allow write: if isApprovedDriver();
    }
  }
}
```

### 4. Firebase Custom Claims (FUTURO - Recomendado)

Para mejorar la seguridad, implementar **Custom Claims** mediante una Cloud Function:

#### Cloud Function: `setDriverClaims`
```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// Llamar esta función cuando un admin aprueba/rechaza una solicitud
export const setDriverClaims = functions.firestore
  .document('users/{userId}')
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const userId = context.params.userId;
    
    // Si cambió el driverStatus a 'approved'
    if (before.driverStatus !== 'approved' && after.driverStatus === 'approved') {
      // Establecer custom claim
      await admin.auth().setCustomUserClaims(userId, {
        driver: true,
        busNumber: after.driverInfo?.busNumber || ''
      });
      
      console.log(`Custom claims set for driver: ${userId}`);
    }
    
    // Si cambió de 'approved' a otro estado (suspendido/rechazado)
    if (before.driverStatus === 'approved' && after.driverStatus !== 'approved') {
      // Remover custom claim
      await admin.auth().setCustomUserClaims(userId, {
        driver: false
      });
      
      console.log(`Custom claims removed for driver: ${userId}`);
    }
  });
```

**Beneficios de Custom Claims:**
- Verificación del lado del servidor (más seguro)
- No requiere lectura adicional de Firestore en security rules
- Se puede verificar en Cloud Functions
- El token JWT incluye la información

**Uso en Security Rules con Custom Claims:**
```javascript
function isApprovedDriver() {
  return isSignedIn() && request.auth.token.driver == true;
}
```

### 5. Storage Rules (Para fotos de licencia)

Si usas Firebase Storage para las fotos:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // Fotos de licencias de conductor
    match /licenses/{userId}/{fileName} {
      // Solo el propietario puede subir/ver su licencia
      allow read, write: if request.auth != null && 
                           request.auth.uid == userId;
      
      // Admin puede ver todas las licencias
      allow read: if request.auth != null &&
                     firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.role == 'admin';
      
      // Validación de archivo
      allow write: if request.resource.size < 5 * 1024 * 1024 && // Max 5MB
                      request.resource.contentType.matches('image/.*');
    }
  }
}
```

---

## 🚀 Flujo de Trabajo Completo

### Usuario Solicita Ser Conductor:
1. Usuario autenticado va a "Ser Conductor" en el menú
2. Completa el formulario (`ApplyDriverScreen`)
3. Sube foto de licencia
4. Se crea documento en `driverApplications` (status: 'pending')
5. Se actualiza `users/{uid}` con `driverStatus: 'pending'` y `driverApplication`
6. Usuario ve estado "Solicitud en Revisión"

### Admin Revisa Solicitud:
1. Admin accede a panel de solicitudes pendientes
2. Ve lista de `driverApplications` donde `status == 'pending'`
3. Revisa información y foto de licencia
4. **Aprobar:**
   - Actualiza `driverApplications/{id}`: `status: 'approved'`, `reviewedAt`, `reviewedBy`
   - Actualiza `users/{uid}`:
     - `isDriver: true`
     - `driverStatus: 'approved'`
     - `driverInfo: { ... }`
   - (Futuro) Cloud Function establece Custom Claims
5. **Rechazar:**
   - Actualiza `driverApplications/{id}`: `status: 'rejected'`, `rejectionReason`
   - Actualiza `users/{uid}`: `driverStatus: 'rejected'`

### Usuario Conductor Aprobado:
1. Recibe notificación de aprobación
2. Ve "Panel Conductor" en el menú
3. Puede activar modo conductor en `DriverScreen`
4. Tiene permisos para actualizar ubicación del bus

---

## 📝 Tareas Pendientes

### Implementación Inmediata:
- ✅ Definir tipos TypeScript para el sistema
- ✅ Crear `ApplyDriverScreen` con formulario
- ✅ Actualizar `AuthContext` con `applyForDriver()`
- ✅ Agregar opción "Ser Conductor" al menú
- ⏳ **Crear Panel Admin para revisar solicitudes** (PRÓXIMO)
- ⏳ Implementar subida de imágenes a Firebase Storage
- ⏳ Agregar notificaciones push cuando cambia el estado

### Implementación Futura:
- ⏳ Cloud Function para Custom Claims
- ⏳ Cloud Function para enviar email de aprobación/rechazo
- ⏳ Sistema de suspensión temporal de conductores
- ⏳ Dashboard de métricas para conductores
- ⏳ Sistema de reportes y quejas

---

## 🔐 Seguridad

### Puntos Críticos:
1. **Validación de Licencia**: Implementar OCR o validación manual de fotos
2. **Verificación de Identidad**: Considerar integración con sistemas gubernamentales
3. **Monitoreo**: Log de todas las aprobaciones/rechazos con admin que lo realizó
4. **Rate Limiting**: Limitar solicitudes (máximo 1 por usuario)
5. **Auditoría**: Guardar histórico de cambios de estado

### Recomendaciones:
- No permitir que un conductor rechazado aplique inmediatamente de nuevo
- Requerir tiempo de espera (ej: 30 días) entre solicitudes rechazadas
- Implementar sistema de quejas que pueda suspender conductor
- Revisar licencias periódicamente (ej: cada 6 meses)

---

## 📱 Flujo de Usuario en la App

```
REGISTRO → Usuario Normal
           ↓
MENÚ → "Ser Conductor"
           ↓
SOLICITUD → Completa Formulario
           ↓
PENDIENTE → Espera Revisión (puede usar app como pasajero)
           ↓
       ┌───┴────┐
   APROBADO  RECHAZADO
       ↓         ↓
   Panel     Ver motivo
 Conductor   (puede reintentar)
```

---

## 💡 Preguntas Frecuentes

**P: ¿Necesito crear cuentas de admin manualmente?**  
R: Sí, por seguridad. Crea el usuario normal, luego cambia manualmente en Firestore Console: `role: 'admin'`

**P: ¿Los Custom Claims son obligatorios?**  
R: No, pero son MUY recomendados para seguridad. Sin ellos, un usuario malicioso podría modificar su documento en Firestore (si las rules no están perfectas).

**P: ¿Cómo subo las fotos a Firebase Storage?**  
R: Usa Firebase Storage SDK. Ya tengo `expo-image-picker` instalado para seleccionar la imagen. Necesitas agregar código para subirla.

**P: ¿Puedo hacer el panel admin en la misma app?**  
R: Sí, puedes agregar una pantalla `AdminDashboardScreen` que solo se muestre si `role === 'admin'`

---

## 🎯 Próximo Paso Recomendado

**Crear Panel de Administración** para revisar y aprobar/rechazar solicitudes de conductores.

¿Quieres que te ayude a implementar el panel admin o prefieres primero probar el flujo de solicitud?
