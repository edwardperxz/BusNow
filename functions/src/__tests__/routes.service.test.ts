// Tests para routes.service — mockea Firestore Admin SDK.

// Mock de route-geometry para no llamar a OSRM en tests.
const mockGenerateRouteGeometry = jest.fn();
jest.mock("../modules/routes/route-geometry", () => ({
  generateRouteGeometry: (...args: unknown[]) => mockGenerateRouteGeometry(...args),
}));

const mockListGet = jest.fn();
const mockStopsOrderedGet = jest.fn();
const mockStopsGet = jest.fn();
const mockRouteSet = jest.fn();
const mockBatchCommit = jest.fn();
const mockBatchDelete = jest.fn();
const mockBatchSet = jest.fn();
const mockBatch = {
  delete: mockBatchDelete,
  set: mockBatchSet,
  commit: mockBatchCommit,
};
const mockStopDoc = jest.fn((id?: string) => ({ id: id ?? "generated-stop-id", path: `routes/route-1/stops/${id ?? "generated-stop-id"}` }));
const mockOrderBy = jest.fn(() => ({ get: mockStopsOrderedGet }));
const mockWhere = jest.fn(() => ({ orderBy: jest.fn(() => ({ get: mockListGet })) }));
const mockSubCollection = jest.fn(() => ({ orderBy: mockOrderBy, get: mockStopsGet, doc: mockStopDoc }));
const mockDocGet = jest.fn();
const routeRef = {
  id: "route-created",
  get: mockDocGet,
  set: mockRouteSet,
  collection: mockSubCollection,
};
const mockDoc = jest.fn(() => routeRef);
const mockCollection = jest.fn(() => ({
  where: mockWhere,
  orderBy: jest.fn(() => ({ get: mockListGet })),
  doc: mockDoc,
}));

jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(() => ({ collection: mockCollection, batch: jest.fn(() => mockBatch) })),
}));

import {
  createRouteService,
  deleteRouteService,
  getAdminRoutesService,
  getRouteDetailService,
  getRoutesService,
  updateRouteService,
} from "../modules/routes/routes.service";

const routePayload = {
  name: "Ruta Centro",
  code: "RC-01",
  origin: "Plaza Mayor",
  midpoint: "Mercado",
  destination: "Universidad",
  frequency: "5-8 min",
  fare: "Q2.50",
  status: "active" as const,
  color: "#FF9800",
  isActive: true,
  geometryPolyline: "encoded-route",
  anchorPoints: [
    { label: "Plaza Mayor", kind: "start" as const, order: 1, coordinates: { latitude: 8.99, longitude: -79.51 } },
    { label: "Mercado", kind: "mid" as const, order: 2, coordinates: { latitude: 8.98, longitude: -79.5 } },
    { label: "Universidad", kind: "end" as const, order: 3, coordinates: { latitude: 8.97, longitude: -79.49 } },
  ],
  stops: [
    { id: "stop-1", name: "Parada 1", time: "7:00 AM", coordinates: { latitude: 8.994, longitude: -79.519 }, isActive: true, order: 1 },
  ],
};

describe("getRoutesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns mapped RouteListItem array", async () => {
    mockListGet.mockResolvedValueOnce({
      docs: [
        {
          id: "route-1",
          data: () => ({
            name: "Ruta Centro",
            code: "RC-01",
            origin: "Plaza Mayor",
            midpoint: "Mercado",
            destination: "Universidad",
            frequency: "5-8 min",
            fare: "Q2.50",
            status: "active",
            activeBuses: 2,
            isActive: true,
            geometryPolyline: "encoded-route",
            anchorPoints: routePayload.anchorPoints,
          }),
        },
      ],
    });

    const routes = await getRoutesService();
    expect(routes).toHaveLength(1);
    expect(routes[0].name).toBe("Ruta Centro");
    expect(routes[0].status).toBe("active");
    expect(routes[0].midpoint).toBe("Mercado");
    expect(routes[0].anchorPointsCount).toBe(3);
  });

  it("returns empty array when no routes", async () => {
    mockListGet.mockResolvedValueOnce({ docs: [] });
    const routes = await getRoutesService();
    expect(routes).toEqual([]);
  });
});

