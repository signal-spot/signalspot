import { Alert, Share, Platform } from 'react-native';
import ViewShot from 'react-native-view-shot';
import RNFS from 'react-native-fs';

export interface ShareContent {
  type: 'spot' | 'spark' | 'profile';
  title: string;
  description: string;
  url?: string;
  imageUri?: string;
  data: any;
}

export interface ShareOptions {
  platform?: 'instagram' | 'kakaotalk' | 'twitter' | 'general';
  includeImage?: boolean;
  customMessage?: string;
}

export interface ShareResult {
  success: boolean;
  platform?: string;
  error?: string;
}

export class ShareService {
  private static instance: ShareService;

  static getInstance(): ShareService {
    if (!ShareService.instance) {
      ShareService.instance = new ShareService();
    }
    return ShareService.instance;
  }

  /**
   * Capture a view as an image for sharing
   */
  async captureView(viewRef: any, options: {
    format?: 'png' | 'jpg';
    quality?: number;
    width?: number;
    height?: number;
  } = {}): Promise<string> {
    try {
      const {
        format = 'png',
        quality = 1.0,
        width,
        height
      } = options;

      const uri = await ViewShot.captureRef(viewRef, {
        format,
        quality,
        width,
        height,
        result: 'tmpfile',
      });

      return uri;
    } catch (error) {
      console.error('Failed to capture view:', error);
      throw new Error('이미지 생성에 실패했습니다.');
    }
  }

  /**
   * Generate optimized image for specific platform
   */
  async generatePlatformImage(
    content: ShareContent,
    platform: 'instagram' | 'kakaotalk' | 'twitter' | 'general'
  ): Promise<string> {
    const dimensions = this.getPlatformDimensions(platform);
    
    try {
      // For now, return the original image
      // In a real implementation, you would resize and optimize here
      if (content.imageUri) {
        return content.imageUri;
      }
      
      throw new Error('No image available for sharing');
    } catch (error) {
      console.error('Failed to generate platform image:', error);
      throw new Error('플랫폼 최적화 이미지 생성에 실패했습니다.');
    }
  }

  /**
   * Share content to a specific platform or show system share dialog
   */
  async shareContent(
    content: ShareContent,
    options: ShareOptions = {}
  ): Promise<ShareResult> {
    try {
      const {
        platform = 'general',
        includeImage = true,
        customMessage
      } = options;

      let imageUri: string | undefined;
      
      if (includeImage && content.imageUri) {
        imageUri = await this.generatePlatformImage(content, platform);
      }

      const shareMessage = customMessage || this.generateShareMessage(content);
      const shareUrl = content.url || this.generateDeepLink(content);

      switch (platform) {
        case 'instagram':
          return await this.shareToInstagram(shareMessage, imageUri);
        
        case 'kakaotalk':
          return await this.shareToKakaoTalk(content, shareMessage, imageUri);
        
        case 'twitter':
          return await this.shareToTwitter(shareMessage, shareUrl, imageUri);
        
        default:
          return await this.shareGeneral(shareMessage, shareUrl, imageUri);
      }
    } catch (error) {
      console.error('Share failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '공유에 실패했습니다.'
      };
    }
  }

  /**
   * Share to Instagram Stories
   */
  private async shareToInstagram(
    message: string,
    imageUri?: string
  ): Promise<ShareResult> {
    try {
      if (!imageUri) {
        throw new Error('Instagram 공유에는 이미지가 필요합니다.');
      }

      // Instagram Stories sharing would require react-native-instagram-stories
      // For now, fall back to general sharing
      return await this.shareGeneral(message, undefined, imageUri);
    } catch (error) {
      return {
        success: false,
        platform: 'instagram',
        error: error instanceof Error ? error.message : 'Instagram 공유에 실패했습니다.'
      };
    }
  }

  /**
   * Share to KakaoTalk
   */
  private async shareToKakaoTalk(
    content: ShareContent,
    message: string,
    imageUri?: string
  ): Promise<ShareResult> {
    try {
      // KakaoTalk sharing would require @react-native-kakao/share
      // For now, fall back to general sharing
      return await this.shareGeneral(message, content.url, imageUri);
    } catch (error) {
      return {
        success: false,
        platform: 'kakaotalk',
        error: error instanceof Error ? error.message : 'KakaoTalk 공유에 실패했습니다.'
      };
    }
  }

