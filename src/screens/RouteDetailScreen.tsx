import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { BusNowColors, CommonStyles, getTheme } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';
import RouteMapVisualization from '../components/RouteMapVisualization';

interface RouteStop {
  id: string;
  name: string;
  time: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isActive?: boolean;
}

interface RouteDetailScreenProps {
  route?: {
    id: string;
    name: string;
    startPoint: string;
    endPoint: string;
    stops: RouteStop[];
  };
  onBack?: () => void;
}

const RouteDetailScreen: React.FC<RouteDetailScreenProps> = ({
  route = {
    id: 'ruta-001',
    name: 'Ruta Boquete - David',
    startPoint: 'Boquete',
    endPoint: 'David',
    stops: [
      {
        id: '1',
        name: 'Parada Municipalidad',
        time: '7:00 AM',
        coordinates: { latitude: 8.7833, longitude: -82.4333 },
        isActive: true
      },
      {
        id: '2',
        name: 'Parada Municipalidad',
        time: '7:15 AM',
        coordinates: { latitude: 8.7800, longitude: -82.4300 }
      },
      {
        id: '3',
        name: 'Parada Parque Central',
        time: '7:15 AM',
        coordinates: { latitude: 8.7750, longitude: -82.4250 }
      },
      {
        id: '4',
        name: 'Parada Parque Central',
        time: '8:45 AM',
        coordinates: { latitude: 8.7700, longitude: -82.4200 }
      },
      {
        id: '5',
        name: 'Siocial Stopo',
        time: '8:30 AM',
        coordinates: { latitude: 8.7650, longitude: -82.4150 }
      }
    ]
  },
  onBack,
}) => {
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const { theme, t } = useSettings();
  const colors = getTheme(theme === 'dark');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const getTimeStatus = (stopTime: string) => {
    const now = currentTime;
    const [time, period] = stopTime.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    const adjustedHours = period === 'PM' && hours !== 12 ? hours + 12 : hours;
    
    const stopDate = new Date();
    stopDate.setHours(adjustedHours, minutes, 0, 0);
    
    const diffMs = stopDate.getTime() - now.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    
    if (diffMins < 0) return { status: 'passed', text: 'Pasó' };
    if (diffMins <= 5) return { status: 'arriving', text: `${diffMins} min` };
    if (diffMins <= 15) return { status: 'soon', text: `${diffMins} min` };
    return { status: 'scheduled', text: stopTime };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return colors.gray400;
      case 'arriving': return '#DC2626';
      case 'soon': return colors.accent;
      default: return colors.primary;
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.gray100 }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.white }]}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.gray800 }]}>←</Text>
        </TouchableOpacity>
        <View style={styles.routeHeader}>
          <Text style={[styles.routeTitle, { color: colors.gray800 }]}>{route.name}</Text>
          <TouchableOpacity style={styles.moreButton}>
            <Text style={[styles.moreButtonText, { color: colors.gray600 }]}>⋮</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Map Container */}
      <View style={styles.mapContainer}>
        <RouteMapVisualization 
          stops={route.stops}
          routeColor={colors.primary}
        />
      </View>

      {/* Route Stops List */}
      <ScrollView style={[styles.stopsContainer, { backgroundColor: colors.gray100 }]} showsVerticalScrollIndicator={false}>
        {route.stops.map((stop, index) => {
          const timeStatus = getTimeStatus(stop.time);
          return (
            <TouchableOpacity
              key={stop.id}
              style={[
                styles.stopItem,
                { backgroundColor: colors.white },
                selectedStop === stop.id && { backgroundColor: colors.gray100 },
                stop.isActive && { backgroundColor: colors.gray100 }
              ]}
              onPress={() => setSelectedStop(selectedStop === stop.id ? null : stop.id)}
              activeOpacity={0.7}
            >
              <View style={styles.stopInfo}>
                <View style={styles.stopIconContainer}>
                  <View style={[
                    styles.stopIcon,
                    { backgroundColor: getStatusColor(timeStatus.status) }
                  ]}>
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
                  <Text style={[
                    styles.stopName,
                    { color: colors.gray800 },
                    stop.isActive && { color: colors.primary, fontWeight: '600' }
                  ]}>
                    {stop.name}
                  </Text>
                  {stop.isActive && (
                    <Text style={[styles.activeStopIndicator, { color: colors.accent }]}>
                      🚌 Bus en esta parada
                    </Text>
                  )}
                </View>
                
                <View style={styles.timeContainer}>
                  <Text style={[
                    styles.stopTime,
                    { color: getStatusColor(timeStatus.status) }
                  ]}>
                    {timeStatus.text}
                  </Text>
                  {timeStatus.status === 'arriving' && (
                    <View style={[styles.arrivingIndicator, { backgroundColor: colors.accent }]}>
                      <Text style={[styles.arrivingText, { color: colors.white }]}>Llegando</Text>
                    </View>
                  )}
                </View>
              </View>
              
              {selectedStop === stop.id && (
                <View style={[styles.stopExpanded, { backgroundColor: colors.gray100 }]}>
                  <View style={styles.expandedInfo}>
                    <Text style={[styles.expandedLabel, { color: colors.gray600 }]}>Próximas salidas:</Text>
                    <Text style={[styles.expandedTimes, { color: colors.gray800 }]}>
                      {stop.time}, {getNextTimes(stop.time)}
                    </Text>
                  </View>
                  <View style={styles.expandedActions}>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.primary }]}>
                      <Text style={[styles.actionButtonText, { color: colors.white }]}>📍 Ver en mapa</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.actionButton, { backgroundColor: colors.secondary }]}>
                      <Text style={[styles.actionButtonText, { color: colors.white }]}>🔔 Notificar llegada</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Action Bar */}
      <View style={[styles.bottomBar, { backgroundColor: colors.white, borderTopColor: colors.gray200 }]}>
        <TouchableOpacity style={[styles.favoriteButton, { backgroundColor: colors.gray200 }]}>
          <Text style={[styles.favoriteButtonText, { color: colors.gray700 }]}>⭐ Agregar a favoritos</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.trackButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.trackButtonText, { color: colors.white }]}>� Seguir bus</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

