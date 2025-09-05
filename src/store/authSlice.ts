// =============================================================================
// AUTH SLICE - Redux Toolkit
// =============================================================================

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, Driver } from '../types';

interface AuthState {
  user: User | Driver | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isAnonymous: false,
  isLoading: false,
  error: null,
};

// Async thunks
export const signInAnonymously = createAsyncThunk(
  'auth/signInAnonymously',
  async (params: { deviceId: string; platform: string; location?: { lat: number; lng: number } }) => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const anonymousUser: User = {
      id: `anon_${params.deviceId}_${Date.now()}`,
      name: `Usuario Anónimo`,
      email: '',
      type: 'passenger',
      isAnonymous: true,
      deviceId: params.deviceId,
      createdAt: new Date(),
    };

    return anonymousUser;
  }
);

export const signInWithEmail = createAsyncThunk(
  'auth/signInWithEmail',
  async (params: { email: string; password: string }) => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simular validación
    if (params.email === 'test@example.com' && params.password === '123456') {
      const user: User = {
        id: 'user_123',
        name: 'Usuario Test',
        email: params.email,
        type: 'passenger',
        isAnonymous: false,
        deviceId: 'web_device',
        createdAt: new Date(),
      };
      return user;
    } else {
      throw new Error('Credenciales incorrectas');
    }
  }
);

export const signInAsDriver = createAsyncThunk(
  'auth/signInAsDriver',
  async (params: { email: string; password: string }) => {
    // Simular delay de red
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simular validación de conductor
    const driverCredentials = [
      { email: 'driver001@busnow.com', password: '1234', name: 'Juan Pérez', vehicleId: 'BUS-001' },
      { email: 'driver002@busnow.com', password: '5678', name: 'María González', vehicleId: 'BUS-002' },
      { email: 'driver003@busnow.com', password: '9999', name: 'Carlos López', vehicleId: 'BUS-003' }
    ];

    const driverData = driverCredentials.find(d => 
      d.email === params.email && d.password === params.password
    );

    if (driverData) {
      const driver: Driver = {
        id: `driver_${driverData.email.split('@')[0]}`,
        name: driverData.name,
        email: params.email,
        type: 'driver',
        isAnonymous: false,
        deviceId: 'driver_device',
        createdAt: new Date(),
        licenseNumber: `LIC${Math.random().toString().substr(2, 8)}`,
        isOnline: false,
        vehicleId: driverData.vehicleId,
      };
      return driver;
    } else {
      throw new Error('Credenciales de conductor incorrectas');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    signOut: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.isAnonymous = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Sign in anonymously
    builder
      .addCase(signInAnonymously.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInAnonymously.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAnonymous = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signInAnonymously.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al iniciar sesión anónima';
      });

    // Sign in with email
    builder
      .addCase(signInWithEmail.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInWithEmail.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAnonymous = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signInWithEmail.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al iniciar sesión';
      });

    // Sign in as driver
    builder
      .addCase(signInAsDriver.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(signInAsDriver.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
        state.isAnonymous = false;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(signInAsDriver.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Error al iniciar sesión como conductor';
      });
  },
});

export const { signOut, clearError } = authSlice.actions;
export default authSlice.reducer;
