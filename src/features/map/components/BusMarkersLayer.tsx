import React from 'react';
import { BusLocation } from '../../../services/firebaseBusTracking';
import { SelectedPlace } from '../types';

interface BusMarkersLayerProps {
  Marker: any;
  buses: BusLocation[];
  selectedBusId: string | null;
  onSelectBus: (busId: string) => void;
  selectedPlace: SelectedPlace | null;
}

export default function BusMarkersLayer({
  Marker,
  buses,
  selectedBusId,
  onSelectBus,
  selectedPlace,
}: BusMarkersLayerProps) {
  return (
    <>
      {buses.map((bus) => (
        <Marker
          key={bus.busId}
          coordinate={{ latitude: bus.latitude, longitude: bus.longitude }}
          title={`Bus ${bus.busId}`}
          description={bus.updatedAt ? `Actualizado: ${new Date(bus.updatedAt).toLocaleTimeString()}` : undefined}
          pinColor={selectedBusId === bus.busId ? '#0066FF' : '#2F80ED'}
          onPress={() => onSelectBus(bus.busId)}
        />
      ))}

      {selectedPlace && (
        <Marker
          coordinate={{
            latitude: selectedPlace.latitude,
            longitude: selectedPlace.longitude,
          }}
          title={selectedPlace.structured_formatting.main_text}
          description={selectedPlace.structured_formatting.secondary_text}
        />
      )}
    </>
  );
}
