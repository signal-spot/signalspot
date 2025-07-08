import { ApiResponse } from './api.service';

export enum SiteTier {
  LEGENDARY = 'legendary',
  MAJOR = 'major',
  MINOR = 'minor',
  EMERGING = 'emerging',
}

export enum SiteStatus {
  ACTIVE = 'active',
  DORMANT = 'dormant',
  ARCHIVED = 'archived',
}

export enum ActivityType {
  VISIT = 'visit',
  SPOT_CREATED = 'spot_created',
  INTERACTION = 'interaction',
  DISCOVERY = 'discovery',
  CHECK_IN = 'check_in',
}

export interface SacredSite {
  id: string;
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  radius: number;
  tier: SiteTier;
  status: SiteStatus;
  clusterPoints: number;
  metrics: {
    totalScore: number;
    visitCount: number;
    uniqueVisitorCount: number;
    spotCount: number;
    totalEngagement: number;
    averageEngagementRate: number;
    growthRate: number;
    recencyScore: number;
  };
  discovery: {
    discovererUserId?: string;
    discoveredAt: Date;
    firstActivityAt: Date;
    lastActivityAt: Date;
  };
  tags?: string[];
  distance?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SiteQuery {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  tier?: SiteTier;
  status?: SiteStatus;
  limit?: number;
  offset?: number;
  sortBy?: 'score' | 'distance' | 'recent' | 'name';
  sortOrder?: 'asc' | 'desc';
}

export interface LeaderboardEntry {
  rank: number;
  site: SacredSite;
  score: number;
  tier: SiteTier;
}

export interface SiteStatistics {
  siteId: string;
  period: {
    startDate: Date;
    endDate: Date;
    days: number;
  };
  activity: {
    totalVisits: number;
    uniqueVisitors: number;
    totalActivities: number;
    activityBreakdown: Record<ActivityType, number>;
    growthRate: number;
  };
  patterns: {
    hourlyPattern: number[];
    dailyPattern: number[];
    peakActivityHour: number;
    peakActivityDay: number;
  };
  ranking: {
    currentScore: number;
    currentTier: SiteTier;
  };
}

class SacredSiteService {
  private baseUrl = 'http://localhost:3000/sacred-sites';

  /**
   * Get sacred sites with filtering and pagination
   */
  async getSacredSites(query: SiteQuery = {}): Promise<ApiResponse<{
    sites: SacredSite[];
    pagination: {
      total: number;
      offset: number;
      limit: number;
      hasMore: boolean;
    };
  }>> {
    try {
      const params = new URLSearchParams();
      
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication header
        },
      });

