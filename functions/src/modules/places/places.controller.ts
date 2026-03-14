import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { placeDetailsService, placesAutocompleteService } from "./places.service";
import { checkRateLimit } from "../../utils/rateLimit";

const PLACES_RATE = { maxRequests: 10, windowSeconds: 60 };

export const placesAutocomplete = onCall({ invoker: "public" }, async (request) => {
  try {
    if (request.auth?.uid) {
      await checkRateLimit(request.auth.uid, "placesAutocomplete", PLACES_RATE);
    }

    const query = String(request.data?.query || "").trim();
    if (query.length < 3) {
      return { ok: true, predictions: [] };
    }

    const predictions = await placesAutocompleteService({
      query,
      countryCode: request.data?.countryCode,
      location: request.data?.location,
      radius: request.data?.radius,
    });

    return { ok: true, predictions };
  } catch (error) {
    logger.error("placesAutocomplete error", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Error en búsqueda de lugares");
  }
});

export const placeDetails = onCall({ invoker: "public" }, async (request) => {
  try {
    if (request.auth?.uid) {
      await checkRateLimit(request.auth.uid, "placeDetails", PLACES_RATE);
    }

    const placeId = String(request.data?.placeId || "").trim();
    if (!placeId) {
      throw new HttpsError("invalid-argument", "placeId es requerido");
    }

    const result = await placeDetailsService({ placeId });
    return { ok: true, result };
  } catch (error) {
    logger.error("placeDetails error", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Error obteniendo detalle del lugar");
  }
});
