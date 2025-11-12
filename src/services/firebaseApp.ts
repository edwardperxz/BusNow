import { initializeApp, getApps } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getFunctions } from 'firebase/functions';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

// Auth para React Native debe inicializarse con AsyncStorage para persistencia
// Uso condicional de initializeAuth sólo en native; en web se mantiene getAuth
// Para RN usar initializeAuth y fallback a memory si no está getReactNativePersistence disponible.
// Para web omitimos auth aquí (se puede inicializar donde se necesite con getAuth(app)).
// Nota: Auth se desactiva temporalmente para evitar errores de registro en RN.
// Cuando se implemente login de conductores, inicializaremos Auth de forma específica para RN.
export const auth = undefined as unknown as undefined;
export const db = getFirestore(app);
export const fn = getFunctions(app);

export default app;
