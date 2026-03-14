import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth";
import { HttpsError, onCall } from "firebase-functions/v2/https";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { logger } from "firebase-functions";

type TicketStatus = "open" | "in_progress" | "resolved" | "closed";
type TicketPriority = "low" | "medium" | "high" | "urgent";

function asString(value: unknown, fieldName: string): string {
  const parsed = String(value ?? "").trim();
  if (!parsed) {
    throw new HttpsError("invalid-argument", `${fieldName} es requerido`);
  }
  return parsed;
}

function asOptionalString(value: unknown): string | null {
  const parsed = String(value ?? "").trim();
  return parsed ? parsed : null;
}

function asOptionalNumber(value: unknown): number | null {
  if (value === null || value === undefined || String(value).trim() === "") {
    return null;
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    throw new HttpsError("invalid-argument", "valor numérico inválido");
  }
  return parsed;
}

function asTicketPriority(value: unknown): TicketPriority {
  const priority = String(value ?? "medium").trim() as TicketPriority;
  if (!["low", "medium", "high", "urgent"].includes(priority)) {
    throw new HttpsError("invalid-argument", "priority inválida");
  }
  return priority;
}

function asTicketStatus(value: unknown, fallback: TicketStatus = "open"): TicketStatus {
  const status = String(value ?? fallback).trim() as TicketStatus;
  if (!["open", "in_progress", "resolved", "closed"].includes(status)) {
    throw new HttpsError("invalid-argument", "status inválido");
  }
  return status;
}

async function assertSignedIn(uid?: string): Promise<string> {
  if (!uid) {
    throw new HttpsError("unauthenticated", "Debes iniciar sesión");
  }
  return uid;
}

async function assertAdmin(uid?: string): Promise<string> {
  const actorUid = await assertSignedIn(uid);
  const db = getFirestore();
  const userSnap = await db.collection("users").doc(actorUid).get();
  const role = userSnap.data()?.role;
  if (role !== "admin") {
    throw new HttpsError("permission-denied", "Solo admin puede ejecutar esta operación");
  }
  return actorUid;
}

async function assertTicketAccess(ticketId: string, uid?: string) {
  const actorUid = await assertSignedIn(uid);
  const db = getFirestore();
  const actorSnap = await db.collection("users").doc(actorUid).get();
  const actorRole = actorSnap.data()?.role;

  const ticketRef = db.collection("support_tickets").doc(ticketId);
  const ticketSnap = await ticketRef.get();
  if (!ticketSnap.exists) {
    throw new HttpsError("not-found", "Ticket no encontrado");
  }

  const ticket = ticketSnap.data() as {
    createdBy?: string;
    assignedTo?: string;
  };

  const isParticipant =
    ticket.createdBy === actorUid ||
    ticket.assignedTo === actorUid ||
    actorRole === "admin";

  if (!isParticipant) {
    throw new HttpsError("permission-denied", "No tienes acceso a este ticket");
  }

  return { actorUid, actorRole, ticketRef, ticketSnap, ticket };
}

async function assertDocumentExists(collectionName: string, docId: string, notFoundMessage: string) {
  const snap = await getFirestore().collection(collectionName).doc(docId).get();
  if (!snap.exists) {
    throw new HttpsError("not-found", notFoundMessage);
  }
}

async function deleteOlderThanDays(collectionName: string, days: number, timestampField: string) {
  const db = getFirestore();
  const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  const cutoff = Timestamp.fromDate(cutoffDate);

  const snapshot = await db
    .collection(collectionName)
    .where(timestampField, "<", cutoff)
    .limit(500)
    .get();

  if (snapshot.empty) {
    return 0;
  }

  const batch = db.batch();
  snapshot.docs.forEach((docSnap) => {
    batch.delete(docSnap.ref);
  });
  await batch.commit();

  return snapshot.size;
}

