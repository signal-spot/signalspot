import { Injectable, OnModuleInit } from '@nestjs/common';
import { LoggerService } from '../common/services/logger.service';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { ConfigService } from '@nestjs/config';

// Firebase admin을 선택적으로 import
let admin: any;
try {
  admin = require('firebase-admin');
} catch (error) {
  const tempLogger = new LoggerService();
  tempLogger.warn('Firebase admin not available, push notifications will be disabled', 'NotificationService');
  admin = null;
}

import { User } from '../entities/user.entity';
import { Spark } from '../spark/entities/spark.entity';
import { 
  Notification, 
  NotificationStatus, 
  NotificationPriority,
  NotificationType
} from './entities/notification.entity';


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
  private firebaseApp: any;

  constructor(
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly configService: ConfigService,
    private readonly eventEmitter: EventEmitter2,
    private readonly logger: LoggerService,
  ) {
    // Initialize Firebase in onModuleInit instead
  }

  private initializeFirebase() {
    try {
      this.logger.debug('Starting Firebase initialization...', 'NotificationService');
      
      // Check if Firebase Admin is available
      if (!admin) {
        this.logger.warn('Firebase Admin SDK not available - module not installed', 'NotificationService');
        return;
      }
      this.logger.debug('Firebase Admin SDK module is available', 'NotificationService');

      // Check if already initialized
      if (admin.apps.length > 0) {
        this.firebaseApp = admin.app();
        this.logger.log('Firebase Admin SDK already initialized', 'NotificationService');
        this.logger.debug(`Existing Firebase app project ID: ${this.firebaseApp.options?.projectId}`, 'NotificationService');
        return;
      }
      this.logger.debug('No existing Firebase apps found, proceeding with initialization', 'NotificationService');

      // Initialize Firebase Admin SDK
      const serviceAccount = this.configService.get('firebase.serviceAccount');
      this.logger.debug(`Service account from config: ${serviceAccount ? 'Found' : 'Not found'}`, 'NotificationService');
      
      if (!serviceAccount) {
        this.logger.warn('Firebase service account not configured - firebase.serviceAccount is null', 'NotificationService');
        this.logger.debug('Checking firebase config structure...', 'NotificationService');
        const firebaseConfig = this.configService.get('firebase');
        this.logger.debug(`Firebase config keys: ${firebaseConfig ? Object.keys(firebaseConfig).join(', ') : 'config is null'}`, 'NotificationService');
        return;
      }

      // Validate service account has required properties
      this.logger.debug('Validating service account properties...', 'NotificationService');
      this.logger.debug(`Service account keys: ${Object.keys(serviceAccount).join(', ')}`, 'NotificationService');
      
      if (!serviceAccount.private_key || typeof serviceAccount.private_key !== 'string') {
        this.logger.error('Invalid Firebase service account: missing or invalid private_key', null, 'NotificationService');
        this.logger.error(`private_key exists: ${!!serviceAccount.private_key}, type: ${typeof serviceAccount.private_key}`, null, 'NotificationService');
        this.logger.error(`private_key length: ${serviceAccount.private_key ? serviceAccount.private_key.length : 0}`, null, 'NotificationService');
        
        // Check if it's an empty string or placeholder
        if (serviceAccount.private_key === '') {
          this.logger.error('private_key is an empty string', null, 'NotificationService');
        } else if (serviceAccount.private_key && !serviceAccount.private_key.includes('-----BEGIN')) {
          this.logger.error('private_key does not contain valid PEM format', null, 'NotificationService');
          this.logger.error(`private_key first 50 chars: ${serviceAccount.private_key.substring(0, 50)}`, null, 'NotificationService');
        }
        return;
      }
      this.logger.debug('private_key validation passed', 'NotificationService');

      if (!serviceAccount.client_email || typeof serviceAccount.client_email !== 'string') {
        this.logger.error('Invalid Firebase service account: missing or invalid client_email', null, 'NotificationService');
        this.logger.error(`client_email: ${serviceAccount.client_email}`, null, 'NotificationService');
        return;
      }
      this.logger.debug(`client_email: ${serviceAccount.client_email}`, 'NotificationService');

      if (!serviceAccount.project_id || typeof serviceAccount.project_id !== 'string') {
        this.logger.error('Invalid Firebase service account: missing or invalid project_id', null, 'NotificationService');
        this.logger.error(`project_id: ${serviceAccount.project_id}`, null, 'NotificationService');
        return;
      }
      this.logger.debug(`project_id: ${serviceAccount.project_id}`, 'NotificationService');

      // Initialize with validated service account
      this.logger.debug('Attempting to initialize Firebase Admin SDK...', 'NotificationService');
      this.logger.debug('Creating credential with service account...', 'NotificationService');
      
      const credential = admin.credential.cert({
        projectId: serviceAccount.project_id,
        clientEmail: serviceAccount.client_email,
        privateKey: serviceAccount.private_key.replace(/\\n/g, '\n'), // Handle escaped newlines
      });
      
      this.logger.debug('Credential created successfully', 'NotificationService');
      
      this.firebaseApp = admin.initializeApp({
        credential: credential,
        projectId: serviceAccount.project_id,
      });

      this.logger.log('Firebase Admin SDK initialized successfully', 'NotificationService');
      this.logger.debug(`Firebase app initialized with project ID: ${this.firebaseApp.options?.projectId}`, 'NotificationService');
      this.logger.debug(`Firebase app name: ${this.firebaseApp.name}`, 'NotificationService');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error.message, 'NotificationService');
      this.logger.error(`Error type: ${error.constructor.name}`, null, 'NotificationService');
      this.logger.error(`Error code: ${error.code || 'N/A'}`, null, 'NotificationService');
      this.logger.error(`Full error: ${JSON.stringify(error, null, 2)}`, null, 'NotificationService');
      this.logger.error(error.stack, null, 'NotificationService');
      
      // Don't throw in production to prevent app crash
      if (process.env.NODE_ENV === 'production') {
        this.logger.error('Firebase initialization failed in production - push notifications disabled', null, 'NotificationService');
      } else {
        throw new Error('Firebase Admin SDK initialization failed. Push notifications are required.');
      }
    }
  }

  async sendNotification(payload: NotificationPayload): Promise<boolean> {
    try {
      this.logger.debug('=== sendNotification START ===', 'NotificationService');
      this.logger.debug(`Payload type: ${payload.type}`, 'NotificationService');
      this.logger.debug(`User ID: ${payload.userId}`, 'NotificationService');
      this.logger.debug(`Title: ${payload.title}`, 'NotificationService');
      this.logger.debug(`Body: ${payload.body}`, 'NotificationService');
      this.logger.debug(`Priority: ${payload.priority || 'normal'}`, 'NotificationService');
      this.logger.debug(`Data: ${JSON.stringify(payload.data)}`, 'NotificationService');
      
      // Check if Firebase Admin is available
      if (!admin) {
        this.logger.warn('Firebase Admin SDK module not available, skipping notification', 'NotificationService');
        return false;
      }
      
      if (!this.firebaseApp) {
        this.logger.warn('Firebase app not initialized, skipping notification', 'NotificationService');
        this.logger.debug('Attempting to re-initialize Firebase...', 'NotificationService');
        this.initializeFirebase();
        
        if (!this.firebaseApp) {
          this.logger.error('Failed to re-initialize Firebase', null, 'NotificationService');
          return false;
        }
      }
      
      this.logger.debug('Firebase Admin SDK is ready for sending', 'NotificationService');

      this.logger.debug(`Fetching user with ID: ${payload.userId}`, 'NotificationService');
      const user = await this.userRepository.findOne({ id: payload.userId });

      if (!user) {
        this.logger.warn(`User not found: ${payload.userId}`, 'NotificationService');
        return false;
      }
      
      this.logger.debug(`User found: ${user.username || user.email}`, 'NotificationService');
      
      if (!user.fcmToken) {
        this.logger.debug(`No FCM token for user ${payload.userId} (${user.username || user.email})`, 'NotificationService');
        return false;
      }
      
      this.logger.debug(`FCM token found for user: ${user.fcmToken.substring(0, 20)}...`, 'NotificationService');

      const unreadCount = await this.getUserUnreadCount(payload.userId);
      this.logger.debug(`User unread count: ${unreadCount}`, 'NotificationService');
      
      const channelId = this.getNotificationChannelId(payload.type);
      this.logger.debug(`Notification channel ID: ${channelId}`, 'NotificationService');
      
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
            channelId: channelId,
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
              badge: unreadCount,
              contentAvailable: true,
              category: payload.type,
            },
          },
        },
      };
      
      this.logger.debug('FCM message object created', 'NotificationService');
      this.logger.debug(`Message structure: ${JSON.stringify({
        hasToken: !!message.token,
        hasNotification: !!message.notification,
        hasData: !!message.data,
        hasAndroid: !!message.android,
        hasApns: !!message.apns,
      })}`, 'NotificationService');

      this.logger.debug('Sending FCM message...', 'NotificationService');
      
      try {
        const response = await admin.messaging().send(message);
        this.logger.log(`✅ Notification sent successfully`, 'NotificationService');
        this.logger.debug(`FCM response: ${response}`, 'NotificationService');
        this.logger.debug(`Message ID: ${response}`, 'NotificationService');

        // Store notification in database for history
        this.logger.debug('Storing notification in database...', 'NotificationService');
        await this.storeNotification(payload);
        this.logger.debug('Notification stored in database', 'NotificationService');
        
        this.logger.debug('=== sendNotification SUCCESS ===', 'NotificationService');
        return true;
      } catch (fcmError) {
        this.logger.error('FCM send failed', fcmError.stack, 'NotificationService');
        this.logger.error(`FCM error code: ${fcmError.code || 'N/A'}`, null, 'NotificationService');
        this.logger.error(`FCM error message: ${fcmError.message}`, null, 'NotificationService');
        
        // Check for specific FCM errors
        if (fcmError.code === 'messaging/invalid-registration-token' || 
            fcmError.code === 'messaging/registration-token-not-registered') {
          this.logger.warn(`Invalid FCM token for user ${payload.userId}, removing token`, 'NotificationService');
          await this.removeUserFCMToken(payload.userId);
        } else if (fcmError.code === 'messaging/invalid-argument') {
          this.logger.error(`Invalid message format: ${JSON.stringify(message)}`, null, 'NotificationService');
        } else if (fcmError.code === 'messaging/authentication-error') {
          this.logger.error('Firebase authentication error - check service account credentials', null, 'NotificationService');
        }
        
        throw fcmError;
      }
    } catch (error) {
      this.logger.error('❌ Failed to send notification', error.stack, 'NotificationService');
      this.logger.error(`Error type: ${error.constructor.name}`, null, 'NotificationService');
      this.logger.error(`Error message: ${error.message}`, null, 'NotificationService');
      this.logger.error(`Full error: ${JSON.stringify(error, Object.getOwnPropertyNames(error), 2)}`, null, 'NotificationService');
      this.logger.debug('=== sendNotification FAILED ===', 'NotificationService');
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

    this.logger.log(`Sent ${successCount}/${payloads.length} bulk notifications`, 'NotificationService');
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
          userId: spark.user1.id,
          priority: 'high',
          data: {
            sparkId: spark.id,
            otherUserId: spark.user2.id,
            sparkType: spark.type,
            strength: spark.strength.toString(),
          },
        },
        {
          title: '✨ 새로운 스파크 발견!',
          body: `근처에서 새로운 인연의 스파크를 발견했어요!`,
          type: NotificationType.SPARK_DETECTED,
          userId: spark.user2.id,
          priority: 'high',
          data: {
            sparkId: spark.id,
            otherUserId: spark.user1.id,
            sparkType: spark.type,
            strength: spark.strength.toString(),
          },
        },
      ];

      await this.sendBulkNotifications(notifications);
    } catch (error) {
      this.logger.error('Error handling spark detected event', error.stack, 'NotificationService');
    }
  }

  @OnEvent('spark.matched')
  async handleSparkMatched(spark: Spark): Promise<void> {
    try {
      // Get user information
      const user1 = await this.userRepository.findOne({ id: spark.user1.id });
      const user2 = await this.userRepository.findOne({ id: spark.user2.id });
      
      if (!user1 || !user2) {
        this.logger.error('Users not found for spark matched event', null, 'NotificationService');
        return;
      }

      const notifications: NotificationPayload[] = [
        {
          title: '🎉 매칭 성공!',
          body: `${user2.username}님과 매칭되었어요! 메시지를 보내보세요.`,
          type: NotificationType.SPARK_MATCHED,
          userId: spark.user1.id,
          priority: 'high',
          data: {
            sparkId: spark.id,
            matchedUserId: spark.user2.id,
            matchedUsername: user2.username,
          },
        },
        {
          title: '🎉 매칭 성공!',
          body: `${user1.username}님과 매칭되었어요! 메시지를 보내보세요.`,
          type: NotificationType.SPARK_MATCHED,
          userId: spark.user2.id,
          priority: 'high',
          data: {
            sparkId: spark.id,
            matchedUserId: spark.user1.id,
            matchedUsername: user1.username,
          },
        },
      ];

      await this.sendBulkNotifications(notifications);
    } catch (error) {
      this.logger.error('Error handling spark matched event', error.stack, 'NotificationService');
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
      this.logger.error('Error handling message received event', error.stack, 'NotificationService');
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
      this.logger.error('Error handling signal spot nearby event', error.stack, 'NotificationService');
    }
  }

  @OnEvent('signal-spot.liked')
  async handleSignalSpotLiked(data: {
    spotId: string;
    spotCreatorId: string;
    likerUserId: string;
    likerUsername: string;
    spotTitle?: string;
  }): Promise<void> {
    try {
      // Don't notify if user liked their own spot
      if (data.spotCreatorId === data.likerUserId) {
        return;
      }

      const notification: NotificationPayload = {
        title: '❤️ 새로운 좋아요',
        body: `${data.likerUsername}님이 내 쪽지에 좋아요를 보냈습니다`,
        type: NotificationType.SPOT_LIKED,
        userId: data.spotCreatorId,
        priority: 'normal',
        data: {
          spotId: data.spotId,
          likerId: data.likerUserId,
          likerUsername: data.likerUsername,
        },
      };

      await this.sendNotification(notification);
    } catch (error) {
      this.logger.error('Error handling spot liked event', error.stack, 'NotificationService');
    }
  }

  @OnEvent('signal-spot.commented')
  async handleSignalSpotCommented(data: {
    spotId: string;
    spotCreatorId: string;
    commenterId: string;
    commenterUsername: string;
    commentContent: string;
    spotTitle?: string;
  }): Promise<void> {
    try {
      // Don't notify if user commented on their own spot
      if (data.spotCreatorId === data.commenterId) {
        return;
      }

      const notification: NotificationPayload = {
        title: '💬 새로운 댓글',
        body: `${data.commenterUsername}님이 내 쪽지에 댓글을 달았습니다`,
        type: NotificationType.SPOT_COMMENTED,
        userId: data.spotCreatorId,
        priority: 'high',
        data: {
          spotId: data.spotId,
          commenterId: data.commenterId,
          commenterUsername: data.commenterUsername,
        },
      };

      await this.sendNotification(notification);
    } catch (error) {
      this.logger.error('Error handling spot commented event', error.stack, 'NotificationService');
    }
  }

  @OnEvent('comment.liked')
  async handleCommentLiked(data: {
    commentId: string;
    commentAuthorId: string;
    likerUserId: string;
    likerUsername: string;
    commentContent: string;
  }): Promise<void> {
    try {
      // Don't notify if user liked their own comment
      if (data.commentAuthorId === data.likerUserId) {
        return;
      }

      const notification: NotificationPayload = {
        title: '👍 댓글 좋아요',
        body: `${data.likerUsername}님이 회원님의 댓글을 좋아합니다`,
        type: NotificationType.COMMENT_LIKED,
        userId: data.commentAuthorId,
        priority: 'normal',
        data: {
          commentId: data.commentId,
          likerId: data.likerUserId,
          likerUsername: data.likerUsername,
        },
      };

      await this.sendNotification(notification);
    } catch (error) {
      this.logger.error('Error handling comment liked event', error.stack, 'NotificationService');
    }
  }

  @OnEvent('comment.replied')
  async handleCommentReplied(data: {
    parentCommentId: string;
    parentCommentAuthorId: string;
    replierId: string;
    replierUsername: string;
    replyContent: string;
  }): Promise<void> {
    try {
      // Don't notify if user replied to their own comment
      if (data.parentCommentAuthorId === data.replierId) {
        return;
      }

      const notification: NotificationPayload = {
        title: '↩️ 댓글 답글',
        body: `${data.replierUsername}: ${data.replyContent.length > 50 
          ? data.replyContent.substring(0, 50) + '...' 
          : data.replyContent}`,
        type: NotificationType.COMMENT_REPLIED,
        userId: data.parentCommentAuthorId,
        priority: 'high',
        data: {
          parentCommentId: data.parentCommentId,
          replierId: data.replierId,
          replierUsername: data.replierUsername,
        },
      };

      await this.sendNotification(notification);
    } catch (error) {
      this.logger.error('Error handling comment replied event', error.stack, 'NotificationService');
    }
  }

  async updateUserFCMToken(userId: string, fcmToken: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ id: userId });
      if (user) {
        user.fcmToken = fcmToken;
        await this.em.flush();
      }
      this.logger.debug(`Updated FCM token for user ${userId}`, 'NotificationService');
    } catch (error) {
      this.logger.error('Failed to update FCM token', error.stack, 'NotificationService');
    }
  }

  async removeUserFCMToken(userId: string): Promise<void> {
    try {
      const user = await this.userRepository.findOne({ id: userId });
      if (user) {
        user.fcmToken = null;
        await this.em.flush();
      }
      this.logger.debug(`Removed FCM token for user ${userId}`, 'NotificationService');
    } catch (error) {
      this.logger.error('Failed to remove FCM token', error.stack, 'NotificationService');
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
      case NotificationType.SPOT_LIKED:
      case NotificationType.SPOT_COMMENTED:
        return 'spots';
      case NotificationType.COMMENT_LIKED:
      case NotificationType.COMMENT_REPLIED:
        return 'comments';
      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return 'system';
      default:
        return 'default';
    }
  }

  private async getUserUnreadCount(userId: string): Promise<number> {
    try {
      const count = await this.em.count(Notification, {
        user: userId,
        status: { $in: [NotificationStatus.DELIVERED, NotificationStatus.PENDING] },
        readAt: null
      });
      
      return count;
    } catch (error) {
      this.logger.error('Failed to get unread count', error.stack, 'NotificationService');
      return 0;
    }
  }

  private async storeNotification(payload: NotificationPayload): Promise<void> {
    try {
      this.logger.debug(`Attempting to store notification: ${JSON.stringify(payload)}`, 'NotificationService');
      
      const user = await this.userRepository.findOne({ id: payload.userId });
      if (!user) {
        this.logger.warn(`User not found for notification storage: ${payload.userId}`, 'NotificationService');
        return;
      }
      
      this.logger.debug(`Found user for notification: ${user.id}`, 'NotificationService');

      // Use the constructor with required parameters
      const notification = new Notification({
        user: user,
        title: payload.title,
        body: payload.body,
        type: payload.type as NotificationType,
        priority: payload.priority === 'high' 
          ? NotificationPriority.HIGH 
          : NotificationPriority.NORMAL,
        data: payload.data || {},
      });
      
      // Set additional properties
      notification.status = NotificationStatus.DELIVERED;
      notification.deliveredAt = new Date();
      
      this.logger.debug(`Created notification entity, attempting to persist...`, 'NotificationService');
      
      await this.em.persistAndFlush(notification);
      
      this.logger.debug(`Successfully stored notification: ${payload.type} for user ${payload.userId}`, 'NotificationService');
    } catch (error) {
      this.logger.error('Failed to store notification', error.stack, 'NotificationService');
      this.logger.error(`Error details: ${error.message}`, null, 'NotificationService');
      // Don't throw - notification storage failure shouldn't prevent notification delivery
    }
  }

  async subscribeToTopic(userId: string, topic: string): Promise<boolean> {
    try {
      // Check if Firebase Admin is available
      if (!admin || !this.firebaseApp) {
        this.logger.warn('Firebase Admin SDK not initialized, skipping topic subscription', 'NotificationService');
        return false;
      }

      const user = await this.userRepository.findOne({ id: userId });

      if (!user?.fcmToken) {
        return false;
      }

      await admin.messaging().subscribeToTopic([user.fcmToken], topic);
      this.logger.debug(`User ${userId} subscribed to topic ${topic}`, 'NotificationService');
      return true;
    } catch (error) {
      this.logger.error('Failed to subscribe to topic', error.stack, 'NotificationService');
      return false;
    }
  }

  async unsubscribeFromTopic(userId: string, topic: string): Promise<boolean> {
    try {
      // Check if Firebase Admin is available
      if (!admin || !this.firebaseApp) {
        this.logger.warn('Firebase Admin SDK not initialized, skipping topic unsubscription', 'NotificationService');
        return false;
      }

      const user = await this.userRepository.findOne({ id: userId });

      if (!user?.fcmToken) {
        return false;
      }

      await admin.messaging().unsubscribeFromTopic([user.fcmToken], topic);
      this.logger.debug(`User ${userId} unsubscribed from topic ${topic}`, 'NotificationService');
      return true;
    } catch (error) {
      this.logger.error('Failed to unsubscribe from topic', error.stack, 'NotificationService');
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
      // Check if Firebase Admin is available
      if (!admin || !this.firebaseApp) {
        this.logger.warn('Firebase Admin SDK not initialized, skipping topic notification', 'NotificationService');
        return false;
      }

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
      this.logger.log(`Topic notification sent: ${response}`, 'NotificationService');
      return true;
    } catch (error) {
      this.logger.error('Failed to send topic notification', error.stack, 'NotificationService');
      return false;
    }
  }

  async getUserNotifications(
    userId: string,
    options: {
      limit?: number;
      offset?: number;
      unreadOnly?: boolean;
      type?: NotificationType;
    } = {}
  ): Promise<{ notifications: Notification[]; totalCount: number; unreadCount: number }> {
    try {
      const where: any = { user: userId };
      
      if (options.unreadOnly) {
        where.readAt = null;
      }
      
      if (options.type) {
        where.type = options.type;
      }
      
      const [notifications, totalCount] = await this.em.findAndCount(
        Notification,
        where,
        {
          orderBy: { createdAt: 'DESC' },
          limit: options.limit || 20,
          offset: options.offset || 0
        }
      );
      
      const unreadCount = await this.getUserUnreadCount(userId);
      
      return { notifications, totalCount, unreadCount };
    } catch (error) {
      this.logger.error('Failed to get user notifications', error.stack, 'NotificationService');
      return { notifications: [], totalCount: 0, unreadCount: 0 };
    }
  }

  async markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
    try {
      const notification = await this.em.findOne(Notification, {
        id: notificationId,
        user: userId
      });
      
      if (!notification) {
        return false;
      }
      
      notification.readAt = new Date();
      notification.status = NotificationStatus.READ;
      await this.em.flush();
      
      this.logger.debug(`Marked notification ${notificationId} as read`, 'NotificationService');
      return true;
    } catch (error) {
      this.logger.error('Failed to mark notification as read', error.stack, 'NotificationService');
      return false;
    }
  }

  async markAllNotificationsAsRead(userId: string): Promise<number> {
    try {
      const result = await this.em.nativeUpdate(
        Notification,
        {
          user: userId,
          readAt: null
        },
        {
          readAt: new Date(),
          status: NotificationStatus.READ
        }
      );
      
      this.logger.debug(`Marked ${result} notifications as read for user ${userId}`, 'NotificationService');
      return result;
    } catch (error) {
      this.logger.error('Failed to mark all notifications as read', error.stack, 'NotificationService');
      return 0;
    }
  }

  async deleteNotification(notificationId: string, userId: string): Promise<boolean> {
    try {
      const notification = await this.em.findOne(Notification, {
        id: notificationId,
        user: userId
      });
      
      if (!notification) {
        return false;
      }
      
      await this.em.removeAndFlush(notification);
      
      this.logger.debug(`Deleted notification ${notificationId}`, 'NotificationService');
      return true;
    } catch (error) {
      this.logger.error('Failed to delete notification', error.stack, 'NotificationService');
      return false;
    }
  }

  async clearOldNotifications(daysToKeep = 30): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
      
      const result = await this.em.nativeDelete(Notification, {
        createdAt: { $lt: cutoffDate }
      });
      
      this.logger.log(`Cleared ${result} old notifications`, 'NotificationService');
      return result;
    } catch (error) {
      this.logger.error('Failed to clear old notifications', error.stack, 'NotificationService');
      return 0;
    }
  }

  async onModuleInit() {
    // Initialize Firebase when the module is ready
    this.logger.log('Initializing NotificationService...', 'NotificationService');
    
    // Debug: Log environment variables
    this.logger.debug(`NODE_ENV: ${process.env.NODE_ENV}`, 'NotificationService');
    this.logger.debug(`Current working directory: ${process.cwd()}`, 'NotificationService');
    this.logger.debug(`FIREBASE_SERVICE_ACCOUNT_FILE: ${process.env.FIREBASE_SERVICE_ACCOUNT_FILE}`, 'NotificationService');
    this.logger.debug(`FIREBASE_SERVICE_ACCOUNT_PATH: ${process.env.FIREBASE_SERVICE_ACCOUNT_PATH}`, 'NotificationService');
    this.logger.debug(`FIREBASE_PROJECT_ID: ${process.env.FIREBASE_PROJECT_ID}`, 'NotificationService');
    this.logger.debug(`ENABLE_PUSH_NOTIFICATIONS: ${process.env.ENABLE_PUSH_NOTIFICATIONS}`, 'NotificationService');
    
    // Check if Firebase config exists
    const firebaseConfig = this.configService.get('firebase');
    this.logger.debug(`Firebase config exists: ${!!firebaseConfig}`, 'NotificationService');
    if (firebaseConfig) {
      this.logger.debug(`Firebase config.enabled: ${firebaseConfig.enabled}`, 'NotificationService');
      this.logger.debug(`Firebase config.projectId: ${firebaseConfig.projectId}`, 'NotificationService');
      this.logger.debug(`Firebase config.serviceAccount exists: ${!!firebaseConfig.serviceAccount}`, 'NotificationService');
    }
    
    this.initializeFirebase();
  }
}

// Re-export NotificationType for backward compatibility
export { NotificationType } from './entities/notification.entity';