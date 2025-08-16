import 'package:freezed_annotation/freezed_annotation.dart';
import 'signal_spot.dart';

part 'feed.freezed.dart';
part 'feed.g.dart';

@freezed
class FeedItem with _$FeedItem {
  const factory FeedItem({
    required String id,
    required String type, // 'signal_spot', 'user_activity', 'trending'
    required DateTime timestamp,
    SignalSpot? signalSpot,
    Map<String, dynamic>? data,
    @Default(0) int priority,
    Map<String, dynamic>? metadata,
  }) = _FeedItem;

  factory FeedItem.fromJson(Map<String, dynamic> json) => _$FeedItemFromJson(json);
}

@freezed
class FeedResponse with _$FeedResponse {
  const factory FeedResponse({
    required List<FeedItem> items,
    required int count,
    required bool hasMore,
    String? nextCursor,
    Map<String, dynamic>? metadata,
  }) = _FeedResponse;

  factory FeedResponse.fromJson(Map<String, dynamic> json) => _$FeedResponseFromJson(json);
}

@freezed
class FeedQuery with _$FeedQuery {
  const factory FeedQuery({
    @Default(20) int limit,
    @Default(0) int offset,
    String? cursor,
    String? type,
    double? latitude,
    double? longitude,
    @Default(5000) double radiusMeters,
  }) = _FeedQuery;

  factory FeedQuery.fromJson(Map<String, dynamic> json) => _$FeedQueryFromJson(json);
}

@freezed
class TrendingTag with _$TrendingTag {
  const factory TrendingTag({
    required String tag,
    required int count,
    required double trendScore,
    @Default(false) bool isRising,
  }) = _TrendingTag;

  factory TrendingTag.fromJson(Map<String, dynamic> json) => _$TrendingTagFromJson(json);
}

@freezed
class RecommendedUser with _$RecommendedUser {
  const factory RecommendedUser({
    required String id,
    required String username,
    String? displayName,
    String? avatarUrl,
    required double matchScore,
    List<String>? commonInterests,
    String? reason,
  }) = _RecommendedUser;

  factory RecommendedUser.fromJson(Map<String, dynamic> json) => 
      _$RecommendedUserFromJson(json);
}