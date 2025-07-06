export function shared(): string {
  return 'shared';
}

// User Types
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  profileImageUrl?: string;
  bio?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile extends User {
  spotCount: number;
  sparkCount: number;
  matchCount: number;
  isOnline: boolean;
  lastSeen?: Date;
}

// Location Types
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: Date;
}

export interface Address {
  street?: string;
  city: string;
  region: string;
  country: string;
  postalCode?: string;
}

// Signal Spot Types
export interface SignalSpot {
  id: string;
  authorId: string;
  title: string;
  content: string;
  location: Location;
  address?: Address;
  imageUrls: string[];
  tags: string[];
  spotType: SpotType;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export enum SpotType {
  MOMENT = 'moment',
  EVENT = 'event',
  RECOMMENDATION = 'recommendation',
  QUESTION = 'question',
  MEETUP = 'meetup'
}

// Signal Spark Types  
export interface SignalSpark {
  id: string;
  fromUserId: string;
  toUserId: string;
  spotId?: string;
  message?: string;
  sparkType: SparkType;
  status: SparkStatus;
  createdAt: Date;
  expiresAt: Date;
}

export enum SparkType {
  LIKE = 'like',
  INTEREST = 'interest',
  MEET_REQUEST = 'meet_request',
  COMMENT = 'comment'
}

export enum SparkStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
  EXPIRED = 'expired'
}

// Chat Types
export interface ChatRoom {
  id: string;
  participants: string[];
  lastMessage?: ChatMessage;
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  content: string;
  messageType: MessageType;
  createdAt: Date;
  readBy: string[];
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  LOCATION = 'location',
  SYSTEM = 'system'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Authentication Types
export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  username: string;
  displayName: string;
}

// Feed Types
export interface FeedItem {
  id: string;
  type: FeedItemType;
  content: SignalSpot | SignalSpark;
  author: UserProfile;
  createdAt: Date;
  distance?: number;
}

export enum FeedItemType {
  SPOT = 'spot',
  SPARK = 'spark',
  MATCH = 'match'
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  data?: Record<string, any>;
  isRead: boolean;
  createdAt: Date;
}

export enum NotificationType {
  NEW_SPARK = 'new_spark',
  SPARK_ACCEPTED = 'spark_accepted',
  NEW_MESSAGE = 'new_message',
  NEARBY_SPOT = 'nearby_spot',
  SYSTEM = 'system'
}
