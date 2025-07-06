import { apiService, ApiResponse } from './api.service';

// Location permission status
export enum LocationPermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  RESTRICTED = 'restricted',
  UNDETERMINED = 'undetermined',
}

// Location interfaces
export interface LocationData {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  altitudeAccuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface LocationUpdate {
  userId: string;
  location: LocationData;
  isSharing: boolean;
  lastUpdated: string;
}

export interface LocationSharingSettings {
  isEnabled: boolean;
  shareWithFriends: boolean;
  shareWithPublic: boolean;
  shareWithNearby: boolean;
  precision: 'exact' | 'approximate' | 'city';
  autoStop: boolean;
  autoStopAfterMinutes?: number;
  geofences: Geofence[];
}

export interface Geofence {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  notifications: {
    onEnter: boolean;
    onExit: boolean;
    onDwell: boolean;
    dwellTime?: number;
  };
  actions: {
    autoShareLocation: boolean;
    autoCreateSpot: boolean;
    autoNotifyContacts: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface NearbyUser {
  id: string;
  username: string;
  nickname?: string;
  avatarUrl?: string;
  distance: number;
  lastSeen: string;
  isOnline: boolean;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
  };
  sharedAt: string;
  mutualConnections: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
}

export interface LocationHistory {
  id: string;
  location: LocationData;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
  };
  visitDuration?: number;
  activityType?: 'stationary' | 'walking' | 'running' | 'cycling' | 'driving';
  createdAt: string;
}

export interface LocationPermissions {
  granted: boolean;
  denied: boolean;
  restricted: boolean;
  canRequestAgain: boolean;
  backgroundPermission: boolean;
  precisaacuracyPermission: boolean;
}

export interface LocationStats {
  totalLocationsShared: number;
  totalTimeSharing: number; // in minutes
  averageAccuracy: number;
  mostVisitedPlaces: Array<{
    address: string;
    visitCount: number;
    totalDuration: number;
  }>;
  distanceTraveled: number; // in km
  nearbyUsersMetCount: number;
  spotsCreatedFromLocation: number;
}

export interface LocationSuggestion {
  id: string;
  name: string;
  type: 'restaurant' | 'cafe' | 'park' | 'shopping' | 'entertainment' | 'transport' | 'other';
  latitude: number;
  longitude: number;
  distance: number;
  rating?: number;
  description?: string;
  tags: string[];
  popularity: number;
  relevanceScore: number;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phoneNumber: string;
  email?: string;
  relationship: string;
  priority: number;
  isActive: boolean;
  canReceiveLocation: boolean;
  notificationMethods: ('sms' | 'email' | 'app')[];
}

export interface EmergencySettings {
  isEnabled: boolean;
  contacts: EmergencyContact[];
  autoTrigger: {
    enabled: boolean;
    inactivityMinutes: number;
    lowBatteryPercent: number;
    panicButtonEnabled: boolean;
  };
  locationSharing: {
    enabled: boolean;
    duration: number; // minutes
    updateInterval: number; // seconds
  };
}

export interface SafeZone {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius: number;
  isActive: boolean;
  notifications: {
    onEnter: boolean;
    onExit: boolean;
  };
  contacts: string[]; // contact IDs
  createdAt: string;
  updatedAt: string;
}

class LocationService {
  private readonly baseEndpoint = '/location';

  // Get current location sharing settings
  async getLocationSettings(): Promise<ApiResponse<LocationSharingSettings>> {
    return apiService.get<ApiResponse<LocationSharingSettings>>(
      `${this.baseEndpoint}/settings`,
      {},
      'locationSettings'
    );
  }

  // Update location sharing settings
  async updateLocationSettings(settings: Partial<LocationSharingSettings>): Promise<ApiResponse<LocationSharingSettings>> {
    return apiService.put<ApiResponse<LocationSharingSettings>>(
      `${this.baseEndpoint}/settings`,
      settings,
      'updateLocationSettings'
    );
  }

