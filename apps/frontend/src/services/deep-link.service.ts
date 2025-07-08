import { Linking, Alert } from 'react-native';

export interface DeepLinkData {
  type: 'spot' | 'spark' | 'profile' | 'general';
  id?: string;
  userId?: string;
  coordinates?: [number, number];
  params?: Record<string, string>;
}

export interface DeepLinkConfig {
  scheme: string;
  host: string;
  webBaseUrl: string;
}

export class DeepLinkService {
  private static instance: DeepLinkService;
  private config: DeepLinkConfig;

  constructor(config?: DeepLinkConfig) {
    this.config = config || {
      scheme: 'signalspot',
      host: 'app',
      webBaseUrl: 'https://signalspot.app',
    };
  }

  static getInstance(config?: DeepLinkConfig): DeepLinkService {
    if (!DeepLinkService.instance) {
      DeepLinkService.instance = new DeepLinkService(config);
    }
    return DeepLinkService.instance;
  }

  /**
   * Initialize deep link handling
   */
  initialize(): void {
    // Handle initial URL if app was opened from a deep link
    this.handleInitialURL();

    // Listen for incoming deep links while app is running
    const subscription = Linking.addEventListener('url', this.handleDeepLink.bind(this));

    return () => {
      subscription?.remove();
    };
  }

  /**
   * Handle the initial URL when app launches
   */
  private async handleInitialURL(): Promise<void> {
    try {
      const url = await Linking.getInitialURL();
      if (url) {
        this.handleDeepLink({ url });
      }
    } catch (error) {
      console.error('Error handling initial URL:', error);
    }
  }

  /**
   * Handle incoming deep link
   */
  private handleDeepLink(event: { url: string }): void {
    try {
      const linkData = this.parseDeepLink(event.url);
      if (linkData) {
        this.navigateToContent(linkData);
      }
    } catch (error) {
      console.error('Error handling deep link:', error);
      Alert.alert(
        '링크 오류',
        '잘못된 링크입니다. 다시 시도해주세요.',
        [{ text: '확인' }]
      );
    }
  }

  /**
   * Parse deep link URL into structured data
   */
  parseDeepLink(url: string): DeepLinkData | null {
    try {
      const urlObj = new URL(url);
      
      // Handle web URLs
      if (urlObj.protocol === 'http:' || urlObj.protocol === 'https:') {
        return this.parseWebURL(urlObj);
      }
      
      // Handle app scheme URLs
      if (urlObj.protocol === `${this.config.scheme}:`) {
        return this.parseAppURL(urlObj);
      }

      return null;
    } catch (error) {
      console.error('Error parsing deep link:', error);
      return null;
    }
  }

  /**
   * Parse web URL (signalspot.app/...)
   */
  private parseWebURL(url: URL): DeepLinkData | null {
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) {
      return { type: 'general' };
    }

    const [type, id] = pathSegments;
    const params: Record<string, string> = {};
    
