// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'location.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Location _$LocationFromJson(Map<String, dynamic> json) {
  return _Location.fromJson(json);
}

/// @nodoc
mixin _$Location {
  String get id => throw _privateConstructorUsedError;
  String get userId => throw _privateConstructorUsedError;
  double get latitude => throw _privateConstructorUsedError;
  double get longitude => throw _privateConstructorUsedError;
  DateTime get timestamp => throw _privateConstructorUsedError;
  double? get accuracy => throw _privateConstructorUsedError;
  double? get altitude => throw _privateConstructorUsedError;
  double? get speed => throw _privateConstructorUsedError;
  String? get address => throw _privateConstructorUsedError;
  bool get isActive => throw _privateConstructorUsedError;
  Map<String, dynamic>? get metadata => throw _privateConstructorUsedError;

  /// Serializes this Location to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Location
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LocationCopyWith<Location> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LocationCopyWith<$Res> {
  factory $LocationCopyWith(Location value, $Res Function(Location) then) =
      _$LocationCopyWithImpl<$Res, Location>;
  @useResult
  $Res call({
    String id,
    String userId,
    double latitude,
    double longitude,
    DateTime timestamp,
    double? accuracy,
    double? altitude,
    double? speed,
    String? address,
    bool isActive,
    Map<String, dynamic>? metadata,
  });
}

/// @nodoc
class _$LocationCopyWithImpl<$Res, $Val extends Location>
    implements $LocationCopyWith<$Res> {
  _$LocationCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Location
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? latitude = null,
    Object? longitude = null,
    Object? timestamp = null,
    Object? accuracy = freezed,
    Object? altitude = freezed,
    Object? speed = freezed,
    Object? address = freezed,
    Object? isActive = null,
    Object? metadata = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            userId: null == userId
                ? _value.userId
                : userId // ignore: cast_nullable_to_non_nullable
                      as String,
            latitude: null == latitude
                ? _value.latitude
                : latitude // ignore: cast_nullable_to_non_nullable
                      as double,
            longitude: null == longitude
                ? _value.longitude
                : longitude // ignore: cast_nullable_to_non_nullable
                      as double,
            timestamp: null == timestamp
                ? _value.timestamp
                : timestamp // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            accuracy: freezed == accuracy
                ? _value.accuracy
                : accuracy // ignore: cast_nullable_to_non_nullable
                      as double?,
            altitude: freezed == altitude
                ? _value.altitude
                : altitude // ignore: cast_nullable_to_non_nullable
                      as double?,
            speed: freezed == speed
                ? _value.speed
                : speed // ignore: cast_nullable_to_non_nullable
                      as double?,
            address: freezed == address
                ? _value.address
                : address // ignore: cast_nullable_to_non_nullable
                      as String?,
            isActive: null == isActive
                ? _value.isActive
                : isActive // ignore: cast_nullable_to_non_nullable
                      as bool,
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
abstract class _$$LocationImplCopyWith<$Res>
    implements $LocationCopyWith<$Res> {
  factory _$$LocationImplCopyWith(
    _$LocationImpl value,
    $Res Function(_$LocationImpl) then,
  ) = __$$LocationImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String userId,
    double latitude,
    double longitude,
    DateTime timestamp,
    double? accuracy,
    double? altitude,
    double? speed,
    String? address,
    bool isActive,
    Map<String, dynamic>? metadata,
  });
}

