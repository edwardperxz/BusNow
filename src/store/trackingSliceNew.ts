import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { BusRoute, Bus, TrackingSession } from '../types';

interface TrackingState {
  routes: BusRoute[];
  buses: Bus[];
  selectedRoute: string | null; // Cambiado a string (ID)
  selectedBus: string | null;   // Cambiado a string (ID)
  tracking: {
    isTracking: boolean;
    session?: TrackingSession;
  };
}

const initialState: TrackingState = {
  routes: [], // Usamos datos mock desde los repositorios
  buses: [],  // Usamos datos mock desde los repositorios
  selectedRoute: null,
  selectedBus: null,
  tracking: {
    isTracking: false,
  },
};

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    setRoutes: (state, action: PayloadAction<BusRoute[]>) => {
      state.routes = action.payload;
    },
    
    setBuses: (state, action: PayloadAction<Bus[]>) => {
      state.buses = action.payload;
    },
    
    updateBusLocation: (state, action: PayloadAction<{ busId: string; location: { latitude: number; longitude: number } }>) => {
      const bus = state.buses.find(b => b.id === action.payload.busId);
      if (bus) {
        bus.currentLocation = action.payload.location;
        bus.lastUpdate = new Date();
      }
    },
    
    selectRoute: (state, action: PayloadAction<string | null>) => {
      state.selectedRoute = action.payload;
    },
    
    selectBus: (state, action: PayloadAction<string | null>) => {
      state.selectedBus = action.payload;
    },
    
    startTracking: (state, action: PayloadAction<TrackingSession>) => {
      state.tracking = {
        isTracking: true,
        session: action.payload,
      };
    },
    
    stopTracking: (state) => {
      state.tracking = {
        isTracking: false,
      };
    },
    
    updateBusStatus: (state, action: PayloadAction<{ busId: string; status: Bus['status'] }>) => {
      const bus = state.buses.find(b => b.id === action.payload.busId);
      if (bus) {
        bus.status = action.payload.status;
        bus.lastUpdate = new Date();
      }
    },
  },
});

export const {
  setRoutes,
  setBuses,
  updateBusLocation,
  selectRoute,
  selectBus,
  startTracking,
  stopTracking,
  updateBusStatus,
} = trackingSlice.actions;

export default trackingSlice.reducer;
