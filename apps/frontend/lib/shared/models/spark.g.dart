// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'spark.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SparkImpl _$$SparkImplFromJson(Map<String, dynamic> json) => _$SparkImpl(
  id: json['id'] as String,
  user1Id: json['user1Id'] as String,
  user2Id: json['user2Id'] as String,
  status: $enumDecode(_$SparkStatusEnumMap, json['status']),
  createdAt: DateTime.parse(json['createdAt'] as String),
  type:
      $enumDecodeNullable(_$SparkTypeEnumMap, json['type']) ??
      SparkType.automatic,
  message: json['message'] as String?,
  respondedAt: json['respondedAt'] == null
      ? null
      : DateTime.parse(json['respondedAt'] as String),
  expiresAt: json['expiresAt'] == null
      ? null
      : DateTime.parse(json['expiresAt'] as String),
  latitude: (json['latitude'] as num?)?.toDouble(),
  longitude: (json['longitude'] as num?)?.toDouble(),
  locationName: json['locationName'] as String?,
  direction: $enumDecodeNullable(_$SparkDirectionEnumMap, json['direction']),
  distance: (json['distance'] as num?)?.toDouble(),
  metadata: json['metadata'] as Map<String, dynamic>?,
  otherUserId: json['otherUserId'] as String?,
  otherUserNickname: json['otherUserNickname'] as String?,
  otherUserAvatar: json['otherUserAvatar'] as String?,
  user1Accepted: json['user1Accepted'] as bool? ?? false,
  user2Accepted: json['user2Accepted'] as bool? ?? false,
  myAccepted: json['myAccepted'] as bool? ?? false,
  otherAccepted: json['otherAccepted'] as bool? ?? false,
);

Map<String, dynamic> _$$SparkImplToJson(_$SparkImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'user1Id': instance.user1Id,
      'user2Id': instance.user2Id,
      'status': _$SparkStatusEnumMap[instance.status]!,
      'createdAt': instance.createdAt.toIso8601String(),
      'type': _$SparkTypeEnumMap[instance.type]!,
      'message': instance.message,
      'respondedAt': instance.respondedAt?.toIso8601String(),
      'expiresAt': instance.expiresAt?.toIso8601String(),
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'locationName': instance.locationName,
      'direction': _$SparkDirectionEnumMap[instance.direction],
      'distance': instance.distance,
      'metadata': instance.metadata,
      'otherUserId': instance.otherUserId,
      'otherUserNickname': instance.otherUserNickname,
      'otherUserAvatar': instance.otherUserAvatar,
      'user1Accepted': instance.user1Accepted,
      'user2Accepted': instance.user2Accepted,
      'myAccepted': instance.myAccepted,
      'otherAccepted': instance.otherAccepted,
    };

const _$SparkStatusEnumMap = {
  SparkStatus.pending: 'pending',
  SparkStatus.accepted: 'accepted',
  SparkStatus.rejected: 'rejected',
  SparkStatus.expired: 'expired',
  SparkStatus.matched: 'matched',
};

const _$SparkTypeEnumMap = {
  SparkType.automatic: 'automatic',
  SparkType.manual: 'manual',
  SparkType.proximity: 'proximity',
};

const _$SparkDirectionEnumMap = {
  SparkDirection.sent: 'sent',
  SparkDirection.received: 'received',
};