describe("getAdminRoutesService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns all routes without filtering by isActive", async () => {
    mockListGet.mockResolvedValueOnce({
      docs: [
        {
          id: "route-1",
          data: () => ({
            name: "Ruta Centro",
            code: "RC-01",
            origin: "Plaza Mayor",
            midpoint: "Mercado",
            destination: "Universidad",
            frequency: "5-8 min",
            fare: "Q2.50",
            status: "maintenance",
            activeBuses: 0,
            isActive: false,
            geometryPolyline: "encoded-route",
            anchorPoints: routePayload.anchorPoints,
          }),
        },
      ],
    });

    const routes = await getAdminRoutesService();
    expect(routes[0].isActive).toBe(false);
    expect(routes[0].status).toBe("maintenance");
  });
});

describe("getRouteDetailService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("throws when route does not exist", async () => {
    mockDocGet.mockResolvedValueOnce({ exists: false });
    await expect(getRouteDetailService("invalid-id")).rejects.toThrow("not found");
  });

  it("returns RouteDetail with stops", async () => {
    mockDocGet.mockResolvedValueOnce({
      exists: true,
      id: "route-1",
      data: () => ({
        name: "Ruta Centro",
        code: "RC-01",
        origin: "Plaza Mayor",
        midpoint: "Mercado",
        destination: "Universidad",
        frequency: "5-8 min",
        fare: "Q2.50",
        status: "active",
        activeBuses: 2,
        geometryPolyline: "encoded-route",
        anchorPoints: routePayload.anchorPoints,
      }),
    });

    mockStopsOrderedGet.mockResolvedValueOnce({
      docs: [
        {
          id: "stop-1",
          data: () => ({
            name: "Parada 1",
            time: "7:00 AM",
            coordinates: { latitude: 8.994, longitude: -79.519 },
            isActive: true,
            order: 1,
          }),
        },
      ],
    });

    const detail = await getRouteDetailService("route-1");
    expect(detail.stops).toHaveLength(1);
    expect(detail.stops[0].name).toBe("Parada 1");
    expect(detail.startPoint).toBe("Plaza Mayor");
    expect(detail.endPoint).toBe("Universidad");
    expect(detail.midpoint).toBe("Mercado");
    expect(detail.anchorPoints).toHaveLength(3);
  });
});

describe("route admin services", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockStopsGet.mockResolvedValue({ docs: [] });
    mockBatchCommit.mockResolvedValue(undefined);
    mockRouteSet.mockResolvedValue(undefined);
    mockGenerateRouteGeometry.mockResolvedValue({
      geometryPolyline: "osrm-polyline",
      bounds: { north: 9.0, south: 8.97, east: -79.49, west: -79.51 },
    });
  });

  it("creates route document and replaces stops", async () => {
    const result = await createRouteService(routePayload, "admin-1");

    expect(result).toEqual({ ok: true, routeId: "route-created" });
    expect(mockGenerateRouteGeometry).toHaveBeenCalledWith([
      expect.objectContaining({ latitude: expect.any(Number), longitude: expect.any(Number) }),
      expect.objectContaining({ latitude: expect.any(Number), longitude: expect.any(Number) }),
      expect.objectContaining({ latitude: expect.any(Number), longitude: expect.any(Number) }),
    ]);
    expect(mockRouteSet).toHaveBeenCalledWith(expect.objectContaining({
      code: "RC-01",
      midpoint: "Mercado",
      geometryPolyline: "osrm-polyline",
      createdBy: "admin-1",
      updatedBy: "admin-1",
    }));
    expect(mockBatchSet).toHaveBeenCalled();
    expect(mockBatchCommit).toHaveBeenCalled();
  });

  it("updates an existing route", async () => {
    mockDocGet.mockResolvedValueOnce({ exists: true });

    const result = await updateRouteService("route-1", routePayload, "admin-2");

    expect(result).toEqual({ ok: true, routeId: "route-1" });
    expect(mockRouteSet).toHaveBeenCalledWith(expect.objectContaining({
      midpoint: "Mercado",
      updatedBy: "admin-2",
    }), { merge: true });
    expect(mockBatchCommit).toHaveBeenCalled();
  });

  it("throws when updating a missing route", async () => {
    mockDocGet.mockResolvedValueOnce({ exists: false });
    await expect(updateRouteService("route-x", routePayload, "admin-2")).rejects.toThrow("not found");
  });

  it("deletes route and nested stops", async () => {
    mockDocGet.mockResolvedValueOnce({ exists: true });
    mockStopsGet.mockResolvedValueOnce({ docs: [{ ref: { path: "routes/route-1/stops/stop-1" } }] });

    const result = await deleteRouteService("route-1");

    expect(result).toEqual({ ok: true, routeId: "route-1" });
    expect(mockBatchDelete).toHaveBeenCalled();
    expect(mockBatchCommit).toHaveBeenCalled();
  });
});
