import 'package:dio/dio.dart';
import '../../core/api/api_client.dart';
import '../models/index.dart';

class FeedService {
  final ApiClient _apiClient = ApiClient();
  
  // 메인 피드 가져오기
  Future<FeedResponse> getFeed(FeedQuery query) async {
    try {
      final response = await _apiClient.dio.get(
        '/feed',
        queryParameters: query.toJson(),
      );
      
      return FeedResponse.fromJson(response.data);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 트렌딩 콘텐츠 가져오기
  Future<FeedResponse> getTrendingContent(FeedQuery query) async {
    try {
      final response = await _apiClient.dio.get(
        '/feed/trending',
        queryParameters: query.toJson(),
      );
      
      return FeedResponse.fromJson(response.data);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 위치 기반 피드 가져오기
  Future<FeedResponse> getLocationFeed({
    required double latitude,
    required double longitude,
    double radiusMeters = 5000,
    int limit = 20,
  }) async {
    try {
      final response = await _apiClient.dio.get(
        '/feed/location',
        queryParameters: {
          'latitude': latitude,
          'longitude': longitude,
          'radiusMeters': radiusMeters,
          'limit': limit,
        },
      );
      
      return FeedResponse.fromJson(response.data);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 트렌딩 태그 가져오기
  Future<List<TrendingTag>> getTrendingTags({int limit = 10}) async {
    try {
      final response = await _apiClient.dio.get(
        '/feed/trending-tags',
        queryParameters: {'limit': limit},
      );
      
      return (response.data as List)
          .map((json) => TrendingTag.fromJson(json))
          .toList();
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 추천 사용자 가져오기
  Future<List<RecommendedUser>> getRecommendedUsers({int limit = 10}) async {
    try {
      final response = await _apiClient.dio.get(
        '/feed/recommended-users',
        queryParameters: {'limit': limit},
      );
      
      return (response.data as List)
          .map((json) => RecommendedUser.fromJson(json))
          .toList();
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 피드 캐시 새로고침
  Future<void> refreshFeedCache() async {
    try {
      await _apiClient.dio.get('/feed/refresh');
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 오늘의 연결 가져오기
  Future<Map<String, dynamic>> getTodaysConnection({
    double? latitude,
    double? longitude,
  }) async {
    try {
      final response = await _apiClient.dio.get(
        '/feed/todays-connection',
        queryParameters: {
          if (latitude != null) 'latitude': latitude,
          if (longitude != null) 'longitude': longitude,
        },
      );
      
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 피드 메트릭 가져오기
  Future<Map<String, dynamic>> getFeedMetrics({
    String timeframe = 'day',
  }) async {
    try {
      final response = await _apiClient.dio.get(
        '/feed/metrics',
        queryParameters: {'timeframe': timeframe},
      );
      
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 검색 기능 (임시 구현 - 실제로는 별도 검색 서비스나 ElasticSearch 사용)
  Future<List<FeedItem>> searchFeed({
    required String query,
    String? type,
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      // 임시로 빈 결과 반환 - 나중에 실제 검색 API 연동
      await Future.delayed(const Duration(milliseconds: 500));
      return [];
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 피드 필터링을 위한 카테고리/태그 목록
  Future<List<String>> getAvailableCategories() async {
    try {
      // 임시 데이터
      await Future.delayed(const Duration(milliseconds: 300));
      return [
        '전체',
        '인기',
        '최신',
        '내 주변',
        '트렌딩',
        '친구',
        '카페',
        '맛집',
        '문화',
        '운동',
      ];
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 에러 처리
  Exception _handleError(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.receiveTimeout:
          return Exception('연결 시간이 초과되었습니다.');
        case DioExceptionType.badResponse:
          final statusCode = error.response?.statusCode;
          final message = error.response?.data?['message'] ?? '알 수 없는 오류가 발생했습니다.';
          return Exception('$statusCode: $message');
        case DioExceptionType.cancel:
          return Exception('요청이 취소되었습니다.');
        default:
          return Exception('네트워크 오류가 발생했습니다.');
      }
    }
    return Exception('알 수 없는 오류가 발생했습니다.');
  }
}