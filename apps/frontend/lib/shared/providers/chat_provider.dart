import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/chat.dart';
import '../services/chat_service.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';

// 채팅방 목록 Provider
final chatRoomsProvider = StateNotifierProvider<ChatRoomsNotifier, AsyncValue<List<ChatRoom>>>((ref) {
  return ChatRoomsNotifier(ref.read(chatServiceProvider));
});

class ChatRoomsNotifier extends StateNotifier<AsyncValue<List<ChatRoom>>> {
  final ChatService _chatService;
  
  ChatRoomsNotifier(this._chatService) : super(const AsyncValue.loading());

  Future<void> loadChatRooms({
    int page = 1,
    int limit = 20,
    ChatRoomStatus? status,
  }) async {
    try {
      state = const AsyncValue.loading();
      final response = await _chatService.getChatRooms(
        page: page,
        limit: limit,
        status: status,
      );
      state = AsyncValue.data(response.chatRooms);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> refreshChatRooms() async {
    await loadChatRooms();
  }

  void updateChatRoomLastMessage(String roomId, String lastMessage, DateTime timestamp) {
    state.whenData((chatRooms) {
      final updatedRooms = chatRooms.map((room) {
        if (room.id == roomId) {
          return room.copyWith(
            lastMessage: lastMessage,
            lastMessageAt: timestamp,
          );
        }
        return room;
      }).toList();
      
      // 최신 메시지 순으로 정렬
      updatedRooms.sort((a, b) {
        final aTime = a.lastMessageAt ?? a.createdAt;
        final bTime = b.lastMessageAt ?? b.createdAt;
        return bTime.compareTo(aTime);
      });
      
      state = AsyncValue.data(updatedRooms);
    });
  }

  void incrementUnreadCount(String roomId) {
    state.whenData((chatRooms) {
      final updatedRooms = chatRooms.map((room) {
        if (room.id == roomId) {
          return room.copyWith(unreadCount: room.unreadCount + 1);
        }
        return room;
      }).toList();
      state = AsyncValue.data(updatedRooms);
    });
  }

  void resetUnreadCount(String roomId) {
    state.whenData((chatRooms) {
      final updatedRooms = chatRooms.map((room) {
        if (room.id == roomId) {
          return room.copyWith(unreadCount: 0);
        }
        return room;
      }).toList();
      state = AsyncValue.data(updatedRooms);
    });
  }
}

// 특정 채팅방의 메시지 목록 Provider
final messagesProvider = StateNotifierProvider.family<MessagesNotifier, AsyncValue<List<Message>>, String>((ref, roomId) {
  return MessagesNotifier(ref.read(chatServiceProvider), roomId, ref);
});

class MessagesNotifier extends StateNotifier<AsyncValue<List<Message>>> {
  final ChatService _chatService;
  final String _roomId;
  final Ref _ref;
  
  MessagesNotifier(this._chatService, this._roomId, this._ref) : super(const AsyncValue.loading());

  Future<void> loadMessages({
    int page = 1,
    int limit = 50,
    String? beforeMessageId,
  }) async {
    try {
      if (page == 1) {
        state = const AsyncValue.loading();
      }
      
      final response = await _chatService.getMessages(
        _roomId,
        page: page,
        limit: limit,
        beforeMessageId: beforeMessageId,
      );
      
      if (page == 1) {
        // 첫 페이지는 전체 교체
        state = AsyncValue.data(response.messages.reversed.toList());
      } else {
        // 이후 페이지는 기존 메시지에 추가 (과거 메시지)
        state.whenData((existingMessages) {
          final updatedMessages = [
            ...response.messages.reversed.toList(),
            ...existingMessages,
          ];
          state = AsyncValue.data(updatedMessages);
        });
      }
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }

  Future<void> sendMessage(String content, {MessageType type = MessageType.text}) async {
    try {
      // 낙관적 업데이트: 메시지를 즉시 UI에 추가
      final tempMessage = Message(
        id: 'temp_${DateTime.now().millisecondsSinceEpoch}',
        content: content,
        type: type,
        status: MessageStatus.sending,
        sender: ChatParticipant(
          id: _ref.read(currentUserProvider)?.id ?? 'me',
          nickname: _ref.read(currentUserProvider)?.username ?? 'Me',
        ),
        createdAt: DateTime.now(),
        updatedAt: DateTime.now(),
      );

      state.whenData((messages) {
        state = AsyncValue.data([...messages, tempMessage]);
      });

      // 실제 API 호출
      final request = SendMessageRequest(
        chatRoomId: _roomId,
        content: content,
        type: type,
      );
      
      final sentMessage = await _chatService.sendMessage(request);
      
      // 임시 메시지를 실제 메시지로 교체
      state.whenData((messages) {
        final updatedMessages = messages.map((msg) {
          if (msg.id == tempMessage.id) {
            return sentMessage;
          }
          return msg;
        }).toList();
        state = AsyncValue.data(updatedMessages);
      });

    } catch (error) {
      // 에러 발생 시 임시 메시지를 실패 상태로 변경
      state.whenData((messages) {
        final updatedMessages = messages.map((msg) {
          if (msg.id.startsWith('temp_')) {
            return msg.copyWith(status: MessageStatus.failed);
          }
          return msg;
        }).toList();
        state = AsyncValue.data(updatedMessages);
      });
      rethrow;
    }
  }

  Future<void> markAsRead() async {
    try {
      await _chatService.markAsRead(_roomId);
      
      // 읽음 상태 업데이트
      state.whenData((messages) {
        final updatedMessages = messages.map((msg) {
          if (msg.status == MessageStatus.delivered) {
            return msg.copyWith(
              status: MessageStatus.read,
              readAt: DateTime.now(),
            );
          }
          return msg;
        }).toList();
        state = AsyncValue.data(updatedMessages);
      });
    } catch (error) {
      // 읽음 처리 실패는 조용히 무시
    }
  }

  // 새 메시지 추가 (웹소켓 수신용)
  void addNewMessage(Message newMessage) {
    state.whenData((messages) {
      // 중복 체크 (이미 있는 메시지인지 확인)
      final exists = messages.any((msg) => msg.id == newMessage.id);
      if (!exists) {
        // 새 메시지 추가 (끝에 추가)
        final updatedMessages = [...messages, newMessage];
        state = AsyncValue.data(updatedMessages);
      }
    });
  }

  // 여러 메시지 한번에 추가 (선택적)
  void addMessages(List<Message> newMessages) {
    state.whenData((messages) {
      final existingIds = messages.map((m) => m.id).toSet();
      final messagesToAdd = newMessages.where((msg) => !existingIds.contains(msg.id)).toList();
      
      if (messagesToAdd.isNotEmpty) {
        final updatedMessages = [...messages, ...messagesToAdd];
        state = AsyncValue.data(updatedMessages);
      }
    });
  }

  Future<void> retryMessage(String tempMessageId) async {
    state.whenData((messages) {
      final message = messages.firstWhere((msg) => msg.id == tempMessageId);
      if (message.status == MessageStatus.failed) {
        sendMessage(message.content, type: message.type);
      }
    });
  }

  Future<void> deleteMessage(String messageId) async {
    try {
      await _chatService.deleteMessage(messageId);
      
      state.whenData((messages) {
        final updatedMessages = messages.map((msg) {
          if (msg.id == messageId) {
            return msg.copyWith(isDeleted: true);
          }
          return msg;
        }).toList();
        state = AsyncValue.data(updatedMessages);
      });
    } catch (error) {
      rethrow;
    }
  }

  Future<void> editMessage(String messageId, String newContent) async {
    try {
      final request = UpdateMessageRequest(content: newContent);
      final updatedMessage = await _chatService.updateMessage(messageId, request);
      
      state.whenData((messages) {
        final updatedMessages = messages.map((msg) {
          if (msg.id == messageId) {
            return updatedMessage;
          }
          return msg;
        }).toList();
        state = AsyncValue.data(updatedMessages);
      });
    } catch (error) {
      rethrow;
    }
  }
}

// 현재 활성 채팅방 Provider
final activeChatRoomProvider = StateProvider<String?>((ref) => null);

// 채팅방 생성 Provider
final createChatRoomProvider = Provider<Future<ChatRoom> Function(CreateChatRoomRequest)>((ref) {
  final chatService = ref.read(chatServiceProvider);
  return (request) => chatService.createChatRoom(request);
});

// 채팅 필터 Provider
final chatFilterProvider = StateProvider<ChatRoomStatus?>((ref) => null);

// 채팅 검색 쿼리 Provider
final chatSearchQueryProvider = StateProvider<String>((ref) => '');

// 필터링된 채팅방 목록 Provider
final filteredChatRoomsProvider = Provider<AsyncValue<List<ChatRoom>>>((ref) {
  final chatRooms = ref.watch(chatRoomsProvider);
  final filter = ref.watch(chatFilterProvider);
  final searchQuery = ref.watch(chatSearchQueryProvider);

  return chatRooms.when(
    data: (rooms) {
      var filteredRooms = rooms;

      // 상태 필터 적용
      if (filter != null) {
        filteredRooms = filteredRooms.where((room) => room.status == filter).toList();
      }

      // 검색 쿼리 적용
      if (searchQuery.isNotEmpty) {
        filteredRooms = filteredRooms.where((room) {
          final query = searchQuery.toLowerCase();
          return room.name.toLowerCase().contains(query) ||
                 (room.otherParticipant.nickname?.toLowerCase().contains(query) ?? false) ||
                 (room.lastMessage?.toLowerCase().contains(query) ?? false);
        }).toList();
      }

      return AsyncValue.data(filteredRooms);
    },
    loading: () => const AsyncValue.loading(),
    error: (error, stackTrace) => AsyncValue.error(error, stackTrace),
  );
});

// 읽지 않은 메시지 총 개수 Provider
final totalUnreadCountProvider = Provider<int>((ref) {
  final chatRooms = ref.watch(chatRoomsProvider);
  return chatRooms.when(
    data: (rooms) => rooms.fold(0, (sum, room) => sum + room.unreadCount),
    loading: () => 0,
    error: (_, __) => 0,
  );
});