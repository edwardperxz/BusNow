import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RoutesScreen() {
  const routes = [
    {
      id: 1,
      name: 'Ruta Centro',
      description: 'Centro - Universidad',
      color: '#FF6B6B',
      buses: 3,
      status: 'active'
    },
    {
      id: 2,
      name: 'Ruta Norte',
      description: 'Centro - Zona Norte',
      color: '#4ECDC4',
      buses: 2,
      status: 'active'
    },
    {
      id: 3,
      name: 'Ruta Sur',
      description: 'Centro - Zona Sur',
      color: '#45B7D1',
      buses: 4,
      status: 'active'
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1 px-5 py-3">
        {/* Header */}
        <View className="items-center mb-6">
          <Text className="text-2xl font-bold text-blue-600 mb-2">📋 Rutas Disponibles</Text>
          <Text className="text-sm text-gray-600">Selecciona una ruta para ver detalles</Text>
        </View>

        {/* Routes List */}
        {routes.map((route) => (
          <TouchableOpacity key={route.id} className="bg-white rounded-xl p-4 mb-4 shadow-sm">
            <View className="flex-row items-center mb-3">
              <View 
                className="w-1 h-10 rounded mr-3" 
                style={{ backgroundColor: route.color }} 
              />
              <View className="flex-1">
                <Text className="text-lg font-semibold text-gray-800 mb-1">{route.name}</Text>
                <Text className="text-sm text-gray-600">{route.description}</Text>
              </View>
              <View className="items-end">
                <Text className="text-base font-medium text-blue-600 mb-1">{route.buses} buses</Text>
                <Text className="text-xs text-green-600">🟢 Activa</Text>
              </View>
            </View>
            
            <View className="flex-row justify-around">
              <TouchableOpacity className="bg-gray-50 py-2 px-4 rounded-md">
                <Text className="text-sm text-gray-700">🗺️ Ver en Mapa</Text>
              </TouchableOpacity>
              <TouchableOpacity className="bg-gray-50 py-2 px-4 rounded-md">
                <Text className="text-sm text-gray-700">⏰ Horarios</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}

        {/* Stats */}
        <View className="mt-5">
          <Text className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Estadísticas del Sistema
          </Text>
          <View className="flex-row justify-around">
            <View className="bg-white p-5 rounded-xl items-center min-w-[120px] shadow-sm">
              <Text className="text-3xl font-bold text-blue-600 mb-1">9</Text>
              <Text className="text-sm text-gray-600 text-center">Buses Activos</Text>
            </View>
            <View className="bg-white p-5 rounded-xl items-center min-w-[120px] shadow-sm">
              <Text className="text-3xl font-bold text-blue-600 mb-1">3</Text>
              <Text className="text-sm text-gray-600 text-center">Rutas Operativas</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
