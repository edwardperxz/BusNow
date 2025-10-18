import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Animated, Dimensions, TouchableWithoutFeedback } from 'react-native';
import { BusNowColors, CommonStyles } from '../../styles/colors';

interface MenuItem {
  key: string;
  label: string;
  icon: string;
  color: string;
}

interface HamburgerMenuProps {
  isOpen: boolean;
  onToggle: () => void;
  onItemPress: (key: string) => void;
  activeItem: string;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ 
  isOpen, 
  onToggle, 
  onItemPress, 
  activeItem 
}) => {
  const screenWidth = Dimensions.get('window').width;
  const slideAnim = useRef(new Animated.Value(-screenWidth)).current;
  
  const menuItems: MenuItem[] = [
    { key: 'map', label: 'Mapa en Tiempo Real', icon: '🗺️', color: '#2196F3' },
    { key: 'routes', label: 'Rutas de Buses', icon: '�', color: '#FF9800' },
    { key: 'home', label: 'Información', icon: '🏠', color: '#4CAF50' },
    { key: 'driver', label: 'Panel Conductor', icon: '👨‍💼', color: '#9C27B0' },
  ];

  React.useEffect(() => {
    if (isOpen) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: false,
        tension: 100,
        friction: 8,
      }).start();
    } else {
      Animated.spring(slideAnim, {
        toValue: -screenWidth,
        useNativeDriver: false,
        tension: 120,
        friction: 8,
      }).start();
    }
  }, [isOpen]);

  const handleItemPress = (key: string) => {
    onItemPress(key);
    onToggle(); // Cerrar el menú después de seleccionar
  };

  return (
    <>
      {/* Drawer Menu - Pantalla completa para móvil */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: slideAnim,
          width: '100%',
          height: '100%',
          backgroundColor: BusNowColors.white,
          zIndex: 999,
        }}
      >
        {/* Header del menú - Más amigable y moderno */}
        <View style={{
          backgroundColor: BusNowColors.primary,
          paddingTop: 60,
          paddingBottom: 30,
          paddingHorizontal: 24,
        }}>
          {/* Fila superior con X y configuración */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 24,
          }}>
            <TouchableOpacity
              onPress={onToggle}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ 
                fontSize: 18, 
                color: BusNowColors.white,
                fontWeight: '600'
              }}>×</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => onItemPress('settings')}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 20, color: BusNowColors.white }}>⚙️</Text>
            </TouchableOpacity>
          </View>
          
          {/* Logo y saludo centrados */}
          <View style={{ alignItems: 'center' }}>
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              width: 72,
              height: 72,
              borderRadius: 36,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}>
              <Text style={{ fontSize: 32, color: BusNowColors.white }}>🚌</Text>
            </View>
            
            <Text style={{
              ...CommonStyles.typography.h2,
              color: BusNowColors.white,
              marginBottom: 4,
            }}>BusNow</Text>
            <Text style={{
              ...CommonStyles.typography.caption,
              color: 'rgba(255, 255, 255, 0.8)',
            }}>Tu compañero de viaje</Text>
          </View>
        </View>

        {/* Menu Items - Diseño más amigable y espacioso */}
        <View style={{ flex: 1, paddingTop: 32, paddingHorizontal: 8 }}>
          {menuItems.map((item, index) => {
            const isActive = item.key === activeItem;
            
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => handleItemPress(item.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 18,
                  paddingHorizontal: 20,
                  marginVertical: 4,
                  marginHorizontal: 8,
                  borderRadius: CommonStyles.borderRadius.medium,
                  backgroundColor: isActive ? `${item.color}15` : 'transparent',
                }}
              >
                {/* Icono mejorado */}
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: isActive ? item.color : BusNowColors.gray100,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 20,
                  ...CommonStyles.softShadow,
                }}>
                  <Text style={{
                    fontSize: 20,
                    color: isActive ? BusNowColors.white : BusNowColors.gray600,
                  }}>
                    {item.icon}
                  </Text>
                </View>

                {/* Texto mejorado */}
                <View style={{ flex: 1 }}>
                  <Text style={{
                    ...CommonStyles.typography.bodyMedium,
                    color: isActive ? item.color : BusNowColors.gray800,
                    marginBottom: 2,
                  }}>
                    {item.label}
                  </Text>
                  <Text style={{
                    ...CommonStyles.typography.small,
                    color: BusNowColors.gray500,
                  }}>
                    {item.key === 'map' ? 'Seguimiento GPS en vivo' :
                     item.key === 'routes' ? 'Todas las líneas' : 
                     item.key === 'home' ? 'Estadísticas e información' : 
                     'Herramientas de conductor'}
                  </Text>
                </View>

                {/* Indicador de flecha */}
                <Text style={{
                  fontSize: 16,
                  color: isActive ? item.color : BusNowColors.gray400,
                  fontWeight: isActive ? '600' : '400',
                }}>
                  ›
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer del menú */}
        <View style={{
          paddingHorizontal: 20,
          paddingVertical: 20,
          borderTopWidth: 1,
          borderTopColor: BusNowColors.gray200,
        }}>
          <Text style={{
            ...CommonStyles.typography.small,
            color: BusNowColors.gray500,
            textAlign: 'center',
          }}>
            Versión 1.0.0
          </Text>
        </View>
      </Animated.View>
    </>
  );
};

export default HamburgerMenu;