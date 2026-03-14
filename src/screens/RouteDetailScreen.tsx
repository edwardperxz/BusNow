import React from 'react';
import {
  View,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonStyles } from '../styles/colors';
import RouteStopsMapView from '../features/map/components/RouteStopsMapView';
import { useRouteDetailData } from '../features/routes/hooks/useRouteDetailData';
import RouteDetailHeader from '../features/routes/components/RouteDetailHeader';
import RouteStopsList from '../features/routes/components/RouteStopsList';
import RouteDetailBottomBar from '../features/routes/components/RouteDetailBottomBar';
import { RouteData } from '../features/routes/types';
import { useAppTheme } from '../hooks/useAppTheme';
import { decodePolyline } from '../utils/polyline';

interface RouteDetailScreenProps {
  route?: RouteData;
  /** ID de ruta para cargar desde el backend. Si se provee, sobreescribe `route`. */
  routeId?: string;
  onBack?: () => void;
}

const RouteDetailScreen: React.FC<RouteDetailScreenProps> = ({
  route: routeProp,
  routeId,
  onBack,
}) => {
  const { route, loadingRoute, selectedStop, setSelectedStop, currentTime } = useRouteDetailData(
    routeId,
    routeProp
  );
  const { colors } = useAppTheme();
  const routeCoordinates = React.useMemo(() => {
    if (route.geometryPolyline) {
      return decodePolyline(route.geometryPolyline);
    }

    if (route.anchorPoints && route.anchorPoints.length > 0) {
      return route.anchorPoints.map((point) => point.coordinates);
    }

    return route.stops.map((stop) => stop.coordinates);
  }, [route.anchorPoints, route.geometryPolyline, route.stops]);
  const originLabel = route.anchorPoints?.find((point) => point.kind === 'start')?.label ?? route.startPoint;
  const destinationLabel = route.anchorPoints?.find((point) => point.kind === 'end')?.label ?? route.endPoint;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.gray100 }]}>
      <RouteDetailHeader colors={colors} title={route.name} onBack={onBack} />

      {loadingRoute ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, alignSelf: 'center' }} />
      ) : (
        <>
          <View style={[styles.mapContainer, { backgroundColor: colors.white }]}>
            <RouteStopsMapView
              stops={route.stops}
              routeCoordinates={routeCoordinates}
              originLabel={originLabel}
              destinationLabel={destinationLabel}
            />
          </View>

          <RouteStopsList
            colors={colors}
            route={route}
            selectedStop={selectedStop}
            setSelectedStop={setSelectedStop}
            currentTime={currentTime}
          />

          <RouteDetailBottomBar colors={colors} />
        </>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapContainer: {
    height: 250,
    marginBottom: CommonStyles.spacing.sm,
  },
});

export default RouteDetailScreen;