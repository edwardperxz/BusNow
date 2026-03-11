import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getTheme } from '../../../styles/colors';
import { useSettings } from '../../../context/SettingsContext';

interface MapIosFallbackProps {
  colors: ReturnType<typeof getTheme>;
}

export default function MapIosFallback({ colors }: MapIosFallbackProps) {
  const { t } = useSettings();

  return (
    <View style={[styles.container, { backgroundColor: colors.gray100 }]}>
      <Text style={[styles.title, { color: colors.gray800 }]}>📍 {t('map.iosUnavailableTitle')}</Text>
      <Text style={[styles.subtitle, { color: colors.gray600 }]}>{t('map.iosUnavailableSubtitle')}</Text>
      <Text style={[styles.description, { color: colors.gray600 }]}>{t('map.iosUnavailableDescription')}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});
