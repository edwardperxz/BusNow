import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Switch, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BusNowColors, CommonStyles } from '../styles/colors';

interface SettingsItemProps {
  icon: string;
  title: string;
  subtitle?: string;
  onPress?: () => void;
  rightElement?: React.ReactNode;
  color?: string;
}

const SettingsItem: React.FC<SettingsItemProps> = ({ 
  icon, 
  title, 
  subtitle, 
  onPress, 
  rightElement,
  color = BusNowColors.primary
}) => (
  <TouchableOpacity
    onPress={onPress}
    style={{
      ...CommonStyles.card,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: CommonStyles.spacing.sm,
      ...CommonStyles.softShadow,
    }}
  >
    {/* Ícono mejorado */}
    <View style={{
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: color,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
      ...CommonStyles.softShadow,
    }}>
      <Text style={{ fontSize: 20, color: BusNowColors.white }}>
        {icon}
      </Text>
    </View>

    {/* Contenido mejorado */}
    <View style={{ flex: 1 }}>
      <Text style={{
        ...CommonStyles.typography.bodyMedium,
        color: BusNowColors.gray800,
        marginBottom: subtitle ? 4 : 0,
      }}>
        {title}
      </Text>
      {subtitle && (
        <Text style={{
          ...CommonStyles.typography.caption,
          color: BusNowColors.gray500,
        }}>
          {subtitle}
        </Text>
      )}
    </View>

    {/* Elemento derecho */}
    {rightElement || (
      <Text style={{
        fontSize: 16,
        color: BusNowColors.gray400,
        fontWeight: '500',
      }}>
        ›
      </Text>
    )}
  </TouchableOpacity>
);

