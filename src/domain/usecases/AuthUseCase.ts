// =============================================================================
// USER AUTHENTICATION USE CASES - Domain Layer
// =============================================================================

import { User, Passenger, Driver } from '../../types';
import { UserRepository } from '../repositories/UserRepository';
import { TrackingRepository } from '../repositories/TrackingRepository';

export class SignInAnonymouslyUseCase {
  constructor(
    private userRepository: UserRepository,
    private trackingRepository: TrackingRepository
  ) {}

  async execute(deviceInfo: {
    deviceId: string;
    platform: 'ios' | 'android';
    ip?: string;
    location?: { lat: number; lng: number };
  }): Promise<User> {
    try {
      // Crear usuario anónimo
      const user = await this.userRepository.signInAnonymously();
      
      // Registrar trazabilidad para usuario anónimo
      if (deviceInfo.location) {
        await this.userRepository.trackAnonymousUser(
          deviceInfo.deviceId,
          deviceInfo.location,
          deviceInfo.ip
        );
      }

      // Log de actividad
      await this.trackingRepository.logUserActivity(
        user.id,
        'anonymous_signin',
        { platform: deviceInfo.platform },
        deviceInfo.location ? {
          latitude: deviceInfo.location.lat,
          longitude: deviceInfo.location.lng
        } : undefined,
        deviceInfo.deviceId,
        deviceInfo.ip
      );

      return user;
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      throw error;
    }
  }
}

export class SignInWithEmailUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(email: string, password: string): Promise<User> {
    try {
      return await this.userRepository.signInWithEmail(email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  }
}

export class CreateDriverUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(driverData: {
    name: string;
    email: string;
    licenseNumber: string;
    deviceId: string;
  }): Promise<Driver> {
    try {
      return await this.userRepository.createDriver({
        ...driverData,
        type: 'driver',
        isAnonymous: false,
        isOnline: false,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error('Error creating driver:', error);
      throw error;
    }
  }
}

export class ManageFavoriteRoutesUseCase {
  constructor(private userRepository: UserRepository) {}

  async addFavorite(userId: string, routeId: string): Promise<void> {
    try {
      await this.userRepository.addFavoriteRoute(userId, routeId);
    } catch (error) {
      console.error('Error adding favorite route:', error);
      throw error;
    }
  }

  async removeFavorite(userId: string, routeId: string): Promise<void> {
    try {
      await this.userRepository.removeFavoriteRoute(userId, routeId);
    } catch (error) {
      console.error('Error removing favorite route:', error);
      throw error;
    }
  }

  async getFavorites(userId: string): Promise<string[]> {
    try {
      return await this.userRepository.getFavoriteRoutes(userId);
    } catch (error) {
      console.error('Error getting favorite routes:', error);
      return [];
    }
  }
}
