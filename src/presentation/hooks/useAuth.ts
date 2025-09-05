// =============================================================================
// CUSTOM HOOKS - Presentation Layer
// =============================================================================

import { useEffect, useState, useCallback } from 'react';
import { useAppDispatch, useAppSelector, RootState } from '../../store';
import { 
  signInAnonymously, 
  signInWithEmail, 
  signInAsDriver,
  signOut,
} from '../../store/authSlice';
import * as Device from 'expo-device';
import * as Location from 'expo-location';

// Hook para autenticación
export const useAuth = () => {
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state: any) => state.auth || {});
  const user = useAppSelector((state: any) => state.auth?.user || null);
  const isDriver = useAppSelector((state: any) => state.auth?.user?.type === 'driver');

  // Computed properties from auth state
  const isAuthenticated = auth.isAuthenticated || false;
  const isAnonymous = auth.isAnonymous || false;
  const isLoading = auth.isLoading || false;
  const error = auth.error || null;

  const signInAnonymous = useCallback(async () => {
    try {
      const deviceId = Device.deviceName || 'unknown_device';
      const platform = Device.osName === 'iOS' ? 'ios' : 'android';
      
      // Obtener ubicación si está disponible
      let location;
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const locationData = await Location.getCurrentPositionAsync({});
          location = {
            lat: locationData.coords.latitude,
            lng: locationData.coords.longitude
          };
        }
      } catch (error) {
        console.log('Could not get location for anonymous user:', error);
      }

      await dispatch(signInAnonymously({
        deviceId,
        platform,
        location
      })).unwrap();
      
      return true;
    } catch (error) {
      console.error('Error signing in anonymously:', error);
      return false;
    }
  }, [dispatch]);

  const signInEmail = useCallback(async (email: string, password: string) => {
    try {
      await dispatch(signInWithEmail({ email, password })).unwrap();
      return true;
    } catch (error) {
      console.error('Error signing in with email:', error);
      return false;
    }
  }, [dispatch]);

  const signInDriver = useCallback(async (email: string, password: string) => {
    try {
      await dispatch(signInAsDriver({ email, password })).unwrap();
      return true;
    } catch (error) {
      console.error('Error signing in as driver:', error);
      return false;
    }
  }, [dispatch]);

  const logout = useCallback(() => {
    dispatch(signOut());
  }, [dispatch]);

  return {
    // Auth state
    isAuthenticated,
    isAnonymous,
    isLoading,
    error,
    // User data
    user,
    isDriver,
    // Actions
    signInAnonymous,
    signInEmail,
    signInDriver,
    logout,
  };
};

// Hook para ubicación del usuario
export const useUserLocation = () => {
  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permisos de ubicación denegados');
        setIsLoading(false);
        return null;
      }

      const locationData = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const newLocation = {
        latitude: locationData.coords.latitude,
        longitude: locationData.coords.longitude,
      };

      setLocation(newLocation);
      setIsLoading(false);
      return newLocation;
    } catch (error) {
      setError('Error al obtener ubicación');
      setIsLoading(false);
      console.error('Error getting location:', error);
      return null;
    }
  }, []);

  const watchLocation = useCallback((callback: (location: { latitude: number; longitude: number }) => void) => {
    let watchSubscription: Location.LocationSubscription | null = null;

    Location.requestForegroundPermissionsAsync().then(({ status }) => {
      if (status === 'granted') {
        Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            timeInterval: 5000, // Actualizar cada 5 segundos
            distanceInterval: 10, // Solo si se mueve al menos 10 metros
          },
          (locationData) => {
            const newLocation = {
              latitude: locationData.coords.latitude,
              longitude: locationData.coords.longitude,
            };
            setLocation(newLocation);
            callback(newLocation);
          }
        ).then((subscription) => {
          watchSubscription = subscription;
        });
      }
    });

    return () => {
      if (watchSubscription) {
        watchSubscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    getCurrentLocation();
  }, [getCurrentLocation]);

  return {
    location,
    error,
    isLoading,
    getCurrentLocation,
    watchLocation,
  };
};

// Hook para manejo de permisos
export const usePermissions = () => {
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');
  const [notificationPermission, setNotificationPermission] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  const requestLocationPermission = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      setLocationPermission(status === 'granted' ? 'granted' : 'denied');
      return status === 'granted';
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLocationPermission('denied');
      return false;
    }
  }, []);

  const checkPermissions = useCallback(async () => {
    try {
      // Verificar permisos de ubicación
      const locationStatus = await Location.getForegroundPermissionsAsync();
      setLocationPermission(locationStatus.status === 'granted' ? 'granted' : 'denied');

    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  }, []);

  useEffect(() => {
    checkPermissions();
  }, [checkPermissions]);

  return {
    locationPermission,
    notificationPermission,
    requestLocationPermission,
    checkPermissions,
  };
};

// Hook para información del dispositivo
export const useDeviceInfo = () => {
  const [deviceInfo, setDeviceInfo] = useState({
    deviceId: 'unknown',
    platform: 'unknown' as 'ios' | 'android' | 'unknown',
    deviceName: 'Unknown Device',
  });

  useEffect(() => {
    const getDeviceInfo = () => {
      const platform = Device.osName === 'iOS' ? 'ios' : Device.osName === 'Android' ? 'android' : 'unknown';
      const deviceId = Device.deviceName || `${platform}_${Date.now()}`;
      const deviceName = Device.deviceName || 'Unknown Device';

      setDeviceInfo({
        deviceId,
        platform,
        deviceName,
      });
    };

    getDeviceInfo();
  }, []);

  return deviceInfo;
};
