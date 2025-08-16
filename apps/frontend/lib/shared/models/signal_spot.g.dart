// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'signal_spot.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$SignalSpotListResponseImpl _$$SignalSpotListResponseImplFromJson(
  Map<String, dynamic> json,
) => _$SignalSpotListResponseImpl(
  data: (json['data'] as List<dynamic>)
      .map((e) => SignalSpot.fromJson(e as Map<String, dynamic>))
      .toList(),
  count: (json['count'] as num).toInt(),
  success: json['success'] as bool,
  message: json['message'] as String,
);

Map<String, dynamic> _$$SignalSpotListResponseImplToJson(
  _$SignalSpotListResponseImpl instance,
) => <String, dynamic>{
  'data': instance.data,
  'count': instance.count,
  'success': instance.success,
  'message': instance.message,
};

_$CreateSignalSpotRequestImpl _$$CreateSignalSpotRequestImplFromJson(
  Map<String, dynamic> json,
) => _$CreateSignalSpotRequestImpl(
  content: json['content'] as String,
  latitude: (json['latitude'] as num).toDouble(),
  longitude: (json['longitude'] as num).toDouble(),
  title: json['title'] as String?,
  mediaUrls: (json['mediaUrls'] as List<dynamic>?)
      ?.map((e) => e as String)
      .toList(),
  tags: (json['tags'] as List<dynamic>?)?.map((e) => e as String).toList(),
  durationHours: (json['durationHours'] as num?)?.toInt(),
);

Map<String, dynamic> _$$CreateSignalSpotRequestImplToJson(
  _$CreateSignalSpotRequestImpl instance,
) => <String, dynamic>{
  'content': instance.content,
  'latitude': instance.latitude,
  'longitude': instance.longitude,
  'title': instance.title,
  'mediaUrls': instance.mediaUrls,
  'tags': instance.tags,
  'durationHours': instance.durationHours,
};

_$SignalSpotInteractionImpl _$$SignalSpotInteractionImplFromJson(
  Map<String, dynamic> json,
) => _$SignalSpotInteractionImpl(
  type: json['type'] as String,
  message: json['message'] as String?,
);

Map<String, dynamic> _$$SignalSpotInteractionImplToJson(
  _$SignalSpotInteractionImpl instance,
) => <String, dynamic>{
  'type': instance.type,
  if (instance.message case final value?) 'message': value,
};
