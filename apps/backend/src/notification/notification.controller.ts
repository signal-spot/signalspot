import {
  Controller,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Request } from 'express';

@Controller('notifications-push')
@UseGuards(JwtAuthGuard)
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post('token')
  @HttpCode(HttpStatus.OK)
  async updatePushToken(
    @Req() req: Request,
    @Body() body: { token: string; platform: 'fcm' | 'apns' },
  ) {
    const userId = (req as any).user.id;
    await this.notificationService.updatePushToken(userId, body.token, body.platform);
    
    return {
      success: true,
      message: 'Push token updated successfully',
    };
  }

  @Delete('token/:platform')
  async removePushToken(
    @Req() req: Request,
    @Param('platform') platform: 'fcm' | 'apns',
  ) {
    const userId = (req as any).user.id;
    await this.notificationService.removePushToken(userId, platform);
    
    return {
      success: true,
      message: 'Push token removed successfully',
    };
  }

  @Put('settings')
  async updateNotificationSettings(
    @Req() req: Request,
    @Body() settings: {
      pushEnabled?: boolean;
      emailEnabled?: boolean;
      smsEnabled?: boolean;
      spotCreated?: boolean;
      spotLiked?: boolean;
      spotCommented?: boolean;
      messageReceived?: boolean;
      sparkReceived?: boolean;
      systemAnnouncements?: boolean;
    },
  ) {
    const userId = (req as any).user.id;
    await this.notificationService.updateNotificationSettings(userId, settings);
    
    return {
      success: true,
      message: 'Notification settings updated successfully',
    };
  }

  @Post('test')
  @HttpCode(HttpStatus.OK)
  async sendTestNotification(@Req() req: Request) {
    const userId = (req as any).user.id;
    
    const result = await this.notificationService.sendPushNotification(userId, {
      title: 'Test Notification',
      body: 'This is a test notification from SignalSpot',
      data: {
        type: 'test',
        timestamp: new Date().toISOString(),
      },
      priority: 'high',
    });
    
    return {
      success: result.success,
      platform: result.platform,
      error: result.error,
    };
  }
}