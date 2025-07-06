import { apiService, ApiResponse, PaginatedResponse } from './api.service';

// Signal Spot interfaces
export interface SignalSpot {
  id: string;
  latitude: number;
  longitude: number;
  title: string;
  content: string;
  type: 'social' | 'help' | 'event' | 'info' | 'alert';
  visibility: 'public' | 'friends' | 'private';
  tags: string[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  isActive: boolean;
  isPinned: boolean;
  creatorId: string;
  creatorUsername: string;
  creatorAvatar?: string;
  radius: number;
  maxDuration: number;
  engagementCount: number;
  viewCount: number;
  likeCount: number;
  replyCount: number;
  shareCount: number;
  reportCount: number;
  interactions: {
    hasLiked: boolean;
    hasShared: boolean;
    hasReported: boolean;
  };
  metadata: {
    weather?: string;
    temperature?: number;
    deviceInfo?: string;
    signalStrength?: number;
  };
}

export interface CreateSpotRequest {
  latitude: number;
  longitude: number;
  title: string;
  content: string;
  type: 'social' | 'help' | 'event' | 'info' | 'alert';
  visibility?: 'public' | 'friends' | 'private';
  tags?: string[];
  radius?: number;
  maxDuration?: number;
  scheduledStart?: string;
  autoDelete?: boolean;
  allowReplies?: boolean;
  requireApproval?: boolean;
}

export interface UpdateSpotRequest {
  title?: string;
  content?: string;
  tags?: string[];
  visibility?: 'public' | 'friends' | 'private';
  allowReplies?: boolean;
  requireApproval?: boolean;
}

export interface SpotInteractionRequest {
  type: 'like' | 'dislike' | 'reply' | 'share' | 'report';
  content?: string;
  reason?: string;
}

export interface SpotInteractionResponse {
  success: boolean;
  data: SignalSpot;
  message: string;
}

export interface NearbySpotQuery {
  latitude: number;
  longitude: number;
  radiusKm?: number;
  limit?: number;
  offset?: number;
  types?: string[];
  tags?: string[];
  search?: string;
  visibility?: 'public' | 'friends' | 'private';
  sortBy?: 'distance' | 'created' | 'popular' | 'trending';
  includeExpired?: boolean;
}

export interface TrendingSpotQuery {
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  limit?: number;
  timeframe?: 'hour' | 'day' | 'week' | 'month';
}

export interface UserSpotQuery {
  limit?: number;
  offset?: number;
  includeExpired?: boolean;
  status?: 'active' | 'expired' | 'paused' | 'all';
}

export interface SpotSearchQuery {
  q: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  limit?: number;
  offset?: number;
  types?: string[];
  tags?: string[];
}

export interface SpotStatistics {
  totalSpots: number;
  activeSpots: number;
  expiredSpots: number;
  totalViews: number;
  totalLikes: number;
  totalEngagement: number;
  averageSpotDuration: number;
  mostPopularSpot?: SignalSpot;
  popularTypes: Array<{ type: string; count: number }>;
  popularTags: Array<{ tag: string; count: number }>;
}

export interface LocationStatistics {
  totalSpots: number;
  density: number;
  radiusKm: number;
  location: {
    latitude: number;
    longitude: number;
  };
  popularTypes: Array<{ type: string; count: number }>;
  peakHours: Array<{ hour: number; count: number }>;
}

class SignalSpotService {
  private readonly baseEndpoint = '/signal-spots';

  // Create a new signal spot
  async createSpot(spotData: CreateSpotRequest): Promise<ApiResponse<SignalSpot>> {
    return apiService.post<ApiResponse<SignalSpot>>(
      this.baseEndpoint,
      spotData,
      'createSpot'
    );
  }

  // Get nearby signal spots
  async getNearbySpots(query: NearbySpotQuery): Promise<PaginatedResponse<SignalSpot>> {
    return apiService.get<PaginatedResponse<SignalSpot>>(
      `${this.baseEndpoint}/nearby`,
      query,
      'nearbySpots'
    );
  }

  // Get trending signal spots
  async getTrendingSpots(query: TrendingSpotQuery = {}): Promise<PaginatedResponse<SignalSpot>> {
    return apiService.get<PaginatedResponse<SignalSpot>>(
      `${this.baseEndpoint}/trending`,
      query,
      'trendingSpots'
    );
  }

  // Get popular signal spots
  async getPopularSpots(query: TrendingSpotQuery = {}): Promise<PaginatedResponse<SignalSpot>> {
    return apiService.get<PaginatedResponse<SignalSpot>>(
      `${this.baseEndpoint}/popular`,
      query,
      'popularSpots'
    );
  }