      if (!response.ok) {
        throw new Error(`Sacred sites request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform date strings to Date objects
      data.sites = data.sites.map((site: any) => ({
        ...site,
        discovery: {
          ...site.discovery,
          discoveredAt: new Date(site.discovery.discoveredAt),
          firstActivityAt: new Date(site.discovery.firstActivityAt),
          lastActivityAt: new Date(site.discovery.lastActivityAt),
        },
        createdAt: new Date(site.createdAt),
        updatedAt: new Date(site.updatedAt),
      }));

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error getting sacred sites:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get sacred site by ID
   */
  async getSacredSiteById(id: string): Promise<ApiResponse<SacredSite>> {
    try {
      const response = await fetch(`${this.baseUrl}/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Sacred site request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform date strings to Date objects
      data.discovery = {
        ...data.discovery,
        discoveredAt: new Date(data.discovery.discoveredAt),
        firstActivityAt: new Date(data.discovery.firstActivityAt),
        lastActivityAt: new Date(data.discovery.lastActivityAt),
      };
      data.createdAt = new Date(data.createdAt);
      data.updatedAt = new Date(data.updatedAt);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error getting sacred site:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get sacred sites leaderboard
   */
  async getLeaderboard(
    limit: number = 10,
    tier?: SiteTier,
    location?: { latitude: number; longitude: number; radiusKm: number }
  ): Promise<ApiResponse<{
    leaderboard: LeaderboardEntry[];
    generatedAt: Date;
  }>> {
    try {
      const params = new URLSearchParams();
      params.append('limit', limit.toString());
      
      if (tier) params.append('tier', tier);
      if (location) {
        params.append('latitude', location.latitude.toString());
        params.append('longitude', location.longitude.toString());
        params.append('radiusKm', location.radiusKm.toString());
      }

      const response = await fetch(`${this.baseUrl}/leaderboard/top?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Leaderboard request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform date strings to Date objects
      data.generatedAt = new Date(data.generatedAt);
      data.leaderboard = data.leaderboard.map((entry: any) => ({
        ...entry,
        site: {
          ...entry.site,
          discovery: {
            ...entry.site.discovery,
            discoveredAt: new Date(entry.site.discovery.discoveredAt),
            firstActivityAt: new Date(entry.site.discovery.firstActivityAt),
            lastActivityAt: new Date(entry.site.discovery.lastActivityAt),
          },
          createdAt: new Date(entry.site.createdAt),
          updatedAt: new Date(entry.site.updatedAt),
        },
      }));

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get site statistics
   */
  async getSiteStatistics(
    siteId: string,
    days: number = 30
  ): Promise<ApiResponse<SiteStatistics>> {
    try {
      const response = await fetch(`${this.baseUrl}/${siteId}/statistics?days=${days}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Statistics request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform date strings to Date objects
      data.period.startDate = new Date(data.period.startDate);
      data.period.endDate = new Date(data.period.endDate);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error getting site statistics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Record a visit to a sacred site
   */
  async recordVisit(
    siteId: string,
    location?: { latitude: number; longitude: number }
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${siteId}/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication header
        },
        body: JSON.stringify({
          latitude: location?.latitude,
          longitude: location?.longitude,
        }),
      });

      if (!response.ok) {
        throw new Error(`Visit recording failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error recording visit:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Record activity at a sacred site
   */
  async recordActivity(
    siteId: string,
    activityType: ActivityType,
    options: {
      relatedContentId?: string;
      relatedContentType?: string;
      location?: { latitude: number; longitude: number };
      metadata?: any;
    } = {}
  ): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/${siteId}/activity`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication header
        },
        body: JSON.stringify({
          activityType,
          relatedContentId: options.relatedContentId,
          relatedContentType: options.relatedContentType,
          latitude: options.location?.latitude,
          longitude: options.location?.longitude,
          metadata: options.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Activity recording failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error recording activity:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get tier display name in Korean
   */
  getTierDisplayName(tier: SiteTier): string {
    const tierNames = {
      [SiteTier.LEGENDARY]: '전설',
      [SiteTier.MAJOR]: '주요',
      [SiteTier.MINOR]: '일반',
      [SiteTier.EMERGING]: '신생',
    };
    return tierNames[tier];
  }

  /**
   * Get tier color for UI
   */
  getTierColor(tier: SiteTier): string {
    const tierColors = {
      [SiteTier.LEGENDARY]: '#FFD700', // Gold
      [SiteTier.MAJOR]: '#C0C0C0',     // Silver
      [SiteTier.MINOR]: '#CD7F32',     // Bronze
      [SiteTier.EMERGING]: '#90EE90',  // Light Green
    };
    return tierColors[tier];
  }

  /**
   * Get tier icon for UI
   */
  getTierIcon(tier: SiteTier): string {
    const tierIcons = {
      [SiteTier.LEGENDARY]: '👑',
      [SiteTier.MAJOR]: '⭐',
      [SiteTier.MINOR]: '🔸',
      [SiteTier.EMERGING]: '🌱',
    };
    return tierIcons[tier];
  }

  /**
   * Format distance string
   */
  formatDistance(distance?: number): string | null {
    if (distance === undefined) return null;
    
    if (distance < 1000) {
      return `${Math.round(distance)}m`;
    } else {
      return `${(distance / 1000).toFixed(1)}km`;
    }
  }

  /**
   * Format activity type display name
   */
  getActivityTypeDisplayName(activityType: ActivityType): string {
    const activityNames = {
      [ActivityType.VISIT]: '방문',
      [ActivityType.SPOT_CREATED]: '스팟 생성',
      [ActivityType.INTERACTION]: '상호작용',
      [ActivityType.DISCOVERY]: '발견',
      [ActivityType.CHECK_IN]: '체크인',
    };
    return activityNames[activityType];
  }

  /**
   * Calculate time ago string
   */
  getTimeAgo(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    
    if (diffInDays > 0) {
      return `${diffInDays}일 전`;
    } else if (diffInHours > 0) {
      return `${diffInHours}시간 전`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${Math.max(1, diffInMinutes)}분 전`;
    }
  }

  /**
   * Get status display name
   */
  getStatusDisplayName(status: SiteStatus): string {
    const statusNames = {
      [SiteStatus.ACTIVE]: '활성',
      [SiteStatus.DORMANT]: '휴면',
      [SiteStatus.ARCHIVED]: '보관됨',
    };
    return statusNames[status];
  }

  /**
   * Get status color
   */
  getStatusColor(status: SiteStatus): string {
    const statusColors = {
      [SiteStatus.ACTIVE]: '#4CAF50',   // Green
      [SiteStatus.DORMANT]: '#FF9800',  // Orange
      [SiteStatus.ARCHIVED]: '#9E9E9E', // Gray
    };
    return statusColors[status];
  }
}

export const sacredSiteService = new SacredSiteService();