// =============================================================================
// STORE SEED DATA - Initialize with mock data for development
// =============================================================================

import { AppDispatch } from './index';
import { setRoutes, setBuses } from './trackingSlice';
import { MOCK_ROUTES, MOCK_BUSES } from '../data/mocks/mockData';

export const seedStoreWithMockData = (dispatch: AppDispatch) => {
  // Initialize routes
  dispatch(setRoutes(MOCK_ROUTES));
  
  // Initialize buses
  dispatch(setBuses(MOCK_BUSES));
};
