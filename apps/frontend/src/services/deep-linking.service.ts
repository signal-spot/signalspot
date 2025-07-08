import { Linking, Alert } from 'react-native';
import { NotificationType } from './notification.service';

export interface DeepLinkData {
  screen: string;
  params?: Record<string, string>;
  action?: string;
}

export type DeepLinkHandler = (data: DeepLinkData) => void;

class DeepLinkingService {
  private handlers: Map<string, DeepLinkHandler> = new Map();
  private isInitialized = false;
  private pendingURL: string | null = null;

  /**
   * Initialize deep linking service
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    try {
      // Listen for incoming URLs
      Linking.addEventListener('url', this.handleURL);

      // Check if app was opened with a URL
      const initialURL = await Linking.getInitialURL();
      if (initialURL) {
        this.pendingURL = initialURL;
      }

      this.isInitialized = true;
      console.log('Deep linking service initialized');
    } catch (error) {
      console.error('Failed to initialize deep linking:', error);
    }
  }

  /**
   * Handle incoming URL
   */
  private handleURL = ({ url }: { url: string }) => {
    this.processURL(url);
  };

  /**
   * Process and route URL
   */
  private processURL(url: string): void {
    try {
      const parsed = this.parseURL(url);
      if (!parsed) {
        console.warn('Unable to parse deep link URL:', url);
        return;
      }

      this.routeToScreen(parsed);
    } catch (error) {
      console.error('Error processing deep link:', error);
    }
  }

  /**
   * Parse URL into components
   */
  private parseURL(url: string): DeepLinkData | null {
    try {
      const urlObj = new URL(url);
      
      // Handle signalspot:// scheme
      if (urlObj.protocol === 'signalspot:') {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        const screen = pathParts[0];
        const params: Record<string, string> = {};

        // Extract path parameters
        if (pathParts.length > 1) {
          params.id = pathParts[1];
        }

        // Extract query parameters
        urlObj.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        return {
          screen,
          params,
          action: urlObj.searchParams.get('action') || undefined,
        };
      }

      // Handle https:// scheme for universal links
      if (urlObj.protocol === 'https:' && urlObj.hostname === 'signalspot.app') {
        const pathParts = urlObj.pathname.split('/').filter(Boolean);
        const screen = pathParts[0];
        const params: Record<string, string> = {};

        if (pathParts.length > 1) {
          params.id = pathParts[1];
        }

        urlObj.searchParams.forEach((value, key) => {
          params[key] = value;
        });

        return {
          screen,
          params,
          action: urlObj.searchParams.get('action') || undefined,
        };
      }

      return null;
    } catch (error) {
      console.error('Error parsing URL:', error);
      return null;
    }
  }

  /**
   * Route to appropriate screen
   */
  private routeToScreen(data: DeepLinkData): void {
    const handler = this.handlers.get(data.screen);
    if (handler) {
      handler(data);
    } else {
      // Fallback to main screen
      const mainHandler = this.handlers.get('main');
      if (mainHandler) {
        mainHandler({ screen: 'main' });
      } else {
        console.warn('No handler found for screen:', data.screen);
      }
    }
  }

  /**
   * Register screen handler
   */
  registerHandler(screen: string, handler: DeepLinkHandler): void {
    this.handlers.set(screen, handler);
  }

  /**
   * Unregister screen handler
   */
  unregisterHandler(screen: string): void {
    this.handlers.delete(screen);
  }

  /**
   * Process pending URL (call after navigation is ready)
   */
  processPendingURL(): void {
    if (this.pendingURL) {
      this.processURL(this.pendingURL);
      this.pendingURL = null;
    }
  }

