// =============================================================================
// HOME SCREEN - MVP BusNow
// =============================================================================

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../hooks/useAuth';
import { useAppSelector, useAppDispatch } from '../../store';
import { fetchRoutes, selectAllRoutes, selectRouteLoading } from '../../store/routeSlice';
import { colors } from '../../styles/colors';
import { BusRoute } from '../../types';

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { user, isAuthenticated, isAnonymous, signInAnonymous } = useAuth();
  const dispatch = useAppDispatch();
  
  const routes = useAppSelector((state) => (state.routes as any).routes || []);
  const isLoading = useAppSelector((state) => (state.routes as any).isLoading || false);
  const [favoriteRoutes, setFavoriteRoutes] = useState<BusRoute[]>([]);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Si no hay usuario autenticado, iniciar sesión anónima
      if (!isAuthenticated) {
        await signInAnonymous();
      }
      
      // Cargar rutas disponibles
      dispatch(fetchRoutes());
    } catch (error) {
      console.error('Error initializing app:', error);
      Alert.alert('Error', 'No se pudo cargar la información inicial');
    }
  };

  const navigateToMap = (routeId?: string) => {
    navigation.navigate('Map', { selectedRouteId: routeId });
  };

  const navigateToRoutes = () => {
    navigation.navigate('Routes');
  };

  const navigateToDriverLogin = () => {
    navigation.navigate('DriverLogin');
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Cargando BusNow...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>🚌 BusNow</Text>
          <Text style={styles.subtitle}>
            {isAnonymous ? 'Modo Visitante' : `Hola, ${user?.name || 'Usuario'}`}
          </Text>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Acceso Rápido</Text>
          
          <TouchableOpacity 
            style={[styles.actionCard, styles.primaryAction]} 
            onPress={() => navigateToMap()}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>🗺️</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Ver Mapa</Text>
              <Text style={styles.actionSubtitle}>
                Encuentra buses en tiempo real
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionCard} 
            onPress={navigateToRoutes}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>📋</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Ver Rutas</Text>
              <Text style={styles.actionSubtitle}>
                Explora todas las rutas disponibles
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Featured Routes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Rutas Principales</Text>
          
          {routes.slice(0, 3).map((route: BusRoute) => (
            <TouchableOpacity
              key={route.id}
              style={styles.routeCard}
              onPress={() => navigateToMap(route.id)}
            >
              <View style={[styles.routeBadge, { backgroundColor: route.color }]}>
                <Text style={styles.routeBadgeText}>{route.shortName}</Text>
              </View>
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{route.name}</Text>
                <Text style={styles.routeDescription}>
                  {route.origin} → {route.destination}
                </Text>
                <Text style={styles.routeFare}>Tarifa: ${route.fare}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Driver Access */}
        <View style={styles.section}>
          <TouchableOpacity 
            style={[styles.actionCard, styles.driverAction]} 
            onPress={navigateToDriverLogin}
          >
            <View style={styles.actionIcon}>
              <Text style={styles.actionIconText}>👨‍💼</Text>
            </View>
            <View style={styles.actionContent}>
              <Text style={styles.actionTitle}>Acceso Conductor</Text>
              <Text style={styles.actionSubtitle}>
                Iniciar transmisión de ubicación
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Info Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {isAnonymous 
              ? 'Usando BusNow como visitante. Los datos se registran para mejorar el servicio.'
              : 'Datos sincronizados y guardados en tu cuenta.'
            }
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.text.secondary,
  },
  header: {
    marginBottom: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colors.primary.main,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 12,
  },
  actionCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryAction: {
    borderColor: colors.primary.main,
    borderWidth: 2,
  },
  driverAction: {
    borderColor: colors.secondary.main,
    borderWidth: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.gray[100],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
    justifyContent: 'center',
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  routeCard: {
    flexDirection: 'row',
    backgroundColor: colors.background.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: colors.gray[200],
    alignItems: 'center',
  },
  routeBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeBadgeText: {
    color: colors.text.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  routeDescription: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  routeFare: {
    fontSize: 12,
    color: colors.success,
    fontWeight: '500',
  },
  footer: {
    marginTop: 24,
    padding: 16,
    backgroundColor: colors.gray[50],
    borderRadius: 8,
  },
  footerText: {
    fontSize: 12,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 16,
  },
});

export default HomeScreen;