  // Share current location
  async shareLocation(location: LocationData): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/share`,
      { location },
      'shareLocation'
    );
  }

  // Stop sharing location
  async stopSharingLocation(): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/stop-sharing`,
      {},
      'stopSharing'
    );
  }

  // Get nearby users
  async getNearbyUsers(
    latitude: number,
    longitude: number,
    radiusKm: number = 1,
    limit: number = 50
  ): Promise<ApiResponse<NearbyUser[]>> {
    return apiService.get<ApiResponse<NearbyUser[]>>(
      `${this.baseEndpoint}/nearby-users`,
      { latitude, longitude, radiusKm, limit },
      'nearbyUsers'
    );
  }

  // Get location history
  async getLocationHistory(
    startDate?: string,
    endDate?: string,
    limit: number = 100,
    offset: number = 0
  ): Promise<ApiResponse<LocationHistory[]>> {
    const params: any = { limit, offset };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return apiService.get<ApiResponse<LocationHistory[]>>(
      `${this.baseEndpoint}/history`,
      params,
      'locationHistory'
    );
  }

  // Delete location history
  async deleteLocationHistory(
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<{ message: string }>> {
    const params: any = {};
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return apiService.delete<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/history`,
      'deleteLocationHistory'
    );
  }

  // Get location statistics
  async getLocationStats(): Promise<ApiResponse<LocationStats>> {
    return apiService.get<ApiResponse<LocationStats>>(
      `${this.baseEndpoint}/stats`,
      {},
      'locationStats'
    );
  }

  // Geofence management
  async createGeofence(geofence: Omit<Geofence, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<Geofence>> {
    return apiService.post<ApiResponse<Geofence>>(
      `${this.baseEndpoint}/geofences`,
      geofence,
      'createGeofence'
    );
  }

  async getGeofences(): Promise<ApiResponse<Geofence[]>> {
    return apiService.get<ApiResponse<Geofence[]>>(
      `${this.baseEndpoint}/geofences`,
      {},
      'geofences'
    );
  }

  async updateGeofence(id: string, updates: Partial<Geofence>): Promise<ApiResponse<Geofence>> {
    return apiService.put<ApiResponse<Geofence>>(
      `${this.baseEndpoint}/geofences/${id}`,
      updates,
      `updateGeofence-${id}`
    );
  }

  async deleteGeofence(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/geofences/${id}`,
      `deleteGeofence-${id}`
    );
  }

  // Location suggestions
  async getLocationSuggestions(
    latitude: number,
    longitude: number,
    radiusKm: number = 1,
    type?: string,
    limit: number = 20
  ): Promise<ApiResponse<LocationSuggestion[]>> {
    return apiService.get<ApiResponse<LocationSuggestion[]>>(
      `${this.baseEndpoint}/suggestions`,
      { latitude, longitude, radiusKm, type, limit },
      'locationSuggestions'
    );
  }

  // Emergency features
  async getEmergencySettings(): Promise<ApiResponse<EmergencySettings>> {
    return apiService.get<ApiResponse<EmergencySettings>>(
      `${this.baseEndpoint}/emergency/settings`,
      {},
      'emergencySettings'
    );
  }

  async updateEmergencySettings(settings: Partial<EmergencySettings>): Promise<ApiResponse<EmergencySettings>> {
    return apiService.put<ApiResponse<EmergencySettings>>(
      `${this.baseEndpoint}/emergency/settings`,
      settings,
      'updateEmergencySettings'
    );
  }

  async triggerEmergency(location: LocationData, message?: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/emergency/trigger`,
      { location, message },
      'triggerEmergency'
    );
  }

  async cancelEmergency(): Promise<ApiResponse<{ message: string }>> {
    return apiService.post<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/emergency/cancel`,
      {},
      'cancelEmergency'
    );
  }

  // Safe zones
  async createSafeZone(safeZone: Omit<SafeZone, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiResponse<SafeZone>> {
    return apiService.post<ApiResponse<SafeZone>>(
      `${this.baseEndpoint}/safe-zones`,
      safeZone,
      'createSafeZone'
    );
  }

  async getSafeZones(): Promise<ApiResponse<SafeZone[]>> {
    return apiService.get<ApiResponse<SafeZone[]>>(
      `${this.baseEndpoint}/safe-zones`,
      {},
      'safeZones'
    );
  }

  async updateSafeZone(id: string, updates: Partial<SafeZone>): Promise<ApiResponse<SafeZone>> {
    return apiService.put<ApiResponse<SafeZone>>(
      `${this.baseEndpoint}/safe-zones/${id}`,
      updates,
      `updateSafeZone-${id}`
    );
  }

  async deleteSafeZone(id: string): Promise<ApiResponse<{ message: string }>> {
    return apiService.delete<ApiResponse<{ message: string }>>(
      `${this.baseEndpoint}/safe-zones/${id}`,
      `deleteSafeZone-${id}`
    );
  }

  // Reverse geocoding
  async reverseGeocode(latitude: number, longitude: number): Promise<ApiResponse<{
    address: {
      street?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
    formattedAddress: string;
  }>> {
    return apiService.get<ApiResponse<{
      address: {
        street?: string;
        city?: string;
        state?: string;
        country?: string;
        postalCode?: string;
      };
      formattedAddress: string;
    }>>(
      `${this.baseEndpoint}/reverse-geocode`,
      { latitude, longitude },
      'reverseGeocode'
    );
  }

  // Forward geocoding
  async geocode(address: string): Promise<ApiResponse<Array<{
    latitude: number;
    longitude: number;
    formattedAddress: string;
    confidence: number;
  }>>> {
    return apiService.get<ApiResponse<Array<{
      latitude: number;
      longitude: number;
      formattedAddress: string;
      confidence: number;
    }>>>(
      `${this.baseEndpoint}/geocode`,
      { address },
      'geocode'
    );
  }

  // Utility methods
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  formatDistance(distanceKm: number): string {
    if (distanceKm < 1) {
      return `${Math.round(distanceKm * 1000)}m`;
    }
    return `${distanceKm.toFixed(1)}km`;
  }

  isLocationRecent(timestamp: number, maxAgeMinutes: number = 30): boolean {
    const now = Date.now();
    const ageMinutes = (now - timestamp) / (1000 * 60);
    return ageMinutes <= maxAgeMinutes;
  }

  isLocationAccurate(accuracy: number, threshold: number = 100): boolean {
    return accuracy <= threshold;
  }

  isInsideGeofence(
    userLat: number,
    userLon: number,
    geofenceLat: number,
    geofenceLon: number,
    radiusMeters: number
  ): boolean {
    const distance = this.calculateDistance(userLat, userLon, geofenceLat, geofenceLon);
    return distance * 1000 <= radiusMeters;
  }

  getBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;
    
    const y = Math.sin(dLon) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) - 
              Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLon);
    
    let bearing = Math.atan2(y, x) * 180 / Math.PI;
    return (bearing + 360) % 360;
  }

  formatBearing(bearing: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  }

  validateLocationData(location: LocationData): string[] {
    const errors: string[] = [];

    if (location.latitude < -90 || location.latitude > 90) {
      errors.push('Invalid latitude');
    }

    if (location.longitude < -180 || location.longitude > 180) {
      errors.push('Invalid longitude');
    }

    if (location.accuracy && location.accuracy < 0) {
      errors.push('Invalid accuracy');
    }

    if (location.speed && location.speed < 0) {
      errors.push('Invalid speed');
    }

    if (location.heading && (location.heading < 0 || location.heading >= 360)) {
      errors.push('Invalid heading');
    }

    return errors;
  }

  validateGeofence(geofence: Omit<Geofence, 'id' | 'createdAt' | 'updatedAt'>): string[] {
    const errors: string[] = [];

    if (!geofence.name || geofence.name.trim().length === 0) {
      errors.push('Geofence name is required');
    }

    if (geofence.latitude < -90 || geofence.latitude > 90) {
      errors.push('Invalid latitude');
    }

    if (geofence.longitude < -180 || geofence.longitude > 180) {
      errors.push('Invalid longitude');
    }

    if (geofence.radius <= 0 || geofence.radius > 10000) {
      errors.push('Radius must be between 1 and 10000 meters');
    }

    return errors;
  }

  getLocationAccuracyDescription(accuracy: number): string {
    if (accuracy <= 5) return 'Very High';
    if (accuracy <= 10) return 'High';
    if (accuracy <= 20) return 'Good';
    if (accuracy <= 50) return 'Fair';
    if (accuracy <= 100) return 'Poor';
    return 'Very Poor';
  }

  getLocationStalenessDescription(timestamp: number): string {
    const ageMinutes = (Date.now() - timestamp) / (1000 * 60);
    
    if (ageMinutes < 1) return 'Just now';
    if (ageMinutes < 5) return 'Very recent';
    if (ageMinutes < 15) return 'Recent';
    if (ageMinutes < 60) return 'Moderate';
    if (ageMinutes < 240) return 'Old';
    return 'Very old';
  }

  optimizeLocationSharing(settings: LocationSharingSettings): LocationSharingSettings {
    const optimized = { ...settings };

    // Auto-adjust update intervals based on activity
    // This would be implemented based on device capabilities and battery optimization

    return optimized;
  }
}

export const locationService = new LocationService();