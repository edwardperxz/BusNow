# Códigos de Conductor de Ejemplo para Testing

## 📋 Estructura en Firestore

Estos códigos deben agregarse manualmente a Firestore en la colección `driverCodes`.

### Colección: `driverCodes`

Cada documento tiene como ID el `employeeId`.

---

## 🚌 Códigos de Ejemplo

### 1. Conductor de TransportesPTY

```json
// Documento ID: EMP-2024-001
{
  "employeeId": "EMP-2024-001",
  "company": "TransportesPTY",
  "licenseNumber": "PA-1234567",
  "busNumber": "15A",
  "route": "Albrook - Costa del Este",
  "isActive": true,
  "createdAt": "2024-11-13T00:00:00.000Z"
}
```

### 2. Conductor de MetroBus

```json
// Documento ID: EMP-2024-002
{
  "employeeId": "EMP-2024-002",
  "company": "MetroBus",
  "licenseNumber": "PA-7654321",
  "busNumber": "23B",
  "route": "Corredor Norte",
  "isActive": true,
  "createdAt": "2024-11-13T00:00:00.000Z"
}
```

### 3. Conductor de RápidoBus

```json
// Documento ID: RBUS-301
{
  "employeeId": "RBUS-301",
  "company": "RápidoBus",
  "licenseNumber": "PA-9876543",
  "busNumber": "07",
  "route": "Express Tocumen",
  "isActive": true,
  "createdAt": "2024-11-13T00:00:00.000Z"
}
```

### 4. Conductor de Urbanos del Este

```json
// Documento ID: URB-E-205
{
  "employeeId": "URB-E-205",
  "company": "Urbanos del Este",
  "licenseNumber": "PA-5551234",
  "busNumber": "42",
  "route": "Don Bosco - San Francisco",
  "isActive": true,
  "createdAt": "2024-11-13T00:00:00.000Z"
}
```

### 5. Código Desactivado (para probar validación)

```json
// Documento ID: EMP-2023-999
{
  "employeeId": "EMP-2023-999",
  "company": "TransportesPTY",
  "licenseNumber": "PA-9999999",
  "busNumber": "99X",
  "route": "Ruta Inactiva",
  "isActive": false,
  "createdAt": "2023-01-01T00:00:00.000Z"
}
```

---

## 🔧 Cómo Agregar los Códigos en Firebase Console

### Método 1: Desde Firebase Console (Manual)

1. Ve a Firebase Console → Firestore Database
2. Crea una nueva colección llamada `driverCodes`
3. Para cada código:
   - Click en "Agregar documento"
   - **ID del documento**: Usa el `employeeId` (ej: `EMP-2024-001`)
   - Agrega los campos uno por uno según el JSON

### Método 2: Script de Inicialización (Recomendado)

Crea un archivo `initDriverCodes.js` en tu proyecto:

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./path/to/serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const driverCodes = [
  {
    employeeId: "EMP-2024-001",
    company: "TransportesPTY",
    licenseNumber: "PA-1234567",
    busNumber: "15A",
    route: "Albrook - Costa del Este",
    isActive: true,
    createdAt: new Date()
  },
  {
    employeeId: "EMP-2024-002",
    company: "MetroBus",
    licenseNumber: "PA-7654321",
    busNumber: "23B",
    route: "Corredor Norte",
    isActive: true,
    createdAt: new Date()
  },
  {
    employeeId: "RBUS-301",
    company: "RápidoBus",
    licenseNumber: "PA-9876543",
    busNumber: "07",
    route: "Express Tocumen",
    isActive: true,
    createdAt: new Date()
  },
  {
    employeeId: "URB-E-205",
    company: "Urbanos del Este",
    licenseNumber: "PA-5551234",
    busNumber: "42",
    route: "Don Bosco - San Francisco",
    isActive: true,
    createdAt: new Date()
  }
];

