import React, { useRef } from 'react';
import {
  View,
  Platform,
  StyleSheet,
} from 'react-native';

import { useSearch } from '../context/SearchContext';
import { useSettings } from '../context/SettingsContext';
import GooglePlacesSearchInteractive from '../components/GooglePlacesSearchInteractive';
import { DEMO_MODE } from '../demo/demoConfig';
import { useDynamicETA } from '../hooks/useDynamicETA';
import { useAppTheme } from '../hooks/useAppTheme';
import MapEtaCard from '../features/map/components/MapEtaCard';
import MapControlsPanel from '../features/map/components/MapControlsPanel';
import BusMarkersLayer from '../features/map/components/BusMarkersLayer';
import RouteOverlayLayer from '../features/map/components/RouteOverlayLayer';
import { useMapScreenState } from '../features/map/hooks/useMapScreenState';
import { SelectedPlace } from '../features/map/types';
import { DARK_MAP_STYLE } from '../features/map/constants';

// En iOS se usa Apple Maps por defecto; en Android se fuerza Google Maps.
let MapView: any, Marker: any, Polyline: any, PROVIDER_GOOGLE: any;
const maps = require('react-native-maps');
MapView = maps.default;
Marker = maps.Marker;
Polyline = maps.Polyline;

if (Platform.OS === 'android') {
  PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
}

export default function MapScreen() {
  const { colors, isDark } = useAppTheme();
  const { t } = useSettings();
  const { setSearchState } = useSearch();
  const mapRef = useRef<any>(null);
  const {
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
    defaultCoordinates,
  } = useMapScreenState();
  
  const { eta, loading: etaLoading, error: etaError } = useDynamicETA({
    busId: selectedBusId || '',
    stopLocation,
    enabled: Boolean(selectedBusId && stopLocation)
  });
  
  // Función para manejar la selección de lugares
  const handlePlaceSelect = (place: SelectedPlace) => {
    setSelectedPlace(place);
  };

  // Función para manejar cambios de estado del buscador
  const handleSearchStateChange = (state: 'hidden' | 'neutral' | 'expanded') => {
    setSearchState(state);
  };

  const centerOnUser = () => {
    if (location && mapRef.current) {
      const camera = {
        center: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        zoom: 16,
      };

      if (typeof mapRef.current.animateCamera === 'function') {
        mapRef.current.animateCamera(camera, { duration: 500 });
        return;
      }

      if (typeof mapRef.current.animateToRegion === 'function') {
        mapRef.current.animateToRegion(
          {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          },
          500
        );
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.gray100 }]}>
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={true}
          showsMyLocationButton={false}
          showsCompass={true}
          showsScale={true}
          loadingEnabled={isLoading}
          mapType="standard"
          customMapStyle={Platform.OS === 'android' && isDark ? DARK_MAP_STYLE : undefined}
        >
          <BusMarkersLayer
            Marker={Marker}
            buses={buses}
            selectedBusId={selectedBusId}
            onSelectBus={setSelectedBusId}
            selectedPlace={selectedPlace}
          />

          <RouteOverlayLayer
            Polyline={Polyline}
            Marker={Marker}
            routeCoordinates={routeCoordinates}
            etaPolyline={eta?.polyline}
            selectedBusId={selectedBusId}
            stopLocation={stopLocation}
            buses={buses}
            routeOrigin={routeOrigin}
            routeDestination={routeDestination}
          />
        </MapView>

        <MapControlsPanel
          colors={colors}
          busesCount={buses.length}
          location={location}
          onCenterUser={centerOnUser}
          demoMode={DEMO_MODE}
        />

        <MapEtaCard
          colors={colors}
          selectedBusId={selectedBusId}
          hasStopLocation={Boolean(stopLocation)}
          etaLoading={etaLoading}
          etaError={etaError}
          eta={eta ? { durationText: eta.durationText, distanceText: eta.distanceText } : null}
        />
      </View>

      <GooglePlacesSearchInteractive
        onPlaceSelect={handlePlaceSelect}
        placeholder={t('map.whereTo')}
        countryCode="PA"
        location={`${defaultCoordinates.latitude},${defaultCoordinates.longitude}`}
        radius={50000}
        onSearchStateChange={handleSearchStateChange}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    flex: 1,
  },
});
