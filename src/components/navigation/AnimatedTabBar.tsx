import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, Text, Animated, Dimensions } from 'react-native';
import { BusNowColors, CommonStyles } from '../../styles/colors';

interface TabItem {
  key: string;
  label: string;
  icon: string;
  color: string;
  badge?: number;
}

interface AnimatedTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onTabPress: (tabKey: string) => void;
}

const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({ tabs, activeTab, onTabPress }) => {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const screenWidth = Dimensions.get('window').width;
  
  // Calcular el ancho de cada tab (restando márgenes y padding)
  const containerWidth = screenWidth - 24; // Márgenes horizontales
  const tabWidth = containerWidth / tabs.length;
  const indicatorWidth = 68; // Tamaño del indicador estilo Clash Royale
  
  // Encontrar el índice del tab activo
  const activeIndex = tabs.findIndex(tab => tab.key === activeTab);
  
  // Calcular la posición del indicador (centrado en cada tab)
  const indicatorPosition = 6 + (tabWidth * activeIndex) + (tabWidth - indicatorWidth) / 2;

  useEffect(() => {
    // Animación estilo Clash Royale con más bounce y efecto dramático
    Animated.sequence([
      // Pequeño overshoot para efecto gaming
      Animated.spring(animatedValue, {
        toValue: indicatorPosition,
        useNativeDriver: false,
        tension: 120,
        friction: 6,
        velocity: 5,
      }),
    ]).start();
  }, [activeTab, indicatorPosition]);

  return (
    <View style={{
      // Efecto glassmorphism como Clash Royale
      backgroundColor: 'rgba(20, 25, 40, 0.85)',
      flexDirection: 'row',
      paddingVertical: 6,
      paddingHorizontal: 6,
      borderRadius: 25,
      marginHorizontal: 12,
      marginBottom: 25,
      position: 'relative',
      height: 80,
      // Sombras múltiples para efecto más dramático
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.6,
      shadowRadius: 25,
      elevation: 20,
      // Borde sutil
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
    }}>
      {/* Fondo con gradiente simulado */}
      <View style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        borderRadius: 25,
        backgroundColor: 'rgba(30, 40, 60, 0.3)',
      }} />
      
      {/* Indicador animado estilo Clash Royale */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 6,
          left: animatedValue,
          width: 68,
          height: 68,
          backgroundColor: 'rgba(255, 255, 255, 0.15)',
          borderRadius: 34,
          zIndex: 1,
          // Efecto de brillo interno
          shadowColor: '#FFF',
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.3,
          shadowRadius: 10,
          elevation: 5,
          borderWidth: 2,
          borderColor: 'rgba(255, 255, 255, 0.3)',
        }}
      />
      
      {/* Tabs estilo Clash Royale */}
      {tabs.map((tab, index) => {
        const isActive = tab.key === activeTab;
        
        return (
          <TouchableOpacity
            key={tab.key}
            onPress={() => onTabPress(tab.key)}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 10,
              zIndex: 2,
            }}
            activeOpacity={0.8}
          >
            <View style={{
              alignItems: 'center',
              justifyContent: 'center',
              height: 68,
              width: 68,
              borderRadius: 34,
              // Efecto de elevación cuando está activo
              transform: [{ scale: isActive ? 1.1 : 1 }],
            }}>
              {/* Iconos coloridos estilo gaming */}
              <View style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: isActive ? tab.color || BusNowColors.primary : 'rgba(255, 255, 255, 0.3)',
                alignItems: 'center',
                justifyContent: 'center',
                // Brillo cuando está activo
                shadowColor: isActive ? tab.color || BusNowColors.primary : 'transparent',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: isActive ? 0.8 : 0,
                shadowRadius: 15,
                elevation: isActive ? 8 : 0,
              }}>
                <Text style={{
                  fontSize: 18,
                  color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)',
                  fontWeight: 'bold',
                }}>
                  {tab.icon}
                </Text>
              </View>
              
              {/* Badge de notificación estilo Clash Royale */}
              {tab.badge && tab.badge > 0 && (
                <View style={{
                  position: 'absolute',
                  top: -2,
                  right: 8,
                  backgroundColor: '#FF3B30',
                  borderRadius: 12,
                  minWidth: 20,
                  height: 20,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: 2,
                  borderColor: '#FFFFFF',
                  shadowColor: '#FF3B30',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.8,
                  shadowRadius: 4,
                  elevation: 8,
                }}>
                  <Text style={{
                    fontSize: 10,
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                  }}>
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </Text>
                </View>
              )}
              
              {/* Texto del tab */}
              <Text style={{
                fontSize: 10,
                fontWeight: isActive ? '700' : '500',
                color: isActive ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)',
                marginTop: 2,
                textShadowColor: isActive ? 'rgba(0, 0, 0, 0.5)' : 'transparent',
                textShadowOffset: { width: 0, height: 1 },
                textShadowRadius: 2,
              }}>
                {tab.label}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default AnimatedTabBar;