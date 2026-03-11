import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CommonStyles, getTheme } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';
import RouteDetailScreen from './RouteDetailScreen';
import { useRoutesData } from '../features/routes/hooks/useRoutesData';
import RoutesSummaryCard from '../features/routes/components/RoutesSummaryCard';
import RouteCard from '../features/routes/components/RouteCard';
import RoutesListState from '../features/routes/components/RoutesListState';

export default function RoutesScreen() {
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [showRouteDetail, setShowRouteDetail] = useState(false);
  const { theme, t } = useSettings();
  const colors = getTheme(theme === 'dark');
  const { routes, loading } = useRoutesData();

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
        routeId={selectedRoute ?? undefined}
        onBack={handleBackFromDetail}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray100 }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: CommonStyles.spacing.md }}>
        <RoutesSummaryCard colors={colors} routes={routes} />

        {/* Botón para ver mockup de alta fidelidad */}
        <TouchableOpacity
          onPress={() => {
            setSelectedRoute(routes[0]?.id ?? null);
            setShowRouteDetail(true);
          }}
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
          }}>🗺️ {t('routes.viewRouteDetailMock')} (Mockup)</Text>
          <Text style={{
            color: (colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white) + '80',
            fontSize: 12
          }}>{t('routes.highFidelityMockLabel')}</Text>
        </TouchableOpacity>

        {/* Lista de rutas */}
        <View style={{ paddingBottom: CommonStyles.spacing.xl }}>
          <Text style={{
            ...CommonStyles.typography.h3,
            marginBottom: CommonStyles.spacing.md,
            color: colors.gray700
          }}>{t('routes.availableRoutes')}</Text>

          <RoutesListState colors={colors} loading={loading} isEmpty={!loading && routes.length === 0} />

          {routes.map((route, index) => (
            <RouteCard
              key={route.id}
              route={route}
              index={index}
              colors={colors}
              onPress={handleRoutePress}
            />
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