const SettingsScreen: React.FC<{ navigation?: any }> = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [locationTracking, setLocationTracking] = useState(true);
  const [voiceGuidance, setVoiceGuidance] = useState(false);
  const [batterySaver, setBatterySaver] = useState(false);

  const handleBackPress = () => {
    if (navigation?.navigate) {
      navigation.navigate('home');
    }
  };

  const showComingSoon = (feature: string) => {
    Alert.alert('Próximamente', `La función "${feature}" estará disponible en una próxima actualización.`);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: CommonStyles.background.primary }}>
      {/* Header mejorado y más amigable */}
      <View style={{
        backgroundColor: BusNowColors.primary,
        paddingTop: 20,
        paddingBottom: 30,
        paddingHorizontal: 24,
      }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <TouchableOpacity
            onPress={handleBackPress}
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: 'rgba(255, 255, 255, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontSize: 20, color: BusNowColors.white, fontWeight: '600' }}>←</Text>
          </TouchableOpacity>
          
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Text style={{
              ...CommonStyles.typography.h2,
              color: BusNowColors.white,
              marginBottom: 4,
            }}>
              Configuración
            </Text>
            <Text style={{
              ...CommonStyles.typography.caption,
              color: 'rgba(255, 255, 255, 0.8)',
            }}>
              Personaliza tu experiencia
            </Text>
          </View>
          
          <View style={{ width: 44 }} />
        </View>
      </View>

      <ScrollView style={{ flex: 1, paddingHorizontal: CommonStyles.spacing.md }}>
        {/* Sección General */}
        <View style={{ marginTop: CommonStyles.spacing.xl }}>
          <Text style={{
            ...CommonStyles.typography.h3,
            color: BusNowColors.gray700,
            marginBottom: CommonStyles.spacing.md,
            paddingLeft: CommonStyles.spacing.xs,
          }}>
            General
          </Text>

          <SettingsItem
            icon="🔔"
            title="Notificaciones"
            subtitle="Alertas de buses y rutas"
            color="#FF6B6B"
            rightElement={
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: BusNowColors.gray300, true: BusNowColors.primary }}
                thumbColor={notifications ? BusNowColors.white : BusNowColors.gray400}
              />
            }
          />

          <SettingsItem
            icon="📍"
            title="Ubicación"
            subtitle="Permitir seguimiento de ubicación"
            color="#4CAF50"
            rightElement={
              <Switch
                value={locationTracking}
                onValueChange={setLocationTracking}
                trackColor={{ false: BusNowColors.gray300, true: BusNowColors.primary }}
                thumbColor={locationTracking ? BusNowColors.white : BusNowColors.gray400}
              />
            }
          />

          <SettingsItem
            icon="🔊"
            title="Voz y sonido"
            subtitle="Instrucciones de voz y sonidos"
            color="#2196F3"
            rightElement={
              <Switch
                value={voiceGuidance}
                onValueChange={setVoiceGuidance}
                trackColor={{ false: BusNowColors.gray300, true: BusNowColors.primary }}
                thumbColor={voiceGuidance ? BusNowColors.white : BusNowColors.gray400}
              />
            }
          />

          <SettingsItem
            icon="🔋"
            title="Ahorro de batería"
            subtitle="Reducir el consumo de batería"
            color="#FF9800"
            rightElement={
              <Switch
                value={batterySaver}
                onValueChange={setBatterySaver}
                trackColor={{ false: BusNowColors.gray300, true: BusNowColors.primary }}
                thumbColor={batterySaver ? BusNowColors.white : BusNowColors.gray400}
              />
            }
          />
        </View>

        {/* Sección Preferencias */}
        <View style={{ marginTop: CommonStyles.spacing.xxl }}>
          <Text style={{
            ...CommonStyles.typography.h3,
            color: BusNowColors.gray700,
            marginBottom: CommonStyles.spacing.md,
            paddingLeft: CommonStyles.spacing.xs,
          }}>
            Preferencias de Conducción
          </Text>

          <SettingsItem
            icon="🗺️"
            title="Visualización del mapa"
            subtitle="Configurar apariencia del mapa"
            color="#9C27B0"
            onPress={() => showComingSoon('Visualización del mapa')}
          />

          <SettingsItem
            icon="🚗"
            title="Navegación"
            subtitle="Preferencias de ruta"
            color="#3F51B5"
            onPress={() => showComingSoon('Navegación')}
          />

          <SettingsItem
            icon="🚌"
            title="Detalles del vehículo"
            subtitle="Configurar información del bus"
            color="#00BCD4"
            onPress={() => showComingSoon('Detalles del vehículo')}
          />
        </View>

        {/* Sección Avanzado */}
        <View style={{ marginTop: CommonStyles.spacing.xxl }}>
          <Text style={{
            ...CommonStyles.typography.h3,
            color: BusNowColors.gray700,
            marginBottom: CommonStyles.spacing.md,
            paddingLeft: CommonStyles.spacing.xs,
          }}>
            Opciones Avanzadas
          </Text>

          <SettingsItem
            icon="💳"
            title="Pases de peaje"
            subtitle="Gestionar métodos de pago"
            color="#795548"
            onPress={() => showComingSoon('Pases de peaje')}
          />

          <SettingsItem
            icon="🚨"
            title="Alertas y reportes"
            subtitle="Configurar alertas de tráfico"
            color="#FF5722"
            onPress={() => showComingSoon('Alertas y reportes')}
          />

          <SettingsItem
            icon="⚡"
            title="Velocímetro"
            subtitle="Mostrar velocidad actual"
            color="#FFC107"
            onPress={() => showComingSoon('Velocímetro')}
          />

          <SettingsItem
            icon="🎵"
            title="Reproductor de audio"
            subtitle="Integración con música"
            color="#E91E63"
            onPress={() => showComingSoon('Reproductor de audio')}
          />
        </View>

        {/* Sección Ayuda */}
        <View style={{ marginTop: CommonStyles.spacing.xxl, marginBottom: CommonStyles.spacing.xxl }}>
          <Text style={{
            ...CommonStyles.typography.h3,
            color: BusNowColors.gray700,
            marginBottom: CommonStyles.spacing.md,
            paddingLeft: CommonStyles.spacing.xs,
          }}>
            Ayuda y Soporte
          </Text>

          <SettingsItem
            icon="❓"
            title="Ayuda"
            subtitle="Centro de ayuda y FAQ"
            color="#607D8B"
            onPress={() => showComingSoon('Ayuda')}
          />

          <SettingsItem
            icon="📧"
            title="Contactar soporte"
            subtitle="Enviar comentarios o reportar problemas"
            color="#8BC34A"
            onPress={() => showComingSoon('Contactar soporte')}
          />

          <SettingsItem
            icon="ℹ️"
            title="Acerca de"
            subtitle="Versión 1.0.0"
            color={BusNowColors.primary}
            onPress={() => showComingSoon('Acerca de')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SettingsScreen;