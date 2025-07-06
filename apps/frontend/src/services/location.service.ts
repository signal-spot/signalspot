import { Platform, Alert } from 'react-native';
import Geolocation from 'react-native-geolocation-service';
import { 
  request, 
  PERMISSIONS, 
  RESULTS, 
  Permission,
  check,
  requestMultiple 
} from 'react-native-permissions';

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  altitude?: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
}

export interface LocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
  distanceFilter?: number;
  interval?: number;
  fastestInterval?: number;
  showLocationDialog?: boolean;
  forceRequestLocation?: boolean;
}

export interface LocationError {
  code: number;
  message: string;
}

export interface LocationUpdate {
  coordinates: LocationCoordinates;
  timestamp: number;
  mocked?: boolean;
}

export enum LocationPermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  BLOCKED = 'blocked',
  UNAVAILABLE = 'unavailable',
  LIMITED = 'limited',
}

export enum LocationAccuracy {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low',
}

export enum LocationSource {
  GPS = 'gps',
  NETWORK = 'network',
  PASSIVE = 'passive',
}

class LocationService {
  private watchId: number | null = null;
  private currentLocation: LocationCoordinates | null = null;
  private lastLocationUpdate: number = 0;
  private locationUpdateCallbacks: Array<(location: LocationUpdate) => void> = [];
  private locationErrorCallbacks: Array<(error: LocationError) => void> = [];
  private permissionStatusCallbacks: Array<(status: LocationPermissionStatus) => void> = [];

  /**
   * Initialize location service
   */
  async initialize(): Promise<void> {
    try {
      const permissionStatus = await this.checkLocationPermission();
      this.notifyPermissionStatusCallbacks(permissionStatus);
      
      if (permissionStatus === LocationPermissionStatus.GRANTED) {
        await this.getCurrentLocation();
      }
    } catch (error) {
      console.error('Failed to initialize location service:', error);
    }
  }

  /**
   * Check location permission status
   */
  async checkLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      const permission = this.getLocationPermission();
      const result = await check(permission);
      
