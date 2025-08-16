import { Injectable, Logger } from '@nestjs/common';
import { AppWebSocketGateway } from './websocket.gateway';
import { SignalSpot } from '../entities/signal-spot.entity';
import { User } from '../entities/user.entity';
import { Message } from '../entities/message.entity';
import { Spark } from '../spark/entities/spark.entity';

export enum WebSocketEvent {
  // Signal Spot Events
  SPOT_CREATED = 'spotCreated',
  SPOT_UPDATED = 'spotUpdated',
  SPOT_EXPIRED = 'spotExpired',
  SPOT_DELETED = 'spotDeleted',
  SPOT_LIKED = 'spotLiked',
  SPOT_UNLIKED = 'spotUnliked',
  SPOT_COMMENTED = 'spotCommented',
  SPOT_VIEWED = 'spotViewed',
  
  // Chat Events
  MESSAGE_RECEIVED = 'messageReceived',
  MESSAGE_UPDATED = 'messageUpdated',
  MESSAGE_DELETED = 'messageDeleted',
  MESSAGE_READ = 'messageRead',
  USER_TYPING = 'userTyping',
  CHAT_ROOM_CREATED = 'chatRoomCreated',
  
  // Spark Events
  SPARK_SENT = 'sparkSent',
  SPARK_RECEIVED = 'sparkReceived',
  SPARK_EXPIRED = 'sparkExpired',
  
  // User Events
  USER_ONLINE = 'userOnline',
  USER_OFFLINE = 'userOffline',
  USER_LOCATION_UPDATED = 'userLocationUpdated',
  PROFILE_UPDATED = 'profileUpdated',
  
  // Notification Events
  NOTIFICATION_RECEIVED = 'notificationReceived',
  NOTIFICATION_READ = 'notificationRead',
  
  // System Events
  SYSTEM_ANNOUNCEMENT = 'systemAnnouncement',
  MAINTENANCE_NOTICE = 'maintenanceNotice',
}

export interface WebSocketNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  data?: any;
  timestamp: Date;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

@Injectable()
export class WebSocketService {
  private readonly logger = new Logger(WebSocketService.name);

  constructor(private readonly gateway: AppWebSocketGateway) {}

  // Signal Spot Events
  async notifySpotCreated(spot: SignalSpot) {
    const data = {
      id: spot.id,
      title: spot.title,
      content: spot.message,
      latitude: spot.latitude,
      longitude: spot.longitude,
      creator: {
        id: spot.creator.id,
        username: (spot.creator as any).username || 'Unknown',
        avatarUrl: (spot.creator as any).avatarUrl || null,
      },
      createdAt: spot.createdAt,
      expiresAt: spot.expiresAt,
      type: spot.type,
      visibility: spot.visibility,
    };

    // Notify location subscribers
    this.gateway.emitToLocation(
      spot.latitude,
      spot.longitude,
      WebSocketEvent.SPOT_CREATED,
      data
    );

    this.logger.log(`Notified spot creation: ${spot.id}`);
  }

  async notifySpotUpdated(spot: SignalSpot) {
    const data = {
      id: spot.id,
      title: spot.title,
      content: spot.message,
      updatedAt: spot.updatedAt,
      likeCount: spot.likeCount,
      replyCount: spot.replyCount,
      viewCount: spot.viewCount,
    };

    // Notify spot subscribers
    this.gateway.emitToSpot(spot.id, WebSocketEvent.SPOT_UPDATED, data);
    
    // Also notify location subscribers
    this.gateway.emitToLocation(
      spot.latitude,
      spot.longitude,
      WebSocketEvent.SPOT_UPDATED,
      data
    );

    this.logger.log(`Notified spot update: ${spot.id}`);
  }

  async notifySpotLiked(spot: SignalSpot, user: User) {
    const data = {
      spotId: spot.id,
      userId: user.id,
      username: user.username,
      likeCount: spot.likeCount,
      timestamp: new Date().toISOString(),
    };

    // Notify spot subscribers
    this.gateway.emitToSpot(spot.id, WebSocketEvent.SPOT_LIKED, data);
    
    // Notify the spot creator
    const creatorId = typeof spot.creator === 'string' ? spot.creator : spot.creator.id;
    if (creatorId !== user.id) {
      this.sendNotificationToUser(creatorId, {
        id: `like_${spot.id}_${user.id}_${Date.now()}`,
        type: 'spot_liked',
        title: 'Your Signal Spot was liked!',
        message: `${user.username} liked your spot "${spot.title}"`,
        data: { spotId: spot.id, userId: user.id },
        timestamp: new Date(),
        priority: 'normal',
      });
    }

    this.logger.log(`Notified spot liked: ${spot.id} by ${user.id}`);
  }

