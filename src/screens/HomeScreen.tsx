import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BusNowColors, CommonStyles } from '../styles/colors';

export default function HomeScreen({ navigation }: any) {
  const quickActions = [
    {
      id: 'map',
      title: 'Ver Mapa en Tiempo Real',
      subtitle: 'Encuentra buses cerca de ti',
      icon: '🗺️',
      color: BusNowColors.primary,
      onPress: () => navigation.navigate('map'),
    },
    {
      id: 'routes',
      title: 'Explorar Rutas',
      subtitle: 'Descubre todas las líneas disponibles',
      icon: '🚌',
      color: BusNowColors.secondary,
      onPress: () => navigation.navigate('routes'),
    },
    {
      id: 'driver',
      title: 'Panel de Conductor',
      subtitle: 'Herramientas para conductores',
      icon: '👨‍💼',
      color: BusNowColors.accent,
      onPress: () => navigation.navigate('driver'),
    },
  ];

  const stats = [
    { label: 'Buses Activos', value: '24', color: BusNowColors.primary },
    { label: 'Rutas Disponibles', value: '8', color: BusNowColors.secondary },
    { label: 'Tiempo Promedio', value: '12min', color: BusNowColors.accent },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CommonStyles.background.primary }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: CommonStyles.spacing.md, paddingTop: 100 }}>
        {/* Header amigable y minimalista */}
        <View style={{
          alignItems: 'center',
          marginBottom: CommonStyles.spacing.xxl,
          paddingTop: CommonStyles.spacing.lg,
        }}>
          <View style={{
            backgroundColor: BusNowColors.primary,
            width: 80,
            height: 80,
            borderRadius: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: CommonStyles.spacing.lg,
            ...CommonStyles.softShadow,
          }}>
            <Text style={{ fontSize: 36, color: BusNowColors.white }}>🚌</Text>
          </View>
          
          <Text style={{
            ...CommonStyles.typography.h1,
            color: BusNowColors.primary,
            marginBottom: CommonStyles.spacing.sm,
            textAlign: 'center',
          }}>
            ¡Hola! 👋
          </Text>
          <Text style={{
            ...CommonStyles.typography.body,
            textAlign: 'center',
            maxWidth: 300,
            color: BusNowColors.gray600,
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
              backgroundColor: BusNowColors.white,
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
                color: BusNowColors.gray600,
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
            color: BusNowColors.gray700,
            paddingLeft: CommonStyles.spacing.xs,
          }}>
            ¿Qué quieres hacer hoy?
          </Text>
          
          {quickActions.map((action) => (
            <TouchableOpacity 
              key={action.id}
              style={{
                ...CommonStyles.card,
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
                <Text style={{ fontSize: 24, color: BusNowColors.white }}>
                  {action.icon}
                </Text>
              </View>
              
              <View style={{ flex: 1 }}>
                <Text style={{
                  ...CommonStyles.typography.bodyMedium,
                  color: BusNowColors.gray800,
                  marginBottom: 2,
                }}>
                  {action.title}
                </Text>
                <Text style={{
                  ...CommonStyles.typography.caption,
                  color: BusNowColors.gray500
                }}>
                  {action.subtitle}
                </Text>
              </View>
              
              <Text style={{
                fontSize: 16,
                color: BusNowColors.gray400,
              }}>
                ›
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Información adicional */}
        <View style={{
          ...CommonStyles.card,
          alignItems: 'center',
          marginBottom: CommonStyles.spacing.xxl,
          ...CommonStyles.softShadow,
        }}>
          <View style={{
            backgroundColor: BusNowColors.accent + '20',
            width: 48,
            height: 48,
            borderRadius: 24,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: CommonStyles.spacing.md,
          }}>
            <Text style={{ fontSize: 20, color: BusNowColors.accent }}>💡</Text>
          </View>
          
          <Text style={{
            ...CommonStyles.typography.bodyMedium,
            color: BusNowColors.gray800,
            marginBottom: CommonStyles.spacing.sm,
            textAlign: 'center',
          }}>
            ¿Sabías que?
          </Text>
          <Text style={{
            ...CommonStyles.typography.caption,
            color: BusNowColors.gray600,
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