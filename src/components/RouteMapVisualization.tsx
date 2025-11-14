import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { BusNowColors, getTheme } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';

interface RouteMapProps {
  stops: Array<{
    id: string;
    name: string;
    coordinates: { latitude: number; longitude: number };
    isActive?: boolean;
  }>;
  routeColor?: string;
}

const RouteMapVisualization: React.FC<RouteMapProps> = ({ 
  stops, 
  routeColor 
}) => {
  const { theme } = useSettings();
  const colors = getTheme(theme === 'dark');
  const finalRouteColor = routeColor || colors.primary;
  
  const { width } = Dimensions.get('window');
  const mapHeight = 250;

  // Calcular posiciones relativas de las paradas en el mapa
  const getRelativePosition = (index: number, total: number) => {
    // Simular una ruta que va de izquierda a derecha con ligeras curvas
    const progress = index / (total - 1);
    
    // Posición X: progreso lineal con pequeñas variaciones
    const x = 20 + (progress * 60) + Math.sin(progress * Math.PI * 2) * 5;
    
    // Posición Y: crear una curva suave
    const y = 30 + Math.sin(progress * Math.PI) * 20 + (Math.random() - 0.5) * 10;
    
    return {
      x: Math.min(Math.max(x, 10), 90), // Mantener dentro de límites
      y: Math.min(Math.max(y, 20), 80)
    };
  };

  const positions = stops.map((_, index) => getRelativePosition(index, stops.length));

  // Generar puntos para la curva de la ruta
  const generateRoutePath = () => {
    const pathPoints = [];
    for (let i = 0; i < positions.length - 1; i++) {
      const start = positions[i];
      const end = positions[i + 1];
      
      // Agregar puntos intermedios para crear una curva suave
      for (let j = 0; j <= 10; j++) {
        const t = j / 10;
        const x = start.x + (end.x - start.x) * t;
        const y = start.y + (end.y - start.y) * t + Math.sin(t * Math.PI) * 2;
        pathPoints.push({ x, y });
      }
    }
    return pathPoints;
  };

  const routePath = generateRoutePath();

  return (
    <View style={[styles.container, { 
      height: mapHeight,
      backgroundColor: colors.gray100 
    }]}>
      {/* Fondo de mapa con grid de calles */}
      <View style={styles.streetGrid}>
        {/* Líneas horizontales */}
        {[...Array(8)].map((_, i) => (
          <View 
            key={`h-${i}`} 
            style={[
              styles.streetLine, 
              styles.horizontalStreet, 
              { 
                top: `${i * 12.5}%`,
                backgroundColor: colors.gray300
              }
            ]} 
          />
        ))}
        {/* Líneas verticales */}
        {[...Array(10)].map((_, i) => (
          <View 
            key={`v-${i}`} 
            style={[
              styles.streetLine, 
              styles.verticalStreet, 
              { 
                left: `${i * 10}%`,
                backgroundColor: colors.gray300
              }
            ]} 
          />
        ))}
      </View>

      {/* Ruta principal */}
      <View style={styles.routeContainer}>
        {routePath.map((point, index) => (
          <View
            key={index}
            style={[
              styles.routePoint,
              {
                left: `${point.x}%`,
                top: `${point.y}%`,
                backgroundColor: finalRouteColor,
                opacity: 0.8,
              }
            ]}
          />
        ))}
      </View>

      {/* Paradas de autobús */}
      {stops.map((stop, index) => {
        const position = positions[index];
        return (
          <View
            key={stop.id}
            style={[
              styles.busStop,
              {
                left: `${position.x}%`,
                top: `${position.y}%`,
              }
            ]}
          >
            <View style={[
              styles.stopIcon,
              {
                backgroundColor: stop.isActive ? '#DC2626' : finalRouteColor,
                borderColor: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white,
              }
            ]}>
              {stop.isActive ? (
                <View style={styles.busIndicator}>
                  <View style={[styles.busShape, {
                    backgroundColor: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white
                  }]} />
                </View>
              ) : (
                <View style={[styles.stopDot, {
                  backgroundColor: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white
                }]} />
              )}
            </View>
            
            {/* Línea de conexión a la ruta */}
            <View style={[
              styles.connectionLine,
              { backgroundColor: finalRouteColor + '60' }
            ]} />
          </View>
        );
      })}

      {/* Elementos decorativos para simular puntos de interés */}
      <View style={[styles.landmark, { left: '25%', top: '15%' }]}>
        <View style={styles.landmarkIcon}>
          <View style={[styles.building, { backgroundColor: colors.gray400 }]} />
        </View>
      </View>
      
      <View style={[styles.landmark, { left: '70%', top: '60%' }]}>
        <View style={styles.landmarkIcon}>
          <View style={styles.park} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: 12,
    margin: 16,
  },
  streetGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  streetLine: {
    position: 'absolute',
    opacity: 0.3,
  },
  horizontalStreet: {
    width: '100%',
    height: 1,
  },
  verticalStreet: {
    height: '100%',
    width: 1,
  },
  routeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  routePoint: {
    position: 'absolute',
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  busStop: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  stopDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  busIndicator: {
    width: 12,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  busShape: {
    width: 8,
    height: 4,
    borderRadius: 1,
  },
  connectionLine: {
    position: 'absolute',
    width: 2,
    height: 20,
    top: 24,
    opacity: 0.5,
  },
  landmark: {
    position: 'absolute',
    zIndex: 1,
  },
  landmarkIcon: {
    width: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  building: {
    width: 8,
    height: 12,
    borderRadius: 1,
  },
  park: {
    width: 10,
    height: 10,
    backgroundColor: '#22C55E',
    borderRadius: 5,
  },
});

export default RouteMapVisualization;