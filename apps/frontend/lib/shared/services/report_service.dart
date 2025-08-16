import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../core/api/api_client.dart';

// 백엔드와 일치하는 ReportType enum
enum ReportType {
  user('user', '사용자'),
  signalSpot('signal_spot', '시그널 스팟'),
  comment('comment', '댓글'),
  chatMessage('chat_message', '채팅 메시지');

  final String value;
  final String label;
  const ReportType(this.value, this.label);
}

// 백엔드와 일치하는 ReportReason enum
enum ReportReason {
  spam('spam', '스팸'),
  harassment('harassment', '괴롭힘/욕설'),
  hateSeech('hate_speech', '혐오 발언'),
  violence('violence', '폭력'),
  sexualContent('sexual_content', '성적 콘텐츠'),
  falseInformation('false_information', '거짓 정보'),
  privacyViolation('privacy_violation', '개인정보 침해'),
  copyright('copyright', '저작권 침해'),
  selfHarm('self_harm', '자해'),
  other('other', '기타');

  final String value;
  final String label;
  const ReportReason(this.value, this.label);
}

class ReportService {
  final ApiClient _apiClient = ApiClient();
  
  // 현재 로그인한 사용자 ID 가져오기
  Future<String?> getCurrentUserId() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('user_id');
  }
  
  // 신고하기 (사용자, 스팟, 댓글, 채팅 등)
  Future<bool> createReport({
    required ReportType type,
    required String targetId,
    required ReportReason reason,
    String? description,
  }) async {
    try {
      final response = await _apiClient.dio.post('/reports', data: {
        'type': type.value,
        'targetId': targetId,
        'reason': reason.value,
        'description': description,
      });
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        print('✅ 신고 성공: $targetId');
        return true;
      }
      return false;
    } catch (e) {
      print('❌ 신고 실패: $e');
      return false;
    }
  }
  
  // 사용자 신고 (간편 메서드)
  Future<Map<String, dynamic>> reportUser({
    required String userId,
    required ReportReason reason,
    String? description,
  }) async {
    // 본인 체크
    final currentUserId = await getCurrentUserId();
    if (currentUserId == userId) {
      return {
        'success': false,
        'message': '본인을 신고할 수 없습니다',
      };
    }
    
    final success = await createReport(
      type: ReportType.user,
      targetId: userId,
      reason: reason,
      description: description,
    );
    
    return {
      'success': success,
      'message': success ? '신고가 접수되었습니다' : '신고 처리 중 오류가 발생했습니다',
    };
  }
  
  // 사용자 차단
  Future<Map<String, dynamic>> blockUser(String userId, {String? reason}) async {
    try {
      // 본인 체크
      final currentUserId = await getCurrentUserId();
      if (currentUserId == userId) {
        return {
          'success': false,
          'message': '본인을 차단할 수 없습니다',
        };
      }
      
      // BlockUserDto와 일치하는 필드명 사용
      final response = await _apiClient.dio.post('/users/block', data: {
        'userId': userId,
        if (reason != null) 'reason': reason,
      });
      
      if (response.statusCode == 201 || response.statusCode == 200) {
        print('✅ 사용자 차단 성공: $userId');
        return {
          'success': true,
          'message': '사용자를 차단했습니다',
        };
      }
      return {
        'success': false,
        'message': '차단 처리 중 오류가 발생했습니다',
      };
    } catch (e) {
      print('❌ 사용자 차단 실패: $e');
      // DioException 처리로 더 상세한 에러 메시지
      if (e is DioException && e.response?.data != null) {
        final message = e.response?.data['message'] ?? '차단 처리 중 오류가 발생했습니다';
        return {
          'success': false,
          'message': message,
        };
      }
      return {
        'success': false,
        'message': '차단 처리 중 오류가 발생했습니다',
      };
    }
  }
  
  // 사용자 차단 해제
  Future<bool> unblockUser(String userId) async {
    try {
      final response = await _apiClient.dio.delete('/users/block/$userId');
      
      if (response.statusCode == 200 || response.statusCode == 204) {
        print('✅ 사용자 차단 해제 성공: $userId');
        return true;
      }
      return false;
    } catch (e) {
      print('❌ 사용자 차단 해제 실패: $e');
      return false;
    }
  }
  
  // 차단된 사용자 목록 조회
  Future<List<String>> getBlockedUsers() async {
    try {
      final response = await _apiClient.dio.get('/users/blocked');
      
      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        return List<String>.from(data.map((user) => user['id'] ?? user));
      }
      return [];
    } catch (e) {
      print('❌ 차단 목록 조회 실패: $e');
      return [];
    }
  }
  
  // 사용자가 차단되었는지 확인
  Future<bool> isUserBlocked(String userId) async {
    try {
      final blockedUsers = await getBlockedUsers();
      return blockedUsers.contains(userId);
    } catch (e) {
      return false;
    }
  }
}