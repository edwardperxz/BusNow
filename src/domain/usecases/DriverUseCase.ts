// =============================================================================
// DRIVER USE CASES - Domain Layer
// =============================================================================

import { Bus, Coordinates, Driver, User } from '../../types';
import { BusRepository } from '../repositories/BusRepository';
import { TrackingRepository } from '../repositories/TrackingRepository';
import { UserRepository } from '../repositories/UserRepository';

export class StartBusTripUseCase {
  constructor(
    private busRepository: BusRepository,
    private trackingRepository: TrackingRepository,
    private userRepository: UserRepository
  ) {}

  async execute(
    driverId: string,
    routeId: string,
    initialLocation: Coordinates,
    deviceInfo: { deviceId: string; platform: 'ios' | 'android'; ip?: string }
  ): Promise<string> {
    try {
      // Iniciar tracking del bus
      const busId = await this.busRepository.startBusTracking(driverId, routeId);

      // Actualizar ubicación inicial
      await this.busRepository.updateBusLocation(busId, initialLocation, 0, 0);

      // Marcar driver como online
      const driver = await this.userRepository.getCurrentUser();
      if (driver && driver.type === 'driver') {
        const driverUpdate: Partial<Driver> = {
          id: driverId,
          isOnline: true,
          currentRouteId: routeId,
        };
        await this.userRepository.updateUser(driverUpdate as Partial<User>);
      }

      // Log de actividad
      await this.trackingRepository.logUserActivity(
        driverId,
        'start_bus_trip',
        { busId, routeId },
        initialLocation,
        deviceInfo.deviceId,
        deviceInfo.ip
      );

      return busId;
    } catch (error) {
      console.error('Error starting bus trip:', error);
      throw error;
    }
  }
}

export class UpdateBusLocationUseCase {
  constructor(
    private busRepository: BusRepository,
    private trackingRepository: TrackingRepository
  ) {}

  async execute(
    busId: string,
    driverId: string,
    location: Coordinates,
    speed: number,
    heading: number,
    deviceInfo: { deviceId: string; ip?: string }
  ): Promise<void> {
    try {
      await this.busRepository.updateBusLocation(busId, location, speed, heading);

      // Log periódico (cada 30 segundos aproximadamente)
      const now = Date.now();
      if (!this.lastLogTime || now - this.lastLogTime > 30000) {
        await this.trackingRepository.logUserActivity(
          driverId,
          'bus_location_update',
          { busId, speed, heading },
          location,
          deviceInfo.deviceId,
          deviceInfo.ip
        );
        this.lastLogTime = now;
      }
    } catch (error) {
      console.error('Error updating bus location:', error);
      throw error;
    }
  }

  private lastLogTime: number = 0;
}

export class EndBusTripUseCase {
  constructor(
    private busRepository: BusRepository,
    private trackingRepository: TrackingRepository,
    private userRepository: UserRepository
  ) {}

  async execute(
    busId: string,
    driverId: string,
    deviceInfo: { deviceId: string; platform: 'ios' | 'android'; ip?: string }
  ): Promise<void> {
    try {
      // Detener tracking del bus
      await this.busRepository.stopBusTracking(busId);

      // Marcar driver como offline
      const driverUpdate: Partial<Driver> = {
        id: driverId,
        isOnline: false,
        currentRouteId: undefined,
      };
      await this.userRepository.updateUser(driverUpdate as Partial<User>);

      // Log de actividad
      await this.trackingRepository.logUserActivity(
        driverId,
        'end_bus_trip',
        { busId },
        undefined,
        deviceInfo.deviceId,
        deviceInfo.ip
      );
    } catch (error) {
      console.error('Error ending bus trip:', error);
      throw error;
    }
  }
}
