export * from './lib/shared';

// Re-export commonly used types for convenience
export type {
  User,
  UserProfile,
  Location,
  Address,
  SignalSpot,
  SignalSpark,
  ChatRoom,
  ChatMessage,
  FeedItem,
  Notification,
  ApiResponse,
  PaginatedResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest
} from './lib/shared';

export {
  SpotType,
  SparkType,
  SparkStatus,
  MessageType,
  FeedItemType,
  NotificationType
} from './lib/shared';
