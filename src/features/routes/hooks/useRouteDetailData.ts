import { useEffect, useState } from 'react';
import { httpsCallable } from 'firebase/functions';
import { fn } from '../../../services/firebaseApp';
import { RouteData } from '../types';

const DEFAULT_ROUTE: RouteData = {
  id: 'ruta-001',
  name: 'Ruta Boquete - David',
  startPoint: 'Boquete',
  endPoint: 'David',
  stops: [
    {
      id: '1',
      name: 'Parada Municipalidad',
      time: '7:00 AM',
      coordinates: { latitude: 8.7833, longitude: -82.4333 },
      isActive: true,
    },
    {
      id: '2',
      name: 'Parada Municipalidad',
      time: '7:15 AM',
      coordinates: { latitude: 8.78, longitude: -82.43 },
    },
    {
      id: '3',
      name: 'Parada Parque Central',
      time: '7:15 AM',
      coordinates: { latitude: 8.775, longitude: -82.425 },
    },
    {
      id: '4',
      name: 'Parada Parque Central',
      time: '8:45 AM',
      coordinates: { latitude: 8.77, longitude: -82.42 },
    },
    {
      id: '5',
      name: 'Parada Social Stop',
      time: '8:30 AM',
      coordinates: { latitude: 8.765, longitude: -82.415 },
    },
  ],
};

export function useRouteDetailData(routeId?: string, routeProp?: RouteData) {
  const [route, setRoute] = useState<RouteData>(routeProp ?? DEFAULT_ROUTE);
  const [loadingRoute, setLoadingRoute] = useState(!!routeId);
  const [selectedStop, setSelectedStop] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!routeId) return;
    const getRouteDetailFn = httpsCallable<{ routeId: string }, { ok: boolean; route: RouteData }>(
      fn,
      'getRouteDetail'
    );
    setLoadingRoute(true);
    getRouteDetailFn({ routeId })
      .then((res) => {
        if (res.data?.route) setRoute(res.data.route);
      })
      .catch((err) => console.error('[RouteDetail] Error al cargar ruta:', err))
      .finally(() => setLoadingRoute(false));
  }, [routeId]);

  return {
    route,
    loadingRoute,
    selectedStop,
    setSelectedStop,
    currentTime,
  };
}
