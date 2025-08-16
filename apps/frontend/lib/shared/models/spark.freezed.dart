// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'spark.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

Spark _$SparkFromJson(Map<String, dynamic> json) {
  return _Spark.fromJson(json);
}

/// @nodoc
mixin _$Spark {
  String get id => throw _privateConstructorUsedError;
  String get user1Id => throw _privateConstructorUsedError;
  String get user2Id => throw _privateConstructorUsedError;
  SparkStatus get status => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  SparkType get type => throw _privateConstructorUsedError;
  String? get message => throw _privateConstructorUsedError;
  DateTime? get respondedAt => throw _privateConstructorUsedError;
  DateTime? get expiresAt => throw _privateConstructorUsedError; // 위치 정보
  double? get latitude => throw _privateConstructorUsedError;
  double? get longitude => throw _privateConstructorUsedError;
  String? get locationName => throw _privateConstructorUsedError; // 스파크 방향과 거리
  SparkDirection? get direction => throw _privateConstructorUsedError;
  double? get distance => throw _privateConstructorUsedError; // 추가 메타데이터
  Map<String, dynamic>? get metadata =>
      throw _privateConstructorUsedError; // 상대방 정보
  String? get otherUserId => throw _privateConstructorUsedError;
  String? get otherUserNickname => throw _privateConstructorUsedError;
  String? get otherUserAvatar => throw _privateConstructorUsedError; // 수락 상태
  bool get user1Accepted => throw _privateConstructorUsedError;
  bool get user2Accepted => throw _privateConstructorUsedError;
  bool get myAccepted => throw _privateConstructorUsedError;
  bool get otherAccepted => throw _privateConstructorUsedError;

  /// Serializes this Spark to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Spark
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SparkCopyWith<Spark> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SparkCopyWith<$Res> {
  factory $SparkCopyWith(Spark value, $Res Function(Spark) then) =
      _$SparkCopyWithImpl<$Res, Spark>;
  @useResult
  $Res call({
    String id,
    String user1Id,
    String user2Id,
    SparkStatus status,
    DateTime createdAt,
    SparkType type,
    String? message,
    DateTime? respondedAt,
    DateTime? expiresAt,
    double? latitude,
    double? longitude,
    String? locationName,
    SparkDirection? direction,
    double? distance,
    Map<String, dynamic>? metadata,
    String? otherUserId,
    String? otherUserNickname,
    String? otherUserAvatar,
    bool user1Accepted,
    bool user2Accepted,
    bool myAccepted,
    bool otherAccepted,
  });
}

/// @nodoc
class _$SparkCopyWithImpl<$Res, $Val extends Spark>
    implements $SparkCopyWith<$Res> {
  _$SparkCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Spark
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? user1Id = null,
    Object? user2Id = null,
    Object? status = null,
    Object? createdAt = null,
    Object? type = null,
    Object? message = freezed,
    Object? respondedAt = freezed,
    Object? expiresAt = freezed,
    Object? latitude = freezed,
    Object? longitude = freezed,
    Object? locationName = freezed,
    Object? direction = freezed,
    Object? distance = freezed,
    Object? metadata = freezed,
    Object? otherUserId = freezed,
    Object? otherUserNickname = freezed,
    Object? otherUserAvatar = freezed,
    Object? user1Accepted = null,
    Object? user2Accepted = null,
    Object? myAccepted = null,
    Object? otherAccepted = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            user1Id: null == user1Id
                ? _value.user1Id
                : user1Id // ignore: cast_nullable_to_non_nullable
                      as String,
            user2Id: null == user2Id
                ? _value.user2Id
                : user2Id // ignore: cast_nullable_to_non_nullable
                      as String,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as SparkStatus,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as SparkType,
            message: freezed == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                      as String?,
            respondedAt: freezed == respondedAt
                ? _value.respondedAt
                : respondedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            expiresAt: freezed == expiresAt
                ? _value.expiresAt
                : expiresAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            latitude: freezed == latitude
                ? _value.latitude
                : latitude // ignore: cast_nullable_to_non_nullable
                      as double?,
            longitude: freezed == longitude
                ? _value.longitude
                : longitude // ignore: cast_nullable_to_non_nullable
                      as double?,
            locationName: freezed == locationName
                ? _value.locationName
                : locationName // ignore: cast_nullable_to_non_nullable
                      as String?,
            direction: freezed == direction
                ? _value.direction
                : direction // ignore: cast_nullable_to_non_nullable
                      as SparkDirection?,
            distance: freezed == distance
                ? _value.distance
                : distance // ignore: cast_nullable_to_non_nullable
                      as double?,
            metadata: freezed == metadata
                ? _value.metadata
                : metadata // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            otherUserId: freezed == otherUserId
                ? _value.otherUserId
                : otherUserId // ignore: cast_nullable_to_non_nullable
                      as String?,
            otherUserNickname: freezed == otherUserNickname
                ? _value.otherUserNickname
                : otherUserNickname // ignore: cast_nullable_to_non_nullable
                      as String?,
            otherUserAvatar: freezed == otherUserAvatar
                ? _value.otherUserAvatar
                : otherUserAvatar // ignore: cast_nullable_to_non_nullable
                      as String?,
            user1Accepted: null == user1Accepted
                ? _value.user1Accepted
                : user1Accepted // ignore: cast_nullable_to_non_nullable
                      as bool,
            user2Accepted: null == user2Accepted
                ? _value.user2Accepted
                : user2Accepted // ignore: cast_nullable_to_non_nullable
                      as bool,
            myAccepted: null == myAccepted
                ? _value.myAccepted
                : myAccepted // ignore: cast_nullable_to_non_nullable
                      as bool,
            otherAccepted: null == otherAccepted
                ? _value.otherAccepted
                : otherAccepted // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$SparkImplCopyWith<$Res> implements $SparkCopyWith<$Res> {
  factory _$$SparkImplCopyWith(
    _$SparkImpl value,
    $Res Function(_$SparkImpl) then,
  ) = __$$SparkImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String user1Id,
    String user2Id,
    SparkStatus status,
    DateTime createdAt,
    SparkType type,
    String? message,
    DateTime? respondedAt,
    DateTime? expiresAt,
    double? latitude,
    double? longitude,
    String? locationName,
    SparkDirection? direction,
    double? distance,
    Map<String, dynamic>? metadata,
    String? otherUserId,
    String? otherUserNickname,
    String? otherUserAvatar,
    bool user1Accepted,
    bool user2Accepted,
    bool myAccepted,
    bool otherAccepted,
  });
}