  // Search signal spots
  async searchSpots(searchQuery: SpotSearchQuery): Promise<PaginatedResponse<SignalSpot> & { query: string }> {
    return apiService.get<PaginatedResponse<SignalSpot> & { query: string }>(
      `${this.baseEndpoint}/search`,
      searchQuery,
      'searchSpots'
    );
  }

  // Get spots by tags
  async getSpotsByTags(
    tags: string[],
    query: Omit<NearbySpotQuery, 'tags'> & { matchAll?: boolean } = {}
  ): Promise<PaginatedResponse<SignalSpot> & { tags: string[] }> {
    const tagsString = tags.join(',');
    return apiService.get<PaginatedResponse<SignalSpot> & { tags: string[] }>(
      `${this.baseEndpoint}/tags/${tagsString}`,
      query,
      'spotsByTags'
    );
  }

  // Get current user's spots
  async getMySpots(query: UserSpotQuery = {}): Promise<PaginatedResponse<SignalSpot>> {
    return apiService.get<PaginatedResponse<SignalSpot>>(
      `${this.baseEndpoint}/my-spots`,
      query,
      'mySpots'
    );
  }

  // Get user statistics
  async getUserStatistics(): Promise<ApiResponse<SpotStatistics>> {
    return apiService.get<ApiResponse<SpotStatistics>>(
      `${this.baseEndpoint}/statistics`,
      {},
      'userStats'
    );
  }

  // Get location statistics
  async getLocationStatistics(
    latitude: number,
    longitude: number,
    radiusKm: number = 1
  ): Promise<ApiResponse<LocationStatistics>> {
    return apiService.get<ApiResponse<LocationStatistics>>(
      `${this.baseEndpoint}/location-stats`,
      { latitude, longitude, radiusKm },
      'locationStats'
    );
  }

  // Get spot by ID
  async getSpotById(spotId: string): Promise<ApiResponse<SignalSpot>> {
    return apiService.get<ApiResponse<SignalSpot>>(
      `${this.baseEndpoint}/${spotId}`,
      {},
      `spot-${spotId}`
    );
  }

  // Get similar spots
  async getSimilarSpots(
    spotId: string,
    radiusKm: number = 2,
    limit: number = 10
  ): Promise<PaginatedResponse<SignalSpot>> {
    return apiService.get<PaginatedResponse<SignalSpot>>(
      `${this.baseEndpoint}/${spotId}/similar`,
      { radiusKm, limit },
      `similarSpots-${spotId}`
    );
  }

  // Update spot
  async updateSpot(spotId: string, updateData: UpdateSpotRequest): Promise<ApiResponse<SignalSpot>> {
    return apiService.put<ApiResponse<SignalSpot>>(
      `${this.baseEndpoint}/${spotId}`,
      updateData,
      `updateSpot-${spotId}`
    );
  }

  // Delete spot
  async deleteSpot(spotId: string): Promise<ApiResponse<void>> {
    return apiService.delete<ApiResponse<void>>(
      `${this.baseEndpoint}/${spotId}`,
      `deleteSpot-${spotId}`
    );
  }

  // Interact with spot
  async interactWithSpot(
    spotId: string,
    interaction: SpotInteractionRequest
  ): Promise<SpotInteractionResponse> {
    return apiService.post<SpotInteractionResponse>(
      `${this.baseEndpoint}/${spotId}/interact`,
      interaction,
      `interact-${spotId}`
    );
  }

  // Extend spot duration
  async extendSpotDuration(spotId: string, additionalHours: number): Promise<ApiResponse<SignalSpot>> {
    return apiService.post<ApiResponse<SignalSpot>>(
      `${this.baseEndpoint}/${spotId}/extend`,
      { additionalHours },
      `extend-${spotId}`
    );
  }

  // Pause spot
  async pauseSpot(spotId: string): Promise<ApiResponse<SignalSpot>> {
    return apiService.post<ApiResponse<SignalSpot>>(
      `${this.baseEndpoint}/${spotId}/pause`,
      {},
      `pause-${spotId}`
    );
  }

  // Resume spot
  async resumeSpot(spotId: string): Promise<ApiResponse<SignalSpot>> {
    return apiService.post<ApiResponse<SignalSpot>>(
      `${this.baseEndpoint}/${spotId}/resume`,
      {},
      `resume-${spotId}`
    );
  }

  // Pin spot
  async pinSpot(spotId: string): Promise<ApiResponse<SignalSpot>> {
    return apiService.post<ApiResponse<SignalSpot>>(
      `${this.baseEndpoint}/${spotId}/pin`,
      {},
      `pin-${spotId}`
    );
  }

