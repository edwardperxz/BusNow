import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import maplibregl from 'maplibre-gl';

import { OpenFreeMapHandle, OpenFreeMapViewProps } from './OpenFreeMapView.types';

const OPENFREEMAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/bright';

function ensureMapLibreCss() {
  if (typeof document === 'undefined') {
    return;
  }

  const id = 'maplibre-css';
  if (document.getElementById(id)) {
    return;
  }

  const link = document.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = 'https://unpkg.com/maplibre-gl/dist/maplibre-gl.css';
  document.head.appendChild(link);
}

function toFeatureCollection(points: Array<{ latitude: number; longitude: number }>) {
  return {
    type: 'FeatureCollection' as const,
    features: points.length
      ? [
          {
            type: 'Feature' as const,
            geometry: {
              type: 'LineString' as const,
              coordinates: points.map((point) => [point.longitude, point.latitude]),
            },
            properties: {},
          },
        ]
      : [],
  };
}

function ensureGeoJsonSource(map: maplibregl.Map, id: string, data: GeoJSON.FeatureCollection) {
  const source = map.getSource(id) as maplibregl.GeoJSONSource | undefined;
  if (source) {
    source.setData(data);
    return;
  }
  map.addSource(id, { type: 'geojson', data });
}

const OpenFreeMapView = forwardRef<OpenFreeMapHandle, OpenFreeMapViewProps>(
  (
    {
      initialCenter,
      location,
      routeCoordinates,
      etaCoordinates,
      buses,
      selectedBusId,
      selectedPlace,
      routeOrigin,
      routeDestination,
      onSelectBus,
      onRegionChange,
      onMapClick,
    },
    ref
  ) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mapRef = useRef<maplibregl.Map | null>(null);
    const markersRef = useRef<Record<string, maplibregl.Marker | null>>({
      user: null,
      selectedPlace: null,
      origin: null,
      destination: null,
    });

    useImperativeHandle(ref, () => ({
      centerOnUser: () => {
        if (!mapRef.current || !location) return;
        mapRef.current.easeTo({
          center: [location.longitude, location.latitude],
          zoom: 15,
          duration: 600,
        });
      },
    }));

    useEffect(() => {
      ensureMapLibreCss();
      if (!containerRef.current || mapRef.current) {
        return;
      }

      const map = new maplibregl.Map({
        container: containerRef.current,
        style: OPENFREEMAP_STYLE_URL,
        center: [initialCenter.longitude, initialCenter.latitude],
        zoom: 12,
      });

      mapRef.current = map;

      map.on('moveend', () => {
        if (!onRegionChange) return;
        const center = map.getCenter();
        const bounds = map.getBounds();
        onRegionChange({
          latitude: center.lat,
          longitude: center.lng,
          latitudeDelta: Math.abs(bounds.getNorth() - bounds.getSouth()),
          longitudeDelta: Math.abs(bounds.getEast() - bounds.getWest()),
        });
      });

      map.on('click', (event) => {
        onMapClick?.({ latitude: event.lngLat.lat, longitude: event.lngLat.lng });
      });

      return () => {
        map.remove();
        mapRef.current = null;
      };
    }, [initialCenter.latitude, initialCenter.longitude, onMapClick, onRegionChange]);

    const mapData = useMemo(
      () => ({
        routeData: toFeatureCollection(routeCoordinates),
        etaData: toFeatureCollection(etaCoordinates),
        busesData: {
          type: 'FeatureCollection' as const,
          features: buses.map((bus) => ({
            type: 'Feature' as const,
            geometry: {
              type: 'Point' as const,
              coordinates: [bus.longitude, bus.latitude],
            },
            properties: { busId: bus.busId },
          })),
        },
      }),
      [routeCoordinates, etaCoordinates, buses]
    );

    useEffect(() => {
      const map = mapRef.current;
      if (!map) return;

      const applyData = () => {
        ensureGeoJsonSource(map, 'route-source', mapData.routeData as unknown as GeoJSON.FeatureCollection);
        ensureGeoJsonSource(map, 'eta-source', mapData.etaData as unknown as GeoJSON.FeatureCollection);
        ensureGeoJsonSource(map, 'buses-source', mapData.busesData as unknown as GeoJSON.FeatureCollection);

        if (!map.getLayer('route-line')) {
          map.addLayer({
            id: 'route-line',
            type: 'line',
            source: 'route-source',
            paint: {
              'line-color': '#E53935',
              'line-width': 4,
            },
            layout: { 'line-cap': 'round', 'line-join': 'round' },
          });
        }

        if (!map.getLayer('eta-line')) {
          map.addLayer({
            id: 'eta-line',
            type: 'line',
            source: 'eta-source',
            paint: {
              'line-color': '#2F80ED',
              'line-width': 3,
              'line-dasharray': [2, 2],
            },
            layout: { 'line-cap': 'round', 'line-join': 'round' },
          });
        }

        if (!map.getLayer('bus-circles')) {
          map.addLayer({
            id: 'bus-circles',
            type: 'circle',
            source: 'buses-source',
            paint: {
              'circle-color': [
                'case',
                ['==', ['get', 'busId'], selectedBusId || ''],
                '#0066FF',
                '#2F80ED',
              ],
              'circle-radius': 7,
              'circle-stroke-color': '#FFFFFF',
              'circle-stroke-width': 2,
            },
          });

          map.on('click', 'bus-circles', (event) => {
            const busId = event.features?.[0]?.properties?.busId;
            if (busId) {
              onSelectBus(String(busId));
            }
          });
        }

        if (!map.getLayer('bus-labels')) {
          map.addLayer({
            id: 'bus-labels',
            type: 'symbol',
            source: 'buses-source',
            layout: {
              'text-field': ['get', 'busId'],
              'text-size': 11,
              'text-offset': [0, 1.2],
            },
            paint: {
              'text-color': '#163C78',
              'text-halo-color': '#FFFFFF',
              'text-halo-width': 1,
            },
          });
        }

        map.setPaintProperty('bus-circles', 'circle-color', [
          'case',
          ['==', ['get', 'busId'], selectedBusId || ''],
          '#0066FF',
          '#2F80ED',
        ]);

        const markerConfigs: Array<{
          key: keyof typeof markersRef.current;
          point: { latitude: number; longitude: number } | null;
          color: string;
          title?: string;
        }> = [
          { key: 'user', point: location, color: '#00695C', title: 'Tu ubicacion' },
          {
            key: 'selectedPlace',
            point: selectedPlace ? { latitude: selectedPlace.latitude, longitude: selectedPlace.longitude } : null,
            color: '#4CAF50',
            title: selectedPlace?.structured_formatting.main_text,
          },
          {
            key: 'origin',
            point: routeOrigin ? { latitude: routeOrigin.latitude, longitude: routeOrigin.longitude } : null,
            color: '#1B5E20',
            title: 'Origen',
          },
          {
            key: 'destination',
            point: routeDestination ? { latitude: routeDestination.latitude, longitude: routeDestination.longitude } : null,
            color: '#C62828',
            title: 'Destino',
          },
        ];

        markerConfigs.forEach(({ key, point, color, title }) => {
          const current = markersRef.current[key];
          if (!point) {
            if (current) {
              current.remove();
              markersRef.current[key] = null;
            }
            return;
          }

          const lngLat: [number, number] = [point.longitude, point.latitude];
          if (!current) {
            const marker = new maplibregl.Marker({ color }).setLngLat(lngLat).addTo(map);
            if (title) {
              marker.setPopup(new maplibregl.Popup({ offset: 12 }).setText(title));
            }
            markersRef.current[key] = marker;
          } else {
            current.setLngLat(lngLat);
          }
        });

        if (selectedPlace) {
          map.flyTo({
            center: [selectedPlace.longitude, selectedPlace.latitude],
            zoom: 14,
            duration: 700,
          });
        }
      };

      if (map.isStyleLoaded()) {
        applyData();
      } else {
        map.once('load', applyData);
      }
    }, [location, mapData, onSelectBus, routeDestination, routeOrigin, selectedBusId, selectedPlace]);

    return (
      <View style={styles.container}>
        <div ref={containerRef} style={styles.webMap} />
      </View>
    );
  }
);

OpenFreeMapView.displayName = 'OpenFreeMapView';

const styles = {
  container: {
    flex: 1,
  },
  webMap: {
    width: '100%',
    height: '100%',
    minHeight: 300,
  } as React.CSSProperties,
};

export default OpenFreeMapView;
