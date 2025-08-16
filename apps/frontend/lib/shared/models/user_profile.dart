import 'package:freezed_annotation/freezed_annotation.dart';

part 'user_profile.freezed.dart';
part 'user_profile.g.dart';

enum ProfileVisibility {
  @JsonValue('public')
  public,
  @JsonValue('friends')
  friends,
  @JsonValue('private')
  private,
}

@freezed
class UserProfile with _$UserProfile {
  const factory UserProfile({
    required String id,
    required String userId,
    String? displayName,
    String? bio,
    String? avatarUrl,
    DateTime? birthDate,
    String? location,
    List<String>? interests,
    @Default(ProfileVisibility.public) ProfileVisibility visibility,
    SignatureConnectionPreferences? signatureConnection,
    ProfileSettings? settings,
    ProfileStats? stats,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _UserProfile;

  factory UserProfile.fromJson(Map<String, dynamic> json) => 
      _$UserProfileFromJson(json);
}

@freezed
class SignatureConnectionPreferences with _$SignatureConnectionPreferences {
  const factory SignatureConnectionPreferences({
    String? lifeMovie,
    String? favoriteArtist,
    String? mbti,
    List<String>? interests,
    String? memorablePlace,
    String? childhoodMemory,
    String? turningPoint,
    String? proudestMoment,
    String? bucketList,
    String? lifeLesson,
    @Default(true) bool showMovie,
    @Default(true) bool showArtist,
    @Default(true) bool showMbti,
  }) = _SignatureConnectionPreferences;

  factory SignatureConnectionPreferences.fromJson(Map<String, dynamic> json) => 
      _$SignatureConnectionPreferencesFromJson(json);
}

@freezed
class ProfileSettings with _$ProfileSettings {
  const factory ProfileSettings({
    @Default(true) bool allowLocationSharing,
    @Default(true) bool allowSparkNotifications,
    @Default(true) bool allowMessageNotifications,
    @Default(false) bool privateProfile,
    @Default(1000) double discoveryRadius,
  }) = _ProfileSettings;

  factory ProfileSettings.fromJson(Map<String, dynamic> json) => 
      _$ProfileSettingsFromJson(json);
}

@freezed
class ProfileStats with _$ProfileStats {
  const factory ProfileStats({
    @Default(0) int totalSparks,
    @Default(0) int totalMatches,
    @Default(0) int totalSignalSpots,
    @Default(0) int profileViews,
    DateTime? lastActive,
  }) = _ProfileStats;

  factory ProfileStats.fromJson(Map<String, dynamic> json) => 
      _$ProfileStatsFromJson(json);
}

@freezed
class UpdateProfileRequest with _$UpdateProfileRequest {
  const factory UpdateProfileRequest({
    String? displayName,
    String? bio,
    String? location,
    List<String>? interests,
    ProfileVisibility? visibility,
  }) = _UpdateProfileRequest;

  factory UpdateProfileRequest.fromJson(Map<String, dynamic> json) => 
      _$UpdateProfileRequestFromJson(json);
}

@freezed
class ProfileResponse with _$ProfileResponse {
  const factory ProfileResponse({
    required bool success,
    required UserProfile data,
    String? message,
  }) = _ProfileResponse;

  factory ProfileResponse.fromJson(Map<String, dynamic> json) => 
      _$ProfileResponseFromJson(json);
}