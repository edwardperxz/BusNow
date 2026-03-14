import { httpsCallable } from 'firebase/functions';
import { collection, deleteDoc, doc, getDocs, orderBy, query, setDoc } from 'firebase/firestore';
import { db, fn } from './firebaseApp';

export type AdminRole = 'passenger' | 'driver' | 'admin';
export type BusStatus = 'active' | 'inactive' | 'paused';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface AdminUserRecord {
  uid: string;
  name: string;
  email: string;
  role: AdminRole;
  cityId: string;
  isActive: boolean;
}

export interface AdminCityRecord {
  id: string;
  name: string;
  state: string;
  country: string;
  isActive: boolean;
  center?: { latitude: number; longitude: number };
}

export interface AdminBusRecord {
  id: string;
  busId: string;
  busLabel: string;
  routeId: string;
  cityId: string;
  status: BusStatus;
  isActive: boolean;
  latitude: number;
  longitude: number;
  updatedAt: number;
}

export interface AdminTicketRecord {
  id: string;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  cityId: string;
  createdBy: string;
  assignedTo: string;
  updatedAt: string;
}

const updateUserAdminFn = httpsCallable<
  { uid: string; role?: AdminRole; cityId?: string; name?: string; isActive?: boolean },
  { ok?: boolean; uid?: string }
>(fn, 'updateUserAdmin');

const createUserAdminFn = httpsCallable<
  { email: string; name: string; role: AdminRole; cityId?: string; password?: string; isActive?: boolean },
  { ok?: boolean; uid?: string; email?: string }
>(fn, 'createUserAdmin');

const deleteUserAdminFn = httpsCallable<{ uid: string }, { ok?: boolean; uid?: string }>(fn, 'deleteUserAdmin');

const assignTicketFn = httpsCallable<
  { ticketId: string; assignedTo: string; status: TicketStatus },
  { ok?: boolean; ticketId?: string }
>(fn, 'assignTicket');

const createCityAdminFn = httpsCallable<
  { cityId: string; name: string; state?: string; country?: string; isActive?: boolean; center?: { latitude: number; longitude: number } },
  { ok?: boolean; cityId?: string }
>(fn, 'createCityAdmin');

const updateCityAdminFn = httpsCallable<
  { cityId: string; name?: string; state?: string; country?: string; isActive?: boolean; center?: { latitude: number; longitude: number } },
  { ok?: boolean; cityId?: string }
>(fn, 'updateCityAdmin');

const deleteCityAdminFn = httpsCallable<{ cityId: string }, { ok?: boolean; cityId?: string }>(fn, 'deleteCityAdmin');

const updateBusAdminFn = httpsCallable<
  {
    busId: string;
    busLabel?: string;
    routeId?: string;
    cityId?: string;
    status?: BusStatus;
    isActive?: boolean;
    latitude?: number;
    longitude?: number;
  },
  { ok?: boolean; busId?: string }
>(fn, 'updateBusAdmin');

const deleteBusAdminFn = httpsCallable<{ busId: string }, { ok?: boolean; busId?: string }>(fn, 'deleteBusAdmin');

function asString(value: unknown): string {
  return String(value ?? '').trim();
}

/**
 * Extrae un mensaje legible de un error de Firebase Callable.
 * Distingue entre permission-denied (el usuario no es admin),
 * unauthenticated (no hay sesión), unavailable (servicio externo caído)
 * e internal (error inesperado del servidor).
 */
export function callableErrorMessage(error: unknown, fallback: string): string {
  if (!error || typeof error !== 'object') return fallback;
  const code = String((error as Record<string, unknown>).code ?? '');
  const message = String((error as Record<string, unknown>).message ?? '');
  if (code === 'functions/permission-denied') return 'No tienes permisos de administrador para realizar esta acción.';
  if (code === 'functions/unauthenticated') return 'Debes iniciar sesión para continuar.';
  if (code === 'functions/unavailable') return message || 'Servicio no disponible. Intenta más tarde.';
  if (code === 'functions/invalid-argument') return message || 'Datos inválidos. Revisa los campos del formulario.';
  if (code === 'functions/not-found') return message || 'El elemento no fue encontrado.';
  return message || fallback;
}

export async function listUsers(): Promise<AdminUserRecord[]> {
  const snap = await getDocs(query(collection(db, 'users'), orderBy('updatedAt', 'desc')));
  return snap.docs.map((docSnap) => {
    const d = docSnap.data() as Record<string, unknown>;
    return {
      uid: docSnap.id,
      name: asString(d.name),
      email: asString(d.email),
      role: (asString(d.role) as AdminRole) || 'passenger',
      cityId: asString(d.cityId),
      isActive: Boolean(d.isActive ?? true),
    };
  });
}

