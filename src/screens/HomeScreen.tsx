import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BusNowColors } from '../styles/colors';

const { width } = Dimensions.get('window');

const HomeScreen: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [activeBuses] = useState(3);
  const [totalRoutes] = useState(2);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simular actualización de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  };

  const getNextArrival = () => {
    const randomMinutes = Math.floor(Math.random() * 15) + 1;
    return `${randomMinutes} min`;
  };

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={[BusNowColors.primary]}
          tintColor={BusNowColors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header mejorado */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>🚌 BusNow</Text>
          <Text style={styles.headerSubtitle}>Tracking en tiempo real</Text>
        </View>
        <View style={styles.headerDecoration} />
      </View>

      {/* Stats Cards mejoradas */}
      <View style={styles.statsSection}>
        <View style={styles.statsContainer}>
          <View style={[styles.statCard, styles.statCardFirst]}>
            <View style={[styles.statIcon, { backgroundColor: BusNowColors.primary + '20' }]}>
              <Text style={styles.statIconText}>🚌</Text>
            </View>
            <Text style={[styles.statNumber, { color: BusNowColors.primary }]}>{activeBuses}</Text>
            <Text style={styles.statLabel}>Buses Activos</Text>
          </View>
          
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: BusNowColors.secondaryStrong + '20' }]}>
              <Text style={styles.statIconText}>🛣️</Text>
            </View>
            <Text style={[styles.statNumber, { color: BusNowColors.secondaryStrong }]}>{totalRoutes}</Text>
            <Text style={styles.statLabel}>Rutas</Text>
          </View>
          
          <View style={[styles.statCard, styles.statCardLast]}>
            <View style={[styles.statIcon, { backgroundColor: BusNowColors.highlight + '20' }]}>
              <Text style={styles.statIconText}>⏱️</Text>
            </View>
            <Text style={[styles.statNumber, { color: BusNowColors.highlight }]}>{getNextArrival()}</Text>
            <Text style={styles.statLabel}>Próximo Bus</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions mejoradas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
        <View style={styles.actionGrid}>
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: BusNowColors.primary }]}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>🗺️</Text>
            </View>
            <Text style={styles.actionText}>Ver Mapa</Text>
            <Text style={styles.actionSubtext}>Tiempo real</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: BusNowColors.secondaryStrong }]}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>🚌</Text>
            </View>
            <Text style={styles.actionText}>Rutas</Text>
            <Text style={styles.actionSubtext}>Ver todas</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, { backgroundColor: BusNowColors.highlight }]}
            activeOpacity={0.8}
          >
            <View style={styles.actionIconContainer}>
              <Text style={styles.actionIcon}>⏰</Text>
            </View>
            <Text style={styles.actionText}>Horarios</Text>
            <Text style={styles.actionSubtext}>Consultar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Routes mejoradas */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Rutas Populares</Text>
          <TouchableOpacity>
            <Text style={[styles.seeAllText, { color: BusNowColors.primary }]}>Ver todas</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.routeCard}>
          <View style={styles.routeHeader}>
            <View style={[styles.routeIndicator, { backgroundColor: BusNowColors.routes.line1 }]} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeName}>Línea 1 - Centro</Text>
              <Text style={styles.routeDescription}>Centro - Universidad - Hospital</Text>
            </View>
            <View style={styles.routeStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Activo</Text>
            </View>
          </View>
          <View style={styles.routeDetails}>
            <View style={styles.routeDetail}>
              <Text style={styles.routeDetailIcon}>🚏</Text>
              <Text style={styles.routeDetailText}>4 paradas</Text>
            </View>
            <View style={styles.routeDetail}>
              <Text style={styles.routeDetailIcon}>⏱️</Text>
              <Text style={styles.routeDetailText}>Cada 15 min</Text>
            </View>
            <View style={styles.routeDetail}>
              <Text style={styles.routeDetailIcon}>📍</Text>
              <Text style={styles.routeDetailText}>2.5 km</Text>
            </View>
          </View>
        </View>

        <View style={styles.routeCard}>
          <View style={styles.routeHeader}>
            <View style={[styles.routeIndicator, { backgroundColor: BusNowColors.routes.line2 }]} />
            <View style={styles.routeInfo}>
              <Text style={styles.routeName}>Línea 2 - Norte</Text>
              <Text style={styles.routeDescription}>Terminal Norte - Centro Comercial</Text>
            </View>
            <View style={styles.routeStatus}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Activo</Text>
            </View>
          </View>
          <View style={styles.routeDetails}>
            <View style={styles.routeDetail}>
              <Text style={styles.routeDetailIcon}>🚏</Text>
              <Text style={styles.routeDetailText}>3 paradas</Text>
            </View>
            <View style={styles.routeDetail}>
              <Text style={styles.routeDetailIcon}>⏱️</Text>
              <Text style={styles.routeDetailText}>Cada 20 min</Text>
            </View>
            <View style={styles.routeDetail}>
              <Text style={styles.routeDetailIcon}>📍</Text>
              <Text style={styles.routeDetailText}>1.8 km</Text>
            </View>
          </View>
        </View>
      </View>

      {/* Footer mejorado */}
      <View style={styles.footer}>
        <View style={styles.footerContent}>
          <Text style={styles.footerText}>🔄 Desliza hacia abajo para actualizar</Text>
          <Text style={styles.footerSubtext}>Última actualización: Ahora</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  
  // Header styles
  header: {
    backgroundColor: BusNowColors.background.dark,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  headerContent: {
    alignItems: 'center',
    zIndex: 2,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '500',
  },
  headerDecoration: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Stats styles
  statsSection: {
    paddingHorizontal: 20,
    marginTop: -20,
    zIndex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 6,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statCardFirst: {
    borderRightWidth: 1,
    borderRightColor: '#F0F0F0',
  },
  statCardLast: {
    borderLeftWidth: 1,
    borderLeftColor: '#F0F0F0',
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  statIconText: {
    fontSize: 20,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    textAlign: 'center',
  },
  
  // Section styles
  section: {
    paddingHorizontal: 20,
    marginTop: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Action buttons
  actionGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  actionIconContainer: {
    marginBottom: 12,
  },
  actionIcon: {
    fontSize: 28,
  },
  actionText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  actionSubtext: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  
  // Route cards
  routeCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  routeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  routeIndicator: {
    width: 4,
    height: 50,
    borderRadius: 2,
    marginRight: 16,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 4,
  },
  routeDescription: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  routeStatus: {
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  routeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  routeDetail: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  routeDetailIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  routeDetailText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  
  // Footer
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
  },
  footerContent: {
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 4,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default HomeScreen;
