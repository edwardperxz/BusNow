// Tests para places.service — mockea axios para simular respuestas de Nominatim.

import { HttpsError } from "firebase-functions/v2/https";

const mockGet = jest.fn();
jest.mock("axios", () => ({ get: (...args: unknown[]) => mockGet(...args) }));

import {
  placesAutocompleteService,
  placeDetailsService,
} from "../modules/places/places.service";

const nominatimItem = {
  display_name: "Parque Cervantes, David, Chiriquí, Panamá",
  name: "Parque Cervantes",
  lat: "8.4333",
  lon: "-82.4333",
  osm_type: "node",
  osm_id: 123456,
};

describe("placesAutocompleteService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna predicciones con el formato esperado", async () => {
    mockGet.mockResolvedValueOnce({ data: [nominatimItem] });

    const result = await placesAutocompleteService({
      query: "Parque Cervantes",
      location: "8.4333,-82.4333",
      radius: 50000,
    });

    expect(result).toHaveLength(1);
    const pred = result[0];
    expect(pred.place_id).toMatch(/^coord:/);
    expect(pred.description).toBe("Parque Cervantes, David, Chiriquí, Panamá");
    expect(pred.structured_formatting.main_text).toBe("Parque Cervantes");
    expect(pred.structured_formatting.secondary_text).toContain("David");
  });

  it("retorna array vacío cuando Nominatim no encuentra resultados", async () => {
    mockGet.mockResolvedValueOnce({ data: [] });

    const result = await placesAutocompleteService({ query: "xyznonexistent" });
    expect(result).toEqual([]);
  });

  it("incluye countrycodes cuando se proporciona countryCode", async () => {
    mockGet.mockResolvedValueOnce({ data: [nominatimItem] });

    await placesAutocompleteService({
      query: "David",
      location: "8.4333,-82.4333",
      radius: 50000,
      countryCode: "PA",
    });

    const callParams = mockGet.mock.calls[0][1]?.params;
    expect(callParams?.countrycodes).toBe("pa");
  });

  it("lanza HttpsError cuando la respuesta no es un array", async () => {
    mockGet.mockResolvedValueOnce({ data: null });

    await expect(
      placesAutocompleteService({ query: "test" })
    ).rejects.toBeInstanceOf(HttpsError);
  });

  it("usa placeId osm como fallback cuando no hay coordenadas", async () => {
    mockGet.mockResolvedValueOnce({
      data: [{ ...nominatimItem, lat: "abc", lon: "xyz" }],
    });

    const result = await placesAutocompleteService({ query: "Parque" });
    expect(result[0].place_id).toMatch(/^osm:node:123456$/);
  });
});

describe("placeDetailsService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("resuelve placeId con prefijo coord: directamente", async () => {
    const result = await placeDetailsService({ placeId: "coord:8.4333,-82.4333" });

    expect(result.geometry.location.lat).toBeCloseTo(8.4333);
    expect(result.geometry.location.lng).toBeCloseTo(-82.4333);
    expect(result.place_id).toBe("coord:8.4333,-82.4333");
    // No debe llamar a axios
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("lanza HttpsError cuando coord: tiene valores NaN", async () => {
    await expect(
      placeDetailsService({ placeId: "coord:abc,xyz" })
    ).rejects.toBeInstanceOf(HttpsError);
  });

  it("resuelve placeId osm:node via Nominatim /lookup", async () => {
    mockGet.mockResolvedValueOnce({
      data: [
        {
          lat: "8.4333",
          lon: "-82.4333",
          name: "Parque Cervantes",
          display_name: "Parque Cervantes, David, Chiriquí",
        },
      ],
    });

    const result = await placeDetailsService({ placeId: "osm:node:123456" });

    expect(result.name).toBe("Parque Cervantes");
    expect(result.geometry.location.lat).toBeCloseTo(8.4333);
    // Debe haber llamado a /lookup
    const url: string = mockGet.mock.calls[0][0];
    expect(url).toContain("/lookup");
    const params = mockGet.mock.calls[0][1]?.params;
    expect(params?.osm_ids).toBe("N123456");
  });

  it("lanza HttpsError cuando /lookup devuelve array vacío", async () => {
    mockGet.mockResolvedValueOnce({ data: [] });

    await expect(
      placeDetailsService({ placeId: "osm:way:999" })
    ).rejects.toBeInstanceOf(HttpsError);
  });

  it("lanza HttpsError para placeId en formato no soportado", async () => {
    await expect(
      placeDetailsService({ placeId: "google:ChIJXYZ" })
    ).rejects.toBeInstanceOf(HttpsError);
  });
});
