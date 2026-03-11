import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { HttpsError } from "firebase-functions/v2/https";

interface RateLimitConfig {
  /** Máximo de llamadas permitidas en la ventana */
  maxRequests: number;
  /** Duración de la ventana en segundos */
  windowSeconds: number;
}

/**
 * Verifica y registra una llamada contra el límite de tasa por usuario.
 * Usa ventana de tiempo deslizante en Firestore (Admin SDK).
 * Lanza `HttpsError("resource-exhausted")` si se supera el límite.
 */
export async function checkRateLimit(
  uid: string,
  action: string,
  config: RateLimitConfig
): Promise<void> {
  const db = getFirestore();
  const docId = `${action}_${uid}`;
  const ref = db.collection("rate_limits").doc(docId);

  const windowStart = Timestamp.fromMillis(
    Date.now() - config.windowSeconds * 1000
  );

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);

    // Timestamps de llamadas previas dentro de la ventana actual
    const previous: Timestamp[] = snap.exists
      ? ((snap.data()?.calls as Timestamp[]) || []).filter(
          (t) => t.toMillis() >= windowStart.toMillis()
        )
      : [];

    if (previous.length >= config.maxRequests) {
      const oldestMs = Math.min(...previous.map((t) => t.toMillis()));
      const retryAfterSec = Math.ceil(
        (oldestMs + config.windowSeconds * 1000 - Date.now()) / 1000
      );
      throw new HttpsError(
        "resource-exhausted",
        `Demasiadas solicitudes. Intenta en ${retryAfterSec} segundos.`
      );
    }

    // Registrar la nueva llamada (reemplazar array limpio + nueva entrada)
    tx.set(ref, {
      calls: [...previous, Timestamp.now()],
      updatedAt: FieldValue.serverTimestamp(),
    });
  });
}
