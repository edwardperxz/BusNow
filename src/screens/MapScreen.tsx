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
  StyleSheet
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker, Region, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';

import { BusNowColors, CommonStyles, getBusStatusColor, getRouteColor, getTheme } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';

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

// Coordenadas de Lima, Perú por defecto
const LIMA_COORDS = {
  latitude: -12.0464,
  longitude: -77.0428,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
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
  const colors = getTheme(theme === 'dark');
  const isDark = theme === 'dark';
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState<Region>(LIMA_COORDS);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Datos simulados para Lima con coordenadas reales
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

  // Datos simulados de paradas de bus (Lima, Perú)
  const simulatedBusStops: BusStop[] = [
    { 
      id: 'stop_001', 
      name: 'Centro de Lima', 
      latitude: -12.0464, 
      longitude: -77.0428, 
      routes: ['Verde', 'Azul'] 
    },
    { 
      id: 'stop_002', 
      name: 'Plaza Mayor', 
      latitude: -12.0472, 
      longitude: -77.0300, 
      routes: ['Azul', 'Naranja'] 
    },
    { 
      id: 'stop_003', 
      name: 'Miraflores', 
      latitude: -12.1203, 
      longitude: -77.0286, 
      routes: ['Verde', 'Morada'] 
    },
    { 
      id: 'stop_004', 
      name: 'San Isidro', 
      latitude: -12.0969, 
      longitude: -77.0362, 
      routes: ['Naranja'] 
    },
    { 
      id: 'stop_005', 
      name: 'Callao', 
      latitude: -12.0566, 
      longitude: -77.1181, 
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
      Alert.alert('Error', 'No se pudo obtener tu ubicación. Mostrando Lima por defecto.');
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
        </MapView>

        {/* Controles del mapa - Centro derecha */}
        <View style={styles.mapControls}>
          {/* Información de buses activos */}
          <View style={[styles.busCountBadge, { backgroundColor: colors.white }]}>
            <Text style={[styles.busCountText, { color: colors.gray700 }]}>
              {buses.filter(b => b.status === 'active').length} buses activos
            </Text>
          </View>
          
          {/* Botón de ubicación */}
          {location && (
            <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.white }]} onPress={centerOnUser}>
              <Text style={styles.controlButtonText}>📍</Text>
            </TouchableOpacity>
          )}
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

      {/* Buscador - Parte inferior SIEMPRE presente */}
      <View style={[styles.searchContainer, { backgroundColor: colors.white }]}>
        <View style={styles.searchInput}>
          <View style={[styles.searchIcon, { backgroundColor: colors.gray100 }]}>
            <Text>🔍</Text>
          </View>
          
          <TextInput
            style={[styles.textInput, { color: colors.gray700 }]}
            placeholder="Buscador"
            placeholderTextColor={colors.gray400}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Resultados de búsqueda - Solo cuando hay texto */}
        {searchText.length > 0 && (
          <View style={[styles.searchResults, { borderTopColor: colors.gray200 }]}>
            <ScrollView>
              {filteredStops.map((stop) => (
                <TouchableOpacity
                  key={stop.id}
                  style={[styles.searchResult, { borderBottomColor: colors.gray100 }]}
                  onPress={() => {
                    setSearchText(stop.name);
                    if (mapRef.current) {
                      mapRef.current.animateToRegion({
                        latitude: stop.latitude,
                        longitude: stop.longitude,
                        latitudeDelta: 0.01,
                        longitudeDelta: 0.01,
                      }, 1000);
                    }
                  }}
                >
                  <View style={[styles.searchResultIcon, { backgroundColor: colors.secondary + '20' }]}>
                    <Text>🚏</Text>
                  </View>
                  
                  <View style={styles.searchResultInfo}>
                    <Text style={[styles.searchResultTitle, { color: colors.gray800 }]}>{stop.name}</Text>
                    <Text style={[styles.searchResultSubtitle, { color: colors.gray500 }]}>
                      Rutas: {stop.routes.join(', ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              {filteredStops.length === 0 && (
                <View style={styles.noResults}>
                  <Text style={[styles.noResultsText, { color: colors.gray500 }]}>No se encontraron resultados</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
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
});