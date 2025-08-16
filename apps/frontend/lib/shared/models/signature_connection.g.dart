// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'signature_connection.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SignatureConnectionPreferencesImpl
_$$SignatureConnectionPreferencesImplFromJson(Map<String, dynamic> json) =>
    _$SignatureConnectionPreferencesImpl(
      connectionTypes: (json['connectionTypes'] as List<dynamic>?)
          ?.map((e) => $enumDecode(_$ConnectionTypeEnumMap, e))
          .toList(),
      creativeInterests: (json['creativeInterests'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      professionalSkills: (json['professionalSkills'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      musicGenres: (json['musicGenres'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      favoriteArtists: (json['favoriteArtists'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      entertainmentGenres: (json['entertainmentGenres'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      readingPreferences: (json['readingPreferences'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      sportsActivities: (json['sportsActivities'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      foodPreferences: (json['foodPreferences'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      travelPreferences: (json['travelPreferences'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      techInterests: (json['techInterests'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      learningGoals: (json['learningGoals'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      availabilityLevel: $enumDecodeNullable(
        _$AvailabilityLevelEnumMap,
        json['availabilityLevel'],
      ),
      meetingPreference: $enumDecodeNullable(
        _$MeetingPreferenceEnumMap,
        json['meetingPreference'],
      ),
      ageRangeMin: (json['ageRangeMin'] as num?)?.toInt(),
      ageRangeMax: (json['ageRangeMax'] as num?)?.toInt(),
      maxDistance: (json['maxDistance'] as num?)?.toDouble(),
      connectionBio: json['connectionBio'] as String?,
      movie: json['movie'] as String?,
      artist: json['artist'] as String?,
      mbti: json['mbti'] as String?,
      interests: (json['interests'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      memorablePlace: json['memorablePlace'] as String?,
      childhoodMemory: json['childhoodMemory'] as String?,
      turningPoint: json['turningPoint'] as String?,
      proudestMoment: json['proudestMoment'] as String?,
      bucketList: json['bucketList'] as String?,
      lifeLesson: json['lifeLesson'] as String?,
      lifeMovie: json['lifeMovie'] as String?,
      favoriteArtist: json['favoriteArtist'] as String?,
      showMovie: json['showMovie'] as bool?,
      showArtist: json['showArtist'] as bool?,
      showMbti: json['showMbti'] as bool?,
    );

Map<String, dynamic> _$$SignatureConnectionPreferencesImplToJson(
  _$SignatureConnectionPreferencesImpl instance,
) => <String, dynamic>{
  'connectionTypes': instance.connectionTypes
      ?.map((e) => _$ConnectionTypeEnumMap[e]!)
      .toList(),
  'creativeInterests': instance.creativeInterests,
  'professionalSkills': instance.professionalSkills,
  'musicGenres': instance.musicGenres,
  'favoriteArtists': instance.favoriteArtists,
  'entertainmentGenres': instance.entertainmentGenres,
  'readingPreferences': instance.readingPreferences,
  'sportsActivities': instance.sportsActivities,
  'foodPreferences': instance.foodPreferences,
  'travelPreferences': instance.travelPreferences,
  'techInterests': instance.techInterests,
  'learningGoals': instance.learningGoals,
  'availabilityLevel': _$AvailabilityLevelEnumMap[instance.availabilityLevel],
  'meetingPreference': _$MeetingPreferenceEnumMap[instance.meetingPreference],
  'ageRangeMin': instance.ageRangeMin,
  'ageRangeMax': instance.ageRangeMax,
  'maxDistance': instance.maxDistance,
  'connectionBio': instance.connectionBio,
  'movie': instance.movie,
  'artist': instance.artist,
  'mbti': instance.mbti,
  'interests': instance.interests,
  'memorablePlace': instance.memorablePlace,
  'childhoodMemory': instance.childhoodMemory,
  'turningPoint': instance.turningPoint,
  'proudestMoment': instance.proudestMoment,
  'bucketList': instance.bucketList,
  'lifeLesson': instance.lifeLesson,
  'lifeMovie': instance.lifeMovie,
  'favoriteArtist': instance.favoriteArtist,
  'showMovie': instance.showMovie,
  'showArtist': instance.showArtist,
  'showMbti': instance.showMbti,
};

const _$ConnectionTypeEnumMap = {
  ConnectionType.collaboration: 'collaboration',
  ConnectionType.networking: 'networking',
  ConnectionType.friendship: 'friendship',
  ConnectionType.mentorship: 'mentorship',
  ConnectionType.romantic: 'romantic',
};

const _$AvailabilityLevelEnumMap = {
  AvailabilityLevel.veryActive: 'very_active',
  AvailabilityLevel.active: 'active',
  AvailabilityLevel.moderate: 'moderate',
  AvailabilityLevel.occasional: 'occasional',
  AvailabilityLevel.rare: 'rare',
};

const _$MeetingPreferenceEnumMap = {
  MeetingPreference.inPerson: 'in_person',
  MeetingPreference.virtual: 'virtual',
  MeetingPreference.both: 'both',
};

_$ConnectionMatchImpl _$$ConnectionMatchImplFromJson(
  Map<String, dynamic> json,
) => _$ConnectionMatchImpl(
  userId: json['userId'] as String,
  username: json['username'] as String,
  fullName: json['fullName'] as String?,
  avatarUrl: json['avatarUrl'] as String?,
  bio: json['bio'] as String?,
  location: json['location'] as String?,
  distance: (json['distance'] as num?)?.toDouble(),
  compatibilityScore: (json['compatibilityScore'] as num).toDouble(),
  matchingConnectionTypes: (json['matchingConnectionTypes'] as List<dynamic>)
      .map((e) => $enumDecode(_$ConnectionTypeEnumMap, e))
      .toList(),
  commonInterests: (json['commonInterests'] as List<dynamic>)
      .map((e) => e as String)
      .toList(),
  commonSkills: (json['commonSkills'] as List<dynamic>)
      .map((e) => e as String)
      .toList(),
  commonMusicGenres: (json['commonMusicGenres'] as List<dynamic>)
      .map((e) => e as String)
      .toList(),
  commonEntertainment: (json['commonEntertainment'] as List<dynamic>)
      .map((e) => e as String)
      .toList(),
  lastActiveAt: json['lastActiveAt'] == null
      ? null
      : DateTime.parse(json['lastActiveAt'] as String),
  hasBeenContacted: json['hasBeenContacted'] as bool,
  mutualConnections: (json['mutualConnections'] as num).toInt(),
);

Map<String, dynamic> _$$ConnectionMatchImplToJson(
  _$ConnectionMatchImpl instance,
) => <String, dynamic>{
  'userId': instance.userId,
  'username': instance.username,
  'fullName': instance.fullName,
  'avatarUrl': instance.avatarUrl,
  'bio': instance.bio,
  'location': instance.location,
  'distance': instance.distance,
  'compatibilityScore': instance.compatibilityScore,
  'matchingConnectionTypes': instance.matchingConnectionTypes
      .map((e) => _$ConnectionTypeEnumMap[e]!)
      .toList(),
  'commonInterests': instance.commonInterests,
  'commonSkills': instance.commonSkills,
  'commonMusicGenres': instance.commonMusicGenres,
  'commonEntertainment': instance.commonEntertainment,
  'lastActiveAt': instance.lastActiveAt?.toIso8601String(),
  'hasBeenContacted': instance.hasBeenContacted,
  'mutualConnections': instance.mutualConnections,
};

_$SignatureConnectionStatsImpl _$$SignatureConnectionStatsImplFromJson(
  Map<String, dynamic> json,
) => _$SignatureConnectionStatsImpl(
  totalMatches: (json['totalMatches'] as num).toInt(),
  highCompatibilityMatches: (json['highCompatibilityMatches'] as num).toInt(),
  mediumCompatibilityMatches: (json['mediumCompatibilityMatches'] as num)
      .toInt(),
  lowCompatibilityMatches: (json['lowCompatibilityMatches'] as num).toInt(),
  averageCompatibilityScore: (json['averageCompatibilityScore'] as num)
      .toDouble(),
  topSharedInterest: json['topSharedInterest'] as String?,
  topConnectionType: $enumDecodeNullable(
    _$ConnectionTypeEnumMap,
    json['topConnectionType'],
  ),
  profileCompletionImpact: ProfileCompletionImpact.fromJson(
    json['profileCompletionImpact'] as Map<String, dynamic>,
  ),
);

Map<String, dynamic> _$$SignatureConnectionStatsImplToJson(
  _$SignatureConnectionStatsImpl instance,
) => <String, dynamic>{
  'totalMatches': instance.totalMatches,
  'highCompatibilityMatches': instance.highCompatibilityMatches,
  'mediumCompatibilityMatches': instance.mediumCompatibilityMatches,
  'lowCompatibilityMatches': instance.lowCompatibilityMatches,
  'averageCompatibilityScore': instance.averageCompatibilityScore,
  'topSharedInterest': instance.topSharedInterest,
  'topConnectionType': _$ConnectionTypeEnumMap[instance.topConnectionType],
  'profileCompletionImpact': instance.profileCompletionImpact,
};

_$ProfileCompletionImpactImpl _$$ProfileCompletionImpactImplFromJson(
  Map<String, dynamic> json,
) => _$ProfileCompletionImpactImpl(
  currentCompletion: (json['currentCompletion'] as num).toDouble(),
  potentialIncrease: (json['potentialIncrease'] as num).toDouble(),
  missingFields: (json['missingFields'] as List<dynamic>)
      .map((e) => e as String)
      .toList(),
);

Map<String, dynamic> _$$ProfileCompletionImpactImplToJson(
  _$ProfileCompletionImpactImpl instance,
) => <String, dynamic>{
  'currentCompletion': instance.currentCompletion,
  'potentialIncrease': instance.potentialIncrease,
  'missingFields': instance.missingFields,
};
