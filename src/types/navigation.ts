export type AppScreen = 'map' | 'routes' | 'home' | 'settings' | 'auth' | 'driver';

export interface AppNavigation {
  navigate: (screen: AppScreen) => void;
}
