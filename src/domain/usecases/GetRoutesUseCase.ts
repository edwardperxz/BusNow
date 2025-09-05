// =============================================================================
// GET ROUTES USE CASE - Domain Layer
// =============================================================================

import { BusRoute, RouteFilters } from '../../types';
import { RouteRepository } from '../repositories/RouteRepository';

export class GetRoutesUseCase {
  constructor(private routeRepository: RouteRepository) {}

  async execute(filters?: RouteFilters): Promise<BusRoute[]> {
    try {
      if (filters) {
        return await this.routeRepository.searchRoutes(filters);
      }
      
      return await this.routeRepository.getAllRoutes();
    } catch (error) {
      console.error('Error getting routes:', error);
      
      // Fallback to cached routes
      try {
        return await this.routeRepository.getCachedRoutes();
      } catch (cacheError) {
        console.error('Error getting cached routes:', cacheError);
        return [];
      }
    }
  }
}

export class GetRouteByIdUseCase {
  constructor(private routeRepository: RouteRepository) {}

  async execute(id: string): Promise<BusRoute | null> {
    try {
      return await this.routeRepository.getRouteById(id);
    } catch (error) {
      console.error('Error getting route by id:', error);
      return null;
    }
  }
}
