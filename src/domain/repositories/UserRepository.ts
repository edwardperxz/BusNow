// =============================================================================
// USER REPOSITORY INTERFACE - Domain Layer
// =============================================================================

import { User, Passenger, Driver } from '../../types';

export interface UserRepository {
  // Autenticación
  signInAnonymously(): Promise<User>;
  signInWithEmail(email: string, password: string): Promise<User>;
  signInWithGoogle(): Promise<User>;
  signOut(): Promise<void>;
  
  // Gestión de usuarios
  getCurrentUser(): Promise<User | null>;
  updateUser(user: Partial<User>): Promise<User>;
  createPassenger(userData: Partial<Passenger>): Promise<Passenger>;
  createDriver(userData: Partial<Driver>): Promise<Driver>;
  
  // Pasajeros
  addFavoriteRoute(userId: string, routeId: string): Promise<void>;
  removeFavoriteRoute(userId: string, routeId: string): Promise<void>;
  getFavoriteRoutes(userId: string): Promise<string[]>;
  
  // Trazabilidad para usuarios anónimos
  trackAnonymousUser(deviceId: string, location: { lat: number; lng: number }, ip?: string): Promise<void>;
}
