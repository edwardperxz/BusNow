import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BusNowColors, CommonStyles, getTheme } from '../styles/colors';
import { useSettings } from '../context/SettingsContext';

export default function HomeScreen({ navigation }: any) {
  const { theme, t } = useSettings();
  const colors = getTheme(theme === 'dark');

  const quickActions = [
    {
      id: 'map',
      title: 'Ver Mapa en Tiempo Real',
      subtitle: 'Encuentra buses cerca de ti',
      icon: '🗺️',
      color: colors.primary,
      onPress: () => navigation.navigate('map'),
    },
    {
      id: 'routes',
      title: 'Explorar Rutas',
      subtitle: 'Descubre todas las líneas disponibles',
      icon: '🚌',
      color: colors.secondary,
      onPress: () => navigation.navigate('routes'),
    },
    {
      id: 'driver',
      title: 'Panel de Conductor',
      subtitle: 'Herramientas para conductores',
      icon: '👨‍💼',
      color: colors.accent,
      onPress: () => navigation.navigate('driver'),
    },
  ];

  const stats = [
    { label: 'Buses Activos', value: '24', color: colors.primary },
    { label: 'Rutas Disponibles', value: '8', color: colors.secondary },
    { label: 'Tiempo Promedio', value: '12min', color: colors.accent },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray100 }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: CommonStyles.spacing.md, paddingTop: 100 }}>
        {/* Header amigable y minimalista */}
        <View style={{
          alignItems: 'center',
          marginBottom: CommonStyles.spacing.xxl,
          paddingTop: CommonStyles.spacing.lg,
        }}>
          <View style={{
            backgroundColor: colors.primary,
            width: 80,
            height: 80,
            borderRadius: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: CommonStyles.spacing.lg,
            ...CommonStyles.softShadow,
          }}>
            <Text style={{ fontSize: 36, color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white }}>🚌</Text>
          </View>
          
          <Text style={{
            ...CommonStyles.typography.h1,
            color: colors.primary,
            marginBottom: CommonStyles.spacing.sm,
            textAlign: 'center',
          }}>
            ¡Hola! 👋
          </Text>
          <Text style={{
            ...CommonStyles.typography.body,
            textAlign: 'center',
            maxWidth: 300,
            color: colors.gray600,
          }}>
            Bienvenido a BusNow, tu compañero de viaje inteligente
          </Text>
        </View>

        {/* Estadísticas rápidas */}
        <View style={{
          flexDirection: 'row',
          marginBottom: CommonStyles.spacing.xxl,
          paddingHorizontal: CommonStyles.spacing.xs,
        }}>
          {stats.map((stat, index) => (
            <View key={index} style={{
              flex: 1,
              backgroundColor: colors.white,
              borderRadius: CommonStyles.borderRadius.medium,
              padding: CommonStyles.spacing.md,
              marginHorizontal: CommonStyles.spacing.xs,
              alignItems: 'center',
              ...CommonStyles.softShadow,
            }}>
              <Text style={{
                ...CommonStyles.typography.h2,
                color: stat.color,
                marginBottom: 4,
              }}>
                {stat.value}
              </Text>
              <Text style={{
                ...CommonStyles.typography.small,
                color: colors.gray600,
                textAlign: 'center',
                lineHeight: 16,
              }}>
                {stat.label}
              </Text>
            </View>
          ))}
        </View>

        {/* Acciones rápidas - Diseño moderno y amigable */}
        <View style={{ marginBottom: CommonStyles.spacing.xxl }}>
          <Text style={{
            ...CommonStyles.typography.h3,
            marginBottom: CommonStyles.spacing.lg,
            color: colors.gray700,
            paddingLeft: CommonStyles.spacing.xs,
          }}>
            ¿Qué quieres hacer hoy?
          </Text>
          
          {quickActions.map((action) => (
            <TouchableOpacity 
              key={action.id}
              style={{
                backgroundColor: colors.white,
                borderRadius: CommonStyles.borderRadius.large,
                padding: CommonStyles.spacing.lg,
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: CommonStyles.spacing.md,
                ...CommonStyles.cardShadow,
              }}
              onPress={action.onPress}
            >
              <View style={{
                width: 56,
                height: 56,
                backgroundColor: action.color,
                borderRadius: CommonStyles.borderRadius.medium,
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: CommonStyles.spacing.md
              }}>
                <Text style={{ fontSize: 24, color: colors.white === '#1F1F1F' ? '#FFFFFF' : colors.white }}>
                  {action.icon}
                </Text>
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{
                  ...CommonStyles.typography.bodyMedium,
                  color: colors.gray800,
                  marginBottom: 2,
                }}>
                  {action.title}
                </Text>
                <Text style={{
                  ...CommonStyles.typography.caption,
                  color: colors.gray500
                }}>
                  {action.subtitle}
                </Text>
              </View>
              
              <Text style={{
                fontSize: 16,
                color: colors.gray400,
              }}>
                ›
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Información adicional */}
        <View style={{
          backgroundColor: colors.white,
          borderRadius: CommonStyles.borderRadius.large,
          padding: CommonStyles.spacing.lg,
          alignItems: 'center',
          marginBottom: CommonStyles.spacing.xxl,
          ...CommonStyles.softShadow,
        }}>
          <View style={{
            backgroundColor: colors.accent + '20',
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: CommonStyles.spacing.md,
          }}>
            <Text style={{ fontSize: 20, color: colors.accent }}>💡</Text>
          </View>
          
          <Text style={{
            ...CommonStyles.typography.bodyMedium,
            color: colors.gray800,
            marginBottom: CommonStyles.spacing.sm,
            textAlign: 'center',
          }}>
            ¿Sabías que?
          </Text>
          <Text style={{
            ...CommonStyles.typography.caption,
            color: colors.gray600,
            textAlign: 'center',
            lineHeight: 20,
          }}>
            Con BusNow puedes ver la ubicación exacta de todos los buses en tiempo real y planificar mejor tus viajes
          </Text>
        </View>

        {/* Espaciado final */}
        <View style={{ height: CommonStyles.spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}