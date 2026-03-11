export interface MapCoordinate {
  latitude: number;
  longitude: number;
}

export interface MapRegion extends MapCoordinate {
  latitudeDelta: number;
  longitudeDelta: number;
}

export interface RoutePoint extends MapCoordinate {
  address: string;
}

export interface SelectedPlace {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
  latitude: number;
  longitude: number;
}

export interface RouteDirectionsResponse {
  ok?: boolean;
  route?: {
    polyline: string;
    origin: RoutePoint;
    destination: RoutePoint;
  };
}
