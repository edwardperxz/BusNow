import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { initializeAuth, getAuth, Auth } from 'firebase/auth';
// @ts-ignore - getReactNativePersistence está disponible pero TypeScript puede no reconocerlo
import { getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';
import AsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

// Validar configuración
console.log('[Firebase] Config:', {
  apiKey: firebaseConfig.apiKey ? '✓' : '✗',
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
});

// Inicializar app solo si no existe
const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Inicializar Auth con persistencia AsyncStorage
let auth: Auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  console.log('[Firebase] Auth inicializado con AsyncStorage');
} catch (error: any) {
  // Si ya fue inicializado, usar getAuth
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
    console.log('[Firebase] Auth ya estaba inicializado');
  } else {
    throw error;
  }
}

const db = getFirestore(app);
const fn = getFunctions(app);

export { auth, db, fn };
export default app;
