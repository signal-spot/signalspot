import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { User } from '../entities/user.entity';
import { EntityManager } from '@mikro-orm/core';
import { WebSocketService } from '../websocket/websocket.service';

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
  badge?: number;
  sound?: string;
  priority?: 'high' | 'normal';
  collapseKey?: string;
  ttl?: number;
  category?: string;
  threadId?: string;
}

export interface NotificationResult {
  success: boolean;
  messageId?: string;
  error?: string;
  platform: 'fcm' | 'apns' | 'websocket';
}

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);
  private firebaseAdmin: admin.app.App | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly em: EntityManager,
    private readonly webSocketService: WebSocketService,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // 먼저 파일로 시도
      const serviceAccountPath = './signalspot-9c864-firebase-adminsdk-fbsvc-fbae91453b.json';
      
      try {
        // 파일이 존재하면 파일로 초기화
        const fs = require('fs');
        if (fs.existsSync(serviceAccountPath)) {
          const serviceAccount = require('../../signalspot-9c864-firebase-adminsdk-fbsvc-fbae91453b.json');
          
          this.firebaseAdmin = admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
          });
          
          this.logger.log('Firebase Admin SDK initialized successfully using service account file');
          return;
        }
      } catch (fileError) {
        // 파일 방식 실패 시 환경변수로 시도
      }
      
      // 환경변수로 시도
      const firebaseConfig = this.configService.get('FIREBASE_CONFIG');
      
      if (!firebaseConfig) {
        this.logger.warn('Firebase configuration not found. Push notifications will be disabled.');
        return;
      }

      const config = typeof firebaseConfig === 'string' 
        ? JSON.parse(firebaseConfig) 
        : firebaseConfig;

      this.firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(config),
      });

      this.logger.log('Firebase Admin SDK initialized successfully using environment variable');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  async sendPushNotification(
    userId: string,
    notification: PushNotification,
  ): Promise<NotificationResult> {
    try {
      const user = await this.em.findOne(User, { id: userId });
      
      if (!user) {
        return {
          success: false,
          error: 'User not found',
          platform: 'fcm',
        };
      }

      // Check user notification settings
      if (!this.shouldSendNotification(user, notification)) {
        return {
          success: false,
          error: 'Notification disabled by user settings',
          platform: 'fcm',
        };
      }

      // Try to send via WebSocket if user is online
      if (this.webSocketService.isUserOnline(userId)) {
        await this.webSocketService.sendNotificationToUser(userId, {
          id: `notification_${Date.now()}`,
          type: 'push',
          title: notification.title,
          message: notification.body,
          data: notification.data,
          timestamp: new Date(),
          priority: notification.priority || 'normal',
        });

        this.logger.log(`Notification sent via WebSocket to user: ${userId}`);
        
        return {
          success: true,
          platform: 'websocket',
        };
      }

      // Send via FCM for Android
      if (user.fcmToken) {
        return await this.sendFCMNotification(user.fcmToken, notification);
      }

      // Send via APNS for iOS (if token available)
      if (user.apnsToken) {
        return await this.sendAPNSNotification(user.apnsToken, notification);
      }

      return {
        success: false,
        error: 'No push token available',
        platform: 'fcm',
      };
    } catch (error) {
      this.logger.error(`Failed to send push notification: ${error.message}`);
      return {
        success: false,
        error: error.message,
        platform: 'fcm',
      };
    }
  }

  private async sendFCMNotification(
    token: string,
    notification: PushNotification,
  ): Promise<NotificationResult> {
    if (!this.firebaseAdmin) {
      return {
        success: false,
        error: 'Firebase not initialized',
        platform: 'fcm',
      };
    }

    try {
      const message: admin.messaging.Message = {
        token,
        notification: {
          title: notification.title,
          body: notification.body,
          imageUrl: notification.imageUrl,
        },
        data: notification.data || {},
        android: {
          priority: notification.priority === 'high' ? 'high' : 'normal',
          ttl: notification.ttl || 3600 * 1000, // 1 hour default
          collapseKey: notification.collapseKey,
          notification: {
            sound: notification.sound || 'default',
            tag: notification.threadId,
            color: '#6750A4', // Primary color
            icon: 'ic_notification',
            clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: notification.title,
                body: notification.body,
              },
              badge: notification.badge,
              sound: notification.sound || 'default',
              category: notification.category,
              threadId: notification.threadId,
              contentAvailable: true,
              mutableContent: true,
            },
          },
          headers: {
            'apns-priority': notification.priority === 'high' ? '10' : '5',
            'apns-expiration': Math.floor(Date.now() / 1000 + (notification.ttl || 3600)).toString(),
          },
        },
      };

      const response = await this.firebaseAdmin.messaging().send(message);
      
      this.logger.log(`FCM notification sent successfully: ${response}`);
      
      return {
        success: true,
        messageId: response,
        platform: 'fcm',
      };
    } catch (error) {
      this.logger.error(`FCM notification failed: ${error.message}`);
      return {
        success: false,
        error: error.message,
        platform: 'fcm',
      };
    }
  }

  private async sendAPNSNotification(
    token: string,
    notification: PushNotification,
  ): Promise<NotificationResult> {
    // For now, we'll use FCM to send to iOS devices as well
    // FCM can handle both Android and iOS
    return this.sendFCMNotification(token, notification);
  }

  async sendBatchNotifications(
    userIds: string[],
    notification: PushNotification,
  ): Promise<Map<string, NotificationResult>> {
    const results = new Map<string, NotificationResult>();
    
    // Process in batches to avoid overwhelming the system
    const batchSize = 100;
    for (let i = 0; i < userIds.length; i += batchSize) {
      const batch = userIds.slice(i, i + batchSize);
      const batchPromises = batch.map(userId => 
        this.sendPushNotification(userId, notification)
          .then(result => ({ userId, result }))
      );
      
      const batchResults = await Promise.all(batchPromises);
      batchResults.forEach(({ userId, result }) => {
        results.set(userId, result);
      });
    }
    
    return results;
  }

  async updatePushToken(
    userId: string,
    token: string,
    platform: 'fcm' | 'apns',
  ): Promise<void> {
    const user = await this.em.findOne(User, { id: userId });
    
    if (!user) {
      throw new Error('User not found');
    }

    if (platform === 'fcm') {
      user.fcmToken = token;
    } else {
      user.apnsToken = token;
    }

    await this.em.persistAndFlush(user);
    
    this.logger.log(`Updated ${platform} token for user: ${userId}`);
  }

  async removePushToken(userId: string, platform: 'fcm' | 'apns'): Promise<void> {
    const user = await this.em.findOne(User, { id: userId });
    
    if (!user) {
      throw new Error('User not found');
    }

    if (platform === 'fcm') {
      user.fcmToken = null;
    } else {
      user.apnsToken = null;
    }

    await this.em.persistAndFlush(user);
    
    this.logger.log(`Removed ${platform} token for user: ${userId}`);
  }

  async updateNotificationSettings(
    userId: string,
    settings: Partial<User['notificationSettings']>,
  ): Promise<void> {
    const user = await this.em.findOne(User, { id: userId });
    
    if (!user) {
      throw new Error('User not found');
    }

    user.notificationSettings = {
      ...user.notificationSettings,
      ...settings,
    };

    await this.em.persistAndFlush(user);
    
    this.logger.log(`Updated notification settings for user: ${userId}`);
  }

  private shouldSendNotification(
    user: User,
    notification: PushNotification,
  ): boolean {
    const settings = user.notificationSettings || {};
    
    // Check if push notifications are enabled globally
    if (settings.pushEnabled === false) {
      return false;
    }

    // Check specific notification types based on data
    if (notification.data?.type) {
      switch (notification.data.type) {
        case 'spot_created':
          return settings.spotCreated !== false;
        case 'spot_liked':
          return settings.spotLiked !== false;
        case 'spot_commented':
          return settings.spotCommented !== false;
        case 'message_received':
          return settings.messageReceived !== false;
        case 'spark_received':
          return settings.sparkReceived !== false;
        case 'system_announcement':
          return settings.systemAnnouncements !== false;
        default:
          return true;
      }
    }

    return true;
  }

  // Notification templates
  async sendSpotLikedNotification(spotId: string, likerId: string, ownerId: string) {
    const liker = await this.em.findOne(User, { id: likerId });
    
    if (!liker) return;

    await this.sendPushNotification(ownerId, {
      title: 'Your Signal Spot was liked!',
      body: `${liker.username} liked your Signal Spot`,
      data: {
        type: 'spot_liked',
        spotId,
        likerId,
      },
      priority: 'normal',
      category: 'SPOT_INTERACTION',
    });
  }

  async sendSpotCommentedNotification(
    spotId: string,
    commenterId: string,
    ownerId: string,
    commentPreview: string,
  ) {
    const commenter = await this.em.findOne(User, { id: commenterId });
    
    if (!commenter) return;

    await this.sendPushNotification(ownerId, {
      title: 'New comment on your Signal Spot',
      body: `${commenter.username}: ${commentPreview.substring(0, 100)}`,
      data: {
        type: 'spot_commented',
        spotId,
        commenterId,
      },
      priority: 'normal',
      category: 'SPOT_INTERACTION',
    });
  }

  async sendMessageNotification(
    roomId: string,
    senderId: string,
    receiverId: string,
    messagePreview: string,
  ) {
    const sender = await this.em.findOne(User, { id: senderId });
    
    if (!sender) return;

    await this.sendPushNotification(receiverId, {
      title: sender.username,
      body: messagePreview.substring(0, 200),
      data: {
        type: 'message_received',
        roomId,
        senderId,
      },
      priority: 'high',
      category: 'MESSAGE',
      threadId: roomId,
    });
  }

  async sendSparkNotification(sparkId: string, senderId: string, receiverId: string) {
    const sender = await this.em.findOne(User, { id: senderId });
    
    if (!sender) return;

    await this.sendPushNotification(receiverId, {
      title: '✨ New Spark!',
      body: `${sender.username} sent you a spark`,
      data: {
        type: 'spark_received',
        sparkId,
        senderId,
      },
      priority: 'high',
      category: 'SPARK',
      sound: 'spark_sound',
    });
  }

  async sendNearbySpotNotification(
    userId: string,
    spotId: string,
    spotTitle: string,
    distance: number,
  ) {
    await this.sendPushNotification(userId, {
      title: '📍 Nearby Signal Spot',
      body: `"${spotTitle}" is ${distance.toFixed(1)}km away from you`,
      data: {
        type: 'nearby_spot',
        spotId,
        distance: distance.toString(),
      },
      priority: 'normal',
      category: 'NEARBY',
    });
  }

  async sendSystemAnnouncement(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, string>,
  ) {
    await this.sendBatchNotifications(userIds, {
      title,
      body,
      data: {
        type: 'system_announcement',
        ...data,
      },
      priority: 'high',
      category: 'SYSTEM',
    });
  }
}