// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'notification.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$AppNotificationImpl _$$AppNotificationImplFromJson(
  Map<String, dynamic> json,
) => _$AppNotificationImpl(
  id: json['id'] as String,
  userId: json['userId'] as String,
  type: $enumDecode(_$NotificationTypeEnumMap, json['type']),
  title: json['title'] as String,
  body: json['body'] as String,
  data: json['data'] as Map<String, dynamic>?,
  isRead: json['isRead'] as bool? ?? false,
  createdAt: DateTime.parse(json['createdAt'] as String),
  readAt: json['readAt'] == null
      ? null
      : DateTime.parse(json['readAt'] as String),
  imageUrl: json['imageUrl'] as String?,
  actionUrl: json['actionUrl'] as String?,
);

Map<String, dynamic> _$$AppNotificationImplToJson(
  _$AppNotificationImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'userId': instance.userId,
  'type': _$NotificationTypeEnumMap[instance.type]!,
  'title': instance.title,
  'body': instance.body,
  'data': instance.data,
  'isRead': instance.isRead,
  'createdAt': instance.createdAt.toIso8601String(),
  'readAt': instance.readAt?.toIso8601String(),
  'imageUrl': instance.imageUrl,
  'actionUrl': instance.actionUrl,
};

const _$NotificationTypeEnumMap = {
  NotificationType.sparkDetected: 'spark_detected',
  NotificationType.sparkMatched: 'spark_matched',
  NotificationType.sparkReceived: 'spark_received',
  NotificationType.sparkAccepted: 'spark_accepted',
  NotificationType.sparkRejected: 'spark_rejected',
  NotificationType.messageReceived: 'message_received',
  NotificationType.newMessage: 'new_message',
  NotificationType.signalSpotNearby: 'signal_spot_nearby',
  NotificationType.sacredSiteDiscovered: 'sacred_site_discovered',
  NotificationType.sacredSiteTierUpgraded: 'sacred_site_tier_upgraded',
  NotificationType.profileVisited: 'profile_visited',
  NotificationType.profileView: 'profile_view',
  NotificationType.systemAnnouncement: 'system_announcement',
  NotificationType.locationSharingRequest: 'location_sharing_request',
  NotificationType.friendRequest: 'friend_request',
  NotificationType.achievementUnlocked: 'achievement_unlocked',
  NotificationType.spotLiked: 'spot_liked',
  NotificationType.spotCommented: 'spot_commented',
  NotificationType.commentLiked: 'comment_liked',
  NotificationType.commentReplied: 'comment_replied',
  NotificationType.signalSpotInteraction: 'signal_spot_interaction',
  NotificationType.system: 'system',
};

_$NotificationListResponseImpl _$$NotificationListResponseImplFromJson(
  Map<String, dynamic> json,
) => _$NotificationListResponseImpl(
  notifications: (json['notifications'] as List<dynamic>)
      .map((e) => AppNotification.fromJson(e as Map<String, dynamic>))
      .toList(),
  unreadCount: (json['unreadCount'] as num).toInt(),
  totalCount: (json['totalCount'] as num).toInt(),
  hasMore: json['hasMore'] as bool,
);

Map<String, dynamic> _$$NotificationListResponseImplToJson(
  _$NotificationListResponseImpl instance,
) => <String, dynamic>{
  'notifications': instance.notifications,
  'unreadCount': instance.unreadCount,
  'totalCount': instance.totalCount,
  'hasMore': instance.hasMore,
};

_$NotificationSettingsImpl _$$NotificationSettingsImplFromJson(
  Map<String, dynamic> json,
) => _$NotificationSettingsImpl(
  pushEnabled: json['pushEnabled'] as bool? ?? true,
  sparkNotifications: json['sparkNotifications'] as bool? ?? true,
  messageNotifications: json['messageNotifications'] as bool? ?? true,
  profileViewNotifications: json['profileViewNotifications'] as bool? ?? true,
  marketingNotifications: json['marketingNotifications'] as bool? ?? false,
  fcmToken: json['fcmToken'] as String?,
);

Map<String, dynamic> _$$NotificationSettingsImplToJson(
  _$NotificationSettingsImpl instance,
) => <String, dynamic>{
  'pushEnabled': instance.pushEnabled,
  'sparkNotifications': instance.sparkNotifications,
  'messageNotifications': instance.messageNotifications,
  'profileViewNotifications': instance.profileViewNotifications,
  'marketingNotifications': instance.marketingNotifications,
  'fcmToken': instance.fcmToken,
};
