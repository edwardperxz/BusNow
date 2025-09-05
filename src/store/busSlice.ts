// =============================================================================
// BUS SLICE - Redux Toolkit
// =============================================================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Bus, ETA, Coordinates } from '../types';

interface BusState {
  buses: { [routeId: string]: Bus[] };
  selectedBus: Bus | null;
  trackingBus: Bus | null;
  currentETA: ETA | null;
  activeBuses: Bus[];
  isLoading: boolean;
  error: string | null;
  isTracking: boolean;
  trackingSubscription: string | null;
}

const initialState: BusState = {
  buses: {},
  selectedBus: null,
  trackingBus: null,
  currentETA: null,
  activeBuses: [],
  isLoading: false,
  error: null,
  isTracking: false,
  trackingSubscription: null,
};

// Async thunks
export const fetchBusesByRoute = createAsyncThunk(
  'buses/fetchBusesByRoute',
  async (routeId: string) => {
    // Simulación - se reemplazará por use case real
    await new Promise(resolve => setTimeout(resolve, 300));
    return { routeId, buses: [] as Bus[] };
  }
);

export const startBusTracking = createAsyncThunk(
  'buses/startBusTracking',
  async ({ busId, targetLocation }: { busId: string; targetLocation: Coordinates }) => {
    // Simulación - se reemplazará por use case real
    await new Promise(resolve => setTimeout(resolve, 500));
    return { busId, targetLocation };
  }
);

export const stopBusTracking = createAsyncThunk(
  'buses/stopBusTracking',
  async () => {
    // Simulación - se reemplazará por use case real
    await new Promise(resolve => setTimeout(resolve, 200));
    return null;
  }
);

export const calculateBusETA = createAsyncThunk(
  'buses/calculateETA',
  async ({ busId, targetLocation }: { busId: string; targetLocation: Coordinates }) => {
    // Simulación - se reemplazará por use case real
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const mockETA: ETA = {
      busId,
      targetCoordinates: targetLocation,
      estimatedMinutes: Math.floor(Math.random() * 20) + 5, // 5-25 minutos
      distance: Math.floor(Math.random() * 5000) + 500, // 0.5-5.5 km
      confidence: 'medium',
      lastCalculated: new Date(),
    };
    
    return mockETA;
  }
);

// Para conductores
export const startDriverTrip = createAsyncThunk(
  'buses/startDriverTrip',
  async ({ driverId, routeId, initialLocation }: {
    driverId: string;
    routeId: string;
    initialLocation: Coordinates;
  }) => {
    // Simulación - se reemplazará por use case real
    await new Promise(resolve => setTimeout(resolve, 500));
    return { busId: `bus_${driverId}_${Date.now()}`, routeId };
  }
);

export const updateDriverLocation = createAsyncThunk(
  'buses/updateDriverLocation',
  async ({ busId, location, speed, heading }: {
    busId: string;
    location: Coordinates;
    speed: number;
    heading: number;
  }) => {
    // Simulación - se reemplazará por use case real
    return { busId, location, speed, heading, timestamp: new Date() };
  }
);

