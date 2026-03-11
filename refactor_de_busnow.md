# Refactor de BusNow

# Limitaciones de la arquitectura actual

El MVP actual utiliza principalmente **Firebase** como backend gestionado.

Problemas detectados:

## Acoplamiento fuerte a Firebase

- Lógica de negocio mezclada con servicios del proveedor.
- Difícil migrar a otro backend.
- Escalabilidad limitada para lógica compleja.

## Cálculo de ETA costoso

Cada recalculo llama a:

- Google Maps Directions API

Esto genera:

- Costos por request
- Dependencia externa fuerte
- Latencia innecesaria

## Lógica crítica en el cliente

Actualmente el cliente controla:

- listeners
- debounce
- triggers de ETA

Esto es riesgoso porque:

- los clientes no son confiables
- puede generar abuso de APIs

# Objetivos del Refactor

El refactor busca:

## Separar responsabilidades del sistema

Dividir en:

- Cliente móvil
- Backend de dominio
- Servicios de terceros

### Reducir dependencia de Firebase

Mantener Firebase solo para:

- autenticación
- mensajería
- notificaciones

### Centralizar la lógica de negocio

Mover al backend:

- cálculo ETA
- gestión de rutas
- validación de ubicaciones

### Mejorar escalabilidad

Preparar el sistema para:

- múltiples rutas
- cientos de buses
- miles de pasajeros

# Arquitecturas Propuestas

## Arquitectura general

Se propone una arquitectura modular basada en servicios.

Componentes principales:

```bash
		 Frontend
        │
        │ HTTPS
        ▼
Firebase Services
 ├── Firebase Authentication
 │
 ├── Cloud Functions (Backend)
 │     ├── API endpoints
 │     ├── lógica de negocio
 │     ├── validaciones
 │     └── integraciones externas
 │
 ├── Firestore (Base de datos)
 │
 └── Cloud Storage
```

## Arquitectura del proyecto

```bash
project-root
│
├── functions
│   │
│   ├── src
│   │   │
│   │   ├── config
│   │   │   └── firebase.ts
│   │   │
│   │   ├── modules
│   │   │   │
│   │   │   ├── users
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   └── user.repository.ts
│   │   │   │
│   │   │   ├── auth
│   │   │   │   ├── auth.middleware.ts
│   │   │   │   └── auth.service.ts
│   │   │   │
│   │   │   ├── orders
│   │   │   │   ├── order.controller.ts
│   │   │   │   ├── order.service.ts
│   │   │   │   └── order.repository.ts
│   │   │
│   │   ├── routes
│   │   │   └── index.ts
│   │   │
│   │   ├── utils
│   │   │   ├── logger.ts
│   │   │   └── validators.ts
│   │   │
│   │   └── index.ts
│   │
│   ├── package.json
│   └── tsconfig.json
│
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
└── README.md
```

# Propuesta de Stack

## Frontend (Aplicación Móvil)

### React Native

Se mantendrá el mismo framework móvil ya que como el público destino son los usuarios de mobile funciona a la perfección.

**Mejora respecto a la implementación anterior:**

Pulir pequeños detalles de arquitectura, separando interfaces de usuario de la lógica de negocio y mejorando la mantenibilidad del proyecto.

### Expo

De igual forma se mantiene para poder aprovechar las funcionalidades nativas de mobile.

### React Navigation

Se usará como sistema de navegación entre pantallas dentro de la aplicación.

**Mejora respecto a la implementación anterior:**

La navegación se reorganizará separando rutas públicas y rutas autenticadas, permitiendo controlar el acceso según el estado del usuario.

### React Native Maps

Se usará para renderizar mapas dentro de la aplicación y visualizar rutas, buses y paradas.

**Implementación dentro del proyecto:**

Se optimizará la actualización de marcadores para buses activos, reduciendo renderizados innecesarios y mejorando el rendimiento del mapa.

### Zustand

Se usará como gestor de estado global para manejar información compartida entre componentes, como el usuario autenticado y los buses activos.

**Implementación dentro del proyecto:**

Su implementación busca eliminar la duplicidad de estados en diferentes componentes así al gestionar datos como:

- usuario autenticado
- buses activos
- estado del mapa

---

## Backend (Lógica Serverless)

### Firebase Cloud Functions

Se usará para ejecutar lógica de negocio en el backend, como el cálculo de ETA y la validación de ubicaciones de buses.

**Implementación dentro del proyecto:**

La lógica crítica se moverá desde el cliente hacia el backend, reduciendo riesgos de seguridad y evitando llamadas directas a APIs externas.

