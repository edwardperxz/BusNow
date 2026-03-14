import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';

import { OpenFreeMapHandle, OpenFreeMapViewProps } from './OpenFreeMapView.types';

const OPENFREEMAP_STYLE_URL = 'https://tiles.openfreemap.org/styles/bright';

const BASE_HTML = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
    <link href="https://unpkg.com/maplibre-gl/dist/maplibre-gl.css" rel="stylesheet" />
    <style>
      html, body, #map { margin: 0; padding: 0; width: 100%; height: 100%; }
      body { overflow: hidden; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/maplibre-gl/dist/maplibre-gl.js"></script>
    <script>
      (function () {
        let map;
        let pendingPayload = null;
        const pointMarkers = { user: null, selectedPlace: null, origin: null, destination: null };

        function postMessage(payload) {
          if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
            window.ReactNativeWebView.postMessage(JSON.stringify(payload));
          }
        }

        function toLngLat(point) {
          return [point.longitude, point.latitude];
        }

        function emptyFeatureCollection() {
          return { type: 'FeatureCollection', features: [] };
        }

        function ensureGeoJsonSource(id, data) {
          const source = map.getSource(id);
          if (source) {
            source.setData(data);
            return;
          }
          map.addSource(id, { type: 'geojson', data });
        }

        function ensureLineLayer(id, sourceId, color, width, dashArray) {
          if (!map.getLayer(id)) {
            map.addLayer({
              id,
              type: 'line',
              source: sourceId,
              paint: {
                'line-color': color,
                'line-width': width,
                'line-dasharray': dashArray || [1, 0],
              },
              layout: {
                'line-cap': 'round',
                'line-join': 'round',
              },
            });
          }
        }

        function ensureBusLayers(selectedBusId) {
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
                  '#2F80ED'
                ],
                'circle-radius': 7,
                'circle-stroke-color': '#FFFFFF',
                'circle-stroke-width': 2,
              },
            });

            map.on('click', 'bus-circles', function (event) {
              const busId = event.features && event.features[0] && event.features[0].properties
                ? event.features[0].properties.busId
                : null;
              if (busId) {
                postMessage({ type: 'select-bus', busId });
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
            '#2F80ED'
          ]);
        }

        function upsertMarker(key, point, color, title) {
          if (!point) {
            if (pointMarkers[key]) {
              pointMarkers[key].remove();
              pointMarkers[key] = null;
            }
            return;
          }

          const lngLat = toLngLat(point);
          if (!pointMarkers[key]) {
            const marker = new maplibregl.Marker({ color }).setLngLat(lngLat).addTo(map);
            if (title) {
              marker.setPopup(new maplibregl.Popup({ offset: 12 }).setText(title));
            }
            pointMarkers[key] = marker;
          } else {
            pointMarkers[key].setLngLat(lngLat);
          }
        }

        function updateMapData(payload) {
          if (!map || !map.isStyleLoaded()) {
            pendingPayload = payload;
            return;
          }

          const routeData = payload.routeCoordinates && payload.routeCoordinates.length > 0
            ? {
                type: 'FeatureCollection',
                features: [{
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: payload.routeCoordinates.map(toLngLat),
                  },
                  properties: {},
                }],
              }
            : emptyFeatureCollection();

          const etaData = payload.etaCoordinates && payload.etaCoordinates.length > 0
            ? {
                type: 'FeatureCollection',
                features: [{
                  type: 'Feature',
                  geometry: {
                    type: 'LineString',
                    coordinates: payload.etaCoordinates.map(toLngLat),
                  },
                  properties: {},
                }],
              }
            : emptyFeatureCollection();

          const busesData = {
            type: 'FeatureCollection',
            features: (payload.buses || []).map(function (bus) {
              return {
                type: 'Feature',
                geometry: {
                  type: 'Point',
                  coordinates: [bus.longitude, bus.latitude],
                },
                properties: {
                  busId: bus.busId,
                },
              };
            }),
          };

          ensureGeoJsonSource('route-source', routeData);
          ensureGeoJsonSource('eta-source', etaData);
          ensureGeoJsonSource('buses-source', busesData);

          ensureLineLayer('route-line', 'route-source', '#E53935', 4, null);
          ensureLineLayer('eta-line', 'eta-source', '#2F80ED', 3, [2, 2]);
          ensureBusLayers(payload.selectedBusId);

          upsertMarker('user', payload.location, '#00695C', 'Tu ubicacion');
          upsertMarker('selectedPlace', payload.selectedPlace, '#4CAF50', payload.selectedPlace ? payload.selectedPlace.structured_formatting.main_text : undefined);
          upsertMarker('origin', payload.routeOrigin, '#1B5E20', 'Origen');
          upsertMarker('destination', payload.routeDestination, '#C62828', 'Destino');

          if (payload.selectedPlace) {
            map.flyTo({ center: toLngLat(payload.selectedPlace), zoom: 14, duration: 700 });
          }
        }

        window.centerOnUser = function () {
          if (map && map.__lastPayload && map.__lastPayload.location) {
            map.easeTo({
              center: [map.__lastPayload.location.longitude, map.__lastPayload.location.latitude],
              zoom: 15,
              duration: 600,
            });
          }
        };

        window.updateMapData = function (payload) {
          map.__lastPayload = payload;
          updateMapData(payload);
        };

        function initializeMap() {
          map = new maplibregl.Map({
            container: 'map',
            style: '${OPENFREEMAP_STYLE_URL}',
            center: [-82.4333, 8.4333],
            zoom: 12,
            attributionControl: true,
          });

          map.on('load', function () {
            if (pendingPayload) {
              updateMapData(pendingPayload);
              pendingPayload = null;
            }
            postMessage({ type: 'ready' });
          });

          map.on('moveend', function () {
            const center = map.getCenter();
            const bounds = map.getBounds();
            postMessage({
              type: 'region-change',
              region: {
                latitude: center.lat,
                longitude: center.lng,
                latitudeDelta: Math.abs(bounds.getNorth() - bounds.getSouth()),
                longitudeDelta: Math.abs(bounds.getEast() - bounds.getWest()),
              },
            });
          });

          map.on('click', function (event) {
            postMessage({
              type: 'map-click',
              coordinate: {
                latitude: event.lngLat.lat,
                longitude: event.lngLat.lng,
              },
            });
          });
        }

        initializeMap();
      })();
    </script>
  </body>
