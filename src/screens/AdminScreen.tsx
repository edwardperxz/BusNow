import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CoordinatePickerMap from '../features/admin/components/CoordinatePickerMap';
import { RouteData, RouteItem, RouteStop } from '../features/routes/types';
import { useSettings } from '../context/SettingsContext';
import {
  AdminBusRecord,
  AdminCityRecord,
  AdminRole,
  AdminTicketRecord,
  AdminUserRecord,
  BusStatus,
  TicketStatus,
  assignTicket,
  callableErrorMessage,
  createUserAdmin,
  createCityAdmin,
  deleteBusAdmin,
  deleteCityAdmin,
  deleteTicketAdmin,
  deleteUserAdmin,
  listBuses,
  listCities,
  listTickets,
  listUsers,
  updateBusAdmin,
  updateCityAdmin,
  updateUserAdmin,
} from '../services/adminApi';
import { createRoute, deleteRoute, getAdminRoutes, getRouteDetail, RouteUpsertInput, updateRoute } from '../services/routesApi';
import { CommonStyles, getTheme } from '../styles/colors';
import { AppNavigation } from '../types/navigation';

interface AdminScreenProps {
  navigation: AppNavigation;
}

type AdminSection = 'routes' | 'stops' | 'users' | 'buses' | 'tickets' | 'cities';
type CoordinateTarget = 'routeStart' | 'routeMid' | 'routeEnd' | 'stop' | 'bus' | 'city';

interface RouteFormState {
  name: string;
  code: string;
  origin: string;
  midpoint: string;
  destination: string;
  frequency: string;
  fare: string;
  color: string;
  status: 'active' | 'limited' | 'maintenance';
  startLat: string;
  startLng: string;
  midLat: string;
  midLng: string;
  endLat: string;
  endLng: string;
}

interface StopFormState {
  id: string;
  name: string;
  time: string;
  latitude: string;
  longitude: string;
  isActive: boolean;
  order: number;
}

interface UserFormState {
  email: string;
  password: string;
  name: string;
  role: AdminRole;
  cityId: string;
  isActive: boolean;
}

interface BusFormState {
  busId: string;
  busLabel: string;
  routeId: string;
  cityId: string;
  status: BusStatus;
  isActive: boolean;
  latitude: string;
  longitude: string;
}

interface TicketFormState {
  ticketId: string;
  assignedTo: string;
  status: TicketStatus;
}

interface CityFormState {
  cityId: string;
  name: string;
  state: string;
  country: string;
  isActive: boolean;
  centerLat: string;
  centerLng: string;
}

const EMPTY_ROUTE_FORM: RouteFormState = {
  name: '',
  code: '',
  origin: '',
  midpoint: '',
  destination: '',
  frequency: '',
  fare: '',
  color: '#1976D2',
  status: 'active',
  startLat: '',
  startLng: '',
  midLat: '',
  midLng: '',
  endLat: '',
  endLng: '',
};

const EMPTY_STOP_FORM: StopFormState = {
  id: '',
  name: '',
  time: '--:--',
  latitude: '',
  longitude: '',
  isActive: true,
  order: 1,
};

const EMPTY_USER_FORM: UserFormState = {
  email: '',
  password: '',
  name: '',
  role: 'passenger',
  cityId: '',
  isActive: true,
};

const EMPTY_BUS_FORM: BusFormState = {
  busId: '',
  busLabel: '',
  routeId: '',
  cityId: '',
  status: 'inactive',
  isActive: false,
  latitude: '',
  longitude: '',
};

const EMPTY_TICKET_FORM: TicketFormState = {
  ticketId: '',
  assignedTo: '',
  status: 'in_progress',
};

const EMPTY_CITY_FORM: CityFormState = {
  cityId: '',
  name: '',
  state: '',
  country: 'Panama',
  isActive: true,
  centerLat: '',
  centerLng: '',
};

function asNumber(value: string): number {
  return Number(value);
}

