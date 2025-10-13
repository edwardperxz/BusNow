import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

import MapScreen from './src/screens/MapScreen';
import RoutesScreen from './src/screens/RoutesScreen';
import HomeScreen from './src/screens/HomeScreen';
import DriverScreen from './src/screens/DriverScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#2196F3',
          headerStyle: { backgroundColor: '#2196F3' },
          headerTintColor: '#fff',
        }}
      >
        <Tab.Screen
          name="Mapa"
          component={MapScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>�️</Text>,
            headerTitle: 'BusNow - Mapa en Tiempo Real',
          }}
        />
        <Tab.Screen
          name="Rutas"
          component={RoutesScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>�</Text>,
          }}
        />
        <Tab.Screen
          name="Inicio"
          component={HomeScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>�</Text>,
          }}
        />
        <Tab.Screen
          name="Conductor"
          component={DriverScreen}
          options={{
            tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>�‍�</Text>,
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
