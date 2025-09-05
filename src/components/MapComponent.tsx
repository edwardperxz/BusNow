import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Alert, Dimensions } from 'react-native';
import MapView, { 
  Marker, 
  Polyline, 
  Region, 
  PROVIDER_GOOGLE,
  MarkerAnimated 
} from 'react-native-maps';
import { useDispatch } from 'react-redux';
import { RootState, useAppSelector } from '../store';
import { updateBusLocation } from '../store/trackingSlice';
import { locationService } from '../services/locationService';
import { useUserLocation } from '../presentation/hooks/useAuth';
import { Bus, BusRoute, Coordinates } from '../types';
import BusMarker from './BusMarker';
import RouteSelector from './RouteSelector';

const { width, height } = Dimensions.get('window');

interface MapComponentProps {
  selectedRouteId?: string;
  onRegionChange?: (region: Region) => void;
}

const MapComponent: React.FC<MapComponentProps> = ({ 
  selectedRouteId, 
  onRegionChange 
}) => {
  const dispatch = useDispatch();
  const mapRef = useRef<MapView>(null);
  
  // Hook para obtener ubicación del usuario
  const { location: userLocation } = useUserLocation();
  
  const { buses, routes, selectedRoute } = useAppSelector(
    (state: RootState) => {
      const trackingState = (state.tracking as any) || {};
      return {
        buses: trackingState.buses || [],
        routes: trackingState.routes || [],
        selectedRoute: trackingState.selectedRoute || null
      };
    }
  );
  
  const mapSettings = useAppSelector((state: RootState) => {
    const settings = (state.settings as any);
    return settings?.map || {
      followUserLocation: true,
      showTraffic: false,
      mapType: 'standard'
    };
  });

  const [region, setRegion] = useState<Region>({
    latitude: 18.4861, // Coordenadas por defecto (puedes cambiar por tu ciudad)
    longitude: -97.3973,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const [showUserLocation, setShowUserLocation] = useState(true);

  useEffect(() => {
    initializeUserLocation();
  }, []);

  useEffect(() => {
    if (selectedRouteId && routes.length > 0) {
      focusOnRoute(selectedRouteId);
    }
  }, [selectedRouteId, routes]);

  const initializeUserLocation = async () => {
    try {
      const location = await locationService.getCurrentLocation();
      if (location) {
        const userLocation = {
          ...location,
          coordinates: location,
          timestamp: new Date()
        };
        // El hook useUserLocation ya maneja la ubicación
        
        if (mapSettings.followUserLocation) {
          setRegion({
            ...location,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          });
        }
      }
    } catch (error) {
      console.error('Error getting user location:', error);
      Alert.alert(
        'Ubicación no disponible',
        'No se pudo obtener tu ubicación actual. Verifica los permisos.'
      );
    }
  };

  const focusOnRoute = (routeId: string) => {
    const route = routes.find((r: BusRoute) => r.id === routeId);
    if (route && route.coordinates.length > 0) {
      // Calcular el centro y zoom para la ruta
      const latitudes = route.coordinates.map((coord: Coordinates) => coord.latitude);
      const longitudes = route.coordinates.map((coord: Coordinates) => coord.longitude);
      
      const minLat = Math.min(...latitudes);
      const maxLat = Math.max(...latitudes);
      const minLng = Math.min(...longitudes);
      const maxLng = Math.max(...longitudes);
      
      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const deltaLat = (maxLat - minLat) * 1.2; // 20% padding
      const deltaLng = (maxLng - minLng) * 1.2;
      
      const newRegion = {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: Math.max(deltaLat, 0.01),
        longitudeDelta: Math.max(deltaLng, 0.01),
      };
      
      setRegion(newRegion);
      mapRef.current?.animateToRegion(newRegion, 1000);
    }
  };

  const handleRegionChange = (newRegion: Region) => {
    setRegion(newRegion);
    onRegionChange?.(newRegion);
  };

  const getFilteredBuses = (): Bus[] => {
    if (!selectedRouteId) return buses;
    return buses.filter((bus: Bus) => bus.routeId === selectedRouteId);
  };

  const getSelectedRoute = (): BusRoute | undefined => {
    return selectedRouteId ? routes.find((r: BusRoute) => r.id === selectedRouteId) : undefined;
  };

  const handleMarkerPress = (bus: Bus) => {
    Alert.alert(
      `Bus ${bus.plateNumber}`,
      `Línea: ${getRouteName(bus.routeId)}\n` +
      `Conductor: ${bus.driverName}\n` +
      `Velocidad: ${bus.speed.toFixed(1)} km/h\n` +
      `Ocupación: ${bus.capacity.occupied}/${bus.capacity.total} pasajeros\n` +
      `Estado: ${getStatusText(bus.status)}`,
      [{ text: 'OK' }]
    );
  };

  const getRouteName = (routeId: string): string => {
    const route = routes.find((r: BusRoute) => r.id === routeId);
    return route ? route.name : 'Desconocida';
  };

  const getStatusText = (status: Bus['status']): string => {
    switch (status) {
      case 'online': return 'Activo';
      case 'offline': return 'Inactivo';
      case 'maintenance': return 'Mantenimiento';
      case 'delayed': return 'Retrasado';
      default: return 'Desconocido';
    }
  };

  const renderBusMarkers = () => {
    return getFilteredBuses().map((bus) => (
      <BusMarker
        key={bus.id}
        bus={bus}
        route={routes.find((r: BusRoute) => r.id === bus.routeId)}
        onPress={() => handleMarkerPress(bus)}
      />
    ));
  };

  const renderRoutePolyline = () => {
    const route = getSelectedRoute();
    if (!route) return null;

    return (
      <Polyline
        coordinates={route.coordinates}
        strokeColor={route.color}
        strokeWidth={4}
      />
    );
  };

  const renderStopMarkers = () => {
    const route = getSelectedRoute();
    if (!route) return null;

    return route.stops.map((stop) => (
      <Marker
        key={stop.id}
        coordinate={stop.coordinates}
        title={stop.name}
        description={stop.description}
      >
        <View style={[styles.stopMarker, { borderColor: route.color }]}>
          <View style={[styles.stopMarkerInner, { backgroundColor: route.color }]} />
        </View>
      </Marker>
    ));
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={region}
        onRegionChangeComplete={handleRegionChange}
        showsUserLocation={showUserLocation && mapSettings.followUserLocation}
        showsMyLocationButton={true}
        showsTraffic={mapSettings.showTraffic}
        mapType={mapSettings.mapType}
        loadingEnabled={true}
        loadingIndicatorColor="#2196F3"
        loadingBackgroundColor="#ffffff"
      >
        {/* Línea de ruta */}
        {renderRoutePolyline()}
        
        {/* Paradas de la ruta */}
        {renderStopMarkers()}
        
        {/* Buses */}
        {renderBusMarkers()}
        
        {/* Marcador de ubicación del usuario (personalizado) */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Tu ubicación"
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.userLocationMarker}>
              <View style={styles.userLocationDot} />
            </View>
          </Marker>
        )}
      </MapView>
      
      {/* Selector de rutas */}
      <RouteSelector 
        routes={routes}
        selectedRouteId={selectedRouteId}
        onRouteSelect={focusOnRoute}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: width,
    height: height,
  },
  stopMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopMarkerInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  userLocationMarker: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(33, 150, 243, 0.3)',
    borderWidth: 2,
    borderColor: '#2196F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userLocationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#2196F3',
  },
});

export default MapComponent;
