import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Logger,
  ParseFloatPipe,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { User } from '../../entities/user.entity';
import {
  ContextEnhancementService,
  ContextData,
  ContextualSuggestion,
  ContextualInsight,
  SmartNotification,
} from '../services/context-enhancement.service';

@Controller('context')
@UseGuards(JwtAuthGuard)
export class ContextController {
  private readonly logger = new Logger(ContextController.name);

  constructor(
    private readonly contextEnhancementService: ContextEnhancementService,
  ) {}

  /**
   * Get comprehensive context data for the user
   * GET /context/data?latitude=X&longitude=Y
   */
  @Get('data')
  async getContextData(
    @GetUser() user: User,
    @Query('latitude', new ParseFloatPipe({ optional: true })) latitude?: number,
    @Query('longitude', new ParseFloatPipe({ optional: true })) longitude?: number,
  ): Promise<ContextData> {
    this.logger.log(`Context data request from user ${user.id}`);
    
    const location = latitude && longitude ? { latitude, longitude } : undefined;
    
    return this.contextEnhancementService.getContextData(user.id, location);
  }

  /**
   * Get contextual suggestions based on user's current context
   * POST /context/suggestions
   */
  @Post('suggestions')
  async getContextualSuggestions(
    @GetUser() user: User,
    @Body() contextData: ContextData,
  ): Promise<ContextualSuggestion[]> {
    this.logger.log(`Contextual suggestions request from user ${user.id}`);
    
    // Ensure the context data is for the authenticated user
    if (contextData.userId !== user.id) {
      contextData.userId = user.id;
    }
    
    return this.contextEnhancementService.getContextualSuggestions(contextData);
  }

  /**
   * Get contextual insights about user behavior
   * GET /context/insights?timeframe=week
   */
  @Get('insights')
  async getContextualInsights(
    @GetUser() user: User,
    @Query('timeframe') timeframe: 'day' | 'week' | 'month' = 'week',
  ): Promise<ContextualInsight[]> {
    this.logger.log(`Contextual insights request from user ${user.id} for ${timeframe}`);
    
    return this.contextEnhancementService.getContextualInsights(user.id, timeframe);
  }

  /**
   * Get smart notifications based on current context
   * POST /context/notifications
   */
  @Post('notifications')
  async getSmartNotifications(
    @GetUser() user: User,
    @Body() contextData: ContextData,
  ): Promise<SmartNotification[]> {
    this.logger.log(`Smart notifications request from user ${user.id}`);
    
    // Ensure the context data is for the authenticated user
    if (contextData.userId !== user.id) {
      contextData.userId = user.id;
    }
    
    return this.contextEnhancementService.generateSmartNotifications(contextData);
  }

  /**
   * Get context-aware content recommendations
   * POST /context/recommendations
   */
  @Post('recommendations')
  async getContextualRecommendations(
    @GetUser() user: User,
    @Body() contextData: ContextData,
  ): Promise<Array<{
    contentId: string;
    contentType: 'spot' | 'spark';
    reason: string;
    score: number;
  }>> {
    this.logger.log(`Contextual recommendations request from user ${user.id}`);
    
    // Ensure the context data is for the authenticated user
    if (contextData.userId !== user.id) {
      contextData.userId = user.id;
    }
    
    return this.contextEnhancementService.getContextualContentRecommendations(contextData);
  }

  /**
   * Get quick contextual suggestions (lightweight version)
   * GET /context/quick-suggestions?latitude=X&longitude=Y
   */
  @Get('quick-suggestions')
  async getQuickSuggestions(
    @GetUser() user: User,
    @Query('latitude', new ParseFloatPipe({ optional: true })) latitude?: number,
    @Query('longitude', new ParseFloatPipe({ optional: true })) longitude?: number,
  ): Promise<ContextualSuggestion[]> {
    this.logger.log(`Quick suggestions request from user ${user.id}`);
    
    try {
      const location = latitude && longitude ? { latitude, longitude } : undefined;
      
      // Get minimal context data for quick suggestions
      const contextData = await this.contextEnhancementService.getContextData(user.id, location);
      
      // Generate only high-priority suggestions
      const allSuggestions = await this.contextEnhancementService.getContextualSuggestions(contextData);
      
      return allSuggestions
        .filter(suggestion => suggestion.priority === 'high' || suggestion.priority === 'urgent')
        .slice(0, 3);
    } catch (error) {
      this.logger.error(`Error getting quick suggestions for user ${user.id}: ${error.message}`);
      return [];
    }
  }

  /**
   * Get contextual health check - system status and recommendations
   * GET /context/health
   */
  @Get('health')
  async getContextualHealth(
    @GetUser() user: User,
  ): Promise<{
    status: 'healthy' | 'warning' | 'critical';
    issues: string[];
    recommendations: string[];
    score: number;
  }> {
    this.logger.log(`Contextual health check request from user ${user.id}`);
    
    try {
      // Get recent insights to assess user's digital wellness
      const insights = await this.contextEnhancementService.getContextualInsights(user.id, 'week');
      
      const issues: string[] = [];
      const recommendations: string[] = [];
      let score = 1.0;
      
      // Analyze insights for potential issues
      insights.forEach(insight => {
        if (insight.category === 'behavioral') {
          if (insight.insight.includes('very active')) {
            issues.push('High activity levels detected');
            recommendations.push('Consider taking breaks between sessions');
            score -= 0.1;
          }
        }
        
        if (insight.category === 'social') {
          if (insight.insight.includes('0 new connections')) {
            issues.push('Limited social interactions');
            recommendations.push('Try exploring new areas or joining group activities');
            score -= 0.2;
          }
        }
        
        if (insight.category === 'spatial') {
          if (insight.insight.includes('1 unique')) {
            issues.push('Limited location exploration');
            recommendations.push('Consider visiting new places to discover different communities');
            score -= 0.1;
          }
        }
      });
      
      // Determine overall status
      let status: 'healthy' | 'warning' | 'critical' = 'healthy';
      if (score < 0.7) status = 'warning';
      if (score < 0.5) status = 'critical';
      
      if (issues.length === 0) {
        recommendations.push('Great job! Your usage patterns look healthy');
      }
      
      return {
        status,
        issues,
        recommendations,
        score: Math.max(0, score),
      };
    } catch (error) {
      this.logger.error(`Error getting contextual health for user ${user.id}: ${error.message}`);
      return {
        status: 'critical',
        issues: ['Unable to assess contextual health'],
        recommendations: ['Please try again later'],
        score: 0,
      };
    }
  }

  /**
   * Update user context (for client-side context updates)
   * POST /context/update
   */
  @Post('update')
  async updateContext(
    @GetUser() user: User,
    @Body() contextUpdate: {
      location?: { latitude: number; longitude: number };
      deviceInfo?: { platform: string; version: string; batteryLevel?: number };
      sessionInfo?: { duration: number; activityLevel: string };
    },
  ): Promise<{ success: boolean; message: string }> {
    this.logger.log(`Context update from user ${user.id}`);
    
    try {
      // In a real implementation, this would update the user's context in a cache or database
      // For now, just acknowledge the update
      
      this.logger.debug(`Context update for user ${user.id}: ${JSON.stringify(contextUpdate)}`);
      
      return {
        success: true,
        message: 'Context updated successfully',
      };
    } catch (error) {
      this.logger.error(`Error updating context for user ${user.id}: ${error.message}`);
      return {
        success: false,
        message: 'Failed to update context',
      };
    }
  }
}