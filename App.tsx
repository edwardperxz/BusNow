import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomTabNavigator from './src/components/navigation/CustomTabNavigator';

export default function App() {
  return (
    <SafeAreaProvider>
      <CustomTabNavigator />
    </SafeAreaProvider>
  );
}