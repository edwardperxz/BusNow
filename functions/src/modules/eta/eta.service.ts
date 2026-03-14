import axios from "axios";
import { HttpsError } from "firebase-functions/v2/https";
import { CalculateETARequest, ETAResult } from "../../types/eta";
import { getETAFromCache, saveETAToCache } from "./eta.repository";

const OSRM_BASE_URL = process.env.OSRM_BASE_URL || "https://router.project-osrm.org";
const NOMINATIM_BASE_URL = process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";
const NOMINATIM_USER_AGENT = process.env.NOMINATIM_USER_AGENT || "BusNow/1.0 (+https://github.com/edwardperxz/BusNow)";

interface OsrmRoute {
  distance: number;
  duration: number;
  geometry: string;
}

interface GeocodedPoint {
  latitude: number;
  longitude: number;
  address: string;
}

function formatDistanceText(distanceMeters: number): string {
  if (distanceMeters >= 1000) {
    const km = distanceMeters / 1000;
    return `${km.toFixed(1).replace(".", ",")} km`;
  }
  return `${Math.round(distanceMeters)} m`;
}

function formatDurationText(durationSeconds: number): string {
  const minutes = Math.max(1, Math.round(durationSeconds / 60));
  if (minutes < 60) {
    return `${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours} h ${rem} min` : `${hours} h`;
}

async function requestOsrmRoute(
  origin: { latitude: number; longitude: number },
  destination: { latitude: number; longitude: number }
): Promise<OsrmRoute> {
  const coordinates = `${origin.longitude},${origin.latitude};${destination.longitude},${destination.latitude}`;

  const response = await axios.get(`${OSRM_BASE_URL}/route/v1/driving/${coordinates}`, {
    params: {
      alternatives: false,
      overview: "full",
      steps: false,
      geometries: "polyline",
    },
    timeout: 10000,
  });

  const route = response.data?.routes?.[0];
  if (response.data?.code !== "Ok" || !route) {
    throw new HttpsError("failed-precondition", `OSRM route error: ${response.data?.code || "UNKNOWN"}`);
  }

  return {
    distance: Number(route.distance || 0),
    duration: Number(route.duration || 0),
    geometry: String(route.geometry || ""),
  };
}

async function geocodeAddress(query: string): Promise<GeocodedPoint> {
  const response = await axios.get(`${NOMINATIM_BASE_URL}/search`, {
    params: {
      q: query,
      format: "jsonv2",
      limit: 1,
      addressdetails: 1,
      "accept-language": "es",
    },
    headers: {
      "User-Agent": NOMINATIM_USER_AGENT,
    },
    timeout: 10000,
  });

  const item = Array.isArray(response.data) ? response.data[0] : null;
  if (!item) {
    throw new HttpsError("failed-precondition", "No se encontraron coordenadas para la dirección");
  }

  const latitude = Number(item.lat);
  const longitude = Number(item.lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new HttpsError("failed-precondition", "Respuesta inválida de geocodificación");
  }

  return {
    latitude,
    longitude,
    address: String(item.display_name || query),
  };
}

export async function calculateETAService(payload: CalculateETARequest): Promise<ETAResult> {
  const { busLocation, stopLocation } = payload;

  // Intentar cache primero para reducir llamadas a Directions API
  const cached = await getETAFromCache(
    busLocation.latitude,
    busLocation.longitude,
    stopLocation.latitude,
    stopLocation.longitude
  );
  if (cached) return cached;
  const route = await requestOsrmRoute(busLocation, stopLocation);

  const result: ETAResult = {
    durationSeconds: Math.round(route.duration),
    durationText: formatDurationText(route.duration),
    distanceMeters: Math.round(route.distance),
    distanceText: formatDistanceText(route.distance),
    polyline: route.geometry || "",
    startAddress: `${busLocation.latitude.toFixed(6)}, ${busLocation.longitude.toFixed(6)}`,
    endAddress: `${stopLocation.latitude.toFixed(6)}, ${stopLocation.longitude.toFixed(6)}`,
  };

  // Guardar en cache en background para no bloquear la respuesta
  saveETAToCache(
    busLocation.latitude,
    busLocation.longitude,
    stopLocation.latitude,
    stopLocation.longitude,
    result
  ).catch(() => {});

  return result;
}

export async function getRouteDirectionsService(origin: string, destination: string) {
  const originPoint = await geocodeAddress(origin);
  const destinationPoint = await geocodeAddress(destination);
  const route = await requestOsrmRoute(originPoint, destinationPoint);

  return {
    polyline: route.geometry || "",
    origin: {
      latitude: originPoint.latitude,
      longitude: originPoint.longitude,
      address: originPoint.address,
    },
    destination: {
      latitude: destinationPoint.latitude,
      longitude: destinationPoint.longitude,
      address: destinationPoint.address,
    },
  };
}
