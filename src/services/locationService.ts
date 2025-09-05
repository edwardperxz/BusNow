// =============================================================================
// LOCATION SERVICE - Services Layer
// =============================================================================

import * as Location from 'expo-location';
import { Coordinates } from '../types';

export interface LocationService {
  getCurrentLocation(): Promise<Coordinates>;
  watchLocation(callback: (location: Coordinates) => void): () => void;
  requestPermissions(): Promise<boolean>;
}

class LocationServiceImpl implements LocationService {
  private watchSubscription: Location.LocationSubscription | null = null;

  async getCurrentLocation(): Promise<Coordinates> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    
    if (status !== 'granted') {
      throw new Error('Permission to access location was denied');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  }

  watchLocation(callback: (location: Coordinates) => void): () => void {
    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000,
            distanceInterval: 10,
          },
          (locationData) => {
            callback({
              latitude: locationData.coords.latitude,
              longitude: locationData.coords.longitude,
            });
          }
        ).then((subscription) => {
          this.watchSubscription = subscription;
        });
      }
    });

    return () => {
      if (this.watchSubscription) {
        this.watchSubscription.remove();
        this.watchSubscription = null;
      }
    };
  }

  async requestPermissions(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }
}

export const locationService = new LocationServiceImpl();
