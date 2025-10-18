import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BusNowColors, CommonStyles } from '../styles/colors';

export default function DriverScreen({ navigation }: any) {
  const [driverId, setDriverId] = useState('');
  const [password, setPassword] = useState('');
  const [busNumber, setBusNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!driverId || !password || !busNumber) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    
    // Simulación de autenticación
    setTimeout(() => {
      setIsLoading(false);
      Alert.alert(
        'Acceso Conductor',
        `Bienvenido Conductor ${driverId}!\n\nEn esta sección podrás:\n• Activar tracking GPS\n• Reportar estado del recorrido\n• Ver ruta asignada`,
        [
          {
            text: 'Continuar',
            onPress: () => navigation.navigate('home')
          }
        ]
      );
    }, 1500);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: BusNowColors.gray100 }}>
      <ScrollView style={{ flex: 1, paddingHorizontal: CommonStyles.spacing.md, paddingTop: 100 }}>
        {/* Header minimalista */}
        <View style={{
          alignItems: 'center',
          marginBottom: CommonStyles.spacing.xl,
          paddingVertical: CommonStyles.spacing.lg
        }}>
          <View style={{
            width: 80,
            height: 80,
            backgroundColor: BusNowColors.accent,
            borderRadius: 40,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: CommonStyles.spacing.md
          }}>
            <Text style={{ fontSize: 36, color: BusNowColors.white }}>👨‍💼</Text>
          </View>
          <Text style={{
            ...CommonStyles.typography.h2,
            color: BusNowColors.accent,
            marginBottom: CommonStyles.spacing.xs
          }}>Acceso Conductores</Text>
          <Text style={{
            ...CommonStyles.typography.caption,
            color: BusNowColors.gray500,
            textAlign: 'center'
          }}>Ingresa tus credenciales para activar el servicio</Text>
        </View>

        {/* Formulario de login minimalista */}
        <View style={{ marginBottom: CommonStyles.spacing.xl }}>
          <View style={{ marginBottom: CommonStyles.spacing.md }}>
            <Text style={{
              ...CommonStyles.typography.caption,
              color: BusNowColors.gray600,
              marginBottom: CommonStyles.spacing.xs
            }}>ID de Conductor</Text>
            <TextInput
              style={{
                backgroundColor: BusNowColors.white,
                borderRadius: 8,
                padding: CommonStyles.spacing.md,
                fontSize: 16,
                borderWidth: 1,
                borderColor: BusNowColors.gray200,
                color: BusNowColors.gray800
              }}
              value={driverId}
              onChangeText={setDriverId}
              placeholder="Ej: driver001"
              placeholderTextColor={BusNowColors.gray400}
            />
          </View>

          <View style={{ marginBottom: CommonStyles.spacing.md }}>
            <Text style={{
              ...CommonStyles.typography.caption,
              color: BusNowColors.gray600,
              marginBottom: CommonStyles.spacing.xs
            }}>Contraseña</Text>
            <TextInput
              style={{
                backgroundColor: BusNowColors.white,
                borderRadius: 8,
                padding: CommonStyles.spacing.md,
                fontSize: 16,
                borderWidth: 1,
                borderColor: BusNowColors.gray200,
                color: BusNowColors.gray800
              }}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={BusNowColors.gray400}
              secureTextEntry
            />
          </View>

          <View style={{ marginBottom: CommonStyles.spacing.lg }}>
            <Text style={{
              ...CommonStyles.typography.caption,
              color: BusNowColors.gray600,
              marginBottom: CommonStyles.spacing.xs
            }}>Número de Bus</Text>
            <TextInput
              style={{
                backgroundColor: BusNowColors.white,
                borderRadius: 8,
                padding: CommonStyles.spacing.md,
                fontSize: 16,
                borderWidth: 1,
                borderColor: BusNowColors.gray200,
                color: BusNowColors.gray800
              }}
              value={busNumber}
              onChangeText={setBusNumber}
              placeholder="Ej: BUS-001"
              placeholderTextColor={BusNowColors.gray400}
            />
          </View>

          <TouchableOpacity 
            style={{
              backgroundColor: isLoading ? BusNowColors.gray400 : BusNowColors.accent,
              borderRadius: 8,
              padding: CommonStyles.spacing.md,
              alignItems: 'center',
              marginTop: CommonStyles.spacing.sm,
              ...CommonStyles.cardShadow
            }}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text style={{
              color: BusNowColors.white,
              fontSize: 16,
              fontWeight: '600'
            }}>
              {isLoading ? 'Verificando...' : 'Iniciar Servicio'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Información del sistema */}
        <View style={{
          backgroundColor: BusNowColors.white,
          padding: CommonStyles.spacing.md,
          borderRadius: 8,
          marginBottom: CommonStyles.spacing.md,
          ...CommonStyles.cardShadow
        }}>
          <Text style={{
            ...CommonStyles.typography.body,
            fontWeight: '500',
            color: BusNowColors.primary,
            marginBottom: CommonStyles.spacing.sm
          }}>Funciones disponibles</Text>
          
          <View style={{ gap: CommonStyles.spacing.xs }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 4,
                height: 4,
                backgroundColor: BusNowColors.primary,
                borderRadius: 2,
                marginRight: CommonStyles.spacing.sm
              }} />
              <Text style={{
                ...CommonStyles.typography.small,
                color: BusNowColors.gray600,
                flex: 1
              }}>
                Activar tracking GPS en tiempo real
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 4,
                height: 4,
                backgroundColor: BusNowColors.primary,
                borderRadius: 2,
                marginRight: CommonStyles.spacing.sm
              }} />
              <Text style={{
                ...CommonStyles.typography.small,
                color: BusNowColors.gray600,
                flex: 1
              }}>
                Reportar estado del servicio y paradas
              </Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 4,
                height: 4,
                backgroundColor: BusNowColors.primary,
                borderRadius: 2,
                marginRight: CommonStyles.spacing.sm
              }} />
              <Text style={{
                ...CommonStyles.typography.small,
                color: BusNowColors.gray600,
                flex: 1
              }}>
                Ver ruta asignada y horarios
              </Text>
            </View>
          </View>
        </View>

        {/* Credenciales de prueba */}
        <View style={{
          backgroundColor: BusNowColors.accent + '10',
          padding: CommonStyles.spacing.sm,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: BusNowColors.accent + '30'
        }}>
          <Text style={{
            ...CommonStyles.typography.small,
            fontWeight: '500',
            color: BusNowColors.accent,
            marginBottom: CommonStyles.spacing.xs
          }}>Credenciales de prueba</Text>
          <Text style={{
            ...CommonStyles.typography.small,
            color: BusNowColors.gray600
          }}>
            ID: driver001 | Contraseña: 1234 | Bus: BUS-001
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
