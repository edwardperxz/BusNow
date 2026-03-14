export interface RouteListItem {
  id: string;
  name: string;
  code: string;
  origin: string;
  midpoint: string;
  destination: string;
  /** Ej: "5-8 min" */
  frequency: string;
  /** Ej: "Q2.50" */
  fare: string;
  status: "active" | "limited" | "maintenance";
  activeBuses: number;
  color?: string;
  isActive: boolean;
  geometryPolyline: string;
  anchorPointsCount: number;
}

export interface RouteCoordinates {
  latitude: number;
  longitude: number;
}

export type RouteAnchorPointKind = "start" | "mid" | "end" | "waypoint";

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
  /** Hora de paso estimada, ej: "7:00 AM" */
  time: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  isActive?: boolean;
  /** Posición en la ruta para ordenar */
  order?: number;
}

export interface RouteStopInput {
  id?: string;
  name: string;
  time: string;
  coordinates: RouteCoordinates;
  isActive?: boolean;
  order?: number;
}

export interface RouteAnchorPointInput {
  label: string;
  kind: RouteAnchorPointKind;
  coordinates: RouteCoordinates;
  order?: number;
}

export interface RouteUpsertPayload {
  name: string;
  code: string;
  origin: string;
  midpoint: string;
  destination: string;
  frequency: string;
  fare: string;
  status?: "active" | "limited" | "maintenance";
  activeBuses?: number;
  color?: string;
  isActive?: boolean;
  /** El backend recalcula este campo desde OSRM; el cliente puede omitirlo. */
  geometryPolyline?: string;
  anchorPoints: RouteAnchorPointInput[];
  /** El backend recalcula este campo desde la geometría OSRM; el cliente puede omitirlo. */
  bounds?: RouteBounds;
  stops?: RouteStopInput[];
}

export interface RouteDetail extends RouteListItem {
  /** Igual que origin — alias usado por los componentes del frontend */
  startPoint: string;
  /** Igual que destination — alias usado por los componentes del frontend */
  endPoint: string;
  midpoint: string;
  anchorPoints: RouteAnchorPoint[];
  bounds?: RouteBounds;
  stops: RouteStop[];
}
