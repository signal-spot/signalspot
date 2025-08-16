// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'location.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$LocationImpl _$$LocationImplFromJson(Map<String, dynamic> json) =>
    _$LocationImpl(
      id: json['id'] as String,
      userId: json['userId'] as String,
      latitude: (json['latitude'] as num).toDouble(),
      longitude: (json['longitude'] as num).toDouble(),
      timestamp: DateTime.parse(json['timestamp'] as String),
      accuracy: (json['accuracy'] as num?)?.toDouble(),
      altitude: (json['altitude'] as num?)?.toDouble(),
      speed: (json['speed'] as num?)?.toDouble(),
      address: json['address'] as String?,
      isActive: json['isActive'] as bool? ?? true,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$LocationImplToJson(_$LocationImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'userId': instance.userId,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'timestamp': instance.timestamp.toIso8601String(),
      'accuracy': instance.accuracy,
      'altitude': instance.altitude,
      'speed': instance.speed,
      'address': instance.address,
      'isActive': instance.isActive,
      'metadata': instance.metadata,
    };

_$CreateLocationRequestImpl _$$CreateLocationRequestImplFromJson(
  Map<String, dynamic> json,
) => _$CreateLocationRequestImpl(
  latitude: (json['latitude'] as num).toDouble(),
  longitude: (json['longitude'] as num).toDouble(),
  accuracy: (json['accuracy'] as num?)?.toDouble(),
  altitude: (json['altitude'] as num?)?.toDouble(),
  speed: (json['speed'] as num?)?.toDouble(),
  address: json['address'] as String?,
);

Map<String, dynamic> _$$CreateLocationRequestImplToJson(
  _$CreateLocationRequestImpl instance,
) => <String, dynamic>{
  'latitude': instance.latitude,
  'longitude': instance.longitude,
  'accuracy': instance.accuracy,
  'altitude': instance.altitude,
  'speed': instance.speed,
  'address': instance.address,
};

_$NearbyUsersQueryImpl _$$NearbyUsersQueryImplFromJson(
  Map<String, dynamic> json,
) => _$NearbyUsersQueryImpl(
  latitude: (json['latitude'] as num).toDouble(),
  longitude: (json['longitude'] as num).toDouble(),
  radiusMeters: (json['radiusMeters'] as num?)?.toDouble() ?? 1000,
  limit: (json['limit'] as num?)?.toInt() ?? 20,
  offset: (json['offset'] as num?)?.toInt() ?? 0,
);

Map<String, dynamic> _$$NearbyUsersQueryImplToJson(
  _$NearbyUsersQueryImpl instance,
) => <String, dynamic>{
  'latitude': instance.latitude,
  'longitude': instance.longitude,
  'radiusMeters': instance.radiusMeters,
  'limit': instance.limit,
  'offset': instance.offset,
};

_$LocationStatsImpl _$$LocationStatsImplFromJson(Map<String, dynamic> json) =>
    _$LocationStatsImpl(
      totalLocations: (json['totalLocations'] as num).toInt(),
      activeLocations: (json['activeLocations'] as num).toInt(),
      avgAccuracy: (json['avgAccuracy'] as num).toDouble(),
      lastUpdate: DateTime.parse(json['lastUpdate'] as String),
      additionalStats: json['additionalStats'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$LocationStatsImplToJson(_$LocationStatsImpl instance) =>
    <String, dynamic>{
      'totalLocations': instance.totalLocations,
      'activeLocations': instance.activeLocations,
      'avgAccuracy': instance.avgAccuracy,
      'lastUpdate': instance.lastUpdate.toIso8601String(),
      'additionalStats': instance.additionalStats,
    };
