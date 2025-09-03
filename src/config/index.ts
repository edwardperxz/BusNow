// Configuración de variables de entorno para BusNow
import Constants from 'expo-constants';

interface Config {
  // API Configuration
  apiBaseUrl: string;
  wsUrl: string;
  
  // Google Maps
  googleMapsApiKey: {
    android: string;
    ios: string;
  };
  
  // Expo
  projectId: string;
  
  // Development
  debugMode: boolean;
  mockData: boolean;
  
  // Location tracking
  locationUpdateInterval: number;
  locationAccuracyThreshold: number;
  
  // Firebase
  firebase: {
    apiKey: string;
    projectId: string;
  };
}

const getConfig = (): Config => {
  const extra = Constants.expoConfig?.extra;
  
  return {
    // API URLs
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:3000',
    wsUrl: process.env.EXPO_PUBLIC_WS_URL || 'ws://localhost:3001',
    
    // Google Maps API Keys
    googleMapsApiKey: {
      android: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID || '',
      ios: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS || '',
    },
    
    // Expo Project ID
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID || extra?.eas?.projectId || 'busnow-development',
    
    // Development flags
    debugMode: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true' || __DEV__,
    mockData: process.env.EXPO_PUBLIC_MOCK_DATA === 'true' || __DEV__,
    
    // Location settings
    locationUpdateInterval: Number(process.env.EXPO_PUBLIC_LOCATION_UPDATE_INTERVAL) || 5000,
    locationAccuracyThreshold: Number(process.env.EXPO_PUBLIC_LOCATION_ACCURACY_THRESHOLD) || 50,
    
    // Firebase configuration
    firebase: {
      apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || '',
      projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || '',
    },
  };
};

export const config = getConfig();

// Debug log en desarrollo
if (config.debugMode) {
  console.log('🔧 BusNow Config:', {
    ...config,
    googleMapsApiKey: {
      android: config.googleMapsApiKey.android ? '***' : 'not set',
      ios: config.googleMapsApiKey.ios ? '***' : 'not set',
    },
    firebase: {
      apiKey: config.firebase.apiKey ? '***' : 'not set',
      projectId: config.firebase.projectId || 'not set',
    },
  });
}
