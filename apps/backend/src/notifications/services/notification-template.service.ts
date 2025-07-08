import { Injectable } from '@nestjs/common';
import { NotificationType, NotificationPriority } from '../entities/notification.entity';

export interface NotificationTemplate {
  type: NotificationType;
  titleTemplate: string;
  bodyTemplate: string;
  priority: NotificationPriority;
  imageUrl?: string;
  sound?: string;
  groupKey?: string;
  expirationHours?: number;
  deepLinkPattern?: string;
  variables: string[];
  locales: Record<string, {
    title: string;
    body: string;
  }>;
}

@Injectable()
export class NotificationTemplateService {
  private templates: Map<NotificationType, NotificationTemplate> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  private initializeTemplates(): void {
    // Spark notifications
    this.templates.set(NotificationType.SPARK_DETECTED, {
      type: NotificationType.SPARK_DETECTED,
      titleTemplate: '✨ 새로운 스파크 발견!',
      bodyTemplate: '근처에서 새로운 인연의 스파크를 발견했어요! 확인해보세요.',
      priority: NotificationPriority.HIGH,
      sound: 'spark_detected',
      groupKey: 'sparks',
      expirationHours: 24,
      deepLinkPattern: 'signalspot://sparks/{sparkId}',
      variables: ['sparkId', 'otherUserId', 'sparkType', 'strength', 'distance'],
      locales: {
        ko: {
          title: '✨ 새로운 스파크 발견!',
          body: '근처에서 새로운 인연의 스파크를 발견했어요! 확인해보세요.',
        },
        en: {
          title: '✨ New Spark Detected!',
          body: 'A new connection spark was detected nearby! Check it out.',
        },
      },
    });

    this.templates.set(NotificationType.SPARK_MATCHED, {
      type: NotificationType.SPARK_MATCHED,
      titleTemplate: '🎉 매칭 성공!',
      bodyTemplate: '{username}님과 매칭되었어요! 메시지를 보내보세요.',
      priority: NotificationPriority.HIGH,
      sound: 'match_success',
      expirationHours: 72,
      deepLinkPattern: 'signalspot://chat/{chatId}',
      variables: ['username', 'userId', 'sparkId', 'chatId'],
      locales: {
        ko: {
          title: '🎉 매칭 성공!',
          body: '{username}님과 매칭되었어요! 메시지를 보내보세요.',
        },
        en: {
          title: '🎉 Match Success!',
          body: 'You matched with {username}! Send them a message.',
        },
      },
    });

    // Message notifications
    this.templates.set(NotificationType.MESSAGE_RECEIVED, {
      type: NotificationType.MESSAGE_RECEIVED,
      titleTemplate: '💬 {senderUsername}',
      bodyTemplate: '{messageContent}',
      priority: NotificationPriority.HIGH,
      sound: 'message_received',
      groupKey: 'messages_{chatId}',
      expirationHours: 168, // 7 days
      deepLinkPattern: 'signalspot://chat/{chatId}',
      variables: ['senderUsername', 'messageContent', 'chatId', 'senderId'],
      locales: {
        ko: {
          title: '💬 {senderUsername}',
          body: '{messageContent}',
        },
        en: {
          title: '💬 {senderUsername}',
          body: '{messageContent}',
        },
      },
    });

    // Signal Spot notifications
    this.templates.set(NotificationType.SIGNAL_SPOT_NEARBY, {
      type: NotificationType.SIGNAL_SPOT_NEARBY,
      titleTemplate: '📍 근처 시그널 스팟',
      bodyTemplate: '"{spotTitle}" - {distance}m 거리에 있어요',
      priority: NotificationPriority.NORMAL,
      sound: 'spot_nearby',
      groupKey: 'nearby_spots',
      expirationHours: 6,
      deepLinkPattern: 'signalspot://spots/{spotId}',
      variables: ['spotTitle', 'spotId', 'distance'],
      locales: {
        ko: {
          title: '📍 근처 시그널 스팟',
          body: '"{spotTitle}" - {distance}m 거리에 있어요',
        },
        en: {
          title: '📍 Nearby Signal Spot',
          body: '"{spotTitle}" - {distance}m away',
        },
      },
    });

    // Sacred Site notifications
    this.templates.set(NotificationType.SACRED_SITE_DISCOVERED, {
      type: NotificationType.SACRED_SITE_DISCOVERED,
      titleTemplate: '🏛️ 새로운 성소 발견!',
      bodyTemplate: '"{siteName}" 성소가 발견되었어요! 첫 번째 방문자가 되어보세요.',
      priority: NotificationPriority.HIGH,
      sound: 'sacred_site_discovered',
      expirationHours: 48,
      deepLinkPattern: 'signalspot://sacred-sites/{siteId}',
      variables: ['siteName', 'siteId', 'tier', 'distance'],
      locales: {
        ko: {
          title: '🏛️ 새로운 성소 발견!',
          body: '"{siteName}" 성소가 발견되었어요! 첫 번째 방문자가 되어보세요.',
        },
        en: {
          title: '🏛️ New Sacred Site Discovered!',
          body: '"{siteName}" sacred site has been discovered! Be the first visitor.',
        },
      },
    });

    this.templates.set(NotificationType.SACRED_SITE_TIER_UPGRADED, {
      type: NotificationType.SACRED_SITE_TIER_UPGRADED,
      titleTemplate: '⬆️ 성소 등급 상승!',
      bodyTemplate: '"{siteName}" 성소가 {newTier} 등급으로 승격했어요! 🎉',
      priority: NotificationPriority.HIGH,
      sound: 'tier_upgrade',
      expirationHours: 72,
      deepLinkPattern: 'signalspot://sacred-sites/{siteId}',
      variables: ['siteName', 'siteId', 'oldTier', 'newTier'],
      locales: {
        ko: {
          title: '⬆️ 성소 등급 상승!',
          body: '"{siteName}" 성소가 {newTier} 등급으로 승격했어요! 🎉',
        },
        en: {
          title: '⬆️ Sacred Site Tier Upgrade!',
          body: '"{siteName}" has been upgraded to {newTier} tier! 🎉',
        },
      },
    });

    // Social notifications
    this.templates.set(NotificationType.PROFILE_VISITED, {
      type: NotificationType.PROFILE_VISITED,
      titleTemplate: '👀 프로필 방문',
      bodyTemplate: '{visitorUsername}님이 당신의 프로필을 확인했어요',
      priority: NotificationPriority.NORMAL,
      sound: 'profile_visit',
      groupKey: 'profile_visits',
      expirationHours: 24,
      deepLinkPattern: 'signalspot://profile/{visitorId}',
      variables: ['visitorUsername', 'visitorId'],
      locales: {
        ko: {
          title: '👀 프로필 방문',
          body: '{visitorUsername}님이 당신의 프로필을 확인했어요',
        },
        en: {
          title: '👀 Profile Visit',
          body: '{visitorUsername} checked out your profile',
        },
      },
    });

    this.templates.set(NotificationType.FRIEND_REQUEST, {
      type: NotificationType.FRIEND_REQUEST,
      titleTemplate: '🤝 친구 요청',
      bodyTemplate: '{requesterUsername}님이 친구 요청을 보냈어요',
      priority: NotificationPriority.NORMAL,
      sound: 'friend_request',
      groupKey: 'friend_requests',
      expirationHours: 168, // 7 days
      deepLinkPattern: 'signalspot://friends/requests',
      variables: ['requesterUsername', 'requesterId'],
      locales: {
        ko: {
          title: '🤝 친구 요청',
          body: '{requesterUsername}님이 친구 요청을 보냈어요',
        },
        en: {
          title: '🤝 Friend Request',
          body: '{requesterUsername} sent you a friend request',
        },
      },
    });

    // Achievement notifications
    this.templates.set(NotificationType.ACHIEVEMENT_UNLOCKED, {
      type: NotificationType.ACHIEVEMENT_UNLOCKED,
      titleTemplate: '🏆 업적 달성!',
      bodyTemplate: '"{achievementName}" 업적을 달성했어요! 축하해요! 🎉',
      priority: NotificationPriority.HIGH,
      sound: 'achievement_unlocked',
      expirationHours: 72,
      deepLinkPattern: 'signalspot://achievements/{achievementId}',
      variables: ['achievementName', 'achievementId', 'description', 'reward'],
      locales: {
        ko: {
          title: '🏆 업적 달성!',
          body: '"{achievementName}" 업적을 달성했어요! 축하해요! 🎉',
        },
        en: {
          title: '🏆 Achievement Unlocked!',
          body: 'You unlocked the "{achievementName}" achievement! Congratulations! 🎉',
        },
      },
    });

    // System notifications
    this.templates.set(NotificationType.SYSTEM_ANNOUNCEMENT, {
      type: NotificationType.SYSTEM_ANNOUNCEMENT,
      titleTemplate: '📢 {announcementTitle}',
      bodyTemplate: '{announcementBody}',
      priority: NotificationPriority.NORMAL,
      sound: 'system_announcement',
      expirationHours: 168, // 7 days
      variables: ['announcementTitle', 'announcementBody', 'actionUrl'],
      locales: {
        ko: {
          title: '📢 {announcementTitle}',
          body: '{announcementBody}',
        },
        en: {
          title: '📢 {announcementTitle}',
          body: '{announcementBody}',
        },
      },
    });

    this.templates.set(NotificationType.LOCATION_SHARING_REQUEST, {
      type: NotificationType.LOCATION_SHARING_REQUEST,
      titleTemplate: '📍 위치 공유 요청',
      bodyTemplate: '{requesterUsername}님이 위치 공유를 요청했어요',
      priority: NotificationPriority.NORMAL,
      sound: 'location_request',
      expirationHours: 24,
      deepLinkPattern: 'signalspot://location/sharing/requests',
      variables: ['requesterUsername', 'requesterId'],
      locales: {
        ko: {
          title: '📍 위치 공유 요청',
          body: '{requesterUsername}님이 위치 공유를 요청했어요',
        },
        en: {
          title: '📍 Location Sharing Request',
          body: '{requesterUsername} requested to share location',
        },
      },
    });
  }

