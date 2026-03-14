import { useCallback, useEffect, useRef, useState } from 'react';
import { onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebaseApp';
import { calculateEta } from '../services/mapProviders';
import { useAuth } from '../context/AuthContext';

interface LocationCoord {
  latitude: number;
  longitude: number;
}

interface ETAData {
  durationSeconds: number;
  durationText: string;
  distanceMeters: number;
  distanceText: string;
  polyline: string;
  startAddress?: string;
  endAddress?: string;
}

interface Params {
  busId: string;
  stopLocation: LocationCoord | null;
  enabled?: boolean;
  /** Segundos sin actualizar antes de marcar el ETA como obsoleto (default: 30) */
  staleAfterSeconds?: number;
}

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

async function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export function useDynamicETA({ busId, stopLocation, enabled = true, staleAfterSeconds = 30 }: Params) {
  const { loading: authLoading } = useAuth();
  const [eta, setEta] = useState<ETAData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStale, setIsStale] = useState(false);
  const lastRequest = useRef<number>(0);
  const lastSuccess = useRef<number>(0);
  const staleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleStaleCheck = useCallback(() => {
    if (staleTimer.current) clearTimeout(staleTimer.current);
    setIsStale(false);
    staleTimer.current = setTimeout(() => {
      setIsStale(true);
    }, staleAfterSeconds * 1000);
  }, [staleAfterSeconds]);

  const calculate = useCallback(async (busLoc: LocationCoord) => {
    if (!stopLocation || authLoading) return;
    // Debounce simple para no spamear la función
    const now = Date.now();
    if (now - lastRequest.current < 1500) return;
    lastRequest.current = now;

    setLoading(true);
    setError(null);

    let lastError: Error | null = null;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) await delay(RETRY_DELAY_MS * attempt);

        const data = await calculateEta({
          busLocation: busLoc,
          stopLocation,
        });

        if (!data?.ok || !data.eta) {
          throw new Error('Respuesta inválida del backend para ETA');
        }

        setEta({
          durationSeconds: data.eta.durationSeconds,
          durationText: data.eta.durationText,
          distanceMeters: data.eta.distanceMeters,
          distanceText: data.eta.distanceText,
          polyline: data.eta.polyline,
          startAddress: data.eta.startAddress || 'Posición del bus',
          endAddress: data.eta.endAddress || 'Destino',
        });
        lastSuccess.current = Date.now();
        scheduleStaleCheck();
        setLoading(false);
        return;
      } catch (e: any) {
        lastError = e;
        const errorCode = String(e?.code || '');
        console.warn(`useDynamicETA intento ${attempt + 1}/${MAX_RETRIES + 1} fallido:`, errorCode || e?.message);

        // Si el backend devolvió unauthenticated incluso tras refresh de token,
        // no tiene sentido reintentar en este ciclo.
        if (errorCode === 'functions/unauthenticated') {
          break;
        }
      }
    }

    // Todos los intentos fallaron — mantener el último ETA conocido y marcar como obsoleto
    const rawMessage = String(lastError?.message || '').toLowerCase();
    const code = String((lastError as any)?.code || '');
    const message = rawMessage.includes('unauthenticated')
      ? 'No se pudo validar la sesión. Intenta nuevamente en unos segundos.'
      : code === 'functions/permission-denied'
        ? 'No tienes permisos para obtener ETA en este momento.'
      : (lastError?.message || 'Error calculando ETA');

    setError(message);
    if (eta !== null) {
      setIsStale(true);
    }
    setLoading(false);
  }, [stopLocation, scheduleStaleCheck, eta, authLoading]);

  useEffect(() => {
    if (!enabled || !busId || !stopLocation || authLoading) return;

    // Suscribirse a cambios del bus y recalcular ETA
    const ref = doc(db, 'buses', busId);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data();
      if (data?.latitude && data?.longitude) {
        calculate({ latitude: data.latitude, longitude: data.longitude });
      }
    });

    return () => {
      unsub();
      if (staleTimer.current) clearTimeout(staleTimer.current);
    };
  }, [busId, enabled, stopLocation, calculate, authLoading]);

  const refetch = useCallback(async () => {
    if (!busId || !stopLocation) return;
    try {
      const ref = doc(db, 'buses', busId);
      const snap = await getDoc(ref);
      const d = snap.data();
      if (d?.latitude && d?.longitude) {
        await calculate({ latitude: d.latitude, longitude: d.longitude });
      }
    } catch (e) {
      // noop — error ya gestionado en calculate
    }
  }, [busId, stopLocation, calculate]);

  return { eta, loading, error, isStale, refetch };
}
