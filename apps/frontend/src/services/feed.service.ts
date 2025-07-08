import { ApiResponse } from './api.service';

export interface FeedItem {
  id: string;
  type: 'spot' | 'spark';
  title: string;
  content?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  timestamp: Date;
  stats: {
    views: number;
    likes: number;
    comments: number;
    shares?: number;
  };
  tags?: string[];
  distance?: number;
  relevanceScore: number;
  interactionData?: {
    hasLiked: boolean;
    hasCommented: boolean;
    hasShared: boolean;
  };
}

export interface FeedResponse {
  items: FeedItem[];
  pagination: {
    total: number;
    offset: number;
    limit: number;
    hasMore: boolean;
  };
  metadata: {
    algorithm: string;
    generatedAt: Date;
    userLocation?: {
      latitude: number;
      longitude: number;
    };
    filters: {
      contentType: 'spot' | 'spark' | 'mixed';
      sortBy: 'recent' | 'popular' | 'relevant' | 'nearby';
      radiusMeters: number;
      hoursAgo: number;
    };
  };
}

export interface FeedQuery {
  limit?: number;
  offset?: number;
  contentType?: 'spot' | 'spark' | 'mixed';
  sortBy?: 'recent' | 'popular' | 'relevant' | 'nearby';
  latitude?: number;
  longitude?: number;
  radiusMeters?: number;
  tags?: string;
  hoursAgo?: number;
}

export interface TrendingTag {
  tag: string;
  count: number;
}

export interface RecommendedUser {
  userId: string;
  username: string;
  avatar?: string;
  similarityScore: number;
  commonInterests: string[];
}

class FeedService {
  private baseUrl = 'http://localhost:3000/feed';

  /**
   * Get personalized feed for the user
   */
  async getFeed(query: FeedQuery = {}): Promise<ApiResponse<FeedResponse>> {
    try {
      const params = new URLSearchParams();
      
      // Add query parameters
      if (query.limit !== undefined) params.append('limit', query.limit.toString());
      if (query.offset !== undefined) params.append('offset', query.offset.toString());
      if (query.contentType) params.append('contentType', query.contentType);
      if (query.sortBy) params.append('sortBy', query.sortBy);
      if (query.latitude !== undefined) params.append('latitude', query.latitude.toString());
      if (query.longitude !== undefined) params.append('longitude', query.longitude.toString());
      if (query.radiusMeters !== undefined) params.append('radiusMeters', query.radiusMeters.toString());
      if (query.tags) params.append('tags', query.tags);
      if (query.hoursAgo !== undefined) params.append('hoursAgo', query.hoursAgo.toString());

      const response = await fetch(`${this.baseUrl}?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication header
        },
      });

      if (!response.ok) {
        throw new Error(`Feed request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform date strings to Date objects
      data.items = data.items.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
      data.metadata.generatedAt = new Date(data.metadata.generatedAt);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error getting feed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get trending content
   */
  async getTrendingContent(query: FeedQuery = {}): Promise<ApiResponse<FeedResponse>> {
    try {
      const params = new URLSearchParams();
      
      if (query.limit !== undefined) params.append('limit', query.limit.toString());
      if (query.offset !== undefined) params.append('offset', query.offset.toString());
      if (query.contentType) params.append('contentType', query.contentType);
      if (query.latitude !== undefined) params.append('latitude', query.latitude.toString());
      if (query.longitude !== undefined) params.append('longitude', query.longitude.toString());
      if (query.radiusMeters !== undefined) params.append('radiusMeters', query.radiusMeters.toString());
      if (query.hoursAgo !== undefined) params.append('hoursAgo', query.hoursAgo.toString());

      const response = await fetch(`${this.baseUrl}/trending?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Trending content request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform date strings to Date objects
      data.items = data.items.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
      data.metadata.generatedAt = new Date(data.metadata.generatedAt);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error getting trending content:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get location-based feed
   */
  async getLocationFeed(
    latitude: number,
    longitude: number,
    query: Omit<FeedQuery, 'latitude' | 'longitude'> = {}
  ): Promise<ApiResponse<FeedResponse>> {
    try {
      const params = new URLSearchParams();
      params.append('latitude', latitude.toString());
      params.append('longitude', longitude.toString());
      
      if (query.limit !== undefined) params.append('limit', query.limit.toString());
      if (query.offset !== undefined) params.append('offset', query.offset.toString());
      if (query.contentType) params.append('contentType', query.contentType);
      if (query.radiusMeters !== undefined) params.append('radiusMeters', query.radiusMeters.toString());
      if (query.hoursAgo !== undefined) params.append('hoursAgo', query.hoursAgo.toString());

      const response = await fetch(`${this.baseUrl}/location?${params.toString()}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Location feed request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform date strings to Date objects
      data.items = data.items.map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp),
      }));
      data.metadata.generatedAt = new Date(data.metadata.generatedAt);

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error getting location feed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get trending tags
   */
  async getTrendingTags(limit: number = 10): Promise<ApiResponse<TrendingTag[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/trending-tags?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Trending tags request failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error getting trending tags:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get recommended users
   */
  async getRecommendedUsers(limit: number = 10): Promise<ApiResponse<RecommendedUser[]>> {
    try {
      const response = await fetch(`${this.baseUrl}/recommended-users?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication header
        },
      });

      if (!response.ok) {
        throw new Error(`Recommended users request failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error getting recommended users:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Refresh feed cache
   */
  async refreshFeedCache(): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await fetch(`${this.baseUrl}/refresh`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication header
        },
      });

      if (!response.ok) {
        throw new Error(`Feed refresh request failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error refreshing feed cache:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Get feed metrics (admin only)
   */
  async getFeedMetrics(timeframe: 'hour' | 'day' | 'week' = 'day'): Promise<ApiResponse<{
    totalRequests: number;
    avgResponseTime: number;
    cacheHitRate: number;
    topContentTypes: Array<{ type: string; count: number }>;
    topSortMethods: Array<{ method: string; count: number }>;
  }>> {
    try {
      const response = await fetch(`${this.baseUrl}/metrics?timeframe=${timeframe}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          // TODO: Add authentication header
        },
      });

      if (!response.ok) {
        throw new Error(`Feed metrics request failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('Error getting feed metrics:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Format time ago string
   */
  getTimeAgo(timestamp: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
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
   * Format engagement stats for display
   */
  formatEngagementStats(stats: FeedItem['stats']): string {
    const parts: string[] = [];
    
    if (stats.likes > 0) {
      parts.push(`좋아요 ${stats.likes}`);
    }
    
    if (stats.comments > 0) {
      parts.push(`댓글 ${stats.comments}`);
    }
    
    if (stats.shares && stats.shares > 0) {
      parts.push(`공유 ${stats.shares}`);
    }
    
    if (stats.views > 0) {
      parts.push(`조회 ${stats.views}`);
    }
    
    return parts.join(' • ');
  }
}

export const feedService = new FeedService();