import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';
import { httpsCallable } from 'firebase/functions';

import busTrackingService, { BusLocation } from '../../../services/firebaseBusTracking';
import { decodePolyline } from '../../../utils/polyline';
import { fn } from '../../../services/firebaseApp';
import {
  MapCoordinate,
  MapRegion,
  RouteDirectionsResponse,
  RoutePoint,
  SelectedPlace,
} from '../types';
import { DEFAULT_MAP_COORDINATES } from '../constants';
import { DEMO_BUS_ID, DEMO_PATH, DEMO_SPEED_KMH } from '../../../demo/demoConfig';

const FALLBACK_ROUTE_ORIGIN: RoutePoint = {
  latitude: DEMO_PATH[0].latitude,
  longitude: DEMO_PATH[0].longitude,
  address: 'Parque Cervantes, David, Chiriquí, Panamá',
};

const FALLBACK_ROUTE_DESTINATION: RoutePoint = {
  latitude: DEMO_PATH[DEMO_PATH.length - 1].latitude,
  longitude: DEMO_PATH[DEMO_PATH.length - 1].longitude,
  address: 'Romero Doleguita, David, Chiriquí, Panamá',
};

export function useMapScreenState() {
  const [region, setRegion] = useState<MapRegion>(DEFAULT_MAP_COORDINATES);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPlace, setSelectedPlace] = useState<SelectedPlace | null>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<MapCoordinate[]>([]);
  const [routeOrigin, setRouteOrigin] = useState<RoutePoint | null>(null);
  const [routeDestination, setRouteDestination] = useState<RoutePoint | null>(null);
  const [buses, setBuses] = useState<BusLocation[]>([]);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);

  const getRouteDirectionsFn = httpsCallable(fn, 'getRouteDirections');

  useEffect(() => {
    initializeLocation();
    fetchRoute();
  }, []);

  useEffect(() => {
    const unsubscribe = busTrackingService.onActiveBuses(
      (list) => {
        setBuses(list);
        if (selectedBusId && !list.find((b) => b.busId === selectedBusId)) {
          setSelectedBusId(null);
        }
      },
      (error) => {
        console.warn('[Map] No se pudieron leer buses desde Firestore. Usando fallback local.', error);
        setBuses([
          {
            busId: DEMO_BUS_ID,
            latitude: DEMO_PATH[0].latitude,
            longitude: DEMO_PATH[0].longitude,
            heading: 90,
            speed: DEMO_SPEED_KMH,
            updatedAt: Date.now(),
          },
        ]);
      }
    );

    return () => {
      unsubscribe && unsubscribe();
    };
  }, [selectedBusId]);

  const applyFallbackRoute = () => {
    setRouteCoordinates(DEMO_PATH);
    setRouteOrigin(FALLBACK_ROUTE_ORIGIN);
    setRouteDestination(FALLBACK_ROUTE_DESTINATION);
  };

  const initializeLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permisos requeridos', 'Necesitamos acceso a tu ubicación', [
          { text: 'OK', style: 'cancel' },
        ]);
        setIsLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({});
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

  const fetchRoute = async () => {
    try {
      const response = await getRouteDirectionsFn({
        origin: 'Parque Cervantes, David, Chiriquí, Panamá',
        destination: 'Romero Doleguita, David, Chiriquí, Panamá',
      });

      const data = response.data as RouteDirectionsResponse;
      if (data?.ok && data.route?.polyline) {
        const decodedCoords = decodePolyline(data.route.polyline);
        setRouteCoordinates(decodedCoords);
        setRouteOrigin(data.route.origin);
        setRouteDestination(data.route.destination);
        return;
      }

      applyFallbackRoute();
    } catch (error) {
      console.warn('[Map] Error obteniendo ruta desde backend. Usando fallback local.', error);
      applyFallbackRoute();
    }
  };

  const stopLocation: MapCoordinate | null = routeDestination
    ? { latitude: routeDestination.latitude, longitude: routeDestination.longitude }
    : null;

  return {
    region,
    setRegion,
    location,
    isLoading,
    selectedPlace,
    setSelectedPlace,
    routeCoordinates,
    routeOrigin,
    routeDestination,
    buses,
    selectedBusId,
    setSelectedBusId,
    stopLocation,
    defaultCoordinates: DEFAULT_MAP_COORDINATES,
  };
}
