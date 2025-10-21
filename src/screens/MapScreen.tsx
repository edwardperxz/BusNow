import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Dimensions,
  ScrollView,
  Alert,
  Platform,
  StyleSheet,
  StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

import { getTheme, CommonStyles, getBusStatusColor, getRouteColor } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';
import { useSearch } from '../context/SearchContext';
import GooglePlacesSearchInteractive from '../components/GooglePlacesSearchInteractive';

interface Bus {
  id: string;
  latitude: number;
  longitude: number;
  route: string;
  status: 'active' | 'inactive' | 'maintenance' | 'delayed';
  capacity: 'low' | 'medium' | 'high' | 'full';
  direction: string;
  nextStop: string;
  estimatedArrival: string;
  speed: number;
}

interface BusStop {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  routes: string[];
}

const { width, height } = Dimensions.get('window');

// Coordenadas de David, Chiriquí, Panamá por defecto
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
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "elementType": "labels.icon",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#212121"
      }
    ]
  },
  {
    "featureType": "administrative",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "administrative.country",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#9e9e9e"
      }
    ]
  },
  {
    "featureType": "administrative.land_parcel",
    "stylers": [
      {
        "visibility": "off"
      }
    ]
  },
  {
    "featureType": "administrative.locality",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#bdbdbd"
      }
    ]
  },
  {
    "featureType": "poi",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#181818"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "poi.park",
    "elementType": "labels.text.stroke",
    "stylers": [
      {
        "color": "#1b1b1b"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "geometry.fill",
    "stylers": [
      {
        "color": "#2c2c2c"
      }
    ]
  },
  {
    "featureType": "road",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#8a8a8a"
      }
    ]
  },
  {
    "featureType": "road.arterial",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#373737"
      }
    ]
  },
  {
    "featureType": "road.highway",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#3c3c3c"
      }
    ]
  },
  {
    "featureType": "road.highway.controlled_access",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#4e4e4e"
      }
    ]
  },
  {
    "featureType": "road.local",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#616161"
      }
    ]
  },
  {
    "featureType": "transit",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#757575"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "geometry",
    "stylers": [
      {
        "color": "#000000"
      }
    ]
  },
  {
    "featureType": "water",
    "elementType": "labels.text.fill",
    "stylers": [
      {
        "color": "#3d3d3d"
      }
    ]
  }
];

