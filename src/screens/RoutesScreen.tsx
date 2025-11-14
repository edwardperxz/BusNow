import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BusNowColors, CommonStyles, getRouteColor, getTheme } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';
import RouteDetailScreen from './RouteDetailScreen';

interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  frequency: string;
  fare: string;
  status: 'active' | 'limited' | 'maintenance';
  activeBuses: number;
}

export default function RoutesScreen() {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [showRouteDetail, setShowRouteDetail] = useState(false);
  const { theme, t } = useSettings();
  const colors = getTheme(theme === 'dark');
  
  const routes: Route[] = [
    {
      id: '1',
      name: 'Ruta Centro',
      origin: 'Plaza Mayor',
      destination: 'Universidad',
      frequency: '5-8 min',
      fare: 'Q2.50',
      status: 'active',
      activeBuses: 2
    },
    {
      id: '2',
      name: 'Ruta Norte',
      origin: 'Terminal Norte',
      destination: 'Centro Comercial',
      frequency: '10-15 min',
      fare: 'Q3.00',
      status: 'active',
      activeBuses: 2
    },
    {
      id: '3',
      name: 'Ruta Sur',
      origin: 'Aeropuerto',
      destination: 'Zona Industrial',
      frequency: '15-20 min',
      fare: 'Q4.00',
      status: 'limited',
      activeBuses: 1
    },
  ];

  const handleRoutePress = (routeId: string) => {
    setSelectedRoute(routeId);
    setShowRouteDetail(true);
  };

  const handleBackFromDetail = () => {
    setShowRouteDetail(false);
    setSelectedRoute(null);
  };

  // Si se está mostrando el detalle, renderizar la pantalla correspondiente
  if (showRouteDetail) {
    return (
      <RouteDetailScreen 
        onBack={handleBackFromDetail}
      />
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return colors.primary;
      case 'limited': return colors.accent;
      case 'maintenance': return colors.secondaryLight;
      default: return colors.gray400;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa';
      case 'limited': return 'Servicio limitado';
      case 'maintenance': return 'Mantenimiento';
      default: return 'Desconocido';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray100 }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: CommonStyles.spacing.md }}>
        
        {/* Header con estadísticas */}
        <View style={{
          backgroundColor: colors.white,
          padding: CommonStyles.spacing.md,
          borderRadius: 8,
          marginTop: 100,
          marginBottom: CommonStyles.spacing.lg,
          ...CommonStyles.cardShadow
        }}>
          <Text style={{
            ...CommonStyles.typography.h3,
            color: colors.gray800,
            marginBottom: CommonStyles.spacing.sm
          }}>Resumen de rutas</Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                ...CommonStyles.typography.h2,
                color: colors.primary
              }}>{routes.length}</Text>
              <Text style={{
                ...CommonStyles.typography.small,
                color: colors.gray500
              }}>Rutas totales</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                ...CommonStyles.typography.h2,
                color: colors.secondary
              }}>{routes.reduce((acc, route) => acc + route.activeBuses, 0)}</Text>
              <Text style={{
                ...CommonStyles.typography.small,
                color: colors.gray500
              }}>Buses activos</Text>
            </View>
            <View style={{ alignItems: 'center' }}>
              <Text style={{
                ...CommonStyles.typography.h2,
                color: colors.accent
              }}>{routes.filter(r => r.status === 'active').length}</Text>
              <Text style={{
                ...CommonStyles.typography.small,
                color: colors.gray500
              }}>Operativas</Text>
            </View>
          </View>
        </View>

        {/* Botón para ver mockup de alta fidelidad */}
        <TouchableOpacity
          onPress={() => setShowRouteDetail(true)}
          style={{
            backgroundColor: colors.primary,
            padding: CommonStyles.spacing.md,
            borderRadius: 8,
            marginBottom: CommonStyles.spacing.lg,
            alignItems: 'center',
            ...CommonStyles.cardShadow
          }}
        >
          <Text style={{
            color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white,
            fontSize: 16,
            fontWeight: '600',
            marginBottom: 4
          }}>🗺️ Ver Detalle de Ruta (Mockup)</Text>
          <Text style={{
            color: (colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white) + '80',
            fontSize: 12
          }}>Pantalla de alta fidelidad - Ruta Boquete - David</Text>
        </TouchableOpacity>

        {/* Lista de rutas */}
        <View style={{ paddingBottom: CommonStyles.spacing.xl }}>
          <Text style={{
            ...CommonStyles.typography.h3,
            marginBottom: CommonStyles.spacing.md,
            color: colors.gray700
          }}>Rutas disponibles</Text>

          {routes.map((route, index) => (
            <TouchableOpacity
              key={route.id}
              onPress={() => handleRoutePress(route.id)}
              style={{
                backgroundColor: colors.white,
                padding: CommonStyles.spacing.md,
                borderRadius: 8,
                marginBottom: CommonStyles.spacing.sm,
                borderLeftWidth: 4,
                borderLeftColor: getRouteColor(index + 1),
                ...CommonStyles.cardShadow
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: CommonStyles.spacing.sm }}>
                <View style={{ flex: 1 }}>
                  <Text style={{
                    ...CommonStyles.typography.body,
                    fontWeight: '600',
                    color: colors.gray800,
                    marginBottom: CommonStyles.spacing.xs
                  }}>
                    🚌 {route.name}
                  </Text>
                  <Text style={{
                    ...CommonStyles.typography.caption,
                    color: colors.gray600
                  }}>
                    {route.origin} → {route.destination}
                  </Text>
                </View>
                
                <View style={{
                  backgroundColor: getStatusColor(route.status) + '20',
                  paddingHorizontal: CommonStyles.spacing.sm,
                  paddingVertical: CommonStyles.spacing.xs,
                  borderRadius: 12,
                  borderWidth: 1,
                  borderColor: getStatusColor(route.status)
                }}>
                  <Text style={{
                    ...CommonStyles.typography.small,
                    color: getStatusColor(route.status),
                    fontWeight: '500'
                  }}>
                    {getStatusText(route.status)}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', gap: CommonStyles.spacing.md }}>
                  <View>
                    <Text style={{
                      ...CommonStyles.typography.small,
                      color: colors.gray500
                    }}>Frecuencia</Text>
                    <Text style={{
                      ...CommonStyles.typography.caption,
                      fontWeight: '500',
                      color: colors.gray700
                    }}>{route.frequency}</Text>
                  </View>
                  <View>
                    <Text style={{
                      ...CommonStyles.typography.small,
                      color: colors.gray500
                    }}>Tarifa</Text>
                    <Text style={{
                      ...CommonStyles.typography.caption,
                      fontWeight: '500',
                      color: colors.gray700
                    }}>{route.fare}</Text>
                  </View>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={{
                    ...CommonStyles.typography.small,
                    color: colors.gray500
                  }}>Buses activos</Text>
                  <Text style={{
                    ...CommonStyles.typography.body,
                    fontWeight: '600',
                    color: getRouteColor(index + 1)
                  }}>{route.activeBuses}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
