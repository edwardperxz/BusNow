import { HttpsError } from "firebase-functions/v2/https";
import { CalculateETARequest } from "../types/eta";
import {
  RouteAnchorPoint,
  RouteAnchorPointInput,
  RouteBounds,
  RouteCoordinates,
  RouteStopInput,
  RouteUpsertPayload,
} from "../types/routes";

function isValidCoordinate(value: unknown, min: number, max: number): value is number {
  return typeof value === "number" && Number.isFinite(value) && value >= min && value <= max;
}

function ensureNonEmptyString(value: unknown, fieldName: string): string {
  const parsed = String(value ?? "").trim();
  if (!parsed) {
    throw new HttpsError("invalid-argument", `${fieldName} es requerido`);
  }
  return parsed;
}

function validateCoordinates(value: unknown, fieldName: string): RouteCoordinates {
  const data = value as Partial<RouteCoordinates> | null;

  if (
    !isValidCoordinate(data?.latitude, -90, 90) ||
    !isValidCoordinate(data?.longitude, -180, 180)
  ) {
    throw new HttpsError("invalid-argument", `${fieldName} contiene coordenadas inválidas`);
  }

  return {
    latitude: data.latitude,
    longitude: data.longitude,
  };
}

function validateBounds(value: unknown): RouteBounds | undefined {
  if (value == null) {
    return undefined;
  }

  const data = value as Partial<RouteBounds>;
  const bounds: RouteBounds = {
    north: Number(data.north),
    south: Number(data.south),
    east: Number(data.east),
    west: Number(data.west),
  };

  if (
    !isValidCoordinate(bounds.north, -90, 90) ||
    !isValidCoordinate(bounds.south, -90, 90) ||
    !isValidCoordinate(bounds.east, -180, 180) ||
    !isValidCoordinate(bounds.west, -180, 180) ||
    bounds.north < bounds.south ||
    bounds.east < bounds.west
  ) {
    throw new HttpsError("invalid-argument", "bounds contiene valores inválidos");
  }

  return bounds;
}

function validateAnchorPoints(anchorPoints: unknown): RouteAnchorPoint[] {
  if (!Array.isArray(anchorPoints) || anchorPoints.length < 3) {
    throw new HttpsError("invalid-argument", "anchorPoints debe incluir al menos inicio, medio y fin");
  }

  const normalized = anchorPoints.map((point, index) => {
    const data = point as Partial<RouteAnchorPointInput> | null;
    const kind = data?.kind;

    if (kind !== "start" && kind !== "mid" && kind !== "end" && kind !== "waypoint") {
      throw new HttpsError("invalid-argument", `anchorPoints[${index}] tiene kind inválido`);
    }

    return {
      label: ensureNonEmptyString(data?.label, `anchorPoints[${index}].label`),
      kind,
      order: Number.isFinite(data?.order) ? Number(data?.order) : index + 1,
      coordinates: validateCoordinates(data?.coordinates, `anchorPoints[${index}].coordinates`),
    } satisfies RouteAnchorPoint;
  });

  const kinds = normalized.map((point) => point.kind);
  const startCount = kinds.filter((kind) => kind === "start").length;
  const midCount = kinds.filter((kind) => kind === "mid").length;
  const endCount = kinds.filter((kind) => kind === "end").length;

  if (startCount !== 1 || midCount !== 1 || endCount !== 1) {
    throw new HttpsError(
      "invalid-argument",
      "anchorPoints debe incluir exactamente un punto start, uno mid y uno end"
    );
  }

  return normalized.sort((a, b) => a.order - b.order).map((point, index) => ({
    ...point,
    order: index + 1,
  }));
}

function validateStops(stops: unknown): RouteStopInput[] {
  if (stops == null) {
    return [];
  }

  if (!Array.isArray(stops)) {
    throw new HttpsError("invalid-argument", "stops debe ser un arreglo");
  }

  return stops.map((stop, index) => {
    const data = stop as Partial<RouteStopInput> | null;
    return {
      id: String(data?.id ?? "").trim() || undefined,
      name: ensureNonEmptyString(data?.name, `stops[${index}].name`),
      time: ensureNonEmptyString(data?.time, `stops[${index}].time`),
      coordinates: validateCoordinates(data?.coordinates, `stops[${index}].coordinates`),
      isActive: data?.isActive ?? false,
      order: Number.isFinite(data?.order) ? Number(data?.order) : index + 1,
    } satisfies RouteStopInput;
  });
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

export function validateRouteId(value: unknown, fieldName = "routeId"): string {
  return ensureNonEmptyString(value, fieldName);
}

export function validateRouteUpsertPayload(payload: unknown): RouteUpsertPayload {
  const data = payload as Partial<RouteUpsertPayload> | null;

  if (!data) {
    throw new HttpsError("invalid-argument", "payload de ruta es requerido");
  }

  const status = data.status ?? "active";
  if (status !== "active" && status !== "limited" && status !== "maintenance") {
    throw new HttpsError("invalid-argument", "status de ruta inválido");
  }

  return {
    name: ensureNonEmptyString(data.name, "name"),
    code: ensureNonEmptyString(data.code, "code"),
    origin: ensureNonEmptyString(data.origin, "origin"),
    midpoint: ensureNonEmptyString(data.midpoint, "midpoint"),
    destination: ensureNonEmptyString(data.destination, "destination"),
    frequency: ensureNonEmptyString(data.frequency, "frequency"),
    fare: ensureNonEmptyString(data.fare, "fare"),
    status,
    activeBuses: Number.isFinite(data.activeBuses) ? Number(data.activeBuses) : 0,
    color: String(data.color ?? "#1976D2").trim() || "#1976D2",
    isActive: data.isActive ?? true,
    // geometryPolyline es opcional en el payload del cliente porque el backend
    // lo recalcula desde OSRM en createRoute/updateRoute. Se acepta vacío.
    geometryPolyline: String(data.geometryPolyline ?? "").trim(),
    anchorPoints: validateAnchorPoints(data.anchorPoints),
    bounds: validateBounds(data.bounds),
    stops: validateStops(data.stops),
  };
}
