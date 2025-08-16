// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'signal_spot.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

/// @nodoc
mixin _$SignalSpot {
  String get id => throw _privateConstructorUsedError;
  String? get userId => throw _privateConstructorUsedError;
  String? get creatorId =>
      throw _privateConstructorUsedError; // 백엔드가 creatorId를 사용하는 경우
  String? get creatorUsername =>
      throw _privateConstructorUsedError; // 백엔드에서 제공하는 닉네임
  String? get creatorAvatar =>
      throw _privateConstructorUsedError; // 백엔드에서 제공하는 아바타 URL
  String? get content => throw _privateConstructorUsedError; // 이전 버전 호환성
  String? get message => throw _privateConstructorUsedError; // 새 버전에서 사용
  double get latitude => throw _privateConstructorUsedError;
  double get longitude => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime? get expiresAt => throw _privateConstructorUsedError;
  int get interactionCount => throw _privateConstructorUsedError;
  int get viewCount => throw _privateConstructorUsedError;
  String get status => throw _privateConstructorUsedError;
  List<String>? get mediaUrls => throw _privateConstructorUsedError;
  List<String>? get tags => throw _privateConstructorUsedError;
  String? get title => throw _privateConstructorUsedError;
  bool get isPinned => throw _privateConstructorUsedError;
  bool get isReported => throw _privateConstructorUsedError;
  Map<String, dynamic>? get metadata => throw _privateConstructorUsedError;
  Map<String, dynamic>? get location =>
      throw _privateConstructorUsedError; // location 객체
  Map<String, dynamic>? get engagement =>
      throw _privateConstructorUsedError; // engagement 통계
  Map<String, dynamic>? get timing => throw _privateConstructorUsedError;

  /// Create a copy of SignalSpot
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SignalSpotCopyWith<SignalSpot> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SignalSpotCopyWith<$Res> {
  factory $SignalSpotCopyWith(
    SignalSpot value,
    $Res Function(SignalSpot) then,
  ) = _$SignalSpotCopyWithImpl<$Res, SignalSpot>;
  @useResult
  $Res call({
    String id,
    String? userId,
    String? creatorId,
    String? creatorUsername,
    String? creatorAvatar,
    String? content,
    String? message,
    double latitude,
    double longitude,
    DateTime createdAt,
    DateTime? expiresAt,
    int interactionCount,
    int viewCount,
    String status,
    List<String>? mediaUrls,
    List<String>? tags,
    String? title,
    bool isPinned,
    bool isReported,
    Map<String, dynamic>? metadata,
    Map<String, dynamic>? location,
    Map<String, dynamic>? engagement,
    Map<String, dynamic>? timing,
  });
}

/// @nodoc
class _$SignalSpotCopyWithImpl<$Res, $Val extends SignalSpot>
    implements $SignalSpotCopyWith<$Res> {
  _$SignalSpotCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SignalSpot
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = freezed,
    Object? creatorId = freezed,
    Object? creatorUsername = freezed,
    Object? creatorAvatar = freezed,
    Object? content = freezed,
    Object? message = freezed,
    Object? latitude = null,
    Object? longitude = null,
    Object? createdAt = null,
    Object? expiresAt = freezed,
    Object? interactionCount = null,
    Object? viewCount = null,
    Object? status = null,
    Object? mediaUrls = freezed,
    Object? tags = freezed,
    Object? title = freezed,
    Object? isPinned = null,
    Object? isReported = null,
    Object? metadata = freezed,
    Object? location = freezed,
    Object? engagement = freezed,
    Object? timing = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            userId: freezed == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                      as String?,
            creatorId: freezed == creatorId
                ? _value.creatorId
                : creatorId // ignore: cast_nullable_to_non_nullable
                      as String?,
            creatorUsername: freezed == creatorUsername
                ? _value.creatorUsername
                : creatorUsername // ignore: cast_nullable_to_non_nullable
                      as String?,
            creatorAvatar: freezed == creatorAvatar
                ? _value.creatorAvatar
                : creatorAvatar // ignore: cast_nullable_to_non_nullable
                      as String?,
            content: freezed == content
                ? _value.content
                : content // ignore: cast_nullable_to_non_nullable
                      as String?,
            message: freezed == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                      as String?,
            latitude: null == latitude
                ? _value.latitude
                : latitude // ignore: cast_nullable_to_non_nullable
                      as double,
            longitude: null == longitude
                ? _value.longitude
                : longitude // ignore: cast_nullable_to_non_nullable
                      as double,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            expiresAt: freezed == expiresAt
                ? _value.expiresAt
                : expiresAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            interactionCount: null == interactionCount
                ? _value.interactionCount
                : interactionCount // ignore: cast_nullable_to_non_nullable
                      as int,
            viewCount: null == viewCount
                ? _value.viewCount
                : viewCount // ignore: cast_nullable_to_non_nullable
                      as int,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as String,
            mediaUrls: freezed == mediaUrls
                ? _value.mediaUrls
                : mediaUrls // ignore: cast_nullable_to_non_nullable
                      as List<String>?,
            tags: freezed == tags
                ? _value.tags
                : tags // ignore: cast_nullable_to_non_nullable
                      as List<String>?,
            title: freezed == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String?,
            isPinned: null == isPinned
                ? _value.isPinned
                : isPinned // ignore: cast_nullable_to_non_nullable
                      as bool,
            isReported: null == isReported
                ? _value.isReported
                : isReported // ignore: cast_nullable_to_non_nullable
                      as bool,
            metadata: freezed == metadata
                ? _value.metadata
                : metadata // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            location: freezed == location
                ? _value.location
                : location // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            engagement: freezed == engagement
                ? _value.engagement
                : engagement // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            timing: freezed == timing
                ? _value.timing
                : timing // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$SignalSpotImplCopyWith<$Res>
    implements $SignalSpotCopyWith<$Res> {
  factory _$$SignalSpotImplCopyWith(
    _$SignalSpotImpl value,
    $Res Function(_$SignalSpotImpl) then,
  ) = __$$SignalSpotImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String? userId,
    String? creatorId,
    String? creatorUsername,
    String? creatorAvatar,
    String? content,
    String? message,
    double latitude,
    double longitude,
    DateTime createdAt,
    DateTime? expiresAt,
    int interactionCount,
    int viewCount,
    String status,
    List<String>? mediaUrls,
    List<String>? tags,
    String? title,
    bool isPinned,
    bool isReported,
    Map<String, dynamic>? metadata,
    Map<String, dynamic>? location,
    Map<String, dynamic>? engagement,
    Map<String, dynamic>? timing,
  });
}