</html>`;

function injectPayloadScript(payload: unknown): string {
  const json = JSON.stringify(payload);
  return `window.updateMapData(${json}); true;`;
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
    const webViewRef = useRef<WebView>(null);
    const isReadyRef = useRef(false);

    const payload = useMemo(
      () => ({
        initialCenter,
        location,
        routeCoordinates,
        etaCoordinates,
        buses,
        selectedBusId,
        selectedPlace,
        routeOrigin,
        routeDestination,
      }),
      [
        initialCenter,
        location,
        routeCoordinates,
        etaCoordinates,
        buses,
        selectedBusId,
        selectedPlace,
        routeOrigin,
        routeDestination,
      ]
    );

    useImperativeHandle(ref, () => ({
      centerOnUser: () => {
        webViewRef.current?.injectJavaScript('window.centerOnUser && window.centerOnUser(); true;');
      },
    }));

    useEffect(() => {
      if (!isReadyRef.current) {
        return;
      }
      webViewRef.current?.injectJavaScript(injectPayloadScript(payload));
    }, [payload]);

    const handleMessage = (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data?.type === 'ready') {
          isReadyRef.current = true;
          webViewRef.current?.injectJavaScript(injectPayloadScript(payload));
          return;
        }

        if (data?.type === 'select-bus' && data.busId) {
          onSelectBus(String(data.busId));
          return;
        }

        if (data?.type === 'region-change' && data.region && onRegionChange) {
          onRegionChange(data.region);
          return;
        }

        if (data?.type === 'map-click' && data.coordinate && onMapClick) {
          const latitude = Number(data.coordinate.latitude);
          const longitude = Number(data.coordinate.longitude);
          if (Number.isFinite(latitude) && Number.isFinite(longitude)) {
            onMapClick({ latitude, longitude });
          }
        }
      } catch {
        // Ignorar mensajes no JSON.
      }
    };

    return (
      <View style={styles.container}>
        <WebView
          ref={webViewRef}
          originWhitelist={['*']}
          source={{ html: BASE_HTML }}
          style={styles.map}
          onMessage={handleMessage}
          javaScriptEnabled
          domStorageEnabled
          mixedContentMode="always"
        />
      </View>
    );
  }
);

OpenFreeMapView.displayName = 'OpenFreeMapView';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
});

export default OpenFreeMapView;
