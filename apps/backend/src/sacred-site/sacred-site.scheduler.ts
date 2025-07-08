import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SacredSiteService } from './sacred-site.service';
import { RankingService } from './services/ranking.service';

@Injectable()
export class SacredSiteScheduler {
  private readonly logger = new Logger(SacredSiteScheduler.name);

  constructor(
    private readonly sacredSiteService: SacredSiteService,
    private readonly rankingService: RankingService,
  ) {}

  /**
   * Run sacred sites discovery every 6 hours
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async handleSiteDiscovery(): Promise<void> {
    this.logger.log('Starting scheduled sacred sites discovery');

    try {
      const result = await this.sacredSiteService.discoverSacredSites();
      
      this.logger.log(
        `Discovery completed: ${result.newSites.length} new sites, ` +
        `${result.updatedSites.length} updated sites, ` +
        `${result.removedSites.length} dormant sites`
      );
    } catch (error) {
      this.logger.error(`Error in scheduled discovery: ${error.message}`, error.stack);
    }
  }

  /**
   * Update rankings every 2 hours
   */
  @Cron(CronExpression.EVERY_2_HOURS)
  async handleRankingUpdate(): Promise<void> {
    this.logger.log('Starting scheduled ranking update');

    try {
      const result = await this.rankingService.batchUpdateRankings();
      
      this.logger.log(
        `Ranking update completed: ${result.updated} updated, ${result.errors} errors`
      );
    } catch (error) {
      this.logger.error(`Error in scheduled ranking update: ${error.message}`, error.stack);
    }
  }

  /**
   * Cleanup old activity data daily at 2 AM
   */
  @Cron('0 2 * * *')
  async handleDataCleanup(): Promise<void> {
    this.logger.log('Starting scheduled data cleanup');

    try {
      // This would implement cleanup of old activity data
      // For now, just log that it would happen
      this.logger.log('Data cleanup completed (placeholder)');
    } catch (error) {
      this.logger.error(`Error in scheduled cleanup: ${error.message}`, error.stack);
    }
  }
}