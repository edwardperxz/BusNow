import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
  StyleSheet,
  StatusBar,
} from 'react-native';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { httpsCallable } from 'firebase/functions';

import { getTheme, CommonStyles } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';
import { useSearch } from '../context/SearchContext';
import GooglePlacesSearchInteractive from '../components/GooglePlacesSearchInteractive';
import { decodePolyline } from '../utils/polyline';
import busTrackingService, { BusLocation } from '../services/firebaseBusTracking';
import { DEMO_MODE } from '../demo/demoConfig';
import { useDynamicETA } from '../hooks/useDynamicETA';
import { fn } from '../services/firebaseApp';

// Importación dinámica de maps solo en Android/Web
let MapView: any, Marker: any, Polyline: any, PROVIDER_GOOGLE: any;
if (Platform.OS !== 'ios') {
  const maps = require('react-native-maps');
  MapView = maps.default;
  Marker = maps.Marker;
  Polyline = maps.Polyline;
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
}

const { width, height } = Dimensions.get('window');

// Coordenadas de David, Chiriquí, Panamá 
const DAVID_COORDS = {
  latitude: 8.4333,
  longitude: -82.4333,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

// Estilo oscuro para Google Maps
const darkMapStyle = [
  {
    "elementType": "geometry",
    "stylers": [{ "color": "#212121" }]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [{ "color": "#757575" }]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [{ "color": "#2c2c2c" }]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [{ "color": "#17263c" }]
  }
];

export default function MapScreen() {
  const { theme } = useSettings();
  const colors = getTheme(theme === 'dark');

  // iOS: Mostrar mensaje de que maps no está disponible
  if (Platform.OS === 'ios') {
    return (
      <View style={[styles.container, styles.iosFallback, { backgroundColor: colors.gray100 }]}>
        <Text style={[styles.iosTitle, { color: colors.text }]}>
          📍 Maps no disponible en Expo Go
        </Text>
        <Text style={[styles.iosSubtitle, { color: colors.textSecondary }]}>
          Los mapas requieren una compilación nativa en iOS.
        </Text>
        <Text style={[styles.iosDescription, { color: colors.textSecondary }]}>
          Puedes ver rutas y buses en otras pantallas. Para usar maps, compila con EAS.
        </Text>
      </View>
    );
  }

  // Android/Web: Component completo
  const { searchState, setSearchState } = useSearch();
  const isDark = theme === 'dark';
  const mapRef = useRef<any>(null);
  
  const [region, setRegion] = useState(DAVID_COORDS);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [routeOrigin, setRouteOrigin] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [routeDestination, setRouteDestination] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [buses, setBuses] = useState<BusLocation[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  
  const stopLocation = routeDestination
    ? { latitude: routeDestination.latitude, longitude: routeDestination.longitude }
    : null;
  
  const { eta, loading: etaLoading, error: etaError } = useDynamicETA({
    busId: selectedBusId || '',
    stopLocation,
    enabled: Boolean(selectedBusId && stopLocation)
  });
  
  const getRouteDirectionsFn = httpsCallable(fn, 'getRouteDirections');

  // Función para manejar la selección de lugares
  const handlePlaceSelect = (place: any) => {
    setSelectedPlace(place);
  };

  // Función para manejar cambios de estado del buscador
  const handleSearchStateChange = (state: 'hidden' | 'neutral' | 'expanded') => {
    setSearchState(state);
  };

  useEffect(() => {
    initializeLocation();
    fetchRoute();
  }, []);

  // Suscripción a buses activos en Firestore
  useEffect(() => {
    const unsubscribe = busTrackingService.onActiveBuses((list) => {
      setBuses(list);
      if (selectedBusId && !list.find(b => b.busId === selectedBusId)) {
        setSelectedBusId(null);
      }
    });
    return () => {
      unsubscribe && unsubscribe();
    };
  }, [selectedBusId]);

  // Obtener ruta desde backend (Cloud Function), evitando llamadas directas a Google en cliente
  const fetchRoute = async () => {
    try {
      const response = await getRouteDirectionsFn({
        origin: 'Parque Cervantes, David, Chiriquí, Panamá',
        destination: 'Romero Doleguita, David, Chiriquí, Panamá',
      });

      const data = response.data as {
        ok?: boolean;
        route?: {
          polyline: string;
          origin: { latitude: number; longitude: number; address: string };
          destination: { latitude: number; longitude: number; address: string };
        };
      };

      if (data?.ok && data.route?.polyline) {
        const decodedCoords = decodePolyline(data.route.polyline);
        setRouteCoordinates(decodedCoords);

        setRouteOrigin(data.route.origin);
        setRouteDestination(data.route.destination);
      }
    } catch (error) {
      console.error('Error fetching route from backend:', error);
    }
  };

  const initializeLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos', 
          'Necesitamos acceso a tu ubicación',
          [{ text: 'OK', style: 'cancel' }]
        );
        setIsLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);
      setRegion({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      });
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.moveCamera({
        target: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        zoom: 16,
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.gray100 }]}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          loadingEnabled={isLoading}
          mapType="standard"
          customMapStyle={isDark ? darkMapStyle : undefined}
        >
          {buses.map((bus) => (
            <Marker
              key={bus.busId}
              coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
              title={`Bus ${bus.busId}`}
              description={bus.updatedAt ? `Actualizado: ${new Date(bus.updatedAt).toLocaleTimeString()}` : undefined}
              pinColor={selectedBusId === bus.busId ? '#0066FF' : '#2F80ED'}
              onPress={() => setSelectedBusId(bus.busId)}
            />
          ))}

          {routeCoordinates.length > 0 && (
            <>
              <Polyline
                coordinates={routeCoordinates}
                strokeColor="#FF0000"
                strokeWidth={4}
                lineCap="round"
                lineJoin="round"
              />
              {eta?.polyline && (
                <Polyline
                  coordinates={decodePolyline(eta.polyline)}
                  strokeColor="#2F80ED"
                  strokeWidth={4}
                  lineDashPattern={[6, 6]}
                />
              )}
              {!eta?.polyline && selectedBusId && stopLocation && (() => {
                const bus = buses.find(b => b.busId === selectedBusId);
                if (!bus) return null;
                return (
                  <Polyline
                    coordinates={[{ latitude: bus.latitude, longitude: bus.longitude }, stopLocation]}
                    strokeColor="#2F80ED"
                    strokeWidth={3}
                    lineDashPattern={[4, 8]}
                  />
                );
              })()}
              {routeOrigin && (
                <Marker
                  coordinate={{ latitude: routeOrigin.latitude, longitude: routeOrigin.longitude }}
                  title="Origen"
                  description={routeOrigin.address}
                  pinColor="green"
                />
              )}
              {routeDestination && (
                <Marker
                  coordinate={{ latitude: routeDestination.latitude, longitude: routeDestination.longitude }}
                  title="Destino"
                  description={routeDestination.address}
                  pinColor="red"
                />
              )}
            </>
          )}

          {selectedPlace && (
            <Marker
              coordinate={{
                latitude: selectedPlace.latitude,
                longitude: selectedPlace.longitude,
              }}
              title={selectedPlace.structured_formatting.main_text}
              description={selectedPlace.structured_formatting.secondary_text}
            />
          )}
        </MapView>

        <View style={styles.mapControls}>
          <View style={[styles.busCountBadge, { backgroundColor: colors.white }]}>
            <Text style={[styles.busCountText, { color: colors.gray800 }]}>
              {buses.length} buses activos
            </Text>
          </View>

          <View style={styles.controlButtons}>
            {location && (
              <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.white }]} onPress={centerOnUser}>
                <Text style={styles.controlButtonText}>📍</Text>
              </TouchableOpacity>
            )}
          </View>

          {DEMO_MODE && (
            <View style={[styles.demoBanner, { backgroundColor: colors.accent }]}>
              <Text style={{ color: '#fff', fontWeight: '700' }}>MODO DEMO</Text>
            </View>
          )}
        </View>

        {selectedBusId && stopLocation && (
          <View style={[styles.etaCard, { backgroundColor: colors.white }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <Text style={[styles.etaTitle, { color: colors.gray900 }]}>ETA</Text>
              <Text style={{ color: colors.gray600 }}>Bus {selectedBusId}</Text>
            </View>
            {etaLoading ? (
              <Text style={{ color: colors.gray700 }}>Calculando…</Text>
            ) : etaError ? (
              <Text style={{ color: '#D32F2F' }}>Error: {etaError}</Text>
            ) : eta ? (
              <>
                <Text style={[styles.etaMain, { color: colors.gray900 }]}>{eta.durationText} · {eta.distanceText}</Text>
              </>
            ) : null}
          </View>
        )}
      </View>

      <GooglePlacesSearchInteractive
        onPlaceSelect={handlePlaceSelect}
        placeholder="¿A dónde vas?"
        countryCode="PA"
        location={`${DAVID_COORDS.latitude},${DAVID_COORDS.longitude}`}
        radius={50000}
        onSearchStateChange={handleSearchStateChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iosFallback: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iosTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  iosSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  iosDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    right: 16,
    top: 16,
    bottom: 16,
    pointerEvents: 'box-none',
  },
  busCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  busCountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  controlButtons: {
    gap: 12,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  controlButtonText: {
    fontSize: 20,
  },
  demoBanner: {
    position: 'absolute',
    left: -60,
    top: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  etaCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  etaTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  etaMain: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
});