export default function MapScreen() {
  const { theme } = useSettings();
  const { searchState, setSearchState } = useSearch();
  const colors = getTheme(theme === 'dark');
  const isDark = theme === 'dark';
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(DAVID_COORDS);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  
  // Google Maps API Key from environment
  const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  // Función para manejar la selección de lugares
  const handlePlaceSelect = (place: any) => {
    setSelectedPlace(place);
    
    // Animación hacia la ubicación seleccionada
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: place.latitude,
        longitude: place.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 1000);
    }
  };

  // Función para manejar cambios de estado del buscador
  const handleSearchStateChange = (state: 'hidden' | 'neutral' | 'expanded') => {
    setSearchState(state);
  };

  // Datos simulados para David, Chiriquí con coordenadas reales
  const simulatedBuses: Bus[] = [
    {
      id: 'BN-001',
      latitude: -12.0464 + (Math.random() - 0.5) * 0.02,
      longitude: -77.0428 + (Math.random() - 0.5) * 0.02,
      route: 'Línea Verde',
      status: 'active',
      capacity: 'medium',
      direction: 'Centro → Miraflores',
      nextStop: 'Av. Javier Prado',
      estimatedArrival: '3 min',
      speed: 25
    },
    {
      id: 'BN-002',
      latitude: -12.0564 + (Math.random() - 0.5) * 0.02,
      longitude: -77.0328 + (Math.random() - 0.5) * 0.02,
      route: 'Línea Azul',
      status: 'active',
      capacity: 'low',
      direction: 'San Isidro → Callao',
      nextStop: 'Plaza San Martín',
      estimatedArrival: '7 min',
      speed: 30
    },
    {
      id: 'BN-003',
      latitude: -12.0364 + (Math.random() - 0.5) * 0.02,
      longitude: -77.0528 + (Math.random() - 0.5) * 0.02,
      route: 'Línea Naranja',
      status: 'delayed',
      capacity: 'high',
      direction: 'Villa → San Juan',
      nextStop: 'Estación Central',
      estimatedArrival: '12 min',
      speed: 15
    },
    {
      id: 'BN-004',
      latitude: -12.0264 + (Math.random() - 0.5) * 0.02,
      longitude: -77.0628 + (Math.random() - 0.5) * 0.02,
      route: 'Línea Morada',
      status: 'maintenance',
      capacity: 'full',
      direction: 'Fuera de servicio',
      nextStop: 'Taller',
      estimatedArrival: 'N/A',
      speed: 0
    }
  ];

  // Datos simulados de paradas de bus (David, Chiriquí, Panamá)
  const simulatedBusStops: BusStop[] = [
    { 
      id: 'stop_001', 
      name: 'Centro de David', 
      latitude: 8.4333, 
      longitude: -82.4333, 
      routes: ['Verde', 'Azul'] 
    },
    { 
      id: 'stop_002', 
      name: 'Parque Cervantes', 
      latitude: 8.4280, 
      longitude: -82.4280, 
      routes: ['Azul', 'Naranja'] 
    },
    { 
      id: 'stop_003', 
      name: 'Terminal de Buses', 
      latitude: 8.4400, 
      longitude: -82.4400, 
      routes: ['Verde', 'Morada'] 
    },
    { 
      id: 'stop_004', 
      name: 'Hospital Chiriquí', 
      latitude: 8.4250, 
      longitude: -82.4350, 
      routes: ['Naranja'] 
    },
    { 
      id: 'stop_005', 
      name: 'Universidad Tecnológica', 
      latitude: 8.4100, 
      longitude: -82.4100, 
      routes: ['Azul', 'Morada'] 
    }
  ];

  useEffect(() => {
    initializeLocation();
    setBuses(simulatedBuses);
    setBusStops(simulatedBusStops);

    // Simular movimiento de buses cada 5 segundos
    const interval = setInterval(() => {
      setBuses(prevBuses =>
        prevBuses.map(bus => ({
          ...bus,
          latitude: bus.latitude + (Math.random() - 0.5) * 0.0005,
          longitude: bus.longitude + (Math.random() - 0.5) * 0.0005,
        }))
      );
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const initializeLocation = async () => {
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permisos requeridos', 
          'Necesitamos acceso a tu ubicación para mostrarte el mapa',
          [
            { text: 'Cancelar', style: 'cancel' },
            { text: 'Configurar', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
        setIsLoading(false);
        return;
      }

      let currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Centrar el mapa en la ubicación actual
      const newRegion = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      };
      setRegion(newRegion);
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      Alert.alert('Error', 'No se pudo obtener tu ubicación. Mostrando David por defecto.');
    } finally {
      setIsLoading(false);
    }
  };

  const centerOnUser = () => {
    if (location && mapRef.current) {
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current.animateToRegion(newRegion, 1000);
    }
  };

  const filteredStops = busStops.filter(stop =>
    stop.name.toLowerCase().includes(searchText.toLowerCase()) ||
    stop.routes.some(route => route.toLowerCase().includes(searchText.toLowerCase()))
  );

  const renderBusMarker = (bus: Bus) => {
    const routeNumber = parseInt(bus.route.split(' ')[1]?.slice(-1)) || 1;
    
    return (
      <Marker
        key={bus.id}
        coordinate={{
          latitude: bus.latitude,
          longitude: bus.longitude,
        }}
        onPress={() => setSelectedBus(selectedBus?.id === bus.id ? null : bus)}
      >
        <View style={[styles.busMarker, { 
          backgroundColor: getRouteColor(routeNumber),
          borderColor: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white
        }]}>
          <Text style={[styles.busMarkerText, { color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white }]}>🚌</Text>
          <View style={[styles.statusIndicator, { 
            backgroundColor: getBusStatusColor(bus.status),
            borderColor: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white
          }]} />
        </View>
        
        <Callout tooltip>
          <View style={[styles.calloutContainer, { backgroundColor: colors.white }]}>
            <Text style={[styles.calloutTitle, { color: colors.gray800 }]}>{bus.route}</Text>
            <Text style={[styles.calloutText, { color: colors.gray600 }]}>{bus.direction}</Text>
            <Text style={[styles.calloutText, { color: colors.gray600 }]}>Próxima: {bus.nextStop}</Text>
            <Text style={[styles.calloutText, { color: colors.gray600 }]}>ETA: {bus.estimatedArrival}</Text>
          </View>
        </Callout>
      </Marker>
    );
  };

  const renderBusStopMarker = (stop: BusStop) => {
    return (
      <Marker
        key={stop.id}
        coordinate={{
          latitude: stop.latitude,
          longitude: stop.longitude,
        }}
      >
        <View style={[styles.stopMarker, { 
          backgroundColor: colors.white,
          borderColor: colors.secondary
        }]}>
          <Text style={styles.stopMarkerText}>🚏</Text>
        </View>
        
        <Callout tooltip>
          <View style={[styles.calloutContainer, { backgroundColor: colors.white }]}>
            <Text style={[styles.calloutTitle, { color: colors.gray800 }]}>{stop.name}</Text>
            <Text style={[styles.calloutText, { color: colors.gray600 }]}>Rutas: {stop.routes.join(', ')}</Text>
          </View>
        </Callout>
      </Marker>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.gray100 }]}>
      {/* Mapa - Área central principal */}
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
          {/* Marcadores de buses */}
          {buses.map(renderBusMarker)}
          
          {/* Marcadores de paradas */}
          {busStops.map(renderBusStopMarker)}
          
          {/* Marcador del lugar seleccionado */}
          {selectedPlace && (
            <Marker
              coordinate={{
                latitude: selectedPlace.latitude,
                longitude: selectedPlace.longitude,
              }}
              title={selectedPlace.structured_formatting.main_text}
              description={selectedPlace.structured_formatting.secondary_text}
            >
              <View style={[styles.selectedPlaceMarker, { backgroundColor: colors.accent }]}>
                <Text style={styles.selectedPlaceMarkerText}>📍</Text>
              </View>
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={[styles.calloutTitle, { color: colors.gray800 }]}>
                    {selectedPlace.structured_formatting.main_text}
                  </Text>
                  <Text style={[styles.calloutDescription, { color: colors.gray600 }]}>
                    {selectedPlace.structured_formatting.secondary_text}
                  </Text>
                </View>
              </Callout>
            </Marker>
          )}
        </MapView>

        {/* Controles del mapa - Centro derecha */}
        <View style={styles.mapControls}>
          {/* Información de buses activos */}
          <View style={[styles.busCountBadge, { backgroundColor: colors.white }]}>
            <Text style={[styles.busCountText, { color: colors.gray700 }]}>
              {buses.filter(b => b.status === 'active').length} buses activos
            </Text>
          </View>
          
          {/* Botones de control */}
          <View style={styles.controlButtons}>
            {/* Botón de ubicación */}
            {location && (
              <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.white }]} onPress={centerOnUser}>
                <Text style={styles.controlButtonText}>📍</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* Información del bus seleccionado - Overlay sobre el mapa */}
      {selectedBus && (
        <View style={[styles.busInfo, { backgroundColor: colors.white }]}>
          <View style={styles.busInfoHeader}>
            <View style={[styles.busInfoIcon, { backgroundColor: colors.primary }]}>
              <Text style={[styles.busInfoIconText, { color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white }]}>🚌</Text>
            </View>
            
            <View style={styles.busInfoDetails}>
              <Text style={[styles.busInfoTitle, { color: colors.gray800 }]}>
                {selectedBus.route} • {selectedBus.id}
              </Text>
              <Text style={[styles.busInfoDirection, { color: colors.gray500 }]}>
                {selectedBus.direction}
              </Text>
            </View>
            
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.gray200 }]}
              onPress={() => setSelectedBus(null)}
            >
              <Text style={[styles.closeButtonText, { color: colors.gray600 }]}>×</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.busInfoNextStop, { color: colors.primary }]}>
            Próxima parada: {selectedBus.nextStop} • {selectedBus.estimatedArrival}
          </Text>
        </View>
      )}

      {/* Google Places Search - Buscador con datos reales */}
      <GooglePlacesSearchInteractive
        onPlaceSelect={handlePlaceSelect}
        placeholder="¿A dónde vas?"
        apiKey={googleMapsApiKey}
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
  mapContainer: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    right: CommonStyles.spacing.md,
    top: '45%',
    alignItems: 'center',
    zIndex: 100,
  },
  busCountBadge: {
    borderRadius: CommonStyles.borderRadius.medium,
    paddingHorizontal: CommonStyles.spacing.md,
    paddingVertical: CommonStyles.spacing.sm,
    marginBottom: CommonStyles.spacing.sm,
    ...CommonStyles.cardShadow,
  },
  busCountText: {
    ...CommonStyles.typography.small,
    fontWeight: '600',
  },
  controlButtons: {
    alignItems: 'center',
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...CommonStyles.cardShadow,
  },
  controlButtonText: {
    fontSize: 20,
  },
  busMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  busMarkerText: {
    fontSize: 16,
  },
  statusIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
  },
  stopMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  stopMarkerText: {
    fontSize: 12,
  },
  calloutContainer: {
    padding: CommonStyles.spacing.sm,
    borderRadius: CommonStyles.borderRadius.small,
    minWidth: 150,
    ...CommonStyles.cardShadow,
  },
  calloutTitle: {
    ...CommonStyles.typography.bodyMedium,
    marginBottom: 4,
  },
  calloutText: {
    ...CommonStyles.typography.small,
  },
  busInfo: {
    position: 'absolute',
    bottom: 120,
    left: CommonStyles.spacing.md,
    right: CommonStyles.spacing.md,
    borderRadius: CommonStyles.borderRadius.medium,
    padding: CommonStyles.spacing.md,
    ...CommonStyles.cardShadow,
    zIndex: 200,
  },
  busInfoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: CommonStyles.spacing.sm,
  },
  busInfoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: CommonStyles.spacing.sm,
  },
  busInfoIconText: {
    fontSize: 12,
  },
  busInfoDetails: {
    flex: 1,
  },
  busInfoTitle: {
    ...CommonStyles.typography.bodyMedium,
  },
  busInfoDirection: {
    ...CommonStyles.typography.small,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
  },
  busInfoNextStop: {
    ...CommonStyles.typography.caption,
  },
  searchContainer: {
    position: 'absolute',
    bottom: CommonStyles.spacing.md,
    left: CommonStyles.spacing.md,
    right: CommonStyles.spacing.md,
    borderRadius: CommonStyles.borderRadius.medium,
    ...CommonStyles.cardShadow,
    zIndex: 300,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: CommonStyles.spacing.md,
  },
  searchIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: CommonStyles.spacing.md,
  },
  textInput: {
    flex: 1,
    ...CommonStyles.typography.body,
  },
  searchResults: {
    borderTopWidth: 1,
    maxHeight: 200,
  },
  searchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: CommonStyles.spacing.md,
    borderBottomWidth: 1,
  },
  searchResultIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: CommonStyles.spacing.md,
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    ...CommonStyles.typography.bodyMedium,
  },
  searchResultSubtitle: {
    ...CommonStyles.typography.small,
  },
  noResults: {
    padding: CommonStyles.spacing.lg,
    alignItems: 'center',
  },
  noResultsText: {
    ...CommonStyles.typography.caption,
  },
  selectedPlaceMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  selectedPlaceMarkerText: {
    fontSize: 20,
  },
  calloutDescription: {
    fontSize: 12,
    lineHeight: 16,
  },
  menuButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 54 : (StatusBar.currentHeight || 24) + 10,
    left: CommonStyles.spacing.md,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    ...CommonStyles.cardShadow,
  },
});