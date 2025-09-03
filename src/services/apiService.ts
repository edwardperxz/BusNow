import axios from 'axios';
import { Bus, BusRoute, BusStop, EstimatedArrival, ApiResponse, Coordinates } from '../types';

const API_BASE_URL = 'https://api.busnow.app'; // URL de tu API backend
const WS_URL = 'wss://ws.busnow.app'; // URL del WebSocket

class ApiService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private onBusUpdate: ((bus: Bus) => void) | null = null;
  private onRouteUpdate: ((route: BusRoute) => void) | null = null;

  // Configuración de Axios
  private api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  constructor() {
    // Interceptor para manejo de errores
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // WebSocket para tiempo real
  connectWebSocket(
    onBusUpdate: (bus: Bus) => void,
    onRouteUpdate?: (route: BusRoute) => void
  ): void {
    try {
      this.onBusUpdate = onBusUpdate;
      this.onRouteUpdate = onRouteUpdate || null;

      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Suscribirse a actualizaciones de buses
        this.send({
          type: 'subscribe',
          channels: ['bus_locations', 'route_updates'],
        });
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Error connecting WebSocket:', error);
    }
  }

  private handleWebSocketMessage(data: any): void {
    switch (data.type) {
      case 'bus_location_update':
        if (this.onBusUpdate && data.payload) {
          this.onBusUpdate(data.payload);
        }
        break;
      case 'route_update':
        if (this.onRouteUpdate && data.payload) {
          this.onRouteUpdate(data.payload);
        }
        break;
      default:
        console.log('Unknown WebSocket message type:', data.type);
    }
  }

  private send(data: any): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  private attemptReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      setTimeout(() => {
        if (this.onBusUpdate) {
          this.connectWebSocket(this.onBusUpdate, this.onRouteUpdate || undefined);
        }
      }, 5000); // Intentar reconectar cada 5 segundos
    }
  }

  disconnectWebSocket(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  // API REST methods
  async getAllBuses(): Promise<Bus[]> {
    try {
      const response = await this.api.get<ApiResponse<Bus[]>>('/buses');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching buses:', error);
      // Retornar datos simulados si la API no está disponible
      return this.getMockBuses();
    }
  }

  async getBusByRoute(routeId: string): Promise<Bus[]> {
    try {
      const response = await this.api.get<ApiResponse<Bus[]>>(`/buses/route/${routeId}`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching buses by route:', error);
      return this.getMockBuses().filter(bus => bus.routeId === routeId);
    }
  }

  async getAllRoutes(): Promise<BusRoute[]> {
    try {
      const response = await this.api.get<ApiResponse<BusRoute[]>>('/routes');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching routes:', error);
      return this.getMockRoutes();
    }
  }

  async getRoute(routeId: string): Promise<BusRoute | null> {
    try {
      const response = await this.api.get<ApiResponse<BusRoute>>(`/routes/${routeId}`);
      return response.data.data || null;
    } catch (error) {
      console.error('Error fetching route:', error);
      return this.getMockRoutes().find(route => route.id === routeId) || null;
    }
  }

  async getStopsByRoute(routeId: string): Promise<BusStop[]> {
    try {
      const response = await this.api.get<ApiResponse<BusStop[]>>(`/routes/${routeId}/stops`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching stops:', error);
      return [];
    }
  }

  async getEstimatedArrivals(stopId: string): Promise<EstimatedArrival[]> {
    try {
      const response = await this.api.get<ApiResponse<EstimatedArrival[]>>(`/stops/${stopId}/arrivals`);
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching estimated arrivals:', error);
      return [];
    }
  }

  async updateBusLocation(busId: string, location: Coordinates): Promise<void> {
    try {
      await this.api.put(`/buses/${busId}/location`, {
        latitude: location.latitude,
        longitude: location.longitude,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating bus location:', error);
    }
  }

  // Métodos para datos simulados (cuando la API no está disponible)
  private getMockBuses(): Bus[] {
    return [
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
  }

  private getMockRoutes(): BusRoute[] {
    return [
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
    ];
  }

  // Simular actualizaciones en tiempo real para modo demo
  startMockUpdates(onBusUpdate: (bus: Bus) => void): NodeJS.Timeout {
    return setInterval(() => {
      const buses = this.getMockBuses();
      const randomBus = buses[Math.floor(Math.random() * buses.length)];
      
      // Simular movimiento del bus
      const randomOffset = 0.001;
      randomBus.currentLocation = {
        latitude: randomBus.currentLocation.latitude + (Math.random() - 0.5) * randomOffset,
        longitude: randomBus.currentLocation.longitude + (Math.random() - 0.5) * randomOffset,
      };
      
      randomBus.speed = Math.random() * 50 + 10; // Entre 10-60 km/h
      randomBus.lastUpdate = new Date();
      
      onBusUpdate(randomBus);
    }, 5000); // Actualizar cada 5 segundos
  }
}

export const apiService = new ApiService();
