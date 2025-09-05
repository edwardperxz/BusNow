// =============================================================================
// TRACKING REPOSITORY INTERFACE - Domain Layer
// =============================================================================

import { TrackingSession, Coordinates } from '../../types';

export interface TrackingRepository {
  // Sesiones de tracking
  createTrackingSession(
    userId: string,
    routeId: string,
    startLocation: Coordinates,
    targetLocation: Coordinates,
    deviceInfo: {
      deviceId: string;
      platform: 'ios' | 'android';
      ip?: string;
    }
  ): Promise<TrackingSession>;
  
  endTrackingSession(sessionId: string): Promise<void>;
  getActiveTrackingSessions(userId: string): Promise<TrackingSession[]>;
  
  // Logs de trazabilidad
  logUserActivity(
    userId: string,
    action: string,
    data: any,
    location?: Coordinates,
    deviceId?: string,
    ip?: string
  ): Promise<void>;
  
  // Notificaciones
  scheduleNotification(
    userId: string,
    type: 'bus_arrival',
    title: string,
    message: string,
    scheduledTime: Date,
    data?: any
  ): Promise<void>;
  
  cancelNotification(notificationId: string): Promise<void>;
}
