// Tests para eta.service — mockea axios (OSRM + Nominatim) y eta.repository.

const mockGetETAFromCache = jest.fn();
const mockSaveETAToCache = jest.fn().mockResolvedValue(undefined);

jest.mock("../modules/eta/eta.repository", () => ({
  getETAFromCache: (...args: unknown[]) => mockGetETAFromCache(...args),
  saveETAToCache: (...args: unknown[]) => mockSaveETAToCache(...args),
}));

const mockAxiosGet = jest.fn();
jest.mock("axios", () => ({ get: (...args: unknown[]) => mockAxiosGet(...args) }));

import { calculateETAService, getRouteDirectionsService } from "../modules/eta/eta.service";
import { HttpsError } from "firebase-functions/v2/https";

// ── Helpers ──────────────────────────────────────────────────────────────────

const okOsrmResponse = (distance = 1500, duration = 120, geometry = "_p~iF~ps|U") => ({
  data: {
    code: "Ok",
    routes: [{ distance, duration, geometry }],
  },
});

const nominatimResult = (lat: string, lon: string, name = "David, Chiriquí") => ({
  data: [{ lat, lon, display_name: name, name }],
});

const busLocation = { latitude: 8.4333, longitude: -82.4333 };
const stopLocation = { latitude: 8.4400, longitude: -82.4300 };

// ── calculateETAService ───────────────────────────────────────────────────────

describe("calculateETAService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetETAFromCache.mockResolvedValue(null);
  });

  it("retorna resultado del cache cuando está disponible", async () => {
    const cached = {
      durationSeconds: 90,
      durationText: "2 min",
      distanceMeters: 1200,
      distanceText: "1,2 km",
      polyline: "abc",
      startAddress: "lat1",
      endAddress: "lat2",
    };
    mockGetETAFromCache.mockResolvedValueOnce(cached);

    const result = await calculateETAService({ busLocation, stopLocation });

    expect(result).toEqual(cached);
    expect(mockAxiosGet).not.toHaveBeenCalled();
  });

  it("llama a OSRM cuando el cache está vacío", async () => {
    mockAxiosGet.mockResolvedValueOnce(okOsrmResponse(1500, 120));

    const result = await calculateETAService({ busLocation, stopLocation });

    expect(mockAxiosGet).toHaveBeenCalledTimes(1);
    const url: string = mockAxiosGet.mock.calls[0][0];
    expect(url).toMatch(/\/route\/v1\/driving\//);
    expect(result.durationSeconds).toBe(120);
    expect(result.distanceMeters).toBe(1500);
  });

  it("formatea distancia < 1 km en metros", async () => {
    mockAxiosGet.mockResolvedValueOnce(okOsrmResponse(800, 60));

    const result = await calculateETAService({ busLocation, stopLocation });
    expect(result.distanceText).toBe("800 m");
  });

  it("formatea distancia >= 1 km en kilómetros", async () => {
    mockAxiosGet.mockResolvedValueOnce(okOsrmResponse(2500, 300));

    const result = await calculateETAService({ busLocation, stopLocation });
    expect(result.distanceText).toBe("2,5 km");
  });

  it("formatea duración < 60 min en minutos", async () => {
    mockAxiosGet.mockResolvedValueOnce(okOsrmResponse(500, 180)); // 3 min

    const result = await calculateETAService({ busLocation, stopLocation });
    expect(result.durationText).toBe("3 min");
  });

  it("formatea duración >= 60 min en horas y minutos", async () => {
    mockAxiosGet.mockResolvedValueOnce(okOsrmResponse(50000, 4500)); // 75 min = 1h 15min

    const result = await calculateETAService({ busLocation, stopLocation });
    expect(result.durationText).toBe("1 h 15 min");
  });

  it("formatea duración exacta en horas sin minutos sobrantes", async () => {
    mockAxiosGet.mockResolvedValueOnce(okOsrmResponse(50000, 7200)); // 120 min = 2h

    const result = await calculateETAService({ busLocation, stopLocation });
    expect(result.durationText).toBe("2 h");
  });

  it("devuelve duración mínima de 1 min para duraciones muy cortas", async () => {
    mockAxiosGet.mockResolvedValueOnce(okOsrmResponse(50, 20)); // 20s → ≤1 min

    const result = await calculateETAService({ busLocation, stopLocation });
    expect(result.durationText).toBe("1 min");
  });

  it("incluye la polyline en el resultado", async () => {
    mockAxiosGet.mockResolvedValueOnce(okOsrmResponse(1000, 60, "encodedPolylineXYZ"));

    const result = await calculateETAService({ busLocation, stopLocation });
    expect(result.polyline).toBe("encodedPolylineXYZ");
  });

  it("guarda el resultado en cache después de calcularlo", async () => {
    mockAxiosGet.mockResolvedValueOnce(okOsrmResponse(1000, 90));

    await calculateETAService({ busLocation, stopLocation });

    expect(mockSaveETAToCache).toHaveBeenCalledWith(
      busLocation.latitude,
      busLocation.longitude,
      stopLocation.latitude,
      stopLocation.longitude,
      expect.objectContaining({ durationSeconds: 90 })
    );
  });

  it("lanza HttpsError cuando OSRM devuelve código de error", async () => {
    mockAxiosGet.mockResolvedValueOnce({
      data: { code: "NoRoute", routes: [] },
    });

    await expect(
      calculateETAService({ busLocation, stopLocation })
    ).rejects.toBeInstanceOf(HttpsError);
  });

  it("propaga error de red de axios", async () => {
    mockAxiosGet.mockRejectedValueOnce(new Error("Network Error"));

    await expect(
      calculateETAService({ busLocation, stopLocation })
    ).rejects.toThrow();
  });
});

