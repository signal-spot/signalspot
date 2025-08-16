import 'package:freezed_annotation/freezed_annotation.dart';

part 'spark.freezed.dart';
part 'spark.g.dart';

enum SparkStatus {
  @JsonValue('pending')
  pending,
  @JsonValue('accepted')
  accepted,
  @JsonValue('rejected')
  rejected,
  @JsonValue('expired')
  expired,
  @JsonValue('matched')
  matched,
}

enum SparkDirection {
  @JsonValue('sent')
  sent,
  @JsonValue('received')
  received,
}

enum SparkType {
  @JsonValue('automatic')
  automatic,
  @JsonValue('manual')
  manual,
  @JsonValue('proximity')
  proximity,
}

@freezed
class Spark with _$Spark {
  const factory Spark({
    required String id,
    required String user1Id,
    required String user2Id,
    required SparkStatus status,
    required DateTime createdAt,
    @Default(SparkType.automatic) SparkType type,
    String? message,
    DateTime? respondedAt,
    DateTime? expiresAt,
    // 위치 정보
    double? latitude,
    double? longitude,
    String? locationName,
    // 스파크 방향과 거리
    SparkDirection? direction,
    double? distance,
    // 추가 메타데이터
    Map<String, dynamic>? metadata,
    // 상대방 정보
    String? otherUserId,
    String? otherUserNickname,
    String? otherUserAvatar,
    // 수락 상태
    @Default(false) bool user1Accepted,
    @Default(false) bool user2Accepted,
    @Default(false) bool myAccepted,
    @Default(false) bool otherAccepted,
  }) = _Spark;

  factory Spark.fromJson(Map<String, dynamic> json) => _$SparkFromJson(json);
}

@freezed
class SparkDetail with _$SparkDetail {
  const factory SparkDetail({
    required String id,
    required String location,
    required String time,
    required String duration,
    required String distance,
    required int matchingRate,
    required List<String> commonInterests,
    required SignatureConnection signatureConnection,
    required List<String> additionalHints,
    @Default(false) bool isPremium,
    SparkUserProfile? otherUser, // 상대방 프로필 정보 추가
  }) = _SparkDetail;

  factory SparkDetail.fromJson(Map<String, dynamic> json) => _$SparkDetailFromJson(json);
}

@freezed
class SparkUserProfile with _$SparkUserProfile {
  const factory SparkUserProfile({
    required String id,
    required String nickname,
    String? avatarUrl,
    String? bio,
    String? occupation,
    String? location,
    @Default([]) List<String> interests,
    @Default([]) List<String> skills,
    @Default([]) List<String> languages,
  }) = _SparkUserProfile;

  factory SparkUserProfile.fromJson(Map<String, dynamic> json) => 
      _$SparkUserProfileFromJson(json);
}

@freezed
class SignatureConnection with _$SignatureConnection {
  const factory SignatureConnection({
    String? movie,
    String? artist,
    String? mbti,
    @Default(false) bool isMovieMatch,
    @Default(false) bool isArtistMatch,
    @Default(false) bool isMbtiMatch,
  }) = _SignatureConnection;

  factory SignatureConnection.fromJson(Map<String, dynamic> json) => 
      _$SignatureConnectionFromJson(json);
}

@freezed
class CreateSparkRequest with _$CreateSparkRequest {
  const factory CreateSparkRequest({
    required String targetUserId,
    String? message,
    String? sparkType,
    String? spotId,
    double? latitude,
    double? longitude,
  }) = _CreateSparkRequest;

  factory CreateSparkRequest.fromJson(Map<String, dynamic> json) => 
      _$CreateSparkRequestFromJson(json);
}

@freezed
class SparkResponse with _$SparkResponse {
  const factory SparkResponse({
    required bool success,
    required Spark data,
    String? message,
  }) = _SparkResponse;

  factory SparkResponse.fromJson(Map<String, dynamic> json) => 
      _$SparkResponseFromJson(json);
}

@freezed
class SparkListResponse with _$SparkListResponse {
  const factory SparkListResponse({
    required bool success,
    required List<Spark> data,
    String? message,
  }) = _SparkListResponse;

  factory SparkListResponse.fromJson(Map<String, dynamic> json) => 
      _$SparkListResponseFromJson(json);
}