  async notifySpotCommented(spot: SignalSpot, comment: any, user: User) {
    const data = {
      spotId: spot.id,
      comment: {
        id: comment.id,
        content: comment.content,
        author: {
          id: user.id,
          username: user.username,
          avatarUrl: user.avatarUrl,
        },
        createdAt: comment.createdAt,
      },
      replyCount: spot.replyCount,
      timestamp: new Date().toISOString(),
    };

    // Notify spot subscribers
    this.gateway.emitToSpot(spot.id, WebSocketEvent.SPOT_COMMENTED, data);
    
    // Notify the spot creator
    const creatorId = typeof spot.creator === 'string' ? spot.creator : spot.creator.id;
    if (creatorId !== user.id) {
      this.sendNotificationToUser(creatorId, {
        id: `comment_${spot.id}_${comment.id}_${Date.now()}`,
        type: 'spot_commented',
        title: 'New comment on your Signal Spot',
        message: `${user.username} commented: "${comment.content.substring(0, 50)}${comment.content.length > 50 ? '...' : ''}"`,
        data: { spotId: spot.id, commentId: comment.id, userId: user.id },
        timestamp: new Date(),
        priority: 'normal',
      });
    }

    this.logger.log(`Notified spot commented: ${spot.id} by ${user.id}`);
  }

  async notifySpotExpired(spot: SignalSpot) {
    const data = {
      id: spot.id,
      title: spot.title,
      expiredAt: new Date().toISOString(),
    };

    // Notify spot subscribers
    this.gateway.emitToSpot(spot.id, WebSocketEvent.SPOT_EXPIRED, data);
    
    // Notify location subscribers
    this.gateway.emitToLocation(
      spot.latitude,
      spot.longitude,
      WebSocketEvent.SPOT_EXPIRED,
      data
    );

    this.logger.log(`Notified spot expired: ${spot.id}`);
  }

  // Chat Events
  async notifyChatMessage(message: Message, roomId: string) {
    const data = {
      id: message.id,
      content: message.content,
      sender: {
        id: typeof message.sender === 'string' ? message.sender : message.sender.id,
        username: (message.sender as any).username || 'Unknown',
        avatarUrl: (message.sender as any).avatarUrl || null,
      },
      roomId,
      createdAt: message.createdAt,
      isEdited: message.isEdited,
    };

    // Notify chat room subscribers
    this.gateway.emitToChatRoom(roomId, WebSocketEvent.MESSAGE_RECEIVED, data);

    this.logger.log(`Notified chat message in room: ${roomId}`);
  }

  async notifyChatRoomCreated(chatRoom: any) {
    const data = {
      id: chatRoom.id,
      name: chatRoom.name,
      type: chatRoom.type,
      sparkId: chatRoom.sparkId,
      initiatedBy: chatRoom.initiatedBy,
      participant1: {
        id: typeof chatRoom.participant1 === 'string' ? chatRoom.participant1 : chatRoom.participant1.id,
        username: (chatRoom.participant1 as any).username || 'Unknown',
        avatarUrl: (chatRoom.participant1 as any).avatarUrl || null,
      },
      participant2: {
        id: typeof chatRoom.participant2 === 'string' ? chatRoom.participant2 : chatRoom.participant2.id,
        username: (chatRoom.participant2 as any).username || 'Unknown',
        avatarUrl: (chatRoom.participant2 as any).avatarUrl || null,
      },
      createdAt: chatRoom.createdAt,
    };

    // 양쪽 참가자에게 알림
    const participant1Id = typeof chatRoom.participant1 === 'string' ? chatRoom.participant1 : chatRoom.participant1.id;
    const participant2Id = typeof chatRoom.participant2 === 'string' ? chatRoom.participant2 : chatRoom.participant2.id;
    
    await this.sendNotificationToUser(participant1Id, {
      id: `chat_room_${chatRoom.id}_${Date.now()}`,
      type: 'chat_room_created',
      title: 'New Chat Room',
      message: `${(chatRoom.participant2 as any).username || 'Someone'}님과의 채팅방이 생성되었습니다.`,
      data,
      timestamp: new Date(),
      priority: 'normal',
    });

    await this.sendNotificationToUser(participant2Id, {
      id: `chat_room_${chatRoom.id}_${Date.now()}`,
      type: 'chat_room_created',
      title: 'New Chat Room',
      message: `${(chatRoom.participant1 as any).username || 'Someone'}님과의 채팅방이 생성되었습니다.`,
      data,
      timestamp: new Date(),
      priority: 'normal',
    });

    this.logger.log(`Notified chat room creation for spark: ${chatRoom.sparkId}`);
  }

