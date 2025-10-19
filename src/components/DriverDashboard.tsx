import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { BusNowColors, CommonStyles, getTheme } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';

interface DriverDashboardProps {
  driverName?: string;
  busNumber?: string;
  onLogout?: () => void;
  onBackToMap?: () => void;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({
  driverName = 'Conductor',
  busNumber = 'BUS-001',
  onLogout,
  onBackToMap,
}) => {
  const [isOnDuty, setIsOnDuty] = useState(false);
  const [currentRoute, setCurrentRoute] = useState('Ruta Centro - Universidad');
  const [passengersCount, setPassengersCount] = useState(12);
  const [gpsTracking, setGpsTracking] = useState(false);
  const { theme, t } = useSettings();
  const colors = getTheme(theme === 'dark');

  useEffect(() => {
    // Simular actualización de pasajeros cada 30 segundos cuando está en servicio
    if (isOnDuty) {
      const interval = setInterval(() => {
        setPassengersCount(prev => Math.max(0, prev + Math.floor(Math.random() * 6) - 2));
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [isOnDuty]);

  const handleToggleDuty = () => {
    if (!isOnDuty) {
      Alert.alert(
        'Iniciar Servicio',
        '¿Estás listo para comenzar tu recorrido?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Iniciar',
            onPress: () => {
              setIsOnDuty(true);
              setGpsTracking(true);
              Alert.alert('Servicio Activo', 'GPS activado. ¡Buen recorrido!');
            }
          }
        ]
      );
    } else {
      Alert.alert(
        'Finalizar Servicio',
        '¿Deseas terminar tu turno?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Finalizar',
            onPress: () => {
              setIsOnDuty(false);
              setGpsTracking(false);
              setPassengersCount(0);
              Alert.alert('Servicio Finalizado', 'Turno completado exitosamente.');
            }
          }
        ]
      );
    }
  };

  const handleEmergencyStop = () => {
    Alert.alert(
      'Parada de Emergencia',
      'Esta acción notificará a control central',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Confirmar',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Emergencia Reportada', 'Control central ha sido notificado.');
          }
        }
      ]
    );
  };

  const handleReportIncident = () => {
    Alert.alert(
      'Reportar Incidente',
      'Selecciona el tipo de incidente:',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Falla Mecánica', onPress: () => reportIncident('Falla Mecánica') },
        { text: 'Accidente Menor', onPress: () => reportIncident('Accidente Menor') },
        { text: 'Clima Adverso', onPress: () => reportIncident('Clima Adverso') },
        { text: 'Otro', onPress: () => reportIncident('Otro') },
      ]
    );
  };

  const reportIncident = (type: string) => {
    Alert.alert('Incidente Reportado', `${type} reportado a control central.`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.driverInfo}>
            <Text style={styles.welcomeText}>¡Hola {driverName}!</Text>
            <Text style={styles.busNumber}>{busNumber}</Text>
            <Text style={styles.routeText}>{currentRoute}</Text>
          </View>
          <View style={[
            styles.statusBadge,
            { backgroundColor: isOnDuty ? BusNowColors.primary : BusNowColors.gray400 }
          ]}>
            <Text style={styles.statusText}>
              {isOnDuty ? '🟢 En Servicio' : '🔴 Fuera de Servicio'}
            </Text>
          </View>
        </View>

        {/* Toggle Service */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Estado del Servicio</Text>
            <Switch
              value={isOnDuty}
              onValueChange={handleToggleDuty}
              trackColor={{
                false: BusNowColors.gray300,
                true: BusNowColors.primary
              }}
              thumbColor={isOnDuty ? BusNowColors.white : BusNowColors.gray400}
            />
          </View>
          <Text style={styles.cardDescription}>
            {isOnDuty 
              ? 'Tu bus está activo y siendo rastreado en tiempo real'
              : 'Activa el servicio para comenzar tu recorrido'
            }
          </Text>
        </View>

        {/* GPS Tracking */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Tracking GPS</Text>
            <View style={[
              styles.indicator,
              { backgroundColor: gpsTracking ? BusNowColors.primary : BusNowColors.gray400 }
            ]} />
          </View>
          <Text style={styles.cardDescription}>
            {gpsTracking 
              ? '📍 Ubicación siendo transmitida'
              : '📍 GPS desactivado'
            }
          </Text>
        </View>

        {/* Passenger Count */}
        {isOnDuty && (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Pasajeros Actuales</Text>
              <Text style={styles.passengerCount}>{passengersCount}</Text>
            </View>
            <Text style={styles.cardDescription}>
              Conteo estimado basado en sensores del bus
            </Text>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.actionsContainer}>
          <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.emergencyButton]}
            onPress={handleEmergencyStop}
          >
            <Text style={styles.emergencyButtonText}>🚨 Parada de Emergencia</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.reportButton]}
            onPress={handleReportIncident}
          >
            <Text style={styles.reportButtonText}>📋 Reportar Incidente</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, styles.mapButton]}
            onPress={onBackToMap}
          >
            <Text style={styles.mapButtonText}>🗺️ Ver Mapa</Text>
          </TouchableOpacity>
        </View>

        {/* Logout */}
        <View style={styles.logoutContainer}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={onLogout}
          >
            <Text style={styles.logoutButtonText}>Cerrar Sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BusNowColors.gray100,
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: CommonStyles.spacing.md,
  },
  header: {
    backgroundColor: BusNowColors.white,
    borderRadius: CommonStyles.borderRadius.large,
    padding: CommonStyles.spacing.lg,
    marginTop: CommonStyles.spacing.md,
    marginBottom: CommonStyles.spacing.lg,
    ...CommonStyles.cardShadow,
  },
  driverInfo: {
    marginBottom: CommonStyles.spacing.md,
  },
  welcomeText: {
    ...CommonStyles.typography.h2,
    color: BusNowColors.primary,
    marginBottom: CommonStyles.spacing.xs,
  },
  busNumber: {
    ...CommonStyles.typography.h3,
    color: BusNowColors.gray700,
    marginBottom: CommonStyles.spacing.xs,
  },
  routeText: {
    ...CommonStyles.typography.body,
    color: BusNowColors.gray500,
  },
  statusBadge: {
    paddingHorizontal: CommonStyles.spacing.md,
    paddingVertical: CommonStyles.spacing.sm,
    borderRadius: CommonStyles.borderRadius.medium,
    alignSelf: 'flex-start',
  },
  statusText: {
    color: BusNowColors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    backgroundColor: BusNowColors.white,
    borderRadius: CommonStyles.borderRadius.large,
    padding: CommonStyles.spacing.lg,
    marginBottom: CommonStyles.spacing.md,
    ...CommonStyles.cardShadow,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: CommonStyles.spacing.sm,
  },
  cardTitle: {
    ...CommonStyles.typography.h3,
    color: BusNowColors.gray800,
  },
  cardDescription: {
    ...CommonStyles.typography.body,
    color: BusNowColors.gray500,
  },
  indicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  passengerCount: {
    ...CommonStyles.typography.h2,
    color: BusNowColors.primary,
    fontWeight: '700',
  },
  actionsContainer: {
    marginTop: CommonStyles.spacing.lg,
    marginBottom: CommonStyles.spacing.lg,
  },
  sectionTitle: {
    ...CommonStyles.typography.h3,
    color: BusNowColors.gray800,
    marginBottom: CommonStyles.spacing.md,
  },
  actionButton: {
    borderRadius: CommonStyles.borderRadius.large,
    paddingVertical: CommonStyles.spacing.md,
    paddingHorizontal: CommonStyles.spacing.lg,
    marginBottom: CommonStyles.spacing.sm,
    alignItems: 'center',
    ...CommonStyles.cardShadow,
  },
  emergencyButton: {
    backgroundColor: '#DC2626',
  },
  emergencyButtonText: {
    color: BusNowColors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  reportButton: {
    backgroundColor: BusNowColors.accent,
  },
  reportButtonText: {
    color: BusNowColors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  mapButton: {
    backgroundColor: BusNowColors.secondary,
  },
  mapButtonText: {
    color: BusNowColors.white,
    fontWeight: '600',
    fontSize: 16,
  },
  logoutContainer: {
    paddingBottom: CommonStyles.spacing.xxl,
  },
  logoutButton: {
    borderRadius: CommonStyles.borderRadius.large,
    paddingVertical: CommonStyles.spacing.md,
    paddingHorizontal: CommonStyles.spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BusNowColors.gray300,
    backgroundColor: BusNowColors.white,
  },
  logoutButtonText: {
    color: BusNowColors.gray600,
    fontWeight: '500',
    fontSize: 16,
  },
});

export default DriverDashboard;