/// @nodoc
class __$$SignalSpotImplCopyWithImpl<$Res>
    extends _$SignalSpotCopyWithImpl<$Res, _$SignalSpotImpl>
    implements _$$SignalSpotImplCopyWith<$Res> {
  __$$SignalSpotImplCopyWithImpl(
    _$SignalSpotImpl _value,
    $Res Function(_$SignalSpotImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SignalSpot
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = freezed,
    Object? creatorId = freezed,
    Object? creatorUsername = freezed,
    Object? creatorAvatar = freezed,
    Object? content = freezed,
    Object? message = freezed,
    Object? latitude = null,
    Object? longitude = null,
    Object? createdAt = null,
    Object? expiresAt = freezed,
    Object? interactionCount = null,
    Object? viewCount = null,
    Object? status = null,
    Object? mediaUrls = freezed,
    Object? tags = freezed,
    Object? title = freezed,
    Object? isPinned = null,
    Object? isReported = null,
    Object? metadata = freezed,
    Object? location = freezed,
    Object? engagement = freezed,
    Object? timing = freezed,
  }) {
    return _then(
      _$SignalSpotImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        userId: freezed == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as String?,
        creatorId: freezed == creatorId
            ? _value.creatorId
            : creatorId // ignore: cast_nullable_to_non_nullable
                  as String?,
        creatorUsername: freezed == creatorUsername
            ? _value.creatorUsername
            : creatorUsername // ignore: cast_nullable_to_non_nullable
                  as String?,
        creatorAvatar: freezed == creatorAvatar
            ? _value.creatorAvatar
            : creatorAvatar // ignore: cast_nullable_to_non_nullable
                  as String?,
        content: freezed == content
            ? _value.content
            : content // ignore: cast_nullable_to_non_nullable
                  as String?,
        message: freezed == message
            ? _value.message
            : message // ignore: cast_nullable_to_non_nullable
                  as String?,
        latitude: null == latitude
            ? _value.latitude
            : latitude // ignore: cast_nullable_to_non_nullable
                  as double,
        longitude: null == longitude
            ? _value.longitude
            : longitude // ignore: cast_nullable_to_non_nullable
                  as double,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        expiresAt: freezed == expiresAt
            ? _value.expiresAt
            : expiresAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        interactionCount: null == interactionCount
            ? _value.interactionCount
            : interactionCount // ignore: cast_nullable_to_non_nullable
                  as int,
        viewCount: null == viewCount
            ? _value.viewCount
            : viewCount // ignore: cast_nullable_to_non_nullable
                  as int,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as String,
        mediaUrls: freezed == mediaUrls
            ? _value._mediaUrls
            : mediaUrls // ignore: cast_nullable_to_non_nullable
                  as List<String>?,
        tags: freezed == tags
            ? _value._tags
            : tags // ignore: cast_nullable_to_non_nullable
                  as List<String>?,
        title: freezed == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String?,
        isPinned: null == isPinned
            ? _value.isPinned
            : isPinned // ignore: cast_nullable_to_non_nullable
                  as bool,
        isReported: null == isReported
            ? _value.isReported
            : isReported // ignore: cast_nullable_to_non_nullable
                  as bool,
        metadata: freezed == metadata
            ? _value._metadata
            : metadata // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        location: freezed == location
            ? _value._location
            : location // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        engagement: freezed == engagement
            ? _value._engagement
            : engagement // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        timing: freezed == timing
            ? _value._timing
            : timing // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
      ),
    );
  }
}