    // Parse query parameters
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    switch (type) {
      case 'spot':
        return {
          type: 'spot',
          id,
          params,
        };
      
      case 'spark':
        return {
          type: 'spark',
          id,
          params,
        };
      
      case 'profile':
        return {
          type: 'profile',
          userId: id,
          params,
        };
      
      default:
        return { type: 'general', params };
    }
  }

  /**
   * Parse app scheme URL (signalspot://...)
   */
  private parseAppURL(url: URL): DeepLinkData | null {
    const pathSegments = url.pathname.split('/').filter(Boolean);
    
    if (pathSegments.length === 0) {
      return { type: 'general' };
    }

    const [type, id] = pathSegments;
    const params: Record<string, string> = {};
    
    // Parse query parameters
    url.searchParams.forEach((value, key) => {
      params[key] = value;
    });

    switch (type) {
      case 'spot':
        return {
          type: 'spot',
          id,
          params,
        };
      
      case 'spark':
        return {
          type: 'spark',
          id,
          params,
        };
      
      case 'profile':
        return {
          type: 'profile',
          userId: id,
          params,
        };
      
      default:
        return { type: 'general', params };
    }
  }

  /**
   * Navigate to content based on deep link data
   */
  private navigateToContent(linkData: DeepLinkData): void {
    // This would integrate with your navigation system
    // For now, we'll just log the navigation intent
    console.log('Deep link navigation:', linkData);

    switch (linkData.type) {
      case 'spot':
        if (linkData.id) {
          this.navigateToSpot(linkData.id, linkData.params);
        }
        break;
      
      case 'spark':
        if (linkData.id) {
          this.navigateToSpark(linkData.id, linkData.params);
        }
        break;
      
      case 'profile':
        if (linkData.userId) {
          this.navigateToProfile(linkData.userId, linkData.params);
        }
        break;
      
      default:
        this.navigateToHome();
        break;
    }
  }

  /**
   * Navigate to a specific spot
   */
  private navigateToSpot(spotId: string, params?: Record<string, string>): void {
    // Implementation would depend on your navigation library
    // Example for React Navigation:
    // NavigationService.navigate('SpotDetail', { spotId, ...params });
    console.log('Navigate to spot:', spotId, params);
  }

  /**
   * Navigate to a specific spark
   */
  private navigateToSpark(sparkId: string, params?: Record<string, string>): void {
    // Implementation would depend on your navigation library
    console.log('Navigate to spark:', sparkId, params);
  }

  /**
   * Navigate to a user profile
   */
  private navigateToProfile(userId: string, params?: Record<string, string>): void {
    // Implementation would depend on your navigation library
    console.log('Navigate to profile:', userId, params);
  }

  /**
   * Navigate to home screen
   */
  private navigateToHome(): void {
    // Implementation would depend on your navigation library
    console.log('Navigate to home');
  }

  /**
   * Generate deep link for content
   */
  generateDeepLink(data: DeepLinkData): string {
    const { type, id, userId, params = {} } = data;
    
    let path = '';
    
    switch (type) {
      case 'spot':
        path = `/spot/${id}`;
        break;
      
      case 'spark':
        path = `/spark/${id}`;
        break;
      
      case 'profile':
        path = `/profile/${userId}`;
        break;
      
      default:
        path = '/';
        break;
    }

    // Add query parameters
    const queryParams = new URLSearchParams(params);
    const queryString = queryParams.toString();
    
    return `${this.config.webBaseUrl}${path}${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Generate app scheme deep link
   */
  generateAppDeepLink(data: DeepLinkData): string {
    const { type, id, userId, params = {} } = data;
    
    let path = '';
    
    switch (type) {
      case 'spot':
        path = `/spot/${id}`;
        break;
      
      case 'spark':
        path = `/spark/${id}`;
        break;
      
      case 'profile':
        path = `/profile/${userId}`;
        break;
      
      default:
        path = '/';
        break;
    }

    // Add query parameters
    const queryParams = new URLSearchParams(params);
    const queryString = queryParams.toString();
    
    return `${this.config.scheme}://${this.config.host}${path}${queryString ? `?${queryString}` : ''}`;
  }

  /**
   * Check if the app can handle a specific URL
   */
  async canOpenURL(url: string): Promise<boolean> {
    try {
      return await Linking.canOpenURL(url);
    } catch (error) {
      console.error('Error checking URL capability:', error);
      return false;
    }
  }

  /**
   * Open a URL (external app or web browser)
   */
  async openURL(url: string): Promise<boolean> {
    try {
      const canOpen = await this.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        return true;
      } else {
        Alert.alert(
          '링크 열기 실패',
          '이 링크를 열 수 없습니다.',
          [{ text: '확인' }]
        );
        return false;
      }
    } catch (error) {
      console.error('Error opening URL:', error);
      Alert.alert(
        '오류',
        '링크를 여는 중 오류가 발생했습니다.',
        [{ text: '확인' }]
      );
      return false;
    }
  }

  /**
   * Create sharing URL with tracking parameters
   */
  createSharingURL(data: DeepLinkData, source: string = 'share'): string {
    const baseUrl = this.generateDeepLink(data);
    const url = new URL(baseUrl);
    
    // Add tracking parameters
    url.searchParams.set('utm_source', 'signalspot_app');
    url.searchParams.set('utm_medium', 'social');
    url.searchParams.set('utm_campaign', source);
    url.searchParams.set('utm_content', data.type);
    
    if (data.id) {
      url.searchParams.set('utm_term', data.id);
    }
    
    return url.toString();
  }
}

export default DeepLinkService;