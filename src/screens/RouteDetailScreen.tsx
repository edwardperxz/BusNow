import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { CommonStyles } from '../styles/colors';
import RouteMapVisualization from '../components/RouteMapVisualization';
import { useRouteDetailData } from '../features/routes/hooks/useRouteDetailData';
import RouteDetailHeader from '../features/routes/components/RouteDetailHeader';
import RouteStopsList from '../features/routes/components/RouteStopsList';
import RouteDetailBottomBar from '../features/routes/components/RouteDetailBottomBar';
import { RouteData } from '../features/routes/types';
import { useAppTheme } from '../hooks/useAppTheme';

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

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.gray100 }]}>
      <RouteDetailHeader colors={colors} title={route.name} onBack={onBack} />

      {loadingRoute ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ flex: 1, alignSelf: 'center' }} />
      ) : (
        <>
          <View style={[styles.mapContainer, { backgroundColor: colors.white }]}>
            <RouteMapVisualization stops={route.stops} routeColor={colors.primary} />
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