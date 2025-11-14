import React, { useState } from 'react';
import { View, ActivityIndicator } from 'react-native';

import MapScreen from '../../screens/MapScreen';
import RoutesScreen from '../../screens/RoutesScreen';
import HomeScreen from '../../screens/HomeScreen';
import DriverScreen from '../../screens/DriverScreen';
import SettingsScreen from '../../screens/SettingsScreen';
import LoginScreen from '../../screens/LoginScreen';
import RegisterScreen from '../../screens/RegisterScreen';
import HamburgerMenu from './HamburgerMenu';
import HamburgerButton from './HamburgerButton';
import { BusNowColors, getTheme } from '../../styles/colors';
import { useSettings } from '../../context/SettingsContext';
import { useSearch } from '../../context/SearchContext';
import { useAuth } from '../../context/AuthContext';

const CustomTabNavigator: React.FC = () => {
  const { user, profile, loading, isAnonymous, continueAsGuest, signOut } = useAuth();
  const [activeScreen, setActiveScreen] = useState('map');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');
  const { theme } = useSettings();
  const { searchState } = useSearch();
  const colors = getTheme(theme === 'dark');

  // Crear usuario anónimo automáticamente si no hay ningún usuario
  React.useEffect(() => {
    if (!loading && !profile && !isAnonymous && !user) {
      continueAsGuest();
    }
  }, [loading, profile, isAnonymous, user, continueAsGuest]);

  // Mostrar loader mientras verifica autenticación
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.gray100 }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuItemPress = (key: string) => {
    // Si se selecciona login o register, cambiar la pantalla de auth
    if (key === 'login') {
      setAuthScreen('login');
      setActiveScreen('auth');
    } else if (key === 'register') {
      setAuthScreen('register');
      setActiveScreen('auth');
    } else if (key === 'driver') {
      // Solo permitir acceso a DriverScreen si es conductor autenticado
      if (profile?.role === 'driver') {
        setActiveScreen('driver');
      } else {
        // Si no es conductor, redirigir a login
        setAuthScreen('login');
        setActiveScreen('auth');
      }
    } else {
      setActiveScreen(key);
    }
  };

  const renderScreen = () => {
    // Pantalla de autenticación
    if (activeScreen === 'auth') {
      if (authScreen === 'register') {
        return <RegisterScreen navigation={{ 
          navigate: (screen: string) => {
            if (screen === 'Login') {
              setAuthScreen('login');
            } else {
              setActiveScreen('map');
            }
          }
        }} />;
      }
      return <LoginScreen navigation={{ 
        navigate: (screen: string) => {
          if (screen === 'Register') {
            setAuthScreen('register');
          } else {
            setActiveScreen('map');
          }
        }
      }} />;
    }

    // Pantalla de conductor (solo si está autenticado como driver)
    if (activeScreen === 'driver') {
      if (profile?.role === 'driver') {
        return <DriverScreen />;
      } else {
        // Si no es conductor, redirigir a mapa
        setActiveScreen('map');
        return <MapScreen />;
      }
    }

    // Pantallas normales (disponibles para todos)
    switch (activeScreen) {
      case 'map':
        return <MapScreen />;
      case 'routes':
        return <RoutesScreen />;
      case 'home':
        return <HomeScreen navigation={{ navigate: setActiveScreen }} />;
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

      {/* Botón hamburguesa - Ocultar si estamos en configuración, auth, el menú está abierto, o el buscador está expandido */}
      {activeScreen !== 'settings' && activeScreen !== 'auth' && !isMenuOpen && searchState !== 'expanded' && (
        <HamburgerButton 
          onPress={toggleMenu} 
          isOpen={isMenuOpen} 
        />
      )}

      {/* Menú lateral - Solo mostrar si no estamos en configuración */}
      {activeScreen !== 'settings' && activeScreen !== 'auth' && (
        <HamburgerMenu
          isOpen={isMenuOpen}
          onToggle={toggleMenu}
          onItemPress={handleMenuItemPress}
          activeItem={activeScreen}
          userProfile={profile}
          isAnonymous={isAnonymous}
          onLogout={async () => {
            await signOut();
            setActiveScreen('map');
          }}
        />
      )}
    </View>
  );
};

export default CustomTabNavigator;