  /**
   * Generate deep link URL
   */
  generateURL(screen: string, params?: Record<string, string>, action?: string): string {
    let url = `signalspot://${screen}`;
    
    if (params?.id) {
      url += `/${params.id}`;
    }

    const searchParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (key !== 'id') {
          searchParams.append(key, value);
        }
      });
    }

    if (action) {
      searchParams.append('action', action);
    }

    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }

    return url;
  }

  /**
   * Open external URL
   */
  async openURL(url: string): Promise<boolean> {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        Alert.alert('오류', '링크를 열 수 없습니다.');
        return false;
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert('오류', '링크를 여는 중 오류가 발생했습니다.');
      return false;
    }
  }

  /**
   * Open app settings
   */
  async openSettings(): Promise<void> {
    await Linking.openSettings();
  }

  /**
   * Create notification deep link handlers
   */
  setupNotificationHandlers(navigationHandlers: {
    navigateToSpark: (sparkId: string) => void;
    navigateToChat: (chatId: string) => void;
    navigateToSpot: (spotId: string) => void;
    navigateToSacredSite: (siteId: string) => void;
    navigateToProfile: (userId: string) => void;
    navigateToFriends: () => void;
    navigateToAchievements: (achievementId?: string) => void;
    navigateToLocationSharing: () => void;
    navigateToMain: () => void;
  }): void {
    // Sparks
    this.registerHandler('sparks', (data) => {
      if (data.params?.id) {
        navigationHandlers.navigateToSpark(data.params.id);
      }
    });

    // Chat
    this.registerHandler('chat', (data) => {
      if (data.params?.id) {
        navigationHandlers.navigateToChat(data.params.id);
      }
    });

    // Signal Spots
    this.registerHandler('spots', (data) => {
      if (data.params?.id) {
        navigationHandlers.navigateToSpot(data.params.id);
      }
    });

    // Sacred Sites
    this.registerHandler('sacred-sites', (data) => {
      if (data.params?.id) {
        navigationHandlers.navigateToSacredSite(data.params.id);
      }
    });

    // Profile
    this.registerHandler('profile', (data) => {
      if (data.params?.id) {
        navigationHandlers.navigateToProfile(data.params.id);
      }
    });

    // Friends
    this.registerHandler('friends', (data) => {
      navigationHandlers.navigateToFriends();
    });

    // Achievements
    this.registerHandler('achievements', (data) => {
      navigationHandlers.navigateToAchievements(data.params?.id);
    });

    // Location sharing
    this.registerHandler('location', (data) => {
      if (data.params?.sharing === 'requests') {
        navigationHandlers.navigateToLocationSharing();
      }
    });

    // Main/fallback
    this.registerHandler('main', () => {
      navigationHandlers.navigateToMain();
    });
  }

  /**
   * Generate notification deep links
   */
  getNotificationDeepLink(type: NotificationType, data?: Record<string, string>): string {
    switch (type) {
      case NotificationType.SPARK_DETECTED:
      case NotificationType.SPARK_MATCHED:
        return this.generateURL('sparks', { id: data?.sparkId || '' });

      case NotificationType.MESSAGE_RECEIVED:
        return this.generateURL('chat', { id: data?.chatId || '' });

      case NotificationType.SIGNAL_SPOT_NEARBY:
        return this.generateURL('spots', { id: data?.spotId || '' });

      case NotificationType.SACRED_SITE_DISCOVERED:
      case NotificationType.SACRED_SITE_TIER_UPGRADED:
        return this.generateURL('sacred-sites', { id: data?.siteId || '' });

      case NotificationType.PROFILE_VISITED:
        return this.generateURL('profile', { id: data?.visitorId || '' });

      case NotificationType.FRIEND_REQUEST:
        return this.generateURL('friends', { requests: 'true' });

      case NotificationType.ACHIEVEMENT_UNLOCKED:
        return this.generateURL('achievements', { id: data?.achievementId || '' });

      case NotificationType.LOCATION_SHARING_REQUEST:
        return this.generateURL('location', { sharing: 'requests' });

      default:
        return this.generateURL('main');
    }
  }

  /**
   * Share content with deep link
   */
  async shareContent(type: string, id: string, title?: string): Promise<void> {
    const url = this.generateURL(type, { id });
    const shareUrl = `https://signalspot.app/${type}/${id}`;
    
    try {
      // Use React Native Share or Linking to share
      // For now, just copy to clipboard or open sharing intent
      await this.openURL(`https://www.apple.com/ios/ios-share-sheet/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title || 'SignalSpot')}`);
    } catch (error) {
      console.error('Error sharing content:', error);
    }
  }

  /**
   * Validate deep link format
   */
  isValidDeepLink(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.protocol === 'signalspot:' ||
        (urlObj.protocol === 'https:' && urlObj.hostname === 'signalspot.app')
      );
    } catch {
      return false;
    }
  }

  /**
   * Get all registered screens
   */
  getRegisteredScreens(): string[] {
    return Array.from(this.handlers.keys());
  }

  /**
   * Clear all handlers
   */
  clearHandlers(): void {
    this.handlers.clear();
  }

  /**
   * Cleanup
   */
  cleanup(): void {
    if (this.isInitialized) {
      Linking.removeAllListeners('url');
      this.clearHandlers();
      this.isInitialized = false;
      console.log('Deep linking service cleaned up');
    }
  }
}

export const deepLinkingService = new DeepLinkingService();