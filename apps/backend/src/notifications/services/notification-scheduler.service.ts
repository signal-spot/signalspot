import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Notification, NotificationStatus, NotificationType, NotificationPriority } from '../entities/notification.entity';
import { NotificationService } from '../notification.service';
import { NotificationTemplateService } from './notification-template.service';
import { User } from '../../entities/user.entity';

export interface ScheduledNotificationData {
  userId: string;
  type: NotificationType;
  variables: Record<string, string>;
  priority?: NotificationPriority;
  scheduledFor: Date;
  expiresAt?: Date;
  groupKey?: string;
  metadata?: any;
}

export interface BulkNotificationData {
  userIds: string[];
  type: NotificationType;
  variables: Record<string, string>;
  priority?: NotificationPriority;
  scheduledFor?: Date;
  expiresAt?: Date;
  groupKey?: string;
  metadata?: any;
}

export interface NotificationCampaign {
  id: string;
  name: string;
  description?: string;
  type: NotificationType;
  targetSegment: 'all' | 'active' | 'inactive' | 'new' | 'custom';
  customUserIds?: string[];
  variables: Record<string, string>;
  priority: NotificationPriority;
  scheduledFor: Date;
  expiresAt?: Date;
  isActive: boolean;
  createdAt: Date;
  metadata?: any;
}

@Injectable()
export class NotificationSchedulerService {
  private readonly logger = new Logger(NotificationSchedulerService.name);
  private campaigns: Map<string, NotificationCampaign> = new Map();

