# 🔧 Scripts de Configuración

## 📋 Inicialización de Códigos de Conductor

### `initDriverCodes.js`

Script para cargar códigos de conductor iniciales en Firestore.

---

## 🚀 Cómo Usar

### 1. Descargar Service Account Key

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **app-busnow**
3. Ve a **Project Settings** (⚙️ en la barra lateral)
4. Click en pestaña **Service Accounts**
5. Click en **Generate new private key**
6. Guarda el archivo como `serviceAccountKey.json` en la raíz del proyecto
7. **⚠️ IMPORTANTE**: Este archivo contiene credenciales sensibles. NUNCA lo subas a Git.

### 2. Instalar Dependencias

```bash
npm install firebase-admin
```

### 3. Ejecutar Script

```bash
node scripts/initDriverCodes.js
```

### 4. Verificar

Ve a Firebase Console → Firestore Database y verifica que la colección `driverCodes` tenga los documentos.

---

## 📊 Códigos Incluidos

| ID | Empresa | Licencia | Bus | Estado |
|----|---------|----------|-----|--------|
| EMP-2024-001 | TransportesPTY | PA-1234567 | 15A | ✅ Activo |
| EMP-2024-002 | MetroBus | PA-7654321 | 23B | ✅ Activo |
| RBUS-301 | RápidoBus | PA-9876543 | 07 | ✅ Activo |
| URB-E-205 | Urbanos del Este | PA-5551234 | 42 | ✅ Activo |
| TEST-001 | TransportesDemo | PA-0000001 | 99 | ✅ Activo |
| EMP-2023-999 | TransportesPTY | PA-9999999 | 99X | ❌ Inactivo |

---

## 🧪 Probar en la App

### Código de Prueba Recomendado:

```
Número de Empleado: EMP-2024-001
Empresa: TransportesPTY
Licencia: PA-1234567
```

### Resultado Esperado:
✅ Modo conductor activado → Bus 15A, Ruta: Albrook - Costa del Este

---

## 🔐 Seguridad

### Archivos en `.gitignore`:
```
serviceAccountKey.json
*-firebase-adminsdk-*.json
```

### ⚠️ NO COMPARTIR:
- Service Account Key
- Credenciales de Firebase
- Códigos de empleado reales en repositorio público

---

## 📝 Agregar Más Códigos

Edita `scripts/initDriverCodes.js` y agrega objetos al array `driverCodes`:

```javascript
{
  employeeId: "TU-CODIGO-AQUI",
  company: "NombreEmpresa",
  licenseNumber: "PA-XXXXXXX",
  busNumber: "15A",
  route: "Ruta Opcional",
  isActive: true,
  createdAt: admin.firestore.Timestamp.now()
}
```

---

## 🛠️ Troubleshooting

### Error: "Cannot find module '../serviceAccountKey.json'"
**Solución**: Descarga el Service Account Key desde Firebase Console.

### Error: "Permission denied"
**Solución**: Asegúrate de que el Service Account tiene permisos de admin.

### Error: "Already exists"
**Solución**: Los códigos ya fueron agregados. Puedes eliminarlos en Firestore Console o cambiar los IDs.

---

## 📚 Recursos

- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)
- [Firestore Batch Writes](https://firebase.google.com/docs/firestore/manage-data/transactions#batched-writes)
- [Service Accounts](https://firebase.google.com/docs/admin/setup#initialize-sdk)

---

## ✨ Próximos Pasos

1. ✅ Ejecutar script para agregar códigos
2. ⏳ Probar activación en la app
3. ⏳ Crear panel admin para gestionar códigos
4. ⏳ Implementar generación automática de códigos