export async function listCities(): Promise<AdminCityRecord[]> {
  const snap = await getDocs(query(collection(db, 'cities'), orderBy('name')));
  return snap.docs.map((docSnap) => {
    const d = docSnap.data() as Record<string, unknown>;
    const center = (d.center as { latitude?: number; longitude?: number } | undefined) ?? undefined;
    return {
      id: docSnap.id,
      name: asString(d.name),
      state: asString(d.state),
      country: asString(d.country),
      isActive: Boolean(d.isActive ?? true),
      center: center && Number.isFinite(center.latitude) && Number.isFinite(center.longitude)
        ? { latitude: Number(center.latitude), longitude: Number(center.longitude) }
        : undefined,
    };
  });
}

export async function listBuses(): Promise<AdminBusRecord[]> {
  const snap = await getDocs(query(collection(db, 'buses'), orderBy('updatedAt', 'desc')));
  return snap.docs.map((docSnap) => {
    const d = docSnap.data() as Record<string, unknown>;
    return {
      id: docSnap.id,
      busId: asString(d.busId) || docSnap.id,
      busLabel: asString(d.busLabel),
      routeId: asString(d.routeId),
      cityId: asString(d.cityId),
      status: (asString(d.status) as BusStatus) || 'inactive',
      isActive: Boolean(d.isActive ?? false),
      latitude: Number(d.latitude ?? 0),
      longitude: Number(d.longitude ?? 0),
      updatedAt: Number(d.updatedAt ?? 0),
    };
  });
}

export async function listTickets(): Promise<AdminTicketRecord[]> {
  const snap = await getDocs(query(collection(db, 'support_tickets'), orderBy('updatedAt', 'desc')));
  return snap.docs.map((docSnap) => {
    const d = docSnap.data() as Record<string, unknown>;
    return {
      id: docSnap.id,
      subject: asString(d.subject),
      description: asString(d.description),
      priority: (asString(d.priority) as TicketPriority) || 'medium',
      status: (asString(d.status) as TicketStatus) || 'open',
      cityId: asString(d.cityId),
      createdBy: asString(d.createdBy),
      assignedTo: asString(d.assignedTo),
      updatedAt: asString(d.updatedAt),
    };
  });
}

export async function updateUserAdmin(input: {
  uid: string;
  role?: AdminRole;
  cityId?: string;
  name?: string;
  isActive?: boolean;
}) {
  const response = await updateUserAdminFn(input);
  return response.data;
}

export async function createUserAdmin(input: {
  email: string;
  name: string;
  role: AdminRole;
  cityId?: string;
  password?: string;
  isActive?: boolean;
}) {
  const response = await createUserAdminFn(input);
  return response.data;
}

export async function deleteUserAdmin(uid: string) {
  const response = await deleteUserAdminFn({ uid });
  return response.data;
}

export async function assignTicket(input: { ticketId: string; assignedTo: string; status: TicketStatus }) {
  const response = await assignTicketFn(input);
  return response.data;
}

export async function deleteTicketAdmin(ticketId: string) {
  await deleteDoc(doc(db, 'support_tickets', ticketId));
}

export async function createCityAdmin(input: {
  cityId: string;
  name: string;
  state?: string;
  country?: string;
  isActive?: boolean;
  center?: { latitude: number; longitude: number };
}) {
  const response = await createCityAdminFn(input);
  return response.data;
}

export async function updateCityAdmin(input: {
  cityId: string;
  name?: string;
  state?: string;
  country?: string;
  isActive?: boolean;
  center?: { latitude: number; longitude: number };
}) {
  const response = await updateCityAdminFn(input);
  return response.data;
}

export async function deleteCityAdmin(cityId: string) {
  const response = await deleteCityAdminFn({ cityId });
  return response.data;
}

export async function updateBusAdmin(input: {
  busId: string;
  busLabel?: string;
  routeId?: string;
  cityId?: string;
  status?: BusStatus;
  isActive?: boolean;
  latitude?: number;
  longitude?: number;
}) {
  const response = await updateBusAdminFn(input);
  return response.data;
}

export async function deleteBusAdmin(busId: string) {
  const response = await deleteBusAdminFn({ busId });
  return response.data;
}

export async function createOrUpdateCityDirect(cityId: string, data: Partial<AdminCityRecord>) {
  await setDoc(doc(db, 'cities', cityId), data, { merge: true });
}
