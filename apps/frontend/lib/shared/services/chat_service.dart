import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/chat.dart';
import '../../core/api/api_client.dart';

final chatServiceProvider = Provider<ChatService>((ref) {
  final apiClient = ApiClient();
  return ChatService(apiClient.dio);
});

class ChatService {
  final Dio _dio;

  ChatService(this._dio);

  // 채팅방 목록 조회
  Future<ChatRoomListResponse> getChatRooms({
    int page = 1,
    int limit = 20,
    ChatRoomStatus? status,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };
      
      if (status != null) {
        queryParams['status'] = status.name;
      }

      final response = await _dio.get(
        '/chat/rooms',
        queryParameters: queryParams,
      );

      return ChatRoomListResponse.fromJson(response.data['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // 특정 채팅방 조회
  Future<ChatRoom> getChatRoomById(String roomId) async {
    try {
      final response = await _dio.get('/chat/rooms/$roomId');
      return ChatRoom.fromJson(response.data['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // 새 채팅방 생성
  Future<ChatRoom> createChatRoom(CreateChatRoomRequest request) async {
    try {
      final response = await _dio.post(
        '/chat/rooms',
        data: request.toJson(),
      );
      return ChatRoom.fromJson(response.data['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // 메시지 목록 조회
  Future<MessageListResponse> getMessages(
    String roomId, {
    int page = 1,
    int limit = 50,
    String? beforeMessageId,
  }) async {
    try {
      final queryParams = <String, dynamic>{
        'page': page,
        'limit': limit,
      };
      
      if (beforeMessageId != null) {
        queryParams['beforeMessageId'] = beforeMessageId;
      }

      final response = await _dio.get(
        '/chat/rooms/$roomId/messages',
        queryParameters: queryParams,
      );

      return MessageListResponse.fromJson(response.data['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // 메시지 전송
  Future<Message> sendMessage(SendMessageRequest request) async {
    try {
      final response = await _dio.post(
        '/chat/messages',
        data: request.toJson(),
      );
      return Message.fromJson(response.data['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // 메시지 읽음 처리
  Future<void> markAsRead(String roomId) async {
    try {
      await _dio.put('/chat/rooms/$roomId/read');
    } catch (e) {
      throw _handleError(e);
    }
  }

  // 메시지 수정
  Future<Message> updateMessage(
    String messageId,
    UpdateMessageRequest request,
  ) async {
    try {
      final response = await _dio.put(
        '/chat/messages/$messageId',
        data: request.toJson(),
      );
      return Message.fromJson(response.data['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }

  // 메시지 삭제
  Future<void> deleteMessage(String messageId) async {
    try {
      await _dio.delete('/chat/messages/$messageId');
    } catch (e) {
      throw _handleError(e);
    }
  }

  // 채팅방 아카이브
  Future<void> archiveChatRoom(String roomId) async {
    try {
      await _dio.put('/chat/rooms/$roomId/archive');
    } catch (e) {
      throw _handleError(e);
    }
  }

  // 채팅 서비스 상태 확인
  Future<Map<String, dynamic>> getHealthStatus() async {
    try {
      final response = await _dio.get('/chat/health');
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }

  Exception _handleError(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return Exception('네트워크 연결이 불안정합니다. 다시 시도해주세요.');
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          switch (statusCode) {
            case 400:
              return Exception('잘못된 요청입니다.');
            case 401:
              return Exception('인증이 필요합니다. 다시 로그인해주세요.');
            case 403:
              return Exception('접근 권한이 없습니다.');
            case 404:
              return Exception('채팅방 또는 메시지를 찾을 수 없습니다.');
            case 429:
              return Exception('너무 많은 요청입니다. 잠시 후 다시 시도해주세요.');
            case 500:
              return Exception('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
            default:
              return Exception('알 수 없는 오류가 발생했습니다.');
          }
        case DioExceptionType.cancel:
          return Exception('요청이 취소되었습니다.');
        case DioExceptionType.unknown:
          return Exception('네트워크 연결을 확인해주세요.');
        default:
          return Exception('알 수 없는 오류가 발생했습니다.');
      }
    }
    return Exception('알 수 없는 오류가 발생했습니다: $error');
  }
}