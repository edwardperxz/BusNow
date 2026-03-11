import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { logger } from "firebase-functions";

interface UpdateDriverLocationPayload {
  busId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
}

export const updateDriverLocation = onCall(async (request) => {
  try {
    if (!request.auth?.uid) {
      throw new HttpsError("unauthenticated", "Debes iniciar sesión para actualizar ubicación");
    }

    const payload = request.data as Partial<UpdateDriverLocationPayload> | null;
    const busId = String(payload?.busId || "").trim();
    const latitude = Number(payload?.latitude);
    const longitude = Number(payload?.longitude);

    if (!busId) {
      throw new HttpsError("invalid-argument", "busId es requerido");
    }

    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw new HttpsError("invalid-argument", "latitude inválida");
    }

    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new HttpsError("invalid-argument", "longitude inválida");
    }

    const db = getFirestore();
    await db.collection("buses").doc(busId).set(
      {
        busId,
        latitude,
        longitude,
        heading: payload?.heading ?? null,
        speed: payload?.speed ?? null,
        updatedAt: Date.now(),
        updatedAtTimestamp: Timestamp.now(),
        updatedByUid: request.auth.uid,
      },
      { merge: true }
    );

    return { ok: true, busId, updatedAt: new Date().toISOString() };
  } catch (error) {
    logger.error("updateDriverLocation error", error);
    if (error instanceof HttpsError) {
      throw error;
    }
    throw new HttpsError("internal", "Error actualizando ubicación del conductor");
  }
});