/// @nodoc
class __$$LocationImplCopyWithImpl<$Res>
    extends _$LocationCopyWithImpl<$Res, _$LocationImpl>
    implements _$$LocationImplCopyWith<$Res> {
  __$$LocationImplCopyWithImpl(
    _$LocationImpl _value,
    $Res Function(_$LocationImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Location
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? latitude = null,
    Object? longitude = null,
    Object? timestamp = null,
    Object? accuracy = freezed,
    Object? altitude = freezed,
    Object? speed = freezed,
    Object? address = freezed,
    Object? isActive = null,
    Object? metadata = freezed,
  }) {
    return _then(
      _$LocationImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        userId: null == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as String,
        latitude: null == latitude
            ? _value.latitude
            : latitude // ignore: cast_nullable_to_non_nullable
                  as double,
        longitude: null == longitude
            ? _value.longitude
            : longitude // ignore: cast_nullable_to_non_nullable
                  as double,
        timestamp: null == timestamp
            ? _value.timestamp
            : timestamp // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        accuracy: freezed == accuracy
            ? _value.accuracy
            : accuracy // ignore: cast_nullable_to_non_nullable
                  as double?,
        altitude: freezed == altitude
            ? _value.altitude
            : altitude // ignore: cast_nullable_to_non_nullable
                  as double?,
        speed: freezed == speed
            ? _value.speed
            : speed // ignore: cast_nullable_to_non_nullable
                  as double?,
        address: freezed == address
            ? _value.address
            : address // ignore: cast_nullable_to_non_nullable
                  as String?,
        isActive: null == isActive
            ? _value.isActive
            : isActive // ignore: cast_nullable_to_non_nullable
                  as bool,
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
class _$LocationImpl implements _Location {
  const _$LocationImpl({
    required this.id,
    required this.userId,
    required this.latitude,
    required this.longitude,
    required this.timestamp,
    this.accuracy,
    this.altitude,
    this.speed,
    this.address,
    this.isActive = true,
    final Map<String, dynamic>? metadata,
  }) : _metadata = metadata;

  factory _$LocationImpl.fromJson(Map<String, dynamic> json) =>
      _$$LocationImplFromJson(json);

  @override
  final String id;
  @override
  final String userId;
  @override
  final double latitude;
  @override
  final double longitude;
  @override
  final DateTime timestamp;
  @override
  final double? accuracy;
  @override
  final double? altitude;
  @override
  final double? speed;
  @override
  final String? address;
  @override
  @JsonKey()
  final bool isActive;
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
    return 'Location(id: $id, userId: $userId, latitude: $latitude, longitude: $longitude, timestamp: $timestamp, accuracy: $accuracy, altitude: $altitude, speed: $speed, address: $address, isActive: $isActive, metadata: $metadata)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LocationImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.latitude, latitude) ||
                other.latitude == latitude) &&
            (identical(other.longitude, longitude) ||
                other.longitude == longitude) &&
            (identical(other.timestamp, timestamp) ||
                other.timestamp == timestamp) &&
            (identical(other.accuracy, accuracy) ||
                other.accuracy == accuracy) &&
            (identical(other.altitude, altitude) ||
                other.altitude == altitude) &&
            (identical(other.speed, speed) || other.speed == speed) &&
            (identical(other.address, address) || other.address == address) &&
            (identical(other.isActive, isActive) ||
                other.isActive == isActive) &&
            const DeepCollectionEquality().equals(other._metadata, _metadata));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    userId,
    latitude,
    longitude,
    timestamp,
    accuracy,
    altitude,
    speed,
    address,
    isActive,
    const DeepCollectionEquality().hash(_metadata),
  );

  /// Create a copy of Location
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LocationImplCopyWith<_$LocationImpl> get copyWith =>
      __$$LocationImplCopyWithImpl<_$LocationImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LocationImplToJson(this);
  }
}

abstract class _Location implements Location {
  const factory _Location({
    required final String id,
    required final String userId,
    required final double latitude,
    required final double longitude,
    required final DateTime timestamp,
    final double? accuracy,
    final double? altitude,
    final double? speed,
    final String? address,
    final bool isActive,
    final Map<String, dynamic>? metadata,
  }) = _$LocationImpl;

  factory _Location.fromJson(Map<String, dynamic> json) =
      _$LocationImpl.fromJson;

  @override
  String get id;
  @override
  String get userId;
  @override
  double get latitude;
  @override
  double get longitude;
  @override
  DateTime get timestamp;
  @override
  double? get accuracy;
  @override
  double? get altitude;
  @override
  double? get speed;
  @override
  String? get address;
  @override
  bool get isActive;
  @override
  Map<String, dynamic>? get metadata;

