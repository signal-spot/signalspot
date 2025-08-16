// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'notification.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

AppNotification _$AppNotificationFromJson(Map<String, dynamic> json) {
  return _AppNotification.fromJson(json);
}

/// @nodoc
mixin _$AppNotification {
  String get id => throw _privateConstructorUsedError;
  String get userId => throw _privateConstructorUsedError;
  NotificationType get type => throw _privateConstructorUsedError;
  String get title => throw _privateConstructorUsedError;
  String get body => throw _privateConstructorUsedError;
  Map<String, dynamic>? get data => throw _privateConstructorUsedError;
  bool get isRead => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime? get readAt => throw _privateConstructorUsedError;
  String? get imageUrl => throw _privateConstructorUsedError;
  String? get actionUrl => throw _privateConstructorUsedError;

  /// Serializes this AppNotification to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of AppNotification
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $AppNotificationCopyWith<AppNotification> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $AppNotificationCopyWith<$Res> {
  factory $AppNotificationCopyWith(
    AppNotification value,
    $Res Function(AppNotification) then,
  ) = _$AppNotificationCopyWithImpl<$Res, AppNotification>;
  @useResult
  $Res call({
    String id,
    String userId,
    NotificationType type,
    String title,
    String body,
    Map<String, dynamic>? data,
    bool isRead,
    DateTime createdAt,
    DateTime? readAt,
    String? imageUrl,
    String? actionUrl,
  });
}

/// @nodoc
class _$AppNotificationCopyWithImpl<$Res, $Val extends AppNotification>
    implements $AppNotificationCopyWith<$Res> {
  _$AppNotificationCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of AppNotification
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? type = null,
    Object? title = null,
    Object? body = null,
    Object? data = freezed,
    Object? isRead = null,
    Object? createdAt = null,
    Object? readAt = freezed,
    Object? imageUrl = freezed,
    Object? actionUrl = freezed,
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
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as NotificationType,
            title: null == title
                ? _value.title
                : title // ignore: cast_nullable_to_non_nullable
                      as String,
            body: null == body
                ? _value.body
                : body // ignore: cast_nullable_to_non_nullable
                      as String,
            data: freezed == data
                ? _value.data
                : data // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            isRead: null == isRead
                ? _value.isRead
                : isRead // ignore: cast_nullable_to_non_nullable
                      as bool,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            readAt: freezed == readAt
                ? _value.readAt
                : readAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            imageUrl: freezed == imageUrl
                ? _value.imageUrl
                : imageUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
            actionUrl: freezed == actionUrl
                ? _value.actionUrl
                : actionUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$AppNotificationImplCopyWith<$Res>
    implements $AppNotificationCopyWith<$Res> {
  factory _$$AppNotificationImplCopyWith(
    _$AppNotificationImpl value,
    $Res Function(_$AppNotificationImpl) then,
  ) = __$$AppNotificationImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String userId,
    NotificationType type,
    String title,
    String body,
    Map<String, dynamic>? data,
    bool isRead,
    DateTime createdAt,
    DateTime? readAt,
    String? imageUrl,
    String? actionUrl,
  });
}

