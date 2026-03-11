import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import * as Location from 'expo-location';
import { getTheme } from '../../../styles/colors';
import { useSettings } from '../../../context/SettingsContext';

interface MapControlsPanelProps {
  colors: ReturnType<typeof getTheme>;
  busesCount: number;
  location: Location.LocationObject | null;
  onCenterUser: () => void;
  demoMode: boolean;
}

export default function MapControlsPanel({
  colors,
  busesCount,
  location,
  onCenterUser,
  demoMode,
}: MapControlsPanelProps) {
  const { t } = useSettings();

  return (
    <View style={styles.mapControls}>
      <View style={[styles.busCountBadge, { backgroundColor: colors.white }]}>
        <Text style={[styles.busCountText, { color: colors.gray800 }]}>
          {busesCount} {t('map.activeBusesCount')}
        </Text>
      </View>

      <View style={styles.controlButtons}>
        {location && (
          <TouchableOpacity style={[styles.controlButton, { backgroundColor: colors.white }]} onPress={onCenterUser}>
            <Text style={styles.controlButtonText}>📍</Text>
          </TouchableOpacity>
        )}
      </View>

      {demoMode && (
        <View style={[styles.demoBanner, { backgroundColor: colors.accent }]}>
          <Text style={styles.demoBannerText}>{t('map.demoMode')}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  mapControls: {
    position: 'absolute',
    right: 16,
    top: 16,
    bottom: 16,
    pointerEvents: 'box-none',
  },
  busCountBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  busCountText: {
    fontSize: 14,
    fontWeight: '600',
  },
  controlButtons: {
    gap: 12,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  controlButtonText: {
    fontSize: 20,
  },
  demoBanner: {
    position: 'absolute',
    left: -60,
    top: 0,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  demoBannerText: {
    color: '#fff',
    fontWeight: '700',
  },
});
