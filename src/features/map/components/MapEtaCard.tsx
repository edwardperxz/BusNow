import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getTheme } from '../../../styles/colors';
import { useSettings } from '../../../context/SettingsContext';

interface ETAData {
  durationText: string;
  distanceText: string;
}

interface MapEtaCardProps {
  colors: ReturnType<typeof getTheme>;
  selectedBusId: string | null;
  hasStopLocation: boolean;
  etaLoading: boolean;
  etaError: string | null;
  eta: ETAData | null;
}

export default function MapEtaCard({
  colors,
  selectedBusId,
  hasStopLocation,
  etaLoading,
  etaError,
  eta,
}: MapEtaCardProps) {
  const { t } = useSettings();

  if (!selectedBusId || !hasStopLocation) {
    return null;
  }

  return (
    <View style={[styles.etaCard, { backgroundColor: colors.white }]}>
      <View style={styles.headerRow}>
        <Text style={[styles.etaTitle, { color: colors.gray900 }]}>{t('map.etaTitle')}</Text>
        <Text style={{ color: colors.gray600 }}>
          {t('map.busLabel')} {selectedBusId}
        </Text>
      </View>
      {etaLoading ? (
        <Text style={{ color: colors.gray700 }}>{t('map.calculating')}</Text>
      ) : etaError ? (
        <Text style={{ color: '#D32F2F' }}>
          {t('common.error')}: {etaError}
        </Text>
      ) : eta ? (
        <Text style={[styles.etaMain, { color: colors.gray900 }]}>
          {eta.durationText} · {eta.distanceText}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  etaCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  etaTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  etaMain: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 8,
  },
});
