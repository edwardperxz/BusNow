import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { CommonStyles, getTheme } from '../../../styles/colors';
import { useSettings } from '../../../context/SettingsContext';

interface RouteDetailBottomBarProps {
  colors: ReturnType<typeof getTheme>;
}

export default function RouteDetailBottomBar({ colors }: RouteDetailBottomBarProps) {
  const { t } = useSettings();

  return (
    <View style={[styles.bottomBar, { backgroundColor: colors.white, borderTopColor: colors.gray200 }]}> 
      <TouchableOpacity style={[styles.favoriteButton, { backgroundColor: colors.gray200 }]}>
        <Text style={[styles.favoriteButtonText, { color: colors.gray700 }]}>⭐ {t('routes.addFavorite')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.trackButton, { backgroundColor: colors.primary }]}>
        <Text style={[styles.trackButtonText, { color: colors.white }]}>🚌 {t('routes.followBus')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: CommonStyles.spacing.md,
    paddingVertical: CommonStyles.spacing.md,
    borderTopWidth: 1,
    gap: CommonStyles.spacing.sm,
  },
  favoriteButton: {
    flex: 1,
    paddingVertical: CommonStyles.spacing.md,
    borderRadius: CommonStyles.borderRadius.medium,
    alignItems: 'center',
  },
  favoriteButtonText: {
    ...CommonStyles.typography.bodyMedium,
  },
  trackButton: {
    flex: 1,
    paddingVertical: CommonStyles.spacing.md,
    borderRadius: CommonStyles.borderRadius.medium,
    alignItems: 'center',
  },
  trackButtonText: {
    ...CommonStyles.typography.bodyMedium,
    fontWeight: '600',
  },
});
