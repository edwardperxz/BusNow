import React from 'react';
import { Text, View } from 'react-native';
import { CommonStyles, getTheme } from '../../../styles/colors';
import { useSettings } from '../../../context/SettingsContext';
import { RouteItem } from '../types';

interface RoutesSummaryCardProps {
  colors: ReturnType<typeof getTheme>;
  routes: RouteItem[];
}

export default function RoutesSummaryCard({ colors, routes }: RoutesSummaryCardProps) {
  const { t } = useSettings();

  return (
    <View
      style={{
        backgroundColor: colors.white,
        padding: CommonStyles.spacing.md,
        borderRadius: 8,
        marginTop: 100,
        marginBottom: CommonStyles.spacing.lg,
        ...CommonStyles.cardShadow,
      }}
    >
      <Text
        style={{
          ...CommonStyles.typography.h3,
          color: colors.gray800,
          marginBottom: CommonStyles.spacing.sm,
        }}
      >
        {t('routes.summaryTitle')}
      </Text>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ ...CommonStyles.typography.h2, color: colors.primary }}>{routes.length}</Text>
          <Text style={{ ...CommonStyles.typography.small, color: colors.gray500 }}>{t('routes.totalRoutes')}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ ...CommonStyles.typography.h2, color: colors.secondary }}>
            {routes.reduce((acc, route) => acc + route.activeBuses, 0)}
          </Text>
          <Text style={{ ...CommonStyles.typography.small, color: colors.gray500 }}>{t('routes.activeBuses')}</Text>
        </View>
        <View style={{ alignItems: 'center' }}>
          <Text style={{ ...CommonStyles.typography.h2, color: colors.accent }}>
            {routes.filter((r) => r.status === 'active').length}
          </Text>
          <Text style={{ ...CommonStyles.typography.small, color: colors.gray500 }}>{t('routes.operational')}</Text>
        </View>
      </View>
    </View>
  );
}
