import 'package:freezed_annotation/freezed_annotation.dart';

part 'signal_spot.freezed.dart';
part 'signal_spot.g.dart';

@freezed
class SignalSpot with _$SignalSpot {
  const SignalSpot._();
  
  const factory SignalSpot({
    required String id,
    String? userId,
    String? creatorId,  // 백엔드가 creatorId를 사용하는 경우
    String? creatorUsername,  // 백엔드에서 제공하는 닉네임
    String? creatorAvatar,  // 백엔드에서 제공하는 아바타 URL
    String? content,    // 이전 버전 호환성
    String? message,    // 새 버전에서 사용
    required double latitude,
    required double longitude,
    required DateTime createdAt,
    DateTime? expiresAt,
    @Default(0) int interactionCount,
    @Default(0) int viewCount,
    @Default('active') String status,
    List<String>? mediaUrls,
    List<String>? tags,
    String? title,
    @Default(false) bool isPinned,
    @Default(false) bool isReported,
    Map<String, dynamic>? metadata,
    Map<String, dynamic>? location,  // location 객체
    Map<String, dynamic>? engagement,  // engagement 통계
    Map<String, dynamic>? timing,      // timing 정보
  }) = _SignalSpot;

  factory SignalSpot.fromJson(Map<String, dynamic> json) {
    // 원본 JSON 데이터 디버깅
    print('=== SignalSpot.fromJson raw data ===');
    print('Full JSON: $json');
    print('creatorUsername field: ${json['creatorUsername']}');
    print('engagement field: ${json['engagement']}');
    print('engagement.likeCount: ${json['engagement']?['likeCount']}');
    print('===================================');
    
    // location 객체에서 좌표 추출
    double? lat = json['latitude'];
    double? lng = json['longitude'];
    
    if (json['location'] != null) {
      lat = json['location']['latitude']?.toDouble();
      lng = json['location']['longitude']?.toDouble();
    }
    
    // content 또는 message 처리
    final content = json['content'] ?? json['message'];
    
    // userId 또는 creatorId 처리
    final userId = json['userId'] ?? json['creatorId'];
    
    // createdAt 처리
    DateTime? createdAt;
    if (json['createdAt'] != null) {
      createdAt = DateTime.parse(json['createdAt']);
    } else if (json['timing']?['createdAt'] != null) {
      createdAt = DateTime.parse(json['timing']['createdAt']);
    }
    
    // expiresAt 처리
    DateTime? expiresAt;
    if (json['expiresAt'] != null) {
      expiresAt = DateTime.parse(json['expiresAt']);
    } else if (json['timing']?['expiresAt'] != null) {
      expiresAt = DateTime.parse(json['timing']['expiresAt']);
    }
    
    return SignalSpot(
      id: json['id'] as String,
      userId: userId,
      creatorId: json['creatorId'],
      creatorUsername: json['creatorUsername'],
      creatorAvatar: json['creatorAvatar'],
      content: content,
      message: json['message'],
      latitude: lat ?? 0.0,
      longitude: lng ?? 0.0,
      createdAt: createdAt ?? DateTime.now(),
      expiresAt: expiresAt,
      interactionCount: json['interactionCount'] ?? json['engagement']?['engagementScore'] ?? 0,
      viewCount: json['viewCount'] ?? json['engagement']?['viewCount'] ?? 0,
      status: json['status'] ?? 'active',
      mediaUrls: json['mediaUrls'] != null ? List<String>.from(json['mediaUrls']) : null,
      tags: json['tags'] != null ? List<String>.from(json['tags']) : null,
      title: json['title'],
      isPinned: json['isPinned'] ?? false,
      isReported: json['isReported'] ?? false,
      metadata: json['metadata'],
      location: json['location'],
      engagement: json['engagement'],
      timing: json['timing'],
    );
  }
  
  // content getter for backward compatibility
  String get displayContent => content ?? message ?? '';
  String get displayUserId => userId ?? creatorId ?? '';
  
  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'creatorId': creatorId,
      'creatorUsername': creatorUsername,
      'creatorAvatar': creatorAvatar,
      'content': content,
      'message': message,
      'latitude': latitude,
      'longitude': longitude,
      'createdAt': createdAt.toIso8601String(),
      'expiresAt': expiresAt?.toIso8601String(),
      'interactionCount': interactionCount,
      'viewCount': viewCount,
      'status': status,
      'mediaUrls': mediaUrls,
      'tags': tags,
      'title': title,
      'isPinned': isPinned,
      'isReported': isReported,
      'metadata': metadata,
      'location': location,
      'engagement': engagement,
      'timing': timing,
    };
  }
}

@freezed
class SignalSpotListResponse with _$SignalSpotListResponse {
  const factory SignalSpotListResponse({
    required List<SignalSpot> data,
    required int count,
    required bool success,
    required String message,
  }) = _SignalSpotListResponse;

  factory SignalSpotListResponse.fromJson(Map<String, dynamic> json) => 
      _$SignalSpotListResponseFromJson(json);
}

@freezed
class CreateSignalSpotRequest with _$CreateSignalSpotRequest {
  const factory CreateSignalSpotRequest({
    required String content,
    required double latitude,
    required double longitude,
    String? title,
    List<String>? mediaUrls,
    List<String>? tags,
    int? durationHours,
  }) = _CreateSignalSpotRequest;

  factory CreateSignalSpotRequest.fromJson(Map<String, dynamic> json) => 
      _$CreateSignalSpotRequestFromJson(json);
}

@freezed
class SignalSpotInteraction with _$SignalSpotInteraction {
  const factory SignalSpotInteraction({
    required String type, // 'like', 'view', 'share', 'report'
    @JsonKey(includeIfNull: false) String? message,
  }) = _SignalSpotInteraction;

  factory SignalSpotInteraction.fromJson(Map<String, dynamic> json) => 
      _$SignalSpotInteractionFromJson(json);
}