export interface HomeAction {
  id: 'map' | 'routes' | 'driver';
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  onPress: () => void;
}

export interface HomeStat {
  label: string;
  value: string;
  color: string;
}
