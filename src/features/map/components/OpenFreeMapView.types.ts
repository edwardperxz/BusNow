import { BusLocation } from '../../../services/firebaseBusTracking';
import { MapCoordinate, RoutePoint, SelectedPlace } from '../types';

export interface OpenFreeMapViewProps {
  initialCenter: MapCoordinate;
  location: { latitude: number; longitude: number } | null;
  routeCoordinates: MapCoordinate[];
  etaCoordinates: MapCoordinate[];
  buses: BusLocation[];
  selectedBusId: string | null;
  selectedPlace: SelectedPlace | null;
  routeOrigin: RoutePoint | null;
  routeDestination: RoutePoint | null;
  onSelectBus: (busId: string) => void;
  onRegionChange?: (region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) => void;
  onMapClick?: (coordinate: { latitude: number; longitude: number }) => void;
}

export interface OpenFreeMapHandle {
  centerOnUser: () => void;
}
