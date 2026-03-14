import { httpsCallable } from 'firebase/functions';
import { collection, doc, getDoc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db, fn } from './firebaseApp';
import { RouteData, RouteItem } from '../features/routes/types';

export interface RouteCoordinates {
  latitude: number;
  longitude: number;
}

export interface RouteAnchorPointInput {
  label: string;
  kind: 'start' | 'mid' | 'end' | 'waypoint';
  coordinates: RouteCoordinates;
  order?: number;
}

export interface RouteStopInput {
  id?: string;
  name: string;
  time: string;
  coordinates: RouteCoordinates;
  isActive?: boolean;
  order?: number;
}

export interface RouteUpsertInput {
  name: string;
  code: string;
  origin: string;
  midpoint: string;
  destination: string;
  frequency: string;
  fare: string;
  status?: 'active' | 'limited' | 'maintenance';
  activeBuses?: number;
  color?: string;
  isActive?: boolean;
  /** El backend calcula esto desde OSRM; el cliente puede omitirlo. */
  geometryPolyline?: string;
  anchorPoints: RouteAnchorPointInput[];
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
  stops?: RouteStopInput[];
}

const getRoutesFn = httpsCallable<void, { ok?: boolean; routes?: RouteItem[] }>(fn, 'getRoutes');
const getAdminRoutesFn = httpsCallable<void, { ok?: boolean; routes?: RouteItem[] }>(fn, 'getAdminRoutes');
const getRouteDetailFn = httpsCallable<{ routeId: string }, { ok?: boolean; route?: RouteData }>(fn, 'getRouteDetail');
const createRouteFn = httpsCallable<RouteUpsertInput, { ok?: boolean; routeId?: string }>(fn, 'createRoute');
const updateRouteFn = httpsCallable<{ routeId: string; route: RouteUpsertInput }, { ok?: boolean; routeId?: string }>(fn, 'updateRoute');
const deleteRouteFn = httpsCallable<{ routeId: string }, { ok?: boolean; routeId?: string }>(fn, 'deleteRoute');

function isCallablePermissionError(error: unknown) {
  const code = String((error as { code?: string } | null)?.code || '');
  return code === 'functions/permission-denied' || code === 'functions/unauthenticated';
}

function mapRouteItem(id: string, data: Record<string, unknown>): RouteItem {
  return {
    id,
    name: String(data.name ?? ''),
    code: String(data.code ?? ''),
    origin: String(data.origin ?? ''),
    midpoint: String(data.midpoint ?? ''),
    destination: String(data.destination ?? ''),
    frequency: String(data.frequency ?? ''),
    fare: String(data.fare ?? ''),
    status: (data.status as RouteItem['status']) ?? 'active',
    activeBuses: Number(data.activeBuses ?? 0),
    color: data.color ? String(data.color) : undefined,
    isActive: Boolean(data.isActive ?? true),
    geometryPolyline: String(data.geometryPolyline ?? ''),
    anchorPointsCount: Number(data.anchorPointsCount ?? (Array.isArray(data.anchorPoints) ? data.anchorPoints.length : 0)),
  };
}

async function getRoutesFromFirestore() {
  const routesQuery = query(collection(db, 'routes'), where('isActive', '==', true), orderBy('name'));
  const snapshot = await getDocs(routesQuery);
  return snapshot.docs.map((docSnap) => mapRouteItem(docSnap.id, docSnap.data() as Record<string, unknown>));
}

async function getAdminRoutesFromFirestore() {
  const routesQuery = query(collection(db, 'routes'), orderBy('name'));
  const snapshot = await getDocs(routesQuery);
  return snapshot.docs.map((docSnap) => mapRouteItem(docSnap.id, docSnap.data() as Record<string, unknown>));
}

async function getRouteDetailFromFirestore(routeId: string): Promise<RouteData | null> {
  const routeRef = doc(db, 'routes', routeId);
  const routeSnap = await getDoc(routeRef);

  if (!routeSnap.exists()) {
    return null;
  }

  const routeData = routeSnap.data() as Record<string, unknown>;
  const stopsSnapshot = await getDocs(query(collection(db, 'routes', routeId, 'stops'), orderBy('order')));
  const stops = stopsSnapshot.docs.map((stopSnap) => {
    const stopData = stopSnap.data() as Record<string, unknown>;
    const coordinates = (stopData.coordinates as { latitude?: number; longitude?: number } | undefined) ?? {};

    return {
      id: stopSnap.id,
      name: String(stopData.name ?? ''),
      time: String(stopData.time ?? ''),
      coordinates: {
        latitude: Number(coordinates.latitude ?? 0),
        longitude: Number(coordinates.longitude ?? 0),
      },
      isActive: Boolean(stopData.isActive ?? false),
      order: Number(stopData.order ?? 0),
    };
  });

  return {
    ...mapRouteItem(routeSnap.id, routeData),
    startPoint: String(routeData.origin ?? ''),
    midpoint: String(routeData.midpoint ?? ''),
    endPoint: String(routeData.destination ?? ''),
    anchorPoints: Array.isArray(routeData.anchorPoints) ? routeData.anchorPoints as RouteData['anchorPoints'] : [],
    bounds: routeData.bounds as RouteData['bounds'],
    stops,
  };
}

export async function getRoutes() {
  try {
    const response = await getRoutesFn();
    return response.data?.routes ?? [];
  } catch (error) {
    if (!isCallablePermissionError(error)) {
      throw error;
    }

    return await getRoutesFromFirestore();
  }
}

export async function getAdminRoutes() {
  try {
    const response = await getAdminRoutesFn();
    return response.data?.routes ?? [];
  } catch {
    return await getAdminRoutesFromFirestore();
  }
}

export async function getRouteDetail(routeId: string) {
  try {
    const response = await getRouteDetailFn({ routeId });
    return response.data?.route ?? null;
  } catch (error) {
    if (!isCallablePermissionError(error)) {
      throw error;
    }

    return await getRouteDetailFromFirestore(routeId);
  }
}

export async function createRoute(route: RouteUpsertInput) {
  const response = await createRouteFn(route);
  return response.data;
}

export async function updateRoute(routeId: string, route: RouteUpsertInput) {
  const response = await updateRouteFn({ routeId, route });
  return response.data;
}

export async function deleteRoute(routeId: string) {
  const response = await deleteRouteFn({ routeId });
  return response.data;
}