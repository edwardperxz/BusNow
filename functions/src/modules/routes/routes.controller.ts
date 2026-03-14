import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";
import { getFirestore } from "firebase-admin/firestore";
import {
  createRouteService,
  deleteRouteService,
  getAdminRoutesService,
  getRouteDetailService,
  getRoutesService,
  updateRouteService,
} from "./routes.service";
import { validateRouteId, validateRouteUpsertPayload } from "../../utils/validators";

async function assertAdmin(uid?: string) {
  if (!uid) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión");
  }

  const db = getFirestore();
  const userSnap = await db.collection("users").doc(uid).get();
  const role = userSnap.data()?.role;

  if (role !== "admin") {
    throw new HttpsError("permission-denied", "Solo admin puede gestionar rutas");
  }
}

export const getRoutes = onCall({ invoker: "public" }, async (_request) => {
  try {
    const routes = await getRoutesService();
    return { ok: true, routes };
  } catch (error) {
    logger.error("getRoutes error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error obteniendo rutas");
  }
});

export const getRouteDetail = onCall({ invoker: "public" }, async (request) => {
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

export const getAdminRoutes = onCall(async (request) => {
  try {
    await assertAdmin(request.auth?.uid);
    const routes = await getAdminRoutesService();
    return { ok: true, routes };
  } catch (error) {
    logger.error("getAdminRoutes error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error obteniendo rutas admin");
  }
});

export const createRoute = onCall(async (request) => {
  try {
    await assertAdmin(request.auth?.uid);
    const payload = validateRouteUpsertPayload(request.data);
    return await createRouteService(payload, request.auth!.uid);
  } catch (error) {
    logger.error("createRoute error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error creando ruta");
  }
});

export const updateRoute = onCall(async (request) => {
  try {
    await assertAdmin(request.auth?.uid);
    const routeId = validateRouteId(request.data?.routeId);
    const payload = validateRouteUpsertPayload(request.data?.route);
    return await updateRouteService(routeId, payload, request.auth!.uid);
  } catch (error) {
    logger.error("updateRoute error", error);
    if (error instanceof HttpsError) throw error;
    if (error instanceof Error && error.message.includes("not found")) {
      throw new HttpsError("not-found", "Ruta no encontrada");
    }
    throw new HttpsError("internal", "Error actualizando ruta");
  }
});

export const deleteRoute = onCall(async (request) => {
  try {
    await assertAdmin(request.auth?.uid);
    const routeId = validateRouteId(request.data?.routeId);
    return await deleteRouteService(routeId);
  } catch (error) {
    logger.error("deleteRoute error", error);
    if (error instanceof HttpsError) throw error;
    if (error instanceof Error && error.message.includes("not found")) {
      throw new HttpsError("not-found", "Ruta no encontrada");
    }
    throw new HttpsError("internal", "Error eliminando ruta");
  }
});
