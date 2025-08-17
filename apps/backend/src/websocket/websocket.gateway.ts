import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EntityManager } from '@mikro-orm/core';
import { User } from '../entities/user.entity';

interface AuthenticatedSocket extends Socket {
  userId?: string;
  user?: User;
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: '*', // In production, specify allowed origins
    credentials: true,
  },
})
export class AppWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppWebSocketGateway.name);
  private readonly connectedClients = new Map<string, AuthenticatedSocket>();
  private readonly userSockets = new Map<string, Set<string>>();

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly em: EntityManager,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from query params or auth header
      const token = client.handshake.query.token as string || 
                   client.handshake.auth?.token ||
                   this.extractTokenFromHeader(client.handshake.headers.authorization);

      if (!token) {
        this.logger.warn(`Client ${client.id} connected without token`);
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = await this.verifyToken(token);
      if (!payload) {
        this.logger.warn(`Client ${client.id} connected with invalid token`);
        client.disconnect();
        return;
      }

      // Attach user info to socket
      client.userId = payload.sub;
      const user = await this.em.findOne(User, { id: payload.sub });
      
      if (!user) {
        this.logger.warn(`User ${payload.sub} not found for client ${client.id}`);
        client.disconnect();
        return;
      }

      client.user = user;

      // Store connection
      this.connectedClients.set(client.id, client);
      
      // Track user's sockets
      if (!this.userSockets.has(client.userId)) {
        this.userSockets.set(client.userId, new Set());
      }
      this.userSockets.get(client.userId)!.add(client.id);

      // Join user-specific room
      client.join(`user:${client.userId}`);
      
      this.logger.log(`Client ${client.id} connected for user ${client.userId}`);

      // Send connection confirmation
      client.emit('connected', {
        userId: client.userId,
        username: user.username,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      this.logger.error(`Connection error for client ${client.id}:`, error);
      client.disconnect();
    }
  }

  handleDisconnect(client: AuthenticatedSocket) {
    const userId = client.userId;
    
    // Remove from connected clients
    this.connectedClients.delete(client.id);
    
    // Remove from user sockets
    if (userId && this.userSockets.has(userId)) {
      const userSocketSet = this.userSockets.get(userId)!;
      userSocketSet.delete(client.id);
      
      // If no more sockets for this user, remove the entry
      if (userSocketSet.size === 0) {
        this.userSockets.delete(userId);
      }
    }

    this.logger.log(`Client ${client.id} disconnected${userId ? ` (user: ${userId})` : ''}`);
  }

  // Subscribe to Signal Spot updates for a specific location
  @SubscribeMessage('subscribeToLocation')
  async handleLocationSubscription(
    @MessageBody() data: { latitude: number; longitude: number; radiusKm: number },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      throw new WsException('Not authenticated');
    }

    const roomName = `location:${data.latitude.toFixed(2)},${data.longitude.toFixed(2)}`;
    client.join(roomName);

    this.logger.log(`User ${client.userId} subscribed to location ${roomName}`);

    return {
      success: true,
      room: roomName,
      message: 'Subscribed to location updates',
    };
  }

  // Subscribe to specific Signal Spot updates
  @SubscribeMessage('subscribeToSpot')
  async handleSpotSubscription(
    @MessageBody() data: { spotId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      throw new WsException('Not authenticated');
    }

    const roomName = `spot:${data.spotId}`;
    client.join(roomName);

    this.logger.log(`User ${client.userId} subscribed to spot ${data.spotId}`);

    return {
      success: true,
      room: roomName,
      message: 'Subscribed to spot updates',
    };
  }

  // Subscribe to chat room updates
  @SubscribeMessage('subscribeToChatRoom')
  async handleChatRoomSubscription(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      throw new WsException('Not authenticated');
    }

    const roomName = `chat:${data.roomId}`;
    client.join(roomName);

    this.logger.log(`User ${client.userId} subscribed to chat room ${data.roomId}`);

    return {
      success: true,
      room: roomName,
      message: 'Subscribed to chat room updates',
    };
  }

  // Unsubscribe from updates
  @SubscribeMessage('unsubscribe')
  async handleUnsubscribe(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      throw new WsException('Not authenticated');
    }

    client.leave(data.room);

    this.logger.log(`User ${client.userId} unsubscribed from ${data.room}`);

    return {
      success: true,
      message: `Unsubscribed from ${data.room}`,
    };
  }

  // Send typing indicator
  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { roomId: string; isTyping: boolean },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    if (!client.userId) {
      throw new WsException('Not authenticated');
    }

    // Broadcast to others in the chat room
    client.to(`chat:${data.roomId}`).emit('userTyping', {
      userId: client.userId,
      username: client.user?.username,
      isTyping: data.isTyping,
      roomId: data.roomId,
      timestamp: new Date().toISOString(),
    });

    return { success: true };
  }

  // Helper method to emit to specific user
  emitToUser(userId: string, event: string, data: any) {
    this.server.to(`user:${userId}`).emit(event, data);
  }

  // Helper method to emit to location subscribers
  emitToLocation(latitude: number, longitude: number, event: string, data: any) {
    const roomName = `location:${latitude.toFixed(2)},${longitude.toFixed(2)}`;
    this.server.to(roomName).emit(event, data);
  }

  // Helper method to emit to spot subscribers
  emitToSpot(spotId: string, event: string, data: any) {
    this.server.to(`spot:${spotId}`).emit(event, data);
  }

  // Helper method to emit to chat room
  emitToChatRoom(roomId: string, event: string, data: any) {
    this.server.to(`chat:${roomId}`).emit(event, data);
  }

  // Broadcast to all connected clients
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Check if user is online
  isUserOnline(userId: string): boolean {
    return this.userSockets.has(userId) && this.userSockets.get(userId)!.size > 0;
  }

  // Get online users count
  getOnlineUsersCount(): number {
    return this.userSockets.size;
  }

  // Get all online user IDs
  getOnlineUserIds(): string[] {
    return Array.from(this.userSockets.keys());
  }

  private extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;
    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : null;
  }

  private async verifyToken(token: string): Promise<any> {
    try {
      return this.jwtService.verify(token, {
        secret: this.configService.get('JWT_SECRET'),
      });
    } catch (error) {
      this.logger.error('Token verification failed:', error);
      return null;
    }
  }
}