import axios from 'axios';
import { Bus, BusRoute, BusStop, EstimatedArrival, ApiResponse, Coordinates } from '../types';
import { MOCK_BUSES, MOCK_ROUTES } from '../data/mocks/mockData';

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
        // En caso de error de red, usar datos mock
        return this.handleApiError(error);
      }
    );
  }

  private handleApiError(error: any) {
    console.warn('API no disponible, usando datos mock:', error.message);
    return Promise.reject(error);
  }

  // === MÉTODOS DE RUTAS ===
  async getRoutes(): Promise<BusRoute[]> {
    try {
      const response = await this.api.get<ApiResponse<BusRoute[]>>('/routes');
      return response.data.data;
    } catch (error) {
      console.warn('Usando datos mock para rutas');
      return MOCK_ROUTES;
    }
  }

  async getRouteById(routeId: string): Promise<BusRoute | null> {
    try {
      const response = await this.api.get<ApiResponse<BusRoute>>(`/routes/${routeId}`);
      return response.data.data;
    } catch (error) {
      console.warn('Usando datos mock para ruta específica');
      return MOCK_ROUTES.find(route => route.id === routeId) || null;
    }
  }

  // === MÉTODOS DE BUSES ===
  async getBusesByRoute(routeId: string): Promise<Bus[]> {
    try {
      const response = await this.api.get<ApiResponse<Bus[]>>(`/routes/${routeId}/buses`);
      return response.data.data;
    } catch (error) {
      console.warn('Usando datos mock para buses por ruta');
      return MOCK_BUSES.filter(bus => bus.routeId === routeId);
    }
  }

  async getAllBuses(): Promise<Bus[]> {
    try {
      const response = await this.api.get<ApiResponse<Bus[]>>('/buses');
      return response.data.data;
    } catch (error) {
      console.warn('Usando datos mock para todos los buses');
      return MOCK_BUSES;
    }
  }

  async getBusById(busId: string): Promise<Bus | null> {
    try {
      const response = await this.api.get<ApiResponse<Bus>>(`/buses/${busId}`);
      return response.data.data;
    } catch (error) {
      console.warn('Usando datos mock para bus específico');
      return MOCK_BUSES.find(bus => bus.id === busId) || null;
    }
  }

  // === MÉTODOS DE PARADAS ===
  async getBusStops(): Promise<BusStop[]> {
    try {
      const response = await this.api.get<ApiResponse<BusStop[]>>('/stops');
      return response.data.data;
    } catch (error) {
      console.warn('Usando datos mock para paradas');
      // Extraer paradas de las rutas mock
      const stops: BusStop[] = [];
      MOCK_ROUTES.forEach(route => {
        if (route.busStops) {
          stops.push(...route.busStops);
        }
      });
      return stops;
    }
  }

  async getNearbyStops(location: Coordinates, radius: number = 1000): Promise<BusStop[]> {
    try {
      const response = await this.api.get<ApiResponse<BusStop[]>>('/stops/nearby', {
        params: {
          lat: location.latitude,
          lng: location.longitude,
          radius,
        },
      });
      return response.data.data;
    } catch (error) {
      console.warn('Usando datos mock para paradas cercanas');
      // Simular paradas cercanas con datos mock
      const allStops: BusStop[] = [];
      MOCK_ROUTES.forEach(route => {
        if (route.busStops) {
          allStops.push(...route.busStops);
        }
      });
      
      // Filtrar por distancia aproximada
      return allStops.filter(stop => {
        const distance = this.calculateDistance(location, stop.coordinates);
        return distance <= radius / 1000; // convertir metros a km
      });
    }
  }

  // === MÉTODOS DE TIEMPO REAL ===
  async getEstimatedArrival(stopId: string, routeId: string): Promise<EstimatedArrival[]> {
    try {
      const response = await this.api.get<ApiResponse<EstimatedArrival[]>>(
        `/stops/${stopId}/arrivals/${routeId}`
      );
      return response.data.data;
    } catch (error) {
      console.warn('Simulando tiempos de llegada');
      // Simular tiempos de llegada
      const buses = MOCK_BUSES.filter(bus => bus.routeId === routeId);
      return buses.map(bus => ({
        busId: bus.id,
        routeId: bus.routeId,
        stopId,
        estimatedMinutes: Math.floor(Math.random() * 15) + 2, // 2-17 minutos
        isRealTime: false,
        lastUpdate: new Date(),
        confidence: 'high' as const, // Mock confidence
        targetCoordinates: bus.currentLocation,
        distance: Math.random() * 2000, // Distancia simulada en metros
        lastCalculated: new Date(),
      }));
    }
  }

  // === WEBSOCKET PARA TIEMPO REAL ===
  connectWebSocket() {
    if (this.ws) {
      this.ws.close();
    }

    try {
      this.ws = new WebSocket(WS_URL);
      
      this.ws.onopen = () => {
        console.log('WebSocket conectado para actualizaciones en tiempo real');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleWebSocketMessage(data);
      };

      this.ws.onclose = () => {
        console.log('WebSocket desconectado');
        this.attemptReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('Error en WebSocket:', error);
      };
    } catch (error) {
      console.warn('WebSocket no disponible, usando polling');
      this.startPolling();
    }
  }

  private handleWebSocketMessage(data: any) {
    switch (data.type) {
      case 'bus_update':
        if (this.onBusUpdate) {
          this.onBusUpdate(data.payload);
        }
        break;
      case 'route_update':
        if (this.onRouteUpdate) {
          this.onRouteUpdate(data.payload);
        }
        break;
      default:
        console.log('Mensaje WebSocket no reconocido:', data.type);
    }
  }

  private attemptReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Intentando reconectar WebSocket (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      setTimeout(() => this.connectWebSocket(), 5000);
    } else {
      console.warn('Máximo de intentos de reconexión alcanzado, usando polling');
      this.startPolling();
    }
  }

  private startPolling() {
    // Polling cada 10 segundos como fallback
    setInterval(async () => {
      try {
        const buses = await this.getAllBuses();
        buses.forEach(bus => {
          if (this.onBusUpdate) {
            this.onBusUpdate(bus);
          }
        });
      } catch (error) {
        console.error('Error en polling:', error);
      }
    }, 10000);
  }

  // === SUSCRIPCIONES ===
  onBusLocationUpdate(callback: (bus: Bus) => void) {
    this.onBusUpdate = callback;
  }

  onRouteStatusUpdate(callback: (route: BusRoute) => void) {
    this.onRouteUpdate = callback;
  }

  // === UTILIDADES ===
  private calculateDistance(point1: Coordinates, point2: Coordinates): number {
    const R = 6371; // Radio de la Tierra en km
    const dLat = this.deg2rad(point2.latitude - point1.latitude);
    const dLon = this.deg2rad(point2.longitude - point1.longitude);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(point1.latitude)) * Math.cos(this.deg2rad(point2.latitude)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI/180);
  }

  // === CLEANUP ===
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

export const apiService = new ApiService();