/// @nodoc
class __$$SparkImplCopyWithImpl<$Res>
    extends _$SparkCopyWithImpl<$Res, _$SparkImpl>
    implements _$$SparkImplCopyWith<$Res> {
  __$$SparkImplCopyWithImpl(
    _$SparkImpl _value,
    $Res Function(_$SparkImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Spark
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? user1Id = null,
    Object? user2Id = null,
    Object? status = null,
    Object? createdAt = null,
    Object? type = null,
    Object? message = freezed,
    Object? respondedAt = freezed,
    Object? expiresAt = freezed,
    Object? latitude = freezed,
    Object? longitude = freezed,
    Object? locationName = freezed,
    Object? direction = freezed,
    Object? distance = freezed,
    Object? metadata = freezed,
    Object? otherUserId = freezed,
    Object? otherUserNickname = freezed,
    Object? otherUserAvatar = freezed,
    Object? user1Accepted = null,
    Object? user2Accepted = null,
    Object? myAccepted = null,
    Object? otherAccepted = null,
  }) {
    return _then(
      _$SparkImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        user1Id: null == user1Id
            ? _value.user1Id
            : user1Id // ignore: cast_nullable_to_non_nullable
                  as String,
        user2Id: null == user2Id
            ? _value.user2Id
            : user2Id // ignore: cast_nullable_to_non_nullable
                  as String,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as SparkStatus,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as SparkType,
        message: freezed == message
            ? _value.message
            : message // ignore: cast_nullable_to_non_nullable
                  as String?,
        respondedAt: freezed == respondedAt
            ? _value.respondedAt
            : respondedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        expiresAt: freezed == expiresAt
            ? _value.expiresAt
            : expiresAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        latitude: freezed == latitude
            ? _value.latitude
            : latitude // ignore: cast_nullable_to_non_nullable
                  as double?,
        longitude: freezed == longitude
            ? _value.longitude
            : longitude // ignore: cast_nullable_to_non_nullable
                  as double?,
        locationName: freezed == locationName
            ? _value.locationName
            : locationName // ignore: cast_nullable_to_non_nullable
                  as String?,
        direction: freezed == direction
            ? _value.direction
            : direction // ignore: cast_nullable_to_non_nullable
                  as SparkDirection?,
        distance: freezed == distance
            ? _value.distance
            : distance // ignore: cast_nullable_to_non_nullable
                  as double?,
        metadata: freezed == metadata
            ? _value._metadata
            : metadata // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        otherUserId: freezed == otherUserId
            ? _value.otherUserId
            : otherUserId // ignore: cast_nullable_to_non_nullable
                  as String?,
        otherUserNickname: freezed == otherUserNickname
            ? _value.otherUserNickname
            : otherUserNickname // ignore: cast_nullable_to_non_nullable
                  as String?,
        otherUserAvatar: freezed == otherUserAvatar
            ? _value.otherUserAvatar
            : otherUserAvatar // ignore: cast_nullable_to_non_nullable
                  as String?,
        user1Accepted: null == user1Accepted
            ? _value.user1Accepted
            : user1Accepted // ignore: cast_nullable_to_non_nullable
                  as bool,
        user2Accepted: null == user2Accepted
            ? _value.user2Accepted
            : user2Accepted // ignore: cast_nullable_to_non_nullable
                  as bool,
        myAccepted: null == myAccepted
            ? _value.myAccepted
            : myAccepted // ignore: cast_nullable_to_non_nullable
                  as bool,
        otherAccepted: null == otherAccepted
            ? _value.otherAccepted
            : otherAccepted // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SparkImpl implements _Spark {
  const _$SparkImpl({
    required this.id,
    required this.user1Id,
    required this.user2Id,
    required this.status,
    required this.createdAt,
    this.type = SparkType.automatic,
    this.message,
    this.respondedAt,
    this.expiresAt,
    this.latitude,
    this.longitude,
    this.locationName,
    this.direction,
    this.distance,
    final Map<String, dynamic>? metadata,
    this.otherUserId,
    this.otherUserNickname,
    this.otherUserAvatar,
    this.user1Accepted = false,
    this.user2Accepted = false,
    this.myAccepted = false,
    this.otherAccepted = false,
  }) : _metadata = metadata;

  factory _$SparkImpl.fromJson(Map<String, dynamic> json) =>
      _$$SparkImplFromJson(json);

  @override
  final String id;
  @override
  final String user1Id;
  @override
  final String user2Id;
  @override
  final SparkStatus status;
  @override
  final DateTime createdAt;
  @override
  @JsonKey()
  final SparkType type;
  @override
  final String? message;
  @override
  final DateTime? respondedAt;
  @override
  final DateTime? expiresAt;
  // 위치 정보
  @override
  final double? latitude;
  @override
  final double? longitude;
  @override
  final String? locationName;
  // 스파크 방향과 거리
  @override
  final SparkDirection? direction;
  @override
  final double? distance;
  // 추가 메타데이터
  final Map<String, dynamic>? _metadata;
  // 추가 메타데이터
  @override
  Map<String, dynamic>? get metadata {
    final value = _metadata;
    if (value == null) return null;
    if (_metadata is EqualUnmodifiableMapView) return _metadata;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableMapView(value);
  }

  // 상대방 정보
  @override
  final String? otherUserId;
  @override
  final String? otherUserNickname;
  @override
  final String? otherUserAvatar;
  // 수락 상태
  @override
  @JsonKey()
  final bool user1Accepted;
  @override
  @JsonKey()
  final bool user2Accepted;
  @override
  @JsonKey()
  final bool myAccepted;
  @override
  @JsonKey()
  final bool otherAccepted;

  @override
  String toString() {
    return 'Spark(id: $id, user1Id: $user1Id, user2Id: $user2Id, status: $status, createdAt: $createdAt, type: $type, message: $message, respondedAt: $respondedAt, expiresAt: $expiresAt, latitude: $latitude, longitude: $longitude, locationName: $locationName, direction: $direction, distance: $distance, metadata: $metadata, otherUserId: $otherUserId, otherUserNickname: $otherUserNickname, otherUserAvatar: $otherUserAvatar, user1Accepted: $user1Accepted, user2Accepted: $user2Accepted, myAccepted: $myAccepted, otherAccepted: $otherAccepted)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SparkImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.user1Id, user1Id) || other.user1Id == user1Id) &&
            (identical(other.user2Id, user2Id) || other.user2Id == user2Id) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.respondedAt, respondedAt) ||
                other.respondedAt == respondedAt) &&
            (identical(other.expiresAt, expiresAt) ||
                other.expiresAt == expiresAt) &&
            (identical(other.latitude, latitude) ||
                other.latitude == latitude) &&
            (identical(other.longitude, longitude) ||
                other.longitude == longitude) &&
            (identical(other.locationName, locationName) ||
                other.locationName == locationName) &&
            (identical(other.direction, direction) ||
                other.direction == direction) &&
            (identical(other.distance, distance) ||
                other.distance == distance) &&
            const DeepCollectionEquality().equals(other._metadata, _metadata) &&
            (identical(other.otherUserId, otherUserId) ||
                other.otherUserId == otherUserId) &&
            (identical(other.otherUserNickname, otherUserNickname) ||
                other.otherUserNickname == otherUserNickname) &&
            (identical(other.otherUserAvatar, otherUserAvatar) ||
                other.otherUserAvatar == otherUserAvatar) &&
            (identical(other.user1Accepted, user1Accepted) ||
                other.user1Accepted == user1Accepted) &&
            (identical(other.user2Accepted, user2Accepted) ||
                other.user2Accepted == user2Accepted) &&
            (identical(other.myAccepted, myAccepted) ||
                other.myAccepted == myAccepted) &&
            (identical(other.otherAccepted, otherAccepted) ||
                other.otherAccepted == otherAccepted));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hashAll([
    runtimeType,
    id,
    user1Id,
    user2Id,
    status,
    createdAt,
    type,
    message,
    respondedAt,
    expiresAt,
    latitude,
    longitude,
    locationName,
    direction,
    distance,
    const DeepCollectionEquality().hash(_metadata),
    otherUserId,
    otherUserNickname,
    otherUserAvatar,
    user1Accepted,
    user2Accepted,
    myAccepted,
    otherAccepted,
  ]);

  /// Create a copy of Spark
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SparkImplCopyWith<_$SparkImpl> get copyWith =>
      __$$SparkImplCopyWithImpl<_$SparkImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SparkImplToJson(this);
  }
}

