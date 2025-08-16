import 'package:dio/dio.dart';
import '../../core/api/api_client.dart';
import '../models/signature_connection.dart';

class SignatureConnectionService {
  final ApiClient _apiClient;
  
  SignatureConnectionService(this._apiClient);
  
  // 시그니처 커넥션 설정 업데이트
  Future<void> updatePreferences(SignatureConnectionPreferences preferences) async {
    try {
      await _apiClient.put('/profile/signature-connection/preferences', data: preferences.toJson());
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }
  
  // 시그니처 커넥션 설정 조회
  Future<SignatureConnectionPreferences?> getPreferences() async {
    try {
      final response = await _apiClient.get('/profile/signature-connection/preferences');
      if (response.data == null) return null;
      
      return SignatureConnectionPreferences.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }
  
  // 매칭 상대 찾기
  Future<List<ConnectionMatch>> findMatches({int limit = 20, int offset = 0}) async {
    try {
      final response = await _apiClient.get(
        '/profile/signature-connection/matches',
        queryParameters: {
          'limit': limit,
          'offset': offset,
        },
      );
      
      final List<dynamic> matches = response.data['matches'] ?? [];
      return matches.map((match) => ConnectionMatch.fromJson(match)).toList();
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }
  
  // 매칭 통계 조회
  Future<SignatureConnectionStats> getStats() async {
    try {
      final response = await _apiClient.get('/profile/signature-connection/stats');
      return SignatureConnectionStats.fromJson(response.data);
    } on DioException catch (e) {
      throw _handleError(e);
    }
  }
  
  String _handleError(DioException e) {
    if (e.response != null) {
      final message = e.response!.data['message'] ?? 'Unknown error occurred';
      return message;
    }
    return e.message ?? 'Network error occurred';
  }
}