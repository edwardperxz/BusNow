import { doc, setDoc, onSnapshot, serverTimestamp, collection, query } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, fn } from './firebaseApp';
import { DEMO_MODE, DEMO_BUS_ID, DEMO_PATH, DEMO_UPDATE_INTERVAL_MS, DEMO_SPEED_KMH } from '../demo/demoConfig';

export interface BusLocation {
  busId: string;
  latitude: number;
  longitude: number;
  heading?: number;
  speed?: number;
  updatedAt: number;
}

class FirebaseBusTrackingService {
  private unsubscribes: Array<() => void> = [];
  private updateDriverLocationFn = httpsCallable(fn, 'updateDriverLocation');

  private startLocalSimulation(callback: (buses: BusLocation[]) => void) {
    let idx = 0;

    const emit = () => {
      const point = DEMO_PATH[idx % DEMO_PATH.length];
      callback([
        {
          busId: DEMO_BUS_ID,
          latitude: point.latitude,
          longitude: point.longitude,
          heading: 90,
          speed: DEMO_SPEED_KMH,
          updatedAt: Date.now(),
        },
      ]);
      idx += 1;
    };

    emit();
    const handle = setInterval(emit, DEMO_UPDATE_INTERVAL_MS);

    const unsubscribe = () => clearInterval(handle);
    this.unsubscribes.push(unsubscribe);
    return unsubscribe;
  }

  async sendDriverLocation(busId: string, latitude: number, longitude: number, heading?: number, speed?: number) {
    if (DEMO_MODE) {
      // En modo demo no hay sesión de conductor autenticada; escribir directamente en Firestore.
      const ref = doc(db, 'buses', busId);
      await setDoc(ref, {
        busId,
        latitude,
        longitude,
        heading: heading ?? null,
        speed: speed ?? null,
        updatedAt: Date.now(),
        updatedAtTimestamp: serverTimestamp()
      }, { merge: true });
      return;
    }

    // Producción: actualización de posición vía Cloud Function (Admin SDK).
    // firestore.rules bloquea writes directos desde el cliente.
    await this.updateDriverLocationFn({ busId, latitude, longitude, heading, speed });
  }

  onActiveBuses(callback: (buses: BusLocation[]) => void, onError?: (error: unknown) => void) {
    if (DEMO_MODE) {
      return this.startLocalSimulation(callback);
    } else {
      const q = query(collection(db, 'buses'));
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: BusLocation[] = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            list.push({
              busId: data.busId || docSnap.id,
              latitude: data.latitude,
              longitude: data.longitude,
              heading: data.heading,
              speed: data.speed,
              updatedAt: data.updatedAt
            });
          });
          callback(list);
        },
        (error) => {
          onError?.(error);
        }
      );
      this.unsubscribes.push(unsubscribe);
      return unsubscribe;
    }
  }

  cleanup() {
    this.unsubscribes.forEach(u => u());
    this.unsubscribes = [];
  }
}

export default new FirebaseBusTrackingService();
