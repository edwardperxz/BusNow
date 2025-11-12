import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator
} from 'react-native';
import * as Location from 'expo-location';
import { getTheme } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import busTrackingService from '../services/firebaseBusTracking';

export default function DriverScreen() {
  const { theme } = useSettings();
  const { profile, signOut } = useAuth();
  const colors = getTheme(theme === 'dark');
  
  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, []);

  const startTracking = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicación para funcionar');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      setCurrentLocation(loc);

      // Enviar ubicación inicial
      await busTrackingService.sendDriverLocation(
        profile?.uid || '',
        loc.coords.latitude,
        loc.coords.longitude,
        loc.coords.heading || undefined,
        loc.coords.speed ? loc.coords.speed * 3.6 : undefined // m/s a km/h
      );

      // Suscribirse a actualizaciones de ubicación
      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: Number(process.env.EXPO_PUBLIC_LOCATION_UPDATE_INTERVAL || 5000),
          distanceInterval: Number(process.env.EXPO_PUBLIC_LOCATION_MIN_DISTANCE || 10),
        },
        async (newLocation) => {
          setCurrentLocation(newLocation);
          await busTrackingService.sendDriverLocation(
            profile?.uid || '',
            newLocation.coords.latitude,
            newLocation.coords.longitude,
            newLocation.coords.heading || undefined,
            newLocation.coords.speed ? newLocation.coords.speed * 3.6 : undefined
          );
        }
      );

      setSubscription(sub);
      setIsTracking(true);
      Alert.alert('Servicio iniciado', 'Tu ubicación está siendo compartida');
    } catch (error) {
      console.error('Error iniciando tracking:', error);
      Alert.alert('Error', 'No se pudo iniciar el servicio');
    }
  };

  const stopTracking = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
    setIsTracking(false);
    Alert.alert('Servicio detenido', 'Tu ubicación ya no está siendo compartida');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro? Esto detendrá el servicio de rastreo.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            stopTracking();
            await signOut();
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.gray900 }]}>
          Panel del Conductor
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.gray600 }]}>
          Bienvenido, {profile?.name}
        </Text>
        {profile?.busNumber && (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>Bus #{profile.busNumber}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={[styles.statusCard, { backgroundColor: colors.gray100 }]}>
          <Text style={[styles.statusLabel, { color: colors.gray600 }]}>Estado del servicio</Text>
          <View style={styles.statusRow}>
            <View style={[
              styles.statusDot,
              { backgroundColor: isTracking ? colors.busActive : colors.busInactive }
            ]} />
            <Text style={[styles.statusText, { color: colors.gray900 }]}>
              {isTracking ? 'En servicio' : 'Fuera de servicio'}
            </Text>
          </View>

          {currentLocation && (
            <View style={styles.locationInfo}>
              <Text style={[styles.locationLabel, { color: colors.gray600 }]}>
                Última ubicación:
              </Text>
              <Text style={[styles.locationText, { color: colors.gray700 }]}>
                {currentLocation.coords.latitude.toFixed(6)}, {currentLocation.coords.longitude.toFixed(6)}
              </Text>
              {currentLocation.coords.speed !== null && (
                <Text style={[styles.locationText, { color: colors.gray700 }]}>
                  Velocidad: {(currentLocation.coords.speed * 3.6).toFixed(1)} km/h
                </Text>
              )}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.mainButton,
            { backgroundColor: isTracking ? colors.busDelayed : colors.busActive }
          ]}
          onPress={isTracking ? stopTracking : startTracking}
        >
          <Text style={styles.mainButtonText}>
            {isTracking ? '⏸️ Detener Servicio' : '▶️ Iniciar Servicio'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.helpText, { color: colors.gray600 }]}>
          {isTracking 
            ? 'Los pasajeros pueden ver tu ubicación en el mapa en tiempo real.'
            : 'Presiona "Iniciar Servicio" para compartir tu ubicación con los pasajeros.'
          }
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.logoutButton, { borderColor: colors.gray300 }]}
        onPress={handleLogout}
      >
        <Text style={[styles.logoutText, { color: colors.busDelayed }]}>
          Cerrar Sesión
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 24,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  statusCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 24,
  },
  statusLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
  },
  locationInfo: {
    marginTop: 8,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
  },
  locationLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationText: {
    fontSize: 13,
    marginBottom: 2,
  },
  mainButton: {
    height: 64,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  helpText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 16,
  },
  logoutButton: {
    marginHorizontal: 24,
    marginBottom: 32,
    height: 56,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