/// @nodoc
class __$$AppNotificationImplCopyWithImpl<$Res>
    extends _$AppNotificationCopyWithImpl<$Res, _$AppNotificationImpl>
    implements _$$AppNotificationImplCopyWith<$Res> {
  __$$AppNotificationImplCopyWithImpl(
    _$AppNotificationImpl _value,
    $Res Function(_$AppNotificationImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of AppNotification
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? userId = null,
    Object? type = null,
    Object? title = null,
    Object? body = null,
    Object? data = freezed,
    Object? isRead = null,
    Object? createdAt = null,
    Object? readAt = freezed,
    Object? imageUrl = freezed,
    Object? actionUrl = freezed,
  }) {
    return _then(
      _$AppNotificationImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        userId: null == userId
            ? _value.userId
            : userId // ignore: cast_nullable_to_non_nullable
                  as String,
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as NotificationType,
        title: null == title
            ? _value.title
            : title // ignore: cast_nullable_to_non_nullable
                  as String,
        body: null == body
            ? _value.body
            : body // ignore: cast_nullable_to_non_nullable
                  as String,
        data: freezed == data
            ? _value._data
            : data // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        isRead: null == isRead
            ? _value.isRead
            : isRead // ignore: cast_nullable_to_non_nullable
                  as bool,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        readAt: freezed == readAt
            ? _value.readAt
            : readAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        imageUrl: freezed == imageUrl
            ? _value.imageUrl
            : imageUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
        actionUrl: freezed == actionUrl
            ? _value.actionUrl
            : actionUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$AppNotificationImpl implements _AppNotification {
  const _$AppNotificationImpl({
    required this.id,
    required this.userId,
    required this.type,
    required this.title,
    required this.body,
    final Map<String, dynamic>? data,
    this.isRead = false,
    required this.createdAt,
    this.readAt,
    this.imageUrl,
    this.actionUrl,
  }) : _data = data;

  factory _$AppNotificationImpl.fromJson(Map<String, dynamic> json) =>
      _$$AppNotificationImplFromJson(json);

  @override
  final String id;
  @override
  final String userId;
  @override
  final NotificationType type;
  @override
  final String title;
  @override
  final String body;
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
  final bool isRead;
  @override
  final DateTime createdAt;
  @override
  final DateTime? readAt;
  @override
  final String? imageUrl;
  @override
  final String? actionUrl;

  @override
  String toString() {
    return 'AppNotification(id: $id, userId: $userId, type: $type, title: $title, body: $body, data: $data, isRead: $isRead, createdAt: $createdAt, readAt: $readAt, imageUrl: $imageUrl, actionUrl: $actionUrl)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$AppNotificationImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.userId, userId) || other.userId == userId) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.title, title) || other.title == title) &&
            (identical(other.body, body) || other.body == body) &&
            const DeepCollectionEquality().equals(other._data, _data) &&
            (identical(other.isRead, isRead) || other.isRead == isRead) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.readAt, readAt) || other.readAt == readAt) &&
            (identical(other.imageUrl, imageUrl) ||
                other.imageUrl == imageUrl) &&
            (identical(other.actionUrl, actionUrl) ||
                other.actionUrl == actionUrl));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    userId,
    type,
    title,
    body,
    const DeepCollectionEquality().hash(_data),
    isRead,
    createdAt,
    readAt,
    imageUrl,
    actionUrl,
  );

  /// Create a copy of AppNotification
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$AppNotificationImplCopyWith<_$AppNotificationImpl> get copyWith =>
      __$$AppNotificationImplCopyWithImpl<_$AppNotificationImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$AppNotificationImplToJson(this);
  }
}

abstract class _AppNotification implements AppNotification {
  const factory _AppNotification({
    required final String id,
    required final String userId,
    required final NotificationType type,
    required final String title,
    required final String body,
    final Map<String, dynamic>? data,
    final bool isRead,
    required final DateTime createdAt,
    final DateTime? readAt,
    final String? imageUrl,
    final String? actionUrl,
  }) = _$AppNotificationImpl;

  factory _AppNotification.fromJson(Map<String, dynamic> json) =
      _$AppNotificationImpl.fromJson;

  @override
  String get id;
  @override
  String get userId;
  @override
  NotificationType get type;
  @override
  String get title;
  @override
  String get body;
  @override
  Map<String, dynamic>? get data;
  @override
  bool get isRead;
  @override
  DateTime get createdAt;
  @override
  DateTime? get readAt;
  @override
  String? get imageUrl;
  @override
  String? get actionUrl;