// ── getRouteDirectionsService ─────────────────────────────────────────────────

describe("getRouteDirectionsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("geocodifica origen y destino, luego llama a OSRM", async () => {
    // Primera llamada → geocode origen
    mockAxiosGet.mockResolvedValueOnce(
      nominatimResult("8.4333", "-82.4333", "Parque Cervantes, David")
    );
    // Segunda llamada → geocode destino
    mockAxiosGet.mockResolvedValueOnce(
      nominatimResult("8.4500", "-82.4100", "Romero Doleguita, David")
    );
    // Tercera llamada → OSRM route
    mockAxiosGet.mockResolvedValueOnce(okOsrmResponse(5000, 600, "routePolyline"));

    const result = await getRouteDirectionsService(
      "Parque Cervantes, David",
      "Romero Doleguita, David"
    );

    expect(mockAxiosGet).toHaveBeenCalledTimes(3);
    expect(result.polyline).toBe("routePolyline");
    expect(result.origin.address).toBe("Parque Cervantes, David");
    expect(result.destination.address).toBe("Romero Doleguita, David");
  });

  it("retorna coordenadas correctas de origen y destino", async () => {
    mockAxiosGet
      .mockResolvedValueOnce(nominatimResult("8.4333", "-82.4333", "Origen"))
      .mockResolvedValueOnce(nominatimResult("8.5000", "-82.5000", "Destino"))
      .mockResolvedValueOnce(okOsrmResponse());

    const result = await getRouteDirectionsService("Origen", "Destino");

    expect(result.origin.latitude).toBeCloseTo(8.4333);
    expect(result.origin.longitude).toBeCloseTo(-82.4333);
    expect(result.destination.latitude).toBeCloseTo(8.5);
    expect(result.destination.longitude).toBeCloseTo(-82.5);
  });

  it("lanza HttpsError cuando Nominatim no encuentra el origen", async () => {
    mockAxiosGet.mockResolvedValueOnce({ data: [] }); // sin resultados

    await expect(
      getRouteDirectionsService("Dirección inexistente XYZ", "Destino")
    ).rejects.toBeInstanceOf(HttpsError);
  });

  it("lanza HttpsError cuando Nominatim devuelve coordenadas inválidas", async () => {
    mockAxiosGet.mockResolvedValueOnce(
      nominatimResult("INVALID", "INVALID", "Lugar roto")
    );

    await expect(
      getRouteDirectionsService("Lugar roto", "Destino")
    ).rejects.toBeInstanceOf(HttpsError);
  });
});
