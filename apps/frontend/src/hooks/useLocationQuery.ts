import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocationContext } from '../providers/LocationProvider';
import { locationQueryService } from '../services/locationQuery.service';

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
  distance?: number;
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
  distance?: number;
}

interface UseLocationQueryOptions {
  radius?: number;
  privacy?: 'public' | 'friends' | 'private';
  accuracyLevel?: 'high' | 'medium' | 'low';
  autoRefresh?: boolean;
  refreshInterval?: number; // in milliseconds
  limit?: number;
  offset?: number;
}

interface UseLocationQueryState {
  nearbyLocations: LocationRecord[];
  nearbyUsers: UserLocation[];
  loading: boolean;
  error: string | null;
  lastUpdate: number | null;
  hasMore: boolean;
}

interface UseLocationQueryReturn extends UseLocationQueryState {
  // Actions
  refreshNearbyLocations: () => Promise<void>;
  refreshNearbyUsers: () => Promise<void>;
  loadMoreLocations: () => Promise<void>;
  loadMoreUsers: () => Promise<void>;
  updateCurrentLocation: () => Promise<void>;
  clearError: () => void;
  
  // Utilities
  getDistanceToLocation: (lat: number, lon: number) => number | null;
  isWithinRadius: (lat: number, lon: number, radius: number) => boolean;
  findClosestLocation: () => LocationRecord | null;
  findClosestUser: () => UserLocation | null;
}