_$SparkDetailImpl _$$SparkDetailImplFromJson(Map<String, dynamic> json) =>
    _$SparkDetailImpl(
      id: json['id'] as String,
      location: json['location'] as String,
      time: json['time'] as String,
      duration: json['duration'] as String,
      distance: json['distance'] as String,
      matchingRate: (json['matchingRate'] as num).toInt(),
      commonInterests: (json['commonInterests'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      signatureConnection: SignatureConnection.fromJson(
        json['signatureConnection'] as Map<String, dynamic>,
      ),
      additionalHints: (json['additionalHints'] as List<dynamic>)
          .map((e) => e as String)
          .toList(),
      isPremium: json['isPremium'] as bool? ?? false,
      otherUser: json['otherUser'] == null
          ? null
          : SparkUserProfile.fromJson(
              json['otherUser'] as Map<String, dynamic>,
            ),
    );

Map<String, dynamic> _$$SparkDetailImplToJson(_$SparkDetailImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'location': instance.location,
      'time': instance.time,
      'duration': instance.duration,
      'distance': instance.distance,
      'matchingRate': instance.matchingRate,
      'commonInterests': instance.commonInterests,
      'signatureConnection': instance.signatureConnection,
      'additionalHints': instance.additionalHints,
      'isPremium': instance.isPremium,
      'otherUser': instance.otherUser,
    };

_$SparkUserProfileImpl _$$SparkUserProfileImplFromJson(
  Map<String, dynamic> json,
) => _$SparkUserProfileImpl(
  id: json['id'] as String,
  nickname: json['nickname'] as String,
  avatarUrl: json['avatarUrl'] as String?,
  bio: json['bio'] as String?,
  occupation: json['occupation'] as String?,
  location: json['location'] as String?,
  interests:
      (json['interests'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
  skills:
      (json['skills'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
  languages:
      (json['languages'] as List<dynamic>?)?.map((e) => e as String).toList() ??
      const [],
);

Map<String, dynamic> _$$SparkUserProfileImplToJson(
  _$SparkUserProfileImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'nickname': instance.nickname,
  'avatarUrl': instance.avatarUrl,
  'bio': instance.bio,
  'occupation': instance.occupation,
  'location': instance.location,
  'interests': instance.interests,
  'skills': instance.skills,
  'languages': instance.languages,
};

_$SignatureConnectionImpl _$$SignatureConnectionImplFromJson(
  Map<String, dynamic> json,
) => _$SignatureConnectionImpl(
  movie: json['movie'] as String?,
  artist: json['artist'] as String?,
  mbti: json['mbti'] as String?,
  isMovieMatch: json['isMovieMatch'] as bool? ?? false,
  isArtistMatch: json['isArtistMatch'] as bool? ?? false,
  isMbtiMatch: json['isMbtiMatch'] as bool? ?? false,
);

Map<String, dynamic> _$$SignatureConnectionImplToJson(
  _$SignatureConnectionImpl instance,
) => <String, dynamic>{
  'movie': instance.movie,
  'artist': instance.artist,
  'mbti': instance.mbti,
  'isMovieMatch': instance.isMovieMatch,
  'isArtistMatch': instance.isArtistMatch,
  'isMbtiMatch': instance.isMbtiMatch,
};

_$CreateSparkRequestImpl _$$CreateSparkRequestImplFromJson(
  Map<String, dynamic> json,
) => _$CreateSparkRequestImpl(
  targetUserId: json['targetUserId'] as String,
  message: json['message'] as String?,
  sparkType: json['sparkType'] as String?,
  spotId: json['spotId'] as String?,
  latitude: (json['latitude'] as num?)?.toDouble(),
  longitude: (json['longitude'] as num?)?.toDouble(),
);

Map<String, dynamic> _$$CreateSparkRequestImplToJson(
  _$CreateSparkRequestImpl instance,
) => <String, dynamic>{
  'targetUserId': instance.targetUserId,
  'message': instance.message,
  'sparkType': instance.sparkType,
  'spotId': instance.spotId,
  'latitude': instance.latitude,
  'longitude': instance.longitude,
};

_$SparkResponseImpl _$$SparkResponseImplFromJson(Map<String, dynamic> json) =>
    _$SparkResponseImpl(
      success: json['success'] as bool,
      data: Spark.fromJson(json['data'] as Map<String, dynamic>),
      message: json['message'] as String?,
    );

Map<String, dynamic> _$$SparkResponseImplToJson(_$SparkResponseImpl instance) =>
    <String, dynamic>{
      'success': instance.success,
      'data': instance.data,
      'message': instance.message,
    };

_$SparkListResponseImpl _$$SparkListResponseImplFromJson(
  Map<String, dynamic> json,
) => _$SparkListResponseImpl(
  success: json['success'] as bool,
  data: (json['data'] as List<dynamic>)
      .map((e) => Spark.fromJson(e as Map<String, dynamic>))
      .toList(),
  message: json['message'] as String?,
);

Map<String, dynamic> _$$SparkListResponseImplToJson(
  _$SparkListResponseImpl instance,
) => <String, dynamic>{
  'success': instance.success,
  'data': instance.data,
  'message': instance.message,
};
