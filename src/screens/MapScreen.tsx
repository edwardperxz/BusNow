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
import MapView, { Marker, Region, Callout } from 'react-native-maps';
import * as Location from 'expo-location';

import { BusNowColors, CommonStyles, getBusStatusColor, getRouteColor } from '../styles/colors';

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

export default function MapScreen() {
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
        <View style={[styles.busMarker, { backgroundColor: getRouteColor(routeNumber) }]}>
          <Text style={styles.busMarkerText}>🚌</Text>
          <View style={[styles.statusIndicator, { backgroundColor: getBusStatusColor(bus.status) }]} />
        </View>
        
        <Callout tooltip>
          <View style={styles.calloutContainer}>
            <Text style={styles.calloutTitle}>{bus.route}</Text>
            <Text style={styles.calloutText}>{bus.direction}</Text>
            <Text style={styles.calloutText}>Próxima: {bus.nextStop}</Text>
            <Text style={styles.calloutText}>ETA: {bus.estimatedArrival}</Text>
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
        <View style={styles.stopMarker}>
          <Text style={styles.stopMarkerText}>🚏</Text>
        </View>
        
        <Callout tooltip>
          <View style={styles.calloutContainer}>
            <Text style={styles.calloutTitle}>{stop.name}</Text>
            <Text style={styles.calloutText}>Rutas: {stop.routes.join(', ')}</Text>
          </View>
        </Callout>
      </Marker>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header del mapa */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>🗺️ Mapa en Tiempo Real</Text>
          <Text style={styles.headerSubtitle}>
            {buses.filter(b => b.status === 'active').length} buses activos
          </Text>
        </View>
        
        {location && (
          <TouchableOpacity style={styles.locationButton} onPress={centerOnUser}>
            <Text style={styles.locationButtonText}>📍 Mi ubicación</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Mapa */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          loadingEnabled={isLoading}
          mapType="standard"
        >
          {/* Marcadores de buses */}
          {buses.map(renderBusMarker)}
          
          {/* Marcadores de paradas */}
          {busStops.map(renderBusStopMarker)}
        </MapView>

        {/* Controles del mapa */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton} onPress={centerOnUser}>
            <Text style={styles.controlButtonText}>📍</Text>
          </TouchableOpacity>
        </View>

        {/* Leyenda */}
        <View style={styles.legend}>
          <Text style={styles.legendTitle}>Leyenda</Text>
          <Text style={styles.legendItem}>🚌 Buses  🚏 Paradas</Text>
        </View>
      </View>

      {/* Información del bus seleccionado */}
      {selectedBus && (
        <View style={styles.busInfo}>
          <View style={styles.busInfoHeader}>
            <View style={styles.busInfoIcon}>
              <Text style={styles.busInfoIconText}>🚌</Text>
            </View>
            
            <View style={styles.busInfoDetails}>
              <Text style={styles.busInfoTitle}>
                {selectedBus.route} • {selectedBus.id}
              </Text>
              <Text style={styles.busInfoDirection}>
                {selectedBus.direction}
              </Text>
            </View>
            
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setSelectedBus(null)}
            >
              <Text style={styles.closeButtonText}>×</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.busInfoNextStop}>
            Próxima parada: {selectedBus.nextStop} • {selectedBus.estimatedArrival}
          </Text>
        </View>
      )}

      {/* Buscador */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInput}>
          <View style={styles.searchIcon}>
            <Text>🔍</Text>
          </View>
          
          <TextInput
            style={styles.textInput}
            placeholder="¿A dónde vas?"
            placeholderTextColor={BusNowColors.gray400}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Resultados de búsqueda */}
        {searchText.length > 0 && (
          <View style={styles.searchResults}>
            <ScrollView>
              {filteredStops.map((stop) => (
                <TouchableOpacity
                  key={stop.id}
                  style={styles.searchResult}
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
                  <View style={styles.searchResultIcon}>
                    <Text>🚏</Text>
                  </View>
                  
                  <View style={styles.searchResultInfo}>
                    <Text style={styles.searchResultTitle}>{stop.name}</Text>
                    <Text style={styles.searchResultSubtitle}>
                      Rutas: {stop.routes.join(', ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
              
              {filteredStops.length === 0 && (
                <View style={styles.noResults}>
                  <Text style={styles.noResultsText}>No se encontraron resultados</Text>
                </View>
              )}
            </ScrollView>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CommonStyles.background.primary,
  },
  header: {
    backgroundColor: BusNowColors.primary,
    padding: CommonStyles.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingTop: Platform.OS === 'ios' ? 50 : CommonStyles.spacing.md,
  },
  headerTitle: {
    ...CommonStyles.typography.bodyMedium,
    color: BusNowColors.white,
    marginBottom: 2,
  },
  headerSubtitle: {
    ...CommonStyles.typography.small,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  locationButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: CommonStyles.spacing.sm,
    paddingVertical: CommonStyles.spacing.xs,
    borderRadius: CommonStyles.borderRadius.small,
  },
  locationButtonText: {
    ...CommonStyles.typography.small,
    color: BusNowColors.white,
  },
  mapContainer: {
    flex: 1,
    marginTop: Platform.OS === 'ios' ? 120 : 100,
    marginBottom: 120,
  },
  map: {
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    right: CommonStyles.spacing.md,
    top: CommonStyles.spacing.md,
  },
  controlButton: {
    backgroundColor: BusNowColors.white,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    ...CommonStyles.cardShadow,
    marginBottom: CommonStyles.spacing.sm,
  },
  controlButtonText: {
    fontSize: 18,
  },
  legend: {
    position: 'absolute',
    top: CommonStyles.spacing.md,
    left: CommonStyles.spacing.md,
    backgroundColor: BusNowColors.white,
    borderRadius: CommonStyles.borderRadius.small,
    padding: CommonStyles.spacing.sm,
    ...CommonStyles.softShadow,
  },
  legendTitle: {
    ...CommonStyles.typography.small,
    color: BusNowColors.gray700,
    marginBottom: 4,
  },
  legendItem: {
    ...CommonStyles.typography.small,
    color: BusNowColors.gray500,
  },
  busMarker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: BusNowColors.white,
  },
  busMarkerText: {
    fontSize: 16,
    color: BusNowColors.white,
  },
  statusIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: BusNowColors.white,
  },
  stopMarker: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: BusNowColors.white,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BusNowColors.secondary,
  },
  stopMarkerText: {
    fontSize: 12,
  },
  calloutContainer: {
    backgroundColor: BusNowColors.white,
    padding: CommonStyles.spacing.sm,
    borderRadius: CommonStyles.borderRadius.small,
    minWidth: 150,
    ...CommonStyles.cardShadow,
  },
  calloutTitle: {
    ...CommonStyles.typography.bodyMedium,
    color: BusNowColors.gray800,
    marginBottom: 4,
  },
  calloutText: {
    ...CommonStyles.typography.small,
    color: BusNowColors.gray600,
  },
  busInfo: {
    backgroundColor: BusNowColors.white,
    position: 'absolute',
    bottom: 120,
    left: CommonStyles.spacing.md,
    right: CommonStyles.spacing.md,
    borderRadius: CommonStyles.borderRadius.medium,
    padding: CommonStyles.spacing.md,
    ...CommonStyles.cardShadow,
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
    backgroundColor: BusNowColors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: CommonStyles.spacing.sm,
  },
  busInfoIconText: {
    fontSize: 12,
    color: BusNowColors.white,
  },
  busInfoDetails: {
    flex: 1,
  },
  busInfoTitle: {
    ...CommonStyles.typography.bodyMedium,
    color: BusNowColors.gray800,
  },
  busInfoDirection: {
    ...CommonStyles.typography.small,
    color: BusNowColors.gray500,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: BusNowColors.gray200,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: BusNowColors.gray600,
  },
  busInfoNextStop: {
    ...CommonStyles.typography.caption,
    color: BusNowColors.primary,
  },
  searchContainer: {
    position: 'absolute',
    bottom: CommonStyles.spacing.md,
    left: CommonStyles.spacing.md,
    right: CommonStyles.spacing.md,
    backgroundColor: BusNowColors.white,
    borderRadius: CommonStyles.borderRadius.medium,
    ...CommonStyles.cardShadow,
  },
  searchInput: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: CommonStyles.spacing.md,
  },
  searchIcon: {
    backgroundColor: BusNowColors.gray100,
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
    color: BusNowColors.gray700,
  },
  searchResults: {
    borderTopWidth: 1,
    borderTopColor: BusNowColors.gray200,
    maxHeight: 200,
  },
  searchResult: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: CommonStyles.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: BusNowColors.gray100,
  },
  searchResultIcon: {
    backgroundColor: BusNowColors.secondary + '20',
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
    color: BusNowColors.gray800,
  },
  searchResultSubtitle: {
    ...CommonStyles.typography.small,
    color: BusNowColors.gray500,
  },
  noResults: {
    padding: CommonStyles.spacing.lg,
    alignItems: 'center',
  },
  noResultsText: {
    ...CommonStyles.typography.caption,
    color: BusNowColors.gray500,
  },
});