function isCoordinateValid(lat: number, lng: number) {
  return Number.isFinite(lat) && Number.isFinite(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
}

function toSlug(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isValidTime(value: string) {
  return /^([01]\d|2[0-3]):([0-5]\d)$/.test(value);
}

function stopToInput(stop: RouteStop, index: number) {
  return {
    id: stop.id,
    name: stop.name,
    time: stop.time,
    coordinates: {
      latitude: Number(stop.coordinates.latitude ?? 0),
      longitude: Number(stop.coordinates.longitude ?? 0),
    },
    isActive: Boolean(stop.isActive ?? true),
    order: Number(stop.order ?? index + 1),
  };
}

export default function AdminScreen({ navigation }: AdminScreenProps) {
  const { t, theme } = useSettings();
  const colors = getTheme(theme === 'dark');
  const { width } = useWindowDimensions();

  const [activeSection, setActiveSection] = useState<AdminSection>('routes');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [buses, setBuses] = useState<AdminBusRecord[]>([]);
  const [tickets, setTickets] = useState<AdminTicketRecord[]>([]);
  const [cities, setCities] = useState<AdminCityRecord[]>([]);

  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedRouteDetail, setSelectedRouteDetail] = useState<RouteData | null>(null);

  const [editingRouteId, setEditingRouteId] = useState<string | null>(null);
  const [editingStopId, setEditingStopId] = useState<string | null>(null);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editingBusId, setEditingBusId] = useState<string | null>(null);
  const [editingTicketId, setEditingTicketId] = useState<string | null>(null);
  const [editingCityId, setEditingCityId] = useState<string | null>(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [creatingBus, setCreatingBus] = useState(false);

  const [routeForm, setRouteForm] = useState<RouteFormState>(EMPTY_ROUTE_FORM);
  const [stopForm, setStopForm] = useState<StopFormState>(EMPTY_STOP_FORM);
  const [userForm, setUserForm] = useState<UserFormState>(EMPTY_USER_FORM);
  const [busForm, setBusForm] = useState<BusFormState>(EMPTY_BUS_FORM);
  const [ticketForm, setTicketForm] = useState<TicketFormState>(EMPTY_TICKET_FORM);
  const [cityForm, setCityForm] = useState<CityFormState>(EMPTY_CITY_FORM);

  const [pickerVisible, setPickerVisible] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<CoordinateTarget>('routeStart');

  const sections: Array<{ key: AdminSection; label: string }> = useMemo(
    () => [
      { key: 'routes', label: 'Rutas' },
      { key: 'stops', label: 'Paradas' },
      { key: 'users', label: 'Usuarios' },
      { key: 'buses', label: 'Buses / Conductores' },
      { key: 'tickets', label: 'Tickets' },
      { key: 'cities', label: 'Ciudades' },
    ],
    []
  );

  const cityNameById = useMemo(() => {
    return cities.reduce<Record<string, string>>((acc, city) => {
      acc[city.id] = city.name;
      return acc;
    }, {});
  }, [cities]);

  const routeLabelById = useMemo(() => {
    return routes.reduce<Record<string, string>>((acc, route) => {
      const routeLabel = route.code ? `${route.code} - ${route.name}` : route.name;
      acc[route.id] = routeLabel;
      return acc;
    }, {});
  }, [routes]);

  const userNameById = useMemo(() => {
    return users.reduce<Record<string, string>>((acc, user) => {
      acc[user.uid] = user.name || user.email || 'Usuario';
      return acc;
    }, {});
  }, [users]);

  const openPicker = (target: CoordinateTarget) => {
    setPickerTarget(target);
    setPickerVisible(true);
  };

  const handlePickerSelect = (coordinate: { latitude: number; longitude: number }) => {
    if (pickerTarget === 'routeStart') {
      setRouteForm((prev) => ({ ...prev, startLat: String(coordinate.latitude), startLng: String(coordinate.longitude) }));
    } else if (pickerTarget === 'routeMid') {
      setRouteForm((prev) => ({ ...prev, midLat: String(coordinate.latitude), midLng: String(coordinate.longitude) }));
    } else if (pickerTarget === 'routeEnd') {
      setRouteForm((prev) => ({ ...prev, endLat: String(coordinate.latitude), endLng: String(coordinate.longitude) }));
    } else if (pickerTarget === 'stop') {
      setStopForm((prev) => ({ ...prev, latitude: String(coordinate.latitude), longitude: String(coordinate.longitude) }));
    } else if (pickerTarget === 'bus') {
      setBusForm((prev) => ({ ...prev, latitude: String(coordinate.latitude), longitude: String(coordinate.longitude) }));
    } else if (pickerTarget === 'city') {
      setCityForm((prev) => ({ ...prev, centerLat: String(coordinate.latitude), centerLng: String(coordinate.longitude) }));
    }
    setPickerVisible(false);
  };

  const refreshRoutes = useCallback(async () => {
    const data = await getAdminRoutes();
    setRoutes(data);
    if (!selectedRouteId && data.length) {
      setSelectedRouteId(data[0].id);
    }
  }, [selectedRouteId]);

  const refreshStops = useCallback(async () => {
    if (!selectedRouteId) {
      setSelectedRouteDetail(null);
      return;
    }
    const detail = await getRouteDetail(selectedRouteId);
    setSelectedRouteDetail(detail);
  }, [selectedRouteId]);

  const refreshUsers = useCallback(async () => {
    const data = await listUsers();
    setUsers(data);
  }, []);

  const refreshBuses = useCallback(async () => {
    const data = await listBuses();
    setBuses(data);
  }, []);

  const refreshTickets = useCallback(async () => {
    const data = await listTickets();
    setTickets(data);
  }, []);

  const refreshCities = useCallback(async () => {
    const data = await listCities();
    setCities(data);
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    const results = await Promise.allSettled([refreshRoutes(), refreshUsers(), refreshBuses(), refreshTickets(), refreshCities()]);
    setLoading(false);
    const firstError = results.find((r): r is PromiseRejectedResult => r.status === 'rejected');
    if (firstError) {
      Alert.alert(t('common.error'), (firstError.reason as any)?.message ?? 'No se pudieron cargar algunos datos del panel admin');
    }
  }, [refreshBuses, refreshCities, refreshRoutes, refreshTickets, refreshUsers, t]);

  useEffect(() => {
    void refreshAll();
  }, [refreshAll]);

  useEffect(() => {
    void refreshStops();
  }, [refreshStops]);

  const resetRouteEditor = () => {
    setEditingRouteId(null);
    setRouteForm(EMPTY_ROUTE_FORM);
  };

  const resetStopEditor = () => {
    setEditingStopId(null);
    setStopForm(EMPTY_STOP_FORM);
  };

  const buildRoutePayload = (): RouteUpsertInput | null => {
    if (
      routeForm.startLat === '' || routeForm.startLng === '' ||
      routeForm.midLat === '' || routeForm.midLng === '' ||
      routeForm.endLat === '' || routeForm.endLng === ''
    ) {
      Alert.alert('Coordenadas requeridas', 'Selecciona inicio, punto medio y destino desde el mapa.');
      return null;
    }

    const startLat = asNumber(routeForm.startLat);
    const startLng = asNumber(routeForm.startLng);
    const midLat = asNumber(routeForm.midLat);
    const midLng = asNumber(routeForm.midLng);
    const endLat = asNumber(routeForm.endLat);
    const endLng = asNumber(routeForm.endLng);

    if (!isCoordinateValid(startLat, startLng) || !isCoordinateValid(midLat, midLng) || !isCoordinateValid(endLat, endLng)) {
      Alert.alert('Coordenadas inválidas', 'Selecciona inicio, punto medio y destino desde el mapa.');
      return null;
    }

    if (!routeForm.name.trim() || !routeForm.code.trim() || !routeForm.origin.trim() || !routeForm.destination.trim()) {
      Alert.alert('Campos requeridos', 'Completa nombre, código, origen y destino.');
      return null;
    }

    const anchorPoints = [
      {
        label: routeForm.origin.trim(),
        kind: 'start' as const,
        coordinates: { latitude: startLat, longitude: startLng },
        order: 1,
      },
      {
        label: routeForm.midpoint.trim(),
        kind: 'mid' as const,
        coordinates: { latitude: midLat, longitude: midLng },
        order: 2,
      },
      {
        label: routeForm.destination.trim(),
        kind: 'end' as const,
        coordinates: { latitude: endLat, longitude: endLng },
        order: 3,
      },
    ];

    return {
      name: routeForm.name.trim(),
      code: routeForm.code.trim(),
      origin: routeForm.origin.trim(),
      midpoint: routeForm.midpoint.trim(),
      destination: routeForm.destination.trim(),
      frequency: routeForm.frequency.trim(),
      fare: routeForm.fare.trim(),
      color: routeForm.color.trim() || '#1976D2',
      status: routeForm.status,
      isActive: routeForm.status === 'active',
      anchorPoints,
      stops: anchorPoints.map((point, index) => ({
        id: `${routeForm.code || 'route'}-stop-${index + 1}`,
        name: point.label,
        time: '--:--',
        coordinates: point.coordinates,
        isActive: true,
        order: index + 1,
      })),
    };
  };

  const updateRouteWithStops = async (detail: RouteData, nextStops: RouteStop[]) => {
    const anchorPoints = (detail.anchorPoints ?? []).map((point, index) => ({
      label: point.label,
      kind: point.kind,
      coordinates: {
        latitude: Number(point.coordinates.latitude),
        longitude: Number(point.coordinates.longitude),
      },
      order: Number(point.order ?? index + 1),
    }));

    await updateRoute(detail.id, {
      name: detail.name,
      code: detail.code ?? detail.id,
      origin: detail.startPoint,
      midpoint: detail.midpoint ?? '',
      destination: detail.endPoint,
      frequency: detail.frequency,
      fare: detail.fare,
      color: detail.color,
      status: detail.status,
      isActive: detail.isActive,
      anchorPoints,
      stops: nextStops.map((stop, index) => stopToInput(stop, index)),
    });
  };

  const handleSaveRoute = async () => {
    const payload = buildRoutePayload();
    if (!payload) return;

    setSaving(true);
    try {
      if (editingRouteId) {
        await updateRoute(editingRouteId, payload);
      } else {
        await createRoute(payload);
      }
      resetRouteEditor();
      await refreshRoutes();
      if (selectedRouteId) {
        await refreshStops();
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), callableErrorMessage(error, 'No se pudo guardar la ruta'));
    } finally {
      setSaving(false);
    }
  };

  const handleEditRoute = async (route: RouteItem) => {
    setSaving(true);
    try {
      const detail = await getRouteDetail(route.id);
      const start = detail?.anchorPoints?.find((point) => point.kind === 'start')?.coordinates;
      const mid = detail?.anchorPoints?.find((point) => point.kind === 'mid')?.coordinates;
      const end = detail?.anchorPoints?.find((point) => point.kind === 'end')?.coordinates;

      setEditingRouteId(route.id);
      setRouteForm({
        name: route.name,
        code: route.code ?? '',
        origin: route.origin,
        midpoint: route.midpoint ?? '',
        destination: route.destination,
        frequency: route.frequency,
        fare: route.fare,
        color: route.color ?? '#1976D2',
        status: route.status,
        startLat: String(start?.latitude ?? ''),
        startLng: String(start?.longitude ?? ''),
        midLat: String(mid?.latitude ?? ''),
        midLng: String(mid?.longitude ?? ''),
        endLat: String(end?.latitude ?? ''),
        endLng: String(end?.longitude ?? ''),
      });
      setActiveSection('routes');
    } catch (error: any) {
      Alert.alert(t('common.error'), callableErrorMessage(error, 'No se pudo cargar el detalle de la ruta'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoute = (routeId: string) => {
    Alert.alert('Eliminar ruta', 'Esta acción eliminará la ruta y sus paradas. ¿Deseas continuar?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setSaving(true);
            try {
              await deleteRoute(routeId);
              if (selectedRouteId === routeId) {
                setSelectedRouteId('');
                setSelectedRouteDetail(null);
              }
              await refreshRoutes();
            } catch (error: any) {
              Alert.alert(t('common.error'), callableErrorMessage(error, 'No se pudo eliminar la ruta'));
            } finally {
              setSaving(false);
            }
          })();
        },
      },
    ]);
  };

  const handleEditStop = (stop: RouteStop) => {
    setEditingStopId(stop.id);
    setStopForm({
      id: stop.id,
      name: stop.name,
      time: stop.time,
      latitude: String(stop.coordinates.latitude),
      longitude: String(stop.coordinates.longitude),
      isActive: Boolean(stop.isActive ?? true),
      order: Number(stop.order ?? 1),
    });
  };

  const handleSaveStop = async () => {
    if (!selectedRouteDetail || !editingStopId) {
      return;
    }

    const latitude = asNumber(stopForm.latitude);
    const longitude = asNumber(stopForm.longitude);
    if (!isValidTime(stopForm.time.trim())) {
      Alert.alert('Hora inválida', 'La hora de la parada debe tener formato HH:MM.');
      return;
    }
    if (!isCoordinateValid(latitude, longitude)) {
      Alert.alert('Coordenadas inválidas', 'Selecciona la coordenada de la parada desde el mapa.');
      return;
    }

    setSaving(true);
    try {
      const updatedStops = (selectedRouteDetail.stops ?? []).map((stop) => {
        if (stop.id !== editingStopId) return stop;
        return {
          ...stop,
          name: stopForm.name.trim(),
          time: stopForm.time.trim(),
          coordinates: { latitude, longitude },
          isActive: stopForm.isActive,
          order: stopForm.order,
        };
      });

      await updateRouteWithStops(selectedRouteDetail, updatedStops);
      resetStopEditor();
      await refreshStops();
      await refreshRoutes();
    } catch (error: any) {
      Alert.alert(t('common.error'), callableErrorMessage(error, 'No se pudo actualizar la parada'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteStop = (stopId: string) => {
    if (!selectedRouteDetail) return;

    Alert.alert('Eliminar parada', 'La parada será removida de la ruta seleccionada. ¿Deseas continuar?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setSaving(true);
            try {
              const nextStops = (selectedRouteDetail.stops ?? []).filter((stop) => stop.id !== stopId);
              await updateRouteWithStops(selectedRouteDetail, nextStops);
              resetStopEditor();
              await refreshStops();
            } catch (error: any) {
              Alert.alert(t('common.error'), callableErrorMessage(error, 'No se pudo eliminar la parada'));
            } finally {
              setSaving(false);
            }
          })();
        },
      },
    ]);
  };

  const handleEditUser = (user: AdminUserRecord) => {
    setCreatingUser(false);
    setEditingUserId(user.uid);
    setUserForm({
      email: user.email,
      password: '',
      name: user.name,
      role: user.role,
      cityId: user.cityId,
      isActive: user.isActive,
    });
  };

  const handleCreateUserMode = () => {
    setEditingUserId(null);
    setCreatingUser(true);
    setUserForm(EMPTY_USER_FORM);
  };

  const handleSaveUser = async () => {
    if (!userForm.name.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el nombre del usuario.');
      return;
    }

    if (!userForm.cityId.trim()) {
      Alert.alert('Campo requerido', 'Selecciona una ciudad.');
      return;
    }

    if (creatingUser) {
      if (!userForm.email.trim()) {
        Alert.alert('Campo requerido', 'Ingresa el correo del usuario.');
        return;
      }
      if (!userForm.password.trim() || userForm.password.trim().length < 8) {
        Alert.alert('Campo requerido', 'Ingresa una contraseña temporal de al menos 8 caracteres.');
        return;
      }
    }

    if (!creatingUser && !editingUserId) return;

    setSaving(true);
    try {
      if (creatingUser) {
        await createUserAdmin({
          email: userForm.email.trim(),
          password: userForm.password.trim(),
          name: userForm.name.trim(),
          role: userForm.role,
          cityId: userForm.cityId.trim(),
          isActive: userForm.isActive,
        });
      } else {
        await updateUserAdmin({
          uid: editingUserId!,
          name: userForm.name.trim(),
          role: userForm.role,
          cityId: userForm.cityId.trim(),
          isActive: userForm.isActive,
        });
      }

      setCreatingUser(false);
      setEditingUserId(null);
      setUserForm(EMPTY_USER_FORM);
      await refreshUsers();
    } catch (error: any) {
      Alert.alert(t('common.error'), callableErrorMessage(error, 'No se pudo actualizar el usuario'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteUser = (uid: string) => {
    Alert.alert('Eliminar usuario', '¿Deseas eliminar este usuario?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setSaving(true);
            try {
              await deleteUserAdmin(uid);
              if (editingUserId === uid) {
                setEditingUserId(null);
                setUserForm(EMPTY_USER_FORM);
              }
              await refreshUsers();
            } catch (error: any) {
              Alert.alert(t('common.error'), callableErrorMessage(error, 'No se pudo eliminar el usuario'));
            } finally {
              setSaving(false);
            }
          })();
        },
      },
    ]);
  };

  const handleEditBus = (bus: AdminBusRecord) => {
    setCreatingBus(false);
    setEditingBusId(bus.busId);
    setBusForm({
      busId: bus.busId,
      busLabel: bus.busLabel,
      routeId: bus.routeId,
      cityId: bus.cityId,
      status: bus.status,
      isActive: bus.isActive,
      latitude: String(bus.latitude),
      longitude: String(bus.longitude),
    });
  };

  const handleCreateBusMode = () => {
    setEditingBusId(null);
    setCreatingBus(true);
    setBusForm(EMPTY_BUS_FORM);
  };

  const handleSaveBus = async () => {
    const currentBusId = editingBusId || (creatingBus ? `${toSlug(busForm.busLabel || 'unidad')}-${Date.now()}` : '');
    if (!currentBusId) return;

    if (!busForm.busLabel.trim()) {
      Alert.alert('Campo requerido', 'Ingresa el nombre o etiqueta de la unidad.');
      return;
    }

    if (!busForm.routeId.trim()) {
      Alert.alert('Campo requerido', 'Selecciona la ruta de la unidad.');
      return;
    }

    if (!busForm.cityId.trim()) {
      Alert.alert('Campo requerido', 'Selecciona la ciudad de la unidad.');
      return;
    }

    if (creatingBus && (busForm.latitude.trim() === '' || busForm.longitude.trim() === '')) {
      Alert.alert('Coordenadas requeridas', 'Selecciona la posición inicial del bus en el mapa.');
      return;
    }
    const latitude = asNumber(busForm.latitude);
    const longitude = asNumber(busForm.longitude);
    if (!isCoordinateValid(latitude, longitude)) {
      Alert.alert('Coordenadas inválidas', 'Selecciona coordenadas válidas desde el mapa para el bus.');
      return;
    }

    setSaving(true);
    try {
      await updateBusAdmin({
        busId: currentBusId,
        busLabel: busForm.busLabel.trim(),
        routeId: busForm.routeId.trim(),
        cityId: busForm.cityId.trim(),
        status: busForm.status,
        isActive: busForm.isActive,
        latitude,
        longitude,
      });
      setCreatingBus(false);
      setEditingBusId(null);
      setBusForm(EMPTY_BUS_FORM);
      await refreshBuses();
    } catch (error: any) {
      Alert.alert(t('common.error'), callableErrorMessage(error, 'No se pudo actualizar el bus'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteBus = (busId: string) => {
    Alert.alert('Eliminar bus', '¿Deseas eliminar este registro de bus?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setSaving(true);
            try {
              await deleteBusAdmin(busId);
              if (editingBusId === busId) {
                setEditingBusId(null);
                setBusForm(EMPTY_BUS_FORM);
              }
              await refreshBuses();
            } catch (error: any) {
              Alert.alert(t('common.error'), callableErrorMessage(error, 'No se pudo eliminar el bus'));
            } finally {
              setSaving(false);
            }
          })();
        },
      },
    ]);
  };

  const handleEditTicket = (ticket: AdminTicketRecord) => {
    setEditingTicketId(ticket.id);
    setTicketForm({
      ticketId: ticket.id,
      assignedTo: ticket.assignedTo || '',
      status: ticket.status,
    });
  };

  const handleSaveTicket = async () => {
    if (!editingTicketId || !ticketForm.assignedTo.trim()) {
      Alert.alert('Campos requeridos', 'Para editar ticket debes indicar assignedTo y status.');
      return;
    }

    setSaving(true);
    try {
      await assignTicket({
        ticketId: editingTicketId,
        assignedTo: ticketForm.assignedTo.trim(),
        status: ticketForm.status,
      });
      setEditingTicketId(null);
      setTicketForm(EMPTY_TICKET_FORM);
      await refreshTickets();
    } catch (error: any) {
      Alert.alert(t('common.error'), callableErrorMessage(error, 'No se pudo actualizar el ticket'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTicket = (ticketId: string) => {
    Alert.alert('Eliminar ticket', '¿Deseas eliminar este ticket?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setSaving(true);
            try {
              await deleteTicketAdmin(ticketId);
              if (editingTicketId === ticketId) {
                setEditingTicketId(null);
                setTicketForm(EMPTY_TICKET_FORM);
              }
              await refreshTickets();
            } catch (error: any) {
              Alert.alert(t('common.error'), callableErrorMessage(error, 'No se pudo eliminar el ticket'));
            } finally {
              setSaving(false);
            }
          })();
        },
      },
    ]);
  };

  const handleEditCity = (city: AdminCityRecord) => {
    setEditingCityId(city.id);
    setCityForm({
      cityId: city.id,
      name: city.name,
      state: city.state,
      country: city.country || 'Panama',
      isActive: city.isActive,
      centerLat: String(city.center?.latitude ?? ''),
      centerLng: String(city.center?.longitude ?? ''),
    });
  };

  const handleSaveCity = async () => {
    const cityId = editingCityId || toSlug(cityForm.name);
    const name = cityForm.name.trim();
    if (!name) {
      Alert.alert('Campos requeridos', 'Debes indicar el nombre de la ciudad.');
      return;
    }

    if (!cityId) {
      Alert.alert('Nombre inválido', 'No se pudo generar el identificador interno de la ciudad.');
      return;
    }

    if (cityForm.centerLat.trim() === '' || cityForm.centerLng.trim() === '') {
      Alert.alert('Coordenadas requeridas', 'Selecciona el centro de la ciudad en el mapa.');
      return;
    }
    const latitude = asNumber(cityForm.centerLat);
    const longitude = asNumber(cityForm.centerLng);
    if (!isCoordinateValid(latitude, longitude)) {
      Alert.alert('Coordenadas inválidas', 'Las coordenadas seleccionadas no son válidas.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        cityId,
        name,
        state: cityForm.state.trim(),
        country: cityForm.country.trim() || 'Panama',
        isActive: cityForm.isActive,
        center: { latitude, longitude },
      };

      if (editingCityId) {
        await updateCityAdmin(payload);
      } else {
        await createCityAdmin(payload);
      }

      setEditingCityId(null);
      setCityForm({ ...EMPTY_CITY_FORM, cityId: '' });
      void refreshCities().catch(() => undefined);
    } catch (error: any) {
      Alert.alert(t('common.error'), callableErrorMessage(error, 'No se pudo guardar la ciudad'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCity = (cityId: string) => {
    Alert.alert('Eliminar ciudad', '¿Deseas eliminar esta ciudad?', [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          void (async () => {
            setSaving(true);
            try {
              await deleteCityAdmin(cityId);
              if (editingCityId === cityId) {
                setEditingCityId(null);
                setCityForm(EMPTY_CITY_FORM);
              }
              await refreshCities();
            } catch (error: any) {
              Alert.alert(t('common.error'), callableErrorMessage(error, 'No se pudo eliminar la ciudad'));
            } finally {
              setSaving(false);
            }
          })();
        },
      },
    ]);
  };

  const renderActionButtons = (
    onEdit: () => void,
    onDelete: () => void
  ) => (
    <View style={{ flexDirection: 'row', gap: 12 }}>
      <TouchableOpacity onPress={onEdit}>
        <Text style={{ color: colors.primary, fontWeight: '700' }}>Editar</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={onDelete}>
        <Text style={{ color: colors.error, fontWeight: '700' }}>Eliminar</Text>
      </TouchableOpacity>
    </View>
  );

  const renderChoiceSelector = (
    title: string,
    value: string,
    options: Array<{ value: string; label: string }>,
    onSelect: (next: string) => void
  ) => (
    <View style={{ gap: 8 }}>
      <Text style={{ ...CommonStyles.typography.caption, color: colors.gray600 }}>{title}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <TouchableOpacity
              key={option.value}
              onPress={() => onSelect(option.value)}
              style={{
                borderWidth: 1,
                borderColor: selected ? colors.primary : colors.gray300,
                backgroundColor: selected ? colors.primary : colors.white,
                borderRadius: 999,
                paddingVertical: 8,
                paddingHorizontal: 12,
              }}
            >
              <Text style={{ color: selected ? colors.white : colors.gray700, fontWeight: '700' }}>
                {option.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );

  const renderRouteSection = () => (
    <View style={{ gap: 12 }}>
      <View style={{ ...CommonStyles.card(colors), gap: 10 }}>
        <Text style={{ ...CommonStyles.typography.h3, color: colors.gray800 }}>
          {editingRouteId ? 'Editar ruta' : 'Nueva ruta'}
        </Text>

        <TextInput
          value={routeForm.name}
          onChangeText={(value) => setRouteForm((prev) => ({ ...prev, name: value }))}
          placeholder="Nombre"
          style={CommonStyles.input(colors)}
        />
        <TextInput
          value={routeForm.code}
          onChangeText={(value) => setRouteForm((prev) => ({ ...prev, code: value }))}
          placeholder="Código"
          style={CommonStyles.input(colors)}
          autoCapitalize="characters"
        />
        <TextInput
          value={routeForm.origin}
          onChangeText={(value) => setRouteForm((prev) => ({ ...prev, origin: value }))}
          placeholder="Origen"
          style={CommonStyles.input(colors)}
        />
        <TextInput
          value={routeForm.midpoint}
          onChangeText={(value) => setRouteForm((prev) => ({ ...prev, midpoint: value }))}
          placeholder="Punto medio"
          style={CommonStyles.input(colors)}
        />
        <TextInput
          value={routeForm.destination}
          onChangeText={(value) => setRouteForm((prev) => ({ ...prev, destination: value }))}
          placeholder="Destino"
          style={CommonStyles.input(colors)}
        />
        <TextInput
          value={routeForm.frequency}
          onChangeText={(value) => setRouteForm((prev) => ({ ...prev, frequency: value }))}
          placeholder="Frecuencia"
          style={CommonStyles.input(colors)}
        />
        <TextInput
          value={routeForm.fare}
          onChangeText={(value) => setRouteForm((prev) => ({ ...prev, fare: value }))}
          placeholder="Tarifa"
          style={CommonStyles.input(colors)}
        />

        <View style={{ gap: 8 }}>
          <TouchableOpacity onPress={() => openPicker('routeStart')} style={CommonStyles.secondaryButton(colors)}>
            <Text style={CommonStyles.secondaryButtonText(colors)}>
              Seleccionar inicio en mapa ({routeForm.startLat || '-'}, {routeForm.startLng || '-'})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openPicker('routeMid')} style={CommonStyles.secondaryButton(colors)}>
            <Text style={CommonStyles.secondaryButtonText(colors)}>
              Seleccionar punto medio en mapa ({routeForm.midLat || '-'}, {routeForm.midLng || '-'})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => openPicker('routeEnd')} style={CommonStyles.secondaryButton(colors)}>
            <Text style={CommonStyles.secondaryButtonText(colors)}>
              Seleccionar destino en mapa ({routeForm.endLat || '-'}, {routeForm.endLng || '-'})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={handleSaveRoute} style={CommonStyles.primaryButton(colors)} disabled={saving}>
            <Text style={CommonStyles.primaryButtonText}>{editingRouteId ? 'Guardar cambios' : 'Crear ruta'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={resetRouteEditor} style={CommonStyles.secondaryButton(colors)}>
            <Text style={CommonStyles.secondaryButtonText(colors)}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={CommonStyles.card(colors)}>
        <Text style={{ ...CommonStyles.typography.h3, color: colors.gray800, marginBottom: 10 }}>Tabla de rutas</Text>
        {routes.map((route) => (
          <View key={route.id} style={CommonStyles.tableRow(colors)}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...CommonStyles.typography.bodyMedium, color: colors.gray800, fontWeight: '700' }}>
                {route.code} · {route.name}
              </Text>
              <Text style={{ ...CommonStyles.typography.caption, color: colors.gray500 }}>
                {route.origin} → {route.destination}
              </Text>
            </View>
            {renderActionButtons(() => handleEditRoute(route), () => handleDeleteRoute(route.id))}
          </View>
        ))}
      </View>
    </View>
  );

  const renderStopsSection = () => (
    <View style={{ gap: 12 }}>
      <View style={CommonStyles.card(colors)}>
        <Text style={{ ...CommonStyles.typography.h3, color: colors.gray800 }}>Ruta seleccionada</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginTop: 10 }}>
          {routes.map((route) => (
            <TouchableOpacity
              key={route.id}
              onPress={() => setSelectedRouteId(route.id)}
              style={{
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 999,
                borderWidth: 1,
                borderColor: selectedRouteId === route.id ? colors.primary : colors.gray300,
                backgroundColor: selectedRouteId === route.id ? colors.primary : colors.white,
              }}
            >
              <Text style={{ color: selectedRouteId === route.id ? colors.white : colors.gray700, fontWeight: '700' }}>
                {route.code || route.id}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {selectedRouteDetail && (
        <>
          {editingStopId && (
            <View style={{ ...CommonStyles.card(colors), gap: 10 }}>
              <Text style={{ ...CommonStyles.typography.h3, color: colors.gray800 }}>Editar parada</Text>
              <TextInput
                value={stopForm.name}
                onChangeText={(value) => setStopForm((prev) => ({ ...prev, name: value }))}
                placeholder="Nombre"
                style={CommonStyles.input(colors)}
              />
              <TextInput
                value={stopForm.time}
                onChangeText={(value) => setStopForm((prev) => ({ ...prev, time: value }))}
                placeholder="Hora"
                style={CommonStyles.input(colors)}
              />
              <TouchableOpacity onPress={() => openPicker('stop')} style={CommonStyles.secondaryButton(colors)}>
                <Text style={CommonStyles.secondaryButtonText(colors)}>
                  Seleccionar coordenada en mapa ({stopForm.latitude || '-'}, {stopForm.longitude || '-'})
                </Text>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <TouchableOpacity onPress={handleSaveStop} style={CommonStyles.primaryButton(colors)} disabled={saving}>
                  <Text style={CommonStyles.primaryButtonText}>Guardar parada</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={resetStopEditor} style={CommonStyles.secondaryButton(colors)}>
                  <Text style={CommonStyles.secondaryButtonText(colors)}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <View style={CommonStyles.card(colors)}>
            <Text style={{ ...CommonStyles.typography.h3, color: colors.gray800, marginBottom: 10 }}>Tabla de paradas</Text>
            {(selectedRouteDetail.stops ?? []).map((stop) => (
              <View key={stop.id} style={CommonStyles.tableRow(colors)}>
                <View style={{ flex: 1 }}>
                  <Text style={{ ...CommonStyles.typography.bodyMedium, color: colors.gray800, fontWeight: '700' }}>{stop.name}</Text>
                  <Text style={{ ...CommonStyles.typography.caption, color: colors.gray500 }}>
                    {stop.time} · {stop.coordinates.latitude}, {stop.coordinates.longitude}
                  </Text>
                </View>
                {renderActionButtons(() => handleEditStop(stop), () => handleDeleteStop(stop.id))}
              </View>
            ))}
          </View>
        </>
      )}
    </View>
  );

  const renderUsersSection = () => (
    <View style={{ gap: 12 }}>
      {(editingUserId || creatingUser) && (
        <View style={{ ...CommonStyles.card(colors), gap: 10 }}>
          <Text style={{ ...CommonStyles.typography.h3, color: colors.gray800 }}>{creatingUser ? 'Crear usuario' : 'Editar usuario'}</Text>

          {creatingUser && (
            <>
              <TextInput
                value={userForm.email}
                onChangeText={(value) => setUserForm((prev) => ({ ...prev, email: value }))}
                placeholder="Correo electrónico"
                style={CommonStyles.input(colors)}
                autoCapitalize="none"
                keyboardType="email-address"
              />
              <TextInput
                value={userForm.password}
                onChangeText={(value) => setUserForm((prev) => ({ ...prev, password: value }))}
                placeholder="Contraseña temporal"
                style={CommonStyles.input(colors)}
                secureTextEntry
              />
            </>
          )}

          <TextInput
            value={userForm.name}
            onChangeText={(value) => setUserForm((prev) => ({ ...prev, name: value }))}
            placeholder="Nombre"
            style={CommonStyles.input(colors)}
          />

          {renderChoiceSelector(
            'Ciudad',
            userForm.cityId,
            cities.map((city) => ({ value: city.id, label: city.name })),
            (value) => setUserForm((prev) => ({ ...prev, cityId: value }))
          )}

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['passenger', 'driver', 'admin'] as AdminRole[]).map((role) => (
              <TouchableOpacity
                key={role}
                onPress={() => setUserForm((prev) => ({ ...prev, role }))}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: userForm.role === role ? colors.primary : colors.gray300,
                  backgroundColor: userForm.role === role ? colors.primary : colors.white,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: userForm.role === role ? colors.white : colors.gray700, fontWeight: '700' }}>{role}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity
            onPress={() => setUserForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
            style={CommonStyles.secondaryButton(colors)}
          >
            <Text style={CommonStyles.secondaryButtonText(colors)}>
              Estado: {userForm.isActive ? 'Activo' : 'Inactivo'}
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={handleSaveUser} style={CommonStyles.primaryButton(colors)}>
              <Text style={CommonStyles.primaryButtonText}>{creatingUser ? 'Crear usuario' : 'Guardar usuario'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setEditingUserId(null);
                setCreatingUser(false);
                setUserForm(EMPTY_USER_FORM);
              }}
              style={CommonStyles.secondaryButton(colors)}
            >
              <Text style={CommonStyles.secondaryButtonText(colors)}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!editingUserId && !creatingUser && (
        <View style={CommonStyles.card(colors)}>
          <TouchableOpacity onPress={handleCreateUserMode} style={CommonStyles.primaryButton(colors)}>
            <Text style={CommonStyles.primaryButtonText}>Crear nuevo usuario</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={CommonStyles.card(colors)}>
        <Text style={{ ...CommonStyles.typography.h3, color: colors.gray800, marginBottom: 10 }}>Tabla de usuarios</Text>
        {users.map((user) => (
          <View key={user.uid} style={CommonStyles.tableRow(colors)}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...CommonStyles.typography.bodyMedium, color: colors.gray800, fontWeight: '700' }}>{user.name || 'Sin nombre'}</Text>
              <Text style={{ ...CommonStyles.typography.caption, color: colors.gray500 }}>
                {user.email || 'sin email'} · {user.role} · {cityNameById[user.cityId] || 'Sin ciudad asignada'}
              </Text>
            </View>
            {renderActionButtons(() => handleEditUser(user), () => handleDeleteUser(user.uid))}
          </View>
        ))}
      </View>
    </View>
  );

  const renderBusesSection = () => (
    <View style={{ gap: 12 }}>
      {(editingBusId || creatingBus) && (
        <View style={{ ...CommonStyles.card(colors), gap: 10 }}>
          <Text style={{ ...CommonStyles.typography.h3, color: colors.gray800 }}>{creatingBus ? 'Crear unidad' : 'Editar unidad'}</Text>
          <TextInput value={busForm.busLabel} onChangeText={(value) => setBusForm((prev) => ({ ...prev, busLabel: value }))} placeholder="Etiqueta" style={CommonStyles.input(colors)} />

          {renderChoiceSelector(
            'Ruta',
            busForm.routeId,
            routes.map((route) => ({ value: route.id, label: route.code ? `${route.code} - ${route.name}` : route.name })),
            (value) => setBusForm((prev) => ({ ...prev, routeId: value }))
          )}

          {renderChoiceSelector(
            'Ciudad',
            busForm.cityId,
            cities.map((city) => ({ value: city.id, label: city.name })),
            (value) => setBusForm((prev) => ({ ...prev, cityId: value }))
          )}

          <View style={{ flexDirection: 'row', gap: 8 }}>
            {(['active', 'inactive', 'paused'] as BusStatus[]).map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setBusForm((prev) => ({ ...prev, status }))}
                style={{
                  flex: 1,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: busForm.status === status ? colors.primary : colors.gray300,
                  backgroundColor: busForm.status === status ? colors.primary : colors.white,
                  paddingVertical: 10,
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: busForm.status === status ? colors.white : colors.gray700, fontWeight: '700' }}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity onPress={() => openPicker('bus')} style={CommonStyles.secondaryButton(colors)}>
            <Text style={CommonStyles.secondaryButtonText(colors)}>
              Seleccionar coordenada en mapa ({busForm.latitude || '-'}, {busForm.longitude || '-'})
            </Text>
          </TouchableOpacity>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={handleSaveBus} style={CommonStyles.primaryButton(colors)}>
              <Text style={CommonStyles.primaryButtonText}>{creatingBus ? 'Crear unidad' : 'Guardar unidad'}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setEditingBusId(null);
                setCreatingBus(false);
                setBusForm(EMPTY_BUS_FORM);
              }}
              style={CommonStyles.secondaryButton(colors)}
            >
              <Text style={CommonStyles.secondaryButtonText(colors)}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {!editingBusId && !creatingBus && (
        <View style={CommonStyles.card(colors)}>
          <TouchableOpacity onPress={handleCreateBusMode} style={CommonStyles.primaryButton(colors)}>
            <Text style={CommonStyles.primaryButtonText}>Crear nueva unidad</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={CommonStyles.card(colors)}>
        <Text style={{ ...CommonStyles.typography.h3, color: colors.gray800, marginBottom: 10 }}>Tabla de buses</Text>
        {buses.map((bus) => (
          <View key={bus.id} style={CommonStyles.tableRow(colors)}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...CommonStyles.typography.bodyMedium, color: colors.gray800, fontWeight: '700' }}>{bus.busLabel || bus.busId}</Text>
              <Text style={{ ...CommonStyles.typography.caption, color: colors.gray500 }}>
                {routeLabelById[bus.routeId] || 'Sin ruta'} · {cityNameById[bus.cityId] || 'Sin ciudad'} · {bus.status}
              </Text>
            </View>
            {renderActionButtons(() => handleEditBus(bus), () => handleDeleteBus(bus.busId))}
          </View>
        ))}
      </View>
    </View>
  );

  const renderTicketsSection = () => (
    <View style={{ gap: 12 }}>
      {editingTicketId && (
        <View style={{ ...CommonStyles.card(colors), gap: 10 }}>
          <Text style={{ ...CommonStyles.typography.h3, color: colors.gray800 }}>Editar ticket</Text>

          {renderChoiceSelector(
            'Asignar a',
            ticketForm.assignedTo,
            users.map((user) => ({ value: user.uid, label: user.name || user.email || 'Usuario' })),
            (value) => setTicketForm((prev) => ({ ...prev, assignedTo: value }))
          )}

          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {(['open', 'in_progress', 'resolved', 'closed'] as TicketStatus[]).map((status) => (
              <TouchableOpacity
                key={status}
                onPress={() => setTicketForm((prev) => ({ ...prev, status }))}
                style={{
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: ticketForm.status === status ? colors.primary : colors.gray300,
                  backgroundColor: ticketForm.status === status ? colors.primary : colors.white,
                  paddingHorizontal: 10,
                  paddingVertical: 8,
                }}
              >
                <Text style={{ color: ticketForm.status === status ? colors.white : colors.gray700, fontWeight: '700' }}>{status}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity onPress={handleSaveTicket} style={CommonStyles.primaryButton(colors)}>
              <Text style={CommonStyles.primaryButtonText}>Guardar ticket</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => { setEditingTicketId(null); setTicketForm(EMPTY_TICKET_FORM); }} style={CommonStyles.secondaryButton(colors)}>
              <Text style={CommonStyles.secondaryButtonText(colors)}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      <View style={CommonStyles.card(colors)}>
        <Text style={{ ...CommonStyles.typography.h3, color: colors.gray800, marginBottom: 10 }}>Tabla de tickets</Text>
        {tickets.map((ticket) => (
          <View key={ticket.id} style={CommonStyles.tableRow(colors)}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...CommonStyles.typography.bodyMedium, color: colors.gray800, fontWeight: '700' }}>{ticket.subject}</Text>
              <Text style={{ ...CommonStyles.typography.caption, color: colors.gray500 }}>
                {ticket.priority} · {ticket.status} · {userNameById[ticket.assignedTo] || 'Sin asignar'}
              </Text>
            </View>
            {renderActionButtons(() => handleEditTicket(ticket), () => handleDeleteTicket(ticket.id))}
          </View>
        ))}
      </View>
    </View>
  );

  const renderCitiesSection = () => (
    <View style={{ gap: 12 }}>
      <View style={{ ...CommonStyles.card(colors), gap: 10 }}>
        <Text style={{ ...CommonStyles.typography.h3, color: colors.gray800 }}>
          {editingCityId ? 'Editar ciudad' : 'Nueva ciudad'}
        </Text>
        {editingCityId ? (
          <Text style={{ ...CommonStyles.typography.caption, color: colors.gray500 }}>
            Identificador interno: {editingCityId}
          </Text>
        ) : null}
        <TextInput value={cityForm.name} onChangeText={(value) => setCityForm((prev) => ({ ...prev, name: value }))} placeholder="Nombre" style={CommonStyles.input(colors)} />
        <TextInput value={cityForm.state} onChangeText={(value) => setCityForm((prev) => ({ ...prev, state: value }))} placeholder="Provincia / Estado" style={CommonStyles.input(colors)} />
        <TextInput value={cityForm.country} onChangeText={(value) => setCityForm((prev) => ({ ...prev, country: value }))} placeholder="País" style={CommonStyles.input(colors)} />

        <TouchableOpacity onPress={() => openPicker('city')} style={CommonStyles.secondaryButton(colors)}>
          <Text style={CommonStyles.secondaryButtonText(colors)}>
            Seleccionar centro en mapa ({cityForm.centerLat || '-'}, {cityForm.centerLng || '-'})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setCityForm((prev) => ({ ...prev, isActive: !prev.isActive }))}
          style={CommonStyles.secondaryButton(colors)}
        >
          <Text style={CommonStyles.secondaryButtonText(colors)}>
            Estado: {cityForm.isActive ? 'Activa' : 'Inactiva'}
          </Text>
        </TouchableOpacity>

        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={handleSaveCity} style={CommonStyles.primaryButton(colors)}>
            <Text style={CommonStyles.primaryButtonText}>{editingCityId ? 'Guardar ciudad' : 'Crear ciudad'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => { setEditingCityId(null); setCityForm(EMPTY_CITY_FORM); }} style={CommonStyles.secondaryButton(colors)}>
            <Text style={CommonStyles.secondaryButtonText(colors)}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={CommonStyles.card(colors)}>
        <Text style={{ ...CommonStyles.typography.h3, color: colors.gray800, marginBottom: 10 }}>Tabla de ciudades</Text>
        {cities.map((city) => (
          <View key={city.id} style={CommonStyles.tableRow(colors)}>
            <View style={{ flex: 1 }}>
              <Text style={{ ...CommonStyles.typography.bodyMedium, color: colors.gray800, fontWeight: '700' }}>{city.name}</Text>
              <Text style={{ ...CommonStyles.typography.caption, color: colors.gray500 }}>
                {city.state || '-'} · {city.center?.latitude ?? '-'}, {city.center?.longitude ?? '-'}
              </Text>
            </View>
            {renderActionButtons(() => handleEditCity(city), () => handleDeleteCity(city.id))}
          </View>
        ))}
      </View>
    </View>
  );

  const renderSectionContent = () => {
    if (activeSection === 'routes') return renderRouteSection();
    if (activeSection === 'stops') return renderStopsSection();
    if (activeSection === 'users') return renderUsersSection();
    if (activeSection === 'buses') return renderBusesSection();
    if (activeSection === 'tickets') return renderTicketsSection();
    return renderCitiesSection();
  };

  const isCompact = width < 900;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.gray100 }}>
      <View style={{ padding: CommonStyles.spacing.md, borderBottomWidth: 1, borderBottomColor: colors.gray200, backgroundColor: colors.white }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <TouchableOpacity onPress={() => navigation.navigate('home')}>
            <Text style={{ color: colors.primary, fontSize: 20 }}>←</Text>
          </TouchableOpacity>
          <View style={{ flex: 1 }}>
            <Text style={{ ...CommonStyles.typography.h2, color: colors.gray800 }}>{t('auth.adminRole')} · Panel</Text>
            <Text style={{ ...CommonStyles.typography.caption, color: colors.gray500 }}>
              Secciones por entidad de base de datos con edición y eliminación por registro.
            </Text>
          </View>
          <TouchableOpacity onPress={() => void refreshAll()} style={CommonStyles.secondaryButton(colors)}>
            <Text style={CommonStyles.secondaryButtonText(colors)}>Actualizar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <View style={{ flex: 1, flexDirection: isCompact ? 'column' : 'row' }}>
          {isCompact ? (
            <ScrollView horizontal style={{ maxHeight: 64, backgroundColor: colors.white }} contentContainerStyle={{ padding: 10, gap: 8 }}>
              {sections.map((section) => (
                <TouchableOpacity
                  key={section.key}
                  onPress={() => setActiveSection(section.key)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 999,
                    borderWidth: 1,
                    borderColor: activeSection === section.key ? colors.primary : colors.gray300,
                    backgroundColor: activeSection === section.key ? colors.primary : colors.white,
                  }}
                >
                  <Text style={{ color: activeSection === section.key ? colors.white : colors.gray700, fontWeight: '700' }}>
                    {section.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : (
            <View style={{ width: 240, backgroundColor: colors.white, borderRightWidth: 1, borderRightColor: colors.gray200, padding: 10, gap: 8 }}>
              {sections.map((section) => (
                <TouchableOpacity
                  key={section.key}
                  onPress={() => setActiveSection(section.key)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    borderRadius: 10,
                    backgroundColor: activeSection === section.key ? colors.primary : colors.white,
                    borderWidth: 1,
                    borderColor: activeSection === section.key ? colors.primary : colors.gray200,
                  }}
                >
                  <Text style={{ color: activeSection === section.key ? colors.white : colors.gray700, fontWeight: '700' }}>
                    {section.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{
              padding: CommonStyles.spacing.md,
              gap: 12,
              paddingBottom: CommonStyles.spacing.xl,
            }}
          >
            {renderSectionContent()}
          </ScrollView>
        </View>
      )}

      <CoordinatePickerMap
        visible={pickerVisible}
        title="Seleccionar coordenada"
        onClose={() => setPickerVisible(false)}
        onSelect={handlePickerSelect}
      />
    </SafeAreaView>
  );
}
