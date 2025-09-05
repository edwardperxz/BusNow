// =============================================================================
// BUS REPOSITORY INTERFACE - Domain Layer
// =============================================================================

import { Bus, Coordinates, ETA } from '../../types';

export interface BusRepository {
  // Ubicación en tiempo real
  getBusesByRoute(routeId: string): Promise<Bus[]>;
  getBusById(id: string): Promise<Bus | null>;
  trackBus(busId: string, callback: (bus: Bus) => void): () => void; // retorna función para cancelar
  
  // Para conductores
  startBusTracking(driverId: string, routeId: string): Promise<string>; // retorna busId
  stopBusTracking(busId: string): Promise<void>;
  updateBusLocation(busId: string, location: Coordinates, speed: number, heading: number): Promise<void>;
  
  // ETA calculations
  calculateETA(busId: string, targetLocation: Coordinates): Promise<ETA>;
  getETAForStop(busId: string, stopId: string): Promise<ETA>;
  
  // Simulaciones (para desarrollo)
  startMockBusMovement(routeId: string): Promise<string>;
  stopMockBusMovement(busId: string): Promise<void>;
}
