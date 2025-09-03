import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TrackingState, Bus, BusRoute, BusStop, UserLocation, Coordinates } from '../types';

const initialState: TrackingState = {
  buses: [],
  routes: [
    {
      id: 'route1',
      name: 'Línea 1 - Centro',
      description: 'Centro - Universidad - Hospital',
      color: '#2196F3',
      coordinates: [
        { latitude: 18.4861, longitude: -97.3973 },
        { latitude: 18.4871, longitude: -97.3983 },
        { latitude: 18.4881, longitude: -97.3993 },
        { latitude: 18.4891, longitude: -97.4003 },
      ],
      stops: [
        {
          id: 'stop1',
          name: 'Plaza Mayor',
          coordinates: { latitude: 18.4861, longitude: -97.3973 },
          routeIds: ['route1'],
        },
        {
          id: 'stop2',
          name: 'Universidad',
          coordinates: { latitude: 18.4881, longitude: -97.3993 },
          routeIds: ['route1'],
        },
      ],
      operatingHours: { start: '05:00', end: '23:00' },
      frequency: 15,
    },
    {
      id: 'route2',
      name: 'Línea 2 - Norte',
      description: 'Terminal Norte - Centro Comercial',
      color: '#4CAF50',
      coordinates: [
        { latitude: 18.4900, longitude: -97.3900 },
        { latitude: 18.4910, longitude: -97.3910 },
        { latitude: 18.4920, longitude: -97.3920 },
      ],
      stops: [
        {
          id: 'stop3',
          name: 'Terminal Norte',
          coordinates: { latitude: 18.4900, longitude: -97.3900 },
          routeIds: ['route2'],
        },
        {
          id: 'stop4',
          name: 'Centro Comercial',
          coordinates: { latitude: 18.4920, longitude: -97.3920 },
          routeIds: ['route2'],
        },
      ],
      operatingHours: { start: '06:00', end: '22:00' },
      frequency: 20,
    },
  ],
  stops: [],
  userLocation: null,
  selectedRoute: null,
  selectedBus: null,
  isTracking: false,
};

const trackingSlice = createSlice({
  name: 'tracking',
  initialState,
  reducers: {
    updateBusLocation: (state, action: PayloadAction<{ busId: string; location: Coordinates; speed: number; heading: number }>) => {
      const { busId, location, speed, heading } = action.payload;
      const busIndex = state.buses.findIndex(bus => bus.id === busId);
      
      if (busIndex !== -1) {
        state.buses[busIndex].currentLocation = location;
        state.buses[busIndex].speed = speed;
        state.buses[busIndex].heading = heading;
        state.buses[busIndex].lastUpdate = new Date();
      }
    },
    
    addBus: (state, action: PayloadAction<Bus>) => {
      state.buses.push(action.payload);
    },
    
    removeBus: (state, action: PayloadAction<string>) => {
      state.buses = state.buses.filter(bus => bus.id !== action.payload);
    },
    
    updateBusStatus: (state, action: PayloadAction<{ busId: string; status: Bus['status'] }>) => {
      const bus = state.buses.find(bus => bus.id === action.payload.busId);
      if (bus) {
        bus.status = action.payload.status;
      }
    },
    
    setUserLocation: (state, action: PayloadAction<UserLocation>) => {
      state.userLocation = action.payload;
    },
    
    selectRoute: (state, action: PayloadAction<string | null>) => {
      state.selectedRoute = action.payload;
    },
    
    selectBus: (state, action: PayloadAction<string | null>) => {
      state.selectedBus = action.payload;
    },
    
    setTracking: (state, action: PayloadAction<boolean>) => {
      state.isTracking = action.payload;
    },
    
    loadInitialBuses: (state) => {
      // Datos simulados de buses
      state.buses = [
        {
          id: 'bus1',
          routeId: 'route1',
          driverName: 'Juan Pérez',
          plateNumber: 'ABC-123',
          currentLocation: { latitude: 18.4865, longitude: -97.3978 },
          status: 'active',
          capacity: { total: 40, occupied: 25 },
          speed: 35,
          heading: 45,
          lastUpdate: new Date(),
        },
        {
          id: 'bus2',
          routeId: 'route1',
          driverName: 'María García',
          plateNumber: 'DEF-456',
          currentLocation: { latitude: 18.4885, longitude: -97.3998 },
          status: 'active',
          capacity: { total: 40, occupied: 15 },
          speed: 25,
          heading: 45,
          lastUpdate: new Date(),
        },
        {
          id: 'bus3',
          routeId: 'route2',
          driverName: 'Carlos López',
          plateNumber: 'GHI-789',
          currentLocation: { latitude: 18.4905, longitude: -97.3905 },
          status: 'active',
          capacity: { total: 35, occupied: 30 },
          speed: 40,
          heading: 90,
          lastUpdate: new Date(),
        },
      ];
    },
  },
});

export const {
  updateBusLocation,
  addBus,
  removeBus,
  updateBusStatus,
  setUserLocation,
  selectRoute,
  selectBus,
  setTracking,
  loadInitialBuses,
} = trackingSlice.actions;

export default trackingSlice.reducer;
