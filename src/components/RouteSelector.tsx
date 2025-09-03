import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Dimensions,
} from 'react-native';
import { BusRoute } from '../types';

interface RouteSelectorProps {
  routes: BusRoute[];
  selectedRouteId?: string;
  onRouteSelect: (routeId: string) => void;
}

const { width } = Dimensions.get('window');

const RouteSelector: React.FC<RouteSelectorProps> = ({
  routes,
  selectedRouteId,
  onRouteSelect,
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const handleRouteSelect = (routeId: string) => {
    onRouteSelect(routeId);
    setIsModalVisible(false);
  };

  const getSelectedRoute = () => {
    return routes.find(route => route.id === selectedRouteId);
  };

  return (
    <>
      {/* Botón flotante para abrir selector */}
      <TouchableOpacity
        style={styles.floatingButton}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.floatingButtonText}>
          {getSelectedRoute()?.name || 'Seleccionar Ruta'}
        </Text>
      </TouchableOpacity>

      {/* Modal con lista de rutas */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Seleccionar Ruta</Text>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.routesList}>
              {/* Opción para ver todas las rutas */}
              <TouchableOpacity
                style={[
                  styles.routeItem,
                  !selectedRouteId && styles.selectedRouteItem
                ]}
                onPress={() => {
                  onRouteSelect('');
                  setIsModalVisible(false);
                }}
              >
                <View style={[styles.routeColor, { backgroundColor: '#9E9E9E' }]} />
                <View style={styles.routeInfo}>
                  <Text style={styles.routeName}>Todas las rutas</Text>
                  <Text style={styles.routeDescription}>Ver todos los buses</Text>
                </View>
              </TouchableOpacity>

              {/* Lista de rutas */}
              {routes.map((route) => (
                <TouchableOpacity
                  key={route.id}
                  style={[
                    styles.routeItem,
                    selectedRouteId === route.id && styles.selectedRouteItem
                  ]}
                  onPress={() => handleRouteSelect(route.id)}
                >
                  <View style={[styles.routeColor, { backgroundColor: route.color }]} />
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeName}>{route.name}</Text>
                    <Text style={styles.routeDescription}>{route.description}</Text>
                    <Text style={styles.routeDetails}>
                      {route.stops.length} paradas • Cada {route.frequency} min
                    </Text>
                    <Text style={styles.routeHours}>
                      Horario: {route.operatingHours.start} - {route.operatingHours.end}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  floatingButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 1000,
  },
  floatingButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2196F3',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#757575',
    fontWeight: 'bold',
  },
  routesList: {
    flex: 1,
    padding: 20,
  },
  routeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedRouteItem: {
    borderColor: '#2196F3',
    backgroundColor: '#E3F2FD',
  },
  routeColor: {
    width: 20,
    height: 60,
    borderRadius: 10,
    marginRight: 16,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 4,
  },
  routeDescription: {
    fontSize: 14,
    color: '#546E7A',
    marginBottom: 4,
  },
  routeDetails: {
    fontSize: 12,
    color: '#78909C',
    marginBottom: 2,
  },
  routeHours: {
    fontSize: 12,
    color: '#78909C',
  },
});

export default RouteSelector;
