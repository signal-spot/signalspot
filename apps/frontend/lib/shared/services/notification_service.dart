import 'package:dio/dio.dart';
import '../../core/api/api_client.dart';
import '../models/index.dart';

class NotificationService {
  final ApiClient _apiClient = ApiClient();
  
  // FCM 토큰 업데이트
  Future<void> updateFcmToken(String token) async {
    try {
      await _apiClient.dio.post(
        '/notifications/fcm-token',
        data: {'token': token},
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // FCM 토큰 제거
  Future<void> removeFcmToken() async {
    try {
      await _apiClient.dio.delete('/notifications/fcm-token');
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 알림 목록 가져오기
  Future<NotificationListResponse> getNotifications({
    int limit = 20,
    int offset = 0,
    bool unreadOnly = false,
  }) async {
    try {
      final response = await _apiClient.dio.get(
        '/notifications',
        queryParameters: {
          'limit': limit,
          'offset': offset,
          if (unreadOnly) 'status': 'pending',
        },
      );
      
      print('[DEBUG] NotificationService - Raw API Response: ${response.data}');
      print('[DEBUG] NotificationService - Response type: ${response.data.runtimeType}');
      
      // 백엔드 응답 구조에 맞게 파싱
      // ResponseTransformInterceptor가 응답을 감싸고 있음
      // 백엔드가 data: notifications로 반환하면
      // 구조: { success: true, data: [...], pagination: {...}, unreadCount: 2 }
      final responseData = response.data;
      
      // 각 필드 개별 확인
      print('[DEBUG] NotificationService - responseData keys: ${responseData.keys}');
      print('[DEBUG] NotificationService - responseData["success"]: ${responseData["success"]}');
      print('[DEBUG] NotificationService - responseData["data"] type: ${responseData["data"]?.runtimeType}');
      print('[DEBUG] NotificationService - responseData["unreadCount"]: ${responseData["unreadCount"]}');
      print('[DEBUG] NotificationService - responseData["pagination"]: ${responseData["pagination"]}');
      
      // data는 이제 notifications 배열 자체
      final notifications = responseData['data'] as List? ?? [];
      final unreadCount = responseData['unreadCount'] ?? 0;
      final pagination = responseData['pagination'] ?? {};
      
      print('[DEBUG] NotificationService - Parsed notifications count: ${notifications.length}');
      print('[DEBUG] NotificationService - Parsed unread count: $unreadCount');
      print('[DEBUG] NotificationService - Parsed pagination: $pagination');
      
      return NotificationListResponse(
        notifications: notifications
            .map((json) => AppNotification.fromJson(json))
            .toList(),
        unreadCount: unreadCount,
        totalCount: pagination['total'] ?? notifications.length,
        hasMore: pagination['hasMore'] ?? false,
      );
    } catch (e) {
      print('Error fetching notifications: $e');
      throw _handleError(e);
    }
  }
  
  // 읽지 않은 알림 개수만 가져오기
  Future<int> getUnreadCount() async {
    try {
      final response = await _apiClient.dio.get(
        '/notifications',
        queryParameters: {
          'limit': 1,  // 개수만 필요하므로 최소 데이터 요청
        },
      );
      
      return response.data['unreadCount'] ?? 0;
    } catch (e) {
      print('Failed to get unread count: $e');
      return 0;
    }
  }
  
  // 알림 읽음 처리
  Future<void> markAsRead(String notificationId) async {
    try {
      await _apiClient.dio.put('/notifications/$notificationId/read');
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 여러 알림 일괄 읽음 처리
  Future<void> markMultipleAsRead(List<String> notificationIds) async {
    try {
      await _apiClient.dio.put(
        '/notifications/read-bulk',
        data: {'notificationIds': notificationIds},
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 모든 알림 읽음 처리
  Future<void> markAllAsRead() async {
    try {
      await _apiClient.dio.put('/notifications/read-all');
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // FCM 배지 초기화 (알림은 읽지 않은 상태로 유지)
  Future<void> resetBadge() async {
    try {
      await _apiClient.dio.post('/notifications/reset-badge');
      print('Badge reset successfully');
    } catch (e) {
      print('Failed to reset badge: $e');
      // 배지 초기화 실패는 앱 동작에 영향을 주지 않으므로 에러를 던지지 않음
    }
  }
  
  // 알림 삭제
  Future<void> deleteNotification(String notificationId) async {
    try {
      await _apiClient.dio.delete('/notifications/$notificationId');
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 알림 설정 가져오기 (임시 구현)
  Future<NotificationSettings> getNotificationSettings() async {
    try {
      // 임시로 기본 설정 반환 - 나중에 실제 API 연동
      await Future.delayed(const Duration(milliseconds: 300));
      
      return const NotificationSettings(
        pushEnabled: true,
        sparkNotifications: true,
        messageNotifications: true,
        profileViewNotifications: false,
        marketingNotifications: false,
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 알림 설정 업데이트 (임시 구현)
  Future<void> updateNotificationSettings(NotificationSettings settings) async {
    try {
      // 임시 구현 - 나중에 실제 API 연동
      await Future.delayed(const Duration(milliseconds: 500));
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 즉시 알림 보내기 (테스트용)
  Future<void> sendTestNotification({
    required String title,
    required String body,
    Map<String, dynamic>? data,
  }) async {
    try {
      await _apiClient.dio.post(
        '/notifications/send',
        data: {
          'title': title,
          'body': body,
          'data': data,
        },
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 알림 통계 가져오기
  Future<Map<String, dynamic>> getNotificationStats({int days = 7}) async {
    try {
      final response = await _apiClient.dio.get(
        '/notifications/user-stats',
        queryParameters: {'days': days},
      );
      
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 토픽 구독
  Future<void> subscribeToTopic(String topic) async {
    try {
      await _apiClient.dio.post('/notifications/topics/$topic/subscribe');
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 토픽 구독 해제
  Future<void> unsubscribeFromTopic(String topic) async {
    try {
      await _apiClient.dio.post('/notifications/topics/$topic/unsubscribe');
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 에러 처리
  Exception _handleError(dynamic error) {
    print('NotificationService Error: $error');
    
    if (error is DioException) {
      print('DioException Type: ${error.type}');
      print('Response: ${error.response?.data}');
      print('Status Code: ${error.response?.statusCode}');
      
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.receiveTimeout:
          return Exception('연결 시간이 초과되었습니다.');
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          final responseData = error.response?.data;
          
          // 더 자세한 에러 메시지 구성
          String message = '알 수 없는 오류가 발생했습니다.';
          if (responseData != null) {
            if (responseData is Map) {
              message = responseData['message'] ?? responseData['error'] ?? message;
            } else if (responseData is String) {
              message = responseData;
            }
          }
          
          return Exception('[$statusCode] $message');
        case DioExceptionType.cancel:
          return Exception('요청이 취소되었습니다.');
        case DioExceptionType.connectionError:
          return Exception('서버에 연결할 수 없습니다. 백엔드 서버가 실행 중인지 확인하세요.');
        default:
          return Exception('네트워크 오류가 발생했습니다: ${error.message}');
      }
    }
    
    print('Unknown error type: ${error.runtimeType}');
    return Exception('알 수 없는 오류가 발생했습니다: $error');
  }
}