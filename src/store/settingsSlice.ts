import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Settings } from '../types';

const initialState: Settings = {
  notifications: {
    enabled: true,
    arrivalAlerts: true,
    serviceAlerts: true,
    soundEnabled: true,
  },
  map: {
    followUserLocation: true,
    showTraffic: false,
    mapType: 'standard',
  },
  tracking: {
    updateInterval: 10, // segundos
    accuracyThreshold: 50, // metros
  },
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    updateNotificationSettings: (state, action: PayloadAction<Partial<Settings['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload };
    },
    
    updateMapSettings: (state, action: PayloadAction<Partial<Settings['map']>>) => {
      state.map = { ...state.map, ...action.payload };
    },
    
    updateTrackingSettings: (state, action: PayloadAction<Partial<Settings['tracking']>>) => {
      state.tracking = { ...state.tracking, ...action.payload };
    },
    
    resetSettings: () => initialState,
  },
});

export const {
  updateNotificationSettings,
  updateMapSettings,
  updateTrackingSettings,
  resetSettings,
} = settingsSlice.actions;

export default settingsSlice.reducer;