  /**
   * Share to Twitter/X
   */
  private async shareToTwitter(
    message: string,
    url?: string,
    imageUri?: string
  ): Promise<ShareResult> {
    try {
      const twitterUrl = this.generateTwitterUrl(message, url);
      
      // In a real app, you would open the Twitter app or web URL
      return await this.shareGeneral(message, url, imageUri);
    } catch (error) {
      return {
        success: false,
        platform: 'twitter',
        error: error instanceof Error ? error.message : 'Twitter 공유에 실패했습니다.'
      };
    }
  }

  /**
   * General system share
   */
  private async shareGeneral(
    message: string,
    url?: string,
    imageUri?: string
  ): Promise<ShareResult> {
    try {
      const shareOptions: any = {
        message,
      };

      if (url) {
        shareOptions.url = url;
      }

      if (imageUri && Platform.OS === 'ios') {
        shareOptions.url = imageUri;
      } else if (imageUri && Platform.OS === 'android') {
        shareOptions.type = 'image/*';
        shareOptions.url = `file://${imageUri}`;
      }

      const result = await Share.share(shareOptions);

      if (result.action === Share.sharedAction) {
        return {
          success: true,
          platform: result.activityType || 'general'
        };
      } else {
        return {
          success: false,
          error: '사용자가 공유를 취소했습니다.'
        };
      }
    } catch (error) {
      return {
        success: false,
        platform: 'general',
        error: error instanceof Error ? error.message : '공유에 실패했습니다.'
      };
    }
  }

  /**
   * Generate share message based on content type
   */
  private generateShareMessage(content: ShareContent): string {
    switch (content.type) {
      case 'spot':
        return `📍 "${content.title}" - SignalSpot에서 발견한 특별한 장소\n\n${content.description}\n\n#SignalSpot #여행 #발견`;
      
      case 'spark':
        return `✨ SignalSpot에서 새로운 Spark를 발견했어요!\n\n${content.description}\n\n#SignalSpot #Spark #만남`;
      
      case 'profile':
        return `👋 SignalSpot에서 저를 만나보세요!\n\n${content.description}\n\n#SignalSpot #프로필`;
      
      default:
        return `SignalSpot에서 공유합니다.\n\n${content.description}\n\n#SignalSpot`;
    }
  }

  /**
   * Generate deep link for content
   */
  private generateDeepLink(content: ShareContent): string {
    const baseUrl = 'https://signalspot.app';
    
    switch (content.type) {
      case 'spot':
        return `${baseUrl}/spot/${content.data.id}`;
      
      case 'spark':
        return `${baseUrl}/spark/${content.data.id}`;
      
      case 'profile':
        return `${baseUrl}/profile/${content.data.userId}`;
      
      default:
        return baseUrl;
    }
  }

  /**
   * Generate Twitter sharing URL
   */
  private generateTwitterUrl(message: string, url?: string): string {
    const baseUrl = 'https://twitter.com/intent/tweet';
    const params = new URLSearchParams();
    
    params.append('text', message);
    if (url) {
      params.append('url', url);
    }
    
    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Get optimal dimensions for each platform
   */
  private getPlatformDimensions(platform: string): { width: number; height: number } {
    switch (platform) {
      case 'instagram':
        return { width: 1080, height: 1920 }; // Stories format
      
      case 'twitter':
        return { width: 1200, height: 675 }; // Twitter card format
      
      case 'kakaotalk':
        return { width: 800, height: 600 }; // KakaoTalk optimal
      
      default:
        return { width: 1200, height: 630 }; // Open Graph standard
    }
  }

  /**
   * Clean up temporary files
   */
  async cleanupTempFiles(imageUri: string): Promise<void> {
    try {
      if (imageUri.startsWith('file://')) {
        const path = imageUri.replace('file://', '');
        const exists = await RNFS.exists(path);
        if (exists) {
          await RNFS.unlink(path);
        }
      }
    } catch (error) {
      console.warn('Failed to cleanup temp file:', error);
    }
  }

  /**
   * Track sharing event for analytics
   */
  trackShare(content: ShareContent, platform: string, success: boolean): void {
    // Analytics tracking would be implemented here
    console.log('Share tracked:', {
      contentType: content.type,
      contentId: content.data.id,
      platform,
      success,
      timestamp: new Date().toISOString()
    });
  }
}

export default ShareService;