import { useCallback, useEffect, useRef, useState } from 'react';
import { onSnapshot, doc, getDoc } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, fn } from '../services/firebaseApp';

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
}

export function useDynamicETA({ busId, stopLocation, enabled = true }: Params) {
  const [eta, setEta] = useState<ETAData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastRequest = useRef<number>(0);
  const intervalMs = Number(process.env.EXPO_PUBLIC_LOCATION_UPDATE_INTERVAL || 5000);
  const calculateETAFn = httpsCallable(fn, 'calculateETA');

  const calculate = useCallback(async (busLoc: LocationCoord) => {
    if (!stopLocation) return;
    // Debounce simple para no spamear la función
    const now = Date.now();
    if (now - lastRequest.current < 1500) return;
    lastRequest.current = now;

    try {
      setLoading(true);
      setError(null);

      const response = await calculateETAFn({
        busLocation: busLoc,
        stopLocation,
      });

      const data = response.data as { ok?: boolean; eta?: ETAData };
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
        endAddress: data.eta.endAddress || 'Destino'
      });
    } catch (e: any) {
      setError(e?.message || 'Error calculando ETA');
      console.error('useDynamicETA error', e);
    } finally {
      setLoading(false);
    }
  }, [stopLocation, calculateETAFn]);

  useEffect(() => {
    if (!enabled || !busId || !stopLocation) return;

    // Suscribirse a cambios del bus y recalcular ETA
    const ref = doc(db, 'buses', busId);
    const unsub = onSnapshot(ref, (snap) => {
      const data = snap.data();
      if (data?.latitude && data?.longitude) {
        calculate({ latitude: data.latitude, longitude: data.longitude });
      }
    });

    return () => unsub();
  }, [busId, enabled, stopLocation, calculate]);

  return { eta, loading, error, refetch: async () => {
    if (!busId || !stopLocation) return;
    try {
      const ref = doc(db, 'buses', busId);
      const snap = await getDoc(ref);
      const d = snap.data();
      if (d?.latitude && d?.longitude) {
        await calculate({ latitude: d.latitude, longitude: d.longitude });
      }
    } catch (e) {
      // noop
    }
  }};
}
