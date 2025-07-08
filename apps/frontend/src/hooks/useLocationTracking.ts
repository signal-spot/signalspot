import { useState, useEffect, useCallback } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { locationTrackerService, LocationData } from '../services/location-tracker.service';
import { useAuth } from '../providers/AuthProvider';

export interface LocationTrackingState {
  isTracking: boolean;
  currentLocation: LocationData | null;
  lastUpdate: Date | null;
  error: string | null;
  locationHistory: LocationData[];
  lastSyncTime: Date | null;
}

export const useLocationTracking = () => {
  const { user } = useAuth();
  
  const [state, setState] = useState<LocationTrackingState>({
    isTracking: false,
    currentLocation: null,
    lastUpdate: null,
    error: null,
    locationHistory: [],
    lastSyncTime: null,
  });

  const updateCurrentLocation = useCallback((location: LocationData) => {
    setState(prev => ({
      ...prev,
      currentLocation: location,
      lastUpdate: new Date(location.timestamp),
      error: null,
    }));
  }, []);

  const handleLocationError = useCallback((error: Error) => {
    setState(prev => ({
      ...prev,
      error: error.message,
    }));
  }, []);

  const startTracking = useCallback(async () => {
    if (!user) {
      setState(prev => ({
        ...prev,
        error: '로그인이 필요합니다.',
      }));
      return false;
    }

    try {
      const success = await locationTrackerService.startTracking(
        updateCurrentLocation,
        handleLocationError
      );

      if (success) {
        setState(prev => ({
          ...prev,
          isTracking: true,
          error: null,
        }));
        
        // Load location history
        const history = await locationTrackerService.getLocationHistory();
        setState(prev => ({
          ...prev,
          locationHistory: history,
        }));

        // Get last sync time
        const lastSync = await locationTrackerService.getLastSyncTime();
        setState(prev => ({
          ...prev,
          lastSyncTime: lastSync ? new Date(lastSync) : null,
        }));
      }

      return success;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '위치 추적 시작 실패',
      }));
      return false;
    }
  }, [user, updateCurrentLocation, handleLocationError]);

  const stopTracking = useCallback(async () => {
    try {
      await locationTrackerService.stopTracking();
      setState(prev => ({
        ...prev,
        isTracking: false,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '위치 추적 중지 실패',
      }));
    }
  }, []);

  const syncLocationData = useCallback(async () => {
    try {
      await locationTrackerService.syncLocationData();
      
      const lastSync = await locationTrackerService.getLastSyncTime();
      setState(prev => ({
        ...prev,
        lastSyncTime: lastSync ? new Date(lastSync) : null,
        error: null,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '위치 데이터 동기화 실패',
      }));
    }
  }, []);

  const getCurrentLocation = useCallback(async () => {
    try {
      const location = await locationTrackerService.getCurrentLocation();
      if (location) {
        updateCurrentLocation(location);
      }
      return location;
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '현재 위치 가져오기 실패',
      }));
      return null;
    }
  }, [updateCurrentLocation]);

  const refreshLocationHistory = useCallback(async () => {
    try {
      const history = await locationTrackerService.getLocationHistory();
      setState(prev => ({
        ...prev,
        locationHistory: history,
      }));
    } catch (error) {
      console.error('Failed to refresh location history:', error);
    }
  }, []);

  // Initialize location tracker
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        await locationTrackerService.initialize();
        
        if (mounted) {
          const isTracking = locationTrackerService.isCurrentlyTracking();
          const history = await locationTrackerService.getLocationHistory();
          const lastSync = await locationTrackerService.getLastSyncTime();
          
          setState(prev => ({
            ...prev,
            isTracking,
            locationHistory: history,
            lastSyncTime: lastSync ? new Date(lastSync) : null,
          }));
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({
            ...prev,
            error: '위치 추적 서비스 초기화 실패',
          }));
        }
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, []);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && state.isTracking) {
        // App became active, refresh current location
        getCurrentLocation();
        refreshLocationHistory();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription?.remove();
    };
  }, [state.isTracking, getCurrentLocation, refreshLocationHistory]);

  // Auto-sync location data periodically
  useEffect(() => {
    if (!state.isTracking) return;

    const interval = setInterval(() => {
      syncLocationData();
    }, 5 * 60 * 1000); // Sync every 5 minutes

    return () => {
      clearInterval(interval);
    };
  }, [state.isTracking, syncLocationData]);

  return {
    ...state,
    startTracking,
    stopTracking,
    syncLocationData,
    getCurrentLocation,
    refreshLocationHistory,
    config: locationTrackerService.getConfig(),
    updateConfig: locationTrackerService.updateConfig.bind(locationTrackerService),
  };
};