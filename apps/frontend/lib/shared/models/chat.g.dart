// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'chat.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

_$ChatRoomImpl _$$ChatRoomImplFromJson(Map<String, dynamic> json) =>
    _$ChatRoomImpl(
      id: json['id'] as String,
      name: json['name'] as String,
      type: $enumDecode(_$ChatRoomTypeEnumMap, json['type']),
      status: $enumDecode(_$ChatRoomStatusEnumMap, json['status']),
      otherParticipant: ChatParticipant.fromJson(
        json['otherParticipant'] as Map<String, dynamic>,
      ),
      lastMessage: json['lastMessage'] as String?,
      lastMessageAt: json['lastMessageAt'] == null
          ? null
          : DateTime.parse(json['lastMessageAt'] as String),
      unreadCount: (json['unreadCount'] as num?)?.toInt() ?? 0,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$ChatRoomImplToJson(_$ChatRoomImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'name': instance.name,
      'type': _$ChatRoomTypeEnumMap[instance.type]!,
      'status': _$ChatRoomStatusEnumMap[instance.status]!,
      'otherParticipant': instance.otherParticipant,
      'lastMessage': instance.lastMessage,
      'lastMessageAt': instance.lastMessageAt?.toIso8601String(),
      'unreadCount': instance.unreadCount,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

const _$ChatRoomTypeEnumMap = {
  ChatRoomType.direct: 'direct',
  ChatRoomType.group: 'group',
};

const _$ChatRoomStatusEnumMap = {
  ChatRoomStatus.active: 'active',
  ChatRoomStatus.archived: 'archived',
  ChatRoomStatus.blocked: 'blocked',
};

_$ChatParticipantImpl _$$ChatParticipantImplFromJson(
  Map<String, dynamic> json,
) => _$ChatParticipantImpl(
  id: json['id'] as String,
  nickname: json['nickname'] as String?,
  avatarUrl: json['avatarUrl'] as String?,
);

Map<String, dynamic> _$$ChatParticipantImplToJson(
  _$ChatParticipantImpl instance,
) => <String, dynamic>{
  'id': instance.id,
  'nickname': instance.nickname,
  'avatarUrl': instance.avatarUrl,
};

_$MessageImpl _$$MessageImplFromJson(Map<String, dynamic> json) =>
    _$MessageImpl(
      id: json['id'] as String,
      content: json['content'] as String,
      type: $enumDecode(_$MessageTypeEnumMap, json['type']),
      status: $enumDecode(_$MessageStatusEnumMap, json['status']),
      sender: ChatParticipant.fromJson(json['sender'] as Map<String, dynamic>),
      metadata: json['metadata'] as Map<String, dynamic>?,
      readAt: json['readAt'] == null
          ? null
          : DateTime.parse(json['readAt'] as String),
      deliveredAt: json['deliveredAt'] == null
          ? null
          : DateTime.parse(json['deliveredAt'] as String),
      editedAt: json['editedAt'] == null
          ? null
          : DateTime.parse(json['editedAt'] as String),
      isDeleted: json['isDeleted'] as bool? ?? false,
      createdAt: DateTime.parse(json['createdAt'] as String),
      updatedAt: DateTime.parse(json['updatedAt'] as String),
    );

Map<String, dynamic> _$$MessageImplToJson(_$MessageImpl instance) =>
    <String, dynamic>{
      'id': instance.id,
      'content': instance.content,
      'type': _$MessageTypeEnumMap[instance.type]!,
      'status': _$MessageStatusEnumMap[instance.status]!,
      'sender': instance.sender,
      'metadata': instance.metadata,
      'readAt': instance.readAt?.toIso8601String(),
      'deliveredAt': instance.deliveredAt?.toIso8601String(),
      'editedAt': instance.editedAt?.toIso8601String(),
      'isDeleted': instance.isDeleted,
      'createdAt': instance.createdAt.toIso8601String(),
      'updatedAt': instance.updatedAt.toIso8601String(),
    };

const _$MessageTypeEnumMap = {
  MessageType.text: 'text',
  MessageType.image: 'image',
  MessageType.video: 'video',
  MessageType.audio: 'audio',
  MessageType.file: 'file',
  MessageType.location: 'location',
};

const _$MessageStatusEnumMap = {
  MessageStatus.sending: 'sending',
  MessageStatus.sent: 'sent',
  MessageStatus.delivered: 'delivered',
  MessageStatus.read: 'read',
  MessageStatus.failed: 'failed',
};

_$ChatRoomListResponseImpl _$$ChatRoomListResponseImplFromJson(
  Map<String, dynamic> json,
) => _$ChatRoomListResponseImpl(
  chatRooms: (json['chatRooms'] as List<dynamic>)
      .map((e) => ChatRoom.fromJson(e as Map<String, dynamic>))
      .toList(),
  total: (json['total'] as num).toInt(),
  page: (json['page'] as num).toInt(),
  limit: (json['limit'] as num).toInt(),
  hasNext: json['hasNext'] as bool,
);

Map<String, dynamic> _$$ChatRoomListResponseImplToJson(
  _$ChatRoomListResponseImpl instance,
) => <String, dynamic>{
  'chatRooms': instance.chatRooms,
  'total': instance.total,
  'page': instance.page,
  'limit': instance.limit,
  'hasNext': instance.hasNext,
};

_$MessageListResponseImpl _$$MessageListResponseImplFromJson(
  Map<String, dynamic> json,
) => _$MessageListResponseImpl(
  messages: (json['messages'] as List<dynamic>)
      .map((e) => Message.fromJson(e as Map<String, dynamic>))
      .toList(),
  total: (json['total'] as num).toInt(),
  page: (json['page'] as num).toInt(),
  limit: (json['limit'] as num).toInt(),
  hasNext: json['hasNext'] as bool,
);

Map<String, dynamic> _$$MessageListResponseImplToJson(
  _$MessageListResponseImpl instance,
) => <String, dynamic>{
  'messages': instance.messages,
  'total': instance.total,
  'page': instance.page,
  'limit': instance.limit,
  'hasNext': instance.hasNext,
};

_$SendMessageRequestImpl _$$SendMessageRequestImplFromJson(
  Map<String, dynamic> json,
) => _$SendMessageRequestImpl(
  chatRoomId: json['chatRoomId'] as String,
  content: json['content'] as String,
  type:
      $enumDecodeNullable(_$MessageTypeEnumMap, json['type']) ??
      MessageType.text,
  metadata: json['metadata'] as Map<String, dynamic>?,
);

Map<String, dynamic> _$$SendMessageRequestImplToJson(
  _$SendMessageRequestImpl instance,
) => <String, dynamic>{
  'chatRoomId': instance.chatRoomId,
  'content': instance.content,
  'type': _$MessageTypeEnumMap[instance.type]!,
  'metadata': instance.metadata,
};

_$CreateChatRoomRequestImpl _$$CreateChatRoomRequestImplFromJson(
  Map<String, dynamic> json,
) => _$CreateChatRoomRequestImpl(
  participantId: json['participantId'] as String,
  name: json['name'] as String?,
  type:
      $enumDecodeNullable(_$ChatRoomTypeEnumMap, json['type']) ??
      ChatRoomType.direct,
);

Map<String, dynamic> _$$CreateChatRoomRequestImplToJson(
  _$CreateChatRoomRequestImpl instance,
) => <String, dynamic>{
  'participantId': instance.participantId,
  'name': instance.name,
  'type': _$ChatRoomTypeEnumMap[instance.type]!,
};

_$UpdateMessageRequestImpl _$$UpdateMessageRequestImplFromJson(
  Map<String, dynamic> json,
) => _$UpdateMessageRequestImpl(content: json['content'] as String);

Map<String, dynamic> _$$UpdateMessageRequestImplToJson(
  _$UpdateMessageRequestImpl instance,
) => <String, dynamic>{'content': instance.content};