/// @nodoc

class _$SignalSpotImpl extends _SignalSpot {
  const _$SignalSpotImpl({
    required this.id,
    this.userId,
    this.creatorId,
    this.creatorUsername,
    this.creatorAvatar,
    this.content,
    this.message,
    required this.latitude,
    required this.longitude,
    required this.createdAt,
    this.expiresAt,
    this.interactionCount = 0,
    this.viewCount = 0,
    this.status = 'active',
    final List<String>? mediaUrls,
    final List<String>? tags,
    this.title,
    this.isPinned = false,
    this.isReported = false,
    final Map<String, dynamic>? metadata,
    final Map<String, dynamic>? location,
    final Map<String, dynamic>? engagement,
    final Map<String, dynamic>? timing,
  }) : _mediaUrls = mediaUrls,
       _tags = tags,
       _metadata = metadata,
       _location = location,
       _engagement = engagement,
       _timing = timing,
       super._();

  @override
  final String id;
  @override
  final String? userId;
  @override
  final String? creatorId;
  // 백엔드가 creatorId를 사용하는 경우
  @override
  final String? creatorUsername;
  // 백엔드에서 제공하는 닉네임
  @override
  final String? creatorAvatar;
  // 백엔드에서 제공하는 아바타 URL
  @override
  final String? content;
  // 이전 버전 호환성
  @override
  final String? message;
  // 새 버전에서 사용
  @override
  final double latitude;
  @override
  final double longitude;
  @override
  final DateTime createdAt;
  @override
  final DateTime? expiresAt;
  @override
  @JsonKey()
  final int interactionCount;
  @override
  @JsonKey()
  final int viewCount;
  @override
  @JsonKey()
  final String status;
  final List<String>? _mediaUrls;
  @override
  List<String>? get mediaUrls {
    final value = _mediaUrls;
    if (value == null) return null;
    if (_mediaUrls is EqualUnmodifiableListView) return _mediaUrls;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  final List<String>? _tags;
  @override
  List<String>? get tags {
    final value = _tags;
    if (value == null) return null;
    if (_tags is EqualUnmodifiableListView) return _tags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final String? title;
  @override
  @JsonKey()
  final bool isPinned;
  @override
  @JsonKey()
  final bool isReported;
  final Map<String, dynamic>? _metadata;
  @override
  Map<String, dynamic>? get metadata {
    final value = _metadata;
    if (value == null) return null;
    if (_metadata is EqualUnmodifiableMapView) return _metadata;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  final Map<String, dynamic>? _location;
  @override
  Map<String, dynamic>? get location {
    final value = _location;
    if (value == null) return null;
    if (_location is EqualUnmodifiableMapView) return _location;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  // location 객체
  final Map<String, dynamic>? _engagement;
  // location 객체
  @override
  Map<String, dynamic>? get engagement {
    final value = _engagement;
    if (value == null) return null;
    if (_engagement is EqualUnmodifiableMapView) return _engagement;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  // engagement 통계
  final Map<String, dynamic>? _timing;
  // engagement 통계
  @override
  Map<String, dynamic>? get timing {
    final value = _timing;
    if (value == null) return null;
    if (_timing is EqualUnmodifiableMapView) return _timing;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  String toString() {
    return 'SignalSpot(id: $id, userId: $userId, creatorId: $creatorId, creatorUsername: $creatorUsername, creatorAvatar: $creatorAvatar, content: $content, message: $message, latitude: $latitude, longitude: $longitude, createdAt: $createdAt, expiresAt: $expiresAt, interactionCount: $interactionCount, viewCount: $viewCount, status: $status, mediaUrls: $mediaUrls, tags: $tags, title: $title, isPinned: $isPinned, isReported: $isReported, metadata: $metadata, location: $location, engagement: $engagement, timing: $timing)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SignalSpotImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.creatorId, creatorId) ||
                other.creatorId == creatorId) &&
            (identical(other.creatorUsername, creatorUsername) ||
                other.creatorUsername == creatorUsername) &&
            (identical(other.creatorAvatar, creatorAvatar) ||
                other.creatorAvatar == creatorAvatar) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.latitude, latitude) ||
                other.latitude == latitude) &&
            (identical(other.longitude, longitude) ||
                other.longitude == longitude) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.expiresAt, expiresAt) ||
                other.expiresAt == expiresAt) &&
            (identical(other.interactionCount, interactionCount) ||
                other.interactionCount == interactionCount) &&
            (identical(other.viewCount, viewCount) ||
                other.viewCount == viewCount) &&
            (identical(other.status, status) || other.status == status) &&
            const DeepCollectionEquality().equals(
              other._mediaUrls,
              _mediaUrls,
            ) &&
            const DeepCollectionEquality().equals(other._tags, _tags) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.isPinned, isPinned) ||
                other.isPinned == isPinned) &&
            (identical(other.isReported, isReported) ||
                other.isReported == isReported) &&
            const DeepCollectionEquality().equals(other._metadata, _metadata) &&
            const DeepCollectionEquality().equals(other._location, _location) &&
            const DeepCollectionEquality().equals(
              other._engagement,
              _engagement,
            ) &&
            const DeepCollectionEquality().equals(other._timing, _timing));
  }

  @override
  int get hashCode => Object.hashAll([
    runtimeType,
    id,
    userId,
    creatorId,
    creatorUsername,
    creatorAvatar,
    content,
    message,
    latitude,
    longitude,
    createdAt,
    expiresAt,
    interactionCount,
    viewCount,
    status,
    const DeepCollectionEquality().hash(_mediaUrls),
    const DeepCollectionEquality().hash(_tags),
    title,
    isPinned,
    isReported,
    const DeepCollectionEquality().hash(_metadata),
    const DeepCollectionEquality().hash(_location),
    const DeepCollectionEquality().hash(_engagement),
    const DeepCollectionEquality().hash(_timing),
  ]);

  /// Create a copy of SignalSpot
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SignalSpotImplCopyWith<_$SignalSpotImpl> get copyWith =>
      __$$SignalSpotImplCopyWithImpl<_$SignalSpotImpl>(this, _$identity);
}

