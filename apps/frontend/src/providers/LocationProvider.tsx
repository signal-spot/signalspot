import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { 
  locationService, 
  LocationCoordinates, 
  LocationUpdate, 
  LocationError, 
  LocationPermissionStatus 
} from '../services/location.service';

interface LocationPreferences {
  enableHighAccuracy: boolean;
  distanceFilter: number;
  autoTrack: boolean;
  backgroundTracking: boolean;
  shareLocation: boolean;
  shareRadius: number;
  nearbyNotifications: boolean;
  notificationRadius: number;
}

interface LocationContextType {
  // Current location state
  currentLocation: LocationCoordinates | null;
  loading: boolean;
  error: LocationError | null;
  permissionStatus: LocationPermissionStatus;
  isTracking: boolean;
  lastUpdate: number | null;
  
  // Location preferences
  preferences: LocationPreferences;
  
  // Actions
  requestPermission: () => Promise<LocationPermissionStatus>;
  requestAllPermissions: () => Promise<void>;
  getCurrentLocation: () => Promise<LocationCoordinates | null>;
  startTracking: () => Promise<boolean>;
  stopTracking: () => void;
  updatePreferences: (updates: Partial<LocationPreferences>) => void;
  clearError: () => void;
  
  // Utilities
  isLocationRecent: (maxAgeMs?: number) => boolean;
  calculateDistance: (lat: number, lon: number) => number | null;
  isWithinRadius: (lat: number, lon: number, radiusKm: number) => boolean;
  
  // Location sharing
  canShareLocation: boolean;
  sharingRadius: number;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

interface LocationProviderProps {
  children: ReactNode;
}

const DEFAULT_PREFERENCES: LocationPreferences = {
  enableHighAccuracy: true,
  distanceFilter: 10,
  autoTrack: false,
  backgroundTracking: false,
  shareLocation: false,
  shareRadius: 5,
  nearbyNotifications: false,
  notificationRadius: 1,
};

export const LocationProvider: React.FC<LocationProviderProps> = ({ children }) => {
  const [currentLocation, setCurrentLocation] = useState<LocationCoordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<LocationError | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<LocationPermissionStatus>(LocationPermissionStatus.UNAVAILABLE);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);
  const [preferences, setPreferences] = useState<LocationPreferences>(DEFAULT_PREFERENCES);

  // Handle location updates
  const handleLocationUpdate = (locationUpdate: LocationUpdate) => {
    setCurrentLocation(locationUpdate.coordinates);
    setLastUpdate(locationUpdate.timestamp);
    setLoading(false);
    setError(null);
  };