export const updateUserAdmin = onCall(async (request) => {
  try {
    await assertAdmin(request.auth?.uid);
    const uid = asString(request.data?.uid, "uid");
    const role = asOptionalString(request.data?.role);
    const cityId = asOptionalString(request.data?.cityId);
    const isActive = request.data?.isActive;
    const name = asOptionalString(request.data?.name);

    if (role && !["passenger", "driver", "admin"].includes(role)) {
      throw new HttpsError("invalid-argument", "role inválido");
    }

    if (cityId) {
      await assertDocumentExists("cities", cityId, "Ciudad no encontrada");
    }

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
      updatedAtTimestamp: Timestamp.now(),
    };

    if (role) patch.role = role;
    if (cityId !== null) patch.cityId = cityId;
    if (name !== null) patch.name = name;
    if (typeof isActive === "boolean") patch.isActive = isActive;

    await getFirestore().collection("users").doc(uid).set(patch, { merge: true });

    return { ok: true, uid };
  } catch (error) {
    logger.error("updateUserAdmin error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error actualizando usuario");
  }
});

export const createUserAdmin = onCall(async (request) => {
  try {
    await assertAdmin(request.auth?.uid);
    const email = asString(request.data?.email, "email").toLowerCase();
    const name = asString(request.data?.name, "name");
    const role = asString(request.data?.role, "role");
    const password = asOptionalString(request.data?.password) || "BusNowTemp2026!";
    const cityId = asOptionalString(request.data?.cityId);
    const isActive = typeof request.data?.isActive === "boolean" ? request.data.isActive : true;

    if (!["passenger", "driver", "admin"].includes(role)) {
      throw new HttpsError("invalid-argument", "role inválido");
    }

    if (cityId) {
      await assertDocumentExists("cities", cityId, "Ciudad no encontrada");
    }

    const auth = getAuth();
    const existing = await auth.getUserByEmail(email).catch(() => null);
    if (existing) {
      throw new HttpsError("already-exists", "Ya existe un usuario con ese correo");
    }

    const created = await auth.createUser({
      email,
      password,
      displayName: name,
      disabled: !isActive,
    });

    await getFirestore().collection("users").doc(created.uid).set(
      {
        uid: created.uid,
        email,
        name,
        role,
        cityId: cityId || "",
        isActive,
        isAnonymous: false,
        createdAt: new Date().toISOString(),
        createdAtTimestamp: Timestamp.now(),
        updatedAt: new Date().toISOString(),
        updatedAtTimestamp: Timestamp.now(),
      },
      { merge: true }
    );

    return { ok: true, uid: created.uid, email };
  } catch (error) {
    logger.error("createUserAdmin error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error creando usuario");
  }
});

export const deleteUserAdmin = onCall(async (request) => {
  try {
    await assertAdmin(request.auth?.uid);
    const uid = asString(request.data?.uid, "uid");

    await getFirestore().collection("users").doc(uid).delete();

    return { ok: true, uid };
  } catch (error) {
    logger.error("deleteUserAdmin error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error eliminando usuario");
  }
});

export const assignCityToUser = onCall(async (request) => {
  try {
    await assertAdmin(request.auth?.uid);
    const uid = asString(request.data?.uid, "uid");
    const cityId = asString(request.data?.cityId, "cityId");

    await getFirestore().collection("users").doc(uid).set(
      {
        cityId,
        updatedAt: new Date().toISOString(),
        updatedAtTimestamp: Timestamp.now(),
      },
      { merge: true }
    );

    return { ok: true, uid, cityId };
  } catch (error) {
    logger.error("assignCityToUser error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error asignando ciudad");
  }
});

export const createCityAdmin = onCall(async (request) => {
  try {
    await assertAdmin(request.auth?.uid);
    const cityId = asString(request.data?.cityId, "cityId");
    const name = asString(request.data?.name, "name");
    const state = asOptionalString(request.data?.state);
    const country = asOptionalString(request.data?.country) || "Panama";
    const isActive = typeof request.data?.isActive === "boolean" ? request.data.isActive : true;
    const centerLat = asOptionalNumber(request.data?.center?.latitude);
    const centerLng = asOptionalNumber(request.data?.center?.longitude);

    if (centerLat === null || centerLng === null) {
      throw new HttpsError("invalid-argument", "center.latitude y center.longitude son requeridos");
    }

    await getFirestore().collection("cities").doc(cityId).set(
      {
        name,
        state,
        country,
        isActive,
        center: { latitude: centerLat, longitude: centerLng },
        updatedAt: new Date().toISOString(),
        updatedAtTimestamp: Timestamp.now(),
      },
      { merge: true }
    );

    return { ok: true, cityId };
  } catch (error) {
    logger.error("createCityAdmin error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error creando ciudad");
  }
});