export const useLocationQuery = (options: UseLocationQueryOptions = {}): UseLocationQueryReturn => {
  const {
    radius = 5,
    privacy = 'public',
    accuracyLevel = 'medium',
    autoRefresh = false,
    refreshInterval = 30000, // 30 seconds
    limit = 20,
    offset = 0,
  } = options;

  const { currentLocation, isTracking, canShareLocation } = useLocationContext();
  
  const [state, setState] = useState<UseLocationQueryState>({
    nearbyLocations: [],
    nearbyUsers: [],
    loading: false,
    error: null,
    lastUpdate: null,
    hasMore: true,
  });

  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const currentOffsetRef = useRef(offset);

  // Update state helper
  const updateState = useCallback((updates: Partial<UseLocationQueryState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Get distance to a location
  const getDistanceToLocation = useCallback((lat: number, lon: number): number | null => {
    if (!currentLocation) return null;
    
    return locationQueryService.getDistanceToLocation(lat, lon);
  }, [currentLocation]);

  // Check if coordinates are within radius
  const isWithinRadius = useCallback((lat: number, lon: number, radiusKm: number): boolean => {
    if (!currentLocation) return false;
    
    return locationQueryService.isLocationWithinSharingRadius(lat, lon, radiusKm);
  }, [currentLocation]);

  // Find closest location
  const findClosestLocation = useCallback((): LocationRecord | null => {
    if (state.nearbyLocations.length === 0) return null;
    
    return state.nearbyLocations.reduce((closest, location) => {
      if (!closest) return location;
      
      const closestDistance = closest.distance ?? Infinity;
      const locationDistance = location.distance ?? Infinity;
      
      return locationDistance < closestDistance ? location : closest;
    });
  }, [state.nearbyLocations]);

  // Find closest user
  const findClosestUser = useCallback((): UserLocation | null => {
    if (state.nearbyUsers.length === 0) return null;
    
    return state.nearbyUsers.reduce((closest, user) => {
      if (!closest) return user;
      
      const closestDistance = closest.distance ?? Infinity;
      const userDistance = user.distance ?? Infinity;
      
      return userDistance < closestDistance ? user : closest;
    });
  }, [state.nearbyUsers]);

  // Refresh nearby locations
  const refreshNearbyLocations = useCallback(async (): Promise<void> => {
    if (!currentLocation) {
      updateState({ error: 'Current location not available' });
      return;
    }

    try {
      updateState({ loading: true, error: null });
      
      const response = await locationQueryService.findNearbyLocations({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        radius,
        privacy,
        accuracyLevel,
        limit,
        offset: 0,
      });

      if (response.success) {
        updateState({
          nearbyLocations: response.data,
          loading: false,
          lastUpdate: Date.now(),
          hasMore: response.data.length === limit,
        });
        currentOffsetRef.current = 0;
      } else {
        updateState({
          loading: false,
          error: response.message || 'Failed to fetch nearby locations',
        });
      }
    } catch (error) {
      updateState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [currentLocation, radius, privacy, accuracyLevel, limit, updateState]);

  // Refresh nearby users
  const refreshNearbyUsers = useCallback(async (): Promise<void> => {
    if (!currentLocation || !canShareLocation) {
      updateState({ error: 'Location sharing not enabled' });
      return;
    }

    try {
      updateState({ loading: true, error: null });
      
      const response = await locationQueryService.findNearbyUsers({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        radius,
        locationPrivacy: privacy,
        limit,
        offset: 0,
      });

      if (response.success) {
        updateState({
          nearbyUsers: response.data,
          loading: false,
          lastUpdate: Date.now(),
          hasMore: response.data.length === limit,
        });
        currentOffsetRef.current = 0;
      } else {
        updateState({
          loading: false,
          error: response.message || 'Failed to fetch nearby users',
        });
      }
    } catch (error) {
      updateState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [currentLocation, canShareLocation, radius, privacy, limit, updateState]);

  // Load more locations
  const loadMoreLocations = useCallback(async (): Promise<void> => {
    if (!currentLocation || !state.hasMore || state.loading) return;

    try {
      updateState({ loading: true });
      
      const newOffset = currentOffsetRef.current + limit;
      
      const response = await locationQueryService.findNearbyLocations({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        radius,
        privacy,
        accuracyLevel,
        limit,
        offset: newOffset,
      });

      if (response.success) {
        updateState({
          nearbyLocations: [...state.nearbyLocations, ...response.data],
          loading: false,
          hasMore: response.data.length === limit,
        });
        currentOffsetRef.current = newOffset;
      } else {
        updateState({
          loading: false,
          error: response.message || 'Failed to load more locations',
        });
      }
    } catch (error) {
      updateState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [currentLocation, state.hasMore, state.loading, state.nearbyLocations, radius, privacy, accuracyLevel, limit, updateState]);

  // Load more users
  const loadMoreUsers = useCallback(async (): Promise<void> => {
    if (!currentLocation || !canShareLocation || !state.hasMore || state.loading) return;

    try {
      updateState({ loading: true });
      
      const newOffset = currentOffsetRef.current + limit;
      
      const response = await locationQueryService.findNearbyUsers({
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        radius,
        locationPrivacy: privacy,
        limit,
        offset: newOffset,
      });

      if (response.success) {
        updateState({
          nearbyUsers: [...state.nearbyUsers, ...response.data],
          loading: false,
          hasMore: response.data.length === limit,
        });
        currentOffsetRef.current = newOffset;
      } else {
        updateState({
          loading: false,
          error: response.message || 'Failed to load more users',
        });
      }
    } catch (error) {
      updateState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [currentLocation, canShareLocation, state.hasMore, state.loading, state.nearbyUsers, radius, privacy, limit, updateState]);

  // Update current location from GPS
  const updateCurrentLocation = useCallback(async (): Promise<void> => {
    try {
      updateState({ loading: true, error: null });
      
      const response = await locationQueryService.updateCurrentLocationFromGPS();
      
      if (response.success) {
        updateState({ loading: false });
        // Refresh nearby data after location update
        await Promise.all([refreshNearbyLocations(), refreshNearbyUsers()]);
      } else {
        updateState({
          loading: false,
          error: response.message || 'Failed to update current location',
        });
      }
    } catch (error) {
      updateState({
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }, [updateState, refreshNearbyLocations, refreshNearbyUsers]);

  // Set up auto-refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        if (currentLocation && isTracking) {
          refreshNearbyLocations();
          if (canShareLocation) {
            refreshNearbyUsers();
          }
        }
      }, refreshInterval);

      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, currentLocation, isTracking, canShareLocation, refreshNearbyLocations, refreshNearbyUsers]);

  // Initial data fetch when location becomes available
  useEffect(() => {
    if (currentLocation) {
      refreshNearbyLocations();
      if (canShareLocation) {
        refreshNearbyUsers();
      }
    }
  }, [currentLocation, canShareLocation]); // Only trigger when location or sharing permission changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    // State
    nearbyLocations: state.nearbyLocations,
    nearbyUsers: state.nearbyUsers,
    loading: state.loading,
    error: state.error,
    lastUpdate: state.lastUpdate,
    hasMore: state.hasMore,
    
    // Actions
    refreshNearbyLocations,
    refreshNearbyUsers,
    loadMoreLocations,
    loadMoreUsers,
    updateCurrentLocation,
    clearError,
    
    // Utilities
    getDistanceToLocation,
    isWithinRadius,
    findClosestLocation,
    findClosestUser,
  };
};

export default useLocationQuery;