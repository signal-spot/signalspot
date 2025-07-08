export interface ShareAnalyticsEvent {
  eventType: 'share_initiated' | 'share_completed' | 'share_failed' | 'share_clicked';
  contentType: 'spot' | 'spark' | 'profile';
  contentId: string;
  platform: string;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface UserEngagementEvent {
  eventType: 'content_viewed' | 'content_liked' | 'content_commented' | 'content_saved';
  contentType: 'spot' | 'spark' | 'profile';
  contentId: string;
  userId?: string;
  source?: 'shared_link' | 'discovery' | 'search' | 'feed';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface ConversionEvent {
  eventType: 'app_install' | 'user_signup' | 'profile_created' | 'first_post';
  source: 'shared_link' | 'organic' | 'social' | 'other';
  referrer?: string;
  campaign?: string;
  userId?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AnalyticsConfig {
  apiEndpoint?: string;
  apiKey?: string;
  userId?: string;
  sessionId?: string;
  debugMode?: boolean;
}

export class AnalyticsService {
  private static instance: AnalyticsService;
  private config: AnalyticsConfig;
  private eventQueue: Array<ShareAnalyticsEvent | UserEngagementEvent | ConversionEvent> = [];
  private isOnline: boolean = true;
  private flushInterval?: NodeJS.Timeout;

  constructor(config: AnalyticsConfig = {}) {
    this.config = {
      apiEndpoint: 'https://api.signalspot.app/analytics',
      debugMode: false,
      ...config,
    };

    // Start periodic flush
    this.startPeriodicFlush();
  }

  static getInstance(config?: AnalyticsConfig): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService(config);
    }
    return AnalyticsService.instance;
  }

  /**
   * Update configuration
   */
  updateConfig(newConfig: Partial<AnalyticsConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  /**
   * Track sharing events
   */
  trackShare(event: Omit<ShareAnalyticsEvent, 'timestamp'>): void {
    const fullEvent: ShareAnalyticsEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.addToQueue(fullEvent);

    if (this.config.debugMode) {
      console.log('Share event tracked:', fullEvent);
    }
  }

  /**
   * Track user engagement events
   */
  trackEngagement(event: Omit<UserEngagementEvent, 'timestamp'>): void {
    const fullEvent: UserEngagementEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.addToQueue(fullEvent);

    if (this.config.debugMode) {
      console.log('Engagement event tracked:', fullEvent);
    }
  }

  /**
   * Track conversion events
   */
  trackConversion(event: Omit<ConversionEvent, 'timestamp'>): void {
    const fullEvent: ConversionEvent = {
      ...event,
      timestamp: new Date().toISOString(),
    };

    this.addToQueue(fullEvent);

    if (this.config.debugMode) {
      console.log('Conversion event tracked:', fullEvent);
    }
  }

  /**
   * Track share initiation
   */
  trackShareInitiated(
    contentType: 'spot' | 'spark' | 'profile',
    contentId: string,
    platform: string,
    metadata?: Record<string, any>
  ): void {
    this.trackShare({
      eventType: 'share_initiated',
      contentType,
      contentId,
      platform,
      userId: this.config.userId,
      metadata,
    });
  }

  /**
   * Track successful share completion
   */
  trackShareCompleted(
    contentType: 'spot' | 'spark' | 'profile',
    contentId: string,
    platform: string,
    metadata?: Record<string, any>
  ): void {
    this.trackShare({
      eventType: 'share_completed',
      contentType,
      contentId,
      platform,
      userId: this.config.userId,
      metadata,
    });
  }

  /**
   * Track failed share
   */
  trackShareFailed(
    contentType: 'spot' | 'spark' | 'profile',
    contentId: string,
    platform: string,
    error: string,
    metadata?: Record<string, any>
  ): void {
    this.trackShare({
      eventType: 'share_failed',
      contentType,
      contentId,
      platform,
      userId: this.config.userId,
      metadata: {
        ...metadata,
        error,
      },
    });
  }

  /**
   * Track shared content click (when someone clicks a shared link)
   */
  trackSharedContentClick(
    contentType: 'spot' | 'spark' | 'profile',
    contentId: string,
    platform: string,
    referrer?: string,
    metadata?: Record<string, any>
  ): void {
    this.trackShare({
      eventType: 'share_clicked',
      contentType,
      contentId,
      platform,
      metadata: {
        ...metadata,
        referrer,
      },
    });
  }

  /**
   * Track content view from shared link
   */
  trackSharedContentView(
    contentType: 'spot' | 'spark' | 'profile',
    contentId: string,
    source: string,
    metadata?: Record<string, any>
  ): void {
    this.trackEngagement({
      eventType: 'content_viewed',
      contentType,
      contentId,
      userId: this.config.userId,
      source: 'shared_link',
      metadata: {
        ...metadata,
        shareSource: source,
      },
    });
  }

  /**
   * Track app install from shared link
   */
  trackAppInstallFromShare(
    referrer: string,
    campaign?: string,
    metadata?: Record<string, any>
  ): void {
    this.trackConversion({
      eventType: 'app_install',
      source: 'shared_link',
      referrer,
      campaign,
      metadata,
    });
  }

  /**
   * Track user signup from shared content
   */
  trackSignupFromShare(
    referrer: string,
    userId: string,
    metadata?: Record<string, any>
  ): void {
    this.trackConversion({
      eventType: 'user_signup',
      source: 'shared_link',
      referrer,
      userId,
      metadata,
    });
  }

  /**
   * Get sharing analytics for content
   */
  async getContentSharingStats(
    contentType: 'spot' | 'spark' | 'profile',
    contentId: string
  ): Promise<{
    totalShares: number;
    sharesByPlatform: Record<string, number>;
    clickThroughs: number;
    conversions: number;
  } | null> {
    try {
      if (!this.config.apiEndpoint) {
        return null;
      }

      const response = await fetch(
        `${this.config.apiEndpoint}/content/${contentType}/${contentId}/sharing-stats`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        return await response.json();
      }

      return null;
    } catch (error) {
      console.error('Error fetching sharing stats:', error);
      return null;
    }
  }

  /**
   * Get user's sharing analytics
   */
  async getUserSharingStats(userId: string): Promise<{
    totalShares: number;
    mostSharedContent: Array<{
      contentType: string;
      contentId: string;
      shareCount: number;
    }>;
    topPlatforms: Array<{
      platform: string;
      shareCount: number;
    }>;
  } | null> {
    try {
      if (!this.config.apiEndpoint) {
        return null;
      }

      const response = await fetch(
        `${this.config.apiEndpoint}/users/${userId}/sharing-stats`,
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.ok) {
        return await response.json();
      }

      return null;
    } catch (error) {
      console.error('Error fetching user sharing stats:', error);
      return null;
    }
  }

  /**
   * Add event to queue
   */
  private addToQueue(event: ShareAnalyticsEvent | UserEngagementEvent | ConversionEvent): void {
    this.eventQueue.push(event);

    // If queue is getting large, flush immediately
    if (this.eventQueue.length >= 20) {
      this.flushEvents();
    }
  }

  /**
   * Start periodic flush of events
   */
  private startPeriodicFlush(): void {
    this.flushInterval = setInterval(() => {
      if (this.eventQueue.length > 0) {
        this.flushEvents();
      }
    }, 30000); // Flush every 30 seconds
  }

  /**
   * Flush queued events to server
   */
  private async flushEvents(): Promise<void> {
    if (this.eventQueue.length === 0 || !this.isOnline || !this.config.apiEndpoint) {
      return;
    }

    const eventsToSend = [...this.eventQueue];
    this.eventQueue = [];

    try {
      const response = await fetch(`${this.config.apiEndpoint}/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          events: eventsToSend,
          sessionId: this.config.sessionId,
          userId: this.config.userId,
        }),
      });

      if (!response.ok) {
        // If sending failed, add events back to queue
        this.eventQueue.unshift(...eventsToSend);
        console.error('Failed to send analytics events:', response.statusText);
      } else if (this.config.debugMode) {
        console.log(`Successfully sent ${eventsToSend.length} analytics events`);
      }
    } catch (error) {
      // If network error, add events back to queue
      this.eventQueue.unshift(...eventsToSend);
      console.error('Error sending analytics events:', error);
    }
  }

  /**
   * Set online/offline status
   */
  setOnlineStatus(isOnline: boolean): void {
    this.isOnline = isOnline;
    
    if (isOnline && this.eventQueue.length > 0) {
      // Flush queued events when coming back online
      this.flushEvents();
    }
  }

  /**
   * Force flush all queued events
   */
  async flush(): Promise<void> {
    await this.flushEvents();
  }

  /**
   * Clean up resources
   */
  destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    
    // Flush any remaining events
    this.flushEvents();
  }
}

export default AnalyticsService;