  constructor(
    @InjectRepository(Notification)
    private readonly notificationRepository: EntityRepository<Notification>,
    @InjectRepository(User)
    private readonly userRepository: EntityRepository<User>,
    private readonly em: EntityManager,
    private readonly notificationService: NotificationService,
    private readonly templateService: NotificationTemplateService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Schedule a single notification for future delivery
   */
  async scheduleNotification(data: ScheduledNotificationData): Promise<Notification> {
    const user = await this.userRepository.findOne({ id: data.userId });
    if (!user) {
      throw new Error(`User ${data.userId} not found`);
    }

    const template = this.templateService.getTemplate(data.type);
    if (!template) {
      throw new Error(`Template for notification type ${data.type} not found`);
    }

    const rendered = this.templateService.renderNotification(data.type, data.variables);
    if (!rendered) {
      throw new Error(`Failed to render notification for type ${data.type}`);
    }

    const notification = new Notification({
      user,
      type: data.type,
      title: rendered.title,
      body: rendered.body,
      data: data.variables,
      priority: data.priority || template.priority,
      scheduledFor: data.scheduledFor,
      expiresAt: data.expiresAt || this.templateService.getExpirationDate(data.type),
      deepLinkUrl: this.templateService.getDeepLink(data.type, data.variables),
      groupKey: data.groupKey || this.templateService.getGroupKey(data.type, data.variables),
      metadata: {
        ...data.metadata,
        templateId: data.type,
        isScheduled: true,
      },
    });

    this.em.persist(notification);
    await this.em.flush();

    this.logger.log(`Scheduled notification ${notification.id} for user ${data.userId} at ${data.scheduledFor}`);
    return notification;
  }

  /**
   * Schedule bulk notifications for multiple users
   */
  async scheduleBulkNotifications(data: BulkNotificationData): Promise<Notification[]> {
    const users = await this.userRepository.find({ id: { $in: data.userIds } });
    
    if (users.length === 0) {
      throw new Error('No valid users found for bulk notification');
    }

    const template = this.templateService.getTemplate(data.type);
    if (!template) {
      throw new Error(`Template for notification type ${data.type} not found`);
    }

    const rendered = this.templateService.renderNotification(data.type, data.variables);
    if (!rendered) {
      throw new Error(`Failed to render notification for type ${data.type}`);
    }

    const notifications = users.map(user => new Notification({
      user,
      type: data.type,
      title: rendered.title,
      body: rendered.body,
      data: data.variables,
      priority: data.priority || template.priority,
      scheduledFor: data.scheduledFor,
      expiresAt: data.expiresAt || this.templateService.getExpirationDate(data.type),
      deepLinkUrl: this.templateService.getDeepLink(data.type, data.variables),
      groupKey: data.groupKey || this.templateService.getGroupKey(data.type, data.variables),
      metadata: {
        ...data.metadata,
        templateId: data.type,
        isScheduled: !!data.scheduledFor,
        isBulk: true,
        batchId: `bulk_${Date.now()}`,
      },
    }));

    this.em.persist(notifications);
    await this.em.flush();

    this.logger.log(`Scheduled ${notifications.length} bulk notifications for type ${data.type}`);
    return notifications;
  }

  /**
   * Create and schedule a notification campaign
   */
  async createCampaign(campaign: Omit<NotificationCampaign, 'id' | 'createdAt'>): Promise<NotificationCampaign> {
    const campaignId = `campaign_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const newCampaign: NotificationCampaign = {
      ...campaign,
      id: campaignId,
      createdAt: new Date(),
    };

    this.campaigns.set(campaignId, newCampaign);

    // Schedule notifications for the campaign
    await this.executeCampaign(newCampaign);

    this.logger.log(`Created campaign ${campaignId}: ${campaign.name}`);
    return newCampaign;
  }

  /**
   * Execute a notification campaign
   */
  private async executeCampaign(campaign: NotificationCampaign): Promise<void> {
    if (!campaign.isActive) {
      this.logger.debug(`Campaign ${campaign.id} is not active, skipping execution`);
      return;
    }

    let targetUserIds: string[];

    if (campaign.targetSegment === 'custom' && campaign.customUserIds) {
      targetUserIds = campaign.customUserIds;
    } else {
      targetUserIds = await this.getUserIdsBySegment(campaign.targetSegment);
    }

    if (targetUserIds.length === 0) {
      this.logger.warn(`No users found for campaign ${campaign.id} with segment ${campaign.targetSegment}`);
      return;
    }

    await this.scheduleBulkNotifications({
      userIds: targetUserIds,
      type: campaign.type,
      variables: campaign.variables,
      priority: campaign.priority,
      scheduledFor: campaign.scheduledFor,
      expiresAt: campaign.expiresAt,
      metadata: {
        campaignId: campaign.id,
        campaignName: campaign.name,
        segment: campaign.targetSegment,
        ...campaign.metadata,
      },
    });

    this.logger.log(`Executed campaign ${campaign.id} for ${targetUserIds.length} users`);
  }

  /**
   * Get user IDs based on segment criteria
   */
  private async getUserIdsBySegment(segment: string): Promise<string[]> {
    switch (segment) {
      case 'all':
        const allUsers = await this.userRepository.find({
          isActive: true,
          fcmToken: { $ne: null },
        }, { fields: ['id'] });
        return allUsers.map(user => user.id);

      case 'active':
        const activeUsers = await this.userRepository.find({
          isActive: true,
          lastLoginAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
          fcmToken: { $ne: null },
        }, { fields: ['id'] });
        return activeUsers.map(user => user.id);

      case 'inactive':
        const inactiveUsers = await this.userRepository.find({
          isActive: true,
          $or: [
            { lastLoginAt: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
            { lastLoginAt: null },
          ],
          fcmToken: { $ne: null },
        }, { fields: ['id'] });
        return inactiveUsers.map(user => user.id);

      case 'new':
        const newUsers = await this.userRepository.find({
          isActive: true,
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
          fcmToken: { $ne: null },
        }, { fields: ['id'] });
        return newUsers.map(user => user.id);

      default:
        return [];
    }
  }

  /**
   * Process pending scheduled notifications (runs every minute)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async processPendingNotifications(): Promise<void> {
    const now = new Date();
    
    const pendingNotifications = await this.notificationRepository.find({
      status: NotificationStatus.PENDING,
      scheduledFor: { $lte: now },
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: now } },
      ],
    }, {
      limit: 100, // Process in batches
      orderBy: { scheduledFor: 'ASC' },
    });

    if (pendingNotifications.length === 0) {
      return;
    }

    this.logger.debug(`Processing ${pendingNotifications.length} pending notifications`);

    for (const notification of pendingNotifications) {
      try {
        const success = await this.notificationService.sendNotification({
          title: notification.title,
          body: notification.body,
          type: notification.type as any,
          userId: notification.userId,
          priority: notification.priority === NotificationPriority.HIGH ? 'high' : 'normal',
          data: notification.data || {},
          imageUrl: notification.imageUrl,
        });

        if (success) {
          notification.markAsDelivered();
        } else {
          notification.markAsFailed('Failed to send via FCM');
        }
      } catch (error) {
        this.logger.error(`Failed to send notification ${notification.id}:`, error);
        notification.markAsFailed(error instanceof Error ? error.message : 'Unknown error');
      }
    }

    await this.em.flush();
  }

  /**
   * Clean up expired notifications (runs daily at 2 AM)
   */
  @Cron('0 2 * * *')
  async cleanupExpiredNotifications(): Promise<void> {
    const now = new Date();
    
    const expiredNotifications = await this.notificationRepository.find({
      $or: [
        { 
          status: NotificationStatus.PENDING,
          expiresAt: { $lt: now },
        },
        {
          status: { $in: [NotificationStatus.DELIVERED, NotificationStatus.READ] },
          createdAt: { $lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) }, // 30 days old
        },
      ],
    });

    if (expiredNotifications.length === 0) {
      return;
    }

    // Mark expired pending notifications as cancelled
    const expiredPending = expiredNotifications.filter(
      n => n.status === NotificationStatus.PENDING
    );
    expiredPending.forEach(notification => notification.markAsCancelled());

    // Remove old delivered/read notifications
    const oldNotifications = expiredNotifications.filter(
      n => n.status === NotificationStatus.DELIVERED || n.status === NotificationStatus.READ
    );
    
    this.em.remove(oldNotifications);
    await this.em.flush();

    this.logger.log(
      `Cleaned up ${expiredPending.length} expired pending notifications and ` +
      `${oldNotifications.length} old delivered notifications`
    );
  }

  /**
   * Retry failed notifications (runs every 30 minutes)
   */
  @Cron('*/30 * * * *')
  async retryFailedNotifications(): Promise<void> {
    const failedNotifications = await this.notificationRepository.find({
      status: NotificationStatus.FAILED,
      retryCount: { $lt: 3 }, // Max 3 retries
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Within last 24 hours
    }, {
      limit: 50, // Process in batches
      orderBy: { updatedAt: 'ASC' },
    });

    if (failedNotifications.length === 0) {
      return;
    }

    this.logger.debug(`Retrying ${failedNotifications.length} failed notifications`);

    for (const notification of failedNotifications) {
      try {
        if (!notification.canRetry()) {
          continue;
        }

        const success = await this.notificationService.sendNotification({
          title: notification.title,
          body: notification.body,
          type: notification.type as any,
          userId: notification.userId,
          priority: notification.priority === NotificationPriority.HIGH ? 'high' : 'normal',
          data: notification.data || {},
          imageUrl: notification.imageUrl,
        });

        if (success) {
          notification.markAsDelivered();
          this.logger.debug(`Successfully retried notification ${notification.id}`);
        } else {
          notification.markAsFailed('Retry failed - FCM send unsuccessful');
        }
      } catch (error) {
        this.logger.error(`Failed to retry notification ${notification.id}:`, error);
        notification.markAsFailed(`Retry failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    await this.em.flush();
  }

  /**
   * Get campaign by ID
   */
  getCampaign(campaignId: string): NotificationCampaign | undefined {
    return this.campaigns.get(campaignId);
  }

  /**
   * Get all campaigns
   */
  getAllCampaigns(): NotificationCampaign[] {
    return Array.from(this.campaigns.values());
  }

  /**
   * Update campaign
   */
  updateCampaign(campaignId: string, updates: Partial<NotificationCampaign>): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;

    const updatedCampaign = { ...campaign, ...updates };
    this.campaigns.set(campaignId, updatedCampaign);
    return true;
  }

