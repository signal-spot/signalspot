import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import BackgroundTimer from 'react-native-background-timer';

export interface LocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  speed?: number;
  heading?: number;
}

export interface LocationTrackerConfig {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
  distanceFilter: number; // meters
  interval: number; // milliseconds
  significantChangesOnly: boolean;
}

class LocationTrackerService {
  private watchId: number | null = null;
  private backgroundInterval: number | null = null;
  private isTracking = false;
  private locationBuffer: LocationData[] = [];
  private onLocationUpdate?: (location: LocationData) => void;
  private onError?: (error: Error) => void;

  private config: LocationTrackerConfig = {
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 10000,
    distanceFilter: 10, // Only trigger updates if moved 10+ meters
    interval: 30000, // Check every 30 seconds
    significantChangesOnly: false,
  };

  private readonly STORAGE_KEYS = {
    LOCATION_BUFFER: '@locationTracker/buffer',
    LAST_SYNC: '@locationTracker/lastSync',
    TRACKING_STATE: '@locationTracker/isTracking',
  };

  async requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        ]);

        return (
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION] === 
          PermissionsAndroid.RESULTS.GRANTED &&
          granted[PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION] === 
          PermissionsAndroid.RESULTS.GRANTED
        );
      } catch (err) {
        console.warn('Location permission error:', err);
        return false;
      }
    }

    return new Promise((resolve) => {
      Geolocation.requestAuthorization('whenInUse', {
        showLocationDialog: true,
        enableHighAccuracy: true,
      }).then((result) => {
        resolve(result === 'granted');
      }).catch(() => {
        resolve(false);
      });
    });
  }

  async startTracking(
    onLocationUpdate?: (location: LocationData) => void,
    onError?: (error: Error) => void
  ): Promise<boolean> {
    if (this.isTracking) {
      console.log('Location tracking already started');
      return true;
    }

    const hasPermission = await this.requestLocationPermission();
    if (!hasPermission) {
      Alert.alert(
        '위치 권한 필요',
        '스파크 감지를 위해 위치 추적 권한이 필요합니다.',
        [
          { text: '취소', style: 'cancel' },
          { text: '설정으로 이동', onPress: () => this.openSettings() },
        ]
      );
      return false;
    }

    this.onLocationUpdate = onLocationUpdate;
    this.onError = onError;

    // Start foreground tracking
    this.watchId = Geolocation.watchPosition(
      (position) => {
        const locationData: LocationData = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          speed: position.coords.speed || undefined,
          heading: position.coords.heading || undefined,
        };

        this.handleLocationUpdate(locationData);
      },
      (error) => {
        console.error('Location error:', error);
        this.onError?.(new Error(`Location error: ${error.message}`));
      },
      {
        enableHighAccuracy: this.config.enableHighAccuracy,
        timeout: this.config.timeout,
        maximumAge: this.config.maximumAge,
        distanceFilter: this.config.distanceFilter,
        interval: this.config.interval,
      }
    );

    // Start background tracking
    this.startBackgroundTracking();

    this.isTracking = true;
    await AsyncStorage.setItem(this.STORAGE_KEYS.TRACKING_STATE, 'true');

    console.log('Location tracking started');
    return true;
  }

  async stopTracking(): Promise<void> {
    if (!this.isTracking) {
      return;
    }

    if (this.watchId !== null) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }

    if (this.backgroundInterval !== null) {
      BackgroundTimer.clearInterval(this.backgroundInterval);
      this.backgroundInterval = null;
    }

    this.isTracking = false;
    await AsyncStorage.setItem(this.STORAGE_KEYS.TRACKING_STATE, 'false');

    console.log('Location tracking stopped');
  }

  private startBackgroundTracking(): void {
    this.backgroundInterval = BackgroundTimer.setInterval(() => {
      if (!this.isTracking) return;

      Geolocation.getCurrentPosition(
        (position) => {
          const locationData: LocationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
          };

          this.handleLocationUpdate(locationData);
        },
        (error) => {
          console.warn('Background location error:', error);
        },
        {
          enableHighAccuracy: false, // Lower accuracy for background
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    }, this.config.interval);
  }

  private async handleLocationUpdate(location: LocationData): Promise<void> {
    // Check if location change is significant
    if (this.config.significantChangesOnly && this.locationBuffer.length > 0) {
      const lastLocation = this.locationBuffer[this.locationBuffer.length - 1];
      const distance = this.calculateDistance(
        lastLocation.latitude,
        lastLocation.longitude,
        location.latitude,
        location.longitude
      );

      if (distance < this.config.distanceFilter) {
        return; // Skip insignificant changes
      }
    }

    // Add to buffer
    this.locationBuffer.push(location);

    // Keep buffer size manageable
    if (this.locationBuffer.length > 100) {
      this.locationBuffer = this.locationBuffer.slice(-50);
    }

    // Save to storage
    await this.saveLocationBuffer();

    // Notify callback
    this.onLocationUpdate?.(location);

    // Auto-sync if buffer is large
    if (this.locationBuffer.length >= 10) {
      await this.syncLocationData();
    }
  }

  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  private async saveLocationBuffer(): Promise<void> {
    try {
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.LOCATION_BUFFER,
        JSON.stringify(this.locationBuffer)
      );
    } catch (error) {
      console.error('Failed to save location buffer:', error);
    }
  }

  private async loadLocationBuffer(): Promise<void> {
    try {
      const saved = await AsyncStorage.getItem(this.STORAGE_KEYS.LOCATION_BUFFER);
      if (saved) {
        this.locationBuffer = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Failed to load location buffer:', error);
      this.locationBuffer = [];
    }
  }

  async syncLocationData(): Promise<void> {
    if (this.locationBuffer.length === 0) {
      return;
    }

    try {
      // TODO: Send location data to backend for spark detection
      console.log(`Syncing ${this.locationBuffer.length} location points`);
      
      // Mock API call
      // await apiService.post('/location/batch', {
      //   locations: this.locationBuffer
      // });

      // Clear buffer after successful sync
      this.locationBuffer = [];
      await this.saveLocationBuffer();
      await AsyncStorage.setItem(
        this.STORAGE_KEYS.LAST_SYNC,
        Date.now().toString()
      );

      console.log('Location data synced successfully');
    } catch (error) {
      console.error('Failed to sync location data:', error);
      // Keep data in buffer for retry
    }
  }

  async getLocationHistory(limit = 50): Promise<LocationData[]> {
    await this.loadLocationBuffer();
    return this.locationBuffer.slice(-limit);
  }

  async getCurrentLocation(): Promise<LocationData | null> {
    return new Promise((resolve) => {
      Geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
            speed: position.coords.speed || undefined,
            heading: position.coords.heading || undefined,
          });
        },
        (error) => {
          console.error('Failed to get current location:', error);
          resolve(null);
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 10000,
        }
      );
    });
  }

  updateConfig(newConfig: Partial<LocationTrackerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getConfig(): LocationTrackerConfig {
    return { ...this.config };
  }

  isCurrentlyTracking(): boolean {
    return this.isTracking;
  }

  async getLastSyncTime(): Promise<number | null> {
    try {
      const lastSync = await AsyncStorage.getItem(this.STORAGE_KEYS.LAST_SYNC);
      return lastSync ? parseInt(lastSync, 10) : null;
    } catch (error) {
      return null;
    }
  }

  private openSettings(): void {
    // Platform-specific settings opening would go here
    console.log('Opening device settings...');
  }

  async initialize(): Promise<void> {
    await this.loadLocationBuffer();
    
    // Check if tracking was enabled before app restart
    try {
      const wasTracking = await AsyncStorage.getItem(this.STORAGE_KEYS.TRACKING_STATE);
      if (wasTracking === 'true') {
        console.log('Resuming location tracking after app restart');
        await this.startTracking();
      }
    } catch (error) {
      console.error('Failed to check previous tracking state:', error);
    }
  }
}

export const locationTrackerService = new LocationTrackerService();