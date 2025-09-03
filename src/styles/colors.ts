// 🎨 BusNow Color System - Nueva Paleta de Colores 2024
// Paleta de colores centralizada para BusNow App

export const BusNowColors = {
  // 🚌 Colores principales de la marca BusNow
  primary: '#003D2D',        // Verde oscuro principal
  white: '#FFFFFF',          // Blanco
  secondaryStrong: '#163C78', // Azul fuerte secundario
  secondaryWeak: '#B76D68',   // Rosa débil secundario
  highlight: '#E09F3E',       // Naranja destacable

  // 🎨 Variaciones de fondo
  background: {
    primary: '#FFFFFF',       // Fondo principal
    secondary: '#F8F9FA',     // Fondo secundario claro
    dark: '#003D2D',          // Fondo oscuro
  },

  // 📝 Colores de texto
  text: {
    primary: '#003D2D',       // Texto principal (verde oscuro)
    secondary: '#163C78',     // Texto secundario (azul)
    light: '#B76D68',         // Texto claro (rosa)
    white: '#FFFFFF',         // Texto blanco
    muted: '#6B7280',         // Texto gris apagado
  },

  // 🚦 Estados de buses usando la paleta
  busStatus: {
    active: '#003D2D',        // Verde - bus activo
    inactive: '#6B7280',      // Gris - bus inactivo
    maintenance: '#E09F3E',   // Naranja - mantenimiento
    delayed: '#B76D68',       // Rosa - retrasado
  },

  // 👥 Niveles de capacidad
  capacity: {
    low: '#003D2D',           // Verde - disponible
    medium: '#E09F3E',        // Naranja - medio lleno
    high: '#B76D68',          // Rosa - muy lleno
    full: '#163C78',          // Azul - completo
  },

  // 🌈 Colores de rutas diferenciadas
  routes: {
    line1: '#003D2D',         // Línea 1 - Verde principal
    line2: '#163C78',         // Línea 2 - Azul fuerte
    line3: '#E09F3E',         // Línea 3 - Naranja
    line4: '#B76D68',         // Línea 4 - Rosa
    line5: '#004D40',         // Línea 5 - Verde más oscuro
    line6: '#1E3A8A',         // Línea 6 - Azul más oscuro
  },

  // 🔘 UI Elements
  border: {
    light: '#E5E7EB',         // Bordes claros
    medium: '#D1D5DB',        // Bordes medios
    dark: '#6B7280',          // Bordes oscuros
  },

  // 🌙 Sombras
  shadow: {
    light: 'rgba(0, 61, 45, 0.1)',    // Sombra clara con primary
    medium: 'rgba(0, 61, 45, 0.2)',   // Sombra media
    dark: 'rgba(0, 61, 45, 0.3)',     // Sombra oscura
  },
} as const;

// 🎯 Funciones utilitarias para colores dinámicos
export const getBusStatusColor = (status: 'active' | 'inactive' | 'maintenance' | 'delayed'): string => {
  return BusNowColors.busStatus[status];
};

export const getRouteColor = (lineNumber: number): string => {
  const routeKeys = Object.keys(BusNowColors.routes) as Array<keyof typeof BusNowColors.routes>;
  const routeIndex = (lineNumber - 1) % routeKeys.length;
  const routeKey = routeKeys[routeIndex];
  return BusNowColors.routes[routeKey];
};

export const getCapacityColor = (level: 'low' | 'medium' | 'high' | 'full'): string => {
  return BusNowColors.capacity[level];
};

// 📱 Estilos predefinidos para uso directo
export const BusNowStyles = {
  colors: BusNowColors,
  
  // Contenedores comunes
  containers: {
    primary: {
      backgroundColor: BusNowColors.primary,
      color: BusNowColors.white,
    },
    secondary: {
      backgroundColor: BusNowColors.secondaryStrong,
      color: BusNowColors.white,
    },
    highlight: {
      backgroundColor: BusNowColors.highlight,
      color: BusNowColors.white,
    },
    card: {
      backgroundColor: BusNowColors.white,
      borderColor: BusNowColors.border.light,
      borderWidth: 1,
    },
  },

  // Textos comunes
  text: {
    heading: {
      color: BusNowColors.text.primary,
      fontWeight: 'bold' as const,
    },
    body: {
      color: BusNowColors.text.secondary,
    },
    muted: {
      color: BusNowColors.text.muted,
    },
  },
} as const;

export default BusNowColors;
