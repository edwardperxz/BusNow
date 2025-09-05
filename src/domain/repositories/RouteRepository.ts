// =============================================================================
// ROUTE REPOSITORY INTERFACE - Domain Layer
// =============================================================================

import { BusRoute, RouteFilters } from '../../types';

export interface RouteRepository {
  // Obtener rutas
  getAllRoutes(): Promise<BusRoute[]>;
  getRouteById(id: string): Promise<BusRoute | null>;
  searchRoutes(filters: RouteFilters): Promise<BusRoute[]>;
  
  // Categorías
  getUrbanRoutes(): Promise<BusRoute[]>;
  getIntercityRoutes(): Promise<BusRoute[]>;
  
  // Operadores
  getRoutesByOperator(operatorId: string): Promise<BusRoute[]>;
  
  // Cache para offline
  cacheRoutes(routes: BusRoute[]): Promise<void>;
  getCachedRoutes(): Promise<BusRoute[]>;
}
