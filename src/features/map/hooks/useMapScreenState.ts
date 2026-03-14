import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

import busTrackingService, { BusLocation } from '../../../services/firebaseBusTracking';
import { decodePolyline } from '../../../utils/polyline';
import { getRouteDetail, getRoutes } from '../../../services/routesApi';
import {
  MapCoordinate,
  MapRegion,
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

  useEffect(() => {
    initializeLocation();
    fetchInitialRoute();
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
            routeId: 'demo-route',
            driverUid: 'demo-driver',
            latitude: DEMO_PATH[0].latitude,
            longitude: DEMO_PATH[0].longitude,
            heading: 90,
            speed: DEMO_SPEED_KMH,
            status: 'active',
            isActive: true,
            busLabel: DEMO_BUS_ID,
            updatedAt: Date.now(),
          },
        ]);
      }
    );

    return () => {
      unsubscribe && unsubscribe();
    };
  }, [selectedBusId]);

  useEffect(() => {
    const selectedBus = buses.find((bus) => bus.busId === selectedBusId);
    if (selectedBus?.routeId) {
      void fetchRouteById(selectedBus.routeId);
    }
  }, [buses, selectedBusId]);

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

  const applyRouteData = (route: Awaited<ReturnType<typeof getRouteDetail>>) => {
    if (!route) {
      applyFallbackRoute();
      return;
    }

    const coordinates = route.geometryPolyline
      ? decodePolyline(route.geometryPolyline)
      : route.anchorPoints?.map((point) => point.coordinates) ?? route.stops.map((stop) => stop.coordinates);

    setRouteCoordinates(coordinates);

    const originPoint = route.anchorPoints?.find((point) => point.kind === 'start');
    const destinationPoint = route.anchorPoints?.find((point) => point.kind === 'end');

    setRouteOrigin(
      originPoint
        ? {
            latitude: originPoint.coordinates.latitude,
            longitude: originPoint.coordinates.longitude,
            address: originPoint.label,
          }
        : route.stops[0]
          ? {
              latitude: route.stops[0].coordinates.latitude,
              longitude: route.stops[0].coordinates.longitude,
              address: route.stops[0].name,
            }
          : null
    );
    setRouteDestination(
      destinationPoint
        ? {
            latitude: destinationPoint.coordinates.latitude,
            longitude: destinationPoint.coordinates.longitude,
            address: destinationPoint.label,
          }
        : route.stops[route.stops.length - 1]
          ? {
              latitude: route.stops[route.stops.length - 1].coordinates.latitude,
              longitude: route.stops[route.stops.length - 1].coordinates.longitude,
              address: route.stops[route.stops.length - 1].name,
            }
          : null
    );
  };

  const fetchRouteById = async (routeId: string) => {
    try {
      const route = await getRouteDetail(routeId);
      applyRouteData(route);
    } catch (error) {
      console.warn('[Map] Error obteniendo ruta desde backend. Usando fallback local.', error);
      applyFallbackRoute();
    }
  };

  const fetchInitialRoute = async () => {
    try {
      const routes = await getRoutes();
      const firstRoute = routes[0];
      if (!firstRoute?.id) {
        applyFallbackRoute();
        return;
      }

      await fetchRouteById(firstRoute.id);
    } catch (error) {
      console.warn('[Map] Error cargando rutas iniciales. Usando fallback local.', error);
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
