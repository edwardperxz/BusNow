import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Animated, 
  Dimensions, 
  TouchableWithoutFeedback,
  StatusBar,
  Platform 
} from 'react-native';
import { BusNowColors, CommonStyles, getTheme } from '../../styles/colors';
import { useSettings } from '../../context/SettingsContext';

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
  userProfile?: any;
  isAnonymous?: boolean;
  onLogout?: () => void;
}

const HamburgerMenu: React.FC<HamburgerMenuProps> = ({ 
  isOpen, 
  onToggle, 
  onItemPress, 
  activeItem,
  userProfile,
  isAnonymous = false,
  onLogout
}) => {
  const { theme, t } = useSettings();
  const colors = getTheme(theme === 'dark');
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const slideAnim = useRef(new Animated.Value(-screenWidth * 0.85)).current;
  const overlayOpacity = useRef(new Animated.Value(0)).current;
  
  // Menú más compacto (85% del ancho en lugar de 100%)
  const menuWidth = screenWidth * 0.85;
  
  // Menú dinámico según el estado del usuario
  const getMenuItems = (): MenuItem[] => {
    const baseItems: MenuItem[] = [
      { key: 'map', label: 'Mapa en Tiempo Real', icon: '🗺️', color: '#2196F3' },
      { key: 'routes', label: 'Rutas de Buses', icon: '🚌', color: '#FF9800' },
      { key: 'home', label: 'Información', icon: '🏠', color: '#4CAF50' },
    ];

    // Si es conductor activo, agregar Panel Conductor
    if (userProfile?.isDriver && userProfile?.driverStatus === 'active') {
      baseItems.push({ key: 'driver', label: 'Panel Conductor', icon: '👨‍💼', color: '#9C27B0' });
    }

    // Si está logueado (no anónimo)
    if (!isAnonymous && userProfile) {
      if (userProfile.isDriver && userProfile.driverStatus === 'active') {
        // Si ya es conductor, mostrar control de activación
        const isOnline = userProfile.driverInfo?.isOnline || false;
        baseItems.push({ 
          key: 'activateDriver', 
          label: isOnline ? 'Desactivar Modo Conductor' : 'Activar Modo Conductor', 
          icon: isOnline ? '🟢' : '�', 
          color: isOnline ? '#4CAF50' : '#FF9800' 
        });
      } else {
        // Si no es conductor, mostrar registro
        baseItems.push({ 
          key: 'activateDriver', 
          label: 'Registrarse como Conductor', 
          icon: '�🚗', 
          color: '#FF5722' 
        });
      }
    }

    // Si no está logueado (anónimo), mostrar opción de login
    if (isAnonymous || !userProfile) {
      baseItems.push({ key: 'login', label: 'Iniciar Sesión', icon: '🔑', color: '#673AB7' });
    } else {
      // Si está logueado, mostrar opción de cerrar sesión
      baseItems.push({ key: 'logout', label: 'Cerrar Sesión', icon: '🚪', color: '#F44336' });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  const [shouldRender, setShouldRender] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      // Mostrar el componente antes de animar
      setShouldRender(true);
      
      // Resetear valores antes de animar para asegurar animación consistente
      slideAnim.setValue(-menuWidth);
      overlayOpacity.setValue(0);
      
      // Animación más suave al abrir
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 280,
          useNativeDriver: false,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 1,
          duration: 280,
          useNativeDriver: false,
        }),
      ]).start();
    } else if (shouldRender) {
      // Animación más suave al cerrar
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -menuWidth,
          duration: 250,
          useNativeDriver: false,
        }),
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 250,
          useNativeDriver: false,
        }),
      ]).start(() => {
        // Ocultar el componente después de la animación
        setShouldRender(false);
      });
    }
  }, [isOpen, menuWidth, slideAnim, overlayOpacity, shouldRender]);

  const handleItemPress = (key: string) => {
    if (key === 'logout' && onLogout) {
      onLogout();
      onToggle();
    } else {
      onItemPress(key);
      onToggle(); // Cerrar el menú después de seleccionar
    }
  };

  const handleClosePress = () => {
    console.log('Close button pressed'); // Debug
    onToggle();
  };

  // Renderizar cuando debe mostrarse (abierto o cerrándose)
  if (!shouldRender && !isOpen) return null;

  return (
    <>
      {/* Overlay de fondo - toca para cerrar */}
      <TouchableWithoutFeedback onPress={onToggle}>
        <Animated.View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            opacity: overlayOpacity,
            zIndex: 998,
          }}
        />
      </TouchableWithoutFeedback>

      {/* Drawer Menu - Con animaciones de apertura y cierre */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          left: slideAnim,
          width: menuWidth,
          height: screenHeight,
          backgroundColor: colors.white,
          zIndex: 999,
          shadowColor: colors.gray800,
          shadowOffset: { width: 2, height: 0 },
          shadowOpacity: 0.25,
          shadowRadius: 15,
          elevation: 15,
        }}
      >
        {/* Header del menú - Responsivo */}
        <View style={{
          backgroundColor: colors.primary,
          paddingTop: Platform.OS === 'ios' ? 50 : (StatusBar.currentHeight || 0) + 20,
          paddingBottom: 24,
          paddingHorizontal: 20,
        }}>
          {/* Fila superior con X */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}>
            <TouchableOpacity
              onPress={handleClosePress}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              activeOpacity={0.7}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={{ 
                fontSize: 16, 
                color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white,
                fontWeight: '600'
              }}>×</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={() => {
                onItemPress('settings');
                onToggle();
              }}
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: 'rgba(255, 255, 255, 0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 18, color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white }}>⚙️</Text>
            </TouchableOpacity>
          </View>
          
          {/* Logo y saludo - Más compacto */}
          <View style={{ alignItems: 'center' }}>
            <View style={{
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              width: 60,
              height: 60,
              borderRadius: 30,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12,
            }}>
              <Text style={{ fontSize: 28, color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white }}>
                {userProfile?.isDriver && userProfile?.driverStatus === 'active' ? '🚌' : isAnonymous ? '👤' : '🧑'}
              </Text>
            </View>
            
            <Text style={{
              fontSize: 22,
              fontWeight: '700',
              color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white,
              marginBottom: 4,
            }}>
              {userProfile?.name || 'BusNow'}
            </Text>
            <Text style={{
              fontSize: 12,
              color: 'rgba(255, 255, 255, 0.8)',
            }}>
              {userProfile?.isDriver && userProfile?.driverStatus === 'active' && userProfile?.driverInfo
                ? `Conductor • Bus ${userProfile.driverInfo.busNumber}`
                : isAnonymous 
                  ? 'Modo Invitado'
                  : userProfile?.email || 'Tu compañero de viaje'}
            </Text>
          </View>
        </View>

        {/* Menu Items - Más compacto y responsivo */}
        <View style={{ flex: 1, paddingTop: 24, paddingHorizontal: 6 }}>
          {menuItems.map((item, index) => {
            const isActive = item.key === activeItem;
            
            return (
              <TouchableOpacity
                key={item.key}
                onPress={() => handleItemPress(item.key)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  paddingVertical: 14,
                  paddingHorizontal: 16,
                  marginVertical: 2,
                  marginHorizontal: 6,
                  borderRadius: 12,
                  backgroundColor: isActive ? `${item.color}12` : 'transparent',
                }}
                activeOpacity={0.7}
              >
                {/* Icono más compacto */}
                <View style={{
                  width: 42,
                  height: 42,
                  borderRadius: 21,
                  backgroundColor: isActive ? item.color : colors.gray100,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: 16,
                }}>
                  <Text style={{
                    fontSize: 18,
                    color: isActive ? (colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white) : colors.gray600,
                  }}>
                    {item.icon}
                  </Text>
                </View>

                {/* Texto adaptable */}
                <View style={{ flex: 1 }}>
                  <Text style={{
                    fontSize: 15,
                    fontWeight: '500',
                    color: isActive ? item.color : colors.gray800,
                    marginBottom: 1,
                  }}>
                    {item.label}
                  </Text>
                  <Text style={{
                    fontSize: 11,
                    color: colors.gray500,
                  }}>
                    {item.key === 'map' ? 'Seguimiento GPS' :
                     item.key === 'routes' ? 'Todas las líneas' : 
                     item.key === 'home' ? 'Información' : 
                     'Herramientas'}
                  </Text>
                </View>

                {/* Indicador de flecha */}
                <Text style={{
                  fontSize: 14,
                  color: isActive ? item.color : colors.gray400,
                  fontWeight: isActive ? '600' : '400',
                }}>
                  ›
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Footer más compacto */}
        <View style={{
          paddingHorizontal: 16,
          paddingVertical: 16,
          borderTopWidth: 1,
          borderTopColor: colors.gray200,
        }}>
          <Text style={{
            fontSize: 10,
            color: colors.gray500,
            textAlign: 'center',
          }}>
            BusNow v1.0.0 • Transporte inteligente
          </Text>
        </View>
      </Animated.View>
    </>
  );
};

export default HamburgerMenu;