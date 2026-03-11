import { HttpsError } from "firebase-functions/v2/https";
import { CalculateETARequest } from "../types/eta";

function isValidCoordinate(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

export function validateCalculateETARequest(payload: unknown): CalculateETARequest {
  const data = payload as Partial<CalculateETARequest> | null;

  if (!data?.busLocation || !data.stopLocation) {
    throw new HttpsError("invalid-argument", "busLocation y stopLocation son requeridos");
  }

  const { busLocation, stopLocation } = data;

  if (
    !isValidCoordinate(busLocation.latitude, -90, 90) ||
    !isValidCoordinate(busLocation.longitude, -180, 180) ||
    !isValidCoordinate(stopLocation.latitude, -90, 90) ||
    !isValidCoordinate(stopLocation.longitude, -180, 180)
  ) {
    throw new HttpsError("invalid-argument", "Coordenadas inválidas en la solicitud");
  }

  return data as CalculateETARequest;
}