export const updateCityAdmin = onCall(async (request) => {
  try {
    await assertAdmin(request.auth?.uid);
    const cityId = asString(request.data?.cityId, "cityId");
    const name = asOptionalString(request.data?.name);
    const state = asOptionalString(request.data?.state);
    const country = asOptionalString(request.data?.country);
    const isActive = request.data?.isActive;
    const centerLat = asOptionalNumber(request.data?.center?.latitude);
    const centerLng = asOptionalNumber(request.data?.center?.longitude);

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
      updatedAtTimestamp: Timestamp.now(),
    };

    if (name !== null) patch.name = name;
    if (state !== null) patch.state = state;
    if (country !== null) patch.country = country;
    if (typeof isActive === "boolean") patch.isActive = isActive;
    if (centerLat !== null && centerLng !== null) {
      patch.center = { latitude: centerLat, longitude: centerLng };
    }

    await getFirestore().collection("cities").doc(cityId).set(patch, { merge: true });
    return { ok: true, cityId };
  } catch (error) {
    logger.error("updateCityAdmin error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error actualizando ciudad");
  }
});

export const deleteCityAdmin = onCall(async (request) => {
  try {
    await assertAdmin(request.auth?.uid);
    const cityId = asString(request.data?.cityId, "cityId");
    await getFirestore().collection("cities").doc(cityId).delete();
    return { ok: true, cityId };
  } catch (error) {
    logger.error("deleteCityAdmin error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error eliminando ciudad");
  }
});

export const updateBusAdmin = onCall(async (request) => {
  try {
    await assertAdmin(request.auth?.uid);
    const busId = asString(request.data?.busId, "busId");
    const busLabel = asOptionalString(request.data?.busLabel);
    const routeId = asOptionalString(request.data?.routeId);
    const cityId = asOptionalString(request.data?.cityId);
    const status = asOptionalString(request.data?.status);
    const isActive = request.data?.isActive;
    const latitude = asOptionalNumber(request.data?.latitude);
    const longitude = asOptionalNumber(request.data?.longitude);

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
      updatedAtTimestamp: Timestamp.now(),
    };

    if (routeId) {
      await assertDocumentExists("routes", routeId, "Ruta no encontrada");
    }

    if (cityId) {
      await assertDocumentExists("cities", cityId, "Ciudad no encontrada");
    }

    if (busLabel !== null) patch.busLabel = busLabel;
    if (routeId !== null) patch.routeId = routeId;
    if (cityId !== null) patch.cityId = cityId;
    if (status !== null) patch.status = status;
    if (typeof isActive === "boolean") patch.isActive = isActive;
    if (latitude !== null) patch.latitude = latitude;
    if (longitude !== null) patch.longitude = longitude;

    await getFirestore().collection("buses").doc(busId).set(patch, { merge: true });
    return { ok: true, busId };
  } catch (error) {
    logger.error("updateBusAdmin error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error actualizando bus");
  }
});

export const deleteBusAdmin = onCall(async (request) => {
  try {
    await assertAdmin(request.auth?.uid);
    const busId = asString(request.data?.busId, "busId");
    await getFirestore().collection("buses").doc(busId).delete();
    return { ok: true, busId };
  } catch (error) {
    logger.error("deleteBusAdmin error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error eliminando bus");
  }
});

export const calculateBusTiming = onCall(async (request) => {
  try {
    const actorUid = await assertSignedIn(request.auth?.uid);
    const busId = asString(request.data?.busId, "busId");
    const routeId = asString(request.data?.routeId, "routeId");
    const cityId = asOptionalString(request.data?.cityId);
    const stopId = asOptionalString(request.data?.stopId);
    const startedAtMs = Number(request.data?.startedAtMs);
    const endedAtMs = Number(request.data?.endedAtMs || Date.now());

    const hasStarted = Number.isFinite(startedAtMs);
    const hasEnded = Number.isFinite(endedAtMs);
    if (!hasStarted || !hasEnded || endedAtMs < startedAtMs) {
      throw new HttpsError("invalid-argument", "startedAtMs/endedAtMs inválidos");
    }

    const durationSeconds = Math.round((endedAtMs - startedAtMs) / 1000);
    const ref = await getFirestore().collection("bus_timings").add({
      busId,
      routeId,
      cityId,
      stopId,
      durationSeconds,
      source: "calculateBusTiming",
      createdBy: actorUid,
      createdAt: new Date().toISOString(),
      createdAtTimestamp: Timestamp.now(),
    });

    return { ok: true, timingId: ref.id, durationSeconds };
  } catch (error) {
    logger.error("calculateBusTiming error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error calculando timing");
  }
});

