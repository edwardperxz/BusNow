/**
 * seed-firestore.js — Poblar Firestore con las rutas fijas de David, Chiriquí
 *
 * Uso:
 *   npm run db:seed
 *
 * Requisitos:
 *   - Tener .env en la raíz con EXPO_PUBLIC_FIREBASE_PROJECT_ID
 *   - Tener variable de entorno GOOGLE_APPLICATION_CREDENTIALS apuntando al
 *     service-account.json de Firebase Admin, O estar autenticado con:
 *     firebase login && firebase use <project-id>
 *
 * El script es idempotente: usa IDs fijos para que cada ejecución actualice
 * los documentos sin duplicarlos.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const https = require('https');

// ─── Cargar .env ─────────────────────────────────────────────────────────────
const projectRoot = path.resolve(__dirname, '..');

function loadEnv() {
  const envPath = path.join(projectRoot, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌  No encontré .env — copia .env.example a .env y configura EXPO_PUBLIC_FIREBASE_PROJECT_ID');
    process.exit(1);
  }
  const env = {};
  fs.readFileSync(envPath, 'utf8')
    .split('\n')
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx === -1) return;
      const key = trimmed.slice(0, eqIdx).trim();
      const value = trimmed.slice(eqIdx + 1).trim();
      env[key] = value;
    });
  return env;
}

const env = loadEnv();
const PROJECT_ID = env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

if (!PROJECT_ID) {
  console.error('❌  EXPO_PUBLIC_FIREBASE_PROJECT_ID no está definido en .env');
  process.exit(1);
}

// ─── Firebase Admin ───────────────────────────────────────────────────────────
// Usa firebase-admin de la carpeta functions (ya instalado).
const admin = require(path.join(projectRoot, 'functions', 'node_modules', 'firebase-admin'));

function resolveCredentialPath() {
  const fromEnv = (env.FIREBASE_SERVICE_ACCOUNT_PATH || process.env.FIREBASE_SERVICE_ACCOUNT_PATH || '').trim();
  const adcPath = (process.env.GOOGLE_APPLICATION_CREDENTIALS || '').trim();

  if (fromEnv) {
    const absolute = path.isAbsolute(fromEnv) ? fromEnv : path.join(projectRoot, fromEnv);
    if (!fs.existsSync(absolute)) {
      console.error(`❌  FIREBASE_SERVICE_ACCOUNT_PATH no existe: ${absolute}`);
      process.exit(1);
    }
    process.env.GOOGLE_APPLICATION_CREDENTIALS = absolute;
    return absolute;
  }

  if (adcPath && fs.existsSync(adcPath)) {
    return adcPath;
  }

  return null;
}

const credentialPath = resolveCredentialPath();

if (!admin.apps.length) {
  if (credentialPath) {
    const serviceAccount = require(credentialPath);
    admin.initializeApp({
      projectId: PROJECT_ID,
      credential: admin.credential.cert(serviceAccount),
    });
  } else {
    admin.initializeApp({ projectId: PROJECT_ID });
  }
}

const db = admin.firestore();

// ─── Utilidad: codificador de polilínea (Google Encoded Polyline Algorithm) ──
function encodeCoordinate(value) {
  let current = value < 0 ? ~(value << 1) : value << 1;
  let output = '';
  while (current >= 0x20) {
    output += String.fromCharCode((0x20 | (current & 0x1f)) + 63);
    current >>= 5;
  }
  output += String.fromCharCode(current + 63);
  return output;
}

function encodePolyline(coordinates) {
  let lastLat = 0;
  let lastLng = 0;
  return coordinates.reduce((encoded, { latitude, longitude }) => {
    const lat = Math.round(latitude * 1e5);
    const lng = Math.round(longitude * 1e5);
    const result =
      encoded +
      encodeCoordinate(lat - lastLat) +
      encodeCoordinate(lng - lastLng);
    lastLat = lat;
    lastLng = lng;
    return result;
  }, '');
}

function computeBounds(coords) {
  const lats = coords.map((c) => c.latitude);
  const lngs = coords.map((c) => c.longitude);
  return {
    north: Math.max(...lats),
    south: Math.min(...lats),
    east: Math.max(...lngs),
    west: Math.min(...lngs),
  };
}

// ─── Datos de rutas — David, Chiriquí ────────────────────────────────────────
//
// Coordenadas basadas en la cuadrícula real de David:
//   Centro (Parque Cervantes) :  8.4271, -82.4310
//   Terminal de buses         :  8.4295, -82.4360
//   Hospital Obaldia          :  8.4155, -82.4355
//   Aeropuerto Enrique Malek  :  8.3909, -82.4349
//   Romero / BJ Norte         :  8.4390, -82.4155
//   Chiriquí Mall area        :  8.4455, -82.4098
//   Barrio San Mateo          :  8.4200, -82.4510
//   Barrio Pedregal           :  8.4340, -82.4080
//   Barrio Bolívar             :  8.4410, -82.4165
//   Alcalde Díaz              :  8.4500, -82.4350
//   Las Palmas cruce          :  8.4060, -82.4205
//

const ROUTES = [
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'r-01',
    name: 'Aeropuerto – Centro – Romero Norte',
    code: 'R-01',
    origin: 'Aeropuerto Enrique Malek',
    midpoint: 'Parque Cervantes',
    destination: 'Romero Norte',
    frequency: '8-12 min',
    fare: 'B/.0.35',
    status: 'active',
    color: '#1976D2',
    isActive: true,
    activeBuses: 0,
    anchorCoords: [
      { latitude: 8.3909, longitude: -82.4349 }, // Aeropuerto
      { latitude: 8.4155, longitude: -82.4355 }, // Hospital Obaldia
      { latitude: 8.4271, longitude: -82.4310 }, // Parque Cervantes (mid)
      { latitude: 8.4350, longitude: -82.4200 }, // BJ Centro
      { latitude: 8.4390, longitude: -82.4155 }, // Romero Norte
    ],
    stops: [
      { id: 'r01-s01', name: 'Aeropuerto Enrique Malek', time: '06:00 AM', lat: 8.3909, lng: -82.4349, order: 1 },
      { id: 'r01-s02', name: 'Frigorsa / Vía Interamericana', time: '06:08 AM', lat: 8.3990, lng: -82.4340, order: 2 },
      { id: 'r01-s03', name: 'Cristo Rey', time: '06:14 AM', lat: 8.4090, lng: -82.4350, order: 3 },
      { id: 'r01-s04', name: 'Hospital José D. Obaldia', time: '06:20 AM', lat: 8.4155, lng: -82.4355, order: 4 },
      { id: 'r01-s05', name: 'Terminal de Buses', time: '06:28 AM', lat: 8.4295, lng: -82.4360, order: 5 },
      { id: 'r01-s06', name: 'Parque Cervantes', time: '06:33 AM', lat: 8.4271, lng: -82.4310, order: 6 },
      { id: 'r01-s07', name: 'Avenida Estudiante', time: '06:37 AM', lat: 8.4290, lng: -82.4250, order: 7 },
      { id: 'r01-s08', name: 'BJ Centro Comercial', time: '06:42 AM', lat: 8.4350, lng: -82.4200, order: 8 },
      { id: 'r01-s09', name: 'Romero Norte', time: '06:48 AM', lat: 8.4390, lng: -82.4155, order: 9 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'r-02',
    name: 'San Mateo – Centro – Pedregal',
    code: 'R-02',
    origin: 'Barrio San Mateo',
    midpoint: 'Parque Cervantes',
    destination: 'Barrio Pedregal',
    frequency: '10-15 min',
    fare: 'B/.0.35',
    status: 'active',
    color: '#388E3C',
    isActive: true,
    activeBuses: 0,
    anchorCoords: [
      { latitude: 8.4200, longitude: -82.4510 }, // San Mateo
      { latitude: 8.4240, longitude: -82.4420 }, // Vía 21 de enero
      { latitude: 8.4271, longitude: -82.4310 }, // Parque Cervantes (mid)
      { latitude: 8.4310, longitude: -82.4180 }, // Calle 4to anillo
      { latitude: 8.4340, longitude: -82.4080 }, // Pedregal
    ],
    stops: [
      { id: 'r02-s01', name: 'Barrio San Mateo', time: '06:00 AM', lat: 8.4200, lng: -82.4510, order: 1 },
      { id: 'r02-s02', name: 'Vía 21 de Enero', time: '06:07 AM', lat: 8.4240, lng: -82.4420, order: 2 },
      { id: 'r02-s03', name: 'MEDUCA / Calle F Norte', time: '06:13 AM', lat: 8.4255, lng: -82.4370, order: 3 },
      { id: 'r02-s04', name: 'Parque Cervantes', time: '06:18 AM', lat: 8.4271, lng: -82.4310, order: 4 },
      { id: 'r02-s05', name: 'Calle Rosario', time: '06:23 AM', lat: 8.4295, lng: -82.4230, order: 5 },
      { id: 'r02-s06', name: '4to Anillo', time: '06:28 AM', lat: 8.4310, lng: -82.4180, order: 6 },
      { id: 'r02-s07', name: 'Barrio Pedregal', time: '06:35 AM', lat: 8.4340, lng: -82.4080, order: 7 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'r-03',
    name: 'Terminal – Centro – Barrio Bolívar',
    code: 'R-03',
    origin: 'Terminal de Buses',
    midpoint: 'Parque Cervantes',
    destination: 'Barrio Bolívar',
    frequency: '5-10 min',
    fare: 'B/.0.25',
    status: 'active',
    color: '#F57C00',
    isActive: true,
    activeBuses: 0,
    anchorCoords: [
      { latitude: 8.4295, longitude: -82.4360 }, // Terminal
      { latitude: 8.4271, longitude: -82.4310 }, // Parque Cervantes (mid)
      { latitude: 8.4350, longitude: -82.4230 }, // Mercado Público
      { latitude: 8.4410, longitude: -82.4165 }, // Barrio Bolívar
    ],
    stops: [
      { id: 'r03-s01', name: 'Terminal de Buses', time: '05:30 AM', lat: 8.4295, lng: -82.4360, order: 1 },
      { id: 'r03-s02', name: 'Parque Cervantes', time: '05:36 AM', lat: 8.4271, lng: -82.4310, order: 2 },
      { id: 'r03-s03', name: 'Avenida Obaldía', time: '05:40 AM', lat: 8.4310, lng: -82.4260, order: 3 },
      { id: 'r03-s04', name: 'Mercado Público', time: '05:44 AM', lat: 8.4350, lng: -82.4230, order: 4 },
      { id: 'r03-s05', name: 'Barrio Clark', time: '05:49 AM', lat: 8.4375, lng: -82.4195, order: 5 },
      { id: 'r03-s06', name: 'Barrio Bolívar', time: '05:54 AM', lat: 8.4410, lng: -82.4165, order: 6 },
    ],
  },

  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'r-04',
    name: 'Alcalde Díaz – Centro – Las Palmas',
    code: 'R-04',
    origin: 'Alcalde Díaz',
    midpoint: 'Parque Cervantes',
    destination: 'Las Palmas',
    frequency: '12-18 min',
    fare: 'B/.0.35',
    status: 'active',
    color: '#7B1FA2',
    isActive: true,
    activeBuses: 0,
    anchorCoords: [
      { latitude: 8.4500, longitude: -82.4350 }, // Alcalde Díaz
      { latitude: 8.4380, longitude: -82.4330 }, // Colegio Comercial
      { latitude: 8.4271, longitude: -82.4310 }, // Parque Cervantes (mid)
      { latitude: 8.4155, longitude: -82.4330 }, // Hospital / Sur
      { latitude: 8.4060, longitude: -82.4205 }, // Las Palmas cruce
    ],
    stops: [
      { id: 'r04-s01', name: 'Alcalde Díaz', time: '06:00 AM', lat: 8.4500, lng: -82.4350, order: 1 },
      { id: 'r04-s02', name: 'Barrio Poma', time: '06:06 AM', lat: 8.4450, lng: -82.4340, order: 2 },
      { id: 'r04-s03', name: 'Colegio Comercial', time: '06:11 AM', lat: 8.4380, lng: -82.4330, order: 3 },
      { id: 'r04-s04', name: 'Terminal de Buses', time: '06:16 AM', lat: 8.4295, lng: -82.4360, order: 4 },
      { id: 'r04-s05', name: 'Parque Cervantes', time: '06:20 AM', lat: 8.4271, lng: -82.4310, order: 5 },
      { id: 'r04-s06', name: 'Av. Francisco Clark', time: '06:25 AM', lat: 8.4230, lng: -82.4280, order: 6 },
      { id: 'r04-s07', name: 'Hospital José D. Obaldia', time: '06:31 AM', lat: 8.4155, lng: -82.4355, order: 7 },
      { id: 'r04-s08', name: 'Las Palmas', time: '06:38 AM', lat: 8.4060, lng: -82.4205, order: 8 },
    ],
  },
];

// ─── Función auxiliar para crear anchorPoints con kind correcto ───────────────
function buildAnchorPoints(coords) {
  return coords.map((coord, index) => {
    let kind;
    if (index === 0) kind = 'start';
    else if (index === coords.length - 1) kind = 'end';
    else if (index === Math.floor(coords.length / 2)) kind = 'mid';
    else kind = 'waypoint';

    return {
      label: kind === 'start'
        ? 'Origen'
        : kind === 'end'
        ? 'Destino'
        : kind === 'mid'
        ? 'Punto medio'
        : `Waypoint ${index}`,
      kind,
      order: index + 1,
      coordinates: {
        latitude: coord.latitude,
        longitude: coord.longitude,
      },
    };
  });
}

// ─── OSRM: trazado de carretera real ────────────────────────────────────────

/** GET sencillo sobre HTTPS que devuelve un Promise con el JSON parseado. */
function osrmGet(urlStr) {
  return new Promise((resolve, reject) => {
    const req = https.get(urlStr, { headers: { 'User-Agent': 'BusNow-Seed/1.0' } }, (res) => {
      let raw = '';
      res.on('data', (chunk) => (raw += chunk));
      res.on('end', () => {
        try { resolve(JSON.parse(raw)); }
        catch (e) { reject(new Error('OSRM JSON parse error: ' + e.message)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(20000, () => {
      req.destroy(new Error('OSRM request timeout (20s)'));
    });
  });
}

/** Decodifica un Google-Encoded Polyline a un arreglo de {latitude, longitude}. */
function decodePolylineInSeed(encoded) {
  const points = [];
  let index = 0, lat = 0, lng = 0;
  while (index < encoded.length) {
    let shift = 0, result = 0, b;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lat += (result & 1) ? ~(result >> 1) : (result >> 1);
    shift = 0; result = 0;
    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    lng += (result & 1) ? ~(result >> 1) : (result >> 1);
    points.push({ latitude: lat / 1e5, longitude: lng / 1e5 });
  }
  return points;
}

/**
 * Llama a OSRM para generar la geometria real de carretera entre los coords
 * de ancla (en el orden en que se pasan).
 *
 * Si OSRM falla, avisa con un warning y devuelve el fallback de linea recta.
 */
async function fetchOsrmGeometry(anchorCoords, routeName) {
  const OSRM_BASE = 'https://router.project-osrm.org';
  const coordStr = anchorCoords.map((c) => `${c.longitude},${c.latitude}`).join(';');
  const url = `${OSRM_BASE}/route/v1/driving/${coordStr}?alternatives=false&overview=full&steps=false&geometries=polyline`;

  try {
    const data = await osrmGet(url);
    const route = data?.routes?.[0];
    if (data?.code !== 'Ok' || !route?.geometry) {
      throw new Error(`OSRM code=${data?.code || 'unknown'}`);
    }
    const geometryPolyline = route.geometry;
    const decoded = decodePolylineInSeed(geometryPolyline);
    const lats = decoded.map((p) => p.latitude);
    const lngs = decoded.map((p) => p.longitude);
    const bounds = { north: Math.max(...lats), south: Math.min(...lats), east: Math.max(...lngs), west: Math.min(...lngs) };
    console.log(`     ✔  OSRM trazado OK para "${routeName}" (${decoded.length} puntos)`);
    return { geometryPolyline, bounds };
  } catch (err) {
    console.warn(`     ⚠️  OSRM fallo para "${routeName}", usando fallback linea recta: ${err.message}`);
    return { geometryPolyline: encodePolyline(anchorCoords), bounds: computeBounds(anchorCoords) };
  }
}

// ─── Seed principal ────────────────────────────────────────────────────────────
async function seedRoutes() {
  console.log(`\n📡  Conectando al proyecto Firebase: ${PROJECT_ID}\n`);

  let created = 0;
  let updated = 0;
  let stopsWritten = 0;

  for (const routeDef of ROUTES) {
    const { id, stops, anchorCoords, ...routeFields } = routeDef;

    const anchorPoints = buildAnchorPoints(anchorCoords);

    // Asignar labels reales usando origin / midpoint / destination
    if (anchorPoints[0]) anchorPoints[0].label = routeFields.origin;
    const midIdx = anchorPoints.findIndex((a) => a.kind === 'mid');
    if (midIdx !== -1) anchorPoints[midIdx].label = routeFields.midpoint;
    if (anchorPoints[anchorPoints.length - 1]) {
      anchorPoints[anchorPoints.length - 1].label = routeFields.destination;
    }

    const { geometryPolyline, bounds } = await fetchOsrmGeometry(anchorCoords, routeFields.name);

    const routeRef = db.collection('routes').doc(id);
    const existing = await routeRef.get();

    const routeDocument = {
      ...routeFields,
      geometryPolyline,
      anchorPoints,
      bounds,
      anchorPointsCount: anchorPoints.length,
      updatedAt: new Date().toISOString(),
      ...(existing.exists
        ? { updatedBy: 'seed-script' }
        : {
            createdAt: new Date().toISOString(),
            createdBy: 'seed-script',
            updatedBy: 'seed-script',
          }),
    };

    await routeRef.set(routeDocument, { merge: true });
    if (existing.exists) {
      updated++;
      console.log(`  🔄  Actualizada ruta ${id}: ${routeFields.name}`);
    } else {
      created++;
      console.log(`  ✅  Creada ruta ${id}: ${routeFields.name}`);
    }

    // Paradas: eliminar las anteriores y escribir las nuevas
    const stopsRef = routeRef.collection('stops');
    const existingStops = await stopsRef.get();
    const batch = db.batch();
    existingStops.docs.forEach((doc) => batch.delete(doc.ref));

    stops.forEach((stop) => {
      const stopRef = stopsRef.doc(stop.id);
      batch.set(stopRef, {
        name: stop.name,
        time: stop.time,
        coordinates: { latitude: stop.lat, longitude: stop.lng },
        isActive: true,
        order: stop.order,
      });
    });

    await batch.commit();
    stopsWritten += stops.length;
    console.log(`     → ${stops.length} paradas escritas`);
  }

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚌  Seed completado para David, Chiriquí
    Rutas creadas  : ${created}
    Rutas actualizadas : ${updated}
    Paradas totales: ${stopsWritten}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
}

seedRoutes().catch((err) => {
  if (String(err?.message || '').includes('Could not load the default credentials')) {
    console.error('');
    console.error('Sugerencias para autenticar Admin SDK:');
    console.error('1) Define FIREBASE_SERVICE_ACCOUNT_PATH en .env (ruta al JSON de service account).');
    console.error('2) O exporta GOOGLE_APPLICATION_CREDENTIALS con esa misma ruta.');
    console.error('3) En gcloud: gcloud auth application-default login');
    console.error('');
  }
  console.error('❌  Error durante el seed:', err);
  process.exit(1);
});
