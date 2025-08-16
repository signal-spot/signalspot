// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'feed.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

FeedItem _$FeedItemFromJson(Map<String, dynamic> json) {
  return _FeedItem.fromJson(json);
}

/// @nodoc
mixin _$FeedItem {
  String get id => throw _privateConstructorUsedError;
  String get type =>
      throw _privateConstructorUsedError; // 'signal_spot', 'user_activity', 'trending'
  DateTime get timestamp => throw _privateConstructorUsedError;
  SignalSpot? get signalSpot => throw _privateConstructorUsedError;
  Map<String, dynamic>? get data => throw _privateConstructorUsedError;
  int get priority => throw _privateConstructorUsedError;
  Map<String, dynamic>? get metadata => throw _privateConstructorUsedError;

  /// Serializes this FeedItem to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of FeedItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FeedItemCopyWith<FeedItem> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FeedItemCopyWith<$Res> {
  factory $FeedItemCopyWith(FeedItem value, $Res Function(FeedItem) then) =
      _$FeedItemCopyWithImpl<$Res, FeedItem>;
  @useResult
  $Res call({
    String id,
    String type,
    DateTime timestamp,
    SignalSpot? signalSpot,
    Map<String, dynamic>? data,
    int priority,
    Map<String, dynamic>? metadata,
  });

  $SignalSpotCopyWith<$Res>? get signalSpot;
}

