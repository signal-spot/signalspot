import { Platform, Alert, Linking, PermissionsAndroid } from 'react-native';
import { check, request, PERMISSIONS, RESULTS, Permission } from 'react-native-permissions';
import AsyncStorage from '@react-native-async-storage/async-storage';

export enum PermissionType {
  CAMERA = 'camera',
  PHOTO_LIBRARY = 'photo_library', 
  LOCATION = 'location',
  LOCATION_ALWAYS = 'location_always',
  MICROPHONE = 'microphone',
  NOTIFICATIONS = 'notifications',
  CONTACTS = 'contacts',
  BLUETOOTH = 'bluetooth',
}

export enum PermissionStatus {
  GRANTED = 'granted',
  DENIED = 'denied',
  BLOCKED = 'blocked',
  LIMITED = 'limited',
  UNAVAILABLE = 'unavailable',
}

export interface PermissionResult {
  status: PermissionStatus;
  canAskAgain: boolean;
  message?: string;
}

export interface PermissionSettings {
  [PermissionType.CAMERA]: boolean;
  [PermissionType.PHOTO_LIBRARY]: boolean;
  [PermissionType.LOCATION]: boolean;
  [PermissionType.LOCATION_ALWAYS]: boolean;
  [PermissionType.MICROPHONE]: boolean;
  [PermissionType.NOTIFICATIONS]: boolean;
  [PermissionType.CONTACTS]: boolean;
  [PermissionType.BLUETOOTH]: boolean;
}

class PermissionService {
  private readonly STORAGE_KEY = '@permissions/settings';

