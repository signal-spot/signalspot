import 'package:dio/dio.dart';
import '../../core/api/api_client.dart';

class UserService {
  final ApiClient _apiClient = ApiClient();

  // Block a user
  Future<void> blockUser(String userId, {String? reason}) async {
    try {
      await _apiClient.dio.post(
        '/users/block',
        data: {
          'userId': userId,
          if (reason != null) 'reason': reason,
        },
      );
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Unblock a user
  Future<void> unblockUser(String userId) async {
    try {
      await _apiClient.dio.delete('/users/block/$userId');
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Get list of blocked users
  Future<List<dynamic>> getBlockedUsers() async {
    try {
      final response = await _apiClient.dio.get('/users/blocked');
      
      if (response.data['success'] == true) {
        return response.data['data'] as List;
      }
      return [];
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Check if a user is blocked
  Future<bool> isBlocked(String userId) async {
    try {
      final response = await _apiClient.dio.get('/users/is-blocked/$userId');
      
      if (response.data['success'] == true) {
        return response.data['data']['isBlocked'] ?? false;
      }
      return false;
    } catch (e) {
      print('Error checking block status: $e');
      return false;
    }
  }

  // Get block statistics
  Future<Map<String, dynamic>> getBlockStats() async {
    try {
      final response = await _apiClient.dio.get('/users/block-stats');
      
      if (response.data['success'] == true) {
        return response.data['data'] as Map<String, dynamic>;
      }
      return {'blockedCount': 0, 'blockedByCount': 0};
    } catch (e) {
      throw _handleError(e);
    }
  }

  // Error handling
  Exception _handleError(dynamic error) {
    print('UserService Error: $error');
    
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.receiveTimeout:
          return Exception('연결 시간이 초과되었습니다.');
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          final responseData = error.response?.data;
          
          String message = '알 수 없는 오류가 발생했습니다.';
          if (responseData != null) {
            if (responseData is Map) {
              message = responseData['message'] ?? responseData['error'] ?? message;
            } else if (responseData is String) {
              message = responseData;
            }
          }
          
          if (statusCode == 400) {
            return Exception('자기 자신을 차단할 수 없습니다.');
          } else if (statusCode == 409) {
            return Exception('이미 차단된 사용자입니다.');
          }
          
          return Exception('[$statusCode] $message');
        case DioExceptionType.cancel:
          return Exception('요청이 취소되었습니다.');
        case DioExceptionType.connectionError:
          return Exception('서버에 연결할 수 없습니다.');
        default:
          return Exception('네트워크 오류가 발생했습니다: ${error.message}');
      }
    }
    
    return Exception('알 수 없는 오류가 발생했습니다: $error');
  }
}