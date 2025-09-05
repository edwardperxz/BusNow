import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Provider } from 'react-redux';
import { AppNavigator } from './src/presentation/navigation/AppNavigator';
import { store } from './src/store';
import { colors } from './src/styles/colors';
import './global.css';

export default function App() {
  return (
    <Provider store={store}>
      <SafeAreaProvider>
        <StatusBar style="light" backgroundColor={colors.primary.main} />
        <AppNavigator />
      </SafeAreaProvider>
    </Provider>
  );
}
