// Tests para places.controller — mockea services y rate limiter.

const mockPlacesAutocompleteService = jest.fn();
const mockPlaceDetailsService = jest.fn();
const mockCheckRateLimit = jest.fn().mockResolvedValue(undefined);

jest.mock("../modules/places/places.service", () => ({
  placesAutocompleteService: (...args: unknown[]) => mockPlacesAutocompleteService(...args),
  placeDetailsService: (...args: unknown[]) => mockPlaceDetailsService(...args),
}));

jest.mock("../utils/rateLimit", () => ({
  checkRateLimit: (...args: unknown[]) => mockCheckRateLimit(...args),
}));

// Stub mínimo de firebase-functions para que onCall no falle en tests
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

// Importar después de los mocks para que el módulo use los stubs
import { placesAutocomplete, placeDetails } from "../modules/places/places.controller";
import { HttpsError } from "firebase-functions/v2/https";

// ── Helpers ───────────────────────────────────────────────────────────────────

function makeRequest(data: Record<string, unknown>, uid?: string) {
  return { data, auth: uid ? { uid } : undefined };
}

// ── placesAutocomplete ─────────────────────────────────────────────────────────

describe("placesAutocomplete", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue(undefined);
  });

  it("retorna { ok: true, predictions: [] } cuando query < 3 chars", async () => {
    const result = await (placesAutocomplete as Function)(makeRequest({ query: "ab" }));
    expect(result).toEqual({ ok: true, predictions: [] });
    expect(mockPlacesAutocompleteService).not.toHaveBeenCalled();
  });

  it("retorna { ok: true, predictions: [] } cuando query está vacía", async () => {
    const result = await (placesAutocomplete as Function)(makeRequest({}));
    expect(result).toEqual({ ok: true, predictions: [] });
  });

  it("llama al service y retorna predicciones en happy path", async () => {
    const fakePredictions = [{ place_id: "coord:8.4,-82.4", description: "David" }];
    mockPlacesAutocompleteService.mockResolvedValueOnce(fakePredictions);

    const result = await (placesAutocomplete as Function)(
      makeRequest({ query: "David", countryCode: "PA", location: "8.4333,-82.4333", radius: 50000 })
    );

    expect(result).toEqual({ ok: true, predictions: fakePredictions });
    expect(mockPlacesAutocompleteService).toHaveBeenCalledWith({
      query: "David",
      countryCode: "PA",
      location: "8.4333,-82.4333",
      radius: 50000,
    });
  });

  it("aplica rate limit cuando hay uid", async () => {
    mockPlacesAutocompleteService.mockResolvedValueOnce([]);
    await (placesAutocomplete as Function)(makeRequest({ query: "David" }, "user-123"));

    expect(mockCheckRateLimit).toHaveBeenCalledWith("user-123", "placesAutocomplete", expect.any(Object));
  });

  it("no aplica rate limit cuando no hay uid", async () => {
    mockPlacesAutocompleteService.mockResolvedValueOnce([]);
    await (placesAutocomplete as Function)(makeRequest({ query: "David" }));

    expect(mockCheckRateLimit).not.toHaveBeenCalled();
  });

  it("relanza HttpsError del service sin envolver", async () => {
    const originalError = new HttpsError("resource-exhausted", "Límite alcanzado");
    mockPlacesAutocompleteService.mockRejectedValueOnce(originalError);

    await expect(
      (placesAutocomplete as Function)(makeRequest({ query: "David" }))
    ).rejects.toBeInstanceOf(HttpsError);
  });

  it("envuelve errores desconocidos en HttpsError internal", async () => {
    mockPlacesAutocompleteService.mockRejectedValueOnce(new Error("red caída"));

    await expect(
      (placesAutocomplete as Function)(makeRequest({ query: "David" }))
    ).rejects.toMatchObject({ code: "internal" });
  });
});

// ── placeDetails ───────────────────────────────────────────────────────────────

describe("placeDetails", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockCheckRateLimit.mockResolvedValue(undefined);
  });

  it("lanza HttpsError invalid-argument cuando placeId está vacío", async () => {
    await expect(
      (placeDetails as Function)(makeRequest({ placeId: "" }))
    ).rejects.toMatchObject({ code: "invalid-argument" });

    expect(mockPlaceDetailsService).not.toHaveBeenCalled();
  });

  it("lanza HttpsError invalid-argument cuando no se envía placeId", async () => {
    await expect(
      (placeDetails as Function)(makeRequest({}))
    ).rejects.toMatchObject({ code: "invalid-argument" });
  });

  it("retorna { ok: true, result } en happy path", async () => {
    const fakeResult = {
      place_id: "coord:8.4333,-82.4333",
      name: "David",
      formatted_address: "David, Chiriquí",
      geometry: { location: { lat: 8.4333, lng: -82.4333 } },
    };
    mockPlaceDetailsService.mockResolvedValueOnce(fakeResult);

    const result = await (placeDetails as Function)(
      makeRequest({ placeId: "coord:8.4333,-82.4333" })
    );

    expect(result).toEqual({ ok: true, result: fakeResult });
    expect(mockPlaceDetailsService).toHaveBeenCalledWith({ placeId: "coord:8.4333,-82.4333" });
  });

  it("aplica rate limit cuando hay uid", async () => {
    mockPlaceDetailsService.mockResolvedValueOnce({});
    await (placeDetails as Function)(makeRequest({ placeId: "coord:8.4,-82.4" }, "user-456"));

    expect(mockCheckRateLimit).toHaveBeenCalledWith("user-456", "placeDetails", expect.any(Object));
  });

  it("relanza HttpsError del service sin envolver", async () => {
    const originalError = new HttpsError("not-found", "Lugar no encontrado");
    mockPlaceDetailsService.mockRejectedValueOnce(originalError);

    await expect(
      (placeDetails as Function)(makeRequest({ placeId: "osm:node:1" }))
    ).rejects.toBeInstanceOf(HttpsError);
  });

  it("envuelve errores desconocidos en HttpsError internal", async () => {
    mockPlaceDetailsService.mockRejectedValueOnce(new Error("timeout"));

    await expect(
      (placeDetails as Function)(makeRequest({ placeId: "osm:node:1" }))
    ).rejects.toMatchObject({ code: "internal" });
  });
});
