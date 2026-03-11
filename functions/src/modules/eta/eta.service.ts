import axios from "axios";
import { HttpsError } from "firebase-functions/v2/https";
import { CalculateETARequest, ETAResult } from "../../types/eta";
import { getGoogleMapsApiKey } from "../../config/googleMaps";
import { getETAFromCache, saveETAToCache } from "./eta.repository";

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

  const apiKey = getGoogleMapsApiKey();

  const origin = `${busLocation.latitude},${busLocation.longitude}`;
  const destination = `${stopLocation.latitude},${stopLocation.longitude}`;

  const response = await axios.get("https://maps.googleapis.com/maps/api/directions/json", {
    params: {
      origin,
      destination,
      mode: "driving",
      departure_time: "now",
      traffic_model: "best_guess",
      language: "es",
      region: "pa",
      key: apiKey,
    },
  });

  if (response.data.status !== "OK") {
    throw new HttpsError("failed-precondition", `Google API error: ${response.data.status}`);
  }

  const route = response.data.routes?.[0];
  const leg = route?.legs?.[0];

  const result: ETAResult = {
    durationSeconds: leg?.duration_in_traffic?.value || leg?.duration?.value || 0,
    durationText: leg?.duration_in_traffic?.text || leg?.duration?.text || "",
    distanceMeters: leg?.distance?.value || 0,
    distanceText: leg?.distance?.text || "",
    polyline: route?.overview_polyline?.points || "",
    startAddress: leg?.start_address || "",
    endAddress: leg?.end_address || "",
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
  const apiKey = getGoogleMapsApiKey();

  const response = await axios.get("https://maps.googleapis.com/maps/api/directions/json", {
    params: {
      origin,
      destination,
      mode: "driving",
      language: "es",
      key: apiKey,
    },
  });

  if (response.data.status !== "OK" || !response.data.routes?.[0]?.legs?.[0]) {
    throw new HttpsError("failed-precondition", `Google API error: ${response.data.status || "UNKNOWN"}`);
  }

  const route = response.data.routes[0];
  const leg = route.legs[0];

  return {
    polyline: route.overview_polyline?.points || "",
    origin: {
      latitude: leg.start_location?.lat,
      longitude: leg.start_location?.lng,
      address: leg.start_address || "",
    },
    destination: {
      latitude: leg.end_location?.lat,
      longitude: leg.end_location?.lng,
      address: leg.end_address || "",
    },
  };
}