  // Handle location errors
  const handleLocationError = (locationError: LocationError) => {
    setError(locationError);
    setLoading(false);
    
    // Show user-friendly error messages
    if (locationError.code === 1) {
      // Permission denied
      showPermissionDeniedAlert();
    } else if (locationError.code === 2) {
      // Position unavailable
      Alert.alert(
        'Location Unavailable',
        'Unable to determine your location. Please check your GPS settings and try again.',
        [{ text: 'OK' }]
      );
    } else if (locationError.code === 3) {
      // Timeout
      Alert.alert(
        'Location Timeout',
        'Location request timed out. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle permission status changes
  const handlePermissionStatusChange = (status: LocationPermissionStatus) => {
    setPermissionStatus(status);
    
    if (status === LocationPermissionStatus.GRANTED && preferences.autoTrack) {
      startTracking();
    } else if (status !== LocationPermissionStatus.GRANTED) {
      stopTracking();
    }
  };

  // Request location permission
  const requestPermission = async (): Promise<LocationPermissionStatus> => {
    try {
      const status = await locationService.requestLocationPermission();
      setPermissionStatus(status);
      return status;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return LocationPermissionStatus.UNAVAILABLE;
    }
  };

  // Request all location permissions (foreground and background)
  const requestAllPermissions = async (): Promise<void> => {
    try {
      const { foreground, background } = await locationService.requestAllLocationPermissions();
      setPermissionStatus(foreground);
      
      if (foreground !== LocationPermissionStatus.GRANTED) {
        showPermissionDeniedAlert();
      } else if (preferences.backgroundTracking && background !== LocationPermissionStatus.GRANTED) {
        showBackgroundPermissionAlert();
      }
    } catch (error) {
      console.error('Error requesting all location permissions:', error);
    }
  };

  // Get current location
  const getCurrentLocation = async (): Promise<LocationCoordinates | null> => {
    try {
      setLoading(true);
      setError(null);
      
      const coordinates = await locationService.getCurrentLocation({
        enableHighAccuracy: preferences.enableHighAccuracy,
        timeout: 15000,
        maximumAge: 10000,
      });
      
      setCurrentLocation(coordinates);
      setLastUpdate(Date.now());
      setLoading(false);
      
      return coordinates;
    } catch (error) {
      const locationError = error as LocationError;
      setError(locationError);
      setLoading(false);
      return null;
    }
  };

  // Start location tracking
  const startTracking = async (): Promise<boolean> => {
    if (permissionStatus !== LocationPermissionStatus.GRANTED) {
      const status = await requestPermission();
      if (status !== LocationPermissionStatus.GRANTED) {
        return false;
      }
    }

    try {
      const success = locationService.startLocationTracking({
        enableHighAccuracy: preferences.enableHighAccuracy,
        distanceFilter: preferences.distanceFilter,
        interval: 5000,
        fastestInterval: 2000,
      });
      
      if (success) {
        setIsTracking(true);
        setError(null);
      }
      
      return success;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  };

  // Stop location tracking
  const stopTracking = (): void => {
    try {
      locationService.stopLocationTracking();
      setIsTracking(false);
    } catch (error) {
      console.error('Error stopping location tracking:', error);
    }
  };

  // Update preferences
  const updatePreferences = (updates: Partial<LocationPreferences>): void => {
    setPreferences(prev => {
      const newPreferences = { ...prev, ...updates };
      
      // If auto-track is enabled and we have permission, start tracking
      if (updates.autoTrack && permissionStatus === LocationPermissionStatus.GRANTED) {
        startTracking();
      } else if (updates.autoTrack === false) {
        stopTracking();
      }
      
      return newPreferences;
    });
  };

  // Clear error
  const clearError = (): void => {
    setError(null);
  };

  // Check if location is recent
  const isLocationRecent = (maxAgeMs = 30000): boolean => {
    if (!lastUpdate) return false;
    return Date.now() - lastUpdate <= maxAgeMs;
  };

  // Calculate distance from current location
  const calculateDistance = (lat: number, lon: number): number | null => {
    if (!currentLocation) return null;
    
    return locationService.calculateDistance(
      currentLocation.latitude,
      currentLocation.longitude,
      lat,
      lon
    );
  };

  // Check if coordinates are within radius of current location
  const isWithinRadius = (lat: number, lon: number, radiusKm: number): boolean => {
    if (!currentLocation) return false;
    
    return locationService.isWithinRadius(
      currentLocation.latitude,
      currentLocation.longitude,
      lat,
      lon,
      radiusKm
    );
  };

  // Show permission denied alert
  const showPermissionDeniedAlert = (): void => {
    Alert.alert(
      'Location Permission Required',
      'This app needs access to your location to provide location-based features. Please enable location permissions in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openAppSettings },
      ]
    );
  };

  // Show background permission alert
  const showBackgroundPermissionAlert = (): void => {
    Alert.alert(
      'Background Location Permission',
      'To track your location in the background, please enable "Allow all the time" in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Open Settings', onPress: openAppSettings },
      ]
    );
  };

  // Open app settings
  const openAppSettings = (): void => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  };

  // Initialize location service
  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        // Check initial permission status
        const initialStatus = await locationService.checkLocationPermission();
        if (mounted) {
          setPermissionStatus(initialStatus);
        }

        // Get last known location
        const lastKnownLocation = locationService.getLastKnownLocation();
        if (mounted && lastKnownLocation) {
          setCurrentLocation(lastKnownLocation);
        }

        // Auto-start tracking if enabled and permission granted
        if (preferences.autoTrack && initialStatus === LocationPermissionStatus.GRANTED) {
          startTracking();
        }
      } catch (error) {
        console.error('Error initializing location service:', error);
      }
    };

    initialize();

    return () => {
      mounted = false;
    };
  }, [preferences.autoTrack]);

  // Set up location service subscriptions
  useEffect(() => {
    const unsubscribeLocationUpdate = locationService.onLocationUpdate(handleLocationUpdate);
    const unsubscribeLocationError = locationService.onLocationError(handleLocationError);
    const unsubscribePermissionStatus = locationService.onPermissionStatusChange(handlePermissionStatusChange);

    return () => {
      unsubscribeLocationUpdate();
      unsubscribeLocationError();
      unsubscribePermissionStatus();
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Stop tracking if active
      if (isTracking) {
        locationService.stopTracking();
      }
    };
  }, [isTracking]);

  const contextValue: LocationContextType = {
    // Current location state
    currentLocation,
    loading,
    error,
    permissionStatus,
    isTracking,
    lastUpdate,
    
    // Location preferences
    preferences,
    
    // Actions
    requestPermission,
    requestAllPermissions,
    getCurrentLocation,
    startTracking,
    stopTracking,
    updatePreferences,
    clearError,
    
    // Utilities
    isLocationRecent,
    calculateDistance,
    isWithinRadius,
    
    // Location sharing
    canShareLocation: preferences.shareLocation && permissionStatus === LocationPermissionStatus.GRANTED,
    sharingRadius: preferences.shareRadius,
  };

  return (
    <LocationContext.Provider value={contextValue}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = (): LocationContextType => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocationContext must be used within a LocationProvider');
  }
  return context;
};

export default LocationProvider;