  // Unpin spot
  async unpinSpot(spotId: string): Promise<ApiResponse<SignalSpot>> {
    return apiService.post<ApiResponse<SignalSpot>>(
      `${this.baseEndpoint}/${spotId}/unpin`,
      {},
      `unpin-${spotId}`
    );
  }

  // Batch operations
  async batchCreateSpots(spots: CreateSpotRequest[]): Promise<ApiResponse<SignalSpot[]>> {
    return apiService.post<ApiResponse<SignalSpot[]>>(
      `${this.baseEndpoint}/batch`,
      { spots },
      'batchCreateSpots'
    );
  }

  async batchDeleteSpots(spotIds: string[]): Promise<ApiResponse<void>> {
    return apiService.delete<ApiResponse<void>>(
      `${this.baseEndpoint}/batch`,
      'batchDeleteSpots'
    );
  }

  // Real-time updates
  async subscribeToSpotUpdates(spotId: string, callback: (spot: SignalSpot) => void): Promise<() => void> {
    // This would implement WebSocket or Server-Sent Events for real-time updates
    // For now, we'll simulate with polling
    const interval = setInterval(async () => {
      try {
        const response = await this.getSpotById(spotId);
        if (response.success) {
          callback(response.data);
        }
      } catch (error) {
        console.error('Error polling spot updates:', error);
      }
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }

  // Get spots in area with real-time updates
  async subscribeToAreaUpdates(
    query: NearbySpotQuery,
    callback: (spots: SignalSpot[]) => void
  ): Promise<() => void> {
    // This would implement WebSocket or Server-Sent Events for real-time updates
    // For now, we'll simulate with polling
    const interval = setInterval(async () => {
      try {
        const response = await this.getNearbySpots(query);
        if (response.success) {
          callback(response.data);
        }
      } catch (error) {
        console.error('Error polling area updates:', error);
      }
    }, 10000); // Poll every 10 seconds

    return () => clearInterval(interval);
  }

  // Utility methods
  isSpotActive(spot: SignalSpot): boolean {
    return spot.isActive && new Date(spot.expiresAt) > new Date();
  }

  isSpotExpired(spot: SignalSpot): boolean {
    return new Date(spot.expiresAt) <= new Date();
  }

  getSpotDistance(spot: SignalSpot, userLat: number, userLng: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (spot.latitude - userLat) * Math.PI / 180;
    const dLng = (spot.longitude - userLng) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(userLat * Math.PI / 180) * Math.cos(spot.latitude * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  formatSpotDistance(distance: number): string {
    if (distance < 1) {
      return `${Math.round(distance * 1000)}m`;
    }
    return `${distance.toFixed(1)}km`;
  }

  getSpotTypeIcon(type: string): string {
    const icons = {
      social: '💬',
      help: '🆘',
      event: '🎉',
      info: 'ℹ️',
      alert: '⚠️',
    };
    return icons[type as keyof typeof icons] || '💌';
  }

  getSpotTypeColor(type: string): string {
    const colors = {
      social: '#4CAF50',
      help: '#F44336',
      event: '#FF9800',
      info: '#2196F3',
      alert: '#FF5722',
    };
    return colors[type as keyof typeof colors] || '#FF6B6B';
  }

  validateSpotData(spotData: CreateSpotRequest): string[] {
    const errors: string[] = [];

    if (!spotData.title?.trim()) {
      errors.push('Title is required');
    } else if (spotData.title.length > 100) {
      errors.push('Title must be less than 100 characters');
    }

    if (!spotData.content?.trim()) {
      errors.push('Content is required');
    } else if (spotData.content.length > 500) {
      errors.push('Content must be less than 500 characters');
    }

    if (!spotData.type) {
      errors.push('Type is required');
    }

    if (spotData.latitude < -90 || spotData.latitude > 90) {
      errors.push('Invalid latitude');
    }

    if (spotData.longitude < -180 || spotData.longitude > 180) {
      errors.push('Invalid longitude');
    }

    if (spotData.radius && (spotData.radius < 10 || spotData.radius > 10000)) {
      errors.push('Radius must be between 10 and 10000 meters');
    }

    if (spotData.maxDuration && (spotData.maxDuration < 1 || spotData.maxDuration > 168)) {
      errors.push('Max duration must be between 1 and 168 hours');
    }

    if (spotData.tags && spotData.tags.length > 10) {
      errors.push('Maximum 10 tags allowed');
    }

    return errors;
  }
}

export const signalSpotService = new SignalSpotService();