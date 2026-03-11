export interface RouteItem {
  id: string;
  name: string;
  origin: string;
  destination: string;
  frequency: string;
  fare: string;
  status: 'active' | 'limited' | 'maintenance';
  activeBuses: number;
}

export interface RouteStop {
  id: string;
  name: string;
  time: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isActive?: boolean;
}

export interface RouteData {
  id: string;
  name: string;
  startPoint: string;
  endPoint: string;
  stops: RouteStop[];
}
