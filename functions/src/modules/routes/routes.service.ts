import { getFirestore } from "firebase-admin/firestore";
import { RouteDetail, RouteListItem, RouteStop } from "../../types/routes";

export async function getRoutesService(): Promise<RouteListItem[]> {
  const db = getFirestore();
  const snap = await db
    .collection("routes")
    .where("isActive", "==", true)
    .orderBy("name")
    .get();

  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id,
      name: d.name ?? "",
      origin: d.origin ?? "",
      destination: d.destination ?? "",
      frequency: d.frequency ?? "",
      fare: d.fare ?? "",
      status: d.status ?? "active",
      activeBuses: d.activeBuses ?? 0,
      color: d.color,
    } satisfies RouteListItem;
  });
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

  const d = routeSnap.data()!;

  const stops: RouteStop[] = stopsSnap.docs.map((doc) => {
    const s = doc.data();
    return {
      id: doc.id,
      name: s.name ?? "",
      time: s.time ?? "",
      coordinates: {
        latitude: s.coordinates?.latitude ?? 0,
        longitude: s.coordinates?.longitude ?? 0,
      },
      isActive: s.isActive ?? false,
      order: s.order ?? 0,
    };
  });

  return {
    id: routeSnap.id,
    name: d.name ?? "",
    origin: d.origin ?? "",
    destination: d.destination ?? "",
    startPoint: d.origin ?? "",
    endPoint: d.destination ?? "",
    frequency: d.frequency ?? "",
    fare: d.fare ?? "",
    status: d.status ?? "active",
    activeBuses: d.activeBuses ?? 0,
    color: d.color,
    stops,
  };
}
