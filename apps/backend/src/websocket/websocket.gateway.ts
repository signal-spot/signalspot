import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from '../entities/user.entity';
import { ChatService } from '../chat/chat.service';
import { NotificationService } from '../notification/notification.service';
import { PresenceService } from './presence.service';

interface AuthenticatedSocket extends Socket {
  user?: User;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true,
  },
  namespace: '/',
})
export class WebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(WebSocketGateway.name);

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private notificationService: NotificationService,
    private presenceService: PresenceService,
  ) {}

  afterInit(server: Server) {
    this.logger.log('WebSocket Gateway initialized');
  }

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn(`Client ${client.id} attempted to connect without token`);
        client.disconnect();
        return;
      }

      const payload = await this.jwtService.verifyAsync(token);
      const user = await this.getUserById(payload.sub);

      if (!user) {
        this.logger.warn(`Client ${client.id} attempted to connect with invalid user`);
        client.disconnect();
        return;
      }

      client.user = user;
      
      // Join user to their personal room
      await client.join(`user:${user.id}`);
      
      // Update presence
      await this.presenceService.setUserOnline(user.id, client.id);
      
      // Join user to their chat rooms
      const userChats = await this.chatService.getUserChats(user.id);
      for (const chat of userChats) {
        await client.join(`chat:${chat.id}`);
      }

      // Notify user's contacts about online status
      this.server.emit('user:online', {
        userId: user.id,
        username: user.username,
        avatar: user.avatar,
      });

      this.logger.log(`Client ${client.id} connected for user ${user.username}`);
    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}:`, error);
      client.disconnect();
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.user) {
      await this.presenceService.setUserOffline(client.user.id, client.id);
      
      // Check if user has other active connections
      const isStillOnline = await this.presenceService.isUserOnline(client.user.id);
      
      if (!isStillOnline) {
        // Notify user's contacts about offline status
        this.server.emit('user:offline', {
          userId: client.user.id,
          username: client.user.username,
        });
      }

      this.logger.log(`Client ${client.id} disconnected for user ${client.user.username}`);
    }
  }

  // Chat Messages
  @SubscribeMessage('chat:join')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    if (!client.user) return;

    const canJoin = await this.chatService.canUserJoinChat(client.user.id, data.chatId);
    if (!canJoin) {
      client.emit('error', { message: 'Cannot join this chat' });
      return;
    }

    await client.join(`chat:${data.chatId}`);
    client.emit('chat:joined', { chatId: data.chatId });
  }

  @SubscribeMessage('chat:leave')
  async handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string },
  ) {
    await client.leave(`chat:${data.chatId}`);
    client.emit('chat:left', { chatId: data.chatId });
  }

  @SubscribeMessage('chat:message')
  async handleChatMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: {
      chatId: string;
      content: string;
      type: 'text' | 'image' | 'file';
      metadata?: any;
    },
  ) {
    if (!client.user) return;

    try {
      const message = await this.chatService.createMessage({
        chatId: data.chatId,
        senderId: client.user.id,
        content: data.content,
        type: data.type,
        metadata: data.metadata,
      });

      // Broadcast to all chat participants
      this.server.to(`chat:${data.chatId}`).emit('chat:message', {
        id: message.id,
        chatId: data.chatId,
        senderId: client.user.id,
        senderUsername: client.user.username,
        senderAvatar: client.user.avatar,
        content: data.content,
        type: data.type,
        metadata: data.metadata,
        createdAt: message.createdAt,
      });

      // Send push notifications to offline users
      await this.notificationService.sendChatNotification(message);
    } catch (error) {
      this.logger.error('Error sending chat message:', error);
      client.emit('error', { message: 'Failed to send message' });
    }
  }

  @SubscribeMessage('chat:typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    if (!client.user) return;

    // Broadcast typing status to other chat participants
    client.to(`chat:${data.chatId}`).emit('chat:typing', {
      chatId: data.chatId,
      userId: client.user.id,
      username: client.user.username,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('chat:read')
  async handleMessageRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { chatId: string; messageId: string },
  ) {
    if (!client.user) return;

    await this.chatService.markMessageAsRead(data.messageId, client.user.id);

    // Broadcast read status to chat participants
    this.server.to(`chat:${data.chatId}`).emit('chat:read', {
      chatId: data.chatId,
      messageId: data.messageId,
      userId: client.user.id,
      readAt: new Date(),
    });
  }

  // Signal Spot Events
  @SubscribeMessage('spot:join')
  async handleJoinSpot(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { spotId: string },
  ) {
    if (!client.user) return;

    await client.join(`spot:${data.spotId}`);
    
    // Notify others in the spot
    client.to(`spot:${data.spotId}`).emit('spot:user_joined', {
      spotId: data.spotId,
      userId: client.user.id,
      username: client.user.username,
      avatar: client.user.avatar,
    });
  }

  @SubscribeMessage('spot:leave')
  async handleLeaveSpot(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { spotId: string },
  ) {
    if (!client.user) return;

    await client.leave(`spot:${data.spotId}`);
    
    // Notify others in the spot
    client.to(`spot:${data.spotId}`).emit('spot:user_left', {
      spotId: data.spotId,
      userId: client.user.id,
    });
  }

  @SubscribeMessage('spot:location_update')
  async handleLocationUpdate(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { spotId: string; latitude: number; longitude: number },
  ) {
    if (!client.user) return;

    // Broadcast location update to spot participants
    client.to(`spot:${data.spotId}`).emit('spot:location_updated', {
      spotId: data.spotId,
      userId: client.user.id,
      latitude: data.latitude,
      longitude: data.longitude,
      timestamp: new Date(),
    });
  }

  // Notification Events
  @SubscribeMessage('notification:read')
  async handleNotificationRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { notificationId: string },
  ) {
    if (!client.user) return;

    await this.notificationService.markAsRead(data.notificationId, client.user.id);
  }

  // Public methods for external services
  async sendNotificationToUser(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }

  async sendChatUpdate(chatId: string, update: any) {
    this.server.to(`chat:${chatId}`).emit('chat:update', update);
  }

  async sendSpotUpdate(spotId: string, update: any) {
    this.server.to(`spot:${spotId}`).emit('spot:update', update);
  }

  async broadcastToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Helper method to get user by ID - this should be replaced with your actual user service
  private async getUserById(id: string): Promise<User | null> {
    // TODO: Implement actual user lookup
    // return await this.userService.findById(id);
    return null; // Placeholder
  }
}