/// @nodoc
class _$FeedItemCopyWithImpl<$Res, $Val extends FeedItem>
    implements $FeedItemCopyWith<$Res> {
  _$FeedItemCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of FeedItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? timestamp = null,
    Object? signalSpot = freezed,
    Object? data = freezed,
    Object? priority = null,
    Object? metadata = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as String,
            timestamp: null == timestamp
                ? _value.timestamp
                : timestamp // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            signalSpot: freezed == signalSpot
                ? _value.signalSpot
                : signalSpot // ignore: cast_nullable_to_non_nullable
                      as SignalSpot?,
            data: freezed == data
                ? _value.data
                : data // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            priority: null == priority
                ? _value.priority
                : priority // ignore: cast_nullable_to_non_nullable
                      as int,
            metadata: freezed == metadata
                ? _value.metadata
                : metadata // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
          )
          as $Val,
    );
  }

  /// Create a copy of FeedItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $SignalSpotCopyWith<$Res>? get signalSpot {
    if (_value.signalSpot == null) {
      return null;
    }

    return $SignalSpotCopyWith<$Res>(_value.signalSpot!, (value) {
      return _then(_value.copyWith(signalSpot: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$FeedItemImplCopyWith<$Res>
    implements $FeedItemCopyWith<$Res> {
  factory _$$FeedItemImplCopyWith(
    _$FeedItemImpl value,
    $Res Function(_$FeedItemImpl) then,
  ) = __$$FeedItemImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String type,
    DateTime timestamp,
    SignalSpot? signalSpot,
    Map<String, dynamic>? data,
    int priority,
    Map<String, dynamic>? metadata,
  });

  @override
  $SignalSpotCopyWith<$Res>? get signalSpot;
}

/// @nodoc
class __$$FeedItemImplCopyWithImpl<$Res>
    extends _$FeedItemCopyWithImpl<$Res, _$FeedItemImpl>
    implements _$$FeedItemImplCopyWith<$Res> {
  __$$FeedItemImplCopyWithImpl(
    _$FeedItemImpl _value,
    $Res Function(_$FeedItemImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of FeedItem
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? type = null,
    Object? timestamp = null,
    Object? signalSpot = freezed,
    Object? data = freezed,
    Object? priority = null,
    Object? metadata = freezed,
  }) {
    return _then(
      _$FeedItemImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as String,
        timestamp: null == timestamp
            ? _value.timestamp
            : timestamp // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        signalSpot: freezed == signalSpot
            ? _value.signalSpot
            : signalSpot // ignore: cast_nullable_to_non_nullable
                  as SignalSpot?,
        data: freezed == data
            ? _value._data
            : data // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        priority: null == priority
            ? _value.priority
            : priority // ignore: cast_nullable_to_non_nullable
                  as int,
        metadata: freezed == metadata
            ? _value._metadata
            : metadata // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$FeedItemImpl implements _FeedItem {
  const _$FeedItemImpl({
    required this.id,
    required this.type,
    required this.timestamp,
    this.signalSpot,
    final Map<String, dynamic>? data,
    this.priority = 0,
    final Map<String, dynamic>? metadata,
  }) : _data = data,
       _metadata = metadata;

  factory _$FeedItemImpl.fromJson(Map<String, dynamic> json) =>
      _$$FeedItemImplFromJson(json);

  @override
  final String id;
  @override
  final String type;
  // 'signal_spot', 'user_activity', 'trending'
  @override
  final DateTime timestamp;
  @override
  final SignalSpot? signalSpot;
  final Map<String, dynamic>? _data;
  @override
  Map<String, dynamic>? get data {
    final value = _data;
    if (value == null) return null;
    if (_data is EqualUnmodifiableMapView) return _data;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  @JsonKey()
  final int priority;
  final Map<String, dynamic>? _metadata;
  @override
  Map<String, dynamic>? get metadata {
    final value = _metadata;
    if (value == null) return null;
    if (_metadata is EqualUnmodifiableMapView) return _metadata;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  String toString() {
    return 'FeedItem(id: $id, type: $type, timestamp: $timestamp, signalSpot: $signalSpot, data: $data, priority: $priority, metadata: $metadata)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FeedItemImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.timestamp, timestamp) ||
                other.timestamp == timestamp) &&
            (identical(other.signalSpot, signalSpot) ||
                other.signalSpot == signalSpot) &&
            const DeepCollectionEquality().equals(other._data, _data) &&
            (identical(other.priority, priority) ||
                other.priority == priority) &&
            const DeepCollectionEquality().equals(other._metadata, _metadata));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    type,
    timestamp,
    signalSpot,
    const DeepCollectionEquality().hash(_data),
    priority,
    const DeepCollectionEquality().hash(_metadata),
  );

  /// Create a copy of FeedItem
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FeedItemImplCopyWith<_$FeedItemImpl> get copyWith =>
      __$$FeedItemImplCopyWithImpl<_$FeedItemImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$FeedItemImplToJson(this);
  }
}

abstract class _FeedItem implements FeedItem {
  const factory _FeedItem({
    required final String id,
    required final String type,
    required final DateTime timestamp,
    final SignalSpot? signalSpot,
    final Map<String, dynamic>? data,
    final int priority,
    final Map<String, dynamic>? metadata,
  }) = _$FeedItemImpl;

  factory _FeedItem.fromJson(Map<String, dynamic> json) =
      _$FeedItemImpl.fromJson;

  @override
  String get id;
  @override
  String get type; // 'signal_spot', 'user_activity', 'trending'
  @override
  DateTime get timestamp;
  @override
  SignalSpot? get signalSpot;
  @override
  Map<String, dynamic>? get data;
  @override
  int get priority;
  @override
  Map<String, dynamic>? get metadata;

  /// Create a copy of FeedItem
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FeedItemImplCopyWith<_$FeedItemImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

FeedResponse _$FeedResponseFromJson(Map<String, dynamic> json) {
  return _FeedResponse.fromJson(json);
}

/// @nodoc
mixin _$FeedResponse {
  List<FeedItem> get items => throw _privateConstructorUsedError;
  int get count => throw _privateConstructorUsedError;
  bool get hasMore => throw _privateConstructorUsedError;
  String? get nextCursor => throw _privateConstructorUsedError;
  Map<String, dynamic>? get metadata => throw _privateConstructorUsedError;

  /// Serializes this FeedResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of FeedResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FeedResponseCopyWith<FeedResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FeedResponseCopyWith<$Res> {
  factory $FeedResponseCopyWith(
    FeedResponse value,
    $Res Function(FeedResponse) then,
  ) = _$FeedResponseCopyWithImpl<$Res, FeedResponse>;
  @useResult
  $Res call({
    List<FeedItem> items,
    int count,
    bool hasMore,
    String? nextCursor,
    Map<String, dynamic>? metadata,
  });
}

/// @nodoc
class _$FeedResponseCopyWithImpl<$Res, $Val extends FeedResponse>
    implements $FeedResponseCopyWith<$Res> {
  _$FeedResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of FeedResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? items = null,
    Object? count = null,
    Object? hasMore = null,
    Object? nextCursor = freezed,
    Object? metadata = freezed,
  }) {
    return _then(
      _value.copyWith(
            items: null == items
                ? _value.items
                : items // ignore: cast_nullable_to_non_nullable
                      as List<FeedItem>,
            count: null == count
                ? _value.count
                : count // ignore: cast_nullable_to_non_nullable
                      as int,
            hasMore: null == hasMore
                ? _value.hasMore
                : hasMore // ignore: cast_nullable_to_non_nullable
                      as bool,
            nextCursor: freezed == nextCursor
                ? _value.nextCursor
                : nextCursor // ignore: cast_nullable_to_non_nullable
                      as String?,
            metadata: freezed == metadata
                ? _value.metadata
                : metadata // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$FeedResponseImplCopyWith<$Res>
    implements $FeedResponseCopyWith<$Res> {
  factory _$$FeedResponseImplCopyWith(
    _$FeedResponseImpl value,
    $Res Function(_$FeedResponseImpl) then,
  ) = __$$FeedResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    List<FeedItem> items,
    int count,
    bool hasMore,
    String? nextCursor,
    Map<String, dynamic>? metadata,
  });
}

/// @nodoc
class __$$FeedResponseImplCopyWithImpl<$Res>
    extends _$FeedResponseCopyWithImpl<$Res, _$FeedResponseImpl>
    implements _$$FeedResponseImplCopyWith<$Res> {
  __$$FeedResponseImplCopyWithImpl(
    _$FeedResponseImpl _value,
    $Res Function(_$FeedResponseImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of FeedResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? items = null,
    Object? count = null,
    Object? hasMore = null,
    Object? nextCursor = freezed,
    Object? metadata = freezed,
  }) {
    return _then(
      _$FeedResponseImpl(
        items: null == items
            ? _value._items
            : items // ignore: cast_nullable_to_non_nullable
                  as List<FeedItem>,
        count: null == count
            ? _value.count
            : count // ignore: cast_nullable_to_non_nullable
                  as int,
        hasMore: null == hasMore
            ? _value.hasMore
            : hasMore // ignore: cast_nullable_to_non_nullable
                  as bool,
        nextCursor: freezed == nextCursor
            ? _value.nextCursor
            : nextCursor // ignore: cast_nullable_to_non_nullable
                  as String?,
        metadata: freezed == metadata
            ? _value._metadata
            : metadata // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$FeedResponseImpl implements _FeedResponse {
  const _$FeedResponseImpl({
    required final List<FeedItem> items,
    required this.count,
    required this.hasMore,
    this.nextCursor,
    final Map<String, dynamic>? metadata,
  }) : _items = items,
       _metadata = metadata;

  factory _$FeedResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$FeedResponseImplFromJson(json);

  final List<FeedItem> _items;
  @override
  List<FeedItem> get items {
    if (_items is EqualUnmodifiableListView) return _items;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_items);
  }

  @override
  final int count;
  @override
  final bool hasMore;
  @override
  final String? nextCursor;
  final Map<String, dynamic>? _metadata;
  @override
  Map<String, dynamic>? get metadata {
    final value = _metadata;
    if (value == null) return null;
    if (_metadata is EqualUnmodifiableMapView) return _metadata;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  String toString() {
    return 'FeedResponse(items: $items, count: $count, hasMore: $hasMore, nextCursor: $nextCursor, metadata: $metadata)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FeedResponseImpl &&
            const DeepCollectionEquality().equals(other._items, _items) &&
            (identical(other.count, count) || other.count == count) &&
            (identical(other.hasMore, hasMore) || other.hasMore == hasMore) &&
            (identical(other.nextCursor, nextCursor) ||
                other.nextCursor == nextCursor) &&
            const DeepCollectionEquality().equals(other._metadata, _metadata));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    const DeepCollectionEquality().hash(_items),
    count,
    hasMore,
    nextCursor,
    const DeepCollectionEquality().hash(_metadata),
  );

  /// Create a copy of FeedResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FeedResponseImplCopyWith<_$FeedResponseImpl> get copyWith =>
      __$$FeedResponseImplCopyWithImpl<_$FeedResponseImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$FeedResponseImplToJson(this);
  }
}

abstract class _FeedResponse implements FeedResponse {
  const factory _FeedResponse({
    required final List<FeedItem> items,
    required final int count,
    required final bool hasMore,
    final String? nextCursor,
    final Map<String, dynamic>? metadata,
  }) = _$FeedResponseImpl;

  factory _FeedResponse.fromJson(Map<String, dynamic> json) =
      _$FeedResponseImpl.fromJson;

  @override
  List<FeedItem> get items;
  @override
  int get count;
  @override
  bool get hasMore;
  @override
  String? get nextCursor;
  @override
  Map<String, dynamic>? get metadata;

  /// Create a copy of FeedResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FeedResponseImplCopyWith<_$FeedResponseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

FeedQuery _$FeedQueryFromJson(Map<String, dynamic> json) {
  return _FeedQuery.fromJson(json);
}

/// @nodoc
mixin _$FeedQuery {
  int get limit => throw _privateConstructorUsedError;
  int get offset => throw _privateConstructorUsedError;
  String? get cursor => throw _privateConstructorUsedError;
  String? get type => throw _privateConstructorUsedError;
  double? get latitude => throw _privateConstructorUsedError;
  double? get longitude => throw _privateConstructorUsedError;
  double get radiusMeters => throw _privateConstructorUsedError;

  /// Serializes this FeedQuery to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of FeedQuery
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $FeedQueryCopyWith<FeedQuery> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $FeedQueryCopyWith<$Res> {
  factory $FeedQueryCopyWith(FeedQuery value, $Res Function(FeedQuery) then) =
      _$FeedQueryCopyWithImpl<$Res, FeedQuery>;
  @useResult
  $Res call({
    int limit,
    int offset,
    String? cursor,
    String? type,
    double? latitude,
    double? longitude,
    double radiusMeters,
  });
}

/// @nodoc
class _$FeedQueryCopyWithImpl<$Res, $Val extends FeedQuery>
    implements $FeedQueryCopyWith<$Res> {
  _$FeedQueryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of FeedQuery
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? limit = null,
    Object? offset = null,
    Object? cursor = freezed,
    Object? type = freezed,
    Object? latitude = freezed,
    Object? longitude = freezed,
    Object? radiusMeters = null,
  }) {
    return _then(
      _value.copyWith(
            limit: null == limit
                ? _value.limit
                : limit // ignore: cast_nullable_to_non_nullable
                      as int,
            offset: null == offset
                ? _value.offset
                : offset // ignore: cast_nullable_to_non_nullable
                      as int,
            cursor: freezed == cursor
                ? _value.cursor
                : cursor // ignore: cast_nullable_to_non_nullable
                      as String?,
            type: freezed == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as String?,
            latitude: freezed == latitude
                ? _value.latitude
                : latitude // ignore: cast_nullable_to_non_nullable
                      as double?,
            longitude: freezed == longitude
                ? _value.longitude
                : longitude // ignore: cast_nullable_to_non_nullable
                      as double?,
            radiusMeters: null == radiusMeters
                ? _value.radiusMeters
                : radiusMeters // ignore: cast_nullable_to_non_nullable
                      as double,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$FeedQueryImplCopyWith<$Res>
    implements $FeedQueryCopyWith<$Res> {
  factory _$$FeedQueryImplCopyWith(
    _$FeedQueryImpl value,
    $Res Function(_$FeedQueryImpl) then,
  ) = __$$FeedQueryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int limit,
    int offset,
    String? cursor,
    String? type,
    double? latitude,
    double? longitude,
    double radiusMeters,
  });
}

/// @nodoc
class __$$FeedQueryImplCopyWithImpl<$Res>
    extends _$FeedQueryCopyWithImpl<$Res, _$FeedQueryImpl>
    implements _$$FeedQueryImplCopyWith<$Res> {
  __$$FeedQueryImplCopyWithImpl(
    _$FeedQueryImpl _value,
    $Res Function(_$FeedQueryImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of FeedQuery
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? limit = null,
    Object? offset = null,
    Object? cursor = freezed,
    Object? type = freezed,
    Object? latitude = freezed,
    Object? longitude = freezed,
    Object? radiusMeters = null,
  }) {
    return _then(
      _$FeedQueryImpl(
        limit: null == limit
            ? _value.limit
            : limit // ignore: cast_nullable_to_non_nullable
                  as int,
        offset: null == offset
            ? _value.offset
            : offset // ignore: cast_nullable_to_non_nullable
                  as int,
        cursor: freezed == cursor
            ? _value.cursor
            : cursor // ignore: cast_nullable_to_non_nullable
                  as String?,
        type: freezed == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as String?,
        latitude: freezed == latitude
            ? _value.latitude
            : latitude // ignore: cast_nullable_to_non_nullable
                  as double?,
        longitude: freezed == longitude
            ? _value.longitude
            : longitude // ignore: cast_nullable_to_non_nullable
                  as double?,
        radiusMeters: null == radiusMeters
            ? _value.radiusMeters
            : radiusMeters // ignore: cast_nullable_to_non_nullable
                  as double,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$FeedQueryImpl implements _FeedQuery {
  const _$FeedQueryImpl({
    this.limit = 20,
    this.offset = 0,
    this.cursor,
    this.type,
    this.latitude,
    this.longitude,
    this.radiusMeters = 5000,
  });

  factory _$FeedQueryImpl.fromJson(Map<String, dynamic> json) =>
      _$$FeedQueryImplFromJson(json);

  @override
  @JsonKey()
  final int limit;
  @override
  @JsonKey()
  final int offset;
  @override
  final String? cursor;
  @override
  final String? type;
  @override
  final double? latitude;
  @override
  final double? longitude;
  @override
  @JsonKey()
  final double radiusMeters;

  @override
  String toString() {
    return 'FeedQuery(limit: $limit, offset: $offset, cursor: $cursor, type: $type, latitude: $latitude, longitude: $longitude, radiusMeters: $radiusMeters)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$FeedQueryImpl &&
            (identical(other.limit, limit) || other.limit == limit) &&
            (identical(other.offset, offset) || other.offset == offset) &&
            (identical(other.cursor, cursor) || other.cursor == cursor) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.latitude, latitude) ||
                other.latitude == latitude) &&
            (identical(other.longitude, longitude) ||
                other.longitude == longitude) &&
            (identical(other.radiusMeters, radiusMeters) ||
                other.radiusMeters == radiusMeters));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    limit,
    offset,
    cursor,
    type,
    latitude,
    longitude,
    radiusMeters,
  );

  /// Create a copy of FeedQuery
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$FeedQueryImplCopyWith<_$FeedQueryImpl> get copyWith =>
      __$$FeedQueryImplCopyWithImpl<_$FeedQueryImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$FeedQueryImplToJson(this);
  }
}

abstract class _FeedQuery implements FeedQuery {
  const factory _FeedQuery({
    final int limit,
    final int offset,
    final String? cursor,
    final String? type,
    final double? latitude,
    final double? longitude,
    final double radiusMeters,
  }) = _$FeedQueryImpl;

  factory _FeedQuery.fromJson(Map<String, dynamic> json) =
      _$FeedQueryImpl.fromJson;

  @override
  int get limit;
  @override
  int get offset;
  @override
  String? get cursor;
  @override
  String? get type;
  @override
  double? get latitude;
  @override
  double? get longitude;
  @override
  double get radiusMeters;

  /// Create a copy of FeedQuery
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$FeedQueryImplCopyWith<_$FeedQueryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

TrendingTag _$TrendingTagFromJson(Map<String, dynamic> json) {
  return _TrendingTag.fromJson(json);
}

/// @nodoc
mixin _$TrendingTag {
  String get tag => throw _privateConstructorUsedError;
  int get count => throw _privateConstructorUsedError;
  double get trendScore => throw _privateConstructorUsedError;
  bool get isRising => throw _privateConstructorUsedError;

  /// Serializes this TrendingTag to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of TrendingTag
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $TrendingTagCopyWith<TrendingTag> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $TrendingTagCopyWith<$Res> {
  factory $TrendingTagCopyWith(
    TrendingTag value,
    $Res Function(TrendingTag) then,
  ) = _$TrendingTagCopyWithImpl<$Res, TrendingTag>;
  @useResult
  $Res call({String tag, int count, double trendScore, bool isRising});
}

/// @nodoc
class _$TrendingTagCopyWithImpl<$Res, $Val extends TrendingTag>
    implements $TrendingTagCopyWith<$Res> {
  _$TrendingTagCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of TrendingTag
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? tag = null,
    Object? count = null,
    Object? trendScore = null,
    Object? isRising = null,
  }) {
    return _then(
      _value.copyWith(
            tag: null == tag
                ? _value.tag
                : tag // ignore: cast_nullable_to_non_nullable
                      as String,
            count: null == count
                ? _value.count
                : count // ignore: cast_nullable_to_non_nullable
                      as int,
            trendScore: null == trendScore
                ? _value.trendScore
                : trendScore // ignore: cast_nullable_to_non_nullable
                      as double,
            isRising: null == isRising
                ? _value.isRising
                : isRising // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$TrendingTagImplCopyWith<$Res>
    implements $TrendingTagCopyWith<$Res> {
  factory _$$TrendingTagImplCopyWith(
    _$TrendingTagImpl value,
    $Res Function(_$TrendingTagImpl) then,
  ) = __$$TrendingTagImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String tag, int count, double trendScore, bool isRising});
}

/// @nodoc
class __$$TrendingTagImplCopyWithImpl<$Res>
    extends _$TrendingTagCopyWithImpl<$Res, _$TrendingTagImpl>
    implements _$$TrendingTagImplCopyWith<$Res> {
  __$$TrendingTagImplCopyWithImpl(
    _$TrendingTagImpl _value,
    $Res Function(_$TrendingTagImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of TrendingTag
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? tag = null,
    Object? count = null,
    Object? trendScore = null,
    Object? isRising = null,
  }) {
    return _then(
      _$TrendingTagImpl(
        tag: null == tag
            ? _value.tag
            : tag // ignore: cast_nullable_to_non_nullable
                  as String,
        count: null == count
            ? _value.count
            : count // ignore: cast_nullable_to_non_nullable
                  as int,
        trendScore: null == trendScore
            ? _value.trendScore
            : trendScore // ignore: cast_nullable_to_non_nullable
                  as double,
        isRising: null == isRising
            ? _value.isRising
            : isRising // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$TrendingTagImpl implements _TrendingTag {
  const _$TrendingTagImpl({
    required this.tag,
    required this.count,
    required this.trendScore,
    this.isRising = false,
  });

  factory _$TrendingTagImpl.fromJson(Map<String, dynamic> json) =>
      _$$TrendingTagImplFromJson(json);

  @override
  final String tag;
  @override
  final int count;
  @override
  final double trendScore;
  @override
  @JsonKey()
  final bool isRising;

  @override
  String toString() {
    return 'TrendingTag(tag: $tag, count: $count, trendScore: $trendScore, isRising: $isRising)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$TrendingTagImpl &&
            (identical(other.tag, tag) || other.tag == tag) &&
            (identical(other.count, count) || other.count == count) &&
            (identical(other.trendScore, trendScore) ||
                other.trendScore == trendScore) &&
            (identical(other.isRising, isRising) ||
                other.isRising == isRising));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode =>
      Object.hash(runtimeType, tag, count, trendScore, isRising);

  /// Create a copy of TrendingTag
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$TrendingTagImplCopyWith<_$TrendingTagImpl> get copyWith =>
      __$$TrendingTagImplCopyWithImpl<_$TrendingTagImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$TrendingTagImplToJson(this);
  }
}

abstract class _TrendingTag implements TrendingTag {
  const factory _TrendingTag({
    required final String tag,
    required final int count,
    required final double trendScore,
    final bool isRising,
  }) = _$TrendingTagImpl;

  factory _TrendingTag.fromJson(Map<String, dynamic> json) =
      _$TrendingTagImpl.fromJson;

  @override
  String get tag;
  @override
  int get count;
  @override
  double get trendScore;
  @override
  bool get isRising;

  /// Create a copy of TrendingTag
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$TrendingTagImplCopyWith<_$TrendingTagImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

RecommendedUser _$RecommendedUserFromJson(Map<String, dynamic> json) {
  return _RecommendedUser.fromJson(json);
}

/// @nodoc
mixin _$RecommendedUser {
  String get id => throw _privateConstructorUsedError;
  String get username => throw _privateConstructorUsedError;
  String? get displayName => throw _privateConstructorUsedError;
  String? get avatarUrl => throw _privateConstructorUsedError;
  double get matchScore => throw _privateConstructorUsedError;
  List<String>? get commonInterests => throw _privateConstructorUsedError;
  String? get reason => throw _privateConstructorUsedError;

  /// Serializes this RecommendedUser to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of RecommendedUser
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $RecommendedUserCopyWith<RecommendedUser> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $RecommendedUserCopyWith<$Res> {
  factory $RecommendedUserCopyWith(
    RecommendedUser value,
    $Res Function(RecommendedUser) then,
  ) = _$RecommendedUserCopyWithImpl<$Res, RecommendedUser>;
  @useResult
  $Res call({
    String id,
    String username,
    String? displayName,
    String? avatarUrl,
    double matchScore,
    List<String>? commonInterests,
    String? reason,
  });
}

/// @nodoc
class _$RecommendedUserCopyWithImpl<$Res, $Val extends RecommendedUser>
    implements $RecommendedUserCopyWith<$Res> {
  _$RecommendedUserCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of RecommendedUser
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? username = null,
    Object? displayName = freezed,
    Object? avatarUrl = freezed,
    Object? matchScore = null,
    Object? commonInterests = freezed,
    Object? reason = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            username: null == username
                ? _value.username
                : username // ignore: cast_nullable_to_non_nullable
                      as String,
            displayName: freezed == displayName
                ? _value.displayName
                : displayName // ignore: cast_nullable_to_non_nullable
                      as String?,
            avatarUrl: freezed == avatarUrl
                ? _value.avatarUrl
                : avatarUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            matchScore: null == matchScore
                ? _value.matchScore
                : matchScore // ignore: cast_nullable_to_non_nullable
                      as double,
            commonInterests: freezed == commonInterests
                ? _value.commonInterests
                : commonInterests // ignore: cast_nullable_to_non_nullable
                      as List<String>?,
            reason: freezed == reason
                ? _value.reason
                : reason // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$RecommendedUserImplCopyWith<$Res>
    implements $RecommendedUserCopyWith<$Res> {
  factory _$$RecommendedUserImplCopyWith(
    _$RecommendedUserImpl value,
    $Res Function(_$RecommendedUserImpl) then,
  ) = __$$RecommendedUserImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String username,
    String? displayName,
    String? avatarUrl,
    double matchScore,
    List<String>? commonInterests,
    String? reason,
  });
}

/// @nodoc
class __$$RecommendedUserImplCopyWithImpl<$Res>
    extends _$RecommendedUserCopyWithImpl<$Res, _$RecommendedUserImpl>
    implements _$$RecommendedUserImplCopyWith<$Res> {
  __$$RecommendedUserImplCopyWithImpl(
    _$RecommendedUserImpl _value,
    $Res Function(_$RecommendedUserImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of RecommendedUser
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? username = null,
    Object? displayName = freezed,
    Object? avatarUrl = freezed,
    Object? matchScore = null,
    Object? commonInterests = freezed,
    Object? reason = freezed,
  }) {
    return _then(
      _$RecommendedUserImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        username: null == username
            ? _value.username
            : username // ignore: cast_nullable_to_non_nullable
                  as String,
        displayName: freezed == displayName
            ? _value.displayName
            : displayName // ignore: cast_nullable_to_non_nullable
                  as String?,
        avatarUrl: freezed == avatarUrl
            ? _value.avatarUrl
            : avatarUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        matchScore: null == matchScore
            ? _value.matchScore
            : matchScore // ignore: cast_nullable_to_non_nullable
                  as double,
        commonInterests: freezed == commonInterests
            ? _value._commonInterests
            : commonInterests // ignore: cast_nullable_to_non_nullable
                  as List<String>?,
        reason: freezed == reason
            ? _value.reason
            : reason // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$RecommendedUserImpl implements _RecommendedUser {
  const _$RecommendedUserImpl({
    required this.id,
    required this.username,
    this.displayName,
    this.avatarUrl,
    required this.matchScore,
    final List<String>? commonInterests,
    this.reason,
  }) : _commonInterests = commonInterests;

  factory _$RecommendedUserImpl.fromJson(Map<String, dynamic> json) =>
      _$$RecommendedUserImplFromJson(json);

  @override
  final String id;
  @override
  final String username;
  @override
  final String? displayName;
  @override
  final String? avatarUrl;
  @override
  final double matchScore;
  final List<String>? _commonInterests;
  @override
  List<String>? get commonInterests {
    final value = _commonInterests;
    if (value == null) return null;
    if (_commonInterests is EqualUnmodifiableListView) return _commonInterests;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(value);
  }

  @override
  final String? reason;

  @override
  String toString() {
    return 'RecommendedUser(id: $id, username: $username, displayName: $displayName, avatarUrl: $avatarUrl, matchScore: $matchScore, commonInterests: $commonInterests, reason: $reason)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$RecommendedUserImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.username, username) ||
                other.username == username) &&
            (identical(other.displayName, displayName) ||
                other.displayName == displayName) &&
            (identical(other.avatarUrl, avatarUrl) ||
                other.avatarUrl == avatarUrl) &&
            (identical(other.matchScore, matchScore) ||
                other.matchScore == matchScore) &&
            const DeepCollectionEquality().equals(
              other._commonInterests,
              _commonInterests,
            ) &&
            (identical(other.reason, reason) || other.reason == reason));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    username,
    displayName,
    avatarUrl,
    matchScore,
    const DeepCollectionEquality().hash(_commonInterests),
    reason,
  );

  /// Create a copy of RecommendedUser
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$RecommendedUserImplCopyWith<_$RecommendedUserImpl> get copyWith =>
      __$$RecommendedUserImplCopyWithImpl<_$RecommendedUserImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$RecommendedUserImplToJson(this);
  }
}

abstract class _RecommendedUser implements RecommendedUser {
  const factory _RecommendedUser({
    required final String id,
    required final String username,
    final String? displayName,
    final String? avatarUrl,
    required final double matchScore,
    final List<String>? commonInterests,
    final String? reason,
  }) = _$RecommendedUserImpl;

  factory _RecommendedUser.fromJson(Map<String, dynamic> json) =
      _$RecommendedUserImpl.fromJson;

  @override
  String get id;
  @override
  String get username;
  @override
  String? get displayName;
  @override
  String? get avatarUrl;
  @override
  double get matchScore;
  @override
  List<String>? get commonInterests;
  @override
  String? get reason;

  /// Create a copy of RecommendedUser
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$RecommendedUserImplCopyWith<_$RecommendedUserImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
