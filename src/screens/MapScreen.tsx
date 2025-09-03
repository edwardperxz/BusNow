import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { BusNowColors } from '../styles/colors';

const MapScreen: React.FC = () => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Text style={styles.mapIcon}>🗺️</Text>
        </View>
        
        <Text style={styles.title}>Mapa Interactivo</Text>
        <Text style={styles.subtitle}>
          Próximamente tendrás acceso al mapa interactivo con tracking en tiempo real de todos los buses
        </Text>
        
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>📍</Text>
            <Text style={styles.featureText}>Ubicación en tiempo real</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🚌</Text>
            <Text style={styles.featureText}>Seguimiento de buses</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>🛣️</Text>
            <Text style={styles.featureText}>Rutas trazadas</Text>
          </View>
          
          <View style={styles.featureItem}>
            <Text style={styles.featureIcon}>⏱️</Text>
            <Text style={styles.featureText}>Tiempos de llegada</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.comingSoonButton}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>🔜 Próximamente</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: BusNowColors.primary + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  mapIcon: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: BusNowColors.text.primary,
    marginBottom: 16,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: BusNowColors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 40,
  },
  featuresList: {
    width: '100%',
    marginBottom: 40,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 24,
    marginRight: 16,
  },
  featureText: {
    fontSize: 16,
    fontWeight: '600',
    color: BusNowColors.text.primary,
  },
  comingSoonButton: {
    backgroundColor: BusNowColors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default MapScreen;