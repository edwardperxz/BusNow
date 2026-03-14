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

export type AuthenticatedUserRole = 'passenger' | 'driver' | 'admin';
export type PublicUserRole = 'passenger' | 'driver';
export type UserRole = AuthenticatedUserRole | null;

export interface UserProfile {
  uid: string;
  email?: string;
  role: UserRole;
  name?: string;
  busNumber?: string; // Solo para conductores
  currentRouteId?: string;
  isAnonymous?: boolean; // Usuario sin registrar
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAnonymous: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: PublicUserRole, name?: string, busNumber?: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  updateProfile: (name: string) => Promise<void>;
  updateUserProfile: (updates: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function normalizeUserRole(role: unknown): UserRole {
  if (role === 'user') {
    return 'passenger';
  }

  if (role === 'passenger' || role === 'driver' || role === 'admin') {
    return role;
  }

  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);

      if (firebaseUser) {
        try {
          await AsyncStorage.removeItem('@anonymous_user');
          setIsAnonymous(false);

          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const data = userDoc.data() as Partial<UserProfile>;
            setProfile({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? data.email,
              name: data.name,
              busNumber: data.busNumber,
              currentRouteId: data.currentRouteId,
              isAnonymous: false,
              role: normalizeUserRole(data.role),
            });
          } else {
            setProfile(null);
          }
        } catch (error) {
          console.error('Error cargando perfil:', error);
          setProfile(null);
        }

        setLoading(false);
        return;
      }

      try {
        const anonymousData = await AsyncStorage.getItem('@anonymous_user');
        if (anonymousData) {
          const anonProfile = JSON.parse(anonymousData) as UserProfile;
          setProfile(anonProfile);
          setIsAnonymous(true);
        } else {
          setProfile(null);
          setIsAnonymous(false);
        }
      } catch (error) {
        console.error('Error verificando usuario anónimo:', error);
        setProfile(null);
        setIsAnonymous(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await AsyncStorage.removeItem('@anonymous_user');
      setIsAnonymous(false);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

      if (!userDoc.exists()) {
        await firebaseSignOut(auth);
        throw new Error('Tu cuenta no tiene un perfil configurado');
      }

      const role = normalizeUserRole(userDoc.data()?.role);
      if (!role) {
        await firebaseSignOut(auth);
        throw new Error('Tu cuenta no tiene un rol válido configurado');
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const signUp = async (
    email: string,
    password: string,
    role: PublicUserRole,
    name?: string,
    busNumber?: string
  ) => {
    try {
      await AsyncStorage.removeItem('@anonymous_user');
      setIsAnonymous(false);
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

  const updateProfile = async (name: string) => {
    if (!user?.uid) throw new Error('No hay sesión activa');
    const trimmed = name.trim();
    if (!trimmed) throw new Error('El nombre no puede estar vacío');
    await setDoc(doc(db, 'users', user.uid), { name: trimmed }, { merge: true });
    setProfile((prev) => (prev ? { ...prev, name: trimmed } : prev));
  };

  const updateUserProfile = async (updates: Partial<UserProfile>) => {
    if (!user?.uid) throw new Error('No hay sesión activa');
    await setDoc(doc(db, 'users', user.uid), updates, { merge: true });
    setProfile((prev) => (prev ? { ...prev, ...updates } : prev));
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
      continueAsGuest,
      updateProfile,
      updateUserProfile,
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