abstract class _Spark implements Spark {
  const factory _Spark({
    required final String id,
    required final String user1Id,
    required final String user2Id,
    required final SparkStatus status,
    required final DateTime createdAt,
    final SparkType type,
    final String? message,
    final DateTime? respondedAt,
    final DateTime? expiresAt,
    final double? latitude,
    final double? longitude,
    final String? locationName,
    final SparkDirection? direction,
    final double? distance,
    final Map<String, dynamic>? metadata,
    final String? otherUserId,
    final String? otherUserNickname,
    final String? otherUserAvatar,
    final bool user1Accepted,
    final bool user2Accepted,
    final bool myAccepted,
    final bool otherAccepted,
  }) = _$SparkImpl;

  factory _Spark.fromJson(Map<String, dynamic> json) = _$SparkImpl.fromJson;

  @override
  String get id;
  @override
  String get user1Id;
  @override
  String get user2Id;
  @override
  SparkStatus get status;
  @override
  DateTime get createdAt;
  @override
  SparkType get type;
  @override
  String? get message;
  @override
  DateTime? get respondedAt;
  @override
  DateTime? get expiresAt; // 위치 정보
  @override
  double? get latitude;
  @override
  double? get longitude;
  @override
  String? get locationName; // 스파크 방향과 거리
  @override
  SparkDirection? get direction;
  @override
  double? get distance; // 추가 메타데이터
  @override
  Map<String, dynamic>? get metadata; // 상대방 정보
  @override
  String? get otherUserId;
  @override
  String? get otherUserNickname;
  @override
  String? get otherUserAvatar; // 수락 상태
  @override
  bool get user1Accepted;
  @override
  bool get user2Accepted;
  @override
  bool get myAccepted;
  @override
  bool get otherAccepted;

