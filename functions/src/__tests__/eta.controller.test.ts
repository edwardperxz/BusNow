// Tests para eta.controller — mockea services, validator y rate limiter.

const mockCalculateETAService = jest.fn();
const mockGetRouteDirectionsService = jest.fn();
const mockValidateCalculateETARequest = jest.fn();
const mockCheckRateLimit = jest.fn().mockResolvedValue(undefined);

jest.mock("../modules/eta/eta.service", () => ({
  calculateETAService: (...args: unknown[]) => mockCalculateETAService(...args),
  getRouteDirectionsService: (...args: unknown[]) => mockGetRouteDirectionsService(...args),
}));

jest.mock("../utils/validators", () => ({
  validateCalculateETARequest: (...args: unknown[]) => mockValidateCalculateETARequest(...args),
}));

jest.mock("../utils/rateLimit", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}));

jest.mock("firebase-functions/v2/https", () => {
  const HttpsError = class extends Error {
    constructor(public code: string, message: string) {
      super(message);
    }
  };

  return {
    HttpsError,
    onCall: (_opts: unknown, handler: (req: unknown) => unknown) => handler,
  };
});

jest.mock("firebase-functions", () => ({
  logger: { error: jest.fn() },
}));

import { calculateETA, getRouteDirections } from "../modules/eta/eta.controller";
import { HttpsError } from "firebase-functions/v2/https";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(data: Record<string, unknown>, uid?: string) {
  return { data, auth: uid ? { uid } : undefined };
}

const validPayload = {
  busLocation: { latitude: 8.4333, longitude: -82.4333 },
  stopLocation: { latitude: 8.4400, longitude: -82.4300 },
};

const fakeEtaResult = {
  durationSeconds: 90,
  durationText: "2 min",
  distanceMeters: 1200,
  distanceText: "1,2 km",
  polyline: "encodedXYZ",
  startAddress: "8.4333, -82.4333",
  endAddress: "8.4400, -82.4300",
};

// ── calculateETA ──────────────────────────────────────────────────────────────

describe("calculateETA", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue(undefined);
    mockValidateCalculateETARequest.mockReturnValue(validPayload);
  });

  it("retorna { ok: true, eta, calculatedAt } en happy path", async () => {
    mockCalculateETAService.mockResolvedValueOnce(fakeEtaResult);

    const result = await (calculateETA as Function)(makeRequest(validPayload));

    expect(result.ok).toBe(true);
    expect(result.eta).toEqual(fakeEtaResult);
    expect(typeof result.calculatedAt).toBe("string");
  });

  it("pasa el payload validado al service", async () => {
    mockCalculateETAService.mockResolvedValueOnce(fakeEtaResult);

    await (calculateETA as Function)(makeRequest(validPayload));

    expect(mockCalculateETAService).toHaveBeenCalledWith(validPayload);
  });

  it("aplica rate limit cuando hay uid", async () => {
    mockCalculateETAService.mockResolvedValueOnce(fakeEtaResult);

    await (calculateETA as Function)(makeRequest(validPayload, "user-1"));

    expect(mockCheckRateLimit).toHaveBeenCalledWith("user-1", "calculateETA", expect.any(Object));
  });

  it("no aplica rate limit cuando no hay uid", async () => {
    mockCalculateETAService.mockResolvedValueOnce(fakeEtaResult);

    await (calculateETA as Function)(makeRequest(validPayload));

    expect(mockCheckRateLimit).not.toHaveBeenCalled();
  });

  it("relanza HttpsError del validator sin envolver", async () => {
    const originalError = new HttpsError("invalid-argument", "Coordenadas inválidas");
    mockValidateCalculateETARequest.mockImplementationOnce(() => { throw originalError; });

    await expect(
      (calculateETA as Function)(makeRequest({}))
    ).rejects.toBeInstanceOf(HttpsError);

    expect(mockCalculateETAService).not.toHaveBeenCalled();
  });

  it("relanza HttpsError del service sin envolver", async () => {
    const originalError = new HttpsError("failed-precondition", "OSRM error");
    mockCalculateETAService.mockRejectedValueOnce(originalError);

    await expect(
      (calculateETA as Function)(makeRequest(validPayload))
    ).rejects.toMatchObject({ code: "failed-precondition" });
  });

  it("envuelve errores desconocidos en HttpsError internal", async () => {
    mockCalculateETAService.mockRejectedValueOnce(new Error("network timeout"));

    await expect(
      (calculateETA as Function)(makeRequest(validPayload))
    ).rejects.toMatchObject({ code: "internal" });
  });
});

// ── getRouteDirections ────────────────────────────────────────────────────────

describe("getRouteDirections", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue(undefined);
  });

  it("lanza HttpsError invalid-argument cuando origin está vacío", async () => {
    await expect(
      (getRouteDirections as Function)(makeRequest({ origin: "", destination: "Romero, David" }))
    ).rejects.toMatchObject({ code: "invalid-argument" });

    expect(mockGetRouteDirectionsService).not.toHaveBeenCalled();
  });

  it("lanza HttpsError invalid-argument cuando destination está vacío", async () => {
    await expect(
      (getRouteDirections as Function)(makeRequest({ origin: "Parque Cervantes", destination: "" }))
    ).rejects.toMatchObject({ code: "invalid-argument" });
  });

  it("lanza HttpsError invalid-argument cuando faltan origin y destination", async () => {
    await expect(
      (getRouteDirections as Function)(makeRequest({}))
    ).rejects.toMatchObject({ code: "invalid-argument" });
  });

  it("retorna { ok: true, route } en happy path", async () => {
    const fakeRoute = {
      polyline: "routeEncoded",
      origin: { latitude: 8.4333, longitude: -82.4333, address: "Parque Cervantes" },
      destination: { latitude: 8.45, longitude: -82.41, address: "Romero Doleguita" },
    };
    mockGetRouteDirectionsService.mockResolvedValueOnce(fakeRoute);

    const result = await (getRouteDirections as Function)(
      makeRequest({ origin: "Parque Cervantes", destination: "Romero Doleguita" })
    );

    expect(result).toEqual({ ok: true, route: fakeRoute });
    expect(mockGetRouteDirectionsService).toHaveBeenCalledWith(
      "Parque Cervantes",
      "Romero Doleguita"
    );
  });

  it("aplica rate limit cuando hay uid", async () => {
    mockGetRouteDirectionsService.mockResolvedValueOnce({});

    await (getRouteDirections as Function)(
      makeRequest({ origin: "A", destination: "B" }, "user-2")
    );

    expect(mockCheckRateLimit).toHaveBeenCalledWith("user-2", "getRouteDirections", expect.any(Object));
  });

  it("relanza HttpsError del service sin envolver", async () => {
    const originalError = new HttpsError("failed-precondition", "Geocode falló");
    mockGetRouteDirectionsService.mockRejectedValueOnce(originalError);

    await expect(
      (getRouteDirections as Function)(makeRequest({ origin: "A", destination: "B" }))
    ).rejects.toMatchObject({ code: "failed-precondition" });
  });

  it("envuelve errores desconocidos en HttpsError internal", async () => {
    mockGetRouteDirectionsService.mockRejectedValueOnce(new Error("OSRM down"));

    await expect(
      (getRouteDirections as Function)(makeRequest({ origin: "A", destination: "B" }))
    ).rejects.toMatchObject({ code: "internal" });
  });
});
