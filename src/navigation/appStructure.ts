import { AppScreen } from '../types/navigation';

export type ProductSectionId =
  | 'core'
  | 'mobility'
  | 'account'
  | 'driver'
  | 'admin';

export interface ProductScreenDefinition {
  id: string;
  section: ProductSectionId;
  title: string;
  status: 'implemented' | 'in-progress' | 'planned';
  requiresAuth?: boolean;
  allowedRoles?: Array<'passenger' | 'driver' | 'admin'>;
}

export const PRODUCT_SCREENS: ProductScreenDefinition[] = [
  { id: 'home', section: 'core', title: 'Inicio', status: 'implemented' },
  { id: 'map', section: 'mobility', title: 'Mapa en tiempo real', status: 'implemented' },
  { id: 'routes', section: 'mobility', title: 'Rutas', status: 'implemented' },
  { id: 'route-detail', section: 'mobility', title: 'Detalle de ruta', status: 'implemented' },
  { id: 'settings', section: 'account', title: 'Configuracion', status: 'implemented' },
  { id: 'login', section: 'account', title: 'Iniciar sesion', status: 'implemented' },
  { id: 'register', section: 'account', title: 'Registro', status: 'implemented' },
  {
    id: 'driver-dashboard',
    section: 'driver',
    title: 'Panel conductor',
    status: 'implemented',
    requiresAuth: true,
    allowedRoles: ['driver'],
  },
  {
    id: 'admin-dashboard',
    section: 'admin',
    title: 'Panel administrador',
    status: 'implemented',
    requiresAuth: true,
    allowedRoles: ['admin'],
  },
  { id: 'favorites', section: 'mobility', title: 'Favoritos', status: 'implemented', requiresAuth: true },
  { id: 'profile', section: 'account', title: 'Perfil', status: 'implemented', requiresAuth: true },
];

export interface NavigationItem {
  key: AppScreen | 'login' | 'logout';
  label: string;
  icon: string;
  color: string;
  hint: string;
}

export const PRIMARY_NAV_ITEMS: NavigationItem[] = [
  {
    key: 'map',
    label: 'Mapa en Tiempo Real',
    icon: '🗺️',
    color: '#2196F3',
    hint: 'Seguimiento GPS',
  },
  {
    key: 'routes',
    label: 'Rutas de Buses',
    icon: '🚌',
    color: '#FF9800',
    hint: 'Todas las lineas',
  },
  {
    key: 'home',
    label: 'Inicio',
    icon: '🏠',
    color: '#4CAF50',
    hint: 'Informacion',
  },
  {
    key: 'driver',
    label: 'Panel Conductor',
    icon: '👨‍💼',
    color: '#9C27B0',
    hint: 'Herramientas del bus',
  },
  {
    key: 'admin',
    label: 'Panel Admin',
    icon: '🛠️',
    color: '#455A64',
    hint: 'Gestion de rutas',
  },
  {
    key: 'login',
    label: 'Iniciar Sesion',
    icon: '🔑',
    color: '#673AB7',
    hint: 'Acceso de cuenta',
  },
  {
    key: 'favorites',
    label: 'Favoritos',
    icon: '⭐',
    color: '#FFC107',
    hint: 'Rutas guardadas',
  },
  {
    key: 'profile',
    label: 'Mi Perfil',
    icon: '👤',
    color: '#00897B',
    hint: 'Cuenta y preferencias',
  },
  {
    key: 'logout',
    label: 'Cerrar Sesion',
    icon: '🚪',
    color: '#F44336',
    hint: 'Salir de la cuenta',
  },
];