      switch (result) {
        case RESULTS.GRANTED:
          return LocationPermissionStatus.GRANTED;
        case RESULTS.DENIED:
          return LocationPermissionStatus.DENIED;
        case RESULTS.BLOCKED:
          return LocationPermissionStatus.BLOCKED;
        case RESULTS.UNAVAILABLE:
          return LocationPermissionStatus.UNAVAILABLE;
        case RESULTS.LIMITED:
          return LocationPermissionStatus.LIMITED;
        default:
          return LocationPermissionStatus.UNAVAILABLE;
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      return LocationPermissionStatus.UNAVAILABLE;
    }
  }

  /**
   * Request location permission
   */
  async requestLocationPermission(): Promise<LocationPermissionStatus> {
    try {
      const permission = this.getLocationPermission();
      const result = await request(permission);
      
      let status: LocationPermissionStatus;
      switch (result) {
        case RESULTS.GRANTED:
          status = LocationPermissionStatus.GRANTED;
          break;
        case RESULTS.DENIED:
          status = LocationPermissionStatus.DENIED;
          break;
        case RESULTS.BLOCKED:
          status = LocationPermissionStatus.BLOCKED;
          break;
        case RESULTS.UNAVAILABLE:
          status = LocationPermissionStatus.UNAVAILABLE;
          break;
        case RESULTS.LIMITED:
          status = LocationPermissionStatus.LIMITED;
          break;
        default:
          status = LocationPermissionStatus.UNAVAILABLE;
      }

      this.notifyPermissionStatusCallbacks(status);
      return status;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return LocationPermissionStatus.UNAVAILABLE;
    }
  }

  /**
   * Request multiple location permissions (foreground and background)
   */
  async requestAllLocationPermissions(): Promise<{
    foreground: LocationPermissionStatus;
    background?: LocationPermissionStatus;
  }> {
    try {
      const permissions: Permission[] = [this.getLocationPermission()];
      
      // Add background location permission for Android
      if (Platform.OS === 'android') {
        permissions.push(PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION);
      }

      const results = await requestMultiple(permissions);
      
      const foregroundPermission = this.getLocationPermission();
      const foregroundStatus = this.convertPermissionResult(results[foregroundPermission]);
      
      let backgroundStatus: LocationPermissionStatus | undefined;
      if (Platform.OS === 'android') {
        backgroundStatus = this.convertPermissionResult(results[PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION]);
      }

      this.notifyPermissionStatusCallbacks(foregroundStatus);
      
      return {
        foreground: foregroundStatus,
        background: backgroundStatus,
      };
    } catch (error) {
      console.error('Error requesting all location permissions:', error);
      return {
        foreground: LocationPermissionStatus.UNAVAILABLE,
        background: LocationPermissionStatus.UNAVAILABLE,
      };
    }
  }

  /**
   * Get current location
   */
  async getCurrentLocation(options?: LocationOptions): Promise<LocationCoordinates> {
    return new Promise((resolve, reject) => {
      const defaultOptions: LocationOptions = {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
        ...options,
      };

      Geolocation.getCurrentPosition(
        (position) => {
          const coordinates: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
          };

          this.currentLocation = coordinates;
          this.lastLocationUpdate = Date.now();
          
          const locationUpdate: LocationUpdate = {
            coordinates,
            timestamp: position.timestamp,
            mocked: position.mocked,
          };

          this.notifyLocationUpdateCallbacks(locationUpdate);
          resolve(coordinates);
        },
        (error) => {
          const locationError: LocationError = {
            code: error.code,
            message: error.message,
          };
          
          this.notifyLocationErrorCallbacks(locationError);
          reject(locationError);
        },
        defaultOptions
      );
    });
  }

  /**
   * Start watching location changes
   */
  startLocationTracking(options?: LocationOptions): boolean {
    if (this.watchId !== null) {
      this.stopLocationTracking();
    }

    const defaultOptions: LocationOptions = {
      enableHighAccuracy: true,
      distanceFilter: 10, // meters
      interval: 5000, // 5 seconds
      fastestInterval: 2000, // 2 seconds
      ...options,
    };

    try {
      this.watchId = Geolocation.watchPosition(
        (position) => {
          const coordinates: LocationCoordinates = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || undefined,
            accuracy: position.coords.accuracy,
            heading: position.coords.heading || undefined,
            speed: position.coords.speed || undefined,
          };

          this.currentLocation = coordinates;
          this.lastLocationUpdate = Date.now();
          
          const locationUpdate: LocationUpdate = {
            coordinates,
            timestamp: position.timestamp,
            mocked: position.mocked,
          };

          this.notifyLocationUpdateCallbacks(locationUpdate);
        },
        (error) => {
          const locationError: LocationError = {
            code: error.code,
            message: error.message,
          };
          
          this.notifyLocationErrorCallbacks(locationError);
        },
        defaultOptions
      );

      return true;
    } catch (error) {
      console.error('Error starting location tracking:', error);
      return false;
    }
  }

  /**
   * Stop watching location changes
   */
  stopLocationTracking(): void {
    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  /**
   * Get last known location
   */
  getLastKnownLocation(): LocationCoordinates | null {
    return this.currentLocation;
  }

  /**
   * Check if location is recent
   */
  isLocationRecent(maxAgeMs: number = 30000): boolean {
    if (this.lastLocationUpdate === 0) return false;
    return Date.now() - this.lastLocationUpdate <= maxAgeMs;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Check if coordinates are within a radius
   */
  isWithinRadius(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
    radiusKm: number
  ): boolean {
    const distance = this.calculateDistance(lat1, lon1, lat2, lon2);
    return distance <= radiusKm;
  }

  /**
   * Get location accuracy level
   */
  getAccuracyLevel(accuracy: number): LocationAccuracy {
    if (accuracy <= 10) return LocationAccuracy.HIGH;
    if (accuracy <= 50) return LocationAccuracy.MEDIUM;
    return LocationAccuracy.LOW;
  }

  /**
   * Show location permission dialog
   */
  showLocationPermissionDialog(): void {
    Alert.alert(
      'Location Permission Required',
      'This app needs access to your location to provide location-based features. Please enable location permissions in your device settings.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Settings', onPress: this.openAppSettings },
      ]
    );
  }

  /**
   * Open app settings
   */
  openAppSettings(): void {
    // This would typically open the app settings
    // Implementation depends on additional libraries like react-native-permissions
    console.log('Opening app settings...');
  }

  /**
   * Subscribe to location updates
   */
  onLocationUpdate(callback: (location: LocationUpdate) => void): () => void {
    this.locationUpdateCallbacks.push(callback);
    
    return () => {
      const index = this.locationUpdateCallbacks.indexOf(callback);
      if (index > -1) {
        this.locationUpdateCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to location errors
   */
  onLocationError(callback: (error: LocationError) => void): () => void {
    this.locationErrorCallbacks.push(callback);
    
    return () => {
      const index = this.locationErrorCallbacks.indexOf(callback);
      if (index > -1) {
        this.locationErrorCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Subscribe to permission status changes
   */
  onPermissionStatusChange(callback: (status: LocationPermissionStatus) => void): () => void {
    this.permissionStatusCallbacks.push(callback);
    
    return () => {
      const index = this.permissionStatusCallbacks.indexOf(callback);
      if (index > -1) {
        this.permissionStatusCallbacks.splice(index, 1);
      }
    };
  }

  /**
   * Clean up all subscriptions
   */
  cleanup(): void {
    this.stopLocationTracking();
    this.locationUpdateCallbacks = [];
    this.locationErrorCallbacks = [];
    this.permissionStatusCallbacks = [];
  }

  // Private methods
  private getLocationPermission(): Permission {
    return Platform.OS === 'ios' 
      ? PERMISSIONS.IOS.LOCATION_WHEN_IN_USE 
      : PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION;
  }

  private convertPermissionResult(result: string): LocationPermissionStatus {
    switch (result) {
      case RESULTS.GRANTED:
        return LocationPermissionStatus.GRANTED;
      case RESULTS.DENIED:
        return LocationPermissionStatus.DENIED;
      case RESULTS.BLOCKED:
        return LocationPermissionStatus.BLOCKED;
      case RESULTS.UNAVAILABLE:
        return LocationPermissionStatus.UNAVAILABLE;
      case RESULTS.LIMITED:
        return LocationPermissionStatus.LIMITED;
      default:
        return LocationPermissionStatus.UNAVAILABLE;
    }
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private notifyLocationUpdateCallbacks(location: LocationUpdate): void {
    this.locationUpdateCallbacks.forEach(callback => {
      try {
        callback(location);
      } catch (error) {
        console.error('Error in location update callback:', error);
      }
    });
  }

  private notifyLocationErrorCallbacks(error: LocationError): void {
    this.locationErrorCallbacks.forEach(callback => {
      try {
        callback(error);
      } catch (error) {
        console.error('Error in location error callback:', error);
      }
    });
  }

  private notifyPermissionStatusCallbacks(status: LocationPermissionStatus): void {
    this.permissionStatusCallbacks.forEach(callback => {
      try {
        callback(status);
      } catch (error) {
        console.error('Error in permission status callback:', error);
      }
    });
  }
}

// Export singleton instance
export const locationService = new LocationService();
export default locationService;