import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import * as Location from 'expo-location';
import { getTheme } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';
import { useAuth } from '../context/AuthContext';
import busTrackingService from '../services/firebaseBusTracking';
import { useRoutesData } from '../features/routes/hooks/useRoutesData';

export default function DriverScreen() {
  const { theme } = useSettings();
  const { profile, signOut, updateUserProfile } = useAuth();
  const colors = getTheme(theme === 'dark');
  const { routes, loading: loadingRoutes } = useRoutesData();

  const [isTracking, setIsTracking] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const [subscription, setSubscription] = useState<Location.LocationSubscription | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState(profile?.currentRouteId ?? '');

  useEffect(() => {
    setSelectedRouteId(profile?.currentRouteId ?? '');
  }, [profile?.currentRouteId]);

  const stopTracking = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
    }
    setIsTracking(false);
    Alert.alert('Servicio detenido', 'Tu ubicacion ya no esta siendo compartida');
  };

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [subscription]);

  const handleSelectRoute = async (routeId: string) => {
    setSelectedRouteId(routeId);
    try {
      await updateUserProfile({ currentRouteId: routeId });
    } catch (error) {
      console.error('No se pudo guardar la ruta del conductor', error);
    }
  };

  const startTracking = async () => {
    try {
      const busId = String(profile?.busNumber || '').trim();
      if (!busId) {
        Alert.alert('Bus requerido', 'Tu perfil no tiene un bus asignado');
        return;
      }

      if (!selectedRouteId) {
        Alert.alert('Ruta requerida', 'Selecciona una ruta antes de iniciar servicio');
        return;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Necesitamos acceso a tu ubicacion para funcionar');
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      setCurrentLocation(loc);

      await busTrackingService.sendDriverLocation(
        busId,
        selectedRouteId,
        loc.coords.latitude,
        loc.coords.longitude,
        loc.coords.heading || undefined,
        loc.coords.speed ? loc.coords.speed * 3.6 : undefined,
        'active'
      );

      const sub = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: Number(process.env.EXPO_PUBLIC_LOCATION_UPDATE_INTERVAL || 5000),
          distanceInterval: Number(process.env.EXPO_PUBLIC_LOCATION_MIN_DISTANCE || 10),
        },
        async (newLocation) => {
          setCurrentLocation(newLocation);
          await busTrackingService.sendDriverLocation(
            busId,
            selectedRouteId,
            newLocation.coords.latitude,
            newLocation.coords.longitude,
            newLocation.coords.heading || undefined,
            newLocation.coords.speed ? newLocation.coords.speed * 3.6 : undefined,
            'active'
          );
        }
      );

      setSubscription(sub);
      setIsTracking(true);
      Alert.alert('Servicio iniciado', 'Tu ubicacion esta siendo compartida');
    } catch (error) {
      console.error('Error iniciando tracking:', error);
      Alert.alert('Error', 'No se pudo iniciar el servicio');
    }
  };

  const handleLogout = async () => {
    Alert.alert('Cerrar sesion', 'Estas seguro? Esto detendra el servicio de rastreo.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Cerrar sesion',
        style: 'destructive',
        onPress: async () => {
          stopTracking();
          await signOut();
        },
      },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: colors.gray900 }]}>Panel del Conductor</Text>
        <Text style={[styles.headerSubtitle, { color: colors.gray600 }]}>Bienvenido, {profile?.name}</Text>
        {profile?.busNumber ? (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>Bus #{profile.busNumber}</Text>
          </View>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.statusCard, { backgroundColor: colors.gray100 }]}>
          <Text style={[styles.statusLabel, { color: colors.gray600 }]}>Estado del servicio</Text>
          <View style={styles.statusRow}>
            <View style={[styles.statusDot, { backgroundColor: isTracking ? colors.busActive : colors.busInactive }]} />
            <Text style={[styles.statusText, { color: colors.gray900 }]}>{isTracking ? 'En servicio' : 'Fuera de servicio'}</Text>
          </View>

          {currentLocation ? (
            <View style={styles.locationInfo}>
              <Text style={[styles.locationLabel, { color: colors.gray600 }]}>Ultima ubicacion:</Text>
              <Text style={[styles.locationText, { color: colors.gray700 }]}>
                {currentLocation.coords.latitude.toFixed(6)}, {currentLocation.coords.longitude.toFixed(6)}
              </Text>
              {currentLocation.coords.speed !== null ? (
                <Text style={[styles.locationText, { color: colors.gray700 }]}>
                  Velocidad: {(currentLocation.coords.speed * 3.6).toFixed(1)} km/h
                </Text>
              ) : null}
            </View>
          ) : null}
        </View>

        <View style={[styles.statusCard, { backgroundColor: colors.gray100 }]}>
          <Text style={[styles.statusLabel, { color: colors.gray600 }]}>Ruta asignada para esta sesion</Text>
          {loadingRoutes ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <View style={styles.routeList}>
              {routes.map((route) => {
                const selected = selectedRouteId === route.id;
                return (
                  <TouchableOpacity
                    key={route.id}
                    style={[
                      styles.routeChip,
                      {
                        backgroundColor: selected ? colors.primary : colors.white,
                        borderColor: selected ? colors.primary : colors.gray300,
                      },
                    ]}
                    onPress={() => handleSelectRoute(route.id)}
                  >
                    <Text style={{ color: selected ? '#FFFFFF' : colors.gray800, fontWeight: '700' }}>{route.name}</Text>
                    <Text style={{ color: selected ? 'rgba(255,255,255,0.8)' : colors.gray500, fontSize: 12 }}>
                      {route.code ?? route.id}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[styles.mainButton, { backgroundColor: isTracking ? colors.busDelayed : colors.busActive }]}
          onPress={isTracking ? stopTracking : startTracking}
        >
          <Text style={styles.mainButtonText}>{isTracking ? 'Detener servicio' : 'Iniciar servicio'}</Text>
        </TouchableOpacity>

        <Text style={[styles.helpText, { color: colors.gray600 }]}>
          {isTracking
            ? 'Los pasajeros pueden ver tu ubicacion y la ruta asignada en el mapa en tiempo real.'
            : 'Selecciona la ruta que vas a operar y luego inicia el servicio.'}
        </Text>
      </ScrollView>

      <TouchableOpacity style={[styles.logoutButton, { borderColor: colors.gray300 }]} onPress={handleLogout}>
        <Text style={[styles.logoutText, { color: colors.busDelayed }]}>Cerrar sesion</Text>
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
    paddingHorizontal: 24,
    paddingBottom: 32,
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
  routeList: {
    gap: 10,
  },
  routeChip: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
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
