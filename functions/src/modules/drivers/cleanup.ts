import { getFirestore } from "firebase-admin/firestore";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";

/** Umbral de inactividad: 10 minutos sin actualizar → bus inactivo */
const INACTIVE_THRESHOLD_MS = 10 * 60 * 1000;

/**
 * Elimina documentos de la colección `buses` cuyo campo `updatedAt`
 * sea anterior al umbral de inactividad. Se ejecuta cada 10 minutos.
 */
export const cleanupInactiveBuses = onSchedule("every 10 minutes", async () => {
  const db = getFirestore();
  const cutoff = Date.now() - INACTIVE_THRESHOLD_MS;

  const snapshot = await db
    .collection("buses")
    .where("updatedAt", "<", cutoff)
    .get();

  if (snapshot.empty) {
    logger.info("[CleanupBuses] No hay buses inactivos para eliminar");
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((docSnap) => batch.delete(docSnap.ref));
  await batch.commit();

  logger.info(`[CleanupBuses] Eliminados ${snapshot.size} buses inactivos (cutoff=${new Date(cutoff).toISOString()})`);
});
