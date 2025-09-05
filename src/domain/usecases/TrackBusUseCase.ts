// =============================================================================
// TRACK BUS USE CASE - Domain Layer
// =============================================================================

import { Bus, ETA, Coordinates } from '../../types';
import { BusRepository } from '../repositories/BusRepository';
import { TrackingRepository } from '../repositories/TrackingRepository';

export class TrackBusUseCase {
  constructor(
    private busRepository: BusRepository,
    private trackingRepository: TrackingRepository
  ) {}

  async execute(
    busId: string,
    userId: string,
    targetLocation: Coordinates,
    deviceInfo: { deviceId: string; platform: 'ios' | 'android'; ip?: string },
    onLocationUpdate: (bus: Bus) => void
  ): Promise<{ unsubscribe: () => void; eta: ETA }> {
    try {
      // Obtener información inicial del bus
      const bus = await this.busRepository.getBusById(busId);
      if (!bus) {
        throw new Error('Bus not found');
      }

      // Calcular ETA inicial
      const eta = await this.busRepository.calculateETA(busId, targetLocation);

      // Crear sesión de tracking
      const trackingSession = await this.trackingRepository.createTrackingSession(
        userId,
        bus.routeId,
        bus.currentLocation,
        targetLocation,
        deviceInfo
      );

      // Log inicial
      await this.trackingRepository.logUserActivity(
        userId,
        'start_bus_tracking',
        { busId, routeId: bus.routeId, targetLocation },
        bus.currentLocation,
        deviceInfo.deviceId,
        deviceInfo.ip
      );

      // Iniciar tracking en tiempo real
      const unsubscribe = this.busRepository.trackBus(busId, (updatedBus) => {
        onLocationUpdate(updatedBus);
        
        // Log de actualización
        this.trackingRepository.logUserActivity(
          userId,
          'bus_location_update',
          { busId, location: updatedBus.currentLocation },
          updatedBus.currentLocation,
          deviceInfo.deviceId,
          deviceInfo.ip
        ).catch(console.error);
      });

      // Función para cancelar tracking
      const cancelTracking = () => {
        unsubscribe();
        this.trackingRepository.endTrackingSession(trackingSession.id).catch(console.error);
        this.trackingRepository.logUserActivity(
          userId,
          'end_bus_tracking',
          { busId },
          undefined,
          deviceInfo.deviceId,
          deviceInfo.ip
        ).catch(console.error);
      };

      return {
        unsubscribe: cancelTracking,
        eta
      };

    } catch (error) {
      console.error('Error tracking bus:', error);
      throw error;
    }
  }
}

export class GetBusesByRouteUseCase {
  constructor(private busRepository: BusRepository) {}

  async execute(routeId: string): Promise<Bus[]> {
    try {
      return await this.busRepository.getBusesByRoute(routeId);
    } catch (error) {
      console.error('Error getting buses by route:', error);
      return [];
    }
  }
}
