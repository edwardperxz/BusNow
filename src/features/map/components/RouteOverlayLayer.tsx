import React from 'react';
import { decodePolyline } from '../../../utils/polyline';
import { BusLocation } from '../../../services/firebaseBusTracking';
import { MapCoordinate, RoutePoint } from '../types';

interface RouteOverlayLayerProps {
  Polyline: any;
  Marker: any;
  routeCoordinates: MapCoordinate[];
  etaPolyline?: string;
  selectedBusId: string | null;
  stopLocation: MapCoordinate | null;
  buses: BusLocation[];
  routeOrigin: RoutePoint | null;
  routeDestination: RoutePoint | null;
}

export default function RouteOverlayLayer({
  Polyline,
  Marker,
  routeCoordinates,
  etaPolyline,
  selectedBusId,
  stopLocation,
  buses,
  routeOrigin,
  routeDestination,
}: RouteOverlayLayerProps) {
  if (routeCoordinates.length === 0) {
    return null;
  }

  return (
    <>
      <Polyline
        coordinates={routeCoordinates}
        strokeColor="#FF0000"
        strokeWidth={4}
        lineCap="round"
        lineJoin="round"
      />

      {etaPolyline && (
        <Polyline
          coordinates={decodePolyline(etaPolyline)}
          strokeColor="#2F80ED"
          strokeWidth={4}
          lineDashPattern={[6, 6]}
        />
      )}

      {!etaPolyline && selectedBusId && stopLocation && (() => {
        const bus = buses.find((b) => b.busId === selectedBusId);
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
  );
}
