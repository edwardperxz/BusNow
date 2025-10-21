import React, { useState } from 'react';
import { View } from 'react-native';

import MapScreen from '../../screens/MapScreen';
import RoutesScreen from '../../screens/RoutesScreen';
import HomeScreen from '../../screens/HomeScreen';
import DriverScreen from '../../screens/DriverScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import HamburgerMenu from './HamburgerMenu';
import HamburgerButton from './HamburgerButton';
import { BusNowColors, getTheme } from '../../styles/colors';
import { useSettings } from '../../context/SettingsContext';
import { useSearch } from '../../context/SearchContext';

const CustomTabNavigator: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState('map');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme } = useSettings();
  const { searchState } = useSearch();
  const colors = getTheme(theme === 'dark');

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemPress = (key: string) => {
    setActiveScreen(key);
  };

  const renderScreen = () => {
    switch (activeScreen) {
      case 'map':
        return <MapScreen />;
      case 'routes':
        return <RoutesScreen />;
      case 'home':
        return <HomeScreen navigation={{ navigate: setActiveScreen }} />;
      case 'driver':
        return <DriverScreen navigation={{ navigate: setActiveScreen }} />;
      case 'settings':
        return <SettingsScreen navigation={{ navigate: setActiveScreen }} />;
      default:
        return <MapScreen />;
    }
  };

  return (
    <View style={{ 
      flex: 1, 
      backgroundColor: colors.gray100 
    }}>
      {/* Contenido de la pantalla */}
      <View style={{ flex: 1 }}>
        {renderScreen()}
      </View>

      {/* Botón hamburguesa - Ocultar si estamos en configuración, el menú está abierto, o el buscador está expandido */}
      {activeScreen !== 'settings' && !isMenuOpen && searchState !== 'expanded' && (
        <HamburgerButton 
          onPress={toggleMenu} 
          isOpen={isMenuOpen} 
        />
      )}

      {/* Menú lateral - Solo mostrar si no estamos en configuración */}
      {activeScreen !== 'settings' && (
        <HamburgerMenu
          isOpen={isMenuOpen}
          onToggle={toggleMenu}
          onItemPress={handleMenuItemPress}
          activeItem={activeScreen}
        />
      )}
    </View>
  );
};

export default CustomTabNavigator;