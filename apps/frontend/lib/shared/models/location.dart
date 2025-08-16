import 'package:freezed_annotation/freezed_annotation.dart';

part 'location.freezed.dart';
part 'location.g.dart';

@freezed
class Location with _$Location {
  const factory Location({
    required String id,
    required String userId,
    required double latitude,
    required double longitude,
    required DateTime timestamp,
    double? accuracy,
    double? altitude,
    double? speed,
    String? address,
    @Default(true) bool isActive,
    Map<String, dynamic>? metadata,
  }) = _Location;

  factory Location.fromJson(Map<String, dynamic> json) => _$LocationFromJson(json);
}

@freezed
class CreateLocationRequest with _$CreateLocationRequest {
  const factory CreateLocationRequest({
    required double latitude,
    required double longitude,
    double? accuracy,
    double? altitude,
    double? speed,
    String? address,
  }) = _CreateLocationRequest;

  factory CreateLocationRequest.fromJson(Map<String, dynamic> json) => 
      _$CreateLocationRequestFromJson(json);
}

@freezed
class NearbyUsersQuery with _$NearbyUsersQuery {
  const factory NearbyUsersQuery({
    required double latitude,
    required double longitude,
    @Default(1000) double radiusMeters,
    @Default(20) int limit,
    @Default(0) int offset,
  }) = _NearbyUsersQuery;

  factory NearbyUsersQuery.fromJson(Map<String, dynamic> json) => 
      _$NearbyUsersQueryFromJson(json);
}

@freezed
class LocationStats with _$LocationStats {
  const factory LocationStats({
    required int totalLocations,
    required int activeLocations,
    required double avgAccuracy,
    required DateTime lastUpdate,
    Map<String, dynamic>? additionalStats,
  }) = _LocationStats;

  factory LocationStats.fromJson(Map<String, dynamic> json) => 
      _$LocationStatsFromJson(json);
}