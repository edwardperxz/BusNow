// Tests para routes.service — mockea Firestore Admin SDK.

const mockGet = jest.fn();
const mockOrderBy = jest.fn(() => ({ get: mockGet }));
const mockWhere = jest.fn(() => ({ orderBy: mockOrderBy, get: mockGet }));
const mockSubCollection = jest.fn(() => ({ orderBy: mockOrderBy }));
const mockDocGet = jest.fn();
const mockDoc = jest.fn(() => ({
  get: mockDocGet,
  collection: mockSubCollection,
}));
const mockCollection = jest.fn(() => ({
  where: mockWhere,
  doc: mockDoc,
}));

jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(() => ({ collection: mockCollection })),
}));

import { getRoutesService, getRouteDetailService } from "../modules/routes/routes.service";

describe("getRoutesService", () => {
  it("returns mapped RouteListItem array", async () => {
    mockGet.mockResolvedValueOnce({
      docs: [
        {
          id: "route-1",
          data: () => ({
            name: "Ruta Centro",
            origin: "Plaza Mayor",
            destination: "Universidad",
            frequency: "5-8 min",
            fare: "Q2.50",
            status: "active",
            activeBuses: 2,
            isActive: true,
          }),
        },
      ],
    });

    const routes = await getRoutesService();
    expect(routes).toHaveLength(1);
    expect(routes[0].name).toBe("Ruta Centro");
    expect(routes[0].status).toBe("active");
  });

  it("returns empty array when no routes", async () => {
    mockGet.mockResolvedValueOnce({ docs: [] });
    const routes = await getRoutesService();
    expect(routes).toEqual([]);
  });
});

describe("getRouteDetailService", () => {
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
        origin: "Plaza Mayor",
        destination: "Universidad",
        frequency: "5-8 min",
        fare: "Q2.50",
        status: "active",
        activeBuses: 2,
      }),
    });

    mockGet.mockResolvedValueOnce({
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
  });
});
