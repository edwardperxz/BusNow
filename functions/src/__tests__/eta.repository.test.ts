// Test para eta.repository — lógica de cache key y TTL
// Las llamadas a Firestore se mockean para no necesitar emulador.

jest.mock("firebase-admin/firestore", () => {
  const mockGet = jest.fn();
  const mockSet = jest.fn().mockResolvedValue(undefined);
  const mockDelete = jest.fn().mockResolvedValue(undefined);
  const mockDoc = jest.fn(() => ({ get: mockGet, set: mockSet, delete: mockDelete }));
  const mockCollection = jest.fn(() => ({ doc: mockDoc }));
  const mockFirestore = jest.fn(() => ({ collection: mockCollection }));

  return {
    getFirestore: mockFirestore,
    Timestamp: {
      now: () => ({ toMillis: () => Date.now() }),
      fromMillis: (ms: number) => ({ toMillis: () => ms }),
    },
  };
});

import { getETAFromCache, saveETAToCache } from "../modules/eta/eta.repository";

describe("getETAFromCache", () => {
  const coords = { busLat: 8.994, busLng: -79.519, stopLat: 8.993, stopLng: -79.518 };

  it("returns null when document does not exist", async () => {
    const { getFirestore } = require("firebase-admin/firestore");
    getFirestore().collection().doc().get.mockResolvedValueOnce({ exists: false });

    const result = await getETAFromCache(coords.busLat, coords.busLng, coords.stopLat, coords.stopLng);
    expect(result).toBeNull();
  });

  it("returns null when cache is expired", async () => {
    const { getFirestore } = require("firebase-admin/firestore");
    const pastMs = Date.now() - 999999;

    getFirestore().collection().doc().get.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        result: { durationSeconds: 60, durationText: "1 min", distanceMeters: 500, distanceText: "500 m", polyline: "", startAddress: "", endAddress: "" },
        cachedAt: { toMillis: () => pastMs },
        expiresAt: { toMillis: () => pastMs + 1000 }, // ya expiró
      }),
    });

    const result = await getETAFromCache(coords.busLat, coords.busLng, coords.stopLat, coords.stopLng);
    expect(result).toBeNull();
  });

  it("returns cached result when valid", async () => {
    const { getFirestore } = require("firebase-admin/firestore");
    const futureMs = Date.now() + 30000;
    const cachedEta = {
      durationSeconds: 120,
      durationText: "2 min",
      distanceMeters: 800,
      distanceText: "800 m",
      polyline: "abc",
      startAddress: "A",
      endAddress: "B",
    };

    getFirestore().collection().doc().get.mockResolvedValueOnce({
      exists: true,
      data: () => ({
        result: cachedEta,
        cachedAt: { toMillis: () => Date.now() - 1000 },
        expiresAt: { toMillis: () => futureMs },
      }),
    });

    const result = await getETAFromCache(coords.busLat, coords.busLng, coords.stopLat, coords.stopLng);
    expect(result).toEqual(cachedEta);
  });
});

describe("saveETAToCache", () => {
  it("calls Firestore set with correct document shape", async () => {
    const { getFirestore } = require("firebase-admin/firestore");
    const mockSet = getFirestore().collection().doc().set;
    mockSet.mockClear();

    const eta = { durationSeconds: 60, durationText: "1 min", distanceMeters: 500, distanceText: "500 m", polyline: "", startAddress: "", endAddress: "" };
    await saveETAToCache(8.994, -79.519, 8.993, -79.518, eta);

    expect(mockSet).toHaveBeenCalledTimes(1);
    const [docData] = mockSet.mock.calls[0];
    expect(docData).toHaveProperty("result", eta);
    expect(docData).toHaveProperty("cachedAt");
    expect(docData).toHaveProperty("expiresAt");
  });
});
