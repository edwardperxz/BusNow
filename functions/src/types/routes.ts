export interface RouteListItem {
  id: string;
  name: string;
  origin: string;
  destination: string;
  /** Ej: "5-8 min" */
  frequency: string;
  /** Ej: "Q2.50" */
  fare: string;
  status: "active" | "limited" | "maintenance";
  activeBuses: number;
  color?: string;
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

export interface RouteDetail extends RouteListItem {
  /** Igual que origin — alias usado por los componentes del frontend */
  startPoint: string;
  /** Igual que destination — alias usado por los componentes del frontend */
  endPoint: string;
  stops: RouteStop[];
}
