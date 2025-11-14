// 🎨 Paleta de Colores BusNow - Sistema centralizado con soporte para tema oscuro
export const LightTheme = {
  // Colores principales
  primary: '#003D2D',      // Verde oscuro - Color principal de la marca
  white: '#FFFFFF',        // Blanco puro - Fondos y textos sobre colores oscuros
  secondary: '#163C78',    // Azul fuerte - Acciones secundarias y navegación
  secondaryLight: '#B76D68', // Rosa suave - Elementos de apoyo y estados
  accent: '#E09F3E',       // Naranja - Llamadas a la acción e información importante
  
  // Grises para elementos neutros
  gray100: '#F5F5F5',
  gray200: '#E5E5E5',
  gray300: '#D4D4D4',
  gray400: '#A3A3A3',
  gray500: '#737373',
  gray600: '#525252',
  gray700: '#404040',
  gray800: '#262626',
  gray900: '#171717',

  // Estados de buses
  busActive: '#003D2D',    // Bus en ruta normal
  busInactive: '#6B7280',  // Bus fuera de servicio
  busMaintenance: '#E09F3E', // Bus en mantenimiento
  busDelayed: '#B76D68',   // Bus con retrasos

  // Niveles de capacidad
  capacityLow: '#003D2D',     // Muchos asientos libres
  capacityMedium: '#E09F3E',  // Capacidad media
  capacityHigh: '#B76D68',    // Pocos asientos
  capacityFull: '#163C78',    // Sin espacio disponible

  // Colores de rutas
  route1: '#003D2D',       // Verde principal
  route2: '#163C78',       // Azul fuerte
  route3: '#E09F3E',       // Naranja
  route4: '#B76D68',       // Rosa
  route5: '#004D40',       // Verde más oscuro
  route6: '#1E3A8A',       // Azul más oscuro
};

export const DarkTheme = {
  // Colores principales adaptados para modo oscuro
  primary: '#00654A',      // Verde más brillante para mejor contraste
  white: '#1F1F1F',        // Fondo oscuro principal
  secondary: '#2E5BBA',    // Azul más brillante
  secondaryLight: '#D47B76', // Rosa más suave para modo oscuro
  accent: '#F4B942',       // Naranja más brillante
  
  // Grises invertidos para modo oscuro
  gray100: '#2A2A2A',      // Fondo más oscuro
  gray200: '#3A3A3A',      // Elementos de fondo
  gray300: '#4A4A4A',      // Bordes y separadores
  gray400: '#6A6A6A',      // Texto secundario
  gray500: '#8A8A8A',      // Texto terciario
  gray600: '#ABABAB',      // Texto principal
  gray700: '#CBCBCB',      // Texto destacado
  gray800: '#E1E1E1',      // Texto muy destacado
  gray900: '#F1F1F1',      // Texto máximo contraste

  // Estados de buses para modo oscuro
  busActive: '#00654A',    // Verde brillante
  busInactive: '#8B9197',  // Gris más claro
  busMaintenance: '#F4B942', // Naranja brillante
  busDelayed: '#D47B76',   // Rosa ajustado

  // Niveles de capacidad para modo oscuro
  capacityLow: '#00654A',     
  capacityMedium: '#F4B942',  
  capacityHigh: '#D47B76',    
  capacityFull: '#2E5BBA',    

  // Colores de rutas para modo oscuro
  route1: '#00654A',       
  route2: '#2E5BBA',       
  route3: '#F4B942',       
  route4: '#D47B76',       
  route5: '#006B52',       
  route6: '#3B82F6',       
};

// Función para obtener el tema actual
export const getTheme = (isDark: boolean) => isDark ? DarkTheme : LightTheme;

// Export por defecto (tema claro para compatibilidad)
export const BusNowColors = LightTheme;

// Funciones utilitarias para obtener colores dinámicos
export const getBusStatusColor = (status: 'active' | 'inactive' | 'maintenance' | 'delayed'): string => {
  switch (status) {
    case 'active': return BusNowColors.busActive;
    case 'inactive': return BusNowColors.busInactive;
    case 'maintenance': return BusNowColors.busMaintenance;
    case 'delayed': return BusNowColors.busDelayed;
    default: return BusNowColors.busActive;
  }
};

export const getRouteColor = (routeNumber: number): string => {
  const colors = [
    BusNowColors.route1,
    BusNowColors.route2,
    BusNowColors.route3,
    BusNowColors.route4,
    BusNowColors.route5,
    BusNowColors.route6,
  ];
  return colors[(routeNumber - 1) % colors.length];
};

export const getCapacityColor = (level: 'low' | 'medium' | 'high' | 'full'): string => {
  switch (level) {
    case 'low': return BusNowColors.capacityLow;
    case 'medium': return BusNowColors.capacityMedium;
    case 'high': return BusNowColors.capacityHigh;
    case 'full': return BusNowColors.capacityFull;
    default: return BusNowColors.capacityLow;
  }
};

// Estilos comunes minimalistas
export const CommonStyles = {
  // Sombras elegantes y sutiles
  cardShadow: {
    shadowColor: BusNowColors.gray800,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  
  softShadow: {
    shadowColor: BusNowColors.gray600,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // Bordes minimalistas
  border: {
    borderWidth: 1,
    borderColor: BusNowColors.gray200,
  },
  
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    extraLarge: 24,
  },

  // Espaciado consistente y armonioso
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 40,
  },

  // Tipografía mejorada y legible
  typography: {
    h1: { 
      fontSize: 28, 
      fontWeight: '700' as const, 
      color: BusNowColors.gray800,
      lineHeight: 34 
    },
    h2: { 
      fontSize: 24, 
      fontWeight: '600' as const, 
      color: BusNowColors.gray800,
      lineHeight: 30 
    },
    h3: { 
      fontSize: 20, 
      fontWeight: '600' as const, 
      color: BusNowColors.gray700,
      lineHeight: 26 
    },
    body: { 
      fontSize: 16, 
      fontWeight: '400' as const, 
      color: BusNowColors.gray700,
      lineHeight: 22 
    },
    bodyMedium: { 
      fontSize: 16, 
      fontWeight: '500' as const, 
      color: BusNowColors.gray700,
      lineHeight: 22 
    },
    caption: { 
      fontSize: 14, 
      fontWeight: '400' as const, 
      color: BusNowColors.gray500,
      lineHeight: 20 
    },
    small: { 
      fontSize: 12, 
      fontWeight: '400' as const, 
      color: BusNowColors.gray500,
      lineHeight: 16 
    },
  },

  // Componentes reutilizables
  container: {
    flex: 1,
    backgroundColor: BusNowColors.gray100,
    paddingHorizontal: 16,
  },

  card: {
    backgroundColor: BusNowColors.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },

  button: {
    primary: {
      backgroundColor: BusNowColors.primary,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
    },
    secondary: {
      backgroundColor: BusNowColors.white,
      borderRadius: 12,
      paddingVertical: 14,
      paddingHorizontal: 24,
      alignItems: 'center' as const,
      justifyContent: 'center' as const,
      borderWidth: 1,
      borderColor: BusNowColors.gray300,
    },
  },

  // Colores de fondo suaves
  background: {
    primary: BusNowColors.gray100,
    card: BusNowColors.white,
    accent: '#F8FAFC',
  },
};

export default BusNowColors;