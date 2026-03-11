import { getTheme } from '../../../styles/colors';
import { RouteItem } from '../types';

export const getRouteStatusColor = (status: RouteItem['status'], colors: ReturnType<typeof getTheme>) => {
  switch (status) {
    case 'active':
      return colors.primary;
    case 'limited':
      return colors.accent;
    case 'maintenance':
      return colors.secondaryLight;
    default:
      return colors.gray400;
  }
};

export const getRouteStatusText = (status: RouteItem['status']) => {
  switch (status) {
    case 'active':
      return 'Activa';
    case 'limited':
      return 'Servicio limitado';
    case 'maintenance':
      return 'Mantenimiento';
    default:
      return 'Desconocido';
  }
};
