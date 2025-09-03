import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

class NotificationService {
  private expoPushToken: string | null = null;

  async initialize(): Promise<void> {
    // Configurar el comportamiento de las notificaciones
    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    // Solicitar permisos y obtener token
    await this.registerForPushNotifications();
  }

  private async registerForPushNotifications(): Promise<void> {
    if (!Device.isDevice) {
      console.warn('Push notifications only work on physical devices');
      return;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Permission for push notifications denied');
        return;
      }

      // Obtener el token de Expo Push
      const token = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig?.extra?.eas?.projectId,
      });

      this.expoPushToken = token.data;
      console.log('Expo push token:', this.expoPushToken);

      // Configuración específica para Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('busnow', {
          name: 'BusNow Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }
    } catch (error) {
      console.error('Error setting up push notifications:', error);
    }
  }

  async scheduleArrivalNotification(
    busLine: string,
    stopName: string,
    estimatedMinutes: number
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: `🚌 Bus ${busLine} se acerca`,
          body: `Llegará a ${stopName} en ${estimatedMinutes} minutos`,
          sound: 'default',
          data: {
            type: 'arrival',
            busLine,
            stopName,
            estimatedMinutes,
          },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.max(1, (estimatedMinutes - 2) * 60), // Notificar 2 minutos antes
        },
      });
    } catch (error) {
      console.error('Error scheduling arrival notification:', error);
    }
  }

  async sendImmediateNotification(
    title: string,
    body: string,
    data?: any
  ): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          data,
        },
        trigger: null, // Mostrar inmediatamente
      });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  async cancelNotificationsByData(matchData: any): Promise<void> {
    try {
      const scheduledNotifications = await Notifications.getAllScheduledNotificationsAsync();
      
      for (const notification of scheduledNotifications) {
        const notificationData = notification.content.data;
        
        // Comparar datos específicos
        let shouldCancel = true;
        for (const key in matchData) {
          if (notificationData[key] !== matchData[key]) {
            shouldCancel = false;
            break;
          }
        }
        
        if (shouldCancel) {
          await Notifications.cancelScheduledNotificationAsync(notification.identifier);
        }
      }
    } catch (error) {
      console.error('Error canceling specific notifications:', error);
    }
  }

  getExpoPushToken(): string | null {
    return this.expoPushToken;
  }

  // Listener para notificaciones recibidas
  addNotificationReceivedListener(
    listener: (notification: Notifications.Notification) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(listener);
  }

  // Listener para cuando el usuario toca una notificación
  addNotificationResponseReceivedListener(
    listener: (response: Notifications.NotificationResponse) => void
  ): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(listener);
  }
}

export const notificationService = new NotificationService();