abstract class _SignalSpot extends SignalSpot {
  const factory _SignalSpot({
    required final String id,
    final String? userId,
    final String? creatorId,
    final String? creatorUsername,
    final String? creatorAvatar,
    final String? content,
    final String? message,
    required final double latitude,
    required final double longitude,
    required final DateTime createdAt,
    final DateTime? expiresAt,
    final int interactionCount,
    final int viewCount,
    final String status,
    final List<String>? mediaUrls,
    final List<String>? tags,
    final String? title,
    final bool isPinned,
    final bool isReported,
    final Map<String, dynamic>? metadata,
    final Map<String, dynamic>? location,
    final Map<String, dynamic>? engagement,
    final Map<String, dynamic>? timing,
  }) = _$SignalSpotImpl;
  const _SignalSpot._() : super._();

  @override
  String get id;
  @override
  String? get userId;
  @override
  String? get creatorId; // 백엔드가 creatorId를 사용하는 경우
  @override
  String? get creatorUsername; // 백엔드에서 제공하는 닉네임
  @override
  String? get creatorAvatar; // 백엔드에서 제공하는 아바타 URL
  @override
  String? get content; // 이전 버전 호환성
  @override
  String? get message; // 새 버전에서 사용
  @override
  double get latitude;
  @override
  double get longitude;
  @override
  DateTime get createdAt;
  @override
  DateTime? get expiresAt;
  @override
  int get interactionCount;
  @override
  int get viewCount;
  @override
  String get status;
  @override
  List<String>? get mediaUrls;
  @override
  List<String>? get tags;
  @override
  String? get title;
  @override
  bool get isPinned;
  @override
  bool get isReported;
  @override
  Map<String, dynamic>? get metadata;
  @override
  Map<String, dynamic>? get location; // location 객체
  @override
  Map<String, dynamic>? get engagement; // engagement 통계
  @override
  Map<String, dynamic>? get timing;

