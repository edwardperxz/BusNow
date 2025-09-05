import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Marker } from 'react-native-maps';
import { Bus, BusRoute } from '../types';

interface BusMarkerProps {
  bus: Bus;
  route?: BusRoute;
  onPress: () => void;
}

const BusMarker: React.FC<BusMarkerProps> = ({ bus, route, onPress }) => {
  const getMarkerColor = () => {
    switch (bus.status) {
      case 'online':
        return route?.color || '#2196F3';
      case 'offline':
        return '#9E9E9E';
      case 'maintenance':
        return '#FF9800';
      case 'delayed':
        return '#FFC107';
      default:
        return '#9E9E9E';
    }
  };

  const getCapacityLevel = () => {
    const percentage = bus.capacity.occupied / bus.capacity.total;
    if (percentage >= 0.8) return 'high';
    if (percentage >= 0.5) return 'medium';
    return 'low';
  };

  const getCapacityColor = () => {
    const level = getCapacityLevel();
    switch (level) {
      case 'high': return '#F44336'; // Rojo - muy lleno
      case 'medium': return '#FF9800'; // Naranja - medio lleno
      case 'low': return '#4CAF50'; // Verde - disponible
      default: return '#9E9E9E';
    }
  };

  return (
    <Marker
      coordinate={bus.currentLocation}
      onPress={onPress}
      anchor={{ x: 0.5, y: 0.5 }}
      rotation={bus.heading}
      title={`Bus ${bus.plateNumber}`}
      description={`${route?.name || 'Ruta desconocida'} - ${bus.speed.toFixed(1)} km/h`}
    >
      <View style={styles.busMarkerContainer}>
        {/* Indicador de capacidad */}
        <View style={[styles.capacityIndicator, { backgroundColor: getCapacityColor() }]} />
        
        {/* Cuerpo del bus */}
        <View style={[styles.busMarker, { backgroundColor: getMarkerColor() }]}>
          <View style={styles.busWindows} />
          <View style={styles.busDirection} />
        </View>
        
        {/* Sombra */}
        <View style={styles.busShadow} />
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  busMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  busMarker: {
    width: 30,
    height: 40,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  busWindows: {
    width: 20,
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    borderRadius: 2,
    marginBottom: 2,
  },
  busDirection: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#FFFFFF',
  },
  capacityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    position: 'absolute',
    top: -4,
    right: 2,
    borderWidth: 1,
    borderColor: '#FFFFFF',
    zIndex: 1,
  },
  busShadow: {
    width: 24,
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: 12,
    position: 'absolute',
    bottom: -4,
  },
});

export default BusMarker;
