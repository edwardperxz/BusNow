export interface RouteItem {
  id: string;
  name: string;
  code?: string;
  origin: string;
  midpoint?: string;
  destination: string;
  frequency: string;
  fare: string;
  status: 'active' | 'limited' | 'maintenance';
  activeBuses: number;
  color?: string;
  isActive?: boolean;
  geometryPolyline?: string;
  anchorPointsCount?: number;
}

export interface RouteCoordinates {
  latitude: number;
  longitude: number;
}

export type RouteAnchorPointKind = 'start' | 'mid' | 'end' | 'waypoint';

export interface RouteAnchorPoint {
  label: string;
  kind: RouteAnchorPointKind;
  order: number;
  coordinates: RouteCoordinates;
}

export interface RouteBounds {
  north: number;
  south: number;
  east: number;
  west: number;
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
  order?: number;
}

export interface RouteData extends RouteItem {
  id: string;
  name: string;
  startPoint: string;
  midpoint?: string;
  endPoint: string;
  anchorPoints?: RouteAnchorPoint[];
  bounds?: RouteBounds;
  stops: RouteStop[];
}
