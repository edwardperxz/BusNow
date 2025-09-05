// =============================================================================
// MAP COMPONENTS - CROSS PLATFORM
// =============================================================================

import React, { forwardRef } from 'react';
import { Platform, View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { colors } from '../styles/colors';

// Importación condicional manual para evitar problemas de bundling
let NativeMapView: any = null;
let NativeMarker: any = null;
let NativePolyline: any = null;
let PROVIDER_GOOGLE_VALUE: string = 'google';

// Solo importar react-native-maps en plataformas nativas
if (Platform.OS !== 'web') {
  try {
    const ReactNativeMaps = require('react-native-maps');
    NativeMapView = ReactNativeMaps.default;
    NativeMarker = ReactNativeMaps.Marker;
    NativePolyline = ReactNativeMaps.Polyline;
    PROVIDER_GOOGLE_VALUE = ReactNativeMaps.PROVIDER_GOOGLE || 'google';
  } catch (error) {
    console.warn('react-native-maps not available:', error);
  }
}

// Componente fallback para web
const WebMapFallback: React.FC<any> = ({ style, region, children }) => {
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
            <Text style={[webStyles.buttonText, webStyles.secondaryButtonText]}>Ver en OpenStreetMap</Text>
          </TouchableOpacity>
        </View>

        <View style={webStyles.appPromotion}>
          <Text style={webStyles.promoTitle}>📱 Descarga BusNow</Text>
          <Text style={webStyles.promoText}>
            Disponible para iOS y Android con mapas en tiempo real
          </Text>
        </View>
      </View>
    </View>
  );
};

export const CrossPlatformMap = forwardRef<any, any>((props, ref) => {
  // En web siempre usar el fallback, sin importar el estado de NativeMapView
  if (Platform.OS === 'web') {
    return <WebMapFallback {...props} />;
  }
  
  // En móvil, verificar que tenemos el componente nativo
  if (!NativeMapView) {
    console.warn('NativeMapView not available, using fallback');
    return <WebMapFallback {...props} />;
  }
  
  return <NativeMapView ref={ref} {...props} />;
});

// Agregar display name para debugging
CrossPlatformMap.displayName = 'CrossPlatformMap';

export const CrossPlatformMarker: React.FC<any> = (props) => {
  // En web siempre retornar null - los marcadores se manejan en WebMapFallback
  if (Platform.OS === 'web') {
    return null;
  }
  
  // En móvil, verificar que tenemos el componente nativo
  if (!NativeMarker) {
    console.warn('NativeMarker not available');
    return null;
  }
  
  return <NativeMarker {...props} />;
};

export const CrossPlatformPolyline: React.FC<any> = (props) => {
  // En web siempre retornar null - las polilíneas se manejan en WebMapFallback
  if (Platform.OS === 'web') {
    return null;
  }
  
  // En móvil, verificar que tenemos el componente nativo
  if (!NativePolyline) {
    console.warn('NativePolyline not available');
    return null;
  }
  
  return <NativePolyline {...props} />;
};

// Exports para compatibilidad
export const MapView = NativeMapView;
export const Marker = NativeMarker; 
export const Polyline = NativePolyline;
export const PROVIDER_GOOGLE = PROVIDER_GOOGLE_VALUE;

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
    marginBottom: 24,
  },
  button: {
    backgroundColor: colors.primary.main,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryButton: {
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.primary.main,
  },
  buttonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: colors.primary.main,
  },
  appPromotion: {
    backgroundColor: colors.primary.light,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.primary.main,
    marginBottom: 8,
  },
  promoText: {
    fontSize: 14,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
