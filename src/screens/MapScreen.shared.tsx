import React, { useMemo, useRef } from 'react';
import { View, StyleSheet } from 'react-native';

import { useSearch } from '../context/SearchContext';
import { useSettings } from '../context/SettingsContext';
import GooglePlacesSearchInteractive from '../components/GooglePlacesSearchInteractive';
import { DEMO_MODE } from '../demo/demoConfig';
import { useDynamicETA } from '../hooks/useDynamicETA';
import { useAppTheme } from '../hooks/useAppTheme';
import MapEtaCard from '../features/map/components/MapEtaCard';
import MapControlsPanel from '../features/map/components/MapControlsPanel';
import { useMapScreenState } from '../features/map/hooks/useMapScreenState';
import { SelectedPlace } from '../features/map/types';
import { decodePolyline } from '../utils/polyline';
import OpenFreeMapView from '../features/map/components/OpenFreeMapView';
import { OpenFreeMapHandle } from '../features/map/components/OpenFreeMapView.types';

export default function MapScreenShared() {
  const { colors } = useAppTheme();
  const { t } = useSettings();
  const { setSearchState } = useSearch();
  const mapRef = useRef<OpenFreeMapHandle>(null);
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
    enabled: Boolean(selectedBusId && stopLocation),
  });

  const etaCoordinates = useMemo(
    () => (eta?.polyline ? decodePolyline(eta.polyline) : []),
    [eta?.polyline]
  );

  const handlePlaceSelect = (place: SelectedPlace) => {
    setSelectedPlace(place);
  };

  const handleSearchStateChange = (state: 'hidden' | 'neutral' | 'expanded') => {
    setSearchState(state);
  };

  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.centerOnUser();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.gray100 }]}>
      <View style={styles.mapContainer}>
        <OpenFreeMapView
          ref={mapRef}
          initialCenter={{ latitude: region.latitude, longitude: region.longitude }}
          location={
            location
              ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
              : null
          }
          routeCoordinates={routeCoordinates}
          etaCoordinates={etaCoordinates}
          buses={buses}
          selectedBusId={selectedBusId}
          selectedPlace={selectedPlace}
          routeOrigin={routeOrigin}
          routeDestination={routeDestination}
          onSelectBus={setSelectedBusId}
          onRegionChange={setRegion}
        />

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
});
