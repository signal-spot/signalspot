// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'feed.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$FeedItemImpl _$$FeedItemImplFromJson(Map<String, dynamic> json) =>
    _$FeedItemImpl(
      id: json['id'] as String,
      type: json['type'] as String,
      timestamp: DateTime.parse(json['timestamp'] as String),
      signalSpot: json['signalSpot'] == null
          ? null
          : SignalSpot.fromJson(json['signalSpot'] as Map<String, dynamic>),
      data: json['data'] as Map<String, dynamic>?,
      priority: (json['priority'] as num?)?.toInt() ?? 0,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$FeedItemImplToJson(_$FeedItemImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'type': instance.type,
      'timestamp': instance.timestamp.toIso8601String(),
      'signalSpot': instance.signalSpot,
      'data': instance.data,
      'priority': instance.priority,
      'metadata': instance.metadata,
    };

_$FeedResponseImpl _$$FeedResponseImplFromJson(Map<String, dynamic> json) =>
    _$FeedResponseImpl(
      items: (json['items'] as List<dynamic>)
          .map((e) => FeedItem.fromJson(e as Map<String, dynamic>))
          .toList(),
      count: (json['count'] as num).toInt(),
      hasMore: json['hasMore'] as bool,
      nextCursor: json['nextCursor'] as String?,
      metadata: json['metadata'] as Map<String, dynamic>?,
    );

Map<String, dynamic> _$$FeedResponseImplToJson(_$FeedResponseImpl instance) =>
    <String, dynamic>{
      'items': instance.items,
      'count': instance.count,
      'hasMore': instance.hasMore,
      'nextCursor': instance.nextCursor,
      'metadata': instance.metadata,
    };

_$FeedQueryImpl _$$FeedQueryImplFromJson(Map<String, dynamic> json) =>
    _$FeedQueryImpl(
      limit: (json['limit'] as num?)?.toInt() ?? 20,
      offset: (json['offset'] as num?)?.toInt() ?? 0,
      cursor: json['cursor'] as String?,
      type: json['type'] as String?,
      latitude: (json['latitude'] as num?)?.toDouble(),
      longitude: (json['longitude'] as num?)?.toDouble(),
      radiusMeters: (json['radiusMeters'] as num?)?.toDouble() ?? 5000,
    );

Map<String, dynamic> _$$FeedQueryImplToJson(_$FeedQueryImpl instance) =>
    <String, dynamic>{
      'limit': instance.limit,
      'offset': instance.offset,
      'cursor': instance.cursor,
      'type': instance.type,
      'latitude': instance.latitude,
      'longitude': instance.longitude,
      'radiusMeters': instance.radiusMeters,
    };

_$TrendingTagImpl _$$TrendingTagImplFromJson(Map<String, dynamic> json) =>
    _$TrendingTagImpl(
      tag: json['tag'] as String,
      count: (json['count'] as num).toInt(),
      trendScore: (json['trendScore'] as num).toDouble(),
      isRising: json['isRising'] as bool? ?? false,
    );

Map<String, dynamic> _$$TrendingTagImplToJson(_$TrendingTagImpl instance) =>
    <String, dynamic>{
      'tag': instance.tag,
      'count': instance.count,
      'trendScore': instance.trendScore,
      'isRising': instance.isRising,
    };

_$RecommendedUserImpl _$$RecommendedUserImplFromJson(
  Map<String, dynamic> json,
) => _$RecommendedUserImpl(
  id: json['id'] as String,
  username: json['username'] as String,
  displayName: json['displayName'] as String?,
  avatarUrl: json['avatarUrl'] as String?,
  matchScore: (json['matchScore'] as num).toDouble(),
  commonInterests: (json['commonInterests'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  reason: json['reason'] as String?,
);

Map<String, dynamic> _$$RecommendedUserImplToJson(
  _$RecommendedUserImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'username': instance.username,
  'displayName': instance.displayName,
  'avatarUrl': instance.avatarUrl,
  'matchScore': instance.matchScore,
  'commonInterests': instance.commonInterests,
  'reason': instance.reason,
};
