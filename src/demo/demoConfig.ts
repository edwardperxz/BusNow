// Configuración de modo demo (simulación local) controlado por variables de entorno
export const DEMO_MODE: boolean = (process.env.EXPO_PUBLIC_DEMO_MODE || 'false') === 'true';

// Velocidad de simulación del bus en km/h (default 35)
export const DEMO_SPEED_KMH: number = Number(process.env.EXPO_PUBLIC_DEMO_SPEED_KMH || 35);

// Intervalo de actualización en ms (reusa el del tracking real)
export const DEMO_UPDATE_INTERVAL_MS: number = Number(process.env.EXPO_PUBLIC_LOCATION_UPDATE_INTERVAL || 5000);

export type LatLng = { latitude: number; longitude: number };

// Trayectoria demo que reproduce la ruta R-01 (Aeropuerto → Centro → Romero Norte)
export const DEMO_PATH: LatLng[] = [
  { latitude: 8.3909, longitude: -82.4349 }, // Aeropuerto Enrique Malek
  { latitude: 8.3990, longitude: -82.4340 }, // Frigorsa / Vía Interamericana
  { latitude: 8.4090, longitude: -82.4350 }, // Cristo Rey
  { latitude: 8.4155, longitude: -82.4355 }, // Hospital Obaldia
  { latitude: 8.4295, longitude: -82.4360 }, // Terminal de Buses
  { latitude: 8.4271, longitude: -82.4310 }, // Parque Cervantes
  { latitude: 8.4290, longitude: -82.4250 }, // Avenida Estudiante
  { latitude: 8.4350, longitude: -82.4200 }, // BJ Centro Comercial
  { latitude: 8.4390, longitude: -82.4155 }, // Romero Norte
];

export const DEMO_BUS_ID = 'demo-1';
export const DEMO_ROUTE_ID = 'r-01';
