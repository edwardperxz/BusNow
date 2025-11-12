import { useCallback, useEffect, useRef, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db, fn } from '../services/firebaseApp';
import { DEMO_MODE } from '../demo/demoConfig';
import { haversineDistanceMeters, formatDistance, formatDuration } from '../utils/geo';

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

  const calculate = useCallback(async (busLoc: LocationCoord) => {
    if (!stopLocation) return;
    // Debounce simple para no spamear la función
    const now = Date.now();
    if (now - lastRequest.current < 1500) return;
    lastRequest.current = now;

    try {
      setLoading(true);
      setError(null);
      if (DEMO_MODE) {
        // En modo demo: llamar directamente a Google Directions API desde el cliente
        // (sin Cloud Function, para evitar dependencia de backend desplegado)
        const apiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
          throw new Error('Falta EXPO_PUBLIC_GOOGLE_MAPS_API_KEY para modo demo');
        }
        const origin = `${busLoc.latitude},${busLoc.longitude}`;
        const destination = `${stopLocation.latitude},${stopLocation.longitude}`;
        const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=driving&departure_time=now&traffic_model=best_guess&language=es&region=pa&key=${apiKey}`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.status !== 'OK') {
          throw new Error(`Google Directions error: ${data.status}`);
        }
        
        const route = data.routes?.[0];
        const leg = route?.legs?.[0];
        
        setEta({
          durationSeconds: leg?.duration_in_traffic?.value || leg?.duration?.value || 0,
          durationText: leg?.duration_in_traffic?.text || leg?.duration?.text || '',
          distanceMeters: leg?.distance?.value || 0,
          distanceText: leg?.distance?.text || '',
          polyline: route?.overview_polyline?.points || '',
          startAddress: leg?.start_address || 'Posición del bus (demo)',
          endAddress: leg?.end_address || 'Destino (demo)'
        });
      } else {
        const callable = httpsCallable(fn, 'calculateETA');
        const resp: any = await callable({ busLocation: busLoc, stopLocation });
        if (resp?.data?.ok) {
          setEta(resp.data.eta);
        } else {
          throw new Error(resp?.data?.error || 'Respuesta inválida');
        }
      }
    } catch (e: any) {
      setError(e?.message || 'Error calculando ETA');
      console.error('useDynamicETA error', e);
    } finally {
      setLoading(false);
    }
  }, [stopLocation]);

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
