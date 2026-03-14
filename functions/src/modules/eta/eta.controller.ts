import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { validateCalculateETARequest } from "../../utils/validators";
import { calculateETAService, getRouteDirectionsService } from "./eta.service";
import { checkRateLimit } from "../../utils/rateLimit";

const ETA_RATE = { maxRequests: 4, windowSeconds: 60 };

export const calculateETA = onCall({ invoker: "public" }, async (request) => {
  try {
    if (request.auth?.uid) {
      await checkRateLimit(request.auth.uid, "calculateETA", ETA_RATE);
    }

    const payload = validateCalculateETARequest(request.data);
    const eta = await calculateETAService(payload);

    return {
      ok: true,
      eta,
      calculatedAt: new Date().toISOString(),
    };
  } catch (error) {
    logger.error("calculateETA error", error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError("internal", "Error calculando ETA");
  }
});

export const getRouteDirections = onCall({ invoker: "public" }, async (request) => {
  try {
    if (request.auth?.uid) {
      await checkRateLimit(request.auth.uid, "getRouteDirections", ETA_RATE);
    }

    const origin = String(request.data?.origin || "").trim();
    const destination = String(request.data?.destination || "").trim();

    if (!origin || !destination) {
      throw new HttpsError("invalid-argument", "origin y destination son requeridos");
    }

    const route = await getRouteDirectionsService(origin, destination);
    return { ok: true, route };
  } catch (error) {
    logger.error("getRouteDirections error", error);

    if (error instanceof HttpsError) {
      throw error;
    }

    throw new HttpsError("internal", "Error obteniendo direcciones de ruta");
  }
});
