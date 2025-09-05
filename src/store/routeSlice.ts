// =============================================================================
// ROUTE SLICE - Redux Toolkit
// =============================================================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { BusRoute, RouteFilters } from '../types';

interface RouteState {
  routes: BusRoute[];
  selectedRoute: BusRoute | null;
  filteredRoutes: BusRoute[];
  favoriteRoutes: string[];
  recentRoutes: string[];
  filters: RouteFilters;
  isLoading: boolean;
  error: string | null;
  searchQuery: string;
}

const initialState: RouteState = {
  routes: [],
  selectedRoute: null,
  filteredRoutes: [],
  favoriteRoutes: [],
  recentRoutes: [],
  filters: {},
  isLoading: false,
  error: null,
  searchQuery: '',
};

// Async thunks
export const fetchRoutes = createAsyncThunk(
  'routes/fetchRoutes',
  async () => {
    // Simulación - se reemplazará por use case real
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Import datos mock
    const { MOCK_ROUTES } = require('../data/mocks/mockData');
    return MOCK_ROUTES as BusRoute[];
  }
);

export const fetchRouteById = createAsyncThunk(
  'routes/fetchRouteById',
  async (routeId: string) => {
    // Simulación - se reemplazará por use case real
    await new Promise(resolve => setTimeout(resolve, 300));
    return null; // Se reemplazará con datos reales
  }
);

export const searchRoutes = createAsyncThunk(
  'routes/searchRoutes',
  async (filters: RouteFilters) => {
    // Simulación - se reemplazará por use case real
    await new Promise(resolve => setTimeout(resolve, 400));
    return []; // Se reemplazará con resultados de búsqueda
  }
);

const routeSlice = createSlice({
  name: 'routes',
  initialState,
  reducers: {
    setSelectedRoute: (state, action: PayloadAction<BusRoute | null>) => {
      state.selectedRoute = action.payload;
      
      // Agregar a rutas recientes si no es null
      if (action.payload && !state.recentRoutes.includes(action.payload.id)) {
        state.recentRoutes.unshift(action.payload.id);
        // Mantener solo las últimas 10 rutas recientes
        if (state.recentRoutes.length > 10) {
          state.recentRoutes = state.recentRoutes.slice(0, 10);
        }
      }
    },
    
    setFilters: (state, action: PayloadAction<RouteFilters>) => {
      state.filters = action.payload;
      state.filteredRoutes = applyFilters(state.routes, action.payload);
    },
    
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      const filters = { ...state.filters, search: action.payload };
      state.filteredRoutes = applyFilters(state.routes, filters);
    },
    
    addFavoriteRoute: (state, action: PayloadAction<string>) => {
      if (!state.favoriteRoutes.includes(action.payload)) {
        state.favoriteRoutes.push(action.payload);
      }
    },
    
    removeFavoriteRoute: (state, action: PayloadAction<string>) => {
      state.favoriteRoutes = state.favoriteRoutes.filter(id => id !== action.payload);
    },
    
    clearFilters: (state) => {
      state.filters = {};
      state.searchQuery = '';
      state.filteredRoutes = state.routes;
    },
    
    clearError: (state) => {
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    // Fetch routes
    builder
      .addCase(fetchRoutes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoutes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.routes = action.payload;
        state.filteredRoutes = applyFilters(action.payload, state.filters);
        state.error = null;
      })
      .addCase(fetchRoutes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al cargar las rutas';
      });

    // Fetch route by ID
    builder
      .addCase(fetchRouteById.fulfilled, (state, action) => {
        if (action.payload) {
          state.selectedRoute = action.payload;
        }
      });

    // Search routes
    builder
      .addCase(searchRoutes.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(searchRoutes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.filteredRoutes = action.payload;
        state.error = null;
      })
      .addCase(searchRoutes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error en la búsqueda';
      });
  },
});

// Helper function para aplicar filtros
function applyFilters(routes: BusRoute[], filters: RouteFilters): BusRoute[] {
  let filtered = [...routes];

  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(route =>
      route.name.toLowerCase().includes(searchLower) ||
      route.shortName.toLowerCase().includes(searchLower) ||
      route.origin.toLowerCase().includes(searchLower) ||
      route.destination.toLowerCase().includes(searchLower)
    );
  }

  if (filters.category) {
    filtered = filtered.filter(route => route.category === filters.category);
  }

  if (filters.operator) {
    filtered = filtered.filter(route => route.operatorId === filters.operator);
  }

  if (filters.maxFare) {
    filtered = filtered.filter(route => route.fare <= filters.maxFare!);
  }

  return filtered;
}

export const {
  setSelectedRoute,
  setFilters,
  setSearchQuery,
  addFavoriteRoute,
  removeFavoriteRoute,
  clearFilters,
  clearError
} = routeSlice.actions;

export default routeSlice.reducer;

// Selectors
export const selectRoutes = (state: { routes: RouteState }) => state.routes;
export const selectAllRoutes = (state: { routes: RouteState }) => state.routes.routes;
export const selectFilteredRoutes = (state: { routes: RouteState }) => state.routes.filteredRoutes;
export const selectSelectedRoute = (state: { routes: RouteState }) => state.routes.selectedRoute;
export const selectFavoriteRoutes = (state: { routes: RouteState }) => state.routes.favoriteRoutes;
export const selectRecentRoutes = (state: { routes: RouteState }) => state.routes.recentRoutes;
export const selectRouteFilters = (state: { routes: RouteState }) => state.routes.filters;
export const selectRouteSearchQuery = (state: { routes: RouteState }) => state.routes.searchQuery;
export const selectRouteLoading = (state: { routes: RouteState }) => state.routes.isLoading;
export const selectRouteError = (state: { routes: RouteState }) => state.routes.error;
