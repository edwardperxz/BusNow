// =============================================================================
// MOCK ROUTE REPOSITORY - Data Layer
// =============================================================================

import { BusRoute, RouteFilters } from '../../types';
import { RouteRepository } from '../../domain/repositories/RouteRepository';
import { MOCK_ROUTES, MOCK_OPERATORS } from '../mocks/mockData';

export class MockRouteRepository implements RouteRepository {
  private routes: BusRoute[] = [...MOCK_ROUTES];
  private cachedRoutes: BusRoute[] = [];

  async getAllRoutes(): Promise<BusRoute[]> {
    // Simular delay de red
    await this.delay(300);
    
    return this.routes.filter(route => route.isActive);
  }

  async getRouteById(id: string): Promise<BusRoute | null> {
    await this.delay(100);
    
    const route = this.routes.find(r => r.id === id);
    return route || null;
  }

  async searchRoutes(filters: RouteFilters): Promise<BusRoute[]> {
    await this.delay(200);
    
    let filteredRoutes = this.routes.filter(route => route.isActive);

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredRoutes = filteredRoutes.filter(route =>
        route.name.toLowerCase().includes(searchLower) ||
        route.shortName.toLowerCase().includes(searchLower) ||
        route.origin.toLowerCase().includes(searchLower) ||
        route.destination.toLowerCase().includes(searchLower) ||
        route.description.toLowerCase().includes(searchLower)
      );
    }

    if (filters.category) {
      filteredRoutes = filteredRoutes.filter(route => route.category === filters.category);
    }

    if (filters.operator) {
      filteredRoutes = filteredRoutes.filter(route => route.operatorId === filters.operator);
    }

    if (filters.maxFare) {
      filteredRoutes = filteredRoutes.filter(route => route.fare <= filters.maxFare!);
    }

    return filteredRoutes;
  }

  async getUrbanRoutes(): Promise<BusRoute[]> {
    await this.delay(200);
    return this.routes.filter(route => route.category === 'urban' && route.isActive);
  }

  async getIntercityRoutes(): Promise<BusRoute[]> {
    await this.delay(200);
    return this.routes.filter(route => route.category === 'intercity' && route.isActive);
  }

  async getRoutesByOperator(operatorId: string): Promise<BusRoute[]> {
    await this.delay(200);
    return this.routes.filter(route => route.operatorId === operatorId && route.isActive);
  }

  async cacheRoutes(routes: BusRoute[]): Promise<void> {
    this.cachedRoutes = [...routes];
  }

  async getCachedRoutes(): Promise<BusRoute[]> {
    return [...this.cachedRoutes];
  }

  // Utility method for simulating network delay
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Method to add/update routes (for testing/admin purposes)
  addRoute(route: BusRoute): void {
    const existingIndex = this.routes.findIndex(r => r.id === route.id);
    if (existingIndex >= 0) {
      this.routes[existingIndex] = route;
    } else {
      this.routes.push(route);
    }
  }

  // Method to deactivate a route
  deactivateRoute(routeId: string): void {
    const route = this.routes.find(r => r.id === routeId);
    if (route) {
      route.isActive = false;
    }
  }
}
