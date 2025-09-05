// =============================================================================
// USER AUTHENTICATION USE CASE - Domain Layer
// =============================================================================

import { User, Passenger, Driver } from '../../types';
import { UserRepository } from '../repositories/UserRepository';
import { TrackingRepository } from '../repositories/TrackingRepository';

export class AuthenticateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private trackingRepository: TrackingRepository
  ) {}

  async signInAnonymously(deviceInfo: {
    deviceId: string;
    platform: 'ios' | 'android';
    location?: { lat: number; lng: number };
    ip?: string;
  }): Promise<User> {
    try {
      const user = await this.userRepository.signInAnonymously();
      
      // Log de usuario anónimo
      if (deviceInfo.location) {
        await this.userRepository.trackAnonymousUser(
          deviceInfo.deviceId,
          deviceInfo.location,
          deviceInfo.ip
        );
      }

      await this.trackingRepository.logUserActivity(
        user.id,
        'sign_in_anonymously',
        { deviceInfo },
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

  async signInWithEmail(email: string, password: string): Promise<User> {
    try {
      const user = await this.userRepository.signInWithEmail(email, password);
      
      await this.trackingRepository.logUserActivity(
        user.id,
        'sign_in_with_email',
        { email }
      );

      return user;
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  }

  async signOut(): Promise<void> {
    try {
      const currentUser = await this.userRepository.getCurrentUser();
      
      if (currentUser) {
        await this.trackingRepository.logUserActivity(
          currentUser.id,
          'sign_out',
          {}
        );
      }

      await this.userRepository.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }
}

export class ManageFavoriteRoutesUseCase {
  constructor(private userRepository: UserRepository) {}

  async addFavoriteRoute(userId: string, routeId: string): Promise<void> {
    try {
      await this.userRepository.addFavoriteRoute(userId, routeId);
    } catch (error) {
      console.error('Error adding favorite route:', error);
      throw error;
    }
  }

  async removeFavoriteRoute(userId: string, routeId: string): Promise<void> {
    try {
      await this.userRepository.removeFavoriteRoute(userId, routeId);
    } catch (error) {
      console.error('Error removing favorite route:', error);
      throw error;
    }
  }

  async getFavoriteRoutes(userId: string): Promise<string[]> {
    try {
      return await this.userRepository.getFavoriteRoutes(userId);
    } catch (error) {
      console.error('Error getting favorite routes:', error);
      return [];
    }
  }
}
