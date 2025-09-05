// =============================================================================
// ROUTES SCREEN - MVP BusNow
// =============================================================================

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useUserLocation } from '../hooks/useAuth';
import { colors } from '../../styles/colors';
import { MOCK_ROUTES, MOCK_BUSES } from '../../data/mocks/mockData';
import { BusRoute, Bus } from '../../types';

interface RoutesScreenProps {
  navigation: any;
}

const RoutesScreen: React.FC<RoutesScreenProps> = ({ navigation }) => {
  const { location: userLocation } = useUserLocation();
  const [routes, setRoutes] = useState<BusRoute[]>(MOCK_ROUTES);
  const [buses, setBuses] = useState<Bus[]>(MOCK_BUSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadRoutes();
  }, []);

  const loadRoutes = async () => {
    setIsLoading(true);
    try {
      // Simular carga de datos
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRoutes(MOCK_ROUTES);
      setBuses(MOCK_BUSES);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar las rutas');
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRoutes();
    setRefreshing(false);
  };

  const getDistance = (route: BusRoute) => {
    if (!userLocation || route.coordinates.length === 0) return null;
    
    const firstStop = route.coordinates[0];
    const distance = Math.sqrt(
      Math.pow(userLocation.latitude - firstStop.latitude, 2) +
      Math.pow(userLocation.longitude - firstStop.longitude, 2)
    ) * 111; // Approximación en km
    
    return distance;
  };

  const getActiveBusesCount = (routeId: string) => {
    return buses.filter(bus => bus.routeId === routeId && bus.status === 'online').length;
  };

  const getNextArrival = (route: BusRoute) => {
    // Simular próxima llegada basada en frecuencia
    const randomMinutes = Math.floor(Math.random() * route.frequency);
    return randomMinutes;
  };

  const filteredRoutes = routes.filter(route => {
    const matchesSearch = route.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         route.shortName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         route.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         route.destination.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || route.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    // Ordenar por distancia si hay ubicación
    const distanceA = getDistance(a);
    const distanceB = getDistance(b);
    
    if (distanceA !== null && distanceB !== null) {
      return distanceA - distanceB;
    }
    return a.name.localeCompare(b.name);
  });

  const categories = [
    { key: 'all', label: 'Todas', icon: '🚌' },
    { key: 'urban', label: 'Urbana', icon: '🏙️' },
    { key: 'suburban', label: 'Suburbana', icon: '🏘️' },
    { key: 'intercity', label: 'Intercity', icon: '🛣️' },
    { key: 'express', label: 'Expreso', icon: '⚡' },
  ];

  const renderRouteItem = ({ item: route }: { item: BusRoute }) => {
    const distance = getDistance(route);
    const activeBuses = getActiveBusesCount(route.id);
    const nextArrival = getNextArrival(route);
    
    return (
      <TouchableOpacity
        style={styles.routeCard}
        onPress={() => navigation.navigate('Map', { selectedRouteId: route.id })}
      >
        <View style={styles.routeHeader}>
          <View style={[styles.routeBadge, { backgroundColor: route.color }]}>
            <Text style={styles.routeBadgeText}>{route.shortName}</Text>
          </View>
          <View style={styles.routeInfo}>
            <Text style={styles.routeName}>{route.name}</Text>
            <Text style={styles.routeDescription}>
              {route.origin} → {route.destination}
            </Text>
            {distance !== null && (
              <Text style={styles.distanceText}>
                📍 {distance.toFixed(1)} km de distancia
              </Text>
            )}
          </View>
          <View style={styles.routeActions}>
            <TouchableOpacity
              style={styles.favoriteButton}
              onPress={() => {
                Alert.alert('Favoritos', 'Funcionalidad de favoritos próximamente');
              }}
            >
              <Text style={styles.favoriteText}>⭐</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.routeStats}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Buses Activos</Text>
            <Text style={[styles.statValue, { color: activeBuses > 0 ? colors.success : colors.error }]}>
              {activeBuses}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Próximo</Text>
            <Text style={styles.statValue}>
              {nextArrival === 0 ? 'Ahora' : `${nextArrival}min`}
            </Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Tarifa</Text>
            <Text style={styles.statValue}>${route.fare}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Frecuencia</Text>
            <Text style={styles.statValue}>{route.frequency}min</Text>
          </View>
        </View>
        
        <View style={styles.routeTags}>
          <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(route.category) }]}>
            <Text style={styles.categoryText}>{getCategoryLabel(route.category)}</Text>
          </View>
          {route.isAccessible && (
            <View style={styles.accessibilityTag}>
              <Text style={styles.accessibilityText}>♿ Accesible</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'urban': return colors.primary.main;
      case 'suburban': return colors.info;
      case 'intercity': return colors.success;
      case 'express': return colors.warning;
      default: return colors.gray[400];
    }
  };

  const getCategoryLabel = (category: string) => {
    return categories.find(cat => cat.key === category)?.label || category;
  };

  const renderCategoryFilter = () => (
    <View style={styles.categoryFilter}>
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={categories}
        keyExtractor={(item) => item.key}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === item.key && styles.categoryButtonActive
            ]}
            onPress={() => setSelectedCategory(item.key)}
          >
            <Text style={styles.categoryIcon}>{item.icon}</Text>
            <Text style={[
              styles.categoryLabel,
              selectedCategory === item.key && styles.categoryLabelActive
            ]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );

  const renderHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.title}>Rutas Disponibles</Text>
      <Text style={styles.subtitle}>
        {filteredRoutes.length} rutas encontradas
      </Text>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <Text style={styles.searchIcon}>🔍</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar rutas, paradas o destinos..."
        placeholderTextColor={colors.text.secondary}
        value={searchQuery}
        onChangeText={setSearchQuery}
      />
      {searchQuery.length > 0 && (
        <TouchableOpacity
          style={styles.clearButton}
          onPress={() => setSearchQuery('')}
        >
          <Text style={styles.clearButtonText}>✕</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>🚌</Text>
      <Text style={styles.emptyTitle}>No se encontraron rutas</Text>
      <Text style={styles.emptyMessage}>
        Intenta con otros términos de búsqueda o verifica tu conexión
      </Text>
      <TouchableOpacity style={styles.retryButton} onPress={loadRoutes}>
        <Text style={styles.retryText}>Reintentar</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading && routes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary.main} />
          <Text style={styles.loadingText}>Cargando rutas...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      {renderCategoryFilter()}
      
      <FlatList
        data={filteredRoutes}
        keyExtractor={(item) => item.id}
        renderItem={renderRouteItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary.main]}
            tintColor={colors.primary.main}
          />
        }
        ListEmptyComponent={renderEmptyState}
        showsVerticalScrollIndicator={false}
      />
      
      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('Map')}
      >
        <Text style={styles.fabText}>🗺️</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background.primary,
  },
  headerContainer: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    margin: 20,
    marginTop: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.background.secondary,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  searchIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.text.primary,
  },
  clearButton: {
    padding: 4,
  },
  clearButtonText: {
    fontSize: 16,
    color: colors.text.secondary,
  },
  categoryFilter: {
    marginBottom: 10,
    paddingHorizontal: 16,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    borderWidth: 1,
    borderColor: colors.gray[300],
  },
  categoryButtonActive: {
    backgroundColor: colors.primary.main,
    borderColor: colors.primary.main,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.text.secondary,
  },
  categoryLabelActive: {
    color: colors.text.white,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  routeCard: {
    backgroundColor: colors.background.primary,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.gray[200],
    shadowColor: colors.cardShadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  routeBadge: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  routeBadgeText: {
    color: colors.text.white,
    fontSize: 14,
    fontWeight: 'bold',
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 2,
  },
  routeDescription: {
    fontSize: 14,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  distanceText: {
    fontSize: 12,
    color: colors.info,
  },
  routeActions: {
    alignItems: 'center',
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.background.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteText: {
    fontSize: 20,
  },
  routeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    paddingHorizontal: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
  },
  routeTags: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.white,
  },
  accessibilityTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: colors.success,
  },
  accessibilityText: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.white,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text.primary,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: colors.primary.main,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryText: {
    color: colors.text.white,
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary.main,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  fabText: {
    fontSize: 24,
  },
});

export default RoutesScreen;
