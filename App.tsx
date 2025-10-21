import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import CustomTabNavigator from './src/components/navigation/CustomTabNavigator';
import { SettingsProvider } from './src/context/SettingsContext';
import { SearchProvider } from './src/context/SearchContext';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <SettingsProvider>
          <SearchProvider>
            <CustomTabNavigator />
          </SearchProvider>
        </SettingsProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}