// Función auxiliar para generar próximos horarios
const getNextTimes = (currentTime: string): string => {
  const [time, period] = currentTime.split(' ');
  const [hours, minutes] = time.split(':').map(Number);
  
  const nextTimes = [];
  for (let i = 1; i <= 2; i++) {
    const nextHour = hours + i;
    const nextPeriod = nextHour >= 12 ? 'PM' : 'AM';
    const displayHour = nextHour > 12 ? nextHour - 12 : nextHour;
    nextTimes.push(`${displayHour}:${minutes.toString().padStart(2, '0')} ${nextPeriod}`);
  }
  
  return nextTimes.join(', ');
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor removed - handled dynamically
  },
  header: {
    // backgroundColor removed - handled dynamically
    paddingHorizontal: CommonStyles.spacing.md,
    paddingVertical: CommonStyles.spacing.md,
    borderBottomWidth: 1,
    // borderBottomColor removed - handled dynamically
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BusNowColors.gray100,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: CommonStyles.spacing.sm,
  },
  backButtonText: {
    fontSize: 20,
    // color removed - handled dynamically
    fontWeight: '600',
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routeTitle: {
    ...CommonStyles.typography.h2,
    // color removed - handled dynamically
    flex: 1,
  },
  moreButton: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreButtonText: {
    fontSize: 20,
    // color removed - handled dynamically
    fontWeight: '600',
  },
  mapContainer: {
    height: 250,
    backgroundColor: BusNowColors.white,
    marginBottom: CommonStyles.spacing.sm,
  },
  stopsContainer: {
    flex: 1,
    // backgroundColor removed - handled dynamically
    paddingHorizontal: CommonStyles.spacing.md,
  },
  stopItem: {
    paddingVertical: CommonStyles.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: BusNowColors.gray100,
    // backgroundColor removed - handled dynamically
  },
  stopItemSelected: {
    // backgroundColor removed - handled dynamically
    marginHorizontal: -CommonStyles.spacing.md,
    paddingHorizontal: CommonStyles.spacing.md,
    borderRadius: CommonStyles.borderRadius.medium,
  },
  activeStopItem: {
    // backgroundColor removed - handled dynamically
    marginHorizontal: -CommonStyles.spacing.md,
    paddingHorizontal: CommonStyles.spacing.md,
    borderRadius: CommonStyles.borderRadius.medium,
    borderLeftWidth: 4,
    borderLeftColor: BusNowColors.primary,
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
    // backgroundColor removed - handled dynamically
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
    // backgroundColor removed - handled dynamically
  },
  stopDetails: {
    flex: 1,
  },
  stopName: {
    ...CommonStyles.typography.bodyMedium,
    // color removed - handled dynamically
    marginBottom: 2,
  },
  activeStopName: {
    // color removed - handled dynamically
    fontWeight: '600',
  },
  activeStopIndicator: {
    ...CommonStyles.typography.small,
    // color removed - handled dynamically
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
    // backgroundColor removed - handled dynamically
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    marginTop: 2,
  },
  arrivingText: {
    // color removed - handled dynamically
    fontSize: 10,
    fontWeight: '600',
  },
  stopExpanded: {
    marginTop: CommonStyles.spacing.md,
    paddingTop: CommonStyles.spacing.md,
    borderTopWidth: 1,
    borderTopColor: BusNowColors.gray200,
    // backgroundColor removed - handled dynamically
  },
  expandedInfo: {
    marginBottom: CommonStyles.spacing.sm,
  },
  expandedLabel: {
    ...CommonStyles.typography.caption,
    // color removed - handled dynamically
    marginBottom: 4,
  },
  expandedTimes: {
    ...CommonStyles.typography.body,
    // color removed - handled dynamically
  },
  expandedActions: {
    flexDirection: 'row',
    gap: CommonStyles.spacing.sm,
  },
  actionButton: {
    flex: 1,
    // backgroundColor removed - handled dynamically
    paddingVertical: CommonStyles.spacing.sm,
    paddingHorizontal: CommonStyles.spacing.md,
    borderRadius: CommonStyles.borderRadius.medium,
    alignItems: 'center',
  },
  actionButtonText: {
    ...CommonStyles.typography.caption,
    // color removed - handled dynamically
    fontWeight: '500',
  },
  bottomBar: {
    // backgroundColor removed - handled dynamically
    flexDirection: 'row',
    // backgroundColor removed - handled dynamically
    paddingHorizontal: CommonStyles.spacing.md,
    paddingVertical: CommonStyles.spacing.md,
    borderTopWidth: 1,
    // borderTopColor removed - handled dynamically
    gap: CommonStyles.spacing.sm,
  },
  favoriteButton: {
    flex: 1,
    // backgroundColor removed - handled dynamically
    paddingVertical: CommonStyles.spacing.md,
    borderRadius: CommonStyles.borderRadius.medium,
    alignItems: 'center',
  },
  favoriteButtonText: {
    ...CommonStyles.typography.bodyMedium,
    // color removed - handled dynamically
  },
  trackButton: {
    flex: 1,
    // backgroundColor removed - handled dynamically
    paddingVertical: CommonStyles.spacing.md,
    borderRadius: CommonStyles.borderRadius.medium,
    alignItems: 'center',
  },
  trackButtonText: {
    ...CommonStyles.typography.bodyMedium,
    // color removed - handled dynamically
    fontWeight: '600',
  },
});

export default RouteDetailScreen;