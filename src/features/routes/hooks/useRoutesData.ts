import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { fn } from '../../../services/firebaseApp';
import { RouteItem } from '../types';

interface RoutesResponse {
  ok: boolean;
  routes: RouteItem[];
}

export function useRoutesData() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRoutesFn = httpsCallable<void, RoutesResponse>(fn, 'getRoutes');
    getRoutesFn()
      .then((res) => setRoutes(res.data.routes ?? []))
      .catch((err) => console.error('[Routes] Error al cargar rutas:', err))
      .finally(() => setLoading(false));
  }, []);

  return {
    routes,
    loading,
  };
}
