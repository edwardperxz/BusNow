import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { CommonStyles, getRouteColor, getTheme } from '../../../styles/colors';
import { useSettings } from '../../../context/SettingsContext';
import { RouteItem } from '../types';
import { getRouteStatusColor } from '../utils/status';

interface RouteCardProps {
  route: RouteItem;
  index: number;
  colors: ReturnType<typeof getTheme>;
  onPress: (routeId: string) => void;
}

export default function RouteCard({ route, index, colors, onPress }: RouteCardProps) {
  const { t } = useSettings();
  const statusColor = getRouteStatusColor(route.status, colors);
  const statusText =
    route.status === 'active'
      ? t('routes.statusActive')
      : route.status === 'limited'
        ? t('routes.statusLimited')
        : route.status === 'maintenance'
          ? t('routes.statusMaintenance')
          : t('routes.statusUnknown');

  return (
    <TouchableOpacity
      onPress={() => onPress(route.id)}
      style={{
        backgroundColor: colors.white,
        padding: CommonStyles.spacing.md,
        borderRadius: 8,
        marginBottom: CommonStyles.spacing.sm,
        borderLeftWidth: 4,
        borderLeftColor: getRouteColor(index + 1),
        ...CommonStyles.cardShadow,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: CommonStyles.spacing.sm,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text
            style={{
              ...CommonStyles.typography.body,
              fontWeight: '600',
              color: colors.gray800,
              marginBottom: CommonStyles.spacing.xs,
            }}
          >
            🚌 {route.name}
          </Text>
          <Text style={{ ...CommonStyles.typography.caption, color: colors.gray600 }}>
            {route.origin} → {route.destination}
          </Text>
        </View>

        <View
          style={{
            backgroundColor: `${statusColor}20`,
            paddingHorizontal: CommonStyles.spacing.sm,
            paddingVertical: CommonStyles.spacing.xs,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: statusColor,
          }}
        >
          <Text
            style={{
              ...CommonStyles.typography.small,
              color: statusColor,
              fontWeight: '500',
            }}
          >
            {statusText}
          </Text>
        </View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flexDirection: 'row', gap: CommonStyles.spacing.md }}>
          <View>
            <Text style={{ ...CommonStyles.typography.small, color: colors.gray500 }}>{t('routes.frequency')}</Text>
            <Text
              style={{
                ...CommonStyles.typography.caption,
                fontWeight: '500',
                color: colors.gray700,
              }}
            >
              {route.frequency}
            </Text>
          </View>
          <View>
            <Text style={{ ...CommonStyles.typography.small, color: colors.gray500 }}>{t('routes.fare')}</Text>
            <Text
              style={{
                ...CommonStyles.typography.caption,
                fontWeight: '500',
                color: colors.gray700,
              }}
            >
              {route.fare}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ ...CommonStyles.typography.small, color: colors.gray500 }}>{t('routes.activeBuses')}</Text>
          <Text
            style={{
              ...CommonStyles.typography.body,
              fontWeight: '600',
              color: getRouteColor(index + 1),
            }}
          >
            {route.activeBuses}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}
