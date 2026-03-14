import { getFirestore } from "firebase-admin/firestore";
import {
  RouteAnchorPoint,
  RouteDetail,
  RouteListItem,
  RouteStop,
  RouteStopInput,
  RouteUpsertPayload,
} from "../../types/routes";
import { generateRouteGeometry } from "./route-geometry";

type RouteDocument = {
  name?: string;
  code?: string;
  origin?: string;
  midpoint?: string;
  destination?: string;
  frequency?: string;
  fare?: string;
  status?: "active" | "limited" | "maintenance";
  activeBuses?: number;
  color?: string;
  isActive?: boolean;
  geometryPolyline?: string;
  anchorPoints?: RouteAnchorPoint[];
  bounds?: RouteDetail["bounds"];
};

function mapRouteListItem(id: string, d: RouteDocument): RouteListItem {
  return {
    id,
    name: d.name ?? "",
    code: d.code ?? "",
    origin: d.origin ?? "",
    midpoint: d.midpoint ?? "",
    destination: d.destination ?? "",
    frequency: d.frequency ?? "",
    fare: d.fare ?? "",
    status: d.status ?? "active",
    activeBuses: d.activeBuses ?? 0,
    color: d.color,
    isActive: d.isActive ?? true,
    geometryPolyline: d.geometryPolyline ?? "",
    anchorPointsCount: d.anchorPoints?.length ?? 0,
  };
}

function normalizeStops(docs: Array<{ id: string; data: () => Record<string, unknown> }>): RouteStop[] {
  return docs.map((doc) => {
    const s = doc.data();
    return {
      id: doc.id,
      name: String(s.name ?? ""),
      time: String(s.time ?? ""),
      coordinates: {
        latitude: Number((s.coordinates as { latitude?: number } | undefined)?.latitude ?? 0),
        longitude: Number((s.coordinates as { longitude?: number } | undefined)?.longitude ?? 0),
      },
      isActive: Boolean(s.isActive ?? false),
      order: Number(s.order ?? 0),
    } satisfies RouteStop;
  });
}

async function replaceStops(routeRef: any, stops: RouteStopInput[]) {
  const db = getFirestore();
  const existingStopsSnap = await routeRef.collection("stops").get();
  const batch = db.batch();

  existingStopsSnap.docs.forEach((docSnap: { ref: unknown }) => {
    batch.delete(docSnap.ref as any);
  });

  stops.forEach((stop, index) => {
    const stopId = stop.id?.trim() || `stop-${index + 1}`;
    const stopRef = routeRef.collection("stops").doc(stopId);
    batch.set(stopRef, {
      name: stop.name,
      time: stop.time,
      coordinates: stop.coordinates,
      isActive: stop.isActive ?? false,
      order: stop.order ?? index + 1,
    });
  });

  await batch.commit();
}

export async function getRoutesService(): Promise<RouteListItem[]> {
  const db = getFirestore();
  const snap = await db
    .collection("routes")
    .where("isActive", "==", true)
    .orderBy("name")
    .get();

  return snap.docs.map((doc) => mapRouteListItem(doc.id, doc.data()));
}

export async function getAdminRoutesService(): Promise<RouteListItem[]> {
  const db = getFirestore();
  const snap = await db.collection("routes").orderBy("name").get();
  return snap.docs.map((doc) => mapRouteListItem(doc.id, doc.data()));
}

export async function getRouteDetailService(routeId: string): Promise<RouteDetail> {
  const db = getFirestore();
  const routeRef = db.collection("routes").doc(routeId);

  const [routeSnap, stopsSnap] = await Promise.all([
    routeRef.get(),
    routeRef.collection("stops").orderBy("order").get(),
  ]);

  if (!routeSnap.exists) {
    throw new Error(`Route ${routeId} not found`);
  }

  const d = routeSnap.data() as RouteDocument;

  const stops = normalizeStops(stopsSnap.docs);
  const listItem = mapRouteListItem(routeSnap.id, d);

  return {
    ...listItem,
    startPoint: d.origin ?? "",
    endPoint: d.destination ?? "",
    midpoint: d.midpoint ?? "",
    anchorPoints: d.anchorPoints ?? [],
    bounds: d.bounds,
    stops,
  };
}

export async function createRouteService(payload: RouteUpsertPayload, actorUid: string) {
  const db = getFirestore();
  const routeRef = db.collection("routes").doc();

  // Generar trazado real de carretera usando OSRM a partir de los anchorPoints
  // ordenados. El resultado sobreescribe cualquier geometryPolyline/bounds que
  // haya enviado el cliente.
  const sortedAnchors = [...payload.anchorPoints]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((p) => p.coordinates);
  const { geometryPolyline, bounds } = await generateRouteGeometry(sortedAnchors);

  await routeRef.set({
    name: payload.name,
    code: payload.code,
    origin: payload.origin,
    midpoint: payload.midpoint,
    destination: payload.destination,
    frequency: payload.frequency,
    fare: payload.fare,
    status: payload.status ?? "active",
    activeBuses: payload.activeBuses ?? 0,
    color: payload.color,
    isActive: payload.isActive ?? true,
    geometryPolyline,
    anchorPoints: payload.anchorPoints,
    bounds,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: actorUid,
    updatedBy: actorUid,
  });

  await replaceStops(routeRef, payload.stops ?? []);

  return { ok: true, routeId: routeRef.id };
}

export async function updateRouteService(routeId: string, payload: RouteUpsertPayload, actorUid: string) {
  const db = getFirestore();
  const routeRef = db.collection("routes").doc(routeId);
  const routeSnap = await routeRef.get();

  if (!routeSnap.exists) {
    throw new Error(`Route ${routeId} not found`);
  }

  // Regenerar trazado de carretera con OSRM para los anchorPoints actualizados.
  const sortedAnchors = [...payload.anchorPoints]
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
    .map((p) => p.coordinates);
  const { geometryPolyline, bounds } = await generateRouteGeometry(sortedAnchors);

  await routeRef.set(
    {
      name: payload.name,
      code: payload.code,
      origin: payload.origin,
      midpoint: payload.midpoint,
      destination: payload.destination,
      frequency: payload.frequency,
      fare: payload.fare,
      status: payload.status ?? "active",
      activeBuses: payload.activeBuses ?? 0,
      color: payload.color,
      isActive: payload.isActive ?? true,
      geometryPolyline,
      anchorPoints: payload.anchorPoints,
      bounds,
      updatedAt: new Date().toISOString(),
      updatedBy: actorUid,
    },
    { merge: true }
  );

  await replaceStops(routeRef, payload.stops ?? []);

  return { ok: true, routeId };
}

export async function deleteRouteService(routeId: string) {
  const db = getFirestore();
  const routeRef = db.collection("routes").doc(routeId);
  const routeSnap = await routeRef.get();

  if (!routeSnap.exists) {
    throw new Error(`Route ${routeId} not found`);
  }

  const stopsSnap = await routeRef.collection("stops").get();
  const batch = db.batch();

  stopsSnap.docs.forEach((docSnap: { ref: unknown }) => {
    batch.delete(docSnap.ref as any);
  });
  batch.delete(routeRef);

  await batch.commit();

  return { ok: true, routeId };
}
