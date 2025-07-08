import { io, Socket } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './api.service';

export interface ChatParticipant {
  userId: string;
  username: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface ChatSummary {
  id: string;
  type: string;
  otherParticipant: ChatParticipant;
  lastMessage?: {
    id: string;
    content: string;
    type: MessageType;
    senderId: string;
    createdAt: Date;
    isRead: boolean;
  };
  unreadCount: number;
  lastActivity: Date;
  isArchived: boolean;
  sparkId?: string;
}

export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  type: MessageType;
  content: string;
  metadata?: any;
  status: MessageStatus;
  deliveredAt?: Date;
  readAt?: Date;
  replyToId?: string;
  editedAt?: Date;
  createdAt: Date;
  sender: {
    id: string;
    username: string;
    avatarUrl?: string;
  };
  replyTo?: {
    id: string;
    content: string;
    senderId: string;
    senderUsername: string;
  };
  tempId?: string; // For optimistic updates
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  AUDIO = 'audio',
  LOCATION = 'location',
  SYSTEM = 'system',
}

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
}

export interface SendMessageData {
  content: string;
  type?: MessageType;
  metadata?: any;
  replyToId?: string;
  tempId?: string;
}

export interface TypingUser {
  userId: string;
  username: string;
  isTyping: boolean;
}

class ChatService {
  private socket: Socket | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private listeners: Map<string, (data: any) => void> = new Map();

  private readonly STORAGE_KEYS = {
    CHAT_DRAFTS: '@chat/drafts',
    CHAT_CACHE: '@chat/cache',
  };

  async initialize(): Promise<boolean> {
    try {
      const token = await AsyncStorage.getItem('@auth/token');
      if (!token) {
        console.error('No auth token found');
        return false;
      }

      await this.connect(token);
      return true;
    } catch (error) {
      console.error('Failed to initialize chat service:', error);
      return false;
    }
  }

