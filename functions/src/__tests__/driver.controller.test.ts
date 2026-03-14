const mockSet = jest.fn();
const mockDoc = jest.fn(() => ({ set: mockSet }));
const mockCollection = jest.fn(() => ({ doc: mockDoc }));

jest.mock("firebase-admin/firestore", () => ({
  getFirestore: jest.fn(() => ({ collection: mockCollection })),
  Timestamp: { now: jest.fn(() => ({ seconds: 1, nanoseconds: 0 })) },
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

import { updateDriverLocation } from "../modules/drivers/driver.controller";

function makeRequest(data: Record<string, unknown>, uid?: string) {
  return { data, auth: uid ? { uid } : undefined };
}

describe("updateDriverLocation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSet.mockResolvedValue(undefined);
  });

  it("requires authentication", async () => {
    await expect((updateDriverLocation as Function)(makeRequest({}))).rejects.toMatchObject({
      code: "unauthenticated",
    });
  });

  it("requires routeId", async () => {
    await expect(
      (updateDriverLocation as Function)(
        makeRequest({ busId: "BUS-01", latitude: 8.4, longitude: -82.4 }, "driver-1")
      )
    ).rejects.toMatchObject({ code: "invalid-argument" });
  });

  it("persists driverUid, routeId and status", async () => {
    const result = await (updateDriverLocation as Function)(
      makeRequest(
        {
          busId: "BUS-01",
          routeId: "route-1",
          latitude: 8.4,
          longitude: -82.4,
          status: "active",
          busLabel: "Bus 01",
        },
        "driver-1"
      )
    );

    expect(result.ok).toBe(true);
    expect(mockSet).toHaveBeenCalledWith(
      expect.objectContaining({
        busId: "BUS-01",
        routeId: "route-1",
        driverUid: "driver-1",
        status: "active",
        isActive: true,
        busLabel: "Bus 01",
      }),
      { merge: true }
    );
  });
});