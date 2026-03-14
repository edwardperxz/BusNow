import React, { useMemo } from 'react';
import OpenFreeMapView from './OpenFreeMapView';
import { RouteStop } from '../../routes/types';
import { DEFAULT_MAP_COORDINATES } from '../constants';
import { MapCoordinate, RoutePoint } from '../types';

interface RouteStopsMapViewProps {
  stops: RouteStop[];
  routeCoordinates?: MapCoordinate[];
  originLabel?: string;
  destinationLabel?: string;
}

export default function RouteStopsMapView({ stops, routeCoordinates: routeCoordinatesProp, originLabel, destinationLabel }: RouteStopsMapViewProps) {
  const validStops = useMemo(
    () =>
      stops.filter(
        (s) =>
          Number.isFinite(s.coordinates?.latitude) &&
          Number.isFinite(s.coordinates?.longitude)
      ),
    [stops]
  );

  const initialCenter = useMemo<MapCoordinate>(() => {
    if (validStops.length === 0) {
      return { latitude: DEFAULT_MAP_COORDINATES.latitude, longitude: DEFAULT_MAP_COORDINATES.longitude };
    }
    const lat = validStops.reduce((sum, s) => sum + s.coordinates.latitude, 0) / validStops.length;
    const lng = validStops.reduce((sum, s) => sum + s.coordinates.longitude, 0) / validStops.length;
    return { latitude: lat, longitude: lng };
  }, [validStops]);

  const routeCoordinates = useMemo<MapCoordinate[]>(
    () => routeCoordinatesProp && routeCoordinatesProp.length > 0
      ? routeCoordinatesProp
      : validStops.map((s) => ({ latitude: s.coordinates.latitude, longitude: s.coordinates.longitude })),
    [routeCoordinatesProp, validStops]
  );

  const routeOrigin = useMemo<RoutePoint | null>(() => {
    if (routeCoordinatesProp && routeCoordinatesProp.length > 0) {
      return {
        latitude: routeCoordinatesProp[0].latitude,
        longitude: routeCoordinatesProp[0].longitude,
        address: originLabel || validStops[0]?.name || 'Origen',
      };
    }

    if (validStops.length === 0) return null;
    const first = validStops[0];
    return { latitude: first.coordinates.latitude, longitude: first.coordinates.longitude, address: originLabel || first.name };
  }, [originLabel, routeCoordinatesProp, validStops]);

  const routeDestination = useMemo<RoutePoint | null>(() => {
    if (routeCoordinatesProp && routeCoordinatesProp.length > 1) {
      const lastCoordinate = routeCoordinatesProp[routeCoordinatesProp.length - 1];
      return {
        latitude: lastCoordinate.latitude,
        longitude: lastCoordinate.longitude,
        address: destinationLabel || validStops[validStops.length - 1]?.name || 'Destino',
      };
    }

    if (validStops.length < 2) return null;
    const last = validStops[validStops.length - 1];
    return { latitude: last.coordinates.latitude, longitude: last.coordinates.longitude, address: destinationLabel || last.name };
  }, [destinationLabel, routeCoordinatesProp, validStops]);

  return (
    <OpenFreeMapView
      initialCenter={initialCenter}
      location={null}
      routeCoordinates={routeCoordinates}
      etaCoordinates={[]}
      buses={[]}
      selectedBusId={null}
      selectedPlace={null}
      routeOrigin={routeOrigin}
      routeDestination={routeDestination}
      onSelectBus={() => {}}
    />
  );
}
