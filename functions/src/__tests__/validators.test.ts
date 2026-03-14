import { validateCalculateETARequest, validateRouteId, validateRouteUpsertPayload } from "../utils/validators";
import { HttpsError } from "firebase-functions/v2/https";

describe("validateCalculateETARequest", () => {
  const validPayload = {
    busLocation: { latitude: 8.994, longitude: -79.519 },
    stopLocation: { latitude: 8.993, longitude: -79.518 },
  };

  it("returns payload when valid", () => {
    const result = validateCalculateETARequest(validPayload);
    expect(result.busLocation.latitude).toBe(8.994);
  });

  it("throws invalid-argument when payload is null", () => {
    expect(() => validateCalculateETARequest(null)).toThrow(HttpsError);
    expect(() => validateCalculateETARequest(null)).toThrow("busLocation y stopLocation son requeridos");
  });

  it("throws invalid-argument when busLocation is missing", () => {
    expect(() =>
      validateCalculateETARequest({ stopLocation: validPayload.stopLocation })
    ).toThrow(HttpsError);
  });

  it("throws invalid-argument when latitude is out of range", () => {
    expect(() =>
      validateCalculateETARequest({
        busLocation: { latitude: 100, longitude: -79.519 },
        stopLocation: validPayload.stopLocation,
      })
    ).toThrow(HttpsError);
  });

  it("throws invalid-argument when longitude is out of range", () => {
    expect(() =>
      validateCalculateETARequest({
        busLocation: { latitude: 8.994, longitude: -200 },
        stopLocation: validPayload.stopLocation,
      })
    ).toThrow(HttpsError);
  });
});

describe("validateRouteId", () => {
  it("returns routeId when valid", () => {
    expect(validateRouteId("route-1")).toBe("route-1");
  });

  it("throws when routeId is empty", () => {
    expect(() => validateRouteId(" ")).toThrow(HttpsError);
  });
});

describe("validateRouteUpsertPayload", () => {
  const validPayload = {
    name: "Boquete - David",
    code: "BD-01",
    origin: "Boquete",
    midpoint: "Gualaca",
    destination: "David",
    frequency: "10 min",
    fare: "$2.50",
    geometryPolyline: "encoded-polyline",
    anchorPoints: [
      {
        label: "Boquete",
        kind: "start",
        coordinates: { latitude: 8.7801, longitude: -82.4333 },
      },
      {
        label: "Gualaca",
        kind: "mid",
        coordinates: { latitude: 8.5301, longitude: -82.2999 },
      },
      {
        label: "David",
        kind: "end",
        coordinates: { latitude: 8.4333, longitude: -82.4333 },
      },
    ],
    stops: [
      {
        name: "Parada Central",
        time: "07:00",
        coordinates: { latitude: 8.6, longitude: -82.35 },
      },
    ],
  };

  it("returns normalized route payload when valid", () => {
    const result = validateRouteUpsertPayload(validPayload);
    expect(result.status).toBe("active");
    expect(result.isActive).toBe(true);
    expect(result.anchorPoints[1].kind).toBe("mid");
    expect(result.stops).toHaveLength(1);
  });

  it("throws when payload is null", () => {
    expect(() => validateRouteUpsertPayload(null)).toThrow(HttpsError);
  });

  it("throws when anchorPoints do not include start, mid and end", () => {
    expect(() =>
      validateRouteUpsertPayload({
        ...validPayload,
        anchorPoints: validPayload.anchorPoints.filter((point) => point.kind !== "mid"),
      })
    ).toThrow(HttpsError);
  });

  it("acepta geometryPolyline vacío (backend lo computa desde OSRM)", () => {
    // geometryPolyline ya no es obligatorio: el servicio de rutas lo genera
    // internamente llamando a OSRM; el cliente puede enviarlo vacío u omitirlo.
    expect(() =>
      validateRouteUpsertPayload({
        ...validPayload,
        geometryPolyline: "",
      })
    ).not.toThrow();
  });

  it("throws when stop coordinates are invalid", () => {
    expect(() =>
      validateRouteUpsertPayload({
        ...validPayload,
        stops: [
          {
            name: "Parada rota",
            time: "08:00",
            coordinates: { latitude: 120, longitude: -82.35 },
          },
        ],
      })
    ).toThrow(HttpsError);
  });
});
