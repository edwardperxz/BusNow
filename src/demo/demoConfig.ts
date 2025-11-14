// Configuración de modo demo (simulación local) controlado por variables de entorno
export const DEMO_MODE: boolean = (process.env.EXPO_PUBLIC_DEMO_MODE || 'false') === 'true';

// Velocidad de simulación del bus en km/h (default 35)
export const DEMO_SPEED_KMH: number = Number(process.env.EXPO_PUBLIC_DEMO_SPEED_KMH || 35);

// Intervalo de actualización en ms (reusa el del tracking real)
export const DEMO_UPDATE_INTERVAL_MS: number = Number(process.env.EXPO_PUBLIC_LOCATION_UPDATE_INTERVAL || 5000);

export type LatLng = { latitude: number; longitude: number };

// Trayectoria simple en David, Chiriquí para simular movimiento
export const DEMO_PATH: LatLng[] = [
  { latitude: 8.4333, longitude: -82.4333 },
  { latitude: 8.4345, longitude: -82.4315 },
  { latitude: 8.4362, longitude: -82.4298 },
  { latitude: 8.4380, longitude: -82.4279 },
  { latitude: 8.4400, longitude: -82.4258 },
  { latitude: 8.4415, longitude: -82.4239 },
];

export const DEMO_BUS_ID = 'demo-1';
