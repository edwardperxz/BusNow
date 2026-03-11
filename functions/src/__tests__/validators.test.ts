import { validateCalculateETARequest } from "../utils/validators";
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
