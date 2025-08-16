// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'user_profile.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$UserProfileImpl _$$UserProfileImplFromJson(Map<String, dynamic> json) =>
    _$UserProfileImpl(
      id: json['id'] as String,
      userId: json['userId'] as String,
      displayName: json['displayName'] as String?,
      bio: json['bio'] as String?,
      avatarUrl: json['avatarUrl'] as String?,
      birthDate: json['birthDate'] == null
          ? null
          : DateTime.parse(json['birthDate'] as String),
      location: json['location'] as String?,
      interests: (json['interests'] as List<dynamic>?)
          ?.map((e) => e as String)
          .toList(),
      visibility:
          $enumDecodeNullable(_$ProfileVisibilityEnumMap, json['visibility']) ??
          ProfileVisibility.public,
      signatureConnection: json['signatureConnection'] == null
          ? null
          : SignatureConnectionPreferences.fromJson(
              json['signatureConnection'] as Map<String, dynamic>,
            ),
      settings: json['settings'] == null
          ? null
          : ProfileSettings.fromJson(json['settings'] as Map<String, dynamic>),
      stats: json['stats'] == null
          ? null
          : ProfileStats.fromJson(json['stats'] as Map<String, dynamic>),
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$UserProfileImplToJson(_$UserProfileImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'displayName': instance.displayName,
      'bio': instance.bio,
      'avatarUrl': instance.avatarUrl,
      'birthDate': instance.birthDate?.toIso8601String(),
      'location': instance.location,
      'interests': instance.interests,
      'visibility': _$ProfileVisibilityEnumMap[instance.visibility]!,
      'signatureConnection': instance.signatureConnection,
      'settings': instance.settings,
      'stats': instance.stats,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

const _$ProfileVisibilityEnumMap = {
  ProfileVisibility.public: 'public',
  ProfileVisibility.friends: 'friends',
  ProfileVisibility.private: 'private',
};

_$SignatureConnectionPreferencesImpl
_$$SignatureConnectionPreferencesImplFromJson(Map<String, dynamic> json) =>
    _$SignatureConnectionPreferencesImpl(
      lifeMovie: json['lifeMovie'] as String?,
      favoriteArtist: json['favoriteArtist'] as String?,
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
      showMovie: json['showMovie'] as bool? ?? true,
      showArtist: json['showArtist'] as bool? ?? true,
      showMbti: json['showMbti'] as bool? ?? true,
    );

Map<String, dynamic> _$$SignatureConnectionPreferencesImplToJson(
  _$SignatureConnectionPreferencesImpl instance,
) => <String, dynamic>{
  'lifeMovie': instance.lifeMovie,
  'favoriteArtist': instance.favoriteArtist,
  'mbti': instance.mbti,
  'interests': instance.interests,
  'memorablePlace': instance.memorablePlace,
  'childhoodMemory': instance.childhoodMemory,
  'turningPoint': instance.turningPoint,
  'proudestMoment': instance.proudestMoment,
  'bucketList': instance.bucketList,
  'lifeLesson': instance.lifeLesson,
  'showMovie': instance.showMovie,
  'showArtist': instance.showArtist,
  'showMbti': instance.showMbti,
};

_$ProfileSettingsImpl _$$ProfileSettingsImplFromJson(
  Map<String, dynamic> json,
) => _$ProfileSettingsImpl(
  allowLocationSharing: json['allowLocationSharing'] as bool? ?? true,
  allowSparkNotifications: json['allowSparkNotifications'] as bool? ?? true,
  allowMessageNotifications: json['allowMessageNotifications'] as bool? ?? true,
  privateProfile: json['privateProfile'] as bool? ?? false,
  discoveryRadius: (json['discoveryRadius'] as num?)?.toDouble() ?? 1000,
);

Map<String, dynamic> _$$ProfileSettingsImplToJson(
  _$ProfileSettingsImpl instance,
) => <String, dynamic>{
  'allowLocationSharing': instance.allowLocationSharing,
  'allowSparkNotifications': instance.allowSparkNotifications,
  'allowMessageNotifications': instance.allowMessageNotifications,
  'privateProfile': instance.privateProfile,
  'discoveryRadius': instance.discoveryRadius,
};

_$ProfileStatsImpl _$$ProfileStatsImplFromJson(Map<String, dynamic> json) =>
    _$ProfileStatsImpl(
      totalSparks: (json['totalSparks'] as num?)?.toInt() ?? 0,
      totalMatches: (json['totalMatches'] as num?)?.toInt() ?? 0,
      totalSignalSpots: (json['totalSignalSpots'] as num?)?.toInt() ?? 0,
      profileViews: (json['profileViews'] as num?)?.toInt() ?? 0,
      lastActive: json['lastActive'] == null
          ? null
          : DateTime.parse(json['lastActive'] as String),
    );

Map<String, dynamic> _$$ProfileStatsImplToJson(_$ProfileStatsImpl instance) =>
    <String, dynamic>{
      'totalSparks': instance.totalSparks,
      'totalMatches': instance.totalMatches,
      'totalSignalSpots': instance.totalSignalSpots,
      'profileViews': instance.profileViews,
      'lastActive': instance.lastActive?.toIso8601String(),
    };

_$UpdateProfileRequestImpl _$$UpdateProfileRequestImplFromJson(
  Map<String, dynamic> json,
) => _$UpdateProfileRequestImpl(
  displayName: json['displayName'] as String?,
  bio: json['bio'] as String?,
  location: json['location'] as String?,
  interests: (json['interests'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  visibility: $enumDecodeNullable(
    _$ProfileVisibilityEnumMap,
    json['visibility'],
  ),
);

Map<String, dynamic> _$$UpdateProfileRequestImplToJson(
  _$UpdateProfileRequestImpl instance,
) => <String, dynamic>{
  'displayName': instance.displayName,
  'bio': instance.bio,
  'location': instance.location,
  'interests': instance.interests,
  'visibility': _$ProfileVisibilityEnumMap[instance.visibility],
};

_$ProfileResponseImpl _$$ProfileResponseImplFromJson(
  Map<String, dynamic> json,
) => _$ProfileResponseImpl(
  success: json['success'] as bool,
  data: UserProfile.fromJson(json['data'] as Map<String, dynamic>),
  message: json['message'] as String?,
);

Map<String, dynamic> _$$ProfileResponseImplToJson(
  _$ProfileResponseImpl instance,
) => <String, dynamic>{
  'success': instance.success,
  'data': instance.data,
  'message': instance.message,
};
