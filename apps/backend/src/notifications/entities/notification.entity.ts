import { Entity, PrimaryKey, Property, ManyToOne, Index, Enum } from '@mikro-orm/core';
import { v4 } from 'uuid';
import { User } from '../../entities/user.entity';

export enum NotificationType {
  SPARK_DETECTED = 'spark_detected',
  SPARK_MATCHED = 'spark_matched',
  MESSAGE_RECEIVED = 'message_received',
  SIGNAL_SPOT_NEARBY = 'signal_spot_nearby',
  SACRED_SITE_DISCOVERED = 'sacred_site_discovered',
  SACRED_SITE_TIER_UPGRADED = 'sacred_site_tier_upgraded',
  PROFILE_VISITED = 'profile_visited',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  LOCATION_SHARING_REQUEST = 'location_sharing_request',
  FRIEND_REQUEST = 'friend_request',
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
}

export enum NotificationStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity()
@Index({ properties: ['user', 'status', 'createdAt'] }) // User notification queries
@Index({ properties: ['status', 'scheduledFor'] }) // Scheduled notification processing
@Index({ properties: ['expiresAt', 'status'] }) // Expiration cleanup
@Index({ properties: ['groupKey', 'user', 'createdAt'] }) // Grouped notifications
@Index({ properties: ['type', 'createdAt'] }) // Notification type queries
export class Notification {
  @PrimaryKey({ type: 'uuid' })
  id: string = v4();

  @ManyToOne(() => User)
  @Index()
  user: User;

  @Enum(() => NotificationType)
  @Index()
  type: NotificationType;

  @Property()
  title: string;

  @Property({ type: 'text' })
  body: string;

  @Property({ type: 'json', nullable: true })
  data?: Record<string, any>;

  @Enum(() => NotificationStatus)
  @Index()
  status: NotificationStatus = NotificationStatus.PENDING;

  @Enum(() => NotificationPriority)
  priority: NotificationPriority = NotificationPriority.NORMAL;

  @Property({ nullable: true })
  imageUrl?: string;

  @Property({ nullable: true })
  actionUrl?: string;

  @Property({ nullable: true })
  deepLinkUrl?: string;

  @Property({ nullable: true })
  groupKey?: string;

  @Property({ nullable: true })
  expiresAt?: Date;

  @Property({ nullable: true })
  scheduledFor?: Date;

  @Property({ nullable: true })
  deliveredAt?: Date;

  @Property({ nullable: true })
  readAt?: Date;

  @Property({ nullable: true })
  failureReason?: string;

  @Property({ default: 0 })
  retryCount: number = 0;

  @Property({ default: 3 })
  maxRetries: number = 3;

  @Property({ type: 'json', nullable: true })
  fcmResponse?: {
    messageId?: string;
    error?: string;
    success?: boolean;
  };

  @Property({ type: 'json', nullable: true })
  metadata?: {
    campaignId?: string;
    segmentId?: string;
    templateId?: string;
    batchId?: string;
    source?: string;
    tags?: string[];
  };

  @Property({ onCreate: () => new Date() })
  @Index()
  createdAt: Date = new Date();

  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt: Date = new Date();

  constructor(data: {
    user: User;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
    priority?: NotificationPriority;
    imageUrl?: string;
    actionUrl?: string;
    deepLinkUrl?: string;
    groupKey?: string;
    expiresAt?: Date;
    scheduledFor?: Date;
    metadata?: any;
  }) {
    this.user = data.user;
    this.type = data.type;
    this.title = data.title;
    this.body = data.body;
    this.data = data.data;
    this.priority = data.priority || NotificationPriority.NORMAL;
    this.imageUrl = data.imageUrl;
    this.actionUrl = data.actionUrl;
    this.deepLinkUrl = data.deepLinkUrl;
    this.groupKey = data.groupKey;
    this.expiresAt = data.expiresAt;
    this.scheduledFor = data.scheduledFor;
    this.metadata = data.metadata;
  }

  public markAsDelivered(fcmResponse?: any): void {
    this.status = NotificationStatus.DELIVERED;
    this.deliveredAt = new Date();
    this.fcmResponse = fcmResponse;
    this.updatedAt = new Date();
  }

  public markAsRead(): void {
    if (this.status === NotificationStatus.DELIVERED) {
      this.status = NotificationStatus.READ;
      this.readAt = new Date();
      this.updatedAt = new Date();
    }
  }

  public markAsFailed(reason: string): void {
    this.status = NotificationStatus.FAILED;
    this.failureReason = reason;
    this.retryCount += 1;
    this.updatedAt = new Date();
  }

  public markAsCancelled(): void {
    this.status = NotificationStatus.CANCELLED;
    this.updatedAt = new Date();
  }

