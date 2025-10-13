import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

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
            onPress: () => navigation.navigate('Inicio')
          }
        ]
      );
    }, 1500);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="flex-1 px-5 py-3">
        {/* Header */}
        <View className="items-center mb-8 py-5">
          <Text className="text-2xl font-bold text-orange-600 mb-2">👨‍💼 Acceso Conductores</Text>
          <Text className="text-sm text-gray-600 text-center">Ingresa tus credenciales para continuar</Text>
        </View>

        {/* Login Form */}
        <View className="mb-8">
          <View className="mb-5">
            <Text className="text-base font-medium text-gray-800 mb-2">ID de Conductor</Text>
            <TextInput
              className="bg-white rounded-lg p-4 text-base border border-gray-200"
              value={driverId}
              onChangeText={setDriverId}
              placeholder="Ej: COND001"
              placeholderTextColor="#999"
            />
          </View>

          <View className="mb-5">
            <Text className="text-base font-medium text-gray-800 mb-2">Contraseña</Text>
            <TextInput
              className="bg-white rounded-lg p-4 text-base border border-gray-200"
              value={password}
              onChangeText={setPassword}
              placeholder="Contraseña"
              placeholderTextColor="#999"
              secureTextEntry
            />
          </View>

          <View className="mb-5">
            <Text className="text-base font-medium text-gray-800 mb-2">Número de Bus</Text>
            <TextInput
              className="bg-white rounded-lg p-4 text-base border border-gray-200"
              value={busNumber}
              onChangeText={setBusNumber}
              placeholder="Ej: BUS-001"
              placeholderTextColor="#999"
            />
          </View>

          <TouchableOpacity 
            className={`rounded-lg p-4 items-center mt-3 ${isLoading ? 'bg-gray-400' : 'bg-orange-600'}`}
            onPress={handleLogin}
            disabled={isLoading}
          >
            <Text className="text-white text-base font-semibold">
              {isLoading ? '⏳ Verificando...' : '🚌 Iniciar Servicio'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info */}
        <View className="bg-blue-50 p-4 rounded-lg mb-5">
          <Text className="text-base font-semibold text-blue-700 mb-3">ℹ️ Información</Text>
          <Text className="text-sm text-gray-700 mb-2 leading-5">
            • Los conductores pueden activar el tracking GPS para compartir ubicación en tiempo real
          </Text>
          <Text className="text-sm text-gray-700 mb-2 leading-5">
            • Reportar paradas, retrasos y estado del servicio
          </Text>
          <Text className="text-sm text-gray-700 leading-5">
            • Ver ruta asignada y paradas programadas
          </Text>
        </View>

        {/* Demo credentials */}
        <View className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
          <Text className="text-sm font-semibold text-yellow-700 mb-1">🔧 Credenciales de Prueba</Text>
          <Text className="text-xs text-yellow-700">ID: COND001 | Pass: 1234 | Bus: BUS-001</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}
