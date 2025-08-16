// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint
// ignore_for_file: unused_element, deprecated_member_use, deprecated_member_use_from_same_package, use_function_type_syntax_for_parameters, unnecessary_const, avoid_init_to_null, invalid_override_different_default_values_named, prefer_expression_function_bodies, annotate_overrides, invalid_annotation_target, unnecessary_question_mark

part of 'chat.dart';

// **************************************************************************
// FreezedGenerator
// **************************************************************************

T _$identity<T>(T value) => value;

final _privateConstructorUsedError = UnsupportedError(
  'It seems like you constructed your class using `MyClass._()`. This constructor is only meant to be used by freezed and you are not supposed to need it nor use it.\nPlease check the documentation here for more information: https://github.com/rrousselGit/freezed#adding-getters-and-methods-to-our-models',
);

ChatRoom _$ChatRoomFromJson(Map<String, dynamic> json) {
  return _ChatRoom.fromJson(json);
}

/// @nodoc
mixin _$ChatRoom {
  String get id => throw _privateConstructorUsedError;
  String get name => throw _privateConstructorUsedError;
  ChatRoomType get type => throw _privateConstructorUsedError;
  ChatRoomStatus get status => throw _privateConstructorUsedError;
  ChatParticipant get otherParticipant => throw _privateConstructorUsedError;
  String? get lastMessage => throw _privateConstructorUsedError;
  DateTime? get lastMessageAt => throw _privateConstructorUsedError;
  int get unreadCount => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this ChatRoom to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ChatRoom
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ChatRoomCopyWith<ChatRoom> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ChatRoomCopyWith<$Res> {
  factory $ChatRoomCopyWith(ChatRoom value, $Res Function(ChatRoom) then) =
      _$ChatRoomCopyWithImpl<$Res, ChatRoom>;
  @useResult
  $Res call({
    String id,
    String name,
    ChatRoomType type,
    ChatRoomStatus status,
    ChatParticipant otherParticipant,
    String? lastMessage,
    DateTime? lastMessageAt,
    int unreadCount,
    DateTime createdAt,
    DateTime updatedAt,
  });

  $ChatParticipantCopyWith<$Res> get otherParticipant;
}

/// @nodoc
class _$ChatRoomCopyWithImpl<$Res, $Val extends ChatRoom>
    implements $ChatRoomCopyWith<$Res> {
  _$ChatRoomCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ChatRoom
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? type = null,
    Object? status = null,
    Object? otherParticipant = null,
    Object? lastMessage = freezed,
    Object? lastMessageAt = freezed,
    Object? unreadCount = null,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            name: null == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String,
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as ChatRoomType,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as ChatRoomStatus,
            otherParticipant: null == otherParticipant
                ? _value.otherParticipant
                : otherParticipant // ignore: cast_nullable_to_non_nullable
                      as ChatParticipant,
            lastMessage: freezed == lastMessage
                ? _value.lastMessage
                : lastMessage // ignore: cast_nullable_to_non_nullable
                      as String?,
            lastMessageAt: freezed == lastMessageAt
                ? _value.lastMessageAt
                : lastMessageAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            unreadCount: null == unreadCount
                ? _value.unreadCount
                : unreadCount // ignore: cast_nullable_to_non_nullable
                      as int,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            updatedAt: null == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
          )
          as $Val,
    );
  }

  /// Create a copy of ChatRoom
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $ChatParticipantCopyWith<$Res> get otherParticipant {
    return $ChatParticipantCopyWith<$Res>(_value.otherParticipant, (value) {
      return _then(_value.copyWith(otherParticipant: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$ChatRoomImplCopyWith<$Res>
    implements $ChatRoomCopyWith<$Res> {
  factory _$$ChatRoomImplCopyWith(
    _$ChatRoomImpl value,
    $Res Function(_$ChatRoomImpl) then,
  ) = __$$ChatRoomImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String name,
    ChatRoomType type,
    ChatRoomStatus status,
    ChatParticipant otherParticipant,
    String? lastMessage,
    DateTime? lastMessageAt,
    int unreadCount,
    DateTime createdAt,
    DateTime updatedAt,
  });

  @override
  $ChatParticipantCopyWith<$Res> get otherParticipant;
}

/// @nodoc
class __$$ChatRoomImplCopyWithImpl<$Res>
    extends _$ChatRoomCopyWithImpl<$Res, _$ChatRoomImpl>
    implements _$$ChatRoomImplCopyWith<$Res> {
  __$$ChatRoomImplCopyWithImpl(
    _$ChatRoomImpl _value,
    $Res Function(_$ChatRoomImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ChatRoom
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? name = null,
    Object? type = null,
    Object? status = null,
    Object? otherParticipant = null,
    Object? lastMessage = freezed,
    Object? lastMessageAt = freezed,
    Object? unreadCount = null,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(
      _$ChatRoomImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        name: null == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String,
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as ChatRoomType,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as ChatRoomStatus,
        otherParticipant: null == otherParticipant
            ? _value.otherParticipant
            : otherParticipant // ignore: cast_nullable_to_non_nullable
                  as ChatParticipant,
        lastMessage: freezed == lastMessage
            ? _value.lastMessage
            : lastMessage // ignore: cast_nullable_to_non_nullable
                  as String?,
        lastMessageAt: freezed == lastMessageAt
            ? _value.lastMessageAt
            : lastMessageAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        unreadCount: null == unreadCount
            ? _value.unreadCount
            : unreadCount // ignore: cast_nullable_to_non_nullable
                  as int,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        updatedAt: null == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ChatRoomImpl implements _ChatRoom {
  const _$ChatRoomImpl({
    required this.id,
    required this.name,
    required this.type,
    required this.status,
    required this.otherParticipant,
    this.lastMessage,
    this.lastMessageAt,
    this.unreadCount = 0,
    required this.createdAt,
    required this.updatedAt,
  });

  factory _$ChatRoomImpl.fromJson(Map<String, dynamic> json) =>
      _$$ChatRoomImplFromJson(json);

  @override
  final String id;
  @override
  final String name;
  @override
  final ChatRoomType type;
  @override
  final ChatRoomStatus status;
  @override
  final ChatParticipant otherParticipant;
  @override
  final String? lastMessage;
  @override
  final DateTime? lastMessageAt;
  @override
  @JsonKey()
  final int unreadCount;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  @override
  String toString() {
    return 'ChatRoom(id: $id, name: $name, type: $type, status: $status, otherParticipant: $otherParticipant, lastMessage: $lastMessage, lastMessageAt: $lastMessageAt, unreadCount: $unreadCount, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ChatRoomImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.otherParticipant, otherParticipant) ||
                other.otherParticipant == otherParticipant) &&
            (identical(other.lastMessage, lastMessage) ||
                other.lastMessage == lastMessage) &&
            (identical(other.lastMessageAt, lastMessageAt) ||
                other.lastMessageAt == lastMessageAt) &&
            (identical(other.unreadCount, unreadCount) ||
                other.unreadCount == unreadCount) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    name,
    type,
    status,
    otherParticipant,
    lastMessage,
    lastMessageAt,
    unreadCount,
    createdAt,
    updatedAt,
  );

  /// Create a copy of ChatRoom
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ChatRoomImplCopyWith<_$ChatRoomImpl> get copyWith =>
      __$$ChatRoomImplCopyWithImpl<_$ChatRoomImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$ChatRoomImplToJson(this);
  }
}

abstract class _ChatRoom implements ChatRoom {
  const factory _ChatRoom({
    required final String id,
    required final String name,
    required final ChatRoomType type,
    required final ChatRoomStatus status,
    required final ChatParticipant otherParticipant,
    final String? lastMessage,
    final DateTime? lastMessageAt,
    final int unreadCount,
    required final DateTime createdAt,
    required final DateTime updatedAt,
  }) = _$ChatRoomImpl;

  factory _ChatRoom.fromJson(Map<String, dynamic> json) =
      _$ChatRoomImpl.fromJson;

  @override
  String get id;
  @override
  String get name;
  @override
  ChatRoomType get type;
  @override
  ChatRoomStatus get status;
  @override
  ChatParticipant get otherParticipant;
  @override
  String? get lastMessage;
  @override
  DateTime? get lastMessageAt;
  @override
  int get unreadCount;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;

  /// Create a copy of ChatRoom
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ChatRoomImplCopyWith<_$ChatRoomImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ChatParticipant _$ChatParticipantFromJson(Map<String, dynamic> json) {
  return _ChatParticipant.fromJson(json);
}

/// @nodoc
mixin _$ChatParticipant {
  String get id => throw _privateConstructorUsedError;
  String? get nickname => throw _privateConstructorUsedError;
  String? get avatarUrl => throw _privateConstructorUsedError;

  /// Serializes this ChatParticipant to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ChatParticipant
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ChatParticipantCopyWith<ChatParticipant> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ChatParticipantCopyWith<$Res> {
  factory $ChatParticipantCopyWith(
    ChatParticipant value,
    $Res Function(ChatParticipant) then,
  ) = _$ChatParticipantCopyWithImpl<$Res, ChatParticipant>;
  @useResult
  $Res call({String id, String? nickname, String? avatarUrl});
}

/// @nodoc
class _$ChatParticipantCopyWithImpl<$Res, $Val extends ChatParticipant>
    implements $ChatParticipantCopyWith<$Res> {
  _$ChatParticipantCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ChatParticipant
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? nickname = freezed,
    Object? avatarUrl = freezed,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            nickname: freezed == nickname
                ? _value.nickname
                : nickname // ignore: cast_nullable_to_non_nullable
                      as String?,
            avatarUrl: freezed == avatarUrl
                ? _value.avatarUrl
                : avatarUrl // ignore: cast_nullable_to_non_nullable
                      as String?,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ChatParticipantImplCopyWith<$Res>
    implements $ChatParticipantCopyWith<$Res> {
  factory _$$ChatParticipantImplCopyWith(
    _$ChatParticipantImpl value,
    $Res Function(_$ChatParticipantImpl) then,
  ) = __$$ChatParticipantImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String id, String? nickname, String? avatarUrl});
}

/// @nodoc
class __$$ChatParticipantImplCopyWithImpl<$Res>
    extends _$ChatParticipantCopyWithImpl<$Res, _$ChatParticipantImpl>
    implements _$$ChatParticipantImplCopyWith<$Res> {
  __$$ChatParticipantImplCopyWithImpl(
    _$ChatParticipantImpl _value,
    $Res Function(_$ChatParticipantImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ChatParticipant
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? nickname = freezed,
    Object? avatarUrl = freezed,
  }) {
    return _then(
      _$ChatParticipantImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        nickname: freezed == nickname
            ? _value.nickname
            : nickname // ignore: cast_nullable_to_non_nullable
                  as String?,
        avatarUrl: freezed == avatarUrl
            ? _value.avatarUrl
            : avatarUrl // ignore: cast_nullable_to_non_nullable
                  as String?,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ChatParticipantImpl implements _ChatParticipant {
  const _$ChatParticipantImpl({
    required this.id,
    this.nickname,
    this.avatarUrl,
  });

  factory _$ChatParticipantImpl.fromJson(Map<String, dynamic> json) =>
      _$$ChatParticipantImplFromJson(json);

  @override
  final String id;
  @override
  final String? nickname;
  @override
  final String? avatarUrl;

  @override
  String toString() {
    return 'ChatParticipant(id: $id, nickname: $nickname, avatarUrl: $avatarUrl)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ChatParticipantImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.nickname, nickname) ||
                other.nickname == nickname) &&
            (identical(other.avatarUrl, avatarUrl) ||
                other.avatarUrl == avatarUrl));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, id, nickname, avatarUrl);

  /// Create a copy of ChatParticipant
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ChatParticipantImplCopyWith<_$ChatParticipantImpl> get copyWith =>
      __$$ChatParticipantImplCopyWithImpl<_$ChatParticipantImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$ChatParticipantImplToJson(this);
  }
}

abstract class _ChatParticipant implements ChatParticipant {
  const factory _ChatParticipant({
    required final String id,
    final String? nickname,
    final String? avatarUrl,
  }) = _$ChatParticipantImpl;

  factory _ChatParticipant.fromJson(Map<String, dynamic> json) =
      _$ChatParticipantImpl.fromJson;

  @override
  String get id;
  @override
  String? get nickname;
  @override
  String? get avatarUrl;

  /// Create a copy of ChatParticipant
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ChatParticipantImplCopyWith<_$ChatParticipantImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

Message _$MessageFromJson(Map<String, dynamic> json) {
  return _Message.fromJson(json);
}

/// @nodoc
mixin _$Message {
  String get id => throw _privateConstructorUsedError;
  String get content => throw _privateConstructorUsedError;
  MessageType get type => throw _privateConstructorUsedError;
  MessageStatus get status => throw _privateConstructorUsedError;
  ChatParticipant get sender => throw _privateConstructorUsedError;
  Map<String, dynamic>? get metadata => throw _privateConstructorUsedError;
  DateTime? get readAt => throw _privateConstructorUsedError;
  DateTime? get deliveredAt => throw _privateConstructorUsedError;
  DateTime? get editedAt => throw _privateConstructorUsedError;
  bool get isDeleted => throw _privateConstructorUsedError;
  DateTime get createdAt => throw _privateConstructorUsedError;
  DateTime get updatedAt => throw _privateConstructorUsedError;

  /// Serializes this Message to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of Message
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $MessageCopyWith<Message> get copyWith => throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MessageCopyWith<$Res> {
  factory $MessageCopyWith(Message value, $Res Function(Message) then) =
      _$MessageCopyWithImpl<$Res, Message>;
  @useResult
  $Res call({
    String id,
    String content,
    MessageType type,
    MessageStatus status,
    ChatParticipant sender,
    Map<String, dynamic>? metadata,
    DateTime? readAt,
    DateTime? deliveredAt,
    DateTime? editedAt,
    bool isDeleted,
    DateTime createdAt,
    DateTime updatedAt,
  });

  $ChatParticipantCopyWith<$Res> get sender;
}

/// @nodoc
class _$MessageCopyWithImpl<$Res, $Val extends Message>
    implements $MessageCopyWith<$Res> {
  _$MessageCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of Message
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? content = null,
    Object? type = null,
    Object? status = null,
    Object? sender = null,
    Object? metadata = freezed,
    Object? readAt = freezed,
    Object? deliveredAt = freezed,
    Object? editedAt = freezed,
    Object? isDeleted = null,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(
      _value.copyWith(
            id: null == id
                ? _value.id
                : id // ignore: cast_nullable_to_non_nullable
                      as String,
            content: null == content
                ? _value.content
                : content // ignore: cast_nullable_to_non_nullable
                      as String,
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as MessageType,
            status: null == status
                ? _value.status
                : status // ignore: cast_nullable_to_non_nullable
                      as MessageStatus,
            sender: null == sender
                ? _value.sender
                : sender // ignore: cast_nullable_to_non_nullable
                      as ChatParticipant,
            metadata: freezed == metadata
                ? _value.metadata
                : metadata // ignore: cast_nullable_to_non_nullable
                      as Map<String, dynamic>?,
            readAt: freezed == readAt
                ? _value.readAt
                : readAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            deliveredAt: freezed == deliveredAt
                ? _value.deliveredAt
                : deliveredAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            editedAt: freezed == editedAt
                ? _value.editedAt
                : editedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime?,
            isDeleted: null == isDeleted
                ? _value.isDeleted
                : isDeleted // ignore: cast_nullable_to_non_nullable
                      as bool,
            createdAt: null == createdAt
                ? _value.createdAt
                : createdAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
            updatedAt: null == updatedAt
                ? _value.updatedAt
                : updatedAt // ignore: cast_nullable_to_non_nullable
                      as DateTime,
          )
          as $Val,
    );
  }

  /// Create a copy of Message
  /// with the given fields replaced by the non-null parameter values.
  @override
  @pragma('vm:prefer-inline')
  $ChatParticipantCopyWith<$Res> get sender {
    return $ChatParticipantCopyWith<$Res>(_value.sender, (value) {
      return _then(_value.copyWith(sender: value) as $Val);
    });
  }
}

/// @nodoc
abstract class _$$MessageImplCopyWith<$Res> implements $MessageCopyWith<$Res> {
  factory _$$MessageImplCopyWith(
    _$MessageImpl value,
    $Res Function(_$MessageImpl) then,
  ) = __$$MessageImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String id,
    String content,
    MessageType type,
    MessageStatus status,
    ChatParticipant sender,
    Map<String, dynamic>? metadata,
    DateTime? readAt,
    DateTime? deliveredAt,
    DateTime? editedAt,
    bool isDeleted,
    DateTime createdAt,
    DateTime updatedAt,
  });

  @override
  $ChatParticipantCopyWith<$Res> get sender;
}

/// @nodoc
class __$$MessageImplCopyWithImpl<$Res>
    extends _$MessageCopyWithImpl<$Res, _$MessageImpl>
    implements _$$MessageImplCopyWith<$Res> {
  __$$MessageImplCopyWithImpl(
    _$MessageImpl _value,
    $Res Function(_$MessageImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of Message
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? id = null,
    Object? content = null,
    Object? type = null,
    Object? status = null,
    Object? sender = null,
    Object? metadata = freezed,
    Object? readAt = freezed,
    Object? deliveredAt = freezed,
    Object? editedAt = freezed,
    Object? isDeleted = null,
    Object? createdAt = null,
    Object? updatedAt = null,
  }) {
    return _then(
      _$MessageImpl(
        id: null == id
            ? _value.id
            : id // ignore: cast_nullable_to_non_nullable
                  as String,
        content: null == content
            ? _value.content
            : content // ignore: cast_nullable_to_non_nullable
                  as String,
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as MessageType,
        status: null == status
            ? _value.status
            : status // ignore: cast_nullable_to_non_nullable
                  as MessageStatus,
        sender: null == sender
            ? _value.sender
            : sender // ignore: cast_nullable_to_non_nullable
                  as ChatParticipant,
        metadata: freezed == metadata
            ? _value._metadata
            : metadata // ignore: cast_nullable_to_non_nullable
                  as Map<String, dynamic>?,
        readAt: freezed == readAt
            ? _value.readAt
            : readAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        deliveredAt: freezed == deliveredAt
            ? _value.deliveredAt
            : deliveredAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        editedAt: freezed == editedAt
            ? _value.editedAt
            : editedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime?,
        isDeleted: null == isDeleted
            ? _value.isDeleted
            : isDeleted // ignore: cast_nullable_to_non_nullable
                  as bool,
        createdAt: null == createdAt
            ? _value.createdAt
            : createdAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
        updatedAt: null == updatedAt
            ? _value.updatedAt
            : updatedAt // ignore: cast_nullable_to_non_nullable
                  as DateTime,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$MessageImpl implements _Message {
  const _$MessageImpl({
    required this.id,
    required this.content,
    required this.type,
    required this.status,
    required this.sender,
    final Map<String, dynamic>? metadata,
    this.readAt,
    this.deliveredAt,
    this.editedAt,
    this.isDeleted = false,
    required this.createdAt,
    required this.updatedAt,
  }) : _metadata = metadata;

  factory _$MessageImpl.fromJson(Map<String, dynamic> json) =>
      _$$MessageImplFromJson(json);

  @override
  final String id;
  @override
  final String content;
  @override
  final MessageType type;
  @override
  final MessageStatus status;
  @override
  final ChatParticipant sender;
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
  final DateTime? readAt;
  @override
  final DateTime? deliveredAt;
  @override
  final DateTime? editedAt;
  @override
  @JsonKey()
  final bool isDeleted;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;

  @override
  String toString() {
    return 'Message(id: $id, content: $content, type: $type, status: $status, sender: $sender, metadata: $metadata, readAt: $readAt, deliveredAt: $deliveredAt, editedAt: $editedAt, isDeleted: $isDeleted, createdAt: $createdAt, updatedAt: $updatedAt)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MessageImpl &&
            (identical(other.id, id) || other.id == id) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.type, type) || other.type == type) &&
            (identical(other.status, status) || other.status == status) &&
            (identical(other.sender, sender) || other.sender == sender) &&
            const DeepCollectionEquality().equals(other._metadata, _metadata) &&
            (identical(other.readAt, readAt) || other.readAt == readAt) &&
            (identical(other.deliveredAt, deliveredAt) ||
                other.deliveredAt == deliveredAt) &&
            (identical(other.editedAt, editedAt) ||
                other.editedAt == editedAt) &&
            (identical(other.isDeleted, isDeleted) ||
                other.isDeleted == isDeleted) &&
            (identical(other.createdAt, createdAt) ||
                other.createdAt == createdAt) &&
            (identical(other.updatedAt, updatedAt) ||
                other.updatedAt == updatedAt));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    id,
    content,
    type,
    status,
    sender,
    const DeepCollectionEquality().hash(_metadata),
    readAt,
    deliveredAt,
    editedAt,
    isDeleted,
    createdAt,
    updatedAt,
  );

  /// Create a copy of Message
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$MessageImplCopyWith<_$MessageImpl> get copyWith =>
      __$$MessageImplCopyWithImpl<_$MessageImpl>(this, _$identity);

  @override
  Map<String, dynamic> toJson() {
    return _$$MessageImplToJson(this);
  }
}

abstract class _Message implements Message {
  const factory _Message({
    required final String id,
    required final String content,
    required final MessageType type,
    required final MessageStatus status,
    required final ChatParticipant sender,
    final Map<String, dynamic>? metadata,
    final DateTime? readAt,
    final DateTime? deliveredAt,
    final DateTime? editedAt,
    final bool isDeleted,
    required final DateTime createdAt,
    required final DateTime updatedAt,
  }) = _$MessageImpl;

  factory _Message.fromJson(Map<String, dynamic> json) = _$MessageImpl.fromJson;

  @override
  String get id;
  @override
  String get content;
  @override
  MessageType get type;
  @override
  MessageStatus get status;
  @override
  ChatParticipant get sender;
  @override
  Map<String, dynamic>? get metadata;
  @override
  DateTime? get readAt;
  @override
  DateTime? get deliveredAt;
  @override
  DateTime? get editedAt;
  @override
  bool get isDeleted;
  @override
  DateTime get createdAt;
  @override
  DateTime get updatedAt;

  /// Create a copy of Message
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$MessageImplCopyWith<_$MessageImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

ChatRoomListResponse _$ChatRoomListResponseFromJson(Map<String, dynamic> json) {
  return _ChatRoomListResponse.fromJson(json);
}

/// @nodoc
mixin _$ChatRoomListResponse {
  List<ChatRoom> get chatRooms => throw _privateConstructorUsedError;
  int get total => throw _privateConstructorUsedError;
  int get page => throw _privateConstructorUsedError;
  int get limit => throw _privateConstructorUsedError;
  bool get hasNext => throw _privateConstructorUsedError;

  /// Serializes this ChatRoomListResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of ChatRoomListResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $ChatRoomListResponseCopyWith<ChatRoomListResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $ChatRoomListResponseCopyWith<$Res> {
  factory $ChatRoomListResponseCopyWith(
    ChatRoomListResponse value,
    $Res Function(ChatRoomListResponse) then,
  ) = _$ChatRoomListResponseCopyWithImpl<$Res, ChatRoomListResponse>;
  @useResult
  $Res call({
    List<ChatRoom> chatRooms,
    int total,
    int page,
    int limit,
    bool hasNext,
  });
}

/// @nodoc
class _$ChatRoomListResponseCopyWithImpl<
  $Res,
  $Val extends ChatRoomListResponse
>
    implements $ChatRoomListResponseCopyWith<$Res> {
  _$ChatRoomListResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of ChatRoomListResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? chatRooms = null,
    Object? total = null,
    Object? page = null,
    Object? limit = null,
    Object? hasNext = null,
  }) {
    return _then(
      _value.copyWith(
            chatRooms: null == chatRooms
                ? _value.chatRooms
                : chatRooms // ignore: cast_nullable_to_non_nullable
                      as List<ChatRoom>,
            total: null == total
                ? _value.total
                : total // ignore: cast_nullable_to_non_nullable
                      as int,
            page: null == page
                ? _value.page
                : page // ignore: cast_nullable_to_non_nullable
                      as int,
            limit: null == limit
                ? _value.limit
                : limit // ignore: cast_nullable_to_non_nullable
                      as int,
            hasNext: null == hasNext
                ? _value.hasNext
                : hasNext // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$ChatRoomListResponseImplCopyWith<$Res>
    implements $ChatRoomListResponseCopyWith<$Res> {
  factory _$$ChatRoomListResponseImplCopyWith(
    _$ChatRoomListResponseImpl value,
    $Res Function(_$ChatRoomListResponseImpl) then,
  ) = __$$ChatRoomListResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    List<ChatRoom> chatRooms,
    int total,
    int page,
    int limit,
    bool hasNext,
  });
}

/// @nodoc
class __$$ChatRoomListResponseImplCopyWithImpl<$Res>
    extends _$ChatRoomListResponseCopyWithImpl<$Res, _$ChatRoomListResponseImpl>
    implements _$$ChatRoomListResponseImplCopyWith<$Res> {
  __$$ChatRoomListResponseImplCopyWithImpl(
    _$ChatRoomListResponseImpl _value,
    $Res Function(_$ChatRoomListResponseImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of ChatRoomListResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? chatRooms = null,
    Object? total = null,
    Object? page = null,
    Object? limit = null,
    Object? hasNext = null,
  }) {
    return _then(
      _$ChatRoomListResponseImpl(
        chatRooms: null == chatRooms
            ? _value._chatRooms
            : chatRooms // ignore: cast_nullable_to_non_nullable
                  as List<ChatRoom>,
        total: null == total
            ? _value.total
            : total // ignore: cast_nullable_to_non_nullable
                  as int,
        page: null == page
            ? _value.page
            : page // ignore: cast_nullable_to_non_nullable
                  as int,
        limit: null == limit
            ? _value.limit
            : limit // ignore: cast_nullable_to_non_nullable
                  as int,
        hasNext: null == hasNext
            ? _value.hasNext
            : hasNext // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$ChatRoomListResponseImpl implements _ChatRoomListResponse {
  const _$ChatRoomListResponseImpl({
    required final List<ChatRoom> chatRooms,
    required this.total,
    required this.page,
    required this.limit,
    required this.hasNext,
  }) : _chatRooms = chatRooms;

  factory _$ChatRoomListResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$ChatRoomListResponseImplFromJson(json);

  final List<ChatRoom> _chatRooms;
  @override
  List<ChatRoom> get chatRooms {
    if (_chatRooms is EqualUnmodifiableListView) return _chatRooms;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_chatRooms);
  }

  @override
  final int total;
  @override
  final int page;
  @override
  final int limit;
  @override
  final bool hasNext;

  @override
  String toString() {
    return 'ChatRoomListResponse(chatRooms: $chatRooms, total: $total, page: $page, limit: $limit, hasNext: $hasNext)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$ChatRoomListResponseImpl &&
            const DeepCollectionEquality().equals(
              other._chatRooms,
              _chatRooms,
            ) &&
            (identical(other.total, total) || other.total == total) &&
            (identical(other.page, page) || other.page == page) &&
            (identical(other.limit, limit) || other.limit == limit) &&
            (identical(other.hasNext, hasNext) || other.hasNext == hasNext));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    const DeepCollectionEquality().hash(_chatRooms),
    total,
    page,
    limit,
    hasNext,
  );

  /// Create a copy of ChatRoomListResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$ChatRoomListResponseImplCopyWith<_$ChatRoomListResponseImpl>
  get copyWith =>
      __$$ChatRoomListResponseImplCopyWithImpl<_$ChatRoomListResponseImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$ChatRoomListResponseImplToJson(this);
  }
}

abstract class _ChatRoomListResponse implements ChatRoomListResponse {
  const factory _ChatRoomListResponse({
    required final List<ChatRoom> chatRooms,
    required final int total,
    required final int page,
    required final int limit,
    required final bool hasNext,
  }) = _$ChatRoomListResponseImpl;

  factory _ChatRoomListResponse.fromJson(Map<String, dynamic> json) =
      _$ChatRoomListResponseImpl.fromJson;

  @override
  List<ChatRoom> get chatRooms;
  @override
  int get total;
  @override
  int get page;
  @override
  int get limit;
  @override
  bool get hasNext;

  /// Create a copy of ChatRoomListResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$ChatRoomListResponseImplCopyWith<_$ChatRoomListResponseImpl>
  get copyWith => throw _privateConstructorUsedError;
}

MessageListResponse _$MessageListResponseFromJson(Map<String, dynamic> json) {
  return _MessageListResponse.fromJson(json);
}

/// @nodoc
mixin _$MessageListResponse {
  List<Message> get messages => throw _privateConstructorUsedError;
  int get total => throw _privateConstructorUsedError;
  int get page => throw _privateConstructorUsedError;
  int get limit => throw _privateConstructorUsedError;
  bool get hasNext => throw _privateConstructorUsedError;

  /// Serializes this MessageListResponse to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of MessageListResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $MessageListResponseCopyWith<MessageListResponse> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $MessageListResponseCopyWith<$Res> {
  factory $MessageListResponseCopyWith(
    MessageListResponse value,
    $Res Function(MessageListResponse) then,
  ) = _$MessageListResponseCopyWithImpl<$Res, MessageListResponse>;
  @useResult
  $Res call({
    List<Message> messages,
    int total,
    int page,
    int limit,
    bool hasNext,
  });
}

/// @nodoc
class _$MessageListResponseCopyWithImpl<$Res, $Val extends MessageListResponse>
    implements $MessageListResponseCopyWith<$Res> {
  _$MessageListResponseCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of MessageListResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? messages = null,
    Object? total = null,
    Object? page = null,
    Object? limit = null,
    Object? hasNext = null,
  }) {
    return _then(
      _value.copyWith(
            messages: null == messages
                ? _value.messages
                : messages // ignore: cast_nullable_to_non_nullable
                      as List<Message>,
            total: null == total
                ? _value.total
                : total // ignore: cast_nullable_to_non_nullable
                      as int,
            page: null == page
                ? _value.page
                : page // ignore: cast_nullable_to_non_nullable
                      as int,
            limit: null == limit
                ? _value.limit
                : limit // ignore: cast_nullable_to_non_nullable
                      as int,
            hasNext: null == hasNext
                ? _value.hasNext
                : hasNext // ignore: cast_nullable_to_non_nullable
                      as bool,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$MessageListResponseImplCopyWith<$Res>
    implements $MessageListResponseCopyWith<$Res> {
  factory _$$MessageListResponseImplCopyWith(
    _$MessageListResponseImpl value,
    $Res Function(_$MessageListResponseImpl) then,
  ) = __$$MessageListResponseImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    List<Message> messages,
    int total,
    int page,
    int limit,
    bool hasNext,
  });
}

/// @nodoc
class __$$MessageListResponseImplCopyWithImpl<$Res>
    extends _$MessageListResponseCopyWithImpl<$Res, _$MessageListResponseImpl>
    implements _$$MessageListResponseImplCopyWith<$Res> {
  __$$MessageListResponseImplCopyWithImpl(
    _$MessageListResponseImpl _value,
    $Res Function(_$MessageListResponseImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of MessageListResponse
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? messages = null,
    Object? total = null,
    Object? page = null,
    Object? limit = null,
    Object? hasNext = null,
  }) {
    return _then(
      _$MessageListResponseImpl(
        messages: null == messages
            ? _value._messages
            : messages // ignore: cast_nullable_to_non_nullable
                  as List<Message>,
        total: null == total
            ? _value.total
            : total // ignore: cast_nullable_to_non_nullable
                  as int,
        page: null == page
            ? _value.page
            : page // ignore: cast_nullable_to_non_nullable
                  as int,
        limit: null == limit
            ? _value.limit
            : limit // ignore: cast_nullable_to_non_nullable
                  as int,
        hasNext: null == hasNext
            ? _value.hasNext
            : hasNext // ignore: cast_nullable_to_non_nullable
                  as bool,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$MessageListResponseImpl implements _MessageListResponse {
  const _$MessageListResponseImpl({
    required final List<Message> messages,
    required this.total,
    required this.page,
    required this.limit,
    required this.hasNext,
  }) : _messages = messages;

  factory _$MessageListResponseImpl.fromJson(Map<String, dynamic> json) =>
      _$$MessageListResponseImplFromJson(json);

  final List<Message> _messages;
  @override
  List<Message> get messages {
    if (_messages is EqualUnmodifiableListView) return _messages;
    // ignore: implicit_dynamic_type
    return EqualUnmodifiableListView(_messages);
  }

  @override
  final int total;
  @override
  final int page;
  @override
  final int limit;
  @override
  final bool hasNext;

  @override
  String toString() {
    return 'MessageListResponse(messages: $messages, total: $total, page: $page, limit: $limit, hasNext: $hasNext)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$MessageListResponseImpl &&
            const DeepCollectionEquality().equals(other._messages, _messages) &&
            (identical(other.total, total) || other.total == total) &&
            (identical(other.page, page) || other.page == page) &&
            (identical(other.limit, limit) || other.limit == limit) &&
            (identical(other.hasNext, hasNext) || other.hasNext == hasNext));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    const DeepCollectionEquality().hash(_messages),
    total,
    page,
    limit,
    hasNext,
  );

  /// Create a copy of MessageListResponse
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$MessageListResponseImplCopyWith<_$MessageListResponseImpl> get copyWith =>
      __$$MessageListResponseImplCopyWithImpl<_$MessageListResponseImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$MessageListResponseImplToJson(this);
  }
}

abstract class _MessageListResponse implements MessageListResponse {
  const factory _MessageListResponse({
    required final List<Message> messages,
    required final int total,
    required final int page,
    required final int limit,
    required final bool hasNext,
  }) = _$MessageListResponseImpl;

  factory _MessageListResponse.fromJson(Map<String, dynamic> json) =
      _$MessageListResponseImpl.fromJson;

  @override
  List<Message> get messages;
  @override
  int get total;
  @override
  int get page;
  @override
  int get limit;
  @override
  bool get hasNext;

  /// Create a copy of MessageListResponse
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$MessageListResponseImplCopyWith<_$MessageListResponseImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

SendMessageRequest _$SendMessageRequestFromJson(Map<String, dynamic> json) {
  return _SendMessageRequest.fromJson(json);
}

/// @nodoc
mixin _$SendMessageRequest {
  String get chatRoomId => throw _privateConstructorUsedError;
  String get content => throw _privateConstructorUsedError;
  MessageType get type => throw _privateConstructorUsedError;
  Map<String, dynamic>? get metadata => throw _privateConstructorUsedError;

  /// Serializes this SendMessageRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of SendMessageRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $SendMessageRequestCopyWith<SendMessageRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $SendMessageRequestCopyWith<$Res> {
  factory $SendMessageRequestCopyWith(
    SendMessageRequest value,
    $Res Function(SendMessageRequest) then,
  ) = _$SendMessageRequestCopyWithImpl<$Res, SendMessageRequest>;
  @useResult
  $Res call({
    String chatRoomId,
    String content,
    MessageType type,
    Map<String, dynamic>? metadata,
  });
}

/// @nodoc
class _$SendMessageRequestCopyWithImpl<$Res, $Val extends SendMessageRequest>
    implements $SendMessageRequestCopyWith<$Res> {
  _$SendMessageRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of SendMessageRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? chatRoomId = null,
    Object? content = null,
    Object? type = null,
    Object? metadata = freezed,
  }) {
    return _then(
      _value.copyWith(
            chatRoomId: null == chatRoomId
                ? _value.chatRoomId
                : chatRoomId // ignore: cast_nullable_to_non_nullable
                      as String,
            content: null == content
                ? _value.content
                : content // ignore: cast_nullable_to_non_nullable
                      as String,
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as MessageType,
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
abstract class _$$SendMessageRequestImplCopyWith<$Res>
    implements $SendMessageRequestCopyWith<$Res> {
  factory _$$SendMessageRequestImplCopyWith(
    _$SendMessageRequestImpl value,
    $Res Function(_$SendMessageRequestImpl) then,
  ) = __$$SendMessageRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({
    String chatRoomId,
    String content,
    MessageType type,
    Map<String, dynamic>? metadata,
  });
}

/// @nodoc
class __$$SendMessageRequestImplCopyWithImpl<$Res>
    extends _$SendMessageRequestCopyWithImpl<$Res, _$SendMessageRequestImpl>
    implements _$$SendMessageRequestImplCopyWith<$Res> {
  __$$SendMessageRequestImplCopyWithImpl(
    _$SendMessageRequestImpl _value,
    $Res Function(_$SendMessageRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of SendMessageRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? chatRoomId = null,
    Object? content = null,
    Object? type = null,
    Object? metadata = freezed,
  }) {
    return _then(
      _$SendMessageRequestImpl(
        chatRoomId: null == chatRoomId
            ? _value.chatRoomId
            : chatRoomId // ignore: cast_nullable_to_non_nullable
                  as String,
        content: null == content
            ? _value.content
            : content // ignore: cast_nullable_to_non_nullable
                  as String,
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as MessageType,
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
class _$SendMessageRequestImpl implements _SendMessageRequest {
  const _$SendMessageRequestImpl({
    required this.chatRoomId,
    required this.content,
    this.type = MessageType.text,
    final Map<String, dynamic>? metadata,
  }) : _metadata = metadata;

  factory _$SendMessageRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$SendMessageRequestImplFromJson(json);

  @override
  final String chatRoomId;
  @override
  final String content;
  @override
  @JsonKey()
  final MessageType type;
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
    return 'SendMessageRequest(chatRoomId: $chatRoomId, content: $content, type: $type, metadata: $metadata)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$SendMessageRequestImpl &&
            (identical(other.chatRoomId, chatRoomId) ||
                other.chatRoomId == chatRoomId) &&
            (identical(other.content, content) || other.content == content) &&
            (identical(other.type, type) || other.type == type) &&
            const DeepCollectionEquality().equals(other._metadata, _metadata));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(
    runtimeType,
    chatRoomId,
    content,
    type,
    const DeepCollectionEquality().hash(_metadata),
  );

  /// Create a copy of SendMessageRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$SendMessageRequestImplCopyWith<_$SendMessageRequestImpl> get copyWith =>
      __$$SendMessageRequestImplCopyWithImpl<_$SendMessageRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$SendMessageRequestImplToJson(this);
  }
}

abstract class _SendMessageRequest implements SendMessageRequest {
  const factory _SendMessageRequest({
    required final String chatRoomId,
    required final String content,
    final MessageType type,
    final Map<String, dynamic>? metadata,
  }) = _$SendMessageRequestImpl;

  factory _SendMessageRequest.fromJson(Map<String, dynamic> json) =
      _$SendMessageRequestImpl.fromJson;

  @override
  String get chatRoomId;
  @override
  String get content;
  @override
  MessageType get type;
  @override
  Map<String, dynamic>? get metadata;

  /// Create a copy of SendMessageRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$SendMessageRequestImplCopyWith<_$SendMessageRequestImpl> get copyWith =>
      throw _privateConstructorUsedError;
}

CreateChatRoomRequest _$CreateChatRoomRequestFromJson(
  Map<String, dynamic> json,
) {
  return _CreateChatRoomRequest.fromJson(json);
}

/// @nodoc
mixin _$CreateChatRoomRequest {
  String get participantId => throw _privateConstructorUsedError;
  String? get name => throw _privateConstructorUsedError;
  ChatRoomType get type => throw _privateConstructorUsedError;

  /// Serializes this CreateChatRoomRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of CreateChatRoomRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $CreateChatRoomRequestCopyWith<CreateChatRoomRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $CreateChatRoomRequestCopyWith<$Res> {
  factory $CreateChatRoomRequestCopyWith(
    CreateChatRoomRequest value,
    $Res Function(CreateChatRoomRequest) then,
  ) = _$CreateChatRoomRequestCopyWithImpl<$Res, CreateChatRoomRequest>;
  @useResult
  $Res call({String participantId, String? name, ChatRoomType type});
}

/// @nodoc
class _$CreateChatRoomRequestCopyWithImpl<
  $Res,
  $Val extends CreateChatRoomRequest
>
    implements $CreateChatRoomRequestCopyWith<$Res> {
  _$CreateChatRoomRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of CreateChatRoomRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? participantId = null,
    Object? name = freezed,
    Object? type = null,
  }) {
    return _then(
      _value.copyWith(
            participantId: null == participantId
                ? _value.participantId
                : participantId // ignore: cast_nullable_to_non_nullable
                      as String,
            name: freezed == name
                ? _value.name
                : name // ignore: cast_nullable_to_non_nullable
                      as String?,
            type: null == type
                ? _value.type
                : type // ignore: cast_nullable_to_non_nullable
                      as ChatRoomType,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$CreateChatRoomRequestImplCopyWith<$Res>
    implements $CreateChatRoomRequestCopyWith<$Res> {
  factory _$$CreateChatRoomRequestImplCopyWith(
    _$CreateChatRoomRequestImpl value,
    $Res Function(_$CreateChatRoomRequestImpl) then,
  ) = __$$CreateChatRoomRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String participantId, String? name, ChatRoomType type});
}

/// @nodoc
class __$$CreateChatRoomRequestImplCopyWithImpl<$Res>
    extends
        _$CreateChatRoomRequestCopyWithImpl<$Res, _$CreateChatRoomRequestImpl>
    implements _$$CreateChatRoomRequestImplCopyWith<$Res> {
  __$$CreateChatRoomRequestImplCopyWithImpl(
    _$CreateChatRoomRequestImpl _value,
    $Res Function(_$CreateChatRoomRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of CreateChatRoomRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({
    Object? participantId = null,
    Object? name = freezed,
    Object? type = null,
  }) {
    return _then(
      _$CreateChatRoomRequestImpl(
        participantId: null == participantId
            ? _value.participantId
            : participantId // ignore: cast_nullable_to_non_nullable
                  as String,
        name: freezed == name
            ? _value.name
            : name // ignore: cast_nullable_to_non_nullable
                  as String?,
        type: null == type
            ? _value.type
            : type // ignore: cast_nullable_to_non_nullable
                  as ChatRoomType,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$CreateChatRoomRequestImpl implements _CreateChatRoomRequest {
  const _$CreateChatRoomRequestImpl({
    required this.participantId,
    this.name,
    this.type = ChatRoomType.direct,
  });

  factory _$CreateChatRoomRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$CreateChatRoomRequestImplFromJson(json);

  @override
  final String participantId;
  @override
  final String? name;
  @override
  @JsonKey()
  final ChatRoomType type;

  @override
  String toString() {
    return 'CreateChatRoomRequest(participantId: $participantId, name: $name, type: $type)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$CreateChatRoomRequestImpl &&
            (identical(other.participantId, participantId) ||
                other.participantId == participantId) &&
            (identical(other.name, name) || other.name == name) &&
            (identical(other.type, type) || other.type == type));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, participantId, name, type);

  /// Create a copy of CreateChatRoomRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$CreateChatRoomRequestImplCopyWith<_$CreateChatRoomRequestImpl>
  get copyWith =>
      __$$CreateChatRoomRequestImplCopyWithImpl<_$CreateChatRoomRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$CreateChatRoomRequestImplToJson(this);
  }
}

abstract class _CreateChatRoomRequest implements CreateChatRoomRequest {
  const factory _CreateChatRoomRequest({
    required final String participantId,
    final String? name,
    final ChatRoomType type,
  }) = _$CreateChatRoomRequestImpl;

  factory _CreateChatRoomRequest.fromJson(Map<String, dynamic> json) =
      _$CreateChatRoomRequestImpl.fromJson;

  @override
  String get participantId;
  @override
  String? get name;
  @override
  ChatRoomType get type;

  /// Create a copy of CreateChatRoomRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$CreateChatRoomRequestImplCopyWith<_$CreateChatRoomRequestImpl>
  get copyWith => throw _privateConstructorUsedError;
}

UpdateMessageRequest _$UpdateMessageRequestFromJson(Map<String, dynamic> json) {
  return _UpdateMessageRequest.fromJson(json);
}

/// @nodoc
mixin _$UpdateMessageRequest {
  String get content => throw _privateConstructorUsedError;

  /// Serializes this UpdateMessageRequest to a JSON map.
  Map<String, dynamic> toJson() => throw _privateConstructorUsedError;

  /// Create a copy of UpdateMessageRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  $UpdateMessageRequestCopyWith<UpdateMessageRequest> get copyWith =>
      throw _privateConstructorUsedError;
}

/// @nodoc
abstract class $UpdateMessageRequestCopyWith<$Res> {
  factory $UpdateMessageRequestCopyWith(
    UpdateMessageRequest value,
    $Res Function(UpdateMessageRequest) then,
  ) = _$UpdateMessageRequestCopyWithImpl<$Res, UpdateMessageRequest>;
  @useResult
  $Res call({String content});
}

/// @nodoc
class _$UpdateMessageRequestCopyWithImpl<
  $Res,
  $Val extends UpdateMessageRequest
>
    implements $UpdateMessageRequestCopyWith<$Res> {
  _$UpdateMessageRequestCopyWithImpl(this._value, this._then);

  // ignore: unused_field
  final $Val _value;
  // ignore: unused_field
  final $Res Function($Val) _then;

  /// Create a copy of UpdateMessageRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? content = null}) {
    return _then(
      _value.copyWith(
            content: null == content
                ? _value.content
                : content // ignore: cast_nullable_to_non_nullable
                      as String,
          )
          as $Val,
    );
  }
}

/// @nodoc
abstract class _$$UpdateMessageRequestImplCopyWith<$Res>
    implements $UpdateMessageRequestCopyWith<$Res> {
  factory _$$UpdateMessageRequestImplCopyWith(
    _$UpdateMessageRequestImpl value,
    $Res Function(_$UpdateMessageRequestImpl) then,
  ) = __$$UpdateMessageRequestImplCopyWithImpl<$Res>;
  @override
  @useResult
  $Res call({String content});
}

/// @nodoc
class __$$UpdateMessageRequestImplCopyWithImpl<$Res>
    extends _$UpdateMessageRequestCopyWithImpl<$Res, _$UpdateMessageRequestImpl>
    implements _$$UpdateMessageRequestImplCopyWith<$Res> {
  __$$UpdateMessageRequestImplCopyWithImpl(
    _$UpdateMessageRequestImpl _value,
    $Res Function(_$UpdateMessageRequestImpl) _then,
  ) : super(_value, _then);

  /// Create a copy of UpdateMessageRequest
  /// with the given fields replaced by the non-null parameter values.
  @pragma('vm:prefer-inline')
  @override
  $Res call({Object? content = null}) {
    return _then(
      _$UpdateMessageRequestImpl(
        content: null == content
            ? _value.content
            : content // ignore: cast_nullable_to_non_nullable
                  as String,
      ),
    );
  }
}

/// @nodoc
@JsonSerializable()
class _$UpdateMessageRequestImpl implements _UpdateMessageRequest {
  const _$UpdateMessageRequestImpl({required this.content});

  factory _$UpdateMessageRequestImpl.fromJson(Map<String, dynamic> json) =>
      _$$UpdateMessageRequestImplFromJson(json);

  @override
  final String content;

  @override
  String toString() {
    return 'UpdateMessageRequest(content: $content)';
  }

  @override
  bool operator ==(Object other) {
    return identical(this, other) ||
        (other.runtimeType == runtimeType &&
            other is _$UpdateMessageRequestImpl &&
            (identical(other.content, content) || other.content == content));
  }

  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  int get hashCode => Object.hash(runtimeType, content);

  /// Create a copy of UpdateMessageRequest
  /// with the given fields replaced by the non-null parameter values.
  @JsonKey(includeFromJson: false, includeToJson: false)
  @override
  @pragma('vm:prefer-inline')
  _$$UpdateMessageRequestImplCopyWith<_$UpdateMessageRequestImpl>
  get copyWith =>
      __$$UpdateMessageRequestImplCopyWithImpl<_$UpdateMessageRequestImpl>(
        this,
        _$identity,
      );

  @override
  Map<String, dynamic> toJson() {
    return _$$UpdateMessageRequestImplToJson(this);
  }
}

abstract class _UpdateMessageRequest implements UpdateMessageRequest {
  const factory _UpdateMessageRequest({required final String content}) =
      _$UpdateMessageRequestImpl;

  factory _UpdateMessageRequest.fromJson(Map<String, dynamic> json) =
      _$UpdateMessageRequestImpl.fromJson;

  @override
  String get content;

  /// Create a copy of UpdateMessageRequest
  /// with the given fields replaced by the non-null parameter values.
  @override
  @JsonKey(includeFromJson: false, includeToJson: false)
  _$$UpdateMessageRequestImplCopyWith<_$UpdateMessageRequestImpl>
  get copyWith => throw _privateConstructorUsedError;
}
