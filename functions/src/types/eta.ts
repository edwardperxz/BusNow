export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface CalculateETARequest {
  busLocation: LatLng;
  stopLocation: LatLng;
}

export interface ETAResult {
  durationSeconds: number;
  durationText: string;
  distanceMeters: number;
  distanceText: string;
  polyline: string;
  startAddress: string;
  endAddress: string;
}