export const detectStopPassage = onCall(async (request) => {
  try {
    const actorUid = await assertSignedIn(request.auth?.uid);
    const busId = asString(request.data?.busId, "busId");
    const routeId = asString(request.data?.routeId, "routeId");
    const stopId = asString(request.data?.stopId, "stopId");
    const cityId = asOptionalString(request.data?.cityId);
    const passageAtMs = Number(request.data?.passageAtMs || Date.now());
    if (!Number.isFinite(passageAtMs)) {
      throw new HttpsError("invalid-argument", "passageAtMs inválido");
    }

    const ref = await getFirestore().collection("bus_timings").add({
      busId,
      routeId,
      cityId,
      stopId,
      eventType: "stop_passage",
      passageAt: new Date(passageAtMs).toISOString(),
      createdBy: actorUid,
      createdAt: new Date().toISOString(),
      createdAtTimestamp: Timestamp.now(),
    });

    return { ok: true, timingId: ref.id };
  } catch (error) {
    logger.error("detectStopPassage error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error detectando paso de parada");
  }
});

export const sendNotification = onCall(async (request) => {
  try {
    const actorUid = await assertSignedIn(request.auth?.uid);
    const targetUid = asString(request.data?.targetUid, "targetUid");
    const title = asString(request.data?.title, "title");
    const body = asString(request.data?.body, "body");
    const type = asOptionalString(request.data?.type) || "general";

    const ref = await getFirestore().collection("notifications").add({
      audience: "user",
      targetUid,
      title,
      body,
      type,
      status: "queued",
      createdBy: actorUid,
      createdAt: new Date().toISOString(),
      createdAtTimestamp: Timestamp.now(),
    });

    return { ok: true, notificationId: ref.id };
  } catch (error) {
    logger.error("sendNotification error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error enviando notificación");
  }
});

export const sendTopicNotification = onCall(async (request) => {
  try {
    const actorUid = await assertSignedIn(request.auth?.uid);
    const topic = asString(request.data?.topic, "topic");
    const title = asString(request.data?.title, "title");
    const body = asString(request.data?.body, "body");
    const type = asOptionalString(request.data?.type) || "topic";

    const ref = await getFirestore().collection("notifications").add({
      audience: "topic",
      topic,
      title,
      body,
      type,
      status: "queued",
      createdBy: actorUid,
      createdAt: new Date().toISOString(),
      createdAtTimestamp: Timestamp.now(),
    });

    return { ok: true, notificationId: ref.id };
  } catch (error) {
    logger.error("sendTopicNotification error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error enviando notificación por tópico");
  }
});

export const createTicket = onCall(async (request) => {
  try {
    const actorUid = await assertSignedIn(request.auth?.uid);
    const subject = asString(request.data?.subject, "subject");
    const description = asString(request.data?.description, "description");
    const priority = asTicketPriority(request.data?.priority);
    const cityId = asOptionalString(request.data?.cityId);

    const ref = await getFirestore().collection("support_tickets").add({
      subject,
      description,
      priority,
      status: "open",
      cityId,
      createdBy: actorUid,
      assignedTo: null,
      createdAt: new Date().toISOString(),
      createdAtTimestamp: Timestamp.now(),
      updatedAt: new Date().toISOString(),
      updatedAtTimestamp: Timestamp.now(),
    });

    return { ok: true, ticketId: ref.id };
  } catch (error) {
    logger.error("createTicket error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error creando ticket");
  }
});