  /// Create a copy of Spark
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SparkImplCopyWith<_$SparkImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SparkDetail _$SparkDetailFromJson(Map<String, dynamic> json) {
  return _SparkDetail.fromJson(json);
}

/// @nodoc
mixin _$SparkDetail {
  String get id => throw _privateConstructorUsedError;
  String get location => throw _privateConstructorUsedError;
  String get time => throw _privateConstructorUsedError;
  String get duration => throw _privateConstructorUsedError;
  String get distance => throw _privateConstructorUsedError;
  int get matchingRate => throw _privateConstructorUsedError;
  List<String> get commonInterests => throw _privateConstructorUsedError;
  SignatureConnection get signatureConnection =>
      throw _privateConstructorUsedError;
  List<String> get additionalHints => throw _privateConstructorUsedError;
  bool get isPremium => throw _privateConstructorUsedError;
  SparkUserProfile? get otherUser => throw _privateConstructorUsedError;

  /// Serializes this SparkDetail to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SparkDetail
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SparkDetailCopyWith<SparkDetail> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SparkDetailCopyWith<$Res> {
  factory $SparkDetailCopyWith(
    SparkDetail value,
    $Res Function(SparkDetail) then,
  ) = _$SparkDetailCopyWithImpl<$Res, SparkDetail>;
  @useResult
  $Res call({
    String id,
    String location,
    String time,
    String duration,
    String distance,
    int matchingRate,
    List<String> commonInterests,
    SignatureConnection signatureConnection,
    List<String> additionalHints,
    bool isPremium,
    SparkUserProfile? otherUser,
  });

  $SignatureConnectionCopyWith<$Res> get signatureConnection;
  $SparkUserProfileCopyWith<$Res>? get otherUser;
}

/// @nodoc
class _$SparkDetailCopyWithImpl<$Res, $Val extends SparkDetail>
    implements $SparkDetailCopyWith<$Res> {
  _$SparkDetailCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SparkDetail
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? location = null,
    Object? time = null,
    Object? duration = null,
    Object? distance = null,
    Object? matchingRate = null,
    Object? commonInterests = null,
    Object? signatureConnection = null,
    Object? additionalHints = null,
    Object? isPremium = null,
    Object? otherUser = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            location: null == location
                ? _value.location
                : location // ignore: cast_nullable_to_non_nullable
                      as String,
            time: null == time
                ? _value.time
                : time // ignore: cast_nullable_to_non_nullable
                      as String,
            duration: null == duration
                ? _value.duration
                : duration // ignore: cast_nullable_to_non_nullable
                      as String,
            distance: null == distance
                ? _value.distance
                : distance // ignore: cast_nullable_to_non_nullable
                      as String,
            matchingRate: null == matchingRate
                ? _value.matchingRate
                : matchingRate // ignore: cast_nullable_to_non_nullable
                      as int,
            commonInterests: null == commonInterests
                ? _value.commonInterests
                : commonInterests // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            signatureConnection: null == signatureConnection
                ? _value.signatureConnection
                : signatureConnection // ignore: cast_nullable_to_non_nullable
                      as SignatureConnection,
            additionalHints: null == additionalHints
                ? _value.additionalHints
                : additionalHints // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            isPremium: null == isPremium
                ? _value.isPremium
                : isPremium // ignore: cast_nullable_to_non_nullable
                      as bool,
            otherUser: freezed == otherUser
                ? _value.otherUser
                : otherUser // ignore: cast_nullable_to_non_nullable
                      as SparkUserProfile?,
          )
          as $Val,
    );
  }

  /// Create a copy of SparkDetail
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $SignatureConnectionCopyWith<$Res> get signatureConnection {
    return $SignatureConnectionCopyWith<$Res>(_value.signatureConnection, (
      value,
    ) {
      return _then(_value.copyWith(signatureConnection: value) as $Val);
    });
  }

  /// Create a copy of SparkDetail
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $SparkUserProfileCopyWith<$Res>? get otherUser {
    if (_value.otherUser == null) {
      return null;
    }

    return $SparkUserProfileCopyWith<$Res>(_value.otherUser!, (value) {
      return _then(_value.copyWith(otherUser: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$SparkDetailImplCopyWith<$Res>
    implements $SparkDetailCopyWith<$Res> {
  factory _$$SparkDetailImplCopyWith(
    _$SparkDetailImpl value,
    $Res Function(_$SparkDetailImpl) then,
  ) = __$$SparkDetailImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String location,
    String time,
    String duration,
    String distance,
    int matchingRate,
    List<String> commonInterests,
    SignatureConnection signatureConnection,
    List<String> additionalHints,
    bool isPremium,
    SparkUserProfile? otherUser,
  });

  @override
  $SignatureConnectionCopyWith<$Res> get signatureConnection;
  @override
  $SparkUserProfileCopyWith<$Res>? get otherUser;
}

/// @nodoc
class __$$SparkDetailImplCopyWithImpl<$Res>
    extends _$SparkDetailCopyWithImpl<$Res, _$SparkDetailImpl>
    implements _$$SparkDetailImplCopyWith<$Res> {
  __$$SparkDetailImplCopyWithImpl(
    _$SparkDetailImpl _value,
    $Res Function(_$SparkDetailImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SparkDetail
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? location = null,
    Object? time = null,
    Object? duration = null,
    Object? distance = null,
    Object? matchingRate = null,
    Object? commonInterests = null,
    Object? signatureConnection = null,
    Object? additionalHints = null,
    Object? isPremium = null,
    Object? otherUser = freezed,
  }) {
    return _then(
      _$SparkDetailImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        location: null == location
            ? _value.location
            : location // ignore: cast_nullable_to_non_nullable
                  as String,
        time: null == time
            ? _value.time
            : time // ignore: cast_nullable_to_non_nullable
                  as String,
        duration: null == duration
            ? _value.duration
            : duration // ignore: cast_nullable_to_non_nullable
                  as String,
        distance: null == distance
            ? _value.distance
            : distance // ignore: cast_nullable_to_non_nullable
                  as String,
        matchingRate: null == matchingRate
            ? _value.matchingRate
            : matchingRate // ignore: cast_nullable_to_non_nullable
                  as int,
        commonInterests: null == commonInterests
            ? _value._commonInterests
            : commonInterests // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        signatureConnection: null == signatureConnection
            ? _value.signatureConnection
            : signatureConnection // ignore: cast_nullable_to_non_nullable
                  as SignatureConnection,
        additionalHints: null == additionalHints
            ? _value._additionalHints
            : additionalHints // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        isPremium: null == isPremium
            ? _value.isPremium
            : isPremium // ignore: cast_nullable_to_non_nullable
                  as bool,
        otherUser: freezed == otherUser
            ? _value.otherUser
            : otherUser // ignore: cast_nullable_to_non_nullable
                  as SparkUserProfile?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SparkDetailImpl implements _SparkDetail {
  const _$SparkDetailImpl({
    required this.id,
    required this.location,
    required this.time,
    required this.duration,
    required this.distance,
    required this.matchingRate,
    required final List<String> commonInterests,
    required this.signatureConnection,
    required final List<String> additionalHints,
    this.isPremium = false,
    this.otherUser,
  }) : _commonInterests = commonInterests,
       _additionalHints = additionalHints;

  factory _$SparkDetailImpl.fromJson(Map<String, dynamic> json) =>
      _$$SparkDetailImplFromJson(json);

  @override
  final String id;
  @override
  final String location;
  @override
  final String time;
  @override
  final String duration;
  @override
  final String distance;
  @override
  final int matchingRate;
  final List<String> _commonInterests;
  @override
  List<String> get commonInterests {
    if (_commonInterests is EqualUnmodifiableListView) return _commonInterests;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_commonInterests);
  }

  @override
  final SignatureConnection signatureConnection;
  final List<String> _additionalHints;
  @override
  List<String> get additionalHints {
    if (_additionalHints is EqualUnmodifiableListView) return _additionalHints;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_additionalHints);
  }

  @override
  @JsonKey()
  final bool isPremium;
  @override
  final SparkUserProfile? otherUser;

  @override
  String toString() {
    return 'SparkDetail(id: $id, location: $location, time: $time, duration: $duration, distance: $distance, matchingRate: $matchingRate, commonInterests: $commonInterests, signatureConnection: $signatureConnection, additionalHints: $additionalHints, isPremium: $isPremium, otherUser: $otherUser)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SparkDetailImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.location, location) ||
                other.location == location) &&
            (identical(other.time, time) || other.time == time) &&
            (identical(other.duration, duration) ||
                other.duration == duration) &&
            (identical(other.distance, distance) ||
                other.distance == distance) &&
            (identical(other.matchingRate, matchingRate) ||
                other.matchingRate == matchingRate) &&
            const DeepCollectionEquality().equals(
              other._commonInterests,
              _commonInterests,
            ) &&
            (identical(other.signatureConnection, signatureConnection) ||
                other.signatureConnection == signatureConnection) &&
            const DeepCollectionEquality().equals(
              other._additionalHints,
              _additionalHints,
            ) &&
            (identical(other.isPremium, isPremium) ||
                other.isPremium == isPremium) &&
            (identical(other.otherUser, otherUser) ||
                other.otherUser == otherUser));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    location,
    time,
    duration,
    distance,
    matchingRate,
    const DeepCollectionEquality().hash(_commonInterests),
    signatureConnection,
    const DeepCollectionEquality().hash(_additionalHints),
    isPremium,
    otherUser,
  );

  /// Create a copy of SparkDetail
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SparkDetailImplCopyWith<_$SparkDetailImpl> get copyWith =>
      __$$SparkDetailImplCopyWithImpl<_$SparkDetailImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SparkDetailImplToJson(this);
  }
}

abstract class _SparkDetail implements SparkDetail {
  const factory _SparkDetail({
    required final String id,
    required final String location,
    required final String time,
    required final String duration,
    required final String distance,
    required final int matchingRate,
    required final List<String> commonInterests,
    required final SignatureConnection signatureConnection,
    required final List<String> additionalHints,
    final bool isPremium,
    final SparkUserProfile? otherUser,
  }) = _$SparkDetailImpl;

  factory _SparkDetail.fromJson(Map<String, dynamic> json) =
      _$SparkDetailImpl.fromJson;

  @override
  String get id;
  @override
  String get location;
  @override
  String get time;
  @override
  String get duration;
  @override
  String get distance;
  @override
  int get matchingRate;
  @override
  List<String> get commonInterests;
  @override
  SignatureConnection get signatureConnection;
  @override
  List<String> get additionalHints;
  @override
  bool get isPremium;
  @override
  SparkUserProfile? get otherUser;

  /// Create a copy of SparkDetail
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SparkDetailImplCopyWith<_$SparkDetailImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SparkUserProfile _$SparkUserProfileFromJson(Map<String, dynamic> json) {
  return _SparkUserProfile.fromJson(json);
}

/// @nodoc
mixin _$SparkUserProfile {
  String get id => throw _privateConstructorUsedError;
  String get nickname => throw _privateConstructorUsedError;
  String? get avatarUrl => throw _privateConstructorUsedError;
  String? get bio => throw _privateConstructorUsedError;
  String? get occupation => throw _privateConstructorUsedError;
  String? get location => throw _privateConstructorUsedError;
  List<String> get interests => throw _privateConstructorUsedError;
  List<String> get skills => throw _privateConstructorUsedError;
  List<String> get languages => throw _privateConstructorUsedError;

  /// Serializes this SparkUserProfile to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SparkUserProfile
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SparkUserProfileCopyWith<SparkUserProfile> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SparkUserProfileCopyWith<$Res> {
  factory $SparkUserProfileCopyWith(
    SparkUserProfile value,
    $Res Function(SparkUserProfile) then,
  ) = _$SparkUserProfileCopyWithImpl<$Res, SparkUserProfile>;
  @useResult
  $Res call({
    String id,
    String nickname,
    String? avatarUrl,
    String? bio,
    String? occupation,
    String? location,
    List<String> interests,
    List<String> skills,
    List<String> languages,
  });
}

/// @nodoc
class _$SparkUserProfileCopyWithImpl<$Res, $Val extends SparkUserProfile>
    implements $SparkUserProfileCopyWith<$Res> {
  _$SparkUserProfileCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SparkUserProfile
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? nickname = null,
    Object? avatarUrl = freezed,
    Object? bio = freezed,
    Object? occupation = freezed,
    Object? location = freezed,
    Object? interests = null,
    Object? skills = null,
    Object? languages = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            nickname: null == nickname
                ? _value.nickname
                : nickname // ignore: cast_nullable_to_non_nullable
                      as String,
            avatarUrl: freezed == avatarUrl
                ? _value.avatarUrl
                : avatarUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            bio: freezed == bio
                ? _value.bio
                : bio // ignore: cast_nullable_to_non_nullable
                      as String?,
            occupation: freezed == occupation
                ? _value.occupation
                : occupation // ignore: cast_nullable_to_non_nullable
                      as String?,
            location: freezed == location
                ? _value.location
                : location // ignore: cast_nullable_to_non_nullable
                      as String?,
            interests: null == interests
                ? _value.interests
                : interests // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            skills: null == skills
                ? _value.skills
                : skills // ignore: cast_nullable_to_non_nullable
                      as List<String>,
            languages: null == languages
                ? _value.languages
                : languages // ignore: cast_nullable_to_non_nullable
                      as List<String>,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$SparkUserProfileImplCopyWith<$Res>
    implements $SparkUserProfileCopyWith<$Res> {
  factory _$$SparkUserProfileImplCopyWith(
    _$SparkUserProfileImpl value,
    $Res Function(_$SparkUserProfileImpl) then,
  ) = __$$SparkUserProfileImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String nickname,
    String? avatarUrl,
    String? bio,
    String? occupation,
    String? location,
    List<String> interests,
    List<String> skills,
    List<String> languages,
  });
}

/// @nodoc
class __$$SparkUserProfileImplCopyWithImpl<$Res>
    extends _$SparkUserProfileCopyWithImpl<$Res, _$SparkUserProfileImpl>
    implements _$$SparkUserProfileImplCopyWith<$Res> {
  __$$SparkUserProfileImplCopyWithImpl(
    _$SparkUserProfileImpl _value,
    $Res Function(_$SparkUserProfileImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SparkUserProfile
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? nickname = null,
    Object? avatarUrl = freezed,
    Object? bio = freezed,
    Object? occupation = freezed,
    Object? location = freezed,
    Object? interests = null,
    Object? skills = null,
    Object? languages = null,
  }) {
    return _then(
      _$SparkUserProfileImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        nickname: null == nickname
            ? _value.nickname
            : nickname // ignore: cast_nullable_to_non_nullable
                  as String,
        avatarUrl: freezed == avatarUrl
            ? _value.avatarUrl
            : avatarUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        bio: freezed == bio
            ? _value.bio
            : bio // ignore: cast_nullable_to_non_nullable
                  as String?,
        occupation: freezed == occupation
            ? _value.occupation
            : occupation // ignore: cast_nullable_to_non_nullable
                  as String?,
        location: freezed == location
            ? _value.location
            : location // ignore: cast_nullable_to_non_nullable
                  as String?,
        interests: null == interests
            ? _value._interests
            : interests // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        skills: null == skills
            ? _value._skills
            : skills // ignore: cast_nullable_to_non_nullable
                  as List<String>,
        languages: null == languages
            ? _value._languages
            : languages // ignore: cast_nullable_to_non_nullable
                  as List<String>,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SparkUserProfileImpl implements _SparkUserProfile {
  const _$SparkUserProfileImpl({
    required this.id,
    required this.nickname,
    this.avatarUrl,
    this.bio,
    this.occupation,
    this.location,
    final List<String> interests = const [],
    final List<String> skills = const [],
    final List<String> languages = const [],
  }) : _interests = interests,
       _skills = skills,
       _languages = languages;

  factory _$SparkUserProfileImpl.fromJson(Map<String, dynamic> json) =>
      _$$SparkUserProfileImplFromJson(json);

  @override
  final String id;
  @override
  final String nickname;
  @override
  final String? avatarUrl;
  @override
  final String? bio;
  @override
  final String? occupation;
  @override
  final String? location;
  final List<String> _interests;
  @override
  @JsonKey()
  List<String> get interests {
    if (_interests is EqualUnmodifiableListView) return _interests;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_interests);
  }

  final List<String> _skills;
  @override
  @JsonKey()
  List<String> get skills {
    if (_skills is EqualUnmodifiableListView) return _skills;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_skills);
  }

  final List<String> _languages;
  @override
  @JsonKey()
  List<String> get languages {
    if (_languages is EqualUnmodifiableListView) return _languages;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_languages);
  }

  @override
  String toString() {
    return 'SparkUserProfile(id: $id, nickname: $nickname, avatarUrl: $avatarUrl, bio: $bio, occupation: $occupation, location: $location, interests: $interests, skills: $skills, languages: $languages)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SparkUserProfileImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.nickname, nickname) ||
                other.nickname == nickname) &&
            (identical(other.avatarUrl, avatarUrl) ||
                other.avatarUrl == avatarUrl) &&
            (identical(other.bio, bio) || other.bio == bio) &&
            (identical(other.occupation, occupation) ||
                other.occupation == occupation) &&
            (identical(other.location, location) ||
                other.location == location) &&
            const DeepCollectionEquality().equals(
              other._interests,
              _interests,
            ) &&
            const DeepCollectionEquality().equals(other._skills, _skills) &&
            const DeepCollectionEquality().equals(
              other._languages,
              _languages,
            ));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    nickname,
    avatarUrl,
    bio,
    occupation,
    location,
    const DeepCollectionEquality().hash(_interests),
    const DeepCollectionEquality().hash(_skills),
    const DeepCollectionEquality().hash(_languages),
  );

  /// Create a copy of SparkUserProfile
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SparkUserProfileImplCopyWith<_$SparkUserProfileImpl> get copyWith =>
      __$$SparkUserProfileImplCopyWithImpl<_$SparkUserProfileImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$SparkUserProfileImplToJson(this);
  }
}

