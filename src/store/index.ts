import { configureStore } from '@reduxjs/toolkit';
import { useDispatch, useSelector, TypedUseSelectorHook } from 'react-redux';

// Import slices - using explicit .ts extension
const authSlice = require('./authSlice').default;
const routeSlice = require('./routeSlice').default;
const busSlice = require('./busSlice').default;
const trackingSlice = require('./trackingSlice').default;
const notificationSlice = require('./notificationSlice').default;
const settingsSlice = require('./settingsSlice').default;

export const store = configureStore({
  reducer: {
    auth: authSlice,
    routes: routeSlice,
    buses: busSlice,
    tracking: trackingSlice,
    notifications: notificationSlice,
    settings: settingsSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          'buses/updateBusLocation',
          'tracking/setUserLocation',
          'auth/signInSuccess',
          'buses/setBuses',
          // Add auth actions to ignore list
          'auth/signInAnonymously/fulfilled',
          'auth/signInWithEmail/fulfilled',
          'auth/signInAsDriver/fulfilled'
        ],
        ignoredPaths: [
          'auth.user.createdAt',
          'buses.buses',
          'tracking.userLocation.timestamp',
          'tracking.trackingSession.startTime',
          'tracking.trackingSession.endTime'
        ],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
