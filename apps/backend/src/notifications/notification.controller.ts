import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpStatus,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationService } from './notification.service';
import { NotificationSchedulerService, ScheduledNotificationData, BulkNotificationData, NotificationCampaign } from './services/notification-scheduler.service';
import { NotificationTemplateService } from './services/notification-template.service';
import { InjectRepository } from '@mikro-orm/nestjs';
import { EntityRepository, EntityManager } from '@mikro-orm/core';
import { Notification, NotificationStatus, NotificationType, NotificationPriority } from './entities/notification.entity';

class UpdateFCMTokenDto {
  fcmToken: string;
}

class SendNotificationDto {
  userId: string;
  type: NotificationType;
  variables: Record<string, string>;
  priority?: NotificationPriority;
  scheduledFor?: Date;
  expiresAt?: Date;
  groupKey?: string;
  metadata?: any;
}

class BulkNotificationDto {
  userIds: string[];
  type: NotificationType;
  variables: Record<string, string>;
  priority?: NotificationPriority;
  scheduledFor?: Date;
  expiresAt?: Date;
  groupKey?: string;
  metadata?: any;
}

class CreateCampaignDto {
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
  metadata?: any;
}

class MarkAsReadDto {
  notificationIds: string[];
}

@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(
    private readonly notificationService: NotificationService,
    private readonly schedulerService: NotificationSchedulerService,
    private readonly templateService: NotificationTemplateService,
    @InjectRepository(Notification)
    private readonly notificationRepository: EntityRepository<Notification>,
    private readonly em: EntityManager,
  ) {}

  @Post('fcm-token')
  @ApiOperation({ summary: 'Update user FCM token' })
  @ApiResponse({ status: 200, description: 'FCM token updated successfully' })
  async updateFCMToken(@Request() req: any, @Body() body: UpdateFCMTokenDto) {
    const userId = req.user.id;
    await this.notificationService.updateUserFCMToken(userId, body.fcmToken);
    return { success: true, message: 'FCM token updated successfully' };
  }

  @Delete('fcm-token')
  @ApiOperation({ summary: 'Remove user FCM token' })
  @ApiResponse({ status: 200, description: 'FCM token removed successfully' })
  async removeFCMToken(@Request() req: any) {
    const userId = req.user.id;
    await this.notificationService.removeUserFCMToken(userId);
    return { success: true, message: 'FCM token removed successfully' };
  }

  @Get()
  @ApiOperation({ summary: 'Get user notifications' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: NotificationStatus })
  @ApiQuery({ name: 'type', required: false, enum: NotificationType })
  @ApiResponse({ status: 200, description: 'Notifications retrieved successfully' })
  async getUserNotifications(
    @Request() req: any,
    @Query('limit') limit: number = 20,
    @Query('offset') offset: number = 0,
    @Query('status') status?: NotificationStatus,
    @Query('type') type?: NotificationType,
  ) {
    const userId = req.user.id;
    
    const where: any = { userId };
    if (status) where.status = status;
    if (type) where.type = type;

    const [notifications, total] = await this.notificationRepository.findAndCount(
      where,
      {
        limit: Math.min(limit, 100),
        offset,
        orderBy: { createdAt: 'DESC' },
      }
    );

    const unreadCount = await this.notificationRepository.count({
      user: userId,
      status: { $in: [NotificationStatus.PENDING, NotificationStatus.DELIVERED] },
    });

    return {
      notifications,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + notifications.length < total,
      },
      unreadCount,
    };
  }

  @Put(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  async markAsRead(@Request() req: any, @Param('id') notificationId: string) {
    const userId = req.user.id;
    
    const notification = await this.notificationRepository.findOne({
      id: notificationId,
      user: userId,
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.markAsRead();
    await this.em.flush();

    return { success: true, message: 'Notification marked as read' };
  }

  @Put('read-bulk')
  @ApiOperation({ summary: 'Mark multiple notifications as read' })
  @ApiResponse({ status: 200, description: 'Notifications marked as read' })
  async markBulkAsRead(@Request() req: any, @Body() body: MarkAsReadDto) {
    const userId = req.user.id;
    
    const notifications = await this.notificationRepository.find({
      id: { $in: body.notificationIds },
      user: userId,
    });

    notifications.forEach(notification => notification.markAsRead());
    await this.em.flush();

    return { 
      success: true, 
      message: `${notifications.length} notifications marked as read`,
      updatedCount: notifications.length,
    };
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  async markAllAsRead(@Request() req: any) {
    const userId = req.user.id;
    
    const notifications = await this.notificationRepository.find({
      user: userId,
      status: { $in: [NotificationStatus.PENDING, NotificationStatus.DELIVERED] },
    });

    notifications.forEach(notification => notification.markAsRead());
    await this.em.flush();

    return { 
      success: true, 
      message: `${notifications.length} notifications marked as read`,
      updatedCount: notifications.length,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiResponse({ status: 200, description: 'Notification deleted' })
  async deleteNotification(@Request() req: any, @Param('id') notificationId: string) {
    const userId = req.user.id;
    
    const notification = await this.notificationRepository.findOne({
      id: notificationId,
      user: userId,
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    this.em.remove(notification);
    await this.em.flush();

    return { success: true, message: 'Notification deleted' };
  }

  @Get('templates')
  @ApiOperation({ summary: 'Get all notification templates' })
  @ApiResponse({ status: 200, description: 'Templates retrieved successfully' })
  async getTemplates() {
    const templates = this.templateService.getAllTemplates();
    return { templates };
  }

  @Get('templates/:type')
  @ApiOperation({ summary: 'Get notification template by type' })
  @ApiResponse({ status: 200, description: 'Template retrieved successfully' })
  async getTemplate(@Param('type') type: NotificationType) {
    const template = this.templateService.getTemplate(type);
    if (!template) {
      throw new NotFoundException('Template not found');
    }
    return { template };
  }

  @Post('send')
  @ApiOperation({ summary: 'Send immediate notification' })
  @ApiResponse({ status: 200, description: 'Notification sent successfully' })
  async sendNotification(@Body() body: SendNotificationDto) {
    if (!this.templateService.validateVariables(body.type, body.variables)) {
      const requiredVars = this.templateService.getRequiredVariables(body.type);
      throw new BadRequestException(`Missing required variables: ${requiredVars.join(', ')}`);
    }

    if (body.scheduledFor) {
      const notification = await this.schedulerService.scheduleNotification({
        userId: body.userId,
        type: body.type as any,
        variables: body.variables,
        priority: body.priority,
        scheduledFor: new Date(body.scheduledFor),
        expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
        groupKey: body.groupKey,
        metadata: body.metadata,
      });

      return {
        success: true,
        message: 'Notification scheduled successfully',
        notificationId: notification.id,
        scheduledFor: notification.scheduledFor,
      };
    } else {
      const rendered = this.templateService.renderNotification(body.type, body.variables);
      if (!rendered) {
        throw new BadRequestException('Failed to render notification template');
      }

      const success = await this.notificationService.sendNotification({
        title: rendered.title,
        body: rendered.body,
        type: body.type as any,
        userId: body.userId,
        priority: body.priority === NotificationPriority.HIGH ? 'high' : 'normal',
        data: body.variables,
      });

      return {
        success,
        message: success ? 'Notification sent successfully' : 'Failed to send notification',
      };
    }
  }

  @Post('send-bulk')
  @ApiOperation({ summary: 'Send bulk notifications' })
  @ApiResponse({ status: 200, description: 'Bulk notifications sent successfully' })
  async sendBulkNotification(@Body() body: BulkNotificationDto) {
    if (!this.templateService.validateVariables(body.type, body.variables)) {
      const requiredVars = this.templateService.getRequiredVariables(body.type);
      throw new BadRequestException(`Missing required variables: ${requiredVars.join(', ')}`);
    }

    const notifications = await this.schedulerService.scheduleBulkNotifications({
      userIds: body.userIds,
      type: body.type,
      variables: body.variables,
      priority: body.priority,
      scheduledFor: body.scheduledFor ? new Date(body.scheduledFor) : undefined,
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      groupKey: body.groupKey,
      metadata: body.metadata,
    });

    return {
      success: true,
      message: `${notifications.length} notifications scheduled successfully`,
      notificationCount: notifications.length,
      scheduledFor: body.scheduledFor,
    };
  }

  @Post('campaigns')
  @ApiOperation({ summary: 'Create notification campaign' })
  @ApiResponse({ status: 201, description: 'Campaign created successfully' })
  async createCampaign(@Body() body: CreateCampaignDto) {
    if (!this.templateService.validateVariables(body.type, body.variables)) {
      const requiredVars = this.templateService.getRequiredVariables(body.type);
      throw new BadRequestException(`Missing required variables: ${requiredVars.join(', ')}`);
    }

    const campaign = await this.schedulerService.createCampaign({
      name: body.name,
      description: body.description,
      type: body.type,
      targetSegment: body.targetSegment,
      customUserIds: body.customUserIds,
      variables: body.variables,
      priority: body.priority,
      scheduledFor: new Date(body.scheduledFor),
      expiresAt: body.expiresAt ? new Date(body.expiresAt) : undefined,
      isActive: body.isActive,
      metadata: body.metadata,
    });

    return {
      success: true,
      message: 'Campaign created successfully',
      campaign,
    };
  }

  @Get('campaigns')
  @ApiOperation({ summary: 'Get all notification campaigns' })
  @ApiResponse({ status: 200, description: 'Campaigns retrieved successfully' })
  async getCampaigns() {
    const campaigns = this.schedulerService.getAllCampaigns();
    return { campaigns };
  }

  @Get('campaigns/:id')
  @ApiOperation({ summary: 'Get campaign by ID' })
  @ApiResponse({ status: 200, description: 'Campaign retrieved successfully' })
  async getCampaign(@Param('id') campaignId: string) {
    const campaign = this.schedulerService.getCampaign(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }
    return { campaign };
  }

  @Put('campaigns/:id/cancel')
  @ApiOperation({ summary: 'Cancel campaign' })
  @ApiResponse({ status: 200, description: 'Campaign cancelled successfully' })
  async cancelCampaign(@Param('id') campaignId: string) {
    const success = this.schedulerService.cancelCampaign(campaignId);
    if (!success) {
      throw new NotFoundException('Campaign not found');
    }

    return {
      success: true,
      message: 'Campaign cancelled successfully',
    };
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get notification statistics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStats(@Query('days') days: number = 30) {
    const stats = await this.schedulerService.getNotificationStats(days);
    return { stats, period: `${days} days` };
  }

  @Get('user-stats')
  @ApiOperation({ summary: 'Get user notification statistics' })
  @ApiQuery({ name: 'days', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'User statistics retrieved successfully' })
  async getUserStats(@Request() req: any, @Query('days') days: number = 30) {
    const userId = req.user.id;
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const query = `
      SELECT 
        type,
        COUNT(*) as total,
        COUNT(CASE WHEN status = 'read' THEN 1 END) as read,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered
      FROM notifications
      WHERE user_id = $1 AND created_at >= $2
      GROUP BY type
    `;
    
    const stats = await this.em.getConnection().execute(query, [userId, since]);

    const totalCount = await this.notificationRepository.count({
      user: userId,
      createdAt: { $gte: since },
    });

    const unreadCount = await this.notificationRepository.count({
      user: userId,
      status: { $in: [NotificationStatus.PENDING, NotificationStatus.DELIVERED] },
    });

    return {
      stats: {
        total: totalCount,
        unread: unreadCount,
        byType: stats,
      },
      period: `${days} days`,
    };
  }

  @Post('topics/:topic/subscribe')
  @ApiOperation({ summary: 'Subscribe to notification topic' })
  @ApiResponse({ status: 200, description: 'Subscribed to topic successfully' })
  async subscribeToTopic(@Request() req: any, @Param('topic') topic: string) {
    const userId = req.user.id;
    const success = await this.notificationService.subscribeToTopic(userId, topic);
    
    return {
      success,
      message: success ? `Subscribed to topic: ${topic}` : 'Failed to subscribe to topic',
    };
  }

  @Post('topics/:topic/unsubscribe')
  @ApiOperation({ summary: 'Unsubscribe from notification topic' })
  @ApiResponse({ status: 200, description: 'Unsubscribed from topic successfully' })
  async unsubscribeFromTopic(@Request() req: any, @Param('topic') topic: string) {
    const userId = req.user.id;
    const success = await this.notificationService.unsubscribeFromTopic(userId, topic);
    
    return {
      success,
      message: success ? `Unsubscribed from topic: ${topic}` : 'Failed to unsubscribe from topic',
    };
  }

  @Post('topics/:topic/send')
  @ApiOperation({ summary: 'Send topic notification' })
  @ApiResponse({ status: 200, description: 'Topic notification sent successfully' })
  async sendTopicNotification(
    @Param('topic') topic: string,
    @Body() body: { title: string; body: string; data?: Record<string, string> }
  ) {
    const success = await this.notificationService.sendTopicNotification(
      topic,
      body.title,
      body.body,
      body.data
    );

    return {
      success,
      message: success ? 'Topic notification sent successfully' : 'Failed to send topic notification',
    };
  }
}