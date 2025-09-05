// =============================================================================
// MAP SCREEN - MVP BusNow
// =============================================================================

import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch } from 'react-redux';
// Import cross-platform map components
import { 
  CrossPlatformMap, 
  CrossPlatformMarker, 
  CrossPlatformPolyline,
  PROVIDER_GOOGLE 
} from '../../components/MapComponents';
import { useUserLocation } from '../hooks/useAuth';
import { useAppSelector, AppDispatch } from '../../store';
import { seedStoreWithMockData } from '../../store/seedData';
import { colors } from '../../styles/colors';
import { Region } from 'react-native-maps';

interface MapScreenProps {
  navigation: any;
  route: {
    params?: {
      selectedRouteId?: string;
    };
  };
}

const MapScreen: React.FC<MapScreenProps> = ({ navigation, route }) => {
  const { selectedRouteId } = route.params || {};
  const { location: userLocation, isLoading: locationLoading } = useUserLocation();
  const dispatch = useDispatch<AppDispatch>();
  
  // Get data from store
  const { buses, routes } = useAppSelector((state) => {
    const trackingState = (state.tracking as any) || {};
    return {
      buses: trackingState.buses || [],
      routes: trackingState.routes || [],
    };
  });

  // Initialize store with mock data if empty
  useEffect(() => {
    if (routes.length === 0 || buses.length === 0) {
      seedStoreWithMockData(dispatch);
    }
  }, [dispatch, routes.length, buses.length]);
  
  if (locationLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Map */}
      <CrossPlatformMap 
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={{ 
          latitude: userLocation?.latitude || -34.6037,
          longitude: userLocation?.longitude || -58.3816,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        onRegionChange={(region: Region) => {
          // Handle region change if needed
        }}
        showsUserLocation={true}
        showsMyLocationButton={true}
      />

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity
          style={styles.fab}
          onPress={() => navigation.navigate('Routes')}
        >
          <Text style={styles.fabText}>📋</Text>
        </TouchableOpacity>
        
        {userLocation && (
          <TouchableOpacity
            style={styles.fab}
            onPress={() => {
              // The MapComponent will handle centering on user location
            }}
          >
            <Text style={styles.fabText}>📍</Text>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  map: {
    flex: 1,
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
  },
  fab: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.3)',
    elevation: 6,
  },
  fabText: {
    fontSize: 24,
  },
});

export default MapScreen;
