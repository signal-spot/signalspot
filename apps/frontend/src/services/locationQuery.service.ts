import { locationService, LocationCoordinates } from './location.service';
import { authService } from './auth.service';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

interface LocationQueryParams {
  latitude: number;
  longitude: number;
  radius: number; // in kilometers
  privacy?: 'public' | 'friends' | 'private';
  accuracyLevel?: 'high' | 'medium' | 'low';
  source?: 'gps' | 'network' | 'passive';
  isActive?: boolean;
  createdAfter?: string;
  createdBefore?: string;
  limit?: number;
  offset?: number;
}

interface NearbyUsersParams {
  latitude: number;
  longitude: number;
  radius: number;
  locationPrivacy?: 'public' | 'friends' | 'private';
  limit?: number;
  offset?: number;
}

interface LocationRecord {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  accuracyLevel: string;
  source: string;
  privacy: string;
  address?: string;
  city?: string;
  country?: string;
  isCurrentLocation: boolean;
  createdAt: string;
  updatedAt: string;
  distance?: number; // Distance from query point in km
}

interface UserLocation {
  id: string;
  username: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  lastKnownLatitude?: number;
  lastKnownLongitude?: number;
  lastLocationUpdateAt?: string;
  locationPrivacy: string;
  distance?: number; // Distance from query point in km
}

interface LocationStats {
  totalLocations: number;
  currentLocation: LocationRecord | null;
  lastUpdate: string | null;
  averageAccuracy: number | null;
  mostCommonSource: string | null;
}

interface DistanceCalculationRequest {
  lat1: number;
  lon1: number;
  lat2: number;
  lon2: number;
}

interface DistanceResult {
  distance: number;
  unit: string;
}

interface RadiusCheckRequest extends DistanceCalculationRequest {
  radius: number;
}

interface RadiusCheckResult {
  withinRadius: boolean;
  distance: number;
  radius: number;
}

class LocationQueryService {
  private baseUrl: string;

  constructor() {
    // This should come from your app config
    this.baseUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
  }

  /**
   * Get authorization headers for API requests
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await authService.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Make authenticated API request
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const headers = await this.getAuthHeaders();
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        headers: {
          ...headers,
          ...options.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        data,
        success: true,
      };
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Create a new location record
   */
  async createLocation(locationData: {
    latitude: number;
    longitude: number;
    altitude?: number;
    accuracy?: number;
    heading?: number;
    speed?: number;
    accuracyLevel?: string;
    source?: string;
    privacy?: string;
    address?: string;
    city?: string;
    country?: string;
    isCurrentLocation?: boolean;
    metadata?: Record<string, any>;
  }): Promise<ApiResponse<LocationRecord>> {
    return this.makeRequest<LocationRecord>('/location', {
      method: 'POST',
      body: JSON.stringify(locationData),
    });
  }

