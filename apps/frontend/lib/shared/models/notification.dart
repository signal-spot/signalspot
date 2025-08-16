import 'package:freezed_annotation/freezed_annotation.dart';

part 'notification.freezed.dart';
part 'notification.g.dart';

enum NotificationType {
  @JsonValue('spark_detected')
  sparkDetected,
  @JsonValue('spark_matched')
  sparkMatched,
  @JsonValue('spark_received')
  sparkReceived,
  @JsonValue('spark_accepted')
  sparkAccepted,
  @JsonValue('spark_rejected')
  sparkRejected,
  @JsonValue('message_received')
  messageReceived,
  @JsonValue('new_message')
  newMessage,
  @JsonValue('signal_spot_nearby')
  signalSpotNearby,
  @JsonValue('sacred_site_discovered')
  sacredSiteDiscovered,
  @JsonValue('sacred_site_tier_upgraded')
  sacredSiteTierUpgraded,
  @JsonValue('profile_visited')
  profileVisited,
  @JsonValue('profile_view')
  profileView,
  @JsonValue('system_announcement')
  systemAnnouncement,
  @JsonValue('location_sharing_request')
  locationSharingRequest,
  @JsonValue('friend_request')
  friendRequest,
  @JsonValue('achievement_unlocked')
  achievementUnlocked,
  @JsonValue('spot_liked')
  spotLiked,
  @JsonValue('spot_commented')
  spotCommented,
  @JsonValue('comment_liked')
  commentLiked,
  @JsonValue('comment_replied')
  commentReplied,
  @JsonValue('signal_spot_interaction')
  signalSpotInteraction,
  @JsonValue('system')
  system,
}

@freezed
class AppNotification with _$AppNotification {
  const factory AppNotification({
    required String id,
    required String userId,
    required NotificationType type,
    required String title,
    required String body,
    Map<String, dynamic>? data,
    @Default(false) bool isRead,
    required DateTime createdAt,
    DateTime? readAt,
    String? imageUrl,
    String? actionUrl,
  }) = _AppNotification;

  factory AppNotification.fromJson(Map<String, dynamic> json) => 
      _$AppNotificationFromJson(_transformJson(json));
      
  // JSON 변환 헬퍼 메서드
  static Map<String, dynamic> _transformJson(Map<String, dynamic> json) {
    final modifiedJson = Map<String, dynamic>.from(json);
    
    // 백엔드의 status 필드를 isRead로 변환
    if (json['status'] != null) {
      modifiedJson['isRead'] = json['status'] == 'read';
    }
    
    // user 또는 user_id를 userId로 변환
    if (json['user'] != null) {
      modifiedJson['userId'] = json['user'];
    } else if (json['user_id'] != null) {
      modifiedJson['userId'] = json['user_id'];
    }
    
    return modifiedJson;
  }
}

@freezed
class NotificationListResponse with _$NotificationListResponse {
  const factory NotificationListResponse({
    required List<AppNotification> notifications,
    required int unreadCount,
    required int totalCount,
    required bool hasMore,
  }) = _NotificationListResponse;

  factory NotificationListResponse.fromJson(Map<String, dynamic> json) => 
      _$NotificationListResponseFromJson(json);
}

@freezed
class NotificationSettings with _$NotificationSettings {
  const factory NotificationSettings({
    @Default(true) bool pushEnabled,
    @Default(true) bool sparkNotifications,
    @Default(true) bool messageNotifications,
    @Default(true) bool profileViewNotifications,
    @Default(false) bool marketingNotifications,
    String? fcmToken,
  }) = _NotificationSettings;

  factory NotificationSettings.fromJson(Map<String, dynamic> json) => 
      _$NotificationSettingsFromJson(json);
}