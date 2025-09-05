// =============================================================================
// MOCK BUS REPOSITORY - Data Layer
// =============================================================================

import { Bus, Coordinates, ETA } from '../../types';
import { BusRepository } from '../../domain/repositories/BusRepository';
import { MOCK_BUSES, MOCK_ROUTES, simulateBusMovement } from '../mocks/mockData';

interface BusSubscription {
  busId: string;
  callback: (bus: Bus) => void;
  intervalId: NodeJS.Timeout;
}

export class MockBusRepository implements BusRepository {
  private buses: Map<string, Bus> = new Map();
  private subscriptions: Map<string, BusSubscription[]> = new Map();
  private movementIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    // Inicializar con buses mock
    MOCK_BUSES.forEach(bus => {
      this.buses.set(bus.id, { ...bus });
    });
  }

  async getBusesByRoute(routeId: string): Promise<Bus[]> {
    await this.delay(200);
    
    const buses = Array.from(this.buses.values())
      .filter(bus => bus.routeId === routeId && bus.isActive);
    
    return buses;
  }

  async getBusById(id: string): Promise<Bus | null> {
    await this.delay(100);
    
    const bus = this.buses.get(id);
    return bus ? { ...bus } : null;
  }

  trackBus(busId: string, callback: (bus: Bus) => void): () => void {
    const bus = this.buses.get(busId);
    if (!bus) {
      throw new Error(`Bus ${busId} not found`);
    }

    // Crear intervalo para simular actualizaciones en tiempo real
    const intervalId = setInterval(() => {
      const updatedBus = this.buses.get(busId);
      if (updatedBus && updatedBus.isActive) {
        callback({ ...updatedBus });
      }
    }, 2000); // Actualizar cada 2 segundos

    // Guardar suscripción
    if (!this.subscriptions.has(busId)) {
      this.subscriptions.set(busId, []);
    }
    const subscription: BusSubscription = {
      busId,
      callback,
      intervalId
    };
    this.subscriptions.get(busId)!.push(subscription);

    // Retornar función de cancelación
    return () => {
      clearInterval(intervalId);
      const subs = this.subscriptions.get(busId);
      if (subs) {
        const index = subs.findIndex(s => s.intervalId === intervalId);
        if (index >= 0) {
          subs.splice(index, 1);
        }
        if (subs.length === 0) {
          this.subscriptions.delete(busId);
        }
      }
    };
  }

  async startBusTracking(driverId: string, routeId: string): Promise<string> {
    await this.delay(200);

    const route = MOCK_ROUTES.find(r => r.id === routeId);
    if (!route) {
      throw new Error(`Route ${routeId} not found`);
    }

    // Generar ID único para el bus
    const busId = `bus_${driverId}_${Date.now()}`;
    
    const newBus: Bus = {
      id: busId,
      routeId,
      driverId,
      driver: { 
        id: driverId, 
        name: 'Driver', 
        type: 'driver', 
        isAnonymous: false, 
        deviceId: `device_${driverId}`,
        licenseNumber: 'TMP123',
        isOnline: true,
        createdAt: new Date()
      },
      route,
      currentLocation: route.coordinates[0] || { latitude: -34.6037, longitude: -58.3816 },
      heading: 0,
      speed: 0,
      isActive: true,
      lastUpdate: new Date(),
      capacity: {
        total: 40,
        occupied: 0
      },
      occupancy: 0,
      status: 'online'
    };

    this.buses.set(busId, newBus);
    this.startMockMovement(busId);

    return busId;
  }

  async stopBusTracking(busId: string): Promise<void> {
    await this.delay(100);

    const bus = this.buses.get(busId);
    if (bus) {
      bus.isActive = false;
      bus.speed = 0;
      
      // Detener movimiento simulado
      this.stopMockMovement(busId);
      
      // Cancelar todas las suscripciones
      const subs = this.subscriptions.get(busId);
      if (subs) {
        subs.forEach(sub => clearInterval(sub.intervalId));
        this.subscriptions.delete(busId);
      }
    }
  }

  async updateBusLocation(
    busId: string, 
    location: Coordinates, 
    speed: number, 
    heading: number
  ): Promise<void> {
    const bus = this.buses.get(busId);
    if (bus) {
      bus.currentLocation = location;
      bus.speed = speed;
      bus.heading = heading;
      bus.lastUpdate = new Date();
      
      // Notificar a los suscriptores
      const subs = this.subscriptions.get(busId);
      if (subs) {
        subs.forEach(sub => sub.callback({ ...bus }));
      }
    }
  }

  async calculateETA(busId: string, targetLocation: Coordinates): Promise<ETA> {
    await this.delay(100);

    const bus = this.buses.get(busId);
    if (!bus) {
      throw new Error(`Bus ${busId} not found`);
    }

    // Cálculo simple de distancia (haversine simplificado)
    const distance = this.calculateDistance(bus.currentLocation, targetLocation);
    const averageSpeed = Math.max(bus.speed, 20); // velocidad mínima para cálculo
    const estimatedMinutes = Math.round((distance / 1000) / (averageSpeed / 60));

    return {
      busId,
      targetCoordinates: targetLocation,
      estimatedMinutes: Math.max(estimatedMinutes, 1),
      distance: Math.round(distance),
      confidence: distance < 1000 ? 'high' : distance < 5000 ? 'medium' : 'low',
      lastCalculated: new Date()
    };
  }

  async getETAForStop(busId: string, stopId: string): Promise<ETA> {
    const bus = this.buses.get(busId);
    if (!bus) {
      throw new Error(`Bus ${busId} not found`);
    }

    const stop = bus.route.busStops.find(s => s.id === stopId);
    if (!stop) {
      throw new Error(`Stop ${stopId} not found`);
    }

    return this.calculateETA(busId, stop.coordinates);
  }

  async startMockBusMovement(routeId: string): Promise<string> {
    const route = MOCK_ROUTES.find(r => r.id === routeId);
    if (!route) {
      throw new Error(`Route ${routeId} not found`);
    }

    const busId = await this.startBusTracking('mock_driver', routeId);
    return busId;
  }

  async stopMockBusMovement(busId: string): Promise<void> {
    await this.stopBusTracking(busId);
  }

  // Private methods
  private startMockMovement(busId: string): void {
    const intervalId = setInterval(() => {
      const bus = this.buses.get(busId);
      if (bus && bus.isActive) {
        const newLocation = simulateBusMovement(bus.currentLocation, bus.route, bus.speed || 30);
        const newSpeed = 20 + Math.random() * 40; // Velocidad entre 20-60 km/h
        const newHeading = this.calculateHeading(bus.currentLocation, newLocation);
        
        this.updateBusLocation(busId, newLocation, newSpeed, newHeading);
      }
    }, 3000); // Actualizar cada 3 segundos

    this.movementIntervals.set(busId, intervalId);
  }

  private stopMockMovement(busId: string): void {
    const intervalId = this.movementIntervals.get(busId);
    if (intervalId) {
      clearInterval(intervalId);
      this.movementIntervals.delete(busId);
    }
  }

  private calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = coord1.latitude * Math.PI / 180;
    const φ2 = coord2.latitude * Math.PI / 180;
    const Δφ = (coord2.latitude - coord1.latitude) * Math.PI / 180;
    const Δλ = (coord2.longitude - coord1.longitude) * Math.PI / 180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  private calculateHeading(from: Coordinates, to: Coordinates): number {
    const Δλ = (to.longitude - from.longitude) * Math.PI / 180;
    const φ1 = from.latitude * Math.PI / 180;
    const φ2 = to.latitude * Math.PI / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

    const θ = Math.atan2(y, x);
    return (θ * 180 / Math.PI + 360) % 360;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