  /**
   * Cancel campaign
   */
  cancelCampaign(campaignId: string): boolean {
    const campaign = this.campaigns.get(campaignId);
    if (!campaign) return false;

    campaign.isActive = false;
    this.campaigns.set(campaignId, campaign);

    // Cancel pending notifications for this campaign
    this.cancelCampaignNotifications(campaignId);

    this.logger.log(`Cancelled campaign ${campaignId}`);
    return true;
  }

  /**
   * Cancel all pending notifications for a campaign
   */
  private async cancelCampaignNotifications(campaignId: string): Promise<void> {
    const pendingNotifications = await this.notificationRepository.find({
      status: NotificationStatus.PENDING,
      metadata: { $contains: { campaignId } },
    });

    pendingNotifications.forEach(notification => notification.markAsCancelled());
    await this.em.flush();

    this.logger.log(`Cancelled ${pendingNotifications.length} pending notifications for campaign ${campaignId}`);
  }

  /**
   * Get notification statistics
   */
  async getNotificationStats(days: number = 30): Promise<{
    total: number;
    delivered: number;
    read: number;
    failed: number;
    pending: number;
    deliveryRate: number;
    readRate: number;
  }> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    const query = `
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered,
        COUNT(CASE WHEN status = 'read' THEN 1 END) as read,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending
      FROM notifications
      WHERE created_at >= $1
    `;
    
    const stats = await this.em.getConnection().execute(query, [since]);
    const result = stats[0] || { total: 0, delivered: 0, read: 0, failed: 0, pending: 0 };
    
    return {
      ...result,
      deliveryRate: result.total > 0 ? (result.delivered + result.read) / result.total : 0,
      readRate: (result.delivered + result.read) > 0 ? result.read / (result.delivered + result.read) : 0,
    };
  }
}