Las funciones principales que manejará serán:

- cálculo de ETA
- validación de ubicaciones
- integración con APIs externas
- control de eventos del sistema

### Firebase Cloud Messaging

Su función de enviar notificaciones push a los dispositivos móviles se mantiene igual con el leve cambio de que se active mediante eventos generados desde Cloud Functions.

---

## Base de Datos y Autenticación

### Cloud Firestore

Se usará como base de datos principal para almacenar información del sistema.

**Implementación dentro del proyecto:**

Se utilizará para almacenar:

- usuarios
- rutas
- paradas
- buses activos
- ubicaciones en tiempo real

El modelo de datos será reorganizado para mejorar la eficiencia de las consultas.

### Firebase Authentication

Se mantiene su funcionalidad de autenticación de usuarios y validación de roles.

---

## Integraciones Externas

### Google Maps Platform

Se utilizará como proveedor de servicios de mapas para visualizar información geográfica dentro de la aplicación.

**Mejora respecto a la implementación anterior**

Se optimizará la interacción con el mapa limitando actualizaciones innecesarias del estado del mapa.

### Google Maps Directions API

Se usará para calcular rutas y estimaciones de tiempo de llegada entre buses y paradas.

**Mejora respecto a la implementación anterior**

Las solicitudes se gestionarán desde Cloud Functions para controlar el uso de la API y reducir llamadas repetidas desde el cliente.

# Soluciones Técnicas a las Limitantes del Sistema

El refactor propone varias mejoras para resolver los problemas detectados en la arquitectura actual.

## Problema 1: Acoplamiento fuerte a Firebase

### Descripción

La lógica de negocio se encuentra mezclada con llamadas directas a Firebase desde el cliente lo cual no es una práctica mantenible a largo plazo.

### Solución

Se implementará una capa de servicios en el cliente que actuará como intermediaria entre la interfaz y Firebase.

Ejemplo de estructura:

```
services/

authService
busService
routeService
etaService
```

## Problema 2: Cálculo de ETA costoso

### Problema

Cada cálculo de ETA genera una llamada directa a:

- Google Maps Directions API

Esto provoca:

- costos elevados por request
- latencia innecesaria
- dependencia directa del cliente.

## Solución

El cálculo de ETA se moverá al backend utilizando Firebase Cloud Functions.

Antes de llamar a la API externa, se implementará una **capa de caché en Firestore**.

## Flujo propuesto

```
Cliente solicita ETA
↓
Cloud Function recibe solicitud
↓
Consultar caché en Firestore
↓
Si existe ETA reciente → devolver resultado
↓
Si no existe → llamar Directions API
↓
Guardar resultado en caché
↓
Responder al cliente
```

## Problema 3: Lógica crítica en el cliente

### Problema

El cliente actualmente controla la frecuencia de las consultas a APIs y los triggers de cálculo lo cual no es factible ya que puede generar sobrecostos al abusar de estos servicios:

### Solución

La lógica crítica del sistema se moverá a Firebase Cloud Functions haciendo que se encargue por completo de:

- validar ubicaciones de buses
- controlar la frecuencia de cálculos
- gestionar integraciones externas
- manejar eventos del sistema.

# Propuesta de Flujo de trabajo

## Semana 1 — Análisis del sistema actual

Durante esta semana se auditará el frontend buscando:

Identificar:

- endpoints
- lógica de negocio
- dependencias
- acceso a base de datos

Con la finalidad de definir bien:

- Qué lógica se moverá a **Firebase Cloud Functions**
- Qué datos migrarán a **Cloud Firestore**
- Qué seguirá en el sistema actual temporalmente

---

## Semana 2 — Infraestructura y capa de compatibilidad

Confirmar el Cloud Functions y adecuar el Firebase para la migración del backend.

Revisar/reajustar y configurar:

- Firebase Authentication
- Cloud Firestore
- Firebase Cloud Functions
- Estructura del backend serverless
- Implementar primer endpoint migrado

---

## Semana 4 y 5 — Migración de módulos principales

Mover las funciones identificadas en la semana 1 a Cloud Functions, crear capas de validación y middleware y optimizar las queries. 

---

# Semana 6 — QA

## Pruebas principales

### Regression testing

Verificar que:

- endpoints antiguos siguen funcionando
- comportamiento no cambió

### Unit testing

Servicios refactorizados.

Herramienta típica:

### API testing

Probar endpoints con Postman (O lo que vayan a usar XD)

## Pruebas secundarias

- flujos de usuario
- autenticación
- permisos
- edge cases
- pruebas de carga
- seguridad
- manejo de errores