  private async connect(token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:3001';
      
      this.socket = io(`${backendUrl}/chat`, {
        auth: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: this.maxReconnectAttempts,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to chat server');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.setupEventListeners();
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        this.isConnected = false;
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected from chat server:', reason);
        this.isConnected = false;
        
        if (reason === 'io server disconnect') {
          // Server initiated disconnect, try to reconnect
          setTimeout(() => this.initialize(), 2000);
        }
      });
    });
  }

  private setupEventListeners(): void {
    if (!this.socket) return;

    // Message events
    this.socket.on('new_message', (data) => {
      this.emit('new_message', data);
    });

    this.socket.on('message_sent', (data) => {
      this.emit('message_sent', data);
    });

    this.socket.on('message_error', (data) => {
      this.emit('message_error', data);
    });

    this.socket.on('message_read', (data) => {
      this.emit('message_read', data);
    });

    this.socket.on('message_edited', (data) => {
      this.emit('message_edited', data);
    });

    this.socket.on('message_deleted', (data) => {
      this.emit('message_deleted', data);
    });

    // Chat events
    this.socket.on('new_chat', (data) => {
      this.emit('new_chat', data);
    });

    this.socket.on('joined_chat', (data) => {
      this.emit('joined_chat', data);
    });

    this.socket.on('left_chat', (data) => {
      this.emit('left_chat', data);
    });

    // Typing events
    this.socket.on('user_typing', (data) => {
      this.emit('user_typing', data);
    });

    // Status events
    this.socket.on('user_status_changed', (data) => {
      this.emit('user_status_changed', data);
    });

    this.socket.on('online_users', (data) => {
      this.emit('online_users', data);
    });

    this.socket.on('online_status', (data) => {
      this.emit('online_status', data);
    });

    // Notification events
    this.socket.on('message_notification', (data) => {
      this.emit('message_notification', data);
    });

    // Error handling
    this.socket.on('error', (data) => {
      console.error('Socket error:', data);
      this.emit('error', data);
    });
  }

  // Event emitter methods
  on(event: string, callback: (data: any) => void): void {
    this.listeners.set(event, callback);
  }

  off(event: string): void {
    this.listeners.delete(event);
  }

  private emit(event: string, data: any): void {
    const callback = this.listeners.get(event);
    if (callback) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} callback:`, error);
      }
    }
  }

  // Chat operations via REST API
  async createChat(participantId: string, sparkId?: string, initialMessage?: string): Promise<ChatSummary> {
    const response = await apiService.post('/chat', {
      participantId,
      sparkId,
      initialMessage,
    });
    return response.data;
  }

  async getUserChats(query?: string, page = 1, limit = 20, archived = false): Promise<{
    chats: ChatSummary[];
    total: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      archived: archived.toString(),
    });

    if (query) {
      params.append('query', query);
    }

    const response = await apiService.get(`/chat?${params}`);
    return response.data;
  }

  async getMessages(
    chatId: string,
    page = 1,
    limit = 50,
    before?: Date,
    after?: Date,
  ): Promise<{
    messages: Message[];
    hasMore: boolean;
    total: number;
  }> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (before) {
      params.append('before', before.toISOString());
    }

    if (after) {
      params.append('after', after.toISOString());
    }

    const response = await apiService.get(`/chat/${chatId}/messages?${params}`);
    return response.data;
  }

  // Real-time socket operations
  joinChat(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('join_chat', { chatId });
    }
  }

  leaveChat(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('leave_chat', { chatId });
    }
  }

  sendMessage(chatId: string, messageData: SendMessageData): void {
    if (this.socket && this.isConnected) {
      const tempId = messageData.tempId || Date.now().toString();
      this.socket.emit('send_message', {
        chatId,
        message: { ...messageData, tempId },
      });
    }
  }

  markAsRead(chatId: string, messageId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('mark_as_read', { chatId, messageId });
    }
  }

  startTyping(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { chatId });
    }
  }

  stopTyping(chatId: string): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { chatId });
    }
  }

  getOnlineStatus(userIds: string[]): void {
    if (this.socket && this.isConnected) {
      this.socket.emit('get_online_status', { userIds });
    }
  }

  // Message operations via REST API
  async editMessage(messageId: string, content: string): Promise<Message> {
    const response = await apiService.put(`/chat/messages/${messageId}`, {
      content,
    });
    return response.data;
  }

  async deleteMessage(messageId: string): Promise<void> {
    await apiService.delete(`/chat/messages/${messageId}`);
  }

  // Chat management via REST API
  async archiveChat(chatId: string): Promise<void> {
    await apiService.put(`/chat/${chatId}/archive`);
  }

  async unarchiveChat(chatId: string): Promise<void> {
    await apiService.put(`/chat/${chatId}/unarchive`);
  }

  // Draft management
  async saveDraft(chatId: string, content: string): Promise<void> {
    try {
      const drafts = await this.getDrafts();
      drafts[chatId] = content;
      await AsyncStorage.setItem(this.STORAGE_KEYS.CHAT_DRAFTS, JSON.stringify(drafts));
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }

  async getDraft(chatId: string): Promise<string | null> {
    try {
      const drafts = await this.getDrafts();
      return drafts[chatId] || null;
    } catch (error) {
      console.error('Failed to get draft:', error);
      return null;
    }
  }

  async clearDraft(chatId: string): Promise<void> {
    try {
      const drafts = await this.getDrafts();
      delete drafts[chatId];
      await AsyncStorage.setItem(this.STORAGE_KEYS.CHAT_DRAFTS, JSON.stringify(drafts));
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }

  private async getDrafts(): Promise<Record<string, string>> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEYS.CHAT_DRAFTS);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Failed to get drafts:', error);
      return {};
    }
  }

  // Connection status
  isSocketConnected(): boolean {
    return this.isConnected && this.socket?.connected === true;
  }

  // Cleanup
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
    this.listeners.clear();
  }

  // Reconnect manually
  async reconnect(): Promise<boolean> {
    this.disconnect();
    return this.initialize();
  }
}

export const chatService = new ChatService();