const busSlice = createSlice({
  name: 'buses',
  initialState,
  reducers: {
    setSelectedBus: (state, action: PayloadAction<Bus | null>) => {
      state.selectedBus = action.payload;
    },
    
    updateBusLocation: (state, action: PayloadAction<{
      busId: string;
      location: Coordinates;
      speed: number;
      heading: number;
    }>) => {
      const { busId, location, speed, heading } = action.payload;
      
      // Actualizar en todas las rutas donde esté el bus
      Object.keys(state.buses).forEach(routeId => {
        const busIndex = state.buses[routeId].findIndex(bus => bus.id === busId);
        if (busIndex >= 0) {
          state.buses[routeId][busIndex] = {
            ...state.buses[routeId][busIndex],
            currentLocation: location,
            speed,
            heading,
            lastUpdate: new Date(),
          };
        }
      });
      
      // Actualizar buses seleccionados y en tracking
      if (state.selectedBus?.id === busId) {
        state.selectedBus = {
          ...state.selectedBus,
          currentLocation: location,
          speed,
          heading,
          lastUpdate: new Date(),
        };
      }
      
      if (state.trackingBus?.id === busId) {
        state.trackingBus = {
          ...state.trackingBus,
          currentLocation: location,
          speed,
          heading,
          lastUpdate: new Date(),
        };
      }
    },
    
    setBuses: (state, action: PayloadAction<{ routeId: string; buses: Bus[] }>) => {
      const { routeId, buses } = action.payload;
      state.buses[routeId] = buses;
      
      // Actualizar lista de buses activos
      const allBuses: Bus[] = [];
      Object.values(state.buses).forEach(routeBuses => {
        allBuses.push(...routeBuses.filter(bus => bus.isActive));
      });
      state.activeBuses = allBuses;
    },
    
    setTrackingBus: (state, action: PayloadAction<Bus | null>) => {
      state.trackingBus = action.payload;
      state.isTracking = action.payload !== null;
    },
    
    setETA: (state, action: PayloadAction<ETA | null>) => {
      state.currentETA = action.payload;
    },
    
    clearBusError: (state) => {
      state.error = null;
    },
    
    resetBusState: (state) => {
      state.selectedBus = null;
      state.trackingBus = null;
      state.currentETA = null;
      state.isTracking = false;
      state.trackingSubscription = null;
      state.error = null;
    },
  },
  
  extraReducers: (builder) => {
    // Fetch buses by route
    builder
      .addCase(fetchBusesByRoute.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBusesByRoute.fulfilled, (state, action) => {
        state.isLoading = false;
        const { routeId, buses } = action.payload;
        state.buses[routeId] = buses;
        state.error = null;
      })
      .addCase(fetchBusesByRoute.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al cargar los buses';
      });

    // Start bus tracking
    builder
      .addCase(startBusTracking.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startBusTracking.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isTracking = true;
        state.trackingSubscription = action.payload.busId;
        state.error = null;
      })
      .addCase(startBusTracking.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al iniciar el tracking';
      });

    // Stop bus tracking
    builder
      .addCase(stopBusTracking.fulfilled, (state) => {
        state.isTracking = false;
        state.trackingBus = null;
        state.trackingSubscription = null;
        state.currentETA = null;
      });

    // Calculate ETA
    builder
      .addCase(calculateBusETA.fulfilled, (state, action) => {
        state.currentETA = action.payload;
      });

    // Driver trip management
    builder
      .addCase(startDriverTrip.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startDriverTrip.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // El bus se agregará cuando lleguen las actualizaciones de ubicación
      })
      .addCase(startDriverTrip.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al iniciar el viaje';
      });

    // Update driver location
    builder
      .addCase(updateDriverLocation.fulfilled, (state, action) => {
        const { busId, location, speed, heading } = action.payload;
        // Se maneja a través del reducer updateBusLocation
      });
  },
});

export const {
  setSelectedBus,
  updateBusLocation,
  setBuses,
  setTrackingBus,
  setETA,
  clearBusError,
  resetBusState,
} = busSlice.actions;

export default busSlice.reducer;

// Selectors
export const selectBusState = (state: { buses: BusState }) => state.buses;
export const selectBusesByRoute = (routeId: string) => (state: { buses: BusState }) => 
  state.buses.buses[routeId] || [];
export const selectSelectedBus = (state: { buses: BusState }) => state.buses.selectedBus;
export const selectTrackingBus = (state: { buses: BusState }) => state.buses.trackingBus;
export const selectCurrentETA = (state: { buses: BusState }) => state.buses.currentETA;
export const selectActiveBuses = (state: { buses: BusState }) => state.buses.activeBuses;
export const selectIsTracking = (state: { buses: BusState }) => state.buses.isTracking;
export const selectBusLoading = (state: { buses: BusState }) => state.buses.isLoading;
export const selectBusError = (state: { buses: BusState }) => state.buses.error;
