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

import { UserProfile, UserRole } from '../types';

export { UserRole };

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isAnonymous: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone?: string) => Promise<void>;
  signOut: () => Promise<void>;
  continueAsGuest: () => void;
  activateDriverMode: (employeeId: string, company: string, licenseNumber: string) => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;
      
      // Cargar perfil del usuario desde Firestore
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userProfile = userDoc.data() as UserProfile;
        setProfile(userProfile);
      }
      
      // Limpiar usuario anónimo si existe
      await AsyncStorage.removeItem('@anonymous_user');
      setIsAnonymous(false);
    } catch (error: any) {
      throw new Error(error.message || 'Error al iniciar sesión');
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phone?: string
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Crear perfil básico en Firestore (todos inician como usuarios normales)
      const userProfile: UserProfile = {
        uid,
        email,
        name,
        phone,
        role: 'user',
        isDriver: false,
        driverStatus: 'none',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', uid), userProfile);
      
      // Limpiar usuario anónimo si existe
      await AsyncStorage.removeItem('@anonymous_user');
      
      // Actualizar estado local inmediatamente
      setProfile(userProfile);
      setIsAnonymous(false);
    } catch (error: any) {
      throw new Error(error.message || 'Error al registrarse');
    }
  };

  const activateDriverMode = async (
    employeeId: string,
    company: string,
    licenseNumber: string
  ) => {
    if (!user || !profile) {
      throw new Error('Debe estar autenticado para activar el modo conductor');
    }

    if (isAnonymous) {
      throw new Error('Los usuarios invitados no pueden activar el modo conductor');
    }

    try {
      // Buscar el código de conductor en Firestore
      const codeDoc = await getDoc(doc(db, 'driverCodes', employeeId));
      
      if (!codeDoc.exists()) {
        throw new Error('Código de empleado no válido');
      }

      const codeData = codeDoc.data();
      
      // Validar que el código está activo
      if (!codeData.isActive) {
        throw new Error('Este código de empleado ha sido desactivado');
      }

      // Validar que el código no ha sido usado por otro usuario
      if (codeData.assignedTo && codeData.assignedTo !== user.uid) {
        throw new Error('Este código ya ha sido utilizado por otro usuario');
      }

      // Validar que la empresa coincide
      if (codeData.company.toLowerCase() !== company.toLowerCase()) {
        throw new Error('La empresa no coincide con el código de empleado');
      }

      // Validar que la licencia coincide
      if (codeData.licenseNumber.toLowerCase() !== licenseNumber.toLowerCase()) {
        throw new Error('El número de licencia no coincide con nuestros registros');
      }

      // Activar modo conductor
      const driverInfo = {
        employeeId: codeData.employeeId,
        company: codeData.company,
        licenseNumber: codeData.licenseNumber,
        busNumber: codeData.busNumber,
        route: codeData.route,
        activatedAt: new Date(),
        isOnline: false
      };

      const updatedProfile: Partial<UserProfile> = {
        isDriver: true,
        driverStatus: 'active',
        driverInfo: driverInfo,
        updatedAt: new Date()
      };

      // Actualizar perfil del usuario
      await setDoc(doc(db, 'users', user.uid), updatedProfile, { merge: true });
      
      // Marcar el código como asignado
      await setDoc(doc(db, 'driverCodes', employeeId), {
        assignedTo: user.uid,
        assignedAt: new Date()
      }, { merge: true });
      
      // Actualizar estado local
      setProfile({ ...profile, ...updatedProfile } as UserProfile);
    } catch (error: any) {
      throw new Error(error.message || 'Error al activar modo conductor');
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) {
      throw new Error('Debe estar autenticado');
    }

    try {
      const updatedData = {
        ...updates,
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), updatedData, { merge: true });
      
      // Actualizar estado local
      if (profile) {
        setProfile({ ...profile, ...updatedData });
      }
    } catch (error: any) {
      throw new Error(error.message || 'Error al actualizar perfil');
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
        email: `guest_${Date.now()}@anonymous.local`,
        name: 'Invitado',
        role: null,
        isAnonymous: true,
        isDriver: false,
        driverStatus: 'none',
        createdAt: new Date(),
        updatedAt: new Date()
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
      activateDriverMode,
      updateProfile
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