export const addTicketResponse = onCall(async (request) => {
  try {
    const ticketId = asString(request.data?.ticketId, "ticketId");
    const message = asString(request.data?.message, "message");
    const nextStatus = asOptionalString(request.data?.status);
    const access = await assertTicketAccess(ticketId, request.auth?.uid);

    const responseRef = access.ticketRef.collection("responses").doc();
    await responseRef.set({
      message,
      authorUid: access.actorUid,
      authorRole: access.actorRole,
      createdAt: new Date().toISOString(),
      createdAtTimestamp: Timestamp.now(),
    });

    const patch: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
      updatedAtTimestamp: Timestamp.now(),
      lastResponseAt: new Date().toISOString(),
      lastResponseAtTimestamp: Timestamp.now(),
    };

    if (nextStatus) {
      patch.status = asTicketStatus(nextStatus, "open");
    }

    await access.ticketRef.set(patch, { merge: true });

    return { ok: true, ticketId, responseId: responseRef.id };
  } catch (error) {
    logger.error("addTicketResponse error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error agregando respuesta al ticket");
  }
});

export const assignTicket = onCall(async (request) => {
  try {
    await assertAdmin(request.auth?.uid);
    const ticketId = asString(request.data?.ticketId, "ticketId");
    const assignedTo = asString(request.data?.assignedTo, "assignedTo");
    const status = asTicketStatus(request.data?.status, "in_progress");

    await assertDocumentExists("users", assignedTo, "Usuario asignado no encontrado");

    await getFirestore().collection("support_tickets").doc(ticketId).set(
      {
        assignedTo,
        status,
        updatedAt: new Date().toISOString(),
        updatedAtTimestamp: Timestamp.now(),
      },
      { merge: true }
    );

    return { ok: true, ticketId, assignedTo, status };
  } catch (error) {
    logger.error("assignTicket error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error asignando ticket");
  }
});

export const auditChange = onCall(async (request) => {
  try {
    const actorUid = await assertAdmin(request.auth?.uid);
    const action = asString(request.data?.action, "action");
    const entity = asString(request.data?.entity, "entity");
    const entityId = asString(request.data?.entityId, "entityId");
    const cityId = asOptionalString(request.data?.cityId);
    const metadata = request.data?.metadata ?? null;

    const ref = await getFirestore().collection("audit_logs").add({
      actorUid,
      action,
      entity,
      entityId,
      cityId,
      metadata,
      createdAt: new Date().toISOString(),
      createdAtTimestamp: Timestamp.now(),
    });

    return { ok: true, logId: ref.id };
  } catch (error) {
    logger.error("auditChange error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error registrando auditoría");
  }
});

export const getRoutesByCity = onCall({ invoker: "public" }, async (request) => {
  try {
    const cityId = asString(request.data?.cityId, "cityId");
    const snap = await getFirestore()
      .collection("routes")
      .where("cityId", "==", cityId)
      .orderBy("name")
      .get();

    const routes = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    return { ok: true, routes };
  } catch (error) {
    logger.error("getRoutesByCity error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error obteniendo rutas por ciudad");
  }
});

export const getBusesByCity = onCall({ invoker: "public" }, async (request) => {
  try {
    const cityId = asString(request.data?.cityId, "cityId");
    const status = asOptionalString(request.data?.status);
    const db = getFirestore();

    let query = db.collection("buses").where("cityId", "==", cityId);
    if (status) {
      query = query.where("status", "==", status);
    }

    const snap = await query.orderBy("updatedAt", "desc").get();
    const buses = snap.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }));
    return { ok: true, buses };
  } catch (error) {
    logger.error("getBusesByCity error", error);
    if (error instanceof HttpsError) throw error;
    throw new HttpsError("internal", "Error obteniendo buses por ciudad");
  }
});

// Limpieza periódica de timings (retención 30 días).
export const cleanupOldTimings = onSchedule("every 1 hours", async () => {
  const deleted = await deleteOlderThanDays("bus_timings", 30, "createdAtTimestamp");
  logger.info(`[CleanupTimings] Eliminados ${deleted} registros antiguos`);
});

// Limpieza periódica de auditoría (retención 90 días).
export const cleanupOldLogs = onSchedule("0 2 * * *", async () => {
  const deleted = await deleteOlderThanDays("audit_logs", 90, "createdAtTimestamp");
  logger.info(`[CleanupLogs] Eliminados ${deleted} logs antiguos`);
});