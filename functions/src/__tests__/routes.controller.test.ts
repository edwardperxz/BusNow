const mockGetRoutesService = jest.fn();
const mockGetRouteDetailService = jest.fn();
const mockGetAdminRoutesService = jest.fn();
const mockCreateRouteService = jest.fn();
const mockUpdateRouteService = jest.fn();
const mockDeleteRouteService = jest.fn();
const mockValidateRouteId = jest.fn();
const mockValidateRouteUpsertPayload = jest.fn();
const mockAdminUserGet = jest.fn();

jest.mock("../modules/routes/routes.service", () => ({
  getRoutesService: (...args: unknown[]) => mockGetRoutesService(...args),
  getRouteDetailService: (...args: unknown[]) => mockGetRouteDetailService(...args),
  getAdminRoutesService: (...args: unknown[]) => mockGetAdminRoutesService(...args),
  createRouteService: (...args: unknown[]) => mockCreateRouteService(...args),
  updateRouteService: (...args: unknown[]) => mockUpdateRouteService(...args),
  deleteRouteService: (...args: unknown[]) => mockDeleteRouteService(...args),
}));

jest.mock("../utils/validators", () => ({
  validateRouteId: (...args: unknown[]) => mockValidateRouteId(...args),
  validateRouteUpsertPayload: (...args: unknown[]) => mockValidateRouteUpsertPayload(...args),
}));

jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(() => ({
    collection: jest.fn((name: string) => {
      if (name !== "users") {
        throw new Error(`Unexpected collection ${name}`);
      }

      return {
        doc: jest.fn(() => ({
          get: mockAdminUserGet,
        })),
      };
    }),
  })),
}));

jest.mock("firebase-functions/v2/https", () => {
  const HttpsError = class extends Error {
    constructor(public code: string, message: string) {
      super(message);
    }
  };

  return {
    HttpsError,
    onCall: (optsOrHandler: unknown, maybeHandler?: (req: unknown) => unknown) => {
      if (typeof optsOrHandler === "function") {
        return optsOrHandler;
      }

      return maybeHandler;
    },
  };
});

jest.mock("firebase-functions", () => ({
  logger: { error: jest.fn() },
}));

import {
  createRoute,
  deleteRoute,
  getAdminRoutes,
  getRouteDetail,
  getRoutes,
  updateRoute,
} from "../modules/routes/routes.controller";
import { HttpsError } from "firebase-functions/v2/https";

function makeRequest(data: Record<string, unknown>, uid?: string) {
  return { data, auth: uid ? { uid } : undefined };
}

const validRoutePayload = {
  name: "Ruta Centro",
  code: "RC-01",
};

describe("routes.controller", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetRoutesService.mockReset();
    mockGetRouteDetailService.mockReset();
    mockGetAdminRoutesService.mockReset();
    mockCreateRouteService.mockReset();
    mockUpdateRouteService.mockReset();
    mockDeleteRouteService.mockReset();
    mockValidateRouteId.mockReset();
    mockValidateRouteUpsertPayload.mockReset();
    mockAdminUserGet.mockReset();
    mockAdminUserGet.mockResolvedValue({ data: () => ({ role: "admin" }) });
    mockValidateRouteId.mockReturnValue("route-1");
    mockValidateRouteUpsertPayload.mockReturnValue(validRoutePayload);
  });

  it("getRoutes returns public routes", async () => {
    mockGetRoutesService.mockResolvedValueOnce([{ id: "route-1" }]);

    const result = await (getRoutes as Function)(makeRequest({}));
    expect(result).toEqual({ ok: true, routes: [{ id: "route-1" }] });
  });

  it("getAdminRoutes only works for admins", async () => {
    mockGetRoutesService.mockReset();
    mockAdminUserGet.mockResolvedValueOnce({ data: () => ({ role: "admin" }) });
    mockGetAdminRoutesService.mockResolvedValueOnce([{ id: "admin-route" }]);

    const result = await (getAdminRoutes as Function)(makeRequest({}, "admin-1"));
    expect(result).toEqual({ ok: true, routes: [{ id: "admin-route" }] });
  });

  it("getRouteDetail validates routeId and returns route", async () => {
    mockGetRouteDetailService.mockResolvedValueOnce({ id: "route-1" });

    const result = await (getRouteDetail as Function)(makeRequest({ routeId: "route-1" }));
    expect(result).toEqual({ ok: true, route: { id: "route-1" } });
  });

  it("createRoute rejects unauthenticated users", async () => {
    await expect((createRoute as Function)(makeRequest(validRoutePayload))).rejects.toMatchObject({
      code: "unauthenticated",
    });
  });

  it("createRoute rejects non-admin users", async () => {
    mockAdminUserGet.mockResolvedValueOnce({ data: () => ({ role: "driver" }) });

    await expect((createRoute as Function)(makeRequest(validRoutePayload, "driver-1"))).rejects.toMatchObject({
      code: "permission-denied",
    });
  });

  it("createRoute validates payload and calls service for admins", async () => {
    mockCreateRouteService.mockResolvedValueOnce({ ok: true, routeId: "route-1" });

    const result = await (createRoute as Function)(makeRequest(validRoutePayload, "admin-1"));

    expect(result).toEqual({ ok: true, routeId: "route-1" });
    expect(mockValidateRouteUpsertPayload).toHaveBeenCalledWith(validRoutePayload);
    expect(mockCreateRouteService).toHaveBeenCalledWith(validRoutePayload, "admin-1");
  });

  it("updateRoute validates routeId and route payload", async () => {
    mockUpdateRouteService.mockResolvedValueOnce({ ok: true, routeId: "route-1" });

    const result = await (updateRoute as Function)(makeRequest({ routeId: "route-1", route: validRoutePayload }, "admin-1"));

    expect(result).toEqual({ ok: true, routeId: "route-1" });
    expect(mockValidateRouteId).toHaveBeenCalledWith("route-1");
    expect(mockValidateRouteUpsertPayload).toHaveBeenCalledWith(validRoutePayload);
  });

  it("deleteRoute validates routeId and calls service", async () => {
    mockDeleteRouteService.mockResolvedValueOnce({ ok: true, routeId: "route-1" });

    const result = await (deleteRoute as Function)(makeRequest({ routeId: "route-1" }, "admin-1"));

    expect(result).toEqual({ ok: true, routeId: "route-1" });
    expect(mockDeleteRouteService).toHaveBeenCalledWith("route-1");
  });

  it("maps missing route errors to HttpsError not-found", async () => {
    mockDeleteRouteService.mockRejectedValueOnce(new Error("Route route-1 not found"));

    const resultPromise = (deleteRoute as Function)(makeRequest({ routeId: "route-1" }, "admin-1"));

    await expect(resultPromise).rejects.toBeInstanceOf(HttpsError);
    await expect(resultPromise).rejects.toMatchObject({ code: "not-found" });
  });
});