// =============================================================================
// WEB MAP FALLBACK - Fallback para navegadores web
// =============================================================================

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { colors } from '../styles/colors';

const { width, height } = Dimensions.get('window');

interface WebMapFallbackProps {
  children?: React.ReactNode;
  style?: any;
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  onRegionChangeComplete?: (region: any) => void;
  showsUserLocation?: boolean;
  provider?: any;
}

const WebMapFallback: React.FC<WebMapFallbackProps> = ({
  children,
  style,
  region,
  onRegionChangeComplete,
  showsUserLocation,
}) => {
  const openGoogleMaps = () => {
    if (region) {
      const url = `https://www.google.com/maps/@${region.latitude},${region.longitude},15z`;
      window.open(url, '_blank');
    }
  };

  const openOpenStreetMap = () => {
    if (region) {
      const url = `https://www.openstreetmap.org/#map=15/${region.latitude}/${region.longitude}`;
      window.open(url, '_blank');
    }
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.fallbackContent}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapIcon}>🗺️</Text>
          <Text style={styles.title}>Mapa no disponible en Web</Text>
          <Text style={styles.subtitle}>
            Los mapas interactivos requieren la aplicación móvil
          </Text>
          
          {region && (
            <View style={styles.locationInfo}>
              <Text style={styles.coordinatesTitle}>Ubicación actual:</Text>
              <Text style={styles.coordinates}>
                Lat: {region.latitude.toFixed(4)}
              </Text>
              <Text style={styles.coordinates}>
                Lng: {region.longitude.toFixed(4)}
              </Text>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={styles.mapButton} 
              onPress={openGoogleMaps}
            >
              <Text style={styles.buttonText}>🌍 Ver en Google Maps</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.mapButton} 
              onPress={openOpenStreetMap}
            >
              <Text style={styles.buttonText}>🗺️ Ver en OpenStreetMap</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Información adicional */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>💡 Para la mejor experiencia:</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>
              • Descarga la app en tu dispositivo móvil
            </Text>
            <Text style={styles.infoItem}>
              • Obtén mapas interactivos en tiempo real
            </Text>
            <Text style={styles.infoItem}>
              • Rastreo de buses con GPS
            </Text>
            <Text style={styles.infoItem}>
              • Notificaciones de llegada
            </Text>
          </View>
        </View>

        {/* QR Code para descarga */}
        <View style={styles.qrSection}>
          <Text style={styles.qrTitle}>📱 Descargar App</Text>
          <View style={styles.qrPlaceholder}>
            <Text style={styles.qrText}>QR Code</Text>
            <Text style={styles.qrSubtext}>Escanea para descargar</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  fallbackContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapPlaceholder: {
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    borderWidth: 2,
    borderColor: colors.gray[300],
    borderStyle: 'dashed',
    minWidth: 300,
  },
  mapIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  locationInfo: {
    backgroundColor: colors.gray[100],
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  coordinatesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 8,
  },
  coordinates: {
    fontSize: 12,
    color: colors.text.secondary,
    fontFamily: 'monospace',
  },
  buttonContainer: {
    gap: 12,
    width: '100%',
  },
  mapButton: {
    backgroundColor: colors.primary.main,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: colors.info + '20',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    maxWidth: 400,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  infoList: {
    gap: 8,
  },
  infoItem: {
    fontSize: 14,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  qrSection: {
    alignItems: 'center',
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  qrPlaceholder: {
    width: 120,
    height: 120,
    backgroundColor: colors.gray[200],
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  qrText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: colors.text.secondary,
  },
  qrSubtext: {
    fontSize: 10,
    color: colors.text.muted,
    marginTop: 4,
  },
});

export { WebMapFallback };
export default WebMapFallback;
