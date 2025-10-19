import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomTabNavigator from './src/components/navigation/CustomTabNavigator';
import { SettingsProvider } from './src/context/SettingsContext';

export default function App() {
  return (
    <SafeAreaProvider>
      <SettingsProvider>
        <CustomTabNavigator />
      </SettingsProvider>
    </SafeAreaProvider>
  );
}