  /// Create a copy of Location
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LocationImplCopyWith<_$LocationImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CreateLocationRequest _$CreateLocationRequestFromJson(
  Map<String, dynamic> json,
) {
  return _CreateLocationRequest.fromJson(json);
}

/// @nodoc
mixin _$CreateLocationRequest {
  double get latitude => throw _privateConstructorUsedError;
  double get longitude => throw _privateConstructorUsedError;
  double? get accuracy => throw _privateConstructorUsedError;
  double? get altitude => throw _privateConstructorUsedError;
  double? get speed => throw _privateConstructorUsedError;
  String? get address => throw _privateConstructorUsedError;

  /// Serializes this CreateLocationRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreateLocationRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreateLocationRequestCopyWith<CreateLocationRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreateLocationRequestCopyWith<$Res> {
  factory $CreateLocationRequestCopyWith(
    CreateLocationRequest value,
    $Res Function(CreateLocationRequest) then,
  ) = _$CreateLocationRequestCopyWithImpl<$Res, CreateLocationRequest>;
  @useResult
  $Res call({
    double latitude,
    double longitude,
    double? accuracy,
    double? altitude,
    double? speed,
    String? address,
  });
}

/// @nodoc
class _$CreateLocationRequestCopyWithImpl<
  $Res,
  $Val extends CreateLocationRequest
>
    implements $CreateLocationRequestCopyWith<$Res> {
  _$CreateLocationRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreateLocationRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? latitude = null,
    Object? longitude = null,
    Object? accuracy = freezed,
    Object? altitude = freezed,
    Object? speed = freezed,
    Object? address = freezed,
  }) {
    return _then(
      _value.copyWith(
            latitude: null == latitude
                ? _value.latitude
                : latitude // ignore: cast_nullable_to_non_nullable
                      as double,
            longitude: null == longitude
                ? _value.longitude
                : longitude // ignore: cast_nullable_to_non_nullable
                      as double,
            accuracy: freezed == accuracy
                ? _value.accuracy
                : accuracy // ignore: cast_nullable_to_non_nullable
                      as double?,
            altitude: freezed == altitude
                ? _value.altitude
                : altitude // ignore: cast_nullable_to_non_nullable
                      as double?,
            speed: freezed == speed
                ? _value.speed
                : speed // ignore: cast_nullable_to_non_nullable
                      as double?,
            address: freezed == address
                ? _value.address
                : address // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CreateLocationRequestImplCopyWith<$Res>
    implements $CreateLocationRequestCopyWith<$Res> {
  factory _$$CreateLocationRequestImplCopyWith(
    _$CreateLocationRequestImpl value,
    $Res Function(_$CreateLocationRequestImpl) then,
  ) = __$$CreateLocationRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    double latitude,
    double longitude,
    double? accuracy,
    double? altitude,
    double? speed,
    String? address,
  });
}

/// @nodoc
class __$$CreateLocationRequestImplCopyWithImpl<$Res>
    extends
        _$CreateLocationRequestCopyWithImpl<$Res, _$CreateLocationRequestImpl>
    implements _$$CreateLocationRequestImplCopyWith<$Res> {
  __$$CreateLocationRequestImplCopyWithImpl(
    _$CreateLocationRequestImpl _value,
    $Res Function(_$CreateLocationRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CreateLocationRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? latitude = null,
    Object? longitude = null,
    Object? accuracy = freezed,
    Object? altitude = freezed,
    Object? speed = freezed,
    Object? address = freezed,
  }) {
    return _then(
      _$CreateLocationRequestImpl(
        latitude: null == latitude
            ? _value.latitude
            : latitude // ignore: cast_nullable_to_non_nullable
                  as double,
        longitude: null == longitude
            ? _value.longitude
            : longitude // ignore: cast_nullable_to_non_nullable
                  as double,
        accuracy: freezed == accuracy
            ? _value.accuracy
            : accuracy // ignore: cast_nullable_to_non_nullable
                  as double?,
        altitude: freezed == altitude
            ? _value.altitude
            : altitude // ignore: cast_nullable_to_non_nullable
                  as double?,
        speed: freezed == speed
            ? _value.speed
            : speed // ignore: cast_nullable_to_non_nullable
                  as double?,
        address: freezed == address
            ? _value.address
            : address // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CreateLocationRequestImpl implements _CreateLocationRequest {
  const _$CreateLocationRequestImpl({
    required this.latitude,
    required this.longitude,
    this.accuracy,
    this.altitude,
    this.speed,
    this.address,
  });

  factory _$CreateLocationRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreateLocationRequestImplFromJson(json);

  @override
  final double latitude;
  @override
  final double longitude;
  @override
  final double? accuracy;
  @override
  final double? altitude;
  @override
  final double? speed;
  @override
  final String? address;

  @override
  String toString() {
    return 'CreateLocationRequest(latitude: $latitude, longitude: $longitude, accuracy: $accuracy, altitude: $altitude, speed: $speed, address: $address)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreateLocationRequestImpl &&
            (identical(other.latitude, latitude) ||
                other.latitude == latitude) &&
            (identical(other.longitude, longitude) ||
                other.longitude == longitude) &&
            (identical(other.accuracy, accuracy) ||
                other.accuracy == accuracy) &&
            (identical(other.altitude, altitude) ||
                other.altitude == altitude) &&
            (identical(other.speed, speed) || other.speed == speed) &&
            (identical(other.address, address) || other.address == address));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    latitude,
    longitude,
    accuracy,
    altitude,
    speed,
    address,
  );

  /// Create a copy of CreateLocationRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreateLocationRequestImplCopyWith<_$CreateLocationRequestImpl>
  get copyWith =>
      __$$CreateLocationRequestImplCopyWithImpl<_$CreateLocationRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CreateLocationRequestImplToJson(this);
  }
}

abstract class _CreateLocationRequest implements CreateLocationRequest {
  const factory _CreateLocationRequest({
    required final double latitude,
    required final double longitude,
    final double? accuracy,
    final double? altitude,
    final double? speed,
    final String? address,
  }) = _$CreateLocationRequestImpl;

  factory _CreateLocationRequest.fromJson(Map<String, dynamic> json) =
      _$CreateLocationRequestImpl.fromJson;

  @override
  double get latitude;
  @override
  double get longitude;
  @override
  double? get accuracy;
  @override
  double? get altitude;
  @override
  double? get speed;
  @override
  String? get address;

  /// Create a copy of CreateLocationRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreateLocationRequestImplCopyWith<_$CreateLocationRequestImpl>
  get copyWith => throw _privateConstructorUsedError;
}

NearbyUsersQuery _$NearbyUsersQueryFromJson(Map<String, dynamic> json) {
  return _NearbyUsersQuery.fromJson(json);
}

/// @nodoc
mixin _$NearbyUsersQuery {
  double get latitude => throw _privateConstructorUsedError;
  double get longitude => throw _privateConstructorUsedError;
  double get radiusMeters => throw _privateConstructorUsedError;
  int get limit => throw _privateConstructorUsedError;
  int get offset => throw _privateConstructorUsedError;

  /// Serializes this NearbyUsersQuery to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of NearbyUsersQuery
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $NearbyUsersQueryCopyWith<NearbyUsersQuery> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $NearbyUsersQueryCopyWith<$Res> {
  factory $NearbyUsersQueryCopyWith(
    NearbyUsersQuery value,
    $Res Function(NearbyUsersQuery) then,
  ) = _$NearbyUsersQueryCopyWithImpl<$Res, NearbyUsersQuery>;
  @useResult
  $Res call({
    double latitude,
    double longitude,
    double radiusMeters,
    int limit,
    int offset,
  });
}

/// @nodoc
class _$NearbyUsersQueryCopyWithImpl<$Res, $Val extends NearbyUsersQuery>
    implements $NearbyUsersQueryCopyWith<$Res> {
  _$NearbyUsersQueryCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of NearbyUsersQuery
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? latitude = null,
    Object? longitude = null,
    Object? radiusMeters = null,
    Object? limit = null,
    Object? offset = null,
  }) {
    return _then(
      _value.copyWith(
            latitude: null == latitude
                ? _value.latitude
                : latitude // ignore: cast_nullable_to_non_nullable
                      as double,
            longitude: null == longitude
                ? _value.longitude
                : longitude // ignore: cast_nullable_to_non_nullable
                      as double,
            radiusMeters: null == radiusMeters
                ? _value.radiusMeters
                : radiusMeters // ignore: cast_nullable_to_non_nullable
                      as double,
            limit: null == limit
                ? _value.limit
                : limit // ignore: cast_nullable_to_non_nullable
                      as int,
            offset: null == offset
                ? _value.offset
                : offset // ignore: cast_nullable_to_non_nullable
                      as int,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$NearbyUsersQueryImplCopyWith<$Res>
    implements $NearbyUsersQueryCopyWith<$Res> {
  factory _$$NearbyUsersQueryImplCopyWith(
    _$NearbyUsersQueryImpl value,
    $Res Function(_$NearbyUsersQueryImpl) then,
  ) = __$$NearbyUsersQueryImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    double latitude,
    double longitude,
    double radiusMeters,
    int limit,
    int offset,
  });
}

/// @nodoc
class __$$NearbyUsersQueryImplCopyWithImpl<$Res>
    extends _$NearbyUsersQueryCopyWithImpl<$Res, _$NearbyUsersQueryImpl>
    implements _$$NearbyUsersQueryImplCopyWith<$Res> {
  __$$NearbyUsersQueryImplCopyWithImpl(
    _$NearbyUsersQueryImpl _value,
    $Res Function(_$NearbyUsersQueryImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of NearbyUsersQuery
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? latitude = null,
    Object? longitude = null,
    Object? radiusMeters = null,
    Object? limit = null,
    Object? offset = null,
  }) {
    return _then(
      _$NearbyUsersQueryImpl(
        latitude: null == latitude
            ? _value.latitude
            : latitude // ignore: cast_nullable_to_non_nullable
                  as double,
        longitude: null == longitude
            ? _value.longitude
            : longitude // ignore: cast_nullable_to_non_nullable
                  as double,
        radiusMeters: null == radiusMeters
            ? _value.radiusMeters
            : radiusMeters // ignore: cast_nullable_to_non_nullable
                  as double,
        limit: null == limit
            ? _value.limit
            : limit // ignore: cast_nullable_to_non_nullable
                  as int,
        offset: null == offset
            ? _value.offset
            : offset // ignore: cast_nullable_to_non_nullable
                  as int,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$NearbyUsersQueryImpl implements _NearbyUsersQuery {
  const _$NearbyUsersQueryImpl({
    required this.latitude,
    required this.longitude,
    this.radiusMeters = 1000,
    this.limit = 20,
    this.offset = 0,
  });

  factory _$NearbyUsersQueryImpl.fromJson(Map<String, dynamic> json) =>
      _$$NearbyUsersQueryImplFromJson(json);

  @override
  final double latitude;
  @override
  final double longitude;
  @override
  @JsonKey()
  final double radiusMeters;
  @override
  @JsonKey()
  final int limit;
  @override
  @JsonKey()
  final int offset;

  @override
  String toString() {
    return 'NearbyUsersQuery(latitude: $latitude, longitude: $longitude, radiusMeters: $radiusMeters, limit: $limit, offset: $offset)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$NearbyUsersQueryImpl &&
            (identical(other.latitude, latitude) ||
                other.latitude == latitude) &&
            (identical(other.longitude, longitude) ||
                other.longitude == longitude) &&
            (identical(other.radiusMeters, radiusMeters) ||
                other.radiusMeters == radiusMeters) &&
            (identical(other.limit, limit) || other.limit == limit) &&
            (identical(other.offset, offset) || other.offset == offset));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    latitude,
    longitude,
    radiusMeters,
    limit,
    offset,
  );

  /// Create a copy of NearbyUsersQuery
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$NearbyUsersQueryImplCopyWith<_$NearbyUsersQueryImpl> get copyWith =>
      __$$NearbyUsersQueryImplCopyWithImpl<_$NearbyUsersQueryImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$NearbyUsersQueryImplToJson(this);
  }
}

abstract class _NearbyUsersQuery implements NearbyUsersQuery {
  const factory _NearbyUsersQuery({
    required final double latitude,
    required final double longitude,
    final double radiusMeters,
    final int limit,
    final int offset,
  }) = _$NearbyUsersQueryImpl;

  factory _NearbyUsersQuery.fromJson(Map<String, dynamic> json) =
      _$NearbyUsersQueryImpl.fromJson;

  @override
  double get latitude;
  @override
  double get longitude;
  @override
  double get radiusMeters;
  @override
  int get limit;
  @override
  int get offset;

  /// Create a copy of NearbyUsersQuery
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$NearbyUsersQueryImplCopyWith<_$NearbyUsersQueryImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

LocationStats _$LocationStatsFromJson(Map<String, dynamic> json) {
  return _LocationStats.fromJson(json);
}

/// @nodoc
mixin _$LocationStats {
  int get totalLocations => throw _privateConstructorUsedError;
  int get activeLocations => throw _privateConstructorUsedError;
  double get avgAccuracy => throw _privateConstructorUsedError;
  DateTime get lastUpdate => throw _privateConstructorUsedError;
  Map<String, dynamic>? get additionalStats =>
      throw _privateConstructorUsedError;

  /// Serializes this LocationStats to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of LocationStats
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $LocationStatsCopyWith<LocationStats> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $LocationStatsCopyWith<$Res> {
  factory $LocationStatsCopyWith(
    LocationStats value,
    $Res Function(LocationStats) then,
  ) = _$LocationStatsCopyWithImpl<$Res, LocationStats>;
  @useResult
  $Res call({
    int totalLocations,
    int activeLocations,
    double avgAccuracy,
    DateTime lastUpdate,
    Map<String, dynamic>? additionalStats,
  });
}

/// @nodoc
class _$LocationStatsCopyWithImpl<$Res, $Val extends LocationStats>
    implements $LocationStatsCopyWith<$Res> {
  _$LocationStatsCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of LocationStats
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? totalLocations = null,
    Object? activeLocations = null,
    Object? avgAccuracy = null,
    Object? lastUpdate = null,
    Object? additionalStats = freezed,
  }) {
    return _then(
      _value.copyWith(
            totalLocations: null == totalLocations
                ? _value.totalLocations
                : totalLocations // ignore: cast_nullable_to_non_nullable
                      as int,
            activeLocations: null == activeLocations
                ? _value.activeLocations
                : activeLocations // ignore: cast_nullable_to_non_nullable
                      as int,
            avgAccuracy: null == avgAccuracy
                ? _value.avgAccuracy
                : avgAccuracy // ignore: cast_nullable_to_non_nullable
                      as double,
            lastUpdate: null == lastUpdate
                ? _value.lastUpdate
                : lastUpdate // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            additionalStats: freezed == additionalStats
                ? _value.additionalStats
                : additionalStats // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$LocationStatsImplCopyWith<$Res>
    implements $LocationStatsCopyWith<$Res> {
  factory _$$LocationStatsImplCopyWith(
    _$LocationStatsImpl value,
    $Res Function(_$LocationStatsImpl) then,
  ) = __$$LocationStatsImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    int totalLocations,
    int activeLocations,
    double avgAccuracy,
    DateTime lastUpdate,
    Map<String, dynamic>? additionalStats,
  });
}

/// @nodoc
class __$$LocationStatsImplCopyWithImpl<$Res>
    extends _$LocationStatsCopyWithImpl<$Res, _$LocationStatsImpl>
    implements _$$LocationStatsImplCopyWith<$Res> {
  __$$LocationStatsImplCopyWithImpl(
    _$LocationStatsImpl _value,
    $Res Function(_$LocationStatsImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of LocationStats
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? totalLocations = null,
    Object? activeLocations = null,
    Object? avgAccuracy = null,
    Object? lastUpdate = null,
    Object? additionalStats = freezed,
  }) {
    return _then(
      _$LocationStatsImpl(
        totalLocations: null == totalLocations
            ? _value.totalLocations
            : totalLocations // ignore: cast_nullable_to_non_nullable
                  as int,
        activeLocations: null == activeLocations
            ? _value.activeLocations
            : activeLocations // ignore: cast_nullable_to_non_nullable
                  as int,
        avgAccuracy: null == avgAccuracy
            ? _value.avgAccuracy
            : avgAccuracy // ignore: cast_nullable_to_non_nullable
                  as double,
        lastUpdate: null == lastUpdate
            ? _value.lastUpdate
            : lastUpdate // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        additionalStats: freezed == additionalStats
            ? _value._additionalStats
            : additionalStats // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$LocationStatsImpl implements _LocationStats {
  const _$LocationStatsImpl({
    required this.totalLocations,
    required this.activeLocations,
    required this.avgAccuracy,
    required this.lastUpdate,
    final Map<String, dynamic>? additionalStats,
  }) : _additionalStats = additionalStats;

  factory _$LocationStatsImpl.fromJson(Map<String, dynamic> json) =>
      _$$LocationStatsImplFromJson(json);

  @override
  final int totalLocations;
  @override
  final int activeLocations;
  @override
  final double avgAccuracy;
  @override
  final DateTime lastUpdate;
  final Map<String, dynamic>? _additionalStats;
  @override
  Map<String, dynamic>? get additionalStats {
    final value = _additionalStats;
    if (value == null) return null;
    if (_additionalStats is EqualUnmodifiableMapView) return _additionalStats;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  @override
  String toString() {
    return 'LocationStats(totalLocations: $totalLocations, activeLocations: $activeLocations, avgAccuracy: $avgAccuracy, lastUpdate: $lastUpdate, additionalStats: $additionalStats)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$LocationStatsImpl &&
            (identical(other.totalLocations, totalLocations) ||
                other.totalLocations == totalLocations) &&
            (identical(other.activeLocations, activeLocations) ||
                other.activeLocations == activeLocations) &&
            (identical(other.avgAccuracy, avgAccuracy) ||
                other.avgAccuracy == avgAccuracy) &&
            (identical(other.lastUpdate, lastUpdate) ||
                other.lastUpdate == lastUpdate) &&
            const DeepCollectionEquality().equals(
              other._additionalStats,
              _additionalStats,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    totalLocations,
    activeLocations,
    avgAccuracy,
    lastUpdate,
    const DeepCollectionEquality().hash(_additionalStats),
  );

  /// Create a copy of LocationStats
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$LocationStatsImplCopyWith<_$LocationStatsImpl> get copyWith =>
      __$$LocationStatsImplCopyWithImpl<_$LocationStatsImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$LocationStatsImplToJson(this);
  }
}

abstract class _LocationStats implements LocationStats {
  const factory _LocationStats({
    required final int totalLocations,
    required final int activeLocations,
    required final double avgAccuracy,
    required final DateTime lastUpdate,
    final Map<String, dynamic>? additionalStats,
  }) = _$LocationStatsImpl;

  factory _LocationStats.fromJson(Map<String, dynamic> json) =
      _$LocationStatsImpl.fromJson;

  @override
  int get totalLocations;
  @override
  int get activeLocations;
  @override
  double get avgAccuracy;
  @override
  DateTime get lastUpdate;
  @override
  Map<String, dynamic>? get additionalStats;

  /// Create a copy of LocationStats
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$LocationStatsImplCopyWith<_$LocationStatsImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
