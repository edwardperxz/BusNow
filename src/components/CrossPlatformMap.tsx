// =============================================================================
// WEB MAP COMPONENT - Compatible con Web y Mobile
// =============================================================================

import React, { forwardRef } from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../styles/colors';

// Importación condicional para evitar errores en web
let MapView: any = null;
let Marker: any = null;
let Polyline: any = null;

if (Platform.OS !== 'web') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    Polyline = maps.Polyline;
  } catch (error) {
    console.log('React Native Maps not available:', error);
  }
}

// Componente fallback para web embebido
const WebMapFallback: React.FC<any> = ({ style, region }) => {
  const openExternalMap = (provider: 'google' | 'openstreet') => {
    const lat = region?.latitude || -34.6037;
    const lng = region?.longitude || -58.3816;
    
    const urls = {
      google: `https://maps.google.com/?q=${lat},${lng}&z=15`,
      openstreet: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`,
    };
    
    Linking.openURL(urls[provider]);
  };

  return (
    <View style={[style, webStyles.container]}>
      <View style={webStyles.content}>
        <Text style={webStyles.title}>🗺️ Mapa no disponible en Web</Text>
        <Text style={webStyles.subtitle}>
          Para obtener la mejor experiencia con mapas en tiempo real,
          descarga la app móvil de BusNow
        </Text>
        
        {region && (
          <View style={webStyles.coordinates}>
            <Text style={webStyles.coordText}>
              📍 Lat: {region.latitude.toFixed(6)}
            </Text>
            <Text style={webStyles.coordText}>
              📍 Lng: {region.longitude.toFixed(6)}
            </Text>
          </View>
        )}
        
        <View style={webStyles.buttonContainer}>
          <TouchableOpacity
            style={webStyles.button}
            onPress={() => openExternalMap('google')}
          >
            <Text style={webStyles.buttonText}>Ver en Google Maps</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[webStyles.button, webStyles.secondaryButton]}
            onPress={() => openExternalMap('openstreet')}
          >
            <Text style={webStyles.buttonText}>Ver en OpenStreetMap</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

interface CrossPlatformMapProps {
  children?: React.ReactNode;
  style?: any;
  region?: any;
  onRegionChangeComplete?: (region: any) => void;
  showsUserLocation?: boolean;
  showsMyLocationButton?: boolean;
  toolbarEnabled?: boolean;
  provider?: any;
}

export const CrossPlatformMap = forwardRef<any, CrossPlatformMapProps>((props, ref) => {
  // En web, usar el fallback
  if (Platform.OS === 'web' || !MapView) {
    return <WebMapFallback {...props} />;
  }

  // En móvil, usar react-native-maps
  return <MapView ref={ref} {...props} />;
});

export const CrossPlatformMarker: React.FC<any> = (props) => {
  if (Platform.OS === 'web' || !Marker) {
    return null; // El WebMapFallback maneja los marcadores internamente
  }
  return <Marker {...props} />;
};

export const CrossPlatformPolyline: React.FC<any> = (props) => {
  if (Platform.OS === 'web' || !Polyline) {
    return null; // El WebMapFallback maneja las polylíneas internamente
  }
  return <Polyline {...props} />;
};

const webStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    padding: 20,
    maxWidth: 400,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  coordinates: {
    backgroundColor: colors.background.secondary,
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  coordText: {
    fontSize: 14,
    color: colors.text.muted,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    backgroundColor: colors.primary.main,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.background.secondary,
  },
  buttonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
});

export { MapView, Marker, Polyline };
