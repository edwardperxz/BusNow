export type AppScreen = 'map' | 'routes' | 'home' | 'settings' | 'auth' | 'driver' | 'favorites' | 'profile' | 'admin';

export interface AppNavigation {
  navigate: (screen: AppScreen) => void;
}