async function initCodes() {
  const batch = db.batch();
  
  driverCodes.forEach(code => {
    const docRef = db.collection('driverCodes').doc(code.employeeId);
    batch.set(docRef, code);
  });
  
  await batch.commit();
  console.log('✅ Códigos de conductor agregados exitosamente');
  process.exit(0);
}

initCodes().catch(error => {
  console.error('❌ Error:', error);
  process.exit(1);
});
```

Ejecutar: `node initDriverCodes.js`

---

## 🧪 Casos de Prueba

### Prueba 1: Activación Exitosa
- **Código**: `EMP-2024-001`
- **Empresa**: `TransportesPTY`
- **Licencia**: `PA-1234567`
- **Resultado Esperado**: ✅ Activación exitosa, redirige a Panel Conductor

### Prueba 2: Código Inválido
- **Código**: `CODIGO-FALSO`
- **Empresa**: `Cualquiera`
- **Licencia**: `Cualquiera`
- **Resultado Esperado**: ❌ "Código de empleado no válido"

### Prueba 3: Empresa Incorrecta
- **Código**: `EMP-2024-001`
- **Empresa**: `OtraEmpresa` (incorrecto)
- **Licencia**: `PA-1234567`
- **Resultado Esperado**: ❌ "La empresa no coincide con el código de empleado"

### Prueba 4: Licencia Incorrecta
- **Código**: `EMP-2024-001`
- **Empresa**: `TransportesPTY`
- **Licencia**: `PA-9999999` (incorrecto)
- **Resultado Esperado**: ❌ "El número de licencia no coincide con nuestros registros"

### Prueba 5: Código Desactivado
- **Código**: `EMP-2023-999`
- **Empresa**: `TransportesPTY`
- **Licencia**: `PA-9999999`
- **Resultado Esperado**: ❌ "Este código de empleado ha sido desactivado"

### Prueba 6: Código Ya Usado
- Activa `EMP-2024-001` con un usuario
- Intenta activar el mismo código con otro usuario
- **Resultado Esperado**: ❌ "Este código ya ha sido utilizado por otro usuario"

---

## 🔐 Security Rules para `driverCodes`

Agrega estas reglas en Firestore → Rules:

```javascript
match /driverCodes/{codeId} {
  // Solo lectura para usuarios autenticados (necesario para validación)
  allow read: if request.auth != null;
  
  // Solo admin puede crear/actualizar/eliminar códigos
  allow write: if request.auth != null && 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
}
```

---

## 📊 Índices Recomendados

Para mejorar el rendimiento, crea estos índices en Firestore:

1. **Índice compuesto**: `employeeId` (ASC) + `isActive` (ASC)
2. **Índice compuesto**: `company` (ASC) + `isActive` (ASC)
3. **Índice simple**: `assignedTo` (ASC)

---

## 💡 Generación Automática de Códigos

Para producción, considera implementar una Cloud Function que genere códigos automáticamente:

```typescript
// Ejemplo de estructura para generar códigos
function generateDriverCode(company: string): string {
  const prefix = company.substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 9999).toString().padStart(4, '0');
  return `${prefix}-${year}-${random}`;
}

// Ejemplo: "TRA-2024-0123"
```

---

## 📝 Notas Importantes

1. **Unicidad**: El `employeeId` debe ser único (es el ID del documento)
2. **Mayúsculas/Minúsculas**: La validación ignora mayúsculas en empresa y licencia
3. **Un Uso**: Una vez asignado a un usuario, el código no puede reutilizarse
4. **Activación**: Solo códigos con `isActive: true` pueden usarse
5. **Formato**: No hay restricciones de formato para los códigos, sé consistente

---

## 🚀 Próximos Pasos

1. Agregar los códigos de ejemplo a Firestore
2. Probar el flujo de activación con diferentes usuarios
3. Verificar que las validaciones funcionan correctamente
4. Implementar panel de admin para gestionar códigos
5. Agregar sistema de generación automática de códigos