  async notifyMessageRead(messageId: string, userId: string, roomId: string) {
    const data = {
      messageId,
      userId,
      roomId,
      readAt: new Date().toISOString(),
    };

    // Notify chat room subscribers
    this.gateway.emitToChatRoom(roomId, WebSocketEvent.MESSAGE_READ, data);

    this.logger.log(`Notified message read: ${messageId} by ${userId}`);
  }

  // Spark Events
  async notifySparkSent(spark: Spark) {
    const senderData = {
      sparkId: spark.id,
      receiver: {
        id: typeof spark.receiver === 'string' ? spark.receiver : spark.receiver.id,
        username: (spark.receiver as any).username || 'Unknown',
      },
      message: spark.message,
      expiresAt: spark.expiresAt,
      timestamp: new Date().toISOString(),
    };

    // Notify sender
    const senderId = typeof spark.sender === 'string' ? spark.sender : spark.sender.id;
    this.gateway.emitToUser(senderId, WebSocketEvent.SPARK_SENT, senderData);

    const receiverData = {
      sparkId: spark.id,
      sender: {
        id: typeof spark.sender === 'string' ? spark.sender : spark.sender.id,
        username: (spark.sender as any).username || 'Unknown',
        avatarUrl: (spark.sender as any).avatarUrl || null,
      },
      message: spark.message,
      expiresAt: spark.expiresAt,
      timestamp: new Date().toISOString(),
    };

    // Notify receiver
    const receiverId = typeof spark.receiver === 'string' ? spark.receiver : spark.receiver.id;
    this.gateway.emitToUser(receiverId, WebSocketEvent.SPARK_RECEIVED, receiverData);

    // Send push notification to receiver
    this.sendNotificationToUser(receiverId, {
      id: `spark_${spark.id}_${Date.now()}`,
      type: 'spark_received',
      title: '✨ New Spark!',
      message: `${(spark.sender as any).username || 'Someone'} sent you a spark`,
      data: { sparkId: spark.id, senderId: senderId },
      timestamp: new Date(),
      priority: 'high',
    });

    this.logger.log(`Notified spark sent: ${spark.id}`);
  }

  // User Events
  async notifyUserLocationUpdate(user: User, latitude: number, longitude: number) {
    const data = {
      userId: user.id,
      username: user.username,
      latitude,
      longitude,
      timestamp: new Date().toISOString(),
    };

    // Notify nearby users (simplified - in production, implement proper geofencing)
    this.gateway.emitToLocation(
      latitude,
      longitude,
      WebSocketEvent.USER_LOCATION_UPDATED,
      data
    );

    this.logger.log(`Notified user location update: ${user.id}`);
  }

  async notifyProfileUpdate(user: User) {
    const data = {
      userId: user.id,
      username: user.username,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      updatedAt: user.updatedAt,
    };

    // Notify the user's connections/followers
    this.gateway.emitToUser(user.id, WebSocketEvent.PROFILE_UPDATED, data);

    this.logger.log(`Notified profile update: ${user.id}`);
  }

  // Notification Events
  async sendNotificationToUser(userId: string, notification: WebSocketNotification) {
    this.gateway.emitToUser(userId, WebSocketEvent.NOTIFICATION_RECEIVED, notification);
    this.logger.log(`Sent notification to user: ${userId}`);
  }

  async markNotificationAsRead(userId: string, notificationId: string) {
    const data = {
      notificationId,
      readAt: new Date().toISOString(),
    };

    this.gateway.emitToUser(userId, WebSocketEvent.NOTIFICATION_READ, data);
    this.logger.log(`Marked notification as read: ${notificationId} for user: ${userId}`);
  }

  // System Events
  async broadcastSystemAnnouncement(title: string, message: string, priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal') {
    const data = {
      id: `announcement_${Date.now()}`,
      title,
      message,
      priority,
      timestamp: new Date().toISOString(),
    };

    this.gateway.broadcast(WebSocketEvent.SYSTEM_ANNOUNCEMENT, data);
    this.logger.log(`Broadcast system announcement: ${title}`);
  }

  async broadcastMaintenanceNotice(startTime: Date, duration: number, message: string) {
    const data = {
      id: `maintenance_${Date.now()}`,
      startTime: startTime.toISOString(),
      endTime: new Date(startTime.getTime() + duration * 60 * 1000).toISOString(),
      duration,
      message,
      timestamp: new Date().toISOString(),
    };

    this.gateway.broadcast(WebSocketEvent.MAINTENANCE_NOTICE, data);
    this.logger.log(`Broadcast maintenance notice: ${message}`);
  }

  // Utility Methods
  isUserOnline(userId: string): boolean {
    return this.gateway.isUserOnline(userId);
  }

  getOnlineUsersCount(): number {
    return this.gateway.getOnlineUsersCount();
  }

  getOnlineUserIds(): string[] {
    return this.gateway.getOnlineUserIds();
  }
}