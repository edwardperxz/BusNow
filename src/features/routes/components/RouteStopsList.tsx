import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BusNowColors, CommonStyles, getTheme } from '../../../styles/colors';
import { useSettings } from '../../../context/SettingsContext';
import { RouteData } from '../types';
import { getNextTimes, getTimeStatus } from '../utils/time';

interface RouteStopsListProps {
  colors: ReturnType<typeof getTheme>;
  route: RouteData;
  selectedStop: string | null;
  setSelectedStop: (stopId: string | null) => void;
  currentTime: Date;
}

export default function RouteStopsList({
  colors,
  route,
  selectedStop,
  setSelectedStop,
  currentTime,
}: RouteStopsListProps) {
  const { t } = useSettings();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return colors.gray400;
      case 'arriving':
        return '#DC2626';
      case 'soon':
        return colors.accent;
      default:
        return colors.primary;
    }
  };

  return (
    <ScrollView style={[styles.stopsContainer, { backgroundColor: colors.gray100 }]} showsVerticalScrollIndicator={false}>
      {route.stops.map((stop, index) => {
        const timeStatus = getTimeStatus(stop.time, currentTime);
        const isSelected = selectedStop === stop.id;

        return (
          <TouchableOpacity
            key={stop.id}
            style={[
              styles.stopItem,
              { backgroundColor: colors.white },
              isSelected && { backgroundColor: colors.gray100 },
              stop.isActive && { backgroundColor: colors.gray100 },
            ]}
            onPress={() => setSelectedStop(isSelected ? null : stop.id)}
            activeOpacity={0.7}
          >
            <View style={styles.stopInfo}>
              <View style={styles.stopIconContainer}>
                <View style={[styles.stopIcon, { backgroundColor: getStatusColor(timeStatus.status) }]}>
                  {stop.isActive ? (
                    <Text style={styles.busIconSmall}>🚌</Text>
                  ) : (
                    <View style={[styles.stopDot, { backgroundColor: colors.white }]} />
                  )}
                </View>
                {index < route.stops.length - 1 && (
                  <View style={[styles.connectionLine, { backgroundColor: colors.gray300 }]} />
                )}
              </View>

              <View style={styles.stopDetails}>
                <Text
                  style={[
                    styles.stopName,
                    { color: colors.gray800 },
                    stop.isActive && { color: colors.primary, fontWeight: '600' },
                  ]}
                >
                  {stop.name}
                </Text>
                {stop.isActive && (
                  <Text style={[styles.activeStopIndicator, { color: colors.accent }]}>🚌 {t('routes.busAtStop')}</Text>
                )}
              </View>

              <View style={styles.timeContainer}>
                <Text style={[styles.stopTime, { color: getStatusColor(timeStatus.status) }]}>{timeStatus.text}</Text>
                {timeStatus.status === 'arriving' && (
                  <View style={[styles.arrivingIndicator, { backgroundColor: colors.accent }]}>
                    <Text style={[styles.arrivingText, { color: colors.white }]}>{t('routes.arriving')}</Text>
                  </View>
                )}
              </View>
            </View>

            {isSelected && (
              <View style={[styles.stopExpanded, { backgroundColor: colors.gray100 }]}>
                <View style={styles.expandedInfo}>
                  <Text style={[styles.expandedLabel, { color: colors.gray600 }]}>{t('routes.nextDepartures')}</Text>
                  <Text style={[styles.expandedTimes, { color: colors.gray800 }]}>
                    {stop.time}, {getNextTimes(stop.time)}
                  </Text>
                </View>
                <View style={styles.expandedActions}>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                    <Text style={[styles.actionButtonText, { color: colors.white }]}>📍 {t('routes.viewOnMap')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.secondary }]}>
                    <Text style={[styles.actionButtonText, { color: colors.white }]}>🔔 {t('routes.notifyArrival')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  stopsContainer: {
    flex: 1,
    paddingHorizontal: CommonStyles.spacing.md,
  },
  stopItem: {
    paddingVertical: CommonStyles.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: BusNowColors.gray100,
  },
  stopInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stopIconContainer: {
    alignItems: 'center',
    marginRight: CommonStyles.spacing.md,
    position: 'relative',
  },
  stopIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: BusNowColors.white,
  },
  stopDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  busIconSmall: {
    fontSize: 14,
    color: BusNowColors.white,
  },
  connectionLine: {
    position: 'absolute',
    top: 32,
    width: 2,
    height: 20,
  },
  stopDetails: {
    flex: 1,
  },
  stopName: {
    ...CommonStyles.typography.bodyMedium,
    marginBottom: 2,
  },
  activeStopIndicator: {
    ...CommonStyles.typography.small,
    fontStyle: 'italic',
  },
  timeContainer: {
    alignItems: 'flex-end',
  },
  stopTime: {
    ...CommonStyles.typography.bodyMedium,
    fontWeight: '600',
  },
  arrivingIndicator: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  arrivingText: {
    fontSize: 10,
    fontWeight: '600',
  },
  stopExpanded: {
    marginTop: CommonStyles.spacing.md,
    paddingTop: CommonStyles.spacing.md,
    borderTopWidth: 1,
    borderTopColor: BusNowColors.gray200,
  },
  expandedInfo: {
    marginBottom: CommonStyles.spacing.sm,
  },
  expandedLabel: {
    ...CommonStyles.typography.caption,
    marginBottom: 4,
  },
  expandedTimes: {
    ...CommonStyles.typography.body,
  },
  expandedActions: {
    flexDirection: 'row',
    gap: CommonStyles.spacing.sm,
  },
  actionButton: {
    flex: 1,
    paddingVertical: CommonStyles.spacing.sm,
    paddingHorizontal: CommonStyles.spacing.md,
    borderRadius: CommonStyles.borderRadius.medium,
    alignItems: 'center',
  },
  actionButtonText: {
    ...CommonStyles.typography.caption,
    fontWeight: '500',
  },
});
