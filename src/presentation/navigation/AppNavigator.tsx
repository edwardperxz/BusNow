// =============================================================================
// NAVIGATION SYSTEM - MVP BusNow
// =============================================================================

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';

// Screens
import HomeScreen from '../screens/HomeScreen';
import MapScreen from '../screens/MapScreen';
import RoutesScreen from '../screens/RoutesScreen';
import DriverLoginScreen from '../screens/DriverLoginScreen';
import { colors } from '../../styles/colors';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator para la navegación principal
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary.main,
        tabBarInactiveTintColor: colors.text.secondary,
        tabBarStyle: {
          backgroundColor: colors.background.primary,
          borderTopColor: colors.gray[200],
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: colors.primary.main,
        },
        headerTintColor: colors.text.white,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Inicio',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '🏠' : '🏠'}</Text>
          ),
          headerTitle: 'BusNow',
        }}
      />
      <Tab.Screen
        name="Routes"
        component={RoutesScreen}
        options={{
          title: 'Rutas',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '📋' : '📋'}</Text>
          ),
          headerTitle: 'Rutas Disponibles',
        }}
      />
      <Tab.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Mapa',
          tabBarIcon: ({ focused }) => (
            <Text style={{ fontSize: 20 }}>{focused ? '🗺️' : '🗺️'}</Text>
          ),
          headerTitle: 'Mapa en Tiempo Real',
        }}
      />
    </Tab.Navigator>
  );
};

// Stack Navigator principal
export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: colors.primary.main,
          },
          headerTintColor: colors.text.white,
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        {/* Main App Flow */}
        <Stack.Screen
          name="MainTabs"
          component={MainTabs}
          options={{ headerShown: false }}
        />
        
        {/* Driver Login */}
        <Stack.Screen
          name="DriverLogin"
          component={DriverLoginScreen}
          options={{
            title: 'Acceso Conductor',
            headerShown: false, // El componente maneja su propia navegación
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
