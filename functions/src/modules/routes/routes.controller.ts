import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { getRouteDetailService, getRoutesService } from "./routes.service";

export const getRoutes = onCall(async (_request) => {
  try {
    const routes = await getRoutesService();
    return { ok: true, routes };
  } catch (error) {
    logger.error("getRoutes error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error obteniendo rutas");
  }
});

export const getRouteDetail = onCall(async (request) => {
  try {
    const routeId = String(request.data?.routeId || "").trim();

    if (!routeId) {
      throw new HttpsError("invalid-argument", "routeId es requerido");
    }

    const route = await getRouteDetailService(routeId);
    return { ok: true, route };
  } catch (error) {
    logger.error("getRouteDetail error", error);
    if (error instanceof HttpsError) throw error;
    if (error instanceof Error && error.message.includes("not found")) {
      throw new HttpsError("not-found", "Ruta no encontrada");
    }
    throw new HttpsError("internal", "Error obteniendo detalle de ruta");
  }
});