  /**
   * Update an existing location record
   */
  async updateLocation(
    locationId: string,
    updateData: Partial<{
      latitude: number;
      longitude: number;
      altitude?: number;
      accuracy?: number;
      heading?: number;
      speed?: number;
      accuracyLevel?: string;
      source?: string;
      privacy?: string;
      address?: string;
      city?: string;
      country?: string;
      isCurrentLocation?: boolean;
      metadata?: Record<string, any>;
    }>
  ): Promise<ApiResponse<LocationRecord>> {
    return this.makeRequest<LocationRecord>(`/location/${locationId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Get current user's current location
   */
  async getCurrentLocation(): Promise<ApiResponse<LocationRecord | null>> {
    return this.makeRequest<LocationRecord | null>('/location/current');
  }

  /**
   * Get current user's location history
   */
  async getLocationHistory(
    limit = 50,
    offset = 0
  ): Promise<ApiResponse<LocationRecord[]>> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });
    
    return this.makeRequest<LocationRecord[]>(`/location/history?${params}`);
  }

  /**
   * Find nearby locations within a radius
   */
  async findNearbyLocations(
    params: LocationQueryParams
  ): Promise<ApiResponse<LocationRecord[]>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return this.makeRequest<LocationRecord[]>(`/location/nearby?${queryParams}`);
  }

  /**
   * Find nearby users within a radius
   */
  async findNearbyUsers(
    params: NearbyUsersParams
  ): Promise<ApiResponse<UserLocation[]>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, value.toString());
      }
    });

    return this.makeRequest<UserLocation[]>(`/location/nearby/users?${queryParams}`);
  }

  /**
   * Get location statistics for current user
   */
  async getLocationStats(): Promise<ApiResponse<LocationStats>> {
    return this.makeRequest<LocationStats>('/location/stats');
  }

  /**
   * Get another user's location (if accessible)
   */
  async getUserLocation(userId: string): Promise<ApiResponse<LocationRecord | null>> {
    return this.makeRequest<LocationRecord | null>(`/location/user/${userId}`);
  }

  /**
   * Calculate distance between two coordinates
   */
  async calculateDistance(
    params: DistanceCalculationRequest
  ): Promise<ApiResponse<DistanceResult>> {
    return this.makeRequest<DistanceResult>('/location/calculate-distance', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Check if coordinates are within a radius
   */
  async checkRadius(
    params: RadiusCheckRequest
  ): Promise<ApiResponse<RadiusCheckResult>> {
    return this.makeRequest<RadiusCheckResult>('/location/check-radius', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  /**
   * Delete a location record
   */
  async deleteLocation(locationId: string): Promise<ApiResponse<void>> {
    return this.makeRequest<void>(`/location/${locationId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Deactivate a location record
   */
  async deactivateLocation(locationId: string): Promise<ApiResponse<LocationRecord>> {
    return this.makeRequest<LocationRecord>(`/location/${locationId}/deactivate`, {
      method: 'PUT',
    });
  }

  /**
   * Activate a location record
   */
  async activateLocation(locationId: string): Promise<ApiResponse<LocationRecord>> {
    return this.makeRequest<LocationRecord>(`/location/${locationId}/activate`, {
      method: 'PUT',
    });
  }

  /**
   * Find locations within current user's radius
   */
  async findLocationsAroundMe(
    radius = 5,
    options?: {
      privacy?: string;
      accuracyLevel?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<ApiResponse<LocationRecord[]>> {
    const currentLocation = locationService.getLastKnownLocation();
    
    if (!currentLocation) {
      return {
        data: [],
        success: false,
        message: 'Current location not available',
      };
    }

    const params: LocationQueryParams = {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      radius,
      ...options,
    };

    return this.findNearbyLocations(params);
  }

  /**
   * Find users around current location
   */
  async findUsersAroundMe(
    radius = 2,
    options?: {
      locationPrivacy?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<ApiResponse<UserLocation[]>> {
    const currentLocation = locationService.getLastKnownLocation();
    
    if (!currentLocation) {
      return {
        data: [],
        success: false,
        message: 'Current location not available',
      };
    }

    const params: NearbyUsersParams = {
      latitude: currentLocation.latitude,
      longitude: currentLocation.longitude,
      radius,
      ...options,
    };

    return this.findNearbyUsers(params);
  }

  /**
   * Update current location from device GPS
   */
  async updateCurrentLocationFromGPS(): Promise<ApiResponse<LocationRecord>> {
    try {
      const coordinates = await locationService.getCurrentLocation();
      
      const locationData = {
        latitude: coordinates.latitude,
        longitude: coordinates.longitude,
        altitude: coordinates.altitude,
        accuracy: coordinates.accuracy,
        heading: coordinates.heading,
        speed: coordinates.speed,
        accuracyLevel: locationService.getAccuracyLevel(coordinates.accuracy || 100),
        source: 'gps',
        isCurrentLocation: true,
      };

      return this.createLocation(locationData);
    } catch (error) {
      return {
        data: null as any,
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get GPS location',
      };
    }
  }

  /**
   * Get distance to a specific location
   */
  getDistanceToLocation(targetLat: number, targetLon: number): number | null {
    const currentLocation = locationService.getLastKnownLocation();
    if (!currentLocation) return null;
    
    return locationService.calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      targetLat,
      targetLon
    );
  }

  /**
   * Check if a location is within user's sharing radius
   */
  isLocationWithinSharingRadius(
    targetLat: number,
    targetLon: number,
    sharingRadius: number
  ): boolean {
    const currentLocation = locationService.getLastKnownLocation();
    if (!currentLocation) return false;
    
    return locationService.isWithinRadius(
      currentLocation.latitude,
      currentLocation.longitude,
      targetLat,
      targetLon,
      sharingRadius
    );
  }

  /**
   * Batch update multiple locations
   */
  async batchUpdateLocations(
    locations: Array<{
      latitude: number;
      longitude: number;
      timestamp: number;
      accuracy?: number;
    }>
  ): Promise<ApiResponse<LocationRecord[]>> {
    const locationPromises = locations.map(location => 
      this.createLocation({
        latitude: location.latitude,
        longitude: location.longitude,
        accuracy: location.accuracy,
        source: 'gps',
        accuracyLevel: locationService.getAccuracyLevel(location.accuracy || 100),
      })
    );

    try {
      const results = await Promise.allSettled(locationPromises);
      const successful = results
        .filter((result): result is PromiseFulfilledResult<ApiResponse<LocationRecord>> => 
          result.status === 'fulfilled' && result.value.success
        )
        .map(result => result.value.data);

      return {
        data: successful,
        success: true,
        message: `${successful.length}/${locations.length} locations updated successfully`,
      };
    } catch (error) {
      return {
        data: [],
        success: false,
        message: error instanceof Error ? error.message : 'Batch update failed',
      };
    }
  }
}

// Export singleton instance
export const locationQueryService = new LocationQueryService();
export default locationQueryService;