  public getTemplate(type: NotificationType): NotificationTemplate | undefined {
    return this.templates.get(type);
  }

  public renderNotification(
    type: NotificationType,
    variables: Record<string, string>,
    locale: string = 'ko'
  ): { title: string; body: string } | null {
    const template = this.getTemplate(type);
    if (!template) return null;

    const localeTemplate = template.locales[locale] || template.locales['ko'];
    if (!localeTemplate) return null;

    let title = localeTemplate.title;
    let body = localeTemplate.body;

    // Replace variables in templates
    Object.entries(variables).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      title = title.replace(new RegExp(placeholder, 'g'), value);
      body = body.replace(new RegExp(placeholder, 'g'), value);
    });

    return { title, body };
  }

  public validateVariables(type: NotificationType, variables: Record<string, any>): boolean {
    const template = this.getTemplate(type);
    if (!template) return false;

    const missingVariables = template.variables.filter(
      variable => !(variable in variables) || variables[variable] === undefined || variables[variable] === null
    );

    return missingVariables.length === 0;
  }

  public getRequiredVariables(type: NotificationType): string[] {
    const template = this.getTemplate(type);
    return template?.variables || [];
  }

  public shouldExpire(type: NotificationType): boolean {
    const template = this.getTemplate(type);
    return template?.expirationHours !== undefined;
  }

  public getExpirationDate(type: NotificationType): Date | undefined {
    const template = this.getTemplate(type);
    if (!template?.expirationHours) return undefined;

    const expirationDate = new Date();
    expirationDate.setHours(expirationDate.getHours() + template.expirationHours);
    return expirationDate;
  }

  public getDeepLink(type: NotificationType, variables: Record<string, string>): string | undefined {
    const template = this.getTemplate(type);
    if (!template?.deepLinkPattern) return undefined;

    let deepLink = template.deepLinkPattern;
    Object.entries(variables).forEach(([key, value]) => {
      deepLink = deepLink.replace(`{${key}}`, value);
    });

    return deepLink;
  }

  public getGroupKey(type: NotificationType, variables: Record<string, string> = {}): string | undefined {
    const template = this.getTemplate(type);
    if (!template?.groupKey) return undefined;

    let groupKey = template.groupKey;
    Object.entries(variables).forEach(([key, value]) => {
      groupKey = groupKey.replace(`{${key}}`, value);
    });

    return groupKey;
  }

  public getAllTemplates(): NotificationTemplate[] {
    return Array.from(this.templates.values());
  }

  public addCustomTemplate(template: NotificationTemplate): void {
    this.templates.set(template.type, template);
  }

  public updateTemplate(type: NotificationType, updates: Partial<NotificationTemplate>): boolean {
    const existingTemplate = this.templates.get(type);
    if (!existingTemplate) return false;

    const updatedTemplate = { ...existingTemplate, ...updates };
    this.templates.set(type, updatedTemplate);
    return true;
  }

  public removeTemplate(type: NotificationType): boolean {
    return this.templates.delete(type);
  }

  public getTemplatesByPriority(priority: NotificationPriority): NotificationTemplate[] {
    return Array.from(this.templates.values()).filter(
      template => template.priority === priority
    );
  }

  public getTemplatesWithGrouping(): NotificationTemplate[] {
    return Array.from(this.templates.values()).filter(
      template => template.groupKey !== undefined
    );
  }

  public truncateMessage(message: string, maxLength: number = 50): string {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength - 3) + '...';
  }

  public shouldGroupNotifications(type: NotificationType): boolean {
    const template = this.getTemplate(type);
    return template?.groupKey !== undefined;
  }
}