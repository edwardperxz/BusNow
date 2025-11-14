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
import * as Location from 'expo-location';
import { BusNowColors, CommonStyles, getBusStatusColor, getRouteColor } from '../styles/colors';

// Declarar tipos de Google Maps para TypeScript
declare global {
  interface Window {
    google: any;
    initMap: () => void;
  }
  namespace JSX {
    interface IntrinsicElements {
      div: any;
    }
  }
}

// Configuración de Google Maps
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

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

export default function MapScreen() {
  const mapRef = useRef<HTMLDivElement>(null);
  const googleMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [region, setRegion] = useState(DAVID_COORDS);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [buses, setBuses] = useState<Bus[]>([]);
  const [busStops, setBusStops] = useState<BusStop[]>([]);
  const [searchText, setSearchText] = useState('');
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

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
    loadGoogleMaps();

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

  // Cargar Google Maps API
  const loadGoogleMaps = () => {
    if (window.google) {
      initializeGoogleMap();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=geometry,places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      initializeGoogleMap();
    };
    script.onerror = () => {
      console.error('Error loading Google Maps');
      setIsMapLoaded(false);
    };
    document.head.appendChild(script);
  };

  // Inicializar el mapa de Google
  const initializeGoogleMap = () => {
    if (mapRef.current && window.google) {
      const map = new window.google.maps.Map(mapRef.current, {
        zoom: 13,
        center: { lat: DAVID_COORDS.latitude, lng: DAVID_COORDS.longitude },
        mapTypeControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
      });

      googleMapRef.current = map;
      setIsMapLoaded(true);

      // Agregar event listener para cambios de región
      map.addListener('bounds_changed', () => {
        const bounds = map.getBounds();
        if (bounds) {
          const center = map.getCenter();
          const newRegion = {
            latitude: center.lat(),
            longitude: center.lng(),
            latitudeDelta: 0.05,
            longitudeDelta: 0.05,
          };
          setRegion(newRegion);
        }
      });
    }
  };

  // Actualizar marcadores en el mapa
  useEffect(() => {
    if (isMapLoaded && googleMapRef.current) {
      updateMapMarkers();
    }
  }, [buses, busStops, isMapLoaded]);

  const updateMapMarkers = () => {
    // Limpiar marcadores existentes
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    if (!googleMapRef.current || !window.google) return;

    // Agregar marcadores de buses
    buses.forEach(bus => {
      const marker = new window.google.maps.Marker({
        position: { lat: bus.latitude, lng: bus.longitude },
        map: googleMapRef.current,
        title: `${bus.route} - ${bus.id}`,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Ccircle cx='20' cy='20' r='18' fill='${getRouteColor(parseInt(bus.route.split(' ')[1]?.slice(-1)) || 1)}' stroke='white' stroke-width='3'/%3E%3Ctext x='20' y='28' text-anchor='middle' fill='white' font-size='16'%3E🚌%3C/text%3E%3C/svg%3E`,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20),
        }
      });

      // Info window para buses
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 10px; min-width: 200px;">
            <h3 style="margin: 0 0 8px 0; color: #2c3e50;">${bus.route} • ${bus.id}</h3>
            <p style="margin: 4px 0; color: #7f8c8d;">${bus.direction}</p>
            <p style="margin: 4px 0; color: #27ae60; font-weight: bold;">Próxima: ${bus.nextStop}</p>
            <p style="margin: 4px 0; color: #3498db;">ETA: ${bus.estimatedArrival}</p>
            <p style="margin: 4px 0; font-size: 12px; color: #95a5a6;">Estado: ${getStatusText(bus.status)}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        // Cerrar otras info windows
        markersRef.current.forEach(m => m.infoWindow?.close());
        infoWindow.open(googleMapRef.current, marker);
        setSelectedBus(bus);
      });

      marker.infoWindow = infoWindow;
      markersRef.current.push(marker);
    });

    // Agregar marcadores de paradas
    busStops.forEach(stop => {
      const marker = new window.google.maps.Marker({
        position: { lat: stop.latitude, lng: stop.longitude },
        map: googleMapRef.current,
        title: stop.name,
        icon: {
          url: `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'%3E%3Ccircle cx='15' cy='15' r='13' fill='${BusNowColors.secondary}' stroke='white' stroke-width='2'/%3E%3Ctext x='15' y='20' text-anchor='middle' fill='white' font-size='12'%3E🚏%3C/text%3E%3C/svg%3E`,
          scaledSize: new window.google.maps.Size(30, 30),
          anchor: new window.google.maps.Point(15, 15),
        }
      });

      // Info window para paradas
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px;">
            <h4 style="margin: 0 0 6px 0; color: #2c3e50;">${stop.name}</h4>
            <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Rutas: ${stop.routes.join(', ')}</p>
          </div>
        `
      });

      marker.addListener('click', () => {
        infoWindow.open(googleMapRef.current, marker);
      });

      markersRef.current.push(marker);
    });
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo';
      case 'inactive': return 'Inactivo';
      case 'maintenance': return 'Mantenimiento';
      case 'delayed': return 'Retrasado';
      default: return status;
    }
  };

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
    if (location && googleMapRef.current) {
      const userPosition = {
        lat: location.coords.latitude,
        lng: location.coords.longitude,
      };
      
      googleMapRef.current.panTo(userPosition);
      googleMapRef.current.setZoom(16);

      // Agregar marcador del usuario si no existe
      if (!markersRef.current.find(m => m.isUserMarker)) {
        const userMarker = new window.google.maps.Marker({
          position: userPosition,
          map: googleMapRef.current,
          title: 'Tu ubicación',
          icon: {
            url: `data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'%3E%3Ccircle cx='10' cy='10' r='8' fill='%234285f4' stroke='white' stroke-width='2'/%3E%3Ccircle cx='10' cy='10' r='3' fill='white'/%3E%3C/svg%3E`,
            scaledSize: new window.google.maps.Size(20, 20),
            anchor: new window.google.maps.Point(10, 10),
          }
        });
        userMarker.isUserMarker = true;
        markersRef.current.push(userMarker);
      }
    }
  };

  const filteredStops = busStops.filter(stop =>
    stop.name.toLowerCase().includes(searchText.toLowerCase()) ||
    stop.routes.some(route => route.toLowerCase().includes(searchText.toLowerCase()))
  );

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

      {/* Contenedor del mapa - Google Maps para Web */}
      <View style={styles.mapContainer}>
        {!isMapLoaded && (
          <View style={[styles.map, styles.webMapFallback]}>
            <Text style={styles.webMapText}>
              🗺️ Cargando mapa interactivo...{'\n'}
              Google Maps • David, Chiriquí, Panamá{'\n\n'}
              • {buses.length} buses en tiempo real{'\n'}
              • {busStops.length} paradas de autobús{'\n'}
              • Navegación completa{'\n'}
              • Marcadores interactivos
            </Text>
          </View>
        )}
        <div 
          ref={mapRef}
          style={{ 
            width: '100%', 
            height: '100%',
            borderRadius: 8,
            display: isMapLoaded ? 'block' : 'none'
          }}
        />

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
                    if (googleMapRef.current) {
                      const stopPosition = { lat: stop.latitude, lng: stop.longitude };
                      googleMapRef.current.panTo(stopPosition);
                      googleMapRef.current.setZoom(17);
                      
                      // Encontrar y abrir el info window de esta parada
                      const stopMarker = markersRef.current.find(marker => 
                        marker.getTitle() === stop.name
                      );
                      if (stopMarker && stopMarker.infoWindow) {
                        stopMarker.infoWindow.open(googleMapRef.current, stopMarker);
                      }
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
  webMapFallback: {
    backgroundColor: '#f0f9ff',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    margin: 16,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  webMapText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    margin: 20,
    lineHeight: 24,
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