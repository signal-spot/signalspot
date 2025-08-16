import { Injectable, NotFoundException, ForbiddenException, BadRequestException, Inject, forwardRef } from '@nestjs/common';
import { EntityManager, QueryOrder } from '@mikro-orm/core';
import { ChatRoom, Message, ChatRoomType, ChatRoomStatus, MessageStatus } from './entities';
import { WebSocketService } from '../websocket/websocket.service';
import { NotificationService, NotificationType } from '../notifications/notification.service';
import { User } from '../entities/user.entity';
import { BlockedUser } from '../entities/blocked-user.entity';
import {
  SendMessageDto,
  CreateChatRoomDto,
  UpdateMessageDto,
  ChatRoomQueryDto,
  MessageQueryDto,
  ChatRoomResponseDto,
  MessageResponseDto,
  ChatRoomListResponseDto,
  MessageListResponseDto,
} from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(
    private readonly em: EntityManager,
    @Inject(forwardRef(() => WebSocketService))
    private readonly webSocketService?: WebSocketService,
    @Inject(forwardRef(() => NotificationService))
    private readonly notificationService?: NotificationService
  ) {}

  async createChatRoom(userId: string, createChatRoomDto: CreateChatRoomDto): Promise<ChatRoomResponseDto> {
    const { participantId, name, type } = createChatRoomDto;

    // 자기 자신과 채팅방 생성 방지
    if (userId === participantId) {
      throw new BadRequestException('Cannot create chat room with yourself');
    }

    // 상대방 사용자 존재 확인
    const participant = await this.em.findOne(User, { id: participantId });
    if (!participant) {
      throw new NotFoundException('Participant not found');
    }

    const currentUser = await this.em.findOne(User, { id: userId });
    if (!currentUser) {
      throw new NotFoundException('Current user not found');
    }

    // 이미 존재하는 채팅방 확인 (Direct 타입인 경우)
    if (type === ChatRoomType.DIRECT) {
      const existingRoom = await this.em.findOne(ChatRoom, {
        $or: [
          { participant1: currentUser, participant2: participant },
          { participant1: participant, participant2: currentUser },
        ],
        type: ChatRoomType.DIRECT,
        status: ChatRoomStatus.ACTIVE,
      });

      if (existingRoom) {
        return this.mapChatRoomToResponse(existingRoom, userId);
      }
    }

    // 새 채팅방 생성
    const chatRoom = new ChatRoom();
    chatRoom.name = name;
    chatRoom.type = type || ChatRoomType.DIRECT;
    chatRoom.participant1 = currentUser;
    chatRoom.participant2 = participant;

    await this.em.persistAndFlush(chatRoom);

    return this.mapChatRoomToResponse(chatRoom, userId);
  }

  async getChatRooms(userId: string, query: ChatRoomQueryDto): Promise<ChatRoomListResponseDto> {
    const { page = 1, limit = 20, status } = query;
    const offset = (page - 1) * limit;

    const user = await this.em.findOne(User, { id: userId });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get list of blocked users
    const blockedUsers = await this.em.find(BlockedUser, {
      $or: [
        { blocker: userId },
        { blocked: userId }
      ]
    });

    const blockedUserIds = new Set<string>();
    blockedUsers.forEach(block => {
      if (block.blocker.id === userId) {
        blockedUserIds.add(block.blocked.id);
      } else {
        blockedUserIds.add(block.blocker.id);
      }
    });

    const whereCondition: any = {
      $or: [
        { participant1: user },
        { participant2: user },
      ],
    };

    if (status) {
      whereCondition.status = status;
    }

    const [chatRooms, total] = await this.em.findAndCount(
      ChatRoom,
      whereCondition,
      {
        populate: ['participant1', 'participant2'],
        orderBy: { lastMessageAt: QueryOrder.DESC, createdAt: QueryOrder.DESC },
        limit,
        offset,
      },
    );

    // Filter out chat rooms with blocked users
    const filteredChatRooms = chatRooms.filter(room => {
      const otherParticipant = room.participant1.id === userId ? room.participant2 : room.participant1;
      return !blockedUserIds.has(otherParticipant.id);
    });

    const chatRoomResponses = filteredChatRooms.map(room => this.mapChatRoomToResponse(room, userId));

    return {
      chatRooms: chatRoomResponses,
      total: filteredChatRooms.length,
      page,
      limit,
      hasNext: offset + limit < filteredChatRooms.length,
    };
  }

  async getChatRoomById(userId: string, chatRoomId: string): Promise<ChatRoomResponseDto> {
    const chatRoom = await this.em.findOne(
      ChatRoom,
      { id: chatRoomId },
      { populate: ['participant1', 'participant2'] },
    );

    if (!chatRoom) {
      throw new NotFoundException('Chat room not found');
    }

    // 사용자가 이 채팅방의 참여자인지 확인
    if (chatRoom.participant1.id !== userId && chatRoom.participant2.id !== userId) {
      throw new ForbiddenException('Access denied to this chat room');
    }

    return this.mapChatRoomToResponse(chatRoom, userId);
  }

  async sendMessage(userId: string, sendMessageDto: SendMessageDto): Promise<MessageResponseDto> {
    const { chatRoomId, content, type, metadata } = sendMessageDto;

    const chatRoom = await this.em.findOne(
      ChatRoom,
      { id: chatRoomId },
      { populate: ['participant1', 'participant2'] },
    );

    if (!chatRoom) {
      throw new NotFoundException('Chat room not found');
    }

    // 사용자가 이 채팅방의 참여자인지 확인
    if (chatRoom.participant1.id !== userId && chatRoom.participant2.id !== userId) {
      throw new ForbiddenException('Access denied to this chat room');
    }

    // Check if users have blocked each other
    const otherParticipant = chatRoom.getOtherParticipant(userId);
    const blockedRelation = await this.em.findOne(BlockedUser, {
      $or: [
        { blocker: userId, blocked: otherParticipant.id },
        { blocker: otherParticipant.id, blocked: userId }
      ]
    });

    if (blockedRelation) {
      throw new ForbiddenException('Cannot send message to blocked user');
    }

    const sender = await this.em.findOne(User, { id: userId });
    if (!sender) {
      throw new NotFoundException('Sender not found');
    }

    // 메시지 생성
    const message = new Message();
    message.chatRoom = chatRoom;
    message.sender = sender;
    message.content = content;
    message.type = type;
    message.metadata = metadata;
    message.status = MessageStatus.SENT;
    message.readAt = null; // 명시적으로 null 설정
    message.deliveredAt = null; // 명시적으로 null 설정
    message.editedAt = null; // 명시적으로 null 설정

    await this.em.persistAndFlush(message);

    // 채팅방 마지막 메시지 정보 업데이트
    chatRoom.updateLastMessage(content, userId);
    await this.em.flush();

    // Send WebSocket notification for new message
    if (this.webSocketService) {
      await this.webSocketService.notifyChatMessage(message, chatRoomId);
    }

    // Send push notification to the other participant (already got otherParticipant above)
    if (this.notificationService && otherParticipant) {
      await this.notificationService.sendNotification({
        title: sender.username || 'Someone',
        body: content.substring(0, 100),
        type: NotificationType.MESSAGE_RECEIVED,
        userId: otherParticipant.id,
        data: {
          chatRoomId,
          senderId: userId,
          messageId: message.id,
        },
      });
    }

    return this.mapMessageToResponse(message);
  }

  async getMessages(
    userId: string,
    chatRoomId: string,
    query: MessageQueryDto,
  ): Promise<MessageListResponseDto> {
    const { page = 1, limit = 50, beforeMessageId } = query;
    const offset = (page - 1) * limit;

    const chatRoom = await this.em.findOne(ChatRoom, { id: chatRoomId });

    if (!chatRoom) {
      throw new NotFoundException('Chat room not found');
    }

    // 사용자가 이 채팅방의 참여자인지 확인
    if (chatRoom.participant1.id !== userId && chatRoom.participant2.id !== userId) {
      throw new ForbiddenException('Access denied to this chat room');
    }

    const whereCondition: any = {
      chatRoom,
      isDeleted: false,
    };

    // beforeMessageId가 있으면 해당 메시지 이전의 메시지들만 조회
    if (beforeMessageId) {
      const beforeMessage = await this.em.findOne(Message, { id: beforeMessageId });
      if (beforeMessage) {
        whereCondition.createdAt = { $lt: beforeMessage.createdAt };
      }
    }

    const [messages, total] = await this.em.findAndCount(
      Message,
      whereCondition,
      {
        populate: ['sender'],
        orderBy: { createdAt: QueryOrder.DESC },
        limit,
        offset,
      },
    );

    const messageResponses = messages.map(message => this.mapMessageToResponse(message));

    return {
      messages: messageResponses,
      total,
      page,
      limit,
      hasNext: offset + limit < total,
    };
  }

  async markAsRead(userId: string, chatRoomId: string): Promise<void> {
    const chatRoom = await this.em.findOne(ChatRoom, { id: chatRoomId });

    if (!chatRoom) {
      throw new NotFoundException('Chat room not found');
    }

    // 사용자가 이 채팅방의 참여자인지 확인
    if (chatRoom.participant1.id !== userId && chatRoom.participant2.id !== userId) {
      throw new ForbiddenException('Access denied to this chat room');
    }

    // 채팅방의 읽지 않은 메시지 카운트 초기화
    chatRoom.markAsRead(userId);

    // 해당 사용자가 받은 메시지들을 읽음 처리
    const unreadMessages = await this.em.find(Message, {
      chatRoom,
      sender: { $ne: userId },
      status: { $in: [MessageStatus.SENT, MessageStatus.DELIVERED] },
    });

    unreadMessages.forEach(message => message.markAsRead());

    await this.em.flush();
  }

  async updateMessage(
    userId: string,
    messageId: string,
    updateMessageDto: UpdateMessageDto,
  ): Promise<MessageResponseDto> {
    const message = await this.em.findOne(
      Message,
      { id: messageId },
      { populate: ['sender', 'chatRoom'] },
    );

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // 메시지 작성자만 수정 가능
    if (message.sender.id !== userId) {
      throw new ForbiddenException('Only message sender can update the message');
    }

    message.edit(updateMessageDto.content);
    await this.em.flush();

    return this.mapMessageToResponse(message);
  }

  async deleteMessage(userId: string, messageId: string): Promise<void> {
    const message = await this.em.findOne(
      Message,
      { id: messageId },
      { populate: ['sender'] },
    );

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    // 메시지 작성자만 삭제 가능
    if (message.sender.id !== userId) {
      throw new ForbiddenException('Only message sender can delete the message');
    }

    message.softDelete();
    await this.em.flush();
  }

  async archiveChatRoom(userId: string, chatRoomId: string): Promise<void> {
    const chatRoom = await this.em.findOne(ChatRoom, { id: chatRoomId });

    if (!chatRoom) {
      throw new NotFoundException('Chat room not found');
    }

    // 사용자가 이 채팅방의 참여자인지 확인
    if (chatRoom.participant1.id !== userId && chatRoom.participant2.id !== userId) {
      throw new ForbiddenException('Access denied to this chat room');
    }

    chatRoom.status = ChatRoomStatus.ARCHIVED;
    await this.em.flush();
  }

  private mapChatRoomToResponse(chatRoom: ChatRoom, currentUserId: string): ChatRoomResponseDto {
    const otherParticipant = chatRoom.getOtherParticipant(currentUserId);

    return {
      id: chatRoom.id,
      name: chatRoom.name,
      type: chatRoom.type,
      status: chatRoom.status,
      otherParticipant: {
        id: otherParticipant.id,
        nickname: otherParticipant.username || otherParticipant.displayName || '알 수 없는 사용자',
        avatarUrl: otherParticipant.avatarUrl,
      },
      lastMessage: chatRoom.lastMessage,
      lastMessageAt: chatRoom.lastMessageAt,
      unreadCount: chatRoom.getUnreadCountForUser(currentUserId),
      createdAt: chatRoom.createdAt,
      updatedAt: chatRoom.updatedAt,
    };
  }

  private mapMessageToResponse(message: Message): MessageResponseDto {
    return {
      id: message.id,
      content: message.content,
      type: message.type,
      status: message.status,
      sender: {
        id: message.sender.id,
        nickname: message.sender.username,  // User entity has username, not nickname
        avatarUrl: message.sender.avatarUrl,
      },
      metadata: message.metadata,
      readAt: message.readAt,
      deliveredAt: message.deliveredAt,
      editedAt: message.editedAt,
      isDeleted: message.isDeleted,
      createdAt: message.createdAt,
      updatedAt: message.updatedAt,
    };
  }
}