  private permissionMap: Record<string, Permission> = {
    [PermissionType.CAMERA]: Platform.select({
      ios: PERMISSIONS.IOS.CAMERA,
      android: PERMISSIONS.ANDROID.CAMERA,
    })!,
    [PermissionType.PHOTO_LIBRARY]: Platform.select({
      ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
      android: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
    })!,
    [PermissionType.LOCATION]: Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
    })!,
    [PermissionType.LOCATION_ALWAYS]: Platform.select({
      ios: PERMISSIONS.IOS.LOCATION_ALWAYS,
      android: PERMISSIONS.ANDROID.ACCESS_BACKGROUND_LOCATION,
    })!,
    [PermissionType.MICROPHONE]: Platform.select({
      ios: PERMISSIONS.IOS.MICROPHONE,
      android: PERMISSIONS.ANDROID.RECORD_AUDIO,
    })!,
    [PermissionType.NOTIFICATIONS]: Platform.select({
      ios: PERMISSIONS.IOS.NOTIFICATION,
      android: PERMISSIONS.ANDROID.POST_NOTIFICATIONS,
    })!,
    [PermissionType.CONTACTS]: Platform.select({
      ios: PERMISSIONS.IOS.CONTACTS,
      android: PERMISSIONS.ANDROID.READ_CONTACTS,
    })!,
    [PermissionType.BLUETOOTH]: Platform.select({
      ios: PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL,
      android: PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
    })!,
  };

  private permissionMessages: Record<PermissionType, { title: string; message: string }> = {
    [PermissionType.CAMERA]: {
      title: '카메라 권한 필요',
      message: '프로필 사진 촬영을 위해 카메라 권한이 필요합니다.',
    },
    [PermissionType.PHOTO_LIBRARY]: {
      title: '사진 라이브러리 권한 필요',
      message: '프로필 사진 선택을 위해 사진 라이브러리 권한이 필요합니다.',
    },
    [PermissionType.LOCATION]: {
      title: '위치 권한 필요',
      message: '근처 스파크를 찾기 위해 위치 정보 접근 권한이 필요합니다.',
    },
    [PermissionType.LOCATION_ALWAYS]: {
      title: '백그라운드 위치 권한 필요',
      message: '백그라운드에서도 스파크를 찾기 위해 항상 위치 접근 권한이 필요합니다.',
    },
    [PermissionType.MICROPHONE]: {
      title: '마이크 권한 필요',
      message: '음성 메시지 녹음을 위해 마이크 권한이 필요합니다.',
    },
    [PermissionType.NOTIFICATIONS]: {
      title: '알림 권한 필요',
      message: '새로운 스파크와 메시지 알림을 받기 위해 알림 권한이 필요합니다.',
    },
    [PermissionType.CONTACTS]: {
      title: '연락처 권한 필요',
      message: '친구 찾기를 위해 연락처 접근 권한이 필요합니다.',
    },
    [PermissionType.BLUETOOTH]: {
      title: '블루투스 권한 필요',
      message: '근거리 연결을 위해 블루투스 권한이 필요합니다.',
    },
  };

  /**
   * Check permission status
   */
  async checkPermission(type: PermissionType): Promise<PermissionStatus> {
    try {
      const permission = this.permissionMap[type];
      if (!permission) {
        return PermissionStatus.UNAVAILABLE;
      }

      const result = await check(permission);
      return this.mapPermissionResult(result);
    } catch (error) {
      console.error(`Error checking ${type} permission:`, error);
      return PermissionStatus.UNAVAILABLE;
    }
  }

  /**
   * Request permission
   */
  async requestPermission(
    type: PermissionType,
    showRationale = true
  ): Promise<PermissionResult> {
    try {
      const permission = this.permissionMap[type];
      if (!permission) {
        return {
          status: PermissionStatus.UNAVAILABLE,
          canAskAgain: false,
          message: 'Permission not available on this platform',
        };
      }

      // Check current status first
      const currentStatus = await this.checkPermission(type);
      if (currentStatus === PermissionStatus.GRANTED) {
        return {
          status: PermissionStatus.GRANTED,
          canAskAgain: false,
        };
      }

      // Show rationale if needed
      if (showRationale && currentStatus === PermissionStatus.DENIED) {
        const shouldRequest = await this.showPermissionRationale(type);
        if (!shouldRequest) {
          return {
            status: PermissionStatus.DENIED,
            canAskAgain: true,
            message: 'User denied permission request',
          };
        }
      }

      // Request permission
      const result = await request(permission);
      const status = this.mapPermissionResult(result);

      // Handle blocked status
      if (status === PermissionStatus.BLOCKED) {
        await this.showPermissionBlockedAlert(type);
      }

      return {
        status,
        canAskAgain: status !== PermissionStatus.BLOCKED,
      };
    } catch (error) {
      console.error(`Error requesting ${type} permission:`, error);
      return {
        status: PermissionStatus.UNAVAILABLE,
        canAskAgain: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Request multiple permissions
   */
  async requestMultiplePermissions(
    types: PermissionType[],
    showRationale = true
  ): Promise<Record<PermissionType, PermissionResult>> {
    const results: Record<PermissionType, PermissionResult> = {} as any;

    for (const type of types) {
      results[type] = await this.requestPermission(type, showRationale);
    }

    return results;
  }

  /**
   * Check if permission is essential for app functionality
   */
  isEssentialPermission(type: PermissionType): boolean {
    return [
      PermissionType.LOCATION,
      PermissionType.NOTIFICATIONS,
    ].includes(type);
  }

  /**
   * Get all permission statuses
   */
  async getAllPermissionStatuses(): Promise<Record<PermissionType, PermissionStatus>> {
    const statuses: Record<PermissionType, PermissionStatus> = {} as any;

    for (const type of Object.values(PermissionType)) {
      statuses[type] = await this.checkPermission(type);
    }

    return statuses;
  }

  /**
   * Save permission settings to storage
   */
  async savePermissionSettings(settings: Partial<PermissionSettings>): Promise<void> {
    try {
      const current = await this.getPermissionSettings();
      const updated = { ...current, ...settings };
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));
    } catch (error) {
      console.error('Error saving permission settings:', error);
    }
  }

  /**
   * Get permission settings from storage
   */
  async getPermissionSettings(): Promise<PermissionSettings> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error getting permission settings:', error);
    }

    // Return default settings
    return {
      [PermissionType.CAMERA]: false,
      [PermissionType.PHOTO_LIBRARY]: false,
      [PermissionType.LOCATION]: false,
      [PermissionType.LOCATION_ALWAYS]: false,
      [PermissionType.MICROPHONE]: false,
      [PermissionType.NOTIFICATIONS]: false,
      [PermissionType.CONTACTS]: false,
      [PermissionType.BLUETOOTH]: false,
    };
  }

  /**
   * Request essential permissions for app functionality
   */
  async requestEssentialPermissions(): Promise<boolean> {
    const essentialTypes = [PermissionType.LOCATION, PermissionType.NOTIFICATIONS];
    const results = await this.requestMultiplePermissions(essentialTypes);

    // Check if all essential permissions are granted
    const allGranted = essentialTypes.every(
      type => results[type].status === PermissionStatus.GRANTED
    );

    if (!allGranted) {
      Alert.alert(
        '필수 권한 필요',
        'SignalSpot의 핵심 기능을 사용하려면 위치 및 알림 권한이 필요합니다.',
        [
          { text: '나중에', style: 'cancel' },
          { text: '설정으로 이동', onPress: () => Linking.openSettings() },
        ]
      );
    }

    return allGranted;
  }

  /**
   * Check if app has all necessary permissions
   */
  async hasNecessaryPermissions(): Promise<boolean> {
    const locationStatus = await this.checkPermission(PermissionType.LOCATION);
    const notificationStatus = await this.checkPermission(PermissionType.NOTIFICATIONS);

    return (
      locationStatus === PermissionStatus.GRANTED &&
      notificationStatus === PermissionStatus.GRANTED
    );
  }

  /**
   * Show permission rationale dialog
   */
  private async showPermissionRationale(type: PermissionType): Promise<boolean> {
    const { title, message } = this.permissionMessages[type];

    return new Promise((resolve) => {
      Alert.alert(
        title,
        message,
        [
          { text: '취소', style: 'cancel', onPress: () => resolve(false) },
          { text: '허용', onPress: () => resolve(true) },
        ]
      );
    });
  }

  /**
   * Show permission blocked alert
   */
  private async showPermissionBlockedAlert(type: PermissionType): Promise<void> {
    const { title } = this.permissionMessages[type];

    Alert.alert(
      `${title}`,
      '권한이 차단되었습니다. 설정에서 권한을 허용해주세요.',
      [
        { text: '취소', style: 'cancel' },
        { text: '설정으로 이동', onPress: () => Linking.openSettings() },
      ]
    );
  }

  /**
   * Map permission result to our enum
   */
  private mapPermissionResult(result: string): PermissionStatus {
    switch (result) {
      case RESULTS.GRANTED:
        return PermissionStatus.GRANTED;
      case RESULTS.DENIED:
        return PermissionStatus.DENIED;
      case RESULTS.BLOCKED:
        return PermissionStatus.BLOCKED;
      case RESULTS.LIMITED:
        return PermissionStatus.LIMITED;
      case RESULTS.UNAVAILABLE:
      default:
        return PermissionStatus.UNAVAILABLE;
    }
  }

  /**
   * Get permission display name
   */
  getPermissionDisplayName(type: PermissionType): string {
    const names: Record<PermissionType, string> = {
      [PermissionType.CAMERA]: '카메라',
      [PermissionType.PHOTO_LIBRARY]: '사진',
      [PermissionType.LOCATION]: '위치',
      [PermissionType.LOCATION_ALWAYS]: '백그라운드 위치',
      [PermissionType.MICROPHONE]: '마이크',
      [PermissionType.NOTIFICATIONS]: '알림',
      [PermissionType.CONTACTS]: '연락처',
      [PermissionType.BLUETOOTH]: '블루투스',
    };

    return names[type] || type;
  }

  /**
   * Get permission status color for UI
   */
  getPermissionStatusColor(status: PermissionStatus): string {
    switch (status) {
      case PermissionStatus.GRANTED:
        return '#4CAF50'; // Green
      case PermissionStatus.LIMITED:
        return '#FF9800'; // Orange
      case PermissionStatus.DENIED:
        return '#F44336'; // Red
      case PermissionStatus.BLOCKED:
        return '#9E9E9E'; // Gray
      case PermissionStatus.UNAVAILABLE:
      default:
        return '#BDBDBD'; // Light gray
    }
  }

  /**
   * Get permission status icon
   */
  getPermissionStatusIcon(status: PermissionStatus): string {
    switch (status) {
      case PermissionStatus.GRANTED:
        return '✅';
      case PermissionStatus.LIMITED:
        return '⚠️';
      case PermissionStatus.DENIED:
        return '❌';
      case PermissionStatus.BLOCKED:
        return '🚫';
      case PermissionStatus.UNAVAILABLE:
      default:
        return '❓';
    }
  }

  /**
   * Check if location permission is sufficient for features
   */
  async checkLocationPermissionForFeature(requiresAlways = false): Promise<boolean> {
    const baseStatus = await this.checkPermission(PermissionType.LOCATION);
    
    if (baseStatus !== PermissionStatus.GRANTED) {
      return false;
    }

    if (requiresAlways) {
      const alwaysStatus = await this.checkPermission(PermissionType.LOCATION_ALWAYS);
      return alwaysStatus === PermissionStatus.GRANTED;
    }

    return true;
  }

  /**
   * Request location permission with appropriate level
   */
  async requestLocationPermissionForFeature(requiresAlways = false): Promise<boolean> {
    // First request basic location permission
    const baseResult = await this.requestPermission(PermissionType.LOCATION);
    
    if (baseResult.status !== PermissionStatus.GRANTED) {
      return false;
    }

    // If always location is required, request that too
    if (requiresAlways) {
      const alwaysResult = await this.requestPermission(PermissionType.LOCATION_ALWAYS);
      return alwaysResult.status === PermissionStatus.GRANTED;
    }

    return true;
  }
}

export const permissionService = new PermissionService();