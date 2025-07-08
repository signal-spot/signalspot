import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

// Firebase admin을 선택적으로 import
let admin: any;
try {
  admin = require('firebase-admin');
} catch (error) {
  console.warn('Firebase admin not available, push notifications will be disabled');
  admin = null;
}

import { User } from '../entities/user.entity';
import { Spark } from '../spark/entities/spark.entity';
import { 
  Notification, 
  NotificationStatus, 
  NotificationPriority,
  NotificationType as EntityNotificationType
} from './entities/notification.entity';

export enum NotificationType {
  SPARK_DETECTED = 'spark_detected',
  SPARK_MATCHED = 'spark_matched',
  MESSAGE_RECEIVED = 'message_received',
  SIGNAL_SPOT_NEARBY = 'signal_spot_nearby',
  PROFILE_VISITED = 'profile_visited',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
}

export interface NotificationPayload {
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, string>;
  userId: string;
  priority?: 'high' | 'normal';
  sound?: string;
  icon?: string;
  imageUrl?: string;
}

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private firebaseApp: any;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // Initialize Firebase Admin SDK
      const serviceAccount = this.configService.get('firebase.serviceAccount');
      
      if (!serviceAccount) {
        this.logger.warn('Firebase service account not configured');
        return;
      }

      this.firebaseApp = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: this.configService.get('firebase.projectId'),
      });

      this.logger.log('Firebase Admin SDK initialized');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase:', error);
    }
  }

  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({ id: payload.userId });

      if (!user?.fcmToken) {
        this.logger.debug(`No FCM token for user ${payload.userId}`);
        return false;
      }

      const message: any = {
        token: user.fcmToken,
        notification: {
          title: payload.title,
          body: payload.body,
          imageUrl: payload.imageUrl,
        },
        data: {
          type: payload.type,
          userId: payload.userId,
          ...payload.data,
        },
        android: {
          priority: payload.priority === 'high' ? 'high' : 'normal',
          notification: {
            icon: payload.icon || 'ic_notification',
            sound: payload.sound || 'default',
            channelId: this.getNotificationChannelId(payload.type),
            priority: payload.priority === 'high' ? 'high' : 'default',
          },
        },
        apns: {
          payload: {
            aps: {
              alert: {
                title: payload.title,
                body: payload.body,
              },
              sound: payload.sound || 'default',
              badge: await this.getUserUnreadCount(payload.userId),
              contentAvailable: true,
              category: payload.type,
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.debug(`Notification sent successfully: ${response}`);

      // Store notification in database for history
      await this.storeNotification(payload);

      return true;
    } catch (error) {
      this.logger.error('Failed to send notification:', error);
      return false;
    }
  }

  async sendBulkNotifications(payloads: NotificationPayload[]): Promise<number> {
    const results = await Promise.allSettled(
      payloads.map(payload => this.sendNotification(payload))
    );

    const successCount = results.filter(
      result => result.status === 'fulfilled' && result.value === true
    ).length;

    this.logger.log(`Sent ${successCount}/${payloads.length} bulk notifications`);
    return successCount;
  }

  @OnEvent('spark.detected')
  async handleSparkDetected(spark: Spark): Promise<void> {
    try {
      // Send notification to both users
      const notifications: NotificationPayload[] = [
        {
          title: '✨ 새로운 스파크 발견!',
          body: `근처에서 새로운 인연의 스파크를 발견했어요!`,
          type: NotificationType.SPARK_DETECTED,
          userId: spark.user1Id,
          priority: 'high',
          data: {
            sparkId: spark.id,
            otherUserId: spark.user2Id,
            sparkType: spark.type,
            strength: spark.strength.toString(),
          },
        },
        {
          title: '✨ 새로운 스파크 발견!',
          body: `근처에서 새로운 인연의 스파크를 발견했어요!`,
          type: NotificationType.SPARK_DETECTED,
          userId: spark.user2Id,
          priority: 'high',
          data: {
            sparkId: spark.id,
            otherUserId: spark.user1Id,
            sparkType: spark.type,
            strength: spark.strength.toString(),
          },
        },
      ];

      await this.sendBulkNotifications(notifications);
    } catch (error) {
      this.logger.error('Error handling spark detected event:', error);
    }
  }

  @OnEvent('spark.matched')
  async handleSparkMatched(spark: Spark): Promise<void> {
    try {
      // Get user information
      const user1 = await this.userRepository.findOne({ id: spark.user1Id });
      const user2 = await this.userRepository.findOne({ id: spark.user2Id });
      
      if (!user1 || !user2) {
        this.logger.error('Users not found for spark matched event');
        return;
      }

      const notifications: NotificationPayload[] = [
        {
          title: '🎉 매칭 성공!',
          body: `${user2.username}님과 매칭되었어요! 메시지를 보내보세요.`,
          type: NotificationType.SPARK_MATCHED,
          userId: spark.user1Id,
          priority: 'high',
          data: {
            sparkId: spark.id,
            matchedUserId: spark.user2Id,
            matchedUsername: user2.username,
          },
        },
        {
          title: '🎉 매칭 성공!',
          body: `${user1.username}님과 매칭되었어요! 메시지를 보내보세요.`,
          type: NotificationType.SPARK_MATCHED,
          userId: spark.user2Id,
          priority: 'high',
          data: {
            sparkId: spark.id,
            matchedUserId: spark.user1Id,
            matchedUsername: user1.username,
          },
        },
      ];

      await this.sendBulkNotifications(notifications);
    } catch (error) {
      this.logger.error('Error handling spark matched event:', error);
    }
  }

  @OnEvent('message.received')
  async handleMessageReceived(data: {
    senderId: string;
    recipientId: string;
    senderUsername: string;
    messageContent: string;
    chatId: string;
  }): Promise<void> {
    try {
      const notification: NotificationPayload = {
        title: `💬 ${data.senderUsername}`,
        body: data.messageContent.length > 50 
          ? `${data.messageContent.substring(0, 50)}...` 
          : data.messageContent,
        type: NotificationType.MESSAGE_RECEIVED,
        userId: data.recipientId,
        priority: 'high',
        data: {
          senderId: data.senderId,
          senderUsername: data.senderUsername,
          chatId: data.chatId,
        },
      };

      await this.sendNotification(notification);
    } catch (error) {
      this.logger.error('Error handling message received event:', error);
    }
  }

  @OnEvent('signal-spot.nearby')
  async handleSignalSpotNearby(data: {
    userId: string;
    spotId: string;
    spotTitle: string;
    distance: number;
  }): Promise<void> {
    try {
      if (data.distance > 100) return; // Only notify for spots within 100m

      const notification: NotificationPayload = {
        title: '📍 근처 시그널 스팟',
        body: `"${data.spotTitle}" - ${Math.round(data.distance)}m 거리에 있어요`,
        type: NotificationType.SIGNAL_SPOT_NEARBY,
        userId: data.userId,
        priority: 'normal',
        data: {
          spotId: data.spotId,
          distance: data.distance.toString(),
        },
      };

      await this.sendNotification(notification);
    } catch (error) {
      this.logger.error('Error handling signal spot nearby event:', error);
    }
  }

  async updateUserFCMToken(userId: string, fcmToken: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ id: userId });
      if (user) {
        user.fcmToken = fcmToken;
        await this.em.flush();
      }
      this.logger.debug(`Updated FCM token for user ${userId}`);
    } catch (error) {
      this.logger.error('Failed to update FCM token:', error);
    }
  }

  async removeUserFCMToken(userId: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ id: userId });
      if (user) {
        user.fcmToken = null;
        await this.em.flush();
      }
      this.logger.debug(`Removed FCM token for user ${userId}`);
    } catch (error) {
      this.logger.error('Failed to remove FCM token:', error);
    }
  }

  private getNotificationChannelId(type: NotificationType): string {
    switch (type) {
      case NotificationType.SPARK_DETECTED:
      case NotificationType.SPARK_MATCHED:
        return 'sparks';
      case NotificationType.MESSAGE_RECEIVED:
        return 'messages';
      case NotificationType.SIGNAL_SPOT_NEARBY:
        return 'spots';
      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return 'system';
      default:
        return 'default';
    }
  }

  private async getUserUnreadCount(userId: string): Promise<number> {
    // TODO: Implement unread count logic
    // This could count unread messages, pending sparks, etc.
    return 0;
  }

  private async storeNotification(payload: NotificationPayload): Promise<void> {
    // TODO: Store notification in database for history/analytics
    // This could be useful for:
    // - Notification delivery tracking
    // - User notification preferences
    // - Analytics on notification effectiveness
    this.logger.debug(`Storing notification: ${payload.type} for user ${payload.userId}`);
  }

  async subscribeToTopic(userId: string, topic: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({ id: userId });

      if (!user?.fcmToken) {
        return false;
      }

      await admin.messaging().subscribeToTopic([user.fcmToken], topic);
      this.logger.debug(`User ${userId} subscribed to topic ${topic}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to subscribe to topic:', error);
      return false;
    }
  }

  async unsubscribeFromTopic(userId: string, topic: string): Promise<boolean> {
    try {
      const user = await this.userRepository.findOne({ id: userId });

      if (!user?.fcmToken) {
        return false;
      }

      await admin.messaging().unsubscribeFromTopic([user.fcmToken], topic);
      this.logger.debug(`User ${userId} unsubscribed from topic ${topic}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to unsubscribe from topic:', error);
      return false;
    }
  }

  async sendTopicNotification(
    topic: string,
    title: string,
    body: string,
    data?: Record<string, string>
  ): Promise<boolean> {
    try {
      const message: any = {
        topic,
        notification: { title, body },
        data,
        android: {
          priority: 'normal',
          notification: {
            channelId: 'system',
          },
        },
        apns: {
          payload: {
            aps: {
              alert: { title, body },
              sound: 'default',
            },
          },
        },
      };

      const response = await admin.messaging().send(message);
      this.logger.log(`Topic notification sent: ${response}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send topic notification:', error);
      return false;
    }
  }

  async onModuleInit() {
    // This method is called when the module is initialized
  }
}