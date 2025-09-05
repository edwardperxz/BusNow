// =============================================================================
// MOCK DATA - Development
// =============================================================================

import { BusRoute, Bus, BusStop, Operator, Driver, Coordinates } from '../../types';
import { getRouteColor } from '../../styles/colors';

// Coordenadas base (ejemplo: área metropolitana)
const BASE_COORDINATES: Coordinates = {
  latitude: -34.6037,
  longitude: -58.3816
};

// Operadores mock
export const MOCK_OPERATORS: Operator[] = [
  {
    id: 'op1',
    name: 'TransBus SA',
    logo: '🚌',
    contact: '+54 11 1234-5678'
  },
  {
    id: 'op2',
    name: 'MetroLinea',
    logo: '🚐',
    contact: '+54 11 8765-4321'
  },
  {
    id: 'op3',
    name: 'RutaExpress',
    logo: '🚍',
    contact: '+54 11 5555-0000'
  }
];

// Paradas mock
export const MOCK_BUS_STOPS: BusStop[] = [
  {
    id: 'stop1',
    name: 'Terminal Central',
    coordinates: { latitude: -34.6037, longitude: -58.3816 },
    routeIds: ['route1', 'route2'],
    isOfficial: true
  },
  {
    id: 'stop2',
    name: 'Plaza Mayor',
    coordinates: { latitude: -34.6087, longitude: -58.3756 },
    routeIds: ['route1', 'route3'],
    isOfficial: true
  },
  {
    id: 'stop3',
    name: 'Universidad',
    coordinates: { latitude: -34.5987, longitude: -58.3876 },
    routeIds: ['route2', 'route3'],
    isOfficial: true
  },
  {
    id: 'stop4',
    name: 'Hospital Regional',
    coordinates: { latitude: -34.6137, longitude: -58.3696 },
    routeIds: ['route1'],
    isOfficial: true
  },
  {
    id: 'stop5',
    name: 'Shopping Center',
    coordinates: { latitude: -34.5937, longitude: -58.3936 },
    routeIds: ['route2'],
    isOfficial: true
  }
];

// Rutas mock
export const MOCK_ROUTES: BusRoute[] = [
  {
    id: 'route1',
    name: 'Línea Centro',
    shortName: 'L1',
    description: 'Ruta urbana que conecta el centro con los barrios residenciales',
    origin: 'Terminal Central',
    destination: 'Hospital Regional',
    operatorId: 'op1',
    operator: MOCK_OPERATORS[0],
    fare: 250,
    estimatedDuration: 45,
    frequency: 15,
    schedule: {
      start: '05:30',
      end: '23:00'
    },
    operatingHours: {
      start: '05:30',
      end: '23:00'
    },
    coordinates: [
      { latitude: -34.6037, longitude: -58.3816 },
      { latitude: -34.6057, longitude: -58.3796 },
      { latitude: -34.6077, longitude: -58.3776 },
      { latitude: -34.6097, longitude: -58.3756 },
      { latitude: -34.6117, longitude: -58.3736 },
      { latitude: -34.6137, longitude: -58.3696 }
    ],
    busStops: MOCK_BUS_STOPS.filter(stop => stop.routeIds.includes('route1')),
    stops: MOCK_BUS_STOPS.filter(stop => stop.routeIds.includes('route1')),
    category: 'urban',
    color: getRouteColor('route1'),
    isActive: true,
    isAccessible: true
  },
  {
    id: 'route2',
    name: 'Línea Universitaria',
    shortName: 'L2',
    description: 'Conecta las principales universidades y centros educativos',
    origin: 'Terminal Central',
    destination: 'Shopping Center',
    operatorId: 'op2',
    operator: MOCK_OPERATORS[1],
    fare: 200,
    estimatedDuration: 35,
    frequency: 12,
    schedule: {
      start: '06:00',
      end: '22:30'
    },
    operatingHours: {
      start: '06:00',
      end: '22:30'
    },
    coordinates: [
      { latitude: -34.6037, longitude: -58.3816 },
      { latitude: -34.6017, longitude: -58.3836 },
      { latitude: -34.5997, longitude: -58.3856 },
      { latitude: -34.5977, longitude: -58.3876 },
      { latitude: -34.5957, longitude: -58.3896 },
      { latitude: -34.5937, longitude: -58.3936 }
    ],
    busStops: MOCK_BUS_STOPS.filter(stop => stop.routeIds.includes('route2')),
    stops: MOCK_BUS_STOPS.filter(stop => stop.routeIds.includes('route2')),
    category: 'suburban',
    color: getRouteColor('route2'),
    isActive: true,
    isAccessible: false
  },
  {
    id: 'route3',
    name: 'Expreso Intercity',
    shortName: 'EXP',
    description: 'Servicio expreso entre ciudades principales',
    origin: 'Plaza Mayor',
    destination: 'Universidad',
    operatorId: 'op3',
    operator: MOCK_OPERATORS[2],
    fare: 450,
    estimatedDuration: 90,
    frequency: 30,
    schedule: {
      start: '05:00',
      end: '21:00'
    },
    operatingHours: {
      start: '05:00',
      end: '21:00'
    },
    coordinates: [
      { latitude: -34.6087, longitude: -58.3756 },
      { latitude: -34.6067, longitude: -58.3776 },
      { latitude: -34.6047, longitude: -58.3796 },
      { latitude: -34.6027, longitude: -58.3816 },
      { latitude: -34.6007, longitude: -58.3836 },
      { latitude: -34.5987, longitude: -58.3876 }
    ],
    busStops: MOCK_BUS_STOPS.filter(stop => stop.routeIds.includes('route3')),
    stops: MOCK_BUS_STOPS.filter(stop => stop.routeIds.includes('route3')),
    category: 'express',
    color: getRouteColor('route3'),
    isActive: true,
    isAccessible: true
  }
];

