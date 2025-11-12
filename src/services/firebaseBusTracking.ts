import { doc, setDoc, onSnapshot, serverTimestamp, collection, query } from 'firebase/firestore';
import { db } from './firebaseApp';
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

  async sendDriverLocation(busId: string, latitude: number, longitude: number, heading?: number, speed?: number) {
    const ref = doc(db, 'buses', busId);
    await setDoc(ref, {
      busId,
      latitude,
      longitude,
      heading: heading || null,
      speed: speed || null,
      updatedAt: Date.now(),
      updatedAtTimestamp: serverTimestamp()
    }, { merge: true });
  }

  onActiveBuses(callback: (buses: BusLocation[]) => void) {
    console.log('[BusTracking] DEMO_MODE:', DEMO_MODE, 'DEMO_PATH length:', DEMO_PATH.length);
    if (DEMO_MODE) {
      console.log('[DEMO] Iniciando simulación de bus demo');
      // Simulación local: escribe en Firestore cada intervalo Y escucha cambios para sincronizar UI
      let idx = 0;
      const speed = DEMO_SPEED_KMH;
      
      // Listener de Firestore para detectar cambios (mismo que modo real)
      const q = query(collection(db, 'buses'));
      const firestoreUnsub = onSnapshot(q, snapshot => {
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
        console.log(`[DEMO] Listener recibió ${list.length} buses:`, list.map(b => ({ id: b.busId, lat: b.latitude, lon: b.longitude })));
        callback(list);
      });
      
      // Escritor periódico que actualiza la posición del bus demo
      const tick = async () => {
        const p = DEMO_PATH[idx % DEMO_PATH.length];
        console.log(`[DEMO] Escribiendo bus en posición ${idx % DEMO_PATH.length}:`, p);
        try {
          await this.sendDriverLocation(DEMO_BUS_ID, p.latitude, p.longitude, 90, speed);
          console.log(`[DEMO] Bus ${DEMO_BUS_ID} actualizado en Firestore`);
        } catch (e) {
          console.error('[DEMO] Error escribiendo en Firestore:', e);
        }
        idx += 1;
      };
      
      tick(); // Primera escritura inmediata
      const handle = setInterval(tick, DEMO_UPDATE_INTERVAL_MS);
      
      const unsubscribe = () => {
        clearInterval(handle);
        firestoreUnsub();
      };
      this.unsubscribes.push(unsubscribe);
      return unsubscribe;
    } else {
      const q = query(collection(db, 'buses'));
      const unsubscribe = onSnapshot(q, snapshot => {
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
      });
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
