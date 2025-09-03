import { configureStore } from '@reduxjs/toolkit';
import trackingReducer from './trackingSlice';
import notificationReducer from './notificationSlice';
import settingsReducer from './settingsSlice';

export const store = configureStore({
  reducer: {
    tracking: trackingReducer,
    notifications: notificationReducer,
    settings: settingsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['tracking/updateBusLocation', 'tracking/setUserLocation'],
        ignoredPaths: ['tracking.userLocation.timestamp', 'tracking.buses.lastUpdate'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
