import 'package:freezed_annotation/freezed_annotation.dart';

part 'chat.freezed.dart';
part 'chat.g.dart';

@freezed
class ChatRoom with _$ChatRoom {
  const factory ChatRoom({
    required String id,
    required String name,
    required ChatRoomType type,
    required ChatRoomStatus status,
    required ChatParticipant otherParticipant,
    String? lastMessage,
    DateTime? lastMessageAt,
    @Default(0) int unreadCount,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _ChatRoom;

  factory ChatRoom.fromJson(Map<String, dynamic> json) => _$ChatRoomFromJson(json);
}

@freezed
class ChatParticipant with _$ChatParticipant {
  const factory ChatParticipant({
    required String id,
    String? nickname,
    String? avatarUrl,
  }) = _ChatParticipant;

  factory ChatParticipant.fromJson(Map<String, dynamic> json) => _$ChatParticipantFromJson(json);
}

@freezed
class Message with _$Message {
  const factory Message({
    required String id,
    required String content,
    required MessageType type,
    required MessageStatus status,
    required ChatParticipant sender,
    Map<String, dynamic>? metadata,
    DateTime? readAt,
    DateTime? deliveredAt,
    DateTime? editedAt,
    @Default(false) bool isDeleted,
    required DateTime createdAt,
    required DateTime updatedAt,
  }) = _Message;

  factory Message.fromJson(Map<String, dynamic> json) => _$MessageFromJson(json);
}

@freezed
class ChatRoomListResponse with _$ChatRoomListResponse {
  const factory ChatRoomListResponse({
    required List<ChatRoom> chatRooms,
    required int total,
    required int page,
    required int limit,
    required bool hasNext,
  }) = _ChatRoomListResponse;

  factory ChatRoomListResponse.fromJson(Map<String, dynamic> json) => _$ChatRoomListResponseFromJson(json);
}

@freezed
class MessageListResponse with _$MessageListResponse {
  const factory MessageListResponse({
    required List<Message> messages,
    required int total,
    required int page,
    required int limit,
    required bool hasNext,
  }) = _MessageListResponse;

  factory MessageListResponse.fromJson(Map<String, dynamic> json) => _$MessageListResponseFromJson(json);
}

@freezed
class SendMessageRequest with _$SendMessageRequest {
  const factory SendMessageRequest({
    required String chatRoomId,
    required String content,
    @Default(MessageType.text) MessageType type,
    Map<String, dynamic>? metadata,
  }) = _SendMessageRequest;

  factory SendMessageRequest.fromJson(Map<String, dynamic> json) => _$SendMessageRequestFromJson(json);
}

@freezed
class CreateChatRoomRequest with _$CreateChatRoomRequest {
  const factory CreateChatRoomRequest({
    required String participantId,
    String? name,
    @Default(ChatRoomType.direct) ChatRoomType type,
  }) = _CreateChatRoomRequest;

  factory CreateChatRoomRequest.fromJson(Map<String, dynamic> json) => _$CreateChatRoomRequestFromJson(json);
}

@freezed
class UpdateMessageRequest with _$UpdateMessageRequest {
  const factory UpdateMessageRequest({
    required String content,
  }) = _UpdateMessageRequest;

  factory UpdateMessageRequest.fromJson(Map<String, dynamic> json) => _$UpdateMessageRequestFromJson(json);
}

enum ChatRoomType {
  @JsonValue('direct')
  direct,
  @JsonValue('group')
  group,
}

enum ChatRoomStatus {
  @JsonValue('active')
  active,
  @JsonValue('archived')
  archived,
  @JsonValue('blocked')
  blocked,
}

enum MessageType {
  @JsonValue('text')
  text,
  @JsonValue('image')
  image,
  @JsonValue('video')
  video,
  @JsonValue('audio')
  audio,
  @JsonValue('file')
  file,
  @JsonValue('location')
  location,
}

enum MessageStatus {
  @JsonValue('sending')
  sending,
  @JsonValue('sent')
  sent,
  @JsonValue('delivered')
  delivered,
  @JsonValue('read')
  read,
  @JsonValue('failed')
  failed,
}