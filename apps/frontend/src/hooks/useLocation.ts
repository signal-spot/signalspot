import { useState, useEffect, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { 
  locationService, 
  LocationCoordinates, 
  LocationUpdate, 
  LocationError, 
  LocationPermissionStatus,
  LocationOptions 
} from '../services/location.service';

export interface LocationState {
  coordinates: LocationCoordinates | null;
  loading: boolean;
  error: LocationError | null;
  permissionStatus: LocationPermissionStatus;
  lastUpdate: number | null;
  isTracking: boolean;
}

export interface UseLocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number;
  autoStart?: boolean;
  trackInBackground?: boolean;
  requestPermissionOnMount?: boolean;
}

export interface UseLocationReturn {
  // State
  location: LocationCoordinates | null;
  loading: boolean;
  error: LocationError | null;
  permissionStatus: LocationPermissionStatus;
  lastUpdate: number | null;
  isTracking: boolean;
  
  // Actions
  requestPermission: () => Promise<LocationPermissionStatus>;
  getCurrentLocation: () => Promise<LocationCoordinates | null>;
  startTracking: () => boolean;
  stopTracking: () => void;
  clearError: () => void;
  refresh: () => Promise<void>;
  
  // Utilities
  isLocationRecent: (maxAgeMs?: number) => boolean;
  calculateDistance: (lat: number, lon: number) => number | null;
  isWithinRadius: (lat: number, lon: number, radiusKm: number) => boolean;
}

export const useLocation = (options: UseLocationOptions = {}): UseLocationReturn => {
  const {
    enableHighAccuracy = true,
    timeout = 15000,
    maximumAge = 10000,
    distanceFilter = 10,
    autoStart = false,
    trackInBackground = false,
    requestPermissionOnMount = true,
  } = options;

  const [state, setState] = useState<LocationState>({
    coordinates: null,
    loading: false,
    error: null,
    permissionStatus: LocationPermissionStatus.UNAVAILABLE,
    lastUpdate: null,
    isTracking: false,
  });

  const appState = useRef(AppState.currentState);
  const trackingEnabled = useRef(false);

  // Location service options
  const locationOptions: LocationOptions = {
    enableHighAccuracy,
    timeout,
    maximumAge,
    distanceFilter,
  };

  // Update state helper
  const updateState = useCallback((updates: Partial<LocationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Handle location updates
  const handleLocationUpdate = useCallback((locationUpdate: LocationUpdate) => {
    updateState({
      coordinates: locationUpdate.coordinates,
      loading: false,
      error: null,
      lastUpdate: locationUpdate.timestamp,
    });
  }, [updateState]);

  // Handle location errors
  const handleLocationError = useCallback((error: LocationError) => {
    updateState({
      loading: false,
      error,
    });
  }, [updateState]);

  // Handle permission status changes
  const handlePermissionStatusChange = useCallback((status: LocationPermissionStatus) => {
    updateState({
      permissionStatus: status,
    });
  }, [updateState]);

  // Request location permission
  const requestPermission = useCallback(async (): Promise<LocationPermissionStatus> => {
    try {
      const status = await locationService.requestLocationPermission();
      updateState({ permissionStatus: status });
      return status;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return LocationPermissionStatus.UNAVAILABLE;
    }
  }, [updateState]);

  // Get current location
  const getCurrentLocation = useCallback(async (): Promise<LocationCoordinates | null> => {
    try {
      updateState({ loading: true, error: null });
      
      const coordinates = await locationService.getCurrentLocation(locationOptions);
      updateState({
        coordinates,
        loading: false,
        error: null,
        lastUpdate: Date.now(),
      });
      
      return coordinates;
    } catch (error) {
      const locationError = error as LocationError;
      updateState({
        loading: false,
        error: locationError,
      });
      return null;
    }
  }, [locationOptions, updateState]);

  // Start location tracking
  const startTracking = useCallback((): boolean => {
    if (state.permissionStatus !== LocationPermissionStatus.GRANTED) {
      console.warn('Location permission not granted. Cannot start tracking.');
      return false;
    }

    try {
      const success = locationService.startLocationTracking(locationOptions);
      if (success) {
        trackingEnabled.current = true;
        updateState({ isTracking: true });
      }
      return success;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }, [state.permissionStatus, locationOptions, updateState]);

  // Stop location tracking
  const stopTracking = useCallback(() => {
    try {
      locationService.stopLocationTracking();
      trackingEnabled.current = false;
      updateState({ isTracking: false });
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  }, [updateState]);

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  // Refresh location
  const refresh = useCallback(async (): Promise<void> => {
    await getCurrentLocation();
  }, [getCurrentLocation]);

  // Check if location is recent
  const isLocationRecent = useCallback((maxAgeMs: number = 30000): boolean => {
    if (!state.lastUpdate) return false;
    return Date.now() - state.lastUpdate <= maxAgeMs;
  }, [state.lastUpdate]);

  // Calculate distance from current location
  const calculateDistance = useCallback((lat: number, lon: number): number | null => {
    if (!state.coordinates) return null;
    
    return locationService.calculateDistance(
      state.coordinates.latitude,
      state.coordinates.longitude,
      lat,
      lon
    );
  }, [state.coordinates]);

  // Check if coordinates are within radius of current location
  const isWithinRadius = useCallback((lat: number, lon: number, radiusKm: number): boolean => {
    if (!state.coordinates) return false;
    
    return locationService.isWithinRadius(
      state.coordinates.latitude,
      state.coordinates.longitude,
      lat,
      lon,
      radiusKm
    );
  }, [state.coordinates]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        // App has come to the foreground
        if (trackingEnabled.current && !trackInBackground) {
          startTracking();
        }
      } else if (nextAppState.match(/inactive|background/)) {
        // App has gone to the background
        if (!trackInBackground) {
          stopTracking();
        }
      }
      appState.current = nextAppState;
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [startTracking, stopTracking, trackInBackground]);

  // Initialize location service and set up subscriptions
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      // Check initial permission status
      const initialStatus = await locationService.checkLocationPermission();
      if (mounted) {
        updateState({ permissionStatus: initialStatus });
      }

      // Request permission if needed
      if (requestPermissionOnMount && initialStatus !== LocationPermissionStatus.GRANTED) {
        await requestPermission();
      }

      // Auto-start tracking if enabled and permission granted
      if (autoStart && initialStatus === LocationPermissionStatus.GRANTED) {
        startTracking();
      }
    };

    initialize();

    // Set up location service subscriptions
    const unsubscribeLocationUpdate = locationService.onLocationUpdate(handleLocationUpdate);
    const unsubscribeLocationError = locationService.onLocationError(handleLocationError);
    const unsubscribePermissionStatus = locationService.onPermissionStatusChange(handlePermissionStatusChange);

    // Cleanup function
    return () => {
      mounted = false;
      unsubscribeLocationUpdate();
      unsubscribeLocationError();
      unsubscribePermissionStatus();
      stopTracking();
    };
  }, [
    autoStart,
    requestPermissionOnMount,
    requestPermission,
    startTracking,
    stopTracking,
    handleLocationUpdate,
    handleLocationError,
    handlePermissionStatusChange,
    updateState,
  ]);

  return {
    // State
    location: state.coordinates,
    loading: state.loading,
    error: state.error,
    permissionStatus: state.permissionStatus,
    lastUpdate: state.lastUpdate,
    isTracking: state.isTracking,
    
    // Actions
    requestPermission,
    getCurrentLocation,
    startTracking,
    stopTracking,
    clearError,
    refresh,
    
    // Utilities
    isLocationRecent,
    calculateDistance,
    isWithinRadius,
  };
};

export default useLocation;