abstract class _SparkUserProfile implements SparkUserProfile {
  const factory _SparkUserProfile({
    required final String id,
    required final String nickname,
    final String? avatarUrl,
    final String? bio,
    final String? occupation,
    final String? location,
    final List<String> interests,
    final List<String> skills,
    final List<String> languages,
  }) = _$SparkUserProfileImpl;

  factory _SparkUserProfile.fromJson(Map<String, dynamic> json) =
      _$SparkUserProfileImpl.fromJson;

  @override
  String get id;
  @override
  String get nickname;
  @override
  String? get avatarUrl;
  @override
  String? get bio;
  @override
  String? get occupation;
  @override
  String? get location;
  @override
  List<String> get interests;
  @override
  List<String> get skills;
  @override
  List<String> get languages;

  /// Create a copy of SparkUserProfile
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SparkUserProfileImplCopyWith<_$SparkUserProfileImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SignatureConnection _$SignatureConnectionFromJson(Map<String, dynamic> json) {
  return _SignatureConnection.fromJson(json);
}

/// @nodoc
mixin _$SignatureConnection {
  String? get movie => throw _privateConstructorUsedError;
  String? get artist => throw _privateConstructorUsedError;
  String? get mbti => throw _privateConstructorUsedError;
  bool get isMovieMatch => throw _privateConstructorUsedError;
  bool get isArtistMatch => throw _privateConstructorUsedError;
  bool get isMbtiMatch => throw _privateConstructorUsedError;

  /// Serializes this SignatureConnection to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SignatureConnection
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SignatureConnectionCopyWith<SignatureConnection> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SignatureConnectionCopyWith<$Res> {
  factory $SignatureConnectionCopyWith(
    SignatureConnection value,
    $Res Function(SignatureConnection) then,
  ) = _$SignatureConnectionCopyWithImpl<$Res, SignatureConnection>;
  @useResult
  $Res call({
    String? movie,
    String? artist,
    String? mbti,
    bool isMovieMatch,
    bool isArtistMatch,
    bool isMbtiMatch,
  });
}

/// @nodoc
class _$SignatureConnectionCopyWithImpl<$Res, $Val extends SignatureConnection>
    implements $SignatureConnectionCopyWith<$Res> {
  _$SignatureConnectionCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SignatureConnection
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? movie = freezed,
    Object? artist = freezed,
    Object? mbti = freezed,
    Object? isMovieMatch = null,
    Object? isArtistMatch = null,
    Object? isMbtiMatch = null,
  }) {
    return _then(
      _value.copyWith(
            movie: freezed == movie
                ? _value.movie
                : movie // ignore: cast_nullable_to_non_nullable
                      as String?,
            artist: freezed == artist
                ? _value.artist
                : artist // ignore: cast_nullable_to_non_nullable
                      as String?,
            mbti: freezed == mbti
                ? _value.mbti
                : mbti // ignore: cast_nullable_to_non_nullable
                      as String?,
            isMovieMatch: null == isMovieMatch
                ? _value.isMovieMatch
                : isMovieMatch // ignore: cast_nullable_to_non_nullable
                      as bool,
            isArtistMatch: null == isArtistMatch
                ? _value.isArtistMatch
                : isArtistMatch // ignore: cast_nullable_to_non_nullable
                      as bool,
            isMbtiMatch: null == isMbtiMatch
                ? _value.isMbtiMatch
                : isMbtiMatch // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$SignatureConnectionImplCopyWith<$Res>
    implements $SignatureConnectionCopyWith<$Res> {
  factory _$$SignatureConnectionImplCopyWith(
    _$SignatureConnectionImpl value,
    $Res Function(_$SignatureConnectionImpl) then,
  ) = __$$SignatureConnectionImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String? movie,
    String? artist,
    String? mbti,
    bool isMovieMatch,
    bool isArtistMatch,
    bool isMbtiMatch,
  });
}

/// @nodoc
class __$$SignatureConnectionImplCopyWithImpl<$Res>
    extends _$SignatureConnectionCopyWithImpl<$Res, _$SignatureConnectionImpl>
    implements _$$SignatureConnectionImplCopyWith<$Res> {
  __$$SignatureConnectionImplCopyWithImpl(
    _$SignatureConnectionImpl _value,
    $Res Function(_$SignatureConnectionImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SignatureConnection
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? movie = freezed,
    Object? artist = freezed,
    Object? mbti = freezed,
    Object? isMovieMatch = null,
    Object? isArtistMatch = null,
    Object? isMbtiMatch = null,
  }) {
    return _then(
      _$SignatureConnectionImpl(
        movie: freezed == movie
            ? _value.movie
            : movie // ignore: cast_nullable_to_non_nullable
                  as String?,
        artist: freezed == artist
            ? _value.artist
            : artist // ignore: cast_nullable_to_non_nullable
                  as String?,
        mbti: freezed == mbti
            ? _value.mbti
            : mbti // ignore: cast_nullable_to_non_nullable
                  as String?,
        isMovieMatch: null == isMovieMatch
            ? _value.isMovieMatch
            : isMovieMatch // ignore: cast_nullable_to_non_nullable
                  as bool,
        isArtistMatch: null == isArtistMatch
            ? _value.isArtistMatch
            : isArtistMatch // ignore: cast_nullable_to_non_nullable
                  as bool,
        isMbtiMatch: null == isMbtiMatch
            ? _value.isMbtiMatch
            : isMbtiMatch // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$SignatureConnectionImpl implements _SignatureConnection {
  const _$SignatureConnectionImpl({
    this.movie,
    this.artist,
    this.mbti,
    this.isMovieMatch = false,
    this.isArtistMatch = false,
    this.isMbtiMatch = false,
  });

  factory _$SignatureConnectionImpl.fromJson(Map<String, dynamic> json) =>
      _$$SignatureConnectionImplFromJson(json);

  @override
  final String? movie;
  @override
  final String? artist;
  @override
  final String? mbti;
  @override
  @JsonKey()
  final bool isMovieMatch;
  @override
  @JsonKey()
  final bool isArtistMatch;
  @override
  @JsonKey()
  final bool isMbtiMatch;

  @override
  String toString() {
    return 'SignatureConnection(movie: $movie, artist: $artist, mbti: $mbti, isMovieMatch: $isMovieMatch, isArtistMatch: $isArtistMatch, isMbtiMatch: $isMbtiMatch)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SignatureConnectionImpl &&
            (identical(other.movie, movie) || other.movie == movie) &&
            (identical(other.artist, artist) || other.artist == artist) &&
            (identical(other.mbti, mbti) || other.mbti == mbti) &&
            (identical(other.isMovieMatch, isMovieMatch) ||
                other.isMovieMatch == isMovieMatch) &&
            (identical(other.isArtistMatch, isArtistMatch) ||
                other.isArtistMatch == isArtistMatch) &&
            (identical(other.isMbtiMatch, isMbtiMatch) ||
                other.isMbtiMatch == isMbtiMatch));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    movie,
    artist,
    mbti,
    isMovieMatch,
    isArtistMatch,
    isMbtiMatch,
  );

  /// Create a copy of SignatureConnection
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SignatureConnectionImplCopyWith<_$SignatureConnectionImpl> get copyWith =>
      __$$SignatureConnectionImplCopyWithImpl<_$SignatureConnectionImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$SignatureConnectionImplToJson(this);
  }
}

abstract class _SignatureConnection implements SignatureConnection {
  const factory _SignatureConnection({
    final String? movie,
    final String? artist,
    final String? mbti,
    final bool isMovieMatch,
    final bool isArtistMatch,
    final bool isMbtiMatch,
  }) = _$SignatureConnectionImpl;

  factory _SignatureConnection.fromJson(Map<String, dynamic> json) =
      _$SignatureConnectionImpl.fromJson;

  @override
  String? get movie;
  @override
  String? get artist;
  @override
  String? get mbti;
  @override
  bool get isMovieMatch;
  @override
  bool get isArtistMatch;
  @override
  bool get isMbtiMatch;

  /// Create a copy of SignatureConnection
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SignatureConnectionImplCopyWith<_$SignatureConnectionImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CreateSparkRequest _$CreateSparkRequestFromJson(Map<String, dynamic> json) {
  return _CreateSparkRequest.fromJson(json);
}

/// @nodoc
mixin _$CreateSparkRequest {
  String get targetUserId => throw _privateConstructorUsedError;
  String? get message => throw _privateConstructorUsedError;
  String? get sparkType => throw _privateConstructorUsedError;
  String? get spotId => throw _privateConstructorUsedError;
  double? get latitude => throw _privateConstructorUsedError;
  double? get longitude => throw _privateConstructorUsedError;

  /// Serializes this CreateSparkRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreateSparkRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreateSparkRequestCopyWith<CreateSparkRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreateSparkRequestCopyWith<$Res> {
  factory $CreateSparkRequestCopyWith(
    CreateSparkRequest value,
    $Res Function(CreateSparkRequest) then,
  ) = _$CreateSparkRequestCopyWithImpl<$Res, CreateSparkRequest>;
  @useResult
  $Res call({
    String targetUserId,
    String? message,
    String? sparkType,
    String? spotId,
    double? latitude,
    double? longitude,
  });
}

/// @nodoc
class _$CreateSparkRequestCopyWithImpl<$Res, $Val extends CreateSparkRequest>
    implements $CreateSparkRequestCopyWith<$Res> {
  _$CreateSparkRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreateSparkRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? targetUserId = null,
    Object? message = freezed,
    Object? sparkType = freezed,
    Object? spotId = freezed,
    Object? latitude = freezed,
    Object? longitude = freezed,
  }) {
    return _then(
      _value.copyWith(
            targetUserId: null == targetUserId
                ? _value.targetUserId
                : targetUserId // ignore: cast_nullable_to_non_nullable
                      as String,
            message: freezed == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                      as String?,
            sparkType: freezed == sparkType
                ? _value.sparkType
                : sparkType // ignore: cast_nullable_to_non_nullable
                      as String?,
            spotId: freezed == spotId
                ? _value.spotId
                : spotId // ignore: cast_nullable_to_non_nullable
                      as String?,
            latitude: freezed == latitude
                ? _value.latitude
                : latitude // ignore: cast_nullable_to_non_nullable
                      as double?,
            longitude: freezed == longitude
                ? _value.longitude
                : longitude // ignore: cast_nullable_to_non_nullable
                      as double?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CreateSparkRequestImplCopyWith<$Res>
    implements $CreateSparkRequestCopyWith<$Res> {
  factory _$$CreateSparkRequestImplCopyWith(
    _$CreateSparkRequestImpl value,
    $Res Function(_$CreateSparkRequestImpl) then,
  ) = __$$CreateSparkRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String targetUserId,
    String? message,
    String? sparkType,
    String? spotId,
    double? latitude,
    double? longitude,
  });
}

/// @nodoc
class __$$CreateSparkRequestImplCopyWithImpl<$Res>
    extends _$CreateSparkRequestCopyWithImpl<$Res, _$CreateSparkRequestImpl>
    implements _$$CreateSparkRequestImplCopyWith<$Res> {
  __$$CreateSparkRequestImplCopyWithImpl(
    _$CreateSparkRequestImpl _value,
    $Res Function(_$CreateSparkRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CreateSparkRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? targetUserId = null,
    Object? message = freezed,
    Object? sparkType = freezed,
    Object? spotId = freezed,
    Object? latitude = freezed,
    Object? longitude = freezed,
  }) {
    return _then(
      _$CreateSparkRequestImpl(
        targetUserId: null == targetUserId
            ? _value.targetUserId
            : targetUserId // ignore: cast_nullable_to_non_nullable
                  as String,
        message: freezed == message
            ? _value.message
            : message // ignore: cast_nullable_to_non_nullable
                  as String?,
        sparkType: freezed == sparkType
            ? _value.sparkType
            : sparkType // ignore: cast_nullable_to_non_nullable
                  as String?,
        spotId: freezed == spotId
            ? _value.spotId
            : spotId // ignore: cast_nullable_to_non_nullable
                  as String?,
        latitude: freezed == latitude
            ? _value.latitude
            : latitude // ignore: cast_nullable_to_non_nullable
                  as double?,
        longitude: freezed == longitude
            ? _value.longitude
            : longitude // ignore: cast_nullable_to_non_nullable
                  as double?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CreateSparkRequestImpl implements _CreateSparkRequest {
  const _$CreateSparkRequestImpl({
    required this.targetUserId,
    this.message,
    this.sparkType,
    this.spotId,
    this.latitude,
    this.longitude,
  });

  factory _$CreateSparkRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreateSparkRequestImplFromJson(json);

  @override
  final String targetUserId;
  @override
  final String? message;
  @override
  final String? sparkType;
  @override
  final String? spotId;
  @override
  final double? latitude;
  @override
  final double? longitude;

  @override
  String toString() {
    return 'CreateSparkRequest(targetUserId: $targetUserId, message: $message, sparkType: $sparkType, spotId: $spotId, latitude: $latitude, longitude: $longitude)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreateSparkRequestImpl &&
            (identical(other.targetUserId, targetUserId) ||
                other.targetUserId == targetUserId) &&
            (identical(other.message, message) || other.message == message) &&
            (identical(other.sparkType, sparkType) ||
                other.sparkType == sparkType) &&
            (identical(other.spotId, spotId) || other.spotId == spotId) &&
            (identical(other.latitude, latitude) ||
                other.latitude == latitude) &&
            (identical(other.longitude, longitude) ||
                other.longitude == longitude));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    targetUserId,
    message,
    sparkType,
    spotId,
    latitude,
    longitude,
  );

  /// Create a copy of CreateSparkRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreateSparkRequestImplCopyWith<_$CreateSparkRequestImpl> get copyWith =>
      __$$CreateSparkRequestImplCopyWithImpl<_$CreateSparkRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CreateSparkRequestImplToJson(this);
  }
}

abstract class _CreateSparkRequest implements CreateSparkRequest {
  const factory _CreateSparkRequest({
    required final String targetUserId,
    final String? message,
    final String? sparkType,
    final String? spotId,
    final double? latitude,
    final double? longitude,
  }) = _$CreateSparkRequestImpl;

  factory _CreateSparkRequest.fromJson(Map<String, dynamic> json) =
      _$CreateSparkRequestImpl.fromJson;

  @override
  String get targetUserId;
  @override
  String? get message;
  @override
  String? get sparkType;
  @override
  String? get spotId;
  @override
  double? get latitude;
  @override
  double? get longitude;

  /// Create a copy of CreateSparkRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreateSparkRequestImplCopyWith<_$CreateSparkRequestImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SparkResponse _$SparkResponseFromJson(Map<String, dynamic> json) {
  return _SparkResponse.fromJson(json);
}

/// @nodoc
mixin _$SparkResponse {
  bool get success => throw _privateConstructorUsedError;
  Spark get data => throw _privateConstructorUsedError;
  String? get message => throw _privateConstructorUsedError;

  /// Serializes this SparkResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SparkResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SparkResponseCopyWith<SparkResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SparkResponseCopyWith<$Res> {
  factory $SparkResponseCopyWith(
    SparkResponse value,
    $Res Function(SparkResponse) then,
  ) = _$SparkResponseCopyWithImpl<$Res, SparkResponse>;
  @useResult
  $Res call({bool success, Spark data, String? message});

  $SparkCopyWith<$Res> get data;
}

/// @nodoc
class _$SparkResponseCopyWithImpl<$Res, $Val extends SparkResponse>
    implements $SparkResponseCopyWith<$Res> {
  _$SparkResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SparkResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? success = null,
    Object? data = null,
    Object? message = freezed,
  }) {
    return _then(
      _value.copyWith(
            success: null == success
                ? _value.success
                : success // ignore: cast_nullable_to_non_nullable
                      as bool,
            data: null == data
                ? _value.data
                : data // ignore: cast_nullable_to_non_nullable
                      as Spark,
            message: freezed == message
                ? _value.message
                : message // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }

  /// Create a copy of SparkResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $SparkCopyWith<$Res> get data {
    return $SparkCopyWith<$Res>(_value.data, (value) {
      return _then(_value.copyWith(data: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$SparkResponseImplCopyWith<$Res>
    implements $SparkResponseCopyWith<$Res> {
  factory _$$SparkResponseImplCopyWith(
    _$SparkResponseImpl value,
    $Res Function(_$SparkResponseImpl) then,
  ) = __$$SparkResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({bool success, Spark data, String? message});

  @override
  $SparkCopyWith<$Res> get data;
}

/// @nodoc
class __$$SparkResponseImplCopyWithImpl<$Res>
    extends _$SparkResponseCopyWithImpl<$Res, _$SparkResponseImpl>
    implements _$$SparkResponseImplCopyWith<$Res> {
  __$$SparkResponseImplCopyWithImpl(
    _$SparkResponseImpl _value,
    $Res Function(_$SparkResponseImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SparkResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? success = null,
    Object? data = null,
    Object? message = freezed,
  }) {
    return _then(
      _$SparkResponseImpl(
        success: null == success
            ? _value.success
            : success // ignore: cast_nullable_to_non_nullable
                  as bool,
        data: null == data
            ? _value.data
            : data // ignore: cast_nullable_to_non_nullable
                  as Spark,
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
class _$SparkResponseImpl implements _SparkResponse {
  const _$SparkResponseImpl({
    required this.success,
    required this.data,
    this.message,
  });

  factory _$SparkResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$SparkResponseImplFromJson(json);

  @override
  final bool success;
  @override
  final Spark data;
  @override
  final String? message;

  @override
  String toString() {
    return 'SparkResponse(success: $success, data: $data, message: $message)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SparkResponseImpl &&
            (identical(other.success, success) || other.success == success) &&
            (identical(other.data, data) || other.data == data) &&
            (identical(other.message, message) || other.message == message));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, success, data, message);

  /// Create a copy of SparkResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SparkResponseImplCopyWith<_$SparkResponseImpl> get copyWith =>
      __$$SparkResponseImplCopyWithImpl<_$SparkResponseImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$SparkResponseImplToJson(this);
  }
}

abstract class _SparkResponse implements SparkResponse {
  const factory _SparkResponse({
    required final bool success,
    required final Spark data,
    final String? message,
  }) = _$SparkResponseImpl;

  factory _SparkResponse.fromJson(Map<String, dynamic> json) =
      _$SparkResponseImpl.fromJson;

  @override
  bool get success;
  @override
  Spark get data;
  @override
  String? get message;

  /// Create a copy of SparkResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SparkResponseImplCopyWith<_$SparkResponseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SparkListResponse _$SparkListResponseFromJson(Map<String, dynamic> json) {
  return _SparkListResponse.fromJson(json);
}

/// @nodoc
mixin _$SparkListResponse {
  bool get success => throw _privateConstructorUsedError;
  List<Spark> get data => throw _privateConstructorUsedError;
  String? get message => throw _privateConstructorUsedError;

  /// Serializes this SparkListResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SparkListResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SparkListResponseCopyWith<SparkListResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SparkListResponseCopyWith<$Res> {
  factory $SparkListResponseCopyWith(
    SparkListResponse value,
    $Res Function(SparkListResponse) then,
  ) = _$SparkListResponseCopyWithImpl<$Res, SparkListResponse>;
  @useResult
  $Res call({bool success, List<Spark> data, String? message});
}

/// @nodoc
class _$SparkListResponseCopyWithImpl<$Res, $Val extends SparkListResponse>
    implements $SparkListResponseCopyWith<$Res> {
  _$SparkListResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SparkListResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? success = null,
    Object? data = null,
    Object? message = freezed,
  }) {
    return _then(
      _value.copyWith(
            success: null == success
                ? _value.success
                : success // ignore: cast_nullable_to_non_nullable
                      as bool,
            data: null == data
                ? _value.data
                : data // ignore: cast_nullable_to_non_nullable
                      as List<Spark>,
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
abstract class _$$SparkListResponseImplCopyWith<$Res>
    implements $SparkListResponseCopyWith<$Res> {
  factory _$$SparkListResponseImplCopyWith(
    _$SparkListResponseImpl value,
    $Res Function(_$SparkListResponseImpl) then,
  ) = __$$SparkListResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({bool success, List<Spark> data, String? message});
}

/// @nodoc
class __$$SparkListResponseImplCopyWithImpl<$Res>
    extends _$SparkListResponseCopyWithImpl<$Res, _$SparkListResponseImpl>
    implements _$$SparkListResponseImplCopyWith<$Res> {
  __$$SparkListResponseImplCopyWithImpl(
    _$SparkListResponseImpl _value,
    $Res Function(_$SparkListResponseImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SparkListResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? success = null,
    Object? data = null,
    Object? message = freezed,
  }) {
    return _then(
      _$SparkListResponseImpl(
        success: null == success
            ? _value.success
            : success // ignore: cast_nullable_to_non_nullable
                  as bool,
        data: null == data
            ? _value._data
            : data // ignore: cast_nullable_to_non_nullable
                  as List<Spark>,
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
class _$SparkListResponseImpl implements _SparkListResponse {
  const _$SparkListResponseImpl({
    required this.success,
    required final List<Spark> data,
    this.message,
  }) : _data = data;

  factory _$SparkListResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$SparkListResponseImplFromJson(json);

  @override
  final bool success;
  final List<Spark> _data;
  @override
  List<Spark> get data {
    if (_data is EqualUnmodifiableListView) return _data;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_data);
  }

  @override
  final String? message;

  @override
  String toString() {
    return 'SparkListResponse(success: $success, data: $data, message: $message)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SparkListResponseImpl &&
            (identical(other.success, success) || other.success == success) &&
            const DeepCollectionEquality().equals(other._data, _data) &&
            (identical(other.message, message) || other.message == message));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    success,
    const DeepCollectionEquality().hash(_data),
    message,
  );

  /// Create a copy of SparkListResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SparkListResponseImplCopyWith<_$SparkListResponseImpl> get copyWith =>
      __$$SparkListResponseImplCopyWithImpl<_$SparkListResponseImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$SparkListResponseImplToJson(this);
  }
}

abstract class _SparkListResponse implements SparkListResponse {
  const factory _SparkListResponse({
    required final bool success,
    required final List<Spark> data,
    final String? message,
  }) = _$SparkListResponseImpl;

  factory _SparkListResponse.fromJson(Map<String, dynamic> json) =
      _$SparkListResponseImpl.fromJson;

  @override
  bool get success;
  @override
  List<Spark> get data;
  @override
  String? get message;

  /// Create a copy of SparkListResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SparkListResponseImplCopyWith<_$SparkListResponseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}
