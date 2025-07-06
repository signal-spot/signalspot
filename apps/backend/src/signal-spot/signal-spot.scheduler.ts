import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SignalSpotService } from './signal-spot.service';
import { SignalSpotDomainService } from '../domain/signal-spot.domain-service';

@Injectable()
export class SignalSpotScheduler {
  private readonly logger = new Logger(SignalSpotScheduler.name);

  constructor(
    private readonly signalSpotService: SignalSpotService,
    private readonly signalSpotDomainService: SignalSpotDomainService
  ) {}

  // Run every 5 minutes to expire spots
  @Cron('*/5 * * * *', {
    name: 'expire-signal-spots',
    timeZone: 'UTC'
  })
  async expireSignalSpots() {
    try {
      this.logger.log('Starting automatic spot expiration process...');
      
      const expiredCount = await this.signalSpotService.expireSpots();
      
      if (expiredCount > 0) {
        this.logger.log(`Successfully expired ${expiredCount} spots`);
      } else {
        this.logger.debug('No spots to expire');
      }
    } catch (error) {
      this.logger.error('Error during spot expiration process', error);
    }
  }

  // Run every hour to clean up old expired spots
  @Cron(CronExpression.EVERY_HOUR, {
    name: 'cleanup-expired-spots',
    timeZone: 'UTC'
  })
  async cleanupExpiredSpots() {
    try {
      this.logger.log('Starting cleanup of old expired spots...');
      
      // Remove spots that have been expired for more than 7 days
      const cleanedCount = await this.signalSpotService.cleanupExpiredSpots(168);
      
      if (cleanedCount > 0) {
        this.logger.log(`Successfully cleaned up ${cleanedCount} old expired spots`);
      } else {
        this.logger.debug('No old expired spots to clean up');
      }
    } catch (error) {
      this.logger.error('Error during expired spots cleanup process', error);
    }
  }

  // Run every 30 minutes to find spots that need attention
  @Cron('*/30 * * * *', {
    name: 'check-spots-needing-attention',
    timeZone: 'UTC'
  })
  async checkSpotsNeedingAttention() {
    try {
      this.logger.log('Checking for spots needing attention...');
      
      const spotsNeedingAttention = await this.signalSpotDomainService.findSpotsNeedingAttention(60);
      
      if (spotsNeedingAttention.length > 0) {
        this.logger.log(`Found ${spotsNeedingAttention.length} spots expiring in the next hour`);
        
        // Here you could implement notifications to spot creators
        // For now, we'll just log the information
        for (const spot of spotsNeedingAttention) {
          this.logger.debug(`Spot ${spot.id} by user ${spot.creator.id} expires at ${spot.expiresAt}`);
        }
      } else {
        this.logger.debug('No spots needing immediate attention');
      }
    } catch (error) {
      this.logger.error('Error checking spots needing attention', error);
    }
  }

  // Run daily to generate statistics and analytics
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, {
    name: 'generate-daily-stats',
    timeZone: 'UTC'
  })
  async generateDailyStatistics() {
    try {
      this.logger.log('Generating daily SignalSpot statistics...');
      
      // This is a placeholder for daily statistics generation
      // You could implement metrics collection, reporting, etc.
      
      this.logger.log('Daily statistics generation completed');
    } catch (error) {
      this.logger.error('Error generating daily statistics', error);
    }
  }

  // Run weekly to clean up very old data
  @Cron(CronExpression.EVERY_WEEK, {
    name: 'weekly-cleanup',
    timeZone: 'UTC'
  })
  async weeklyCleanup() {
    try {
      this.logger.log('Starting weekly cleanup process...');
      
      // Remove spots that have been expired for more than 30 days
      const cleanedCount = await this.signalSpotService.cleanupExpiredSpots(720);
      
      if (cleanedCount > 0) {
        this.logger.log(`Weekly cleanup: Removed ${cleanedCount} very old spots`);
      } else {
        this.logger.debug('Weekly cleanup: No very old spots to remove');
      }
    } catch (error) {
      this.logger.error('Error during weekly cleanup process', error);
    }
  }
}