// Conductores mock
export const MOCK_DRIVERS: Driver[] = [
  {
    id: 'driver1',
    name: 'Juan Pérez',
    email: 'juan.perez@transbus.com',
    type: 'driver',
    isAnonymous: false,
    deviceId: 'driver-device-1',
    licenseNumber: 'B123456789',
    isOnline: false,
    createdAt: new Date('2024-01-15')
  },
  {
    id: 'driver2',
    name: 'María García',
    email: 'maria.garcia@metrolinea.com',
    type: 'driver',
    isAnonymous: false,
    deviceId: 'driver-device-2',
    licenseNumber: 'B987654321',
    isOnline: false,
    createdAt: new Date('2024-02-20')
  }
];

// Buses mock
export const MOCK_BUSES: Bus[] = [
  {
    id: 'bus1',
    routeId: 'route1',
    driverId: 'driver1',
    driver: MOCK_DRIVERS[0],
    route: MOCK_ROUTES[0],
    currentLocation: { latitude: -34.6037, longitude: -58.3816 },
    heading: 90,
    speed: 35,
    isActive: true,
    lastUpdate: new Date(),
    capacity: {
      total: 40,
      occupied: 24
    },
    occupancy: 60,
    status: 'online' as const,
    plateNumber: 'ABC-123',
    driverName: 'Juan Pérez',
    nextStopId: 'stop2'
  },
  {
    id: 'bus2',
    routeId: 'route2',
    driverId: 'driver2',
    driver: MOCK_DRIVERS[1],
    route: MOCK_ROUTES[1],
    currentLocation: { latitude: -34.5987, longitude: -58.3876 },
    heading: 180,
    speed: 25,
    isActive: true,
    lastUpdate: new Date(),
    capacity: {
      total: 35,
      occupied: 28
    },
    occupancy: 80,
    status: 'online' as const,
    plateNumber: 'DEF-456',
    driverName: 'María García'
  }
];

// Función para generar ubicaciones aleatorias en una ruta
export const generateRandomLocationOnRoute = (route: BusRoute): Coordinates => {
  if (route.coordinates.length === 0) return BASE_COORDINATES;
  
  const randomIndex = Math.floor(Math.random() * route.coordinates.length);
  const baseCoord = route.coordinates[randomIndex];
  
  // Agregar pequeña variación aleatoria
  return {
    latitude: baseCoord.latitude + (Math.random() - 0.5) * 0.001,
    longitude: baseCoord.longitude + (Math.random() - 0.5) * 0.001
  };
};

// Función para simular movimiento de bus
export const simulateBusMovement = (currentLocation: Coordinates, route: BusRoute, speed: number = 30): Coordinates => {
  // Encontrar el punto más cercano en la ruta
  let closestPointIndex = 0;
  let minDistance = Number.MAX_VALUE;
  
  route.coordinates.forEach((coord, index) => {
    const distance = Math.sqrt(
      Math.pow(coord.latitude - currentLocation.latitude, 2) +
      Math.pow(coord.longitude - currentLocation.longitude, 2)
    );
    if (distance < minDistance) {
      minDistance = distance;
      closestPointIndex = index;
    }
  });
  
  // Moverse hacia el siguiente punto en la ruta
  const nextIndex = (closestPointIndex + 1) % route.coordinates.length;
  const nextPoint = route.coordinates[nextIndex];
  
  // Calcular dirección y nueva posición
  const deltaLat = nextPoint.latitude - currentLocation.latitude;
  const deltaLng = nextPoint.longitude - currentLocation.longitude;
  
  // Factor de movimiento basado en la velocidad (simplificado)
  const moveFactor = 0.0001 * (speed / 30);
  
  return {
    latitude: currentLocation.latitude + deltaLat * moveFactor,
    longitude: currentLocation.longitude + deltaLng * moveFactor
  };
};