  /// Create a copy of AppNotification
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$AppNotificationImplCopyWith<_$AppNotificationImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

NotificationListResponse _$NotificationListResponseFromJson(
  Map<String, dynamic> json,
) {
  return _NotificationListResponse.fromJson(json);
}

/// @nodoc
mixin _$NotificationListResponse {
  List<AppNotification> get notifications => throw _privateConstructorUsedError;
  int get unreadCount => throw _privateConstructorUsedError;
  int get totalCount => throw _privateConstructorUsedError;
  bool get hasMore => throw _privateConstructorUsedError;

  /// Serializes this NotificationListResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of NotificationListResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $NotificationListResponseCopyWith<NotificationListResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $NotificationListResponseCopyWith<$Res> {
  factory $NotificationListResponseCopyWith(
    NotificationListResponse value,
    $Res Function(NotificationListResponse) then,
  ) = _$NotificationListResponseCopyWithImpl<$Res, NotificationListResponse>;
  @useResult
  $Res call({
    List<AppNotification> notifications,
    int unreadCount,
    int totalCount,
    bool hasMore,
  });
}

/// @nodoc
class _$NotificationListResponseCopyWithImpl<
  $Res,
  $Val extends NotificationListResponse
>
    implements $NotificationListResponseCopyWith<$Res> {
  _$NotificationListResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of NotificationListResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? notifications = null,
    Object? unreadCount = null,
    Object? totalCount = null,
    Object? hasMore = null,
  }) {
    return _then(
      _value.copyWith(
            notifications: null == notifications
                ? _value.notifications
                : notifications // ignore: cast_nullable_to_non_nullable
                      as List<AppNotification>,
            unreadCount: null == unreadCount
                ? _value.unreadCount
                : unreadCount // ignore: cast_nullable_to_non_nullable
                      as int,
            totalCount: null == totalCount
                ? _value.totalCount
                : totalCount // ignore: cast_nullable_to_non_nullable
                      as int,
            hasMore: null == hasMore
                ? _value.hasMore
                : hasMore // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$NotificationListResponseImplCopyWith<$Res>
    implements $NotificationListResponseCopyWith<$Res> {
  factory _$$NotificationListResponseImplCopyWith(
    _$NotificationListResponseImpl value,
    $Res Function(_$NotificationListResponseImpl) then,
  ) = __$$NotificationListResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    List<AppNotification> notifications,
    int unreadCount,
    int totalCount,
    bool hasMore,
  });
}

/// @nodoc
class __$$NotificationListResponseImplCopyWithImpl<$Res>
    extends
        _$NotificationListResponseCopyWithImpl<
          $Res,
          _$NotificationListResponseImpl
        >
    implements _$$NotificationListResponseImplCopyWith<$Res> {
  __$$NotificationListResponseImplCopyWithImpl(
    _$NotificationListResponseImpl _value,
    $Res Function(_$NotificationListResponseImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of NotificationListResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? notifications = null,
    Object? unreadCount = null,
    Object? totalCount = null,
    Object? hasMore = null,
  }) {
    return _then(
      _$NotificationListResponseImpl(
        notifications: null == notifications
            ? _value._notifications
            : notifications // ignore: cast_nullable_to_non_nullable
                  as List<AppNotification>,
        unreadCount: null == unreadCount
            ? _value.unreadCount
            : unreadCount // ignore: cast_nullable_to_non_nullable
                  as int,
        totalCount: null == totalCount
            ? _value.totalCount
            : totalCount // ignore: cast_nullable_to_non_nullable
                  as int,
        hasMore: null == hasMore
            ? _value.hasMore
            : hasMore // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$NotificationListResponseImpl implements _NotificationListResponse {
  const _$NotificationListResponseImpl({
    required final List<AppNotification> notifications,
    required this.unreadCount,
    required this.totalCount,
    required this.hasMore,
  }) : _notifications = notifications;

  factory _$NotificationListResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$NotificationListResponseImplFromJson(json);

  final List<AppNotification> _notifications;
  @override
  List<AppNotification> get notifications {
    if (_notifications is EqualUnmodifiableListView) return _notifications;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_notifications);
  }

  @override
  final int unreadCount;
  @override
  final int totalCount;
  @override
  final bool hasMore;

  @override
  String toString() {
    return 'NotificationListResponse(notifications: $notifications, unreadCount: $unreadCount, totalCount: $totalCount, hasMore: $hasMore)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$NotificationListResponseImpl &&
            const DeepCollectionEquality().equals(
              other._notifications,
              _notifications,
            ) &&
            (identical(other.unreadCount, unreadCount) ||
                other.unreadCount == unreadCount) &&
            (identical(other.totalCount, totalCount) ||
                other.totalCount == totalCount) &&
            (identical(other.hasMore, hasMore) || other.hasMore == hasMore));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    const DeepCollectionEquality().hash(_notifications),
    unreadCount,
    totalCount,
    hasMore,
  );

  /// Create a copy of NotificationListResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$NotificationListResponseImplCopyWith<_$NotificationListResponseImpl>
  get copyWith =>
      __$$NotificationListResponseImplCopyWithImpl<
        _$NotificationListResponseImpl
      >(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$NotificationListResponseImplToJson(this);
  }
}

abstract class _NotificationListResponse implements NotificationListResponse {
  const factory _NotificationListResponse({
    required final List<AppNotification> notifications,
    required final int unreadCount,
    required final int totalCount,
    required final bool hasMore,
  }) = _$NotificationListResponseImpl;

  factory _NotificationListResponse.fromJson(Map<String, dynamic> json) =
      _$NotificationListResponseImpl.fromJson;

  @override
  List<AppNotification> get notifications;
  @override
  int get unreadCount;
  @override
  int get totalCount;
  @override
  bool get hasMore;

  /// Create a copy of NotificationListResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$NotificationListResponseImplCopyWith<_$NotificationListResponseImpl>
  get copyWith => throw _privateConstructorUsedError;
}

NotificationSettings _$NotificationSettingsFromJson(Map<String, dynamic> json) {
  return _NotificationSettings.fromJson(json);
}

/// @nodoc
mixin _$NotificationSettings {
  bool get pushEnabled => throw _privateConstructorUsedError;
  bool get sparkNotifications => throw _privateConstructorUsedError;
  bool get messageNotifications => throw _privateConstructorUsedError;
  bool get profileViewNotifications => throw _privateConstructorUsedError;
  bool get marketingNotifications => throw _privateConstructorUsedError;
  String? get fcmToken => throw _privateConstructorUsedError;

  /// Serializes this NotificationSettings to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of NotificationSettings
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $NotificationSettingsCopyWith<NotificationSettings> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $NotificationSettingsCopyWith<$Res> {
  factory $NotificationSettingsCopyWith(
    NotificationSettings value,
    $Res Function(NotificationSettings) then,
  ) = _$NotificationSettingsCopyWithImpl<$Res, NotificationSettings>;
  @useResult
  $Res call({
    bool pushEnabled,
    bool sparkNotifications,
    bool messageNotifications,
    bool profileViewNotifications,
    bool marketingNotifications,
    String? fcmToken,
  });
}

/// @nodoc
class _$NotificationSettingsCopyWithImpl<
  $Res,
  $Val extends NotificationSettings
>
    implements $NotificationSettingsCopyWith<$Res> {
  _$NotificationSettingsCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of NotificationSettings
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? pushEnabled = null,
    Object? sparkNotifications = null,
    Object? messageNotifications = null,
    Object? profileViewNotifications = null,
    Object? marketingNotifications = null,
    Object? fcmToken = freezed,
  }) {
    return _then(
      _value.copyWith(
            pushEnabled: null == pushEnabled
                ? _value.pushEnabled
                : pushEnabled // ignore: cast_nullable_to_non_nullable
                      as bool,
            sparkNotifications: null == sparkNotifications
                ? _value.sparkNotifications
                : sparkNotifications // ignore: cast_nullable_to_non_nullable
                      as bool,
            messageNotifications: null == messageNotifications
                ? _value.messageNotifications
                : messageNotifications // ignore: cast_nullable_to_non_nullable
                      as bool,
            profileViewNotifications: null == profileViewNotifications
                ? _value.profileViewNotifications
                : profileViewNotifications // ignore: cast_nullable_to_non_nullable
                      as bool,
            marketingNotifications: null == marketingNotifications
                ? _value.marketingNotifications
                : marketingNotifications // ignore: cast_nullable_to_non_nullable
                      as bool,
            fcmToken: freezed == fcmToken
                ? _value.fcmToken
                : fcmToken // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$NotificationSettingsImplCopyWith<$Res>
    implements $NotificationSettingsCopyWith<$Res> {
  factory _$$NotificationSettingsImplCopyWith(
    _$NotificationSettingsImpl value,
    $Res Function(_$NotificationSettingsImpl) then,
  ) = __$$NotificationSettingsImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    bool pushEnabled,
    bool sparkNotifications,
    bool messageNotifications,
    bool profileViewNotifications,
    bool marketingNotifications,
    String? fcmToken,
  });
}

/// @nodoc
class __$$NotificationSettingsImplCopyWithImpl<$Res>
    extends _$NotificationSettingsCopyWithImpl<$Res, _$NotificationSettingsImpl>
    implements _$$NotificationSettingsImplCopyWith<$Res> {
  __$$NotificationSettingsImplCopyWithImpl(
    _$NotificationSettingsImpl _value,
    $Res Function(_$NotificationSettingsImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of NotificationSettings
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? pushEnabled = null,
    Object? sparkNotifications = null,
    Object? messageNotifications = null,
    Object? profileViewNotifications = null,
    Object? marketingNotifications = null,
    Object? fcmToken = freezed,
  }) {
    return _then(
      _$NotificationSettingsImpl(
        pushEnabled: null == pushEnabled
            ? _value.pushEnabled
            : pushEnabled // ignore: cast_nullable_to_non_nullable
                  as bool,
        sparkNotifications: null == sparkNotifications
            ? _value.sparkNotifications
            : sparkNotifications // ignore: cast_nullable_to_non_nullable
                  as bool,
        messageNotifications: null == messageNotifications
            ? _value.messageNotifications
            : messageNotifications // ignore: cast_nullable_to_non_nullable
                  as bool,
        profileViewNotifications: null == profileViewNotifications
            ? _value.profileViewNotifications
            : profileViewNotifications // ignore: cast_nullable_to_non_nullable
                  as bool,
        marketingNotifications: null == marketingNotifications
            ? _value.marketingNotifications
            : marketingNotifications // ignore: cast_nullable_to_non_nullable
                  as bool,
        fcmToken: freezed == fcmToken
            ? _value.fcmToken
            : fcmToken // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$NotificationSettingsImpl implements _NotificationSettings {
  const _$NotificationSettingsImpl({
    this.pushEnabled = true,
    this.sparkNotifications = true,
    this.messageNotifications = true,
    this.profileViewNotifications = true,
    this.marketingNotifications = false,
    this.fcmToken,
  });

  factory _$NotificationSettingsImpl.fromJson(Map<String, dynamic> json) =>
      _$$NotificationSettingsImplFromJson(json);

  @override
  @JsonKey()
  final bool pushEnabled;
  @override
  @JsonKey()
  final bool sparkNotifications;
  @override
  @JsonKey()
  final bool messageNotifications;
  @override
  @JsonKey()
  final bool profileViewNotifications;
  @override
  @JsonKey()
  final bool marketingNotifications;
  @override
  final String? fcmToken;

  @override
  String toString() {
    return 'NotificationSettings(pushEnabled: $pushEnabled, sparkNotifications: $sparkNotifications, messageNotifications: $messageNotifications, profileViewNotifications: $profileViewNotifications, marketingNotifications: $marketingNotifications, fcmToken: $fcmToken)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$NotificationSettingsImpl &&
            (identical(other.pushEnabled, pushEnabled) ||
                other.pushEnabled == pushEnabled) &&
            (identical(other.sparkNotifications, sparkNotifications) ||
                other.sparkNotifications == sparkNotifications) &&
            (identical(other.messageNotifications, messageNotifications) ||
                other.messageNotifications == messageNotifications) &&
            (identical(
                  other.profileViewNotifications,
                  profileViewNotifications,
                ) ||
                other.profileViewNotifications == profileViewNotifications) &&
            (identical(other.marketingNotifications, marketingNotifications) ||
                other.marketingNotifications == marketingNotifications) &&
            (identical(other.fcmToken, fcmToken) ||
                other.fcmToken == fcmToken));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    pushEnabled,
    sparkNotifications,
    messageNotifications,
    profileViewNotifications,
    marketingNotifications,
    fcmToken,
  );

  /// Create a copy of NotificationSettings
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$NotificationSettingsImplCopyWith<_$NotificationSettingsImpl>
  get copyWith =>
      __$$NotificationSettingsImplCopyWithImpl<_$NotificationSettingsImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$NotificationSettingsImplToJson(this);
  }
}

abstract class _NotificationSettings implements NotificationSettings {
  const factory _NotificationSettings({
    final bool pushEnabled,
    final bool sparkNotifications,
    final bool messageNotifications,
    final bool profileViewNotifications,
    final bool marketingNotifications,
    final String? fcmToken,
  }) = _$NotificationSettingsImpl;

  factory _NotificationSettings.fromJson(Map<String, dynamic> json) =
      _$NotificationSettingsImpl.fromJson;

  @override
  bool get pushEnabled;
  @override
  bool get sparkNotifications;
  @override
  bool get messageNotifications;
  @override
  bool get profileViewNotifications;
  @override
  bool get marketingNotifications;
  @override
  String? get fcmToken;

  /// Create a copy of NotificationSettings
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$NotificationSettingsImplCopyWith<_$NotificationSettingsImpl>
  get copyWith => throw _privateConstructorUsedError;
}
