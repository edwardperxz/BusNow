// =============================================================================
// DOMAIN TYPES - Clean Architecture
// =============================================================================

// Coordenadas geográficas
export interface Coordinates {
  latitude: number;
  longitude: number;
}

// Información de región del mapa
export interface MapRegion {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Usuario base
export interface User {
  id: string;
  name?: string;
  email?: string;
  type: 'passenger' | 'driver';
  isAnonymous: boolean;
  deviceId: string;
  createdAt: Date;
}

// Usuario pasajero
export interface Passenger extends User {
  type: 'passenger';
  favoriteRoutes: string[];
  recentRoutes: string[];
  notifications: boolean;
}

// Usuario conductor
export interface Driver extends User {
  type: 'driver';
  licenseNumber: string;
  isOnline: boolean;
  currentRouteId?: string;
  vehicleId?: string;
}

// Empresa operadora
export interface Operator {
  id: string;
  name: string;
  logo?: string;
  contact?: string;
}

// Parada de bus
export interface BusStop {
  id: string;
  name: string;
  description?: string;
  coordinates: Coordinates;
  routeIds: string[];
  isOfficial: boolean;
}

// Ruta de bus
export interface BusRoute {
  id: string;
  name: string;
  shortName: string;
  description: string;
  origin: string;
  destination: string;
  operatorId: string;
  operator: Operator;
  fare: number;
  estimatedDuration: number; // en minutos
  frequency: number; // minutos entre buses
  schedule: {
    start: string; // formato HH:MM
    end: string;
  };
  operatingHours: {
    start: string;
    end: string;
  };
  coordinates: Coordinates[]; // ruta completa
  busStops: BusStop[];
  stops: BusStop[]; // alias para compatibilidad
  category: 'urban' | 'suburban' | 'intercity' | 'express';
  color: string; // color para mostrar en el mapa
  isActive: boolean;
  isAccessible?: boolean; // Para accesibilidad
}

// Bus en tiempo real
export interface Bus {
  id: string;
  routeId: string;
  driverId: string;
  driver: Driver;
  route: BusRoute;
  currentLocation: Coordinates;
  heading: number; // dirección en grados
  speed: number; // km/h
  isActive: boolean;
  lastUpdate: Date;
  nextStopId?: string;
  estimatedArrival?: Date;
  capacity: {
    total: number;
    occupied: number;
  };
  occupancy: number; // 0-100%
  status: 'online' | 'offline' | 'maintenance' | 'delayed';
  plateNumber?: string;
  driverName?: string;
}

// ETA (Tiempo estimado de llegada)
export interface ETA {
  busId: string;
  busStopId?: string;
  targetCoordinates: Coordinates;
  estimatedMinutes: number;
  distance: number; // metros
  confidence: 'high' | 'medium' | 'low';
  lastCalculated: Date;
}

// Sesión de tracking
export interface TrackingSession {
  id: string;
  userId: string;
  routeId: string;
  busId?: string;
  startLocation: Coordinates;
  targetLocation: Coordinates;
  startTime: Date;
  endTime?: Date;
  isActive: boolean;
  deviceInfo: {
    deviceId: string;
    platform: 'ios' | 'android';
    ip?: string;
  };
}

// Notificación
export interface Notification {
  id: string;
  userId: string;
  type: 'bus_arrival' | 'route_update' | 'service_alert';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: Date;
  timestamp: Date; // alias para compatibilidad
}

// Estados de la aplicación
export interface AppState {
  isLoading: boolean;
  error: string | null;
  user: User | null;
  selectedRoute: BusRoute | null;
  selectedBus: Bus | null;
  trackingSession: TrackingSession | null;
  mapRegion: MapRegion;
  activeView: 'map' | 'routes' | 'profile';
}

// Estado de tracking
export interface TrackingState {
  userLocation: UserLocation | null;
  selectedRoute: BusRoute | null;
  selectedBus: Bus | null;
  selectedBusStop: BusStop | null;
  buses: Bus[];
  routes: BusRoute[]; // para compatibilidad con componentes existentes
  isTracking: boolean;
  error: string | null;
}

// Ubicación del usuario
export interface UserLocation {
  latitude: number;
  longitude: number;
  coordinates: Coordinates; // alias para compatibilidad
  accuracy?: number;
  timestamp: Date;
}

// Configuraciones de la app
export interface Settings {
  notifications: {
    enabled: boolean;
    arrivalAlerts: boolean;
    serviceAlerts: boolean;
    soundEnabled: boolean;
  };
  theme: 'light' | 'dark' | 'auto';
  language: 'es' | 'en';
  units: 'metric' | 'imperial';
  refreshInterval: number;
  map: {
    showTraffic: boolean;
    showStops: boolean;
    animateMovement: boolean;
    refreshRate: number;
    followUserLocation: boolean;
    mapType: 'standard' | 'satellite' | 'hybrid' | 'terrain';
  };
  tracking: {
    accuracy: 'high' | 'medium' | 'low';
    updateInterval: number;
    backgroundTracking: boolean;
  };
}

// Tiempo estimado de llegada (alias)
export interface EstimatedArrival extends ETA {}

// Filtros de búsqueda
export interface RouteFilters {
  category?: 'urban' | 'intercity';
  operator?: string;
  maxFare?: number;
  search?: string;
}

// Respuesta de API genérica
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Mock data para desarrollo
export interface MockLocationUpdate {
  busId: string;
  coordinates: Coordinates;
  speed: number;
  heading: number;
  timestamp: Date;
}