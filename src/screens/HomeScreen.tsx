import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen({ navigation }: any) {
  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-5 py-3">
        {/* Header */}
        <View className="items-center mb-8 py-5">
          <Text className="text-3xl font-bold text-blue-600 mb-2">🚌 BusNow</Text>
          <Text className="text-base text-gray-600">Tracking en tiempo real</Text>
        </View>

        {/* Quick Actions */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Acceso Rápido</Text>
          
          <TouchableOpacity 
            className="flex-row items-center bg-white p-4 rounded-xl mb-3 shadow-sm"
            onPress={() => navigation.navigate('Mapa')}
          >
            <Text className="text-2xl mr-4">🗺️</Text>
            <Text className="text-base font-medium text-gray-800">Ver Mapa en Tiempo Real</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center bg-white p-4 rounded-xl mb-3 shadow-sm"
            onPress={() => navigation.navigate('Rutas')}
          >
            <Text className="text-2xl mr-4">📋</Text>
            <Text className="text-base font-medium text-gray-800">Explorar Rutas</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            className="flex-row items-center bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-3"
            onPress={() => navigation.navigate('Conductor')}
          >
            <Text className="text-2xl mr-4">👨‍💼</Text>
            <Text className="text-base font-medium text-yellow-700">Acceso Conductores</Text>
          </TouchableOpacity>
        </View>

        {/* Status */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Estado del Sistema</Text>
          <View className="bg-green-50 p-4 rounded-xl border-l-4 border-green-400">
            <Text className="text-base font-medium text-green-700">
              🟢 Todos los servicios operativos
            </Text>
            <Text className="text-sm text-gray-600 mt-1">
              Última actualización: hace 2 minutos
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