  /// Create a copy of SignalSpot
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SignalSpotImplCopyWith<_$SignalSpotImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SignalSpotListResponse _$SignalSpotListResponseFromJson(
  Map<String, dynamic> json,
) {
  return _SignalSpotListResponse.fromJson(json);
}

/// @nodoc
mixin _$SignalSpotListResponse {
  List<SignalSpot> get data => throw _privateConstructorUsedError;
  int get count => throw _privateConstructorUsedError;
  bool get success => throw _privateConstructorUsedError;
  String get message => throw _privateConstructorUsedError;

  /// Serializes this SignalSpotListResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SignalSpotListResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SignalSpotListResponseCopyWith<SignalSpotListResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SignalSpotListResponseCopyWith<$Res> {
  factory $SignalSpotListResponseCopyWith(
    SignalSpotListResponse value,
    $Res Function(SignalSpotListResponse) then,
  ) = _$SignalSpotListResponseCopyWithImpl<$Res, SignalSpotListResponse>;
  @useResult
  $Res call({List<SignalSpot> data, int count, bool success, String message});
}

/// @nodoc
class _$SignalSpotListResponseCopyWithImpl<
  $Res,
  $Val extends SignalSpotListResponse
>
    implements $SignalSpotListResponseCopyWith<$Res> {
  _$SignalSpotListResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SignalSpotListResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? data = null,
    Object? count = null,
    Object? success = null,
    Object? message = null,
  }) {
    return _then(
      _value.copyWith(
            data: null == data
                ? _value.data
                : data // ignore: cast_nullable_to_non_nullable
                      as List<SignalSpot>,
            count: null == count
                ? _value.count
                : count // ignore: cast_nullable_to_non_nullable
                      as int,
            success: null == success
                ? _value.success
                : success // ignore: cast_nullable_to_non_nullable
                      as bool,
            message: null == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$SignalSpotListResponseImplCopyWith<$Res>
    implements $SignalSpotListResponseCopyWith<$Res> {
  factory _$$SignalSpotListResponseImplCopyWith(
    _$SignalSpotListResponseImpl value,
    $Res Function(_$SignalSpotListResponseImpl) then,
  ) = __$$SignalSpotListResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({List<SignalSpot> data, int count, bool success, String message});
}

/// @nodoc
class __$$SignalSpotListResponseImplCopyWithImpl<$Res>
    extends
        _$SignalSpotListResponseCopyWithImpl<$Res, _$SignalSpotListResponseImpl>
    implements _$$SignalSpotListResponseImplCopyWith<$Res> {
  __$$SignalSpotListResponseImplCopyWithImpl(
    _$SignalSpotListResponseImpl _value,
    $Res Function(_$SignalSpotListResponseImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SignalSpotListResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? data = null,
    Object? count = null,
    Object? success = null,
    Object? message = null,
  }) {
    return _then(
      _$SignalSpotListResponseImpl(
        data: null == data
            ? _value._data
            : data // ignore: cast_nullable_to_non_nullable
                  as List<SignalSpot>,
        count: null == count
            ? _value.count
            : count // ignore: cast_nullable_to_non_nullable
                  as int,
        success: null == success
            ? _value.success
            : success // ignore: cast_nullable_to_non_nullable
                  as bool,
        message: null == message
            ? _value.message
            : message // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SignalSpotListResponseImpl implements _SignalSpotListResponse {
  const _$SignalSpotListResponseImpl({
    required final List<SignalSpot> data,
    required this.count,
    required this.success,
    required this.message,
  }) : _data = data;

  factory _$SignalSpotListResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$SignalSpotListResponseImplFromJson(json);

  final List<SignalSpot> _data;
  @override
  List<SignalSpot> get data {
    if (_data is EqualUnmodifiableListView) return _data;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_data);
  }

  @override
  final int count;
  @override
  final bool success;
  @override
  final String message;

  @override
  String toString() {
    return 'SignalSpotListResponse(data: $data, count: $count, success: $success, message: $message)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SignalSpotListResponseImpl &&
            const DeepCollectionEquality().equals(other._data, _data) &&
            (identical(other.count, count) || other.count == count) &&
            (identical(other.success, success) || other.success == success) &&
            (identical(other.message, message) || other.message == message));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    const DeepCollectionEquality().hash(_data),
    count,
    success,
    message,
  );

  /// Create a copy of SignalSpotListResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SignalSpotListResponseImplCopyWith<_$SignalSpotListResponseImpl>
  get copyWith =>
      __$$SignalSpotListResponseImplCopyWithImpl<_$SignalSpotListResponseImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$SignalSpotListResponseImplToJson(this);
  }
}

abstract class _SignalSpotListResponse implements SignalSpotListResponse {
  const factory _SignalSpotListResponse({
    required final List<SignalSpot> data,
    required final int count,
    required final bool success,
    required final String message,
  }) = _$SignalSpotListResponseImpl;

  factory _SignalSpotListResponse.fromJson(Map<String, dynamic> json) =
      _$SignalSpotListResponseImpl.fromJson;

  @override
  List<SignalSpot> get data;
  @override
  int get count;
  @override
  bool get success;
  @override
  String get message;

  /// Create a copy of SignalSpotListResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SignalSpotListResponseImplCopyWith<_$SignalSpotListResponseImpl>
  get copyWith => throw _privateConstructorUsedError;
}

CreateSignalSpotRequest _$CreateSignalSpotRequestFromJson(
  Map<String, dynamic> json,
) {
  return _CreateSignalSpotRequest.fromJson(json);
}

/// @nodoc
mixin _$CreateSignalSpotRequest {
  String get content => throw _privateConstructorUsedError;
  double get latitude => throw _privateConstructorUsedError;
  double get longitude => throw _privateConstructorUsedError;
  String? get title => throw _privateConstructorUsedError;
  List<String>? get mediaUrls => throw _privateConstructorUsedError;
  List<String>? get tags => throw _privateConstructorUsedError;
  int? get durationHours => throw _privateConstructorUsedError;

  /// Serializes this CreateSignalSpotRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreateSignalSpotRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreateSignalSpotRequestCopyWith<CreateSignalSpotRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreateSignalSpotRequestCopyWith<$Res> {
  factory $CreateSignalSpotRequestCopyWith(
    CreateSignalSpotRequest value,
    $Res Function(CreateSignalSpotRequest) then,
  ) = _$CreateSignalSpotRequestCopyWithImpl<$Res, CreateSignalSpotRequest>;
  @useResult
  $Res call({
    String content,
    double latitude,
    double longitude,
    String? title,
    List<String>? mediaUrls,
    List<String>? tags,
    int? durationHours,
  });
}

/// @nodoc
class _$CreateSignalSpotRequestCopyWithImpl<
  $Res,
  $Val extends CreateSignalSpotRequest
>
    implements $CreateSignalSpotRequestCopyWith<$Res> {
  _$CreateSignalSpotRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreateSignalSpotRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? content = null,
    Object? latitude = null,
    Object? longitude = null,
    Object? title = freezed,
    Object? mediaUrls = freezed,
    Object? tags = freezed,
    Object? durationHours = freezed,
  }) {
    return _then(
      _value.copyWith(
            content: null == content
                ? _value.content
                : content // ignore: cast_nullable_to_non_nullable
                      as String,
            latitude: null == latitude
                ? _value.latitude
                : latitude // ignore: cast_nullable_to_non_nullable
                      as double,
            longitude: null == longitude
                ? _value.longitude
                : longitude // ignore: cast_nullable_to_non_nullable
                      as double,
            title: freezed == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String?,
            mediaUrls: freezed == mediaUrls
                ? _value.mediaUrls
                : mediaUrls // ignore: cast_nullable_to_non_nullable
                      as List<String>?,
            tags: freezed == tags
                ? _value.tags
                : tags // ignore: cast_nullable_to_non_nullable
                      as List<String>?,
            durationHours: freezed == durationHours
                ? _value.durationHours
                : durationHours // ignore: cast_nullable_to_non_nullable
                      as int?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CreateSignalSpotRequestImplCopyWith<$Res>
    implements $CreateSignalSpotRequestCopyWith<$Res> {
  factory _$$CreateSignalSpotRequestImplCopyWith(
    _$CreateSignalSpotRequestImpl value,
    $Res Function(_$CreateSignalSpotRequestImpl) then,
  ) = __$$CreateSignalSpotRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String content,
    double latitude,
    double longitude,
    String? title,
    List<String>? mediaUrls,
    List<String>? tags,
    int? durationHours,
  });
}

/// @nodoc
class __$$CreateSignalSpotRequestImplCopyWithImpl<$Res>
    extends
        _$CreateSignalSpotRequestCopyWithImpl<
          $Res,
          _$CreateSignalSpotRequestImpl
        >
    implements _$$CreateSignalSpotRequestImplCopyWith<$Res> {
  __$$CreateSignalSpotRequestImplCopyWithImpl(
    _$CreateSignalSpotRequestImpl _value,
    $Res Function(_$CreateSignalSpotRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CreateSignalSpotRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? content = null,
    Object? latitude = null,
    Object? longitude = null,
    Object? title = freezed,
    Object? mediaUrls = freezed,
    Object? tags = freezed,
    Object? durationHours = freezed,
  }) {
    return _then(
      _$CreateSignalSpotRequestImpl(
        content: null == content
            ? _value.content
            : content // ignore: cast_nullable_to_non_nullable
                  as String,
        latitude: null == latitude
            ? _value.latitude
            : latitude // ignore: cast_nullable_to_non_nullable
                  as double,
        longitude: null == longitude
            ? _value.longitude
            : longitude // ignore: cast_nullable_to_non_nullable
                  as double,
        title: freezed == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String?,
        mediaUrls: freezed == mediaUrls
            ? _value._mediaUrls
            : mediaUrls // ignore: cast_nullable_to_non_nullable
                  as List<String>?,
        tags: freezed == tags
            ? _value._tags
            : tags // ignore: cast_nullable_to_non_nullable
                  as List<String>?,
        durationHours: freezed == durationHours
            ? _value.durationHours
            : durationHours // ignore: cast_nullable_to_non_nullable
                  as int?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CreateSignalSpotRequestImpl implements _CreateSignalSpotRequest {
  const _$CreateSignalSpotRequestImpl({
    required this.content,
    required this.latitude,
    required this.longitude,
    this.title,
    final List<String>? mediaUrls,
    final List<String>? tags,
    this.durationHours,
  }) : _mediaUrls = mediaUrls,
       _tags = tags;

  factory _$CreateSignalSpotRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreateSignalSpotRequestImplFromJson(json);

  @override
  final String content;
  @override
  final double latitude;
  @override
  final double longitude;
  @override
  final String? title;
  final List<String>? _mediaUrls;
  @override
  List<String>? get mediaUrls {
    final value = _mediaUrls;
    if (value == null) return null;
    if (_mediaUrls is EqualUnmodifiableListView) return _mediaUrls;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  final List<String>? _tags;
  @override
  List<String>? get tags {
    final value = _tags;
    if (value == null) return null;
    if (_tags is EqualUnmodifiableListView) return _tags;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final int? durationHours;

  @override
  String toString() {
    return 'CreateSignalSpotRequest(content: $content, latitude: $latitude, longitude: $longitude, title: $title, mediaUrls: $mediaUrls, tags: $tags, durationHours: $durationHours)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreateSignalSpotRequestImpl &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.latitude, latitude) ||
                other.latitude == latitude) &&
            (identical(other.longitude, longitude) ||
                other.longitude == longitude) &&
            (identical(other.title, title) || other.title == title) &&
            const DeepCollectionEquality().equals(
              other._mediaUrls,
              _mediaUrls,
            ) &&
            const DeepCollectionEquality().equals(other._tags, _tags) &&
            (identical(other.durationHours, durationHours) ||
                other.durationHours == durationHours));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    content,
    latitude,
    longitude,
    title,
    const DeepCollectionEquality().hash(_mediaUrls),
    const DeepCollectionEquality().hash(_tags),
    durationHours,
  );

  /// Create a copy of CreateSignalSpotRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreateSignalSpotRequestImplCopyWith<_$CreateSignalSpotRequestImpl>
  get copyWith =>
      __$$CreateSignalSpotRequestImplCopyWithImpl<
        _$CreateSignalSpotRequestImpl
      >(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$CreateSignalSpotRequestImplToJson(this);
  }
}

abstract class _CreateSignalSpotRequest implements CreateSignalSpotRequest {
  const factory _CreateSignalSpotRequest({
    required final String content,
    required final double latitude,
    required final double longitude,
    final String? title,
    final List<String>? mediaUrls,
    final List<String>? tags,
    final int? durationHours,
  }) = _$CreateSignalSpotRequestImpl;

  factory _CreateSignalSpotRequest.fromJson(Map<String, dynamic> json) =
      _$CreateSignalSpotRequestImpl.fromJson;

  @override
  String get content;
  @override
  double get latitude;
  @override
  double get longitude;
  @override
  String? get title;
  @override
  List<String>? get mediaUrls;
  @override
  List<String>? get tags;
  @override
  int? get durationHours;

  /// Create a copy of CreateSignalSpotRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreateSignalSpotRequestImplCopyWith<_$CreateSignalSpotRequestImpl>
  get copyWith => throw _privateConstructorUsedError;
}

SignalSpotInteraction _$SignalSpotInteractionFromJson(
  Map<String, dynamic> json,
) {
  return _SignalSpotInteraction.fromJson(json);
}

/// @nodoc
mixin _$SignalSpotInteraction {
  String get type =>
      throw _privateConstructorUsedError; // 'like', 'view', 'share', 'report'
  @JsonKey(includeIfNull: false)
  String? get message => throw _privateConstructorUsedError;

  /// Serializes this SignalSpotInteraction to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SignalSpotInteraction
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SignalSpotInteractionCopyWith<SignalSpotInteraction> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SignalSpotInteractionCopyWith<$Res> {
  factory $SignalSpotInteractionCopyWith(
    SignalSpotInteraction value,
    $Res Function(SignalSpotInteraction) then,
  ) = _$SignalSpotInteractionCopyWithImpl<$Res, SignalSpotInteraction>;
  @useResult
  $Res call({String type, @JsonKey(includeIfNull: false) String? message});
}

/// @nodoc
class _$SignalSpotInteractionCopyWithImpl<
  $Res,
  $Val extends SignalSpotInteraction
>
    implements $SignalSpotInteractionCopyWith<$Res> {
  _$SignalSpotInteractionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SignalSpotInteraction
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? type = null, Object? message = freezed}) {
    return _then(
      _value.copyWith(
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as String,
            message: freezed == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$SignalSpotInteractionImplCopyWith<$Res>
    implements $SignalSpotInteractionCopyWith<$Res> {
  factory _$$SignalSpotInteractionImplCopyWith(
    _$SignalSpotInteractionImpl value,
    $Res Function(_$SignalSpotInteractionImpl) then,
  ) = __$$SignalSpotInteractionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String type, @JsonKey(includeIfNull: false) String? message});
}

/// @nodoc
class __$$SignalSpotInteractionImplCopyWithImpl<$Res>
    extends
        _$SignalSpotInteractionCopyWithImpl<$Res, _$SignalSpotInteractionImpl>
    implements _$$SignalSpotInteractionImplCopyWith<$Res> {
  __$$SignalSpotInteractionImplCopyWithImpl(
    _$SignalSpotInteractionImpl _value,
    $Res Function(_$SignalSpotInteractionImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SignalSpotInteraction
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? type = null, Object? message = freezed}) {
    return _then(
      _$SignalSpotInteractionImpl(
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as String,
        message: freezed == message
            ? _value.message
            : message // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SignalSpotInteractionImpl implements _SignalSpotInteraction {
  const _$SignalSpotInteractionImpl({
    required this.type,
    @JsonKey(includeIfNull: false) this.message,
  });

  factory _$SignalSpotInteractionImpl.fromJson(Map<String, dynamic> json) =>
      _$$SignalSpotInteractionImplFromJson(json);

  @override
  final String type;
  // 'like', 'view', 'share', 'report'
  @override
  @JsonKey(includeIfNull: false)
  final String? message;

  @override
  String toString() {
    return 'SignalSpotInteraction(type: $type, message: $message)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SignalSpotInteractionImpl &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.message, message) || other.message == message));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, type, message);

  /// Create a copy of SignalSpotInteraction
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SignalSpotInteractionImplCopyWith<_$SignalSpotInteractionImpl>
  get copyWith =>
      __$$SignalSpotInteractionImplCopyWithImpl<_$SignalSpotInteractionImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$SignalSpotInteractionImplToJson(this);
  }
}

abstract class _SignalSpotInteraction implements SignalSpotInteraction {
  const factory _SignalSpotInteraction({
    required final String type,
    @JsonKey(includeIfNull: false) final String? message,
  }) = _$SignalSpotInteractionImpl;

  factory _SignalSpotInteraction.fromJson(Map<String, dynamic> json) =
      _$SignalSpotInteractionImpl.fromJson;

  @override
  String get type; // 'like', 'view', 'share', 'report'
  @override
  @JsonKey(includeIfNull: false)
  String? get message;

  /// Create a copy of SignalSpotInteraction
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SignalSpotInteractionImplCopyWith<_$SignalSpotInteractionImpl>
  get copyWith => throw _privateConstructorUsedError;
}
