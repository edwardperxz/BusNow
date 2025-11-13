# 🔐 Guía de Seguridad - API Keys

## ⚠️ IMPORTANTE: API Key Expuesta Detectada

GitGuardian detectó una **Google API Key** expuesta en el repositorio el **12 de noviembre de 2025**.

### 🚨 Acciones Críticas Requeridas

#### 1. **REVOCAR la API Key Inmediatamente**

1. Ve a [Google Cloud Console - Credentials](https://console.cloud.google.com/apis/credentials)
2. Localiza la key: `AIzaSyCdDwvK5nerbPRPwYEo2OD4x_oZ89hU9ew`
3. Haz clic en **"Delete"** o **"Regenerate"**
4. Crea una **nueva API Key**

#### 2. **Restringir la Nueva API Key**

En Google Cloud Console, configura restricciones:

**Restricciones de Aplicación:**
- Selecciona "Restricciones de referente HTTP"
- Agrega tus dominios autorizados:
  ```
  localhost:*
  *.tu-dominio.com
  ```

**Restricciones de API:**
- Limita solo a las APIs necesarias:
  - ✅ Maps JavaScript API
  - ✅ Directions API
  - ✅ Geocoding API
  - ❌ Deshabilita todas las demás

#### 3. **Actualizar Configuración Local**

1. Copia el archivo de ejemplo:
   ```bash
   cp firebase/functions/.runtimeconfig.example.json firebase/functions/.runtimeconfig.json
   ```

2. Edita `firebase/functions/.runtimeconfig.json` con la **nueva key**:
   ```json
   {
     "maps": {
       "key": "TU_NUEVA_API_KEY_AQUI"
     }
   }
   ```

3. **NUNCA** commitees este archivo (ya está en `.gitignore`)

#### 4. **Verificar Variables de Entorno**

Asegúrate de que `.env` tampoco esté commiteado:
- ✅ `.env` está en `.gitignore`
- ✅ Solo usa `.env.example` en el repo
- ✅ Mantén las keys reales **solo localmente**

#### 5. **Desplegar en Firebase Functions**

Para desplegar la nueva key en Firebase Functions:

```bash
cd firebase/functions
firebase functions:config:set maps.key="TU_NUEVA_API_KEY"
firebase deploy --only functions
```

---

## 📋 Checklist de Seguridad

- [ ] Revocar la API key expuesta en Google Cloud Console
- [ ] Crear nueva API key con restricciones apropiadas
- [ ] Actualizar `.runtimeconfig.json` localmente (sin commitear)
- [ ] Actualizar `.env` localmente (sin commitear)
- [ ] Desplegar nueva configuración a Firebase Functions
- [ ] Verificar que `.gitignore` incluye archivos sensibles
- [ ] Revisar logs de uso de la API key antigua (por posibles abusos)
- [ ] Cerrar el alert en GitHub como "Revoked"

---

## 🛡️ Mejores Prácticas

### ✅ Hacer:
- Usar variables de entorno para todas las credenciales
- Agregar archivos de configuración sensibles a `.gitignore`
- Usar archivos `.example` o `.template` para documentar estructura
- Rotar keys periódicamente
- Configurar restricciones de API en Google Cloud

### ❌ NO Hacer:
- Commitear archivos `.env` o `.runtimeconfig.json`
- Hardcodear API keys en el código
- Compartir keys en mensajes o documentos
- Usar la misma key en múltiples proyectos
- Dejar keys sin restricciones

---

## 🔍 Monitoreo

Después de revocar la key, revisa:

1. **Google Cloud Console → APIs & Services → Credentials**
   - Verifica que la key antigua esté eliminada
   - Confirma que la nueva tenga restricciones

2. **Google Cloud Console → APIs & Services → Dashboard**
   - Revisa el tráfico de los últimos días
   - Busca picos inusuales de uso

3. **GitHub → Settings → Code security and analysis**
   - Cierra el alert como "Revoked"
   - Habilita "Push protection" para prevenir futuras exposiciones

---

## 📞 Contacto en Caso de Emergencia

Si detectas uso malicioso de la API key:

1. Revoca inmediatamente la key en Google Cloud
2. Revisa los logs de facturación
3. Contacta a Google Cloud Support si hay cargos inusuales
4. Documenta cualquier actividad sospechosa

---

**Última actualización:** 13 de noviembre de 2025
**Estado:** 🔴 Acción requerida - API Key expuesta pendiente de revocar
