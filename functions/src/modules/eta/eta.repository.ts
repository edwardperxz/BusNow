import { getFirestore, Timestamp, WriteBatch } from "firebase-admin/firestore";
import { ETAResult } from "../../types/eta";

const CACHE_TTL_SECONDS = 30;

interface CachedETA {
  result: ETAResult;
  cachedAt: Timestamp;
  expiresAt: Timestamp;
}

function buildCacheKey(
  busLat: number,
  busLng: number,
  stopLat: number,
  stopLng: number
): string {
  // Truncar a 4 decimales (~11m precisión) para aumentar hit rate de cache
  const round = (n: number) => Math.round(n * 10000) / 10000;
  return `${round(busLat)}_${round(busLng)}_${round(stopLat)}_${round(stopLng)}`;
}

export async function getETAFromCache(
  busLat: number,
  busLng: number,
  stopLat: number,
  stopLng: number
): Promise<ETAResult | null> {
  const db = getFirestore();
  const key = buildCacheKey(busLat, busLng, stopLat, stopLng);
  const ref = db.collection("eta_cache").doc(key);

  const snap = await ref.get();
  if (!snap.exists) return null;

  const data = snap.data() as CachedETA;
  const now = Timestamp.now();

  if (data.expiresAt.toMillis() < now.toMillis()) {
    // Expirado — borrar en background sin bloquear
    ref.delete().catch(() => {});
    return null;
  }

  return data.result;
}

export async function saveETAToCache(
  busLat: number,
  busLng: number,
  stopLat: number,
  stopLng: number,
  result: ETAResult
): Promise<void> {
  const db = getFirestore();
  const key = buildCacheKey(busLat, busLng, stopLat, stopLng);
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(now.toMillis() + CACHE_TTL_SECONDS * 1000);

  await db.collection("eta_cache").doc(key).set({
    result,
    cachedAt: now,
    expiresAt,
  } satisfies CachedETA);

}

/**
 * Elimina todas las entradas de eta_cache cuyo expiresAt < now.
 * Llamar desde una Cloud Function scheduled (ej. cada 5 minutos).
 */
export async function purgeExpiredETACache(): Promise<number> {
  const db = getFirestore();
  const now = Timestamp.now();

  const snap = await db
    .collection("eta_cache")
    .where("expiresAt", "<", now)
    .limit(400) // límite por lote de escritura de Firestore
    .get();

  if (snap.empty) return 0;

  // Firestore batch admite hasta 500 operaciones
  const batch: WriteBatch = db.batch();
  snap.docs.forEach((d) => batch.delete(d.ref));
  await batch.commit();

  return snap.size;
}
