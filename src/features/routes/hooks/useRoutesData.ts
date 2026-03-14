import { useEffect, useState } from 'react';
import { RouteItem } from '../types';
import { getRoutes } from '../../../services/routesApi';

export function useRoutesData() {
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRoutes()
      .then((data) => setRoutes(data))
      .catch((err) => console.error('[Routes] Error al cargar rutas:', err))
      .finally(() => setLoading(false));
  }, []);

  return {
    routes,
    loading,
  };
}
