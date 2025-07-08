import { Platform, Alert, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';
import { apiService } from './api.service';

export enum NotificationType {
  SPARK_DETECTED = 'spark_detected',
  SPARK_MATCHED = 'spark_matched', 
  MESSAGE_RECEIVED = 'message_received',
  SIGNAL_SPOT_NEARBY = 'signal_spot_nearby',
  SACRED_SITE_DISCOVERED = 'sacred_site_discovered',
  SACRED_SITE_TIER_UPGRADED = 'sacred_site_tier_upgraded',
  PROFILE_VISITED = 'profile_visited',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  LOCATION_SHARING_REQUEST = 'location_sharing_request',
  FRIEND_REQUEST = 'friend_request',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
}

export interface NotificationData {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
  timestamp: number;
  read: boolean;
}

export interface NotificationSettings {
  enabled: boolean;
  sparks: boolean;
  messages: boolean;
  spots: boolean;
  system: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
}

class NotificationService {
  private listeners: Map<string, (notification: NotificationData) => void> = new Map();
  private isInitialized = false;
  private fcmToken: string | null = null;

  private readonly STORAGE_KEYS = {
    SETTINGS: '@notifications/settings',
    HISTORY: '@notifications/history',
    FCM_TOKEN: '@notifications/fcmToken',
  };

  private defaultSettings: NotificationSettings = {
    enabled: true,
    sparks: true,
    messages: true,
    spots: true,
    system: true,
    sound: true,
    vibration: true,
    badge: true,
  };

  async initialize(): Promise<boolean> {
    if (this.isInitialized) {
      return true;
    }

    try {
      // Request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return false;
      }

      // Get FCM token
      const token = await messaging().getToken();
      this.fcmToken = token;
      await AsyncStorage.setItem(this.STORAGE_KEYS.FCM_TOKEN, token);
      
      // Send token to backend
      await this.updateServerToken(token);

      // Listen for token refresh
      messaging().onTokenRefresh(async (newToken) => {
        this.fcmToken = newToken;
        await AsyncStorage.setItem(this.STORAGE_KEYS.FCM_TOKEN, newToken);
        await this.updateServerToken(newToken);
      });

      // Handle foreground messages
      messaging().onMessage(async (remoteMessage) => {
        await this.handleForegroundMessage(remoteMessage);
      });

      // Handle background/quit state messages
      messaging().onNotificationOpenedApp((remoteMessage) => {
        this.handleNotificationOpen(remoteMessage);
      });

      // Check if app was opened from notification
      const initialNotification = await messaging().getInitialNotification();
      if (initialNotification) {
        this.handleNotificationOpen(initialNotification);
      }

      this.isInitialized = true;
      console.log('Notification service initialized');
      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (!enabled) {
        Alert.alert(
          '알림 권한 필요',
          '스파크 알림을 받기 위해 알림 권한이 필요합니다.',
          [
            { text: '취소', style: 'cancel' },
            { text: '설정으로 이동', onPress: () => Linking.openSettings() },
          ]
        );
      }

      return enabled;
    } catch (error) {
      console.error('Permission request failed:', error);
      return false;
    }
  }

  private async handleForegroundMessage(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    const notification: NotificationData = {
      id: remoteMessage.messageId || Date.now().toString(),
      type: (remoteMessage.data?.type as NotificationType) || NotificationType.SYSTEM_ANNOUNCEMENT,
      title: remoteMessage.notification?.title || 'SignalSpot',
      body: remoteMessage.notification?.body || '',
      data: remoteMessage.data,
      timestamp: Date.now(),
      read: false,
    };

    // Store in history
    await this.storeNotification(notification);

    // Show in-app notification
    this.showInAppNotification(notification);

    // Notify listeners
    this.notifyListeners(notification);
  }

  private handleNotificationOpen(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): void {
    const type = remoteMessage.data?.type as NotificationType;
    const data = remoteMessage.data;

    // Navigate based on notification type
    this.navigateFromNotification(type, data);
  }

  private navigateFromNotification(type: NotificationType, data?: Record<string, string>): void {
    // TODO: Implement navigation logic with React Navigation
    // For now, we'll use deep linking patterns
    
    switch (type) {
      case NotificationType.SPARK_DETECTED:
      case NotificationType.SPARK_MATCHED:
        const sparkId = data?.sparkId;
        if (sparkId) {
          Linking.openURL(`signalspot://sparks/${sparkId}`);
        }
        break;
        
      case NotificationType.MESSAGE_RECEIVED:
        const chatId = data?.chatId;
        if (chatId) {
          Linking.openURL(`signalspot://chat/${chatId}`);
        }
        break;
        
      case NotificationType.SIGNAL_SPOT_NEARBY:
        const spotId = data?.spotId;
        if (spotId) {
          Linking.openURL(`signalspot://spots/${spotId}`);
        }
        break;
        
      case NotificationType.SACRED_SITE_DISCOVERED:
      case NotificationType.SACRED_SITE_TIER_UPGRADED:
        const siteId = data?.siteId;
        if (siteId) {
          Linking.openURL(`signalspot://sacred-sites/${siteId}`);
        }
        break;
        
      case NotificationType.PROFILE_VISITED:
        const visitorId = data?.visitorId;
        if (visitorId) {
          Linking.openURL(`signalspot://profile/${visitorId}`);
        }
        break;
        
      case NotificationType.FRIEND_REQUEST:
        Linking.openURL('signalspot://friends/requests');
        break;
        
      case NotificationType.ACHIEVEMENT_UNLOCKED:
        const achievementId = data?.achievementId;
        if (achievementId) {
          Linking.openURL(`signalspot://achievements/${achievementId}`);
        }
        break;
        
      case NotificationType.LOCATION_SHARING_REQUEST:
        Linking.openURL('signalspot://location/sharing/requests');
        break;
        
      default:
        // Navigate to main screen
        Linking.openURL('signalspot://main');
        break;
    }
  }

  private showInAppNotification(notification: NotificationData): void {
    // Show custom in-app notification UI
    Alert.alert(notification.title, notification.body, [
      { text: '확인', style: 'default' },
    ]);
  }

  private notifyListeners(notification: NotificationData): void {
    this.listeners.forEach((callback) => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }

  addListener(
    id: string,
    callback: (notification: NotificationData) => void
  ): void {
    this.listeners.set(id, callback);
  }

  removeListener(id: string): void {
    this.listeners.delete(id);
  }

  private async storeNotification(notification: NotificationData): Promise<void> {
    try {
      const history = await this.getNotificationHistory();
      const updatedHistory = [notification, ...history.slice(0, 99)]; // Keep last 100
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.HISTORY,
        JSON.stringify(updatedHistory)
      );
    } catch (error) {
      console.error('Failed to store notification:', error);
    }
  }

  async getNotificationHistory(): Promise<NotificationData[]> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.HISTORY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get notification history:', error);
      return [];
    }
  }

  async markAsRead(notificationId: string): Promise<void> {
    try {
      const history = await this.getNotificationHistory();
      const updated = history.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      );
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.HISTORY,
        JSON.stringify(updated)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }

  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.STORAGE_KEYS.HISTORY);
    } catch (error) {
      console.error('Failed to clear notification history:', error);
    }
  }

  async getSettings(): Promise<NotificationSettings> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.SETTINGS);
      return stored ? { ...this.defaultSettings, ...JSON.parse(stored) } : this.defaultSettings;
    } catch (error) {
      console.error('Failed to get notification settings:', error);
      return this.defaultSettings;
    }
  }

  async updateSettings(settings: Partial<NotificationSettings>): Promise<void> {
    try {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.SETTINGS,
        JSON.stringify(updated)
      );

      // Update server preferences
      await this.updateServerSettings(updated);
    } catch (error) {
      console.error('Failed to update notification settings:', error);
    }
  }

  private async updateServerToken(token: string): Promise<void> {
    try {
      await apiService.post('/notifications/fcm-token', { fcmToken: token });
      console.log('FCM token sent to server:', token);
    } catch (error) {
      console.error('Failed to update server token:', error);
    }
  }

  private async updateServerSettings(settings: NotificationSettings): Promise<void> {
    try {
      // Note: This endpoint would need to be implemented in the backend
      // await apiService.put('/notifications/settings', settings);
      console.log('Notification settings updated on server:', settings);
    } catch (error) {
      console.error('Failed to update server settings:', error);
    }
  }

  async subscribeToTopic(topic: string): Promise<boolean> {
    try {
      await messaging().subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
      return true;
    } catch (error) {
      console.error('Failed to subscribe to topic:', error);
      return false;
    }
  }

  async unsubscribeFromTopic(topic: string): Promise<boolean> {
    try {
      await messaging().unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
      return true;
    } catch (error) {
      console.error('Failed to unsubscribe from topic:', error);
      return false;
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const history = await this.getNotificationHistory();
      return history.filter(n => !n.read).length;
    } catch (error) {
      console.error('Failed to get unread count:', error);
      return 0;
    }
  }

  async simulateNotification(type: NotificationType, data?: Record<string, string>): Promise<void> {
    // For testing purposes - simulate receiving a notification
    const notification: NotificationData = {
      id: Date.now().toString(),
      type,
      title: this.getSimulatedTitle(type),
      body: this.getSimulatedBody(type),
      data,
      timestamp: Date.now(),
      read: false,
    };

    await this.storeNotification(notification);
    this.showInAppNotification(notification);
    this.notifyListeners(notification);
  }

  private getSimulatedTitle(type: NotificationType): string {
    switch (type) {
      case NotificationType.SPARK_DETECTED:
        return '✨ 새로운 스파크 발견!';
      case NotificationType.SPARK_MATCHED:
        return '🎉 매칭 성공!';
      case NotificationType.MESSAGE_RECEIVED:
        return '💬 새 메시지';
      case NotificationType.SIGNAL_SPOT_NEARBY:
        return '📍 근처 시그널 스팟';
      case NotificationType.PROFILE_VISITED:
        return '👀 프로필 방문';
      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return '📢 공지사항';
      default:
        return 'SignalSpot';
    }
  }

  private getSimulatedBody(type: NotificationType): string {
    switch (type) {
      case NotificationType.SPARK_DETECTED:
        return '근처에서 새로운 인연의 스파크를 발견했어요!';
      case NotificationType.SPARK_MATCHED:
        return '축하합니다! 새로운 매칭이 성사되었어요.';
      case NotificationType.MESSAGE_RECEIVED:
        return '새로운 메시지가 도착했습니다.';
      case NotificationType.SIGNAL_SPOT_NEARBY:
        return '근처에 흥미로운 시그널 스팟이 있어요!';
      case NotificationType.PROFILE_VISITED:
        return '누군가 당신의 프로필을 확인했어요.';
      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return '새로운 업데이트가 있습니다.';
      default:
        return '새로운 알림이 있습니다.';
    }
  }

  getFCMToken(): string | null {
    return this.fcmToken;
  }

  async logout(): Promise<void> {
    try {
      // Clear FCM token from server
      if (this.fcmToken) {
        await apiService.delete('/notifications/fcm-token');
      }

      // Clear local storage
      await AsyncStorage.multiRemove([
        this.STORAGE_KEYS.FCM_TOKEN,
        this.STORAGE_KEYS.HISTORY,
      ]);

      this.fcmToken = null;
      this.listeners.clear();
      this.isInitialized = false;
    } catch (error) {
      console.error('Failed to logout from notifications:', error);
    }
  }

  // Additional methods for API integration
  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      await apiService.put(`/notifications/${notificationId}/read`);
      await this.markAsRead(notificationId);
    } catch (error) {
      console.error('Failed to mark notification as read on server:', error);
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    try {
      await apiService.put('/notifications/read-all');
      const history = await this.getNotificationHistory();
      const updated = history.map(n => ({ ...n, read: true }));
      await AsyncStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to mark all notifications as read on server:', error);
    }
  }

  async getServerNotifications(limit: number = 20, offset: number = 0): Promise<NotificationData[]> {
    try {
      const response = await apiService.get(`/notifications?limit=${limit}&offset=${offset}`);
      return response.data.notifications || [];
    } catch (error) {
      console.error('Failed to fetch notifications from server:', error);
      return [];
    }
  }

  async deleteNotification(notificationId: string): Promise<void> {
    try {
      await apiService.delete(`/notifications/${notificationId}`);
      const history = await this.getNotificationHistory();
      const updated = history.filter(n => n.id !== notificationId);
      await AsyncStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify(updated));
    } catch (error) {
      console.error('Failed to delete notification on server:', error);
    }
  }
}

export const notificationService = new NotificationService();