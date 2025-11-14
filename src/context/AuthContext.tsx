import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../services/firebaseApp';

export type UserRole = 'user' | 'driver' | null;

export interface UserProfile {
  uid: string;
  email?: string;
  role: UserRole;
  name?: string;
  busNumber?: string; // Solo para conductores
  isAnonymous?: boolean; // Usuario sin registrar
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAnonymous: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole, name?: string, busNumber?: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    // Verificar si hay un usuario anónimo guardado en AsyncStorage
    const checkAnonymousUser = async () => {
      try {
        const anonymousData = await AsyncStorage.getItem('@anonymous_user');
        if (anonymousData) {
          const anonProfile = JSON.parse(anonymousData);
          setProfile(anonProfile);
          setIsAnonymous(true);
          setLoading(false);
          return true;
        }
      } catch (error) {
        console.error('Error verificando usuario anónimo:', error);
      }
      return false;
    };

    checkAnonymousUser().then((hasAnonymous) => {
      if (hasAnonymous) return;

      // Si no hay usuario anónimo, verificar auth de Firebase
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        setUser(firebaseUser);
        setIsAnonymous(false);
        
        if (firebaseUser) {
          // Cargar perfil de usuario desde Firestore
          try {
            const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
            if (userDoc.exists()) {
              setProfile(userDoc.data() as UserProfile);
            } else {
              setProfile(null);
            }
          } catch (error) {
            console.error('Error cargando perfil:', error);
            setProfile(null);
          }
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      });

      return () => unsubscribe();
    });
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: UserRole,
    name?: string,
    busNumber?: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Crear perfil en Firestore
      const userProfile: UserProfile = {
        uid,
        email,
        role,
        name,
        ...(role === 'driver' && busNumber ? { busNumber } : {})
      };

      await setDoc(doc(db, 'users', uid), userProfile);
    } catch (error: any) {
      throw new Error(error.message || 'Error al registrarse');
    }
  };

  const signOut = async () => {
    try {
      if (!isAnonymous) {
        await firebaseSignOut(auth);
      }
      // Limpiar usuario anónimo si existe
      await AsyncStorage.removeItem('@anonymous_user');
      setProfile(null);
      setIsAnonymous(false);
    } catch (error: any) {
      throw new Error(error.message || 'Error al cerrar sesión');
    }
  };

  const continueAsGuest = async () => {
    try {
      const guestProfile: UserProfile = {
        uid: `guest_${Date.now()}`,
        role: null,
        isAnonymous: true
      };
      
      await AsyncStorage.setItem('@anonymous_user', JSON.stringify(guestProfile));
      setProfile(guestProfile);
      setIsAnonymous(true);
      setLoading(false);
    } catch (error) {
      console.error('Error creando perfil de invitado:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile, 
      loading, 
      isAnonymous,
      signIn, 
      signUp, 
      signOut,
      continueAsGuest 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