  public canRetry(): boolean {
    return this.status === NotificationStatus.FAILED && 
           this.retryCount < this.maxRetries;
  }

  public isExpired(): boolean {
    if (!this.expiresAt) return false;
    return new Date() > this.expiresAt;
  }

  public isScheduled(): boolean {
    if (!this.scheduledFor) return false;
    return new Date() < this.scheduledFor;
  }

  public shouldSendNow(): boolean {
    if (this.isExpired()) return false;
    if (this.status !== NotificationStatus.PENDING) return false;
    if (this.scheduledFor && new Date() < this.scheduledFor) return false;
    return true;
  }

  public getChannelId(): string {
    switch (this.type) {
      case NotificationType.SPARK_DETECTED:
      case NotificationType.SPARK_MATCHED:
        return 'sparks';
      case NotificationType.MESSAGE_RECEIVED:
        return 'messages';
      case NotificationType.SIGNAL_SPOT_NEARBY:
        return 'spots';
      case NotificationType.SACRED_SITE_DISCOVERED:
      case NotificationType.SACRED_SITE_TIER_UPGRADED:
        return 'sacred_sites';
      case NotificationType.FRIEND_REQUEST:
        return 'social';
      case NotificationType.ACHIEVEMENT_UNLOCKED:
        return 'achievements';
      case NotificationType.SYSTEM_ANNOUNCEMENT:
        return 'system';
      default:
        return 'default';
    }
  }

  public getNotificationSound(): string {
    switch (this.priority) {
      case NotificationPriority.CRITICAL:
        return 'critical_alert';
      case NotificationPriority.HIGH:
        return 'high_priority';
      case NotificationPriority.NORMAL:
        return 'default';
      case NotificationPriority.LOW:
        return 'soft_chime';
      default:
        return 'default';
    }
  }

  public shouldGroupWithOthers(): boolean {
    return !!this.groupKey && [
      NotificationType.MESSAGE_RECEIVED,
      NotificationType.SIGNAL_SPOT_NEARBY,
      NotificationType.PROFILE_VISITED,
    ].includes(this.type);
  }

  public getGroupTitle(): string | undefined {
    if (!this.groupKey) return undefined;

    switch (this.type) {
      case NotificationType.MESSAGE_RECEIVED:
        return '새로운 메시지';
      case NotificationType.SIGNAL_SPOT_NEARBY:
        return '근처 시그널 스팟';
      case NotificationType.PROFILE_VISITED:
        return '프로필 방문';
      default:
        return undefined;
    }
  }

  public getDeepLink(): string | undefined {
    if (this.deepLinkUrl) return this.deepLinkUrl;

    switch (this.type) {
      case NotificationType.SPARK_DETECTED:
      case NotificationType.SPARK_MATCHED:
        return `signalspot://sparks/${this.data?.sparkId}`;
      case NotificationType.MESSAGE_RECEIVED:
        return `signalspot://chat/${this.data?.chatId}`;
      case NotificationType.SIGNAL_SPOT_NEARBY:
        return `signalspot://spots/${this.data?.spotId}`;
      case NotificationType.SACRED_SITE_DISCOVERED:
      case NotificationType.SACRED_SITE_TIER_UPGRADED:
        return `signalspot://sacred-sites/${this.data?.siteId}`;
      case NotificationType.PROFILE_VISITED:
        return `signalspot://profile/${this.data?.visitorId}`;
      case NotificationType.FRIEND_REQUEST:
        return `signalspot://friends/requests`;
      case NotificationType.ACHIEVEMENT_UNLOCKED:
        return `signalspot://achievements/${this.data?.achievementId}`;
      default:
        return undefined;
    }
  }

  public static createScheduled(data: {
    user: User;
    type: NotificationType;
    title: string;
    body: string;
    scheduledFor: Date;
    data?: Record<string, any>;
    priority?: NotificationPriority;
    imageUrl?: string;
    actionUrl?: string;
    deepLinkUrl?: string;
    groupKey?: string;
    expiresAt?: Date;
    metadata?: any;
  }): Notification {
    return new Notification({
      ...data,
      scheduledFor: data.scheduledFor,
    });
  }

  public static createBulk(notifications: {
    user: User;
    type: NotificationType;
    title: string;
    body: string;
    data?: Record<string, any>;
    priority?: NotificationPriority;
    imageUrl?: string;
    actionUrl?: string;
    deepLinkUrl?: string;
    groupKey?: string;
    expiresAt?: Date;
    scheduledFor?: Date;
    metadata?: any;
  }[]): Notification[] {
    return notifications.map(data => new Notification(data));
  }
}