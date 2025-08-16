import 'package:freezed_annotation/freezed_annotation.dart';

part 'signature_connection.freezed.dart';
part 'signature_connection.g.dart';

// Enums
enum ConnectionType {
  @JsonValue('collaboration')
  collaboration,
  @JsonValue('networking')
  networking,
  @JsonValue('friendship')
  friendship,
  @JsonValue('mentorship')
  mentorship,
  @JsonValue('romantic')
  romantic,
}

enum AvailabilityLevel {
  @JsonValue('very_active')
  veryActive,
  @JsonValue('active')
  active,
  @JsonValue('moderate')
  moderate,
  @JsonValue('occasional')
  occasional,
  @JsonValue('rare')
  rare,
}

enum MeetingPreference {
  @JsonValue('in_person')
  inPerson,
  @JsonValue('virtual')
  virtual,
  @JsonValue('both')
  both,
}

@freezed
class SignatureConnectionPreferences with _$SignatureConnectionPreferences {
  const factory SignatureConnectionPreferences({
    // 백엔드 호환 필드
    List<ConnectionType>? connectionTypes,
    List<String>? creativeInterests,
    List<String>? professionalSkills,
    List<String>? musicGenres,
    List<String>? favoriteArtists,
    List<String>? entertainmentGenres,
    List<String>? readingPreferences,
    List<String>? sportsActivities,
    List<String>? foodPreferences,
    List<String>? travelPreferences,
    List<String>? techInterests,
    List<String>? learningGoals,
    AvailabilityLevel? availabilityLevel,
    MeetingPreference? meetingPreference,
    int? ageRangeMin,
    int? ageRangeMax,
    double? maxDistance,
    String? connectionBio,
    
    // 프론트엔드 추가 필드 (백엔드 확장 필요)
    String? movie,
    String? artist,
    String? mbti,
    List<String>? interests,
    String? memorablePlace,
    String? childhoodMemory,
    String? turningPoint,
    String? proudestMoment,
    String? bucketList,
    String? lifeLesson,
    
    // 프론트엔드 호환성 필드
    String? lifeMovie,
    String? favoriteArtist,
    bool? showMovie,
    bool? showArtist,
    bool? showMbti,
  }) = _SignatureConnectionPreferences;

  factory SignatureConnectionPreferences.fromJson(Map<String, dynamic> json) =>
      _$SignatureConnectionPreferencesFromJson(json);
}

@freezed
class ConnectionMatch with _$ConnectionMatch {
  const factory ConnectionMatch({
    required String userId,
    required String username,
    String? fullName,
    String? avatarUrl,
    String? bio,
    String? location,
    double? distance,
    required double compatibilityScore,
    required List<ConnectionType> matchingConnectionTypes,
    required List<String> commonInterests,
    required List<String> commonSkills,
    required List<String> commonMusicGenres,
    required List<String> commonEntertainment,
    DateTime? lastActiveAt,
    required bool hasBeenContacted,
    required int mutualConnections,
  }) = _ConnectionMatch;

  factory ConnectionMatch.fromJson(Map<String, dynamic> json) =>
      _$ConnectionMatchFromJson(json);
}

@freezed
class SignatureConnectionStats with _$SignatureConnectionStats {
  const factory SignatureConnectionStats({
    required int totalMatches,
    required int highCompatibilityMatches,
    required int mediumCompatibilityMatches,
    required int lowCompatibilityMatches,
    required double averageCompatibilityScore,
    String? topSharedInterest,
    ConnectionType? topConnectionType,
    required ProfileCompletionImpact profileCompletionImpact,
  }) = _SignatureConnectionStats;

  factory SignatureConnectionStats.fromJson(Map<String, dynamic> json) =>
      _$SignatureConnectionStatsFromJson(json);
}

@freezed
class ProfileCompletionImpact with _$ProfileCompletionImpact {
  const factory ProfileCompletionImpact({
    required double currentCompletion,
    required double potentialIncrease,
    required List<String> missingFields,
  }) = _ProfileCompletionImpact;

  factory ProfileCompletionImpact.fromJson(Map<String, dynamic> json) =>
      _$ProfileCompletionImpactFromJson(json);
}