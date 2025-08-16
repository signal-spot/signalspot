import 'package:dio/dio.dart';
import '../../core/api/api_client.dart';
import '../models/index.dart';

class SignalService {
  final ApiClient _apiClient = ApiClient();
  
  // 주변 Signal Spots 가져오기
  Future<SignalSpotListResponse> getNearbySignalSpots({
    required double latitude,
    required double longitude,
    double radiusKm = 5.0,
    int limit = 20,
    int offset = 0,
  }) async {
    print('SignalService.getNearbySignalSpots called');
    print('Parameters: lat=$latitude, lng=$longitude, radius=$radiusKm, limit=$limit, offset=$offset');
    
    try {
      print('Making API call to /signal-spots/nearby...');
      final response = await _apiClient.dio.get(
        '/signal-spots/nearby',
        queryParameters: {
          'latitude': latitude,
          'longitude': longitude,
          'radiusKm': radiusKm,
          'limit': limit,
          'offset': offset,
        },
        options: Options(
          receiveTimeout: const Duration(seconds: 30), // Increase timeout for this specific endpoint
        ),
      );
      
      print('API Response status: ${response.statusCode}');
      print('Response type: ${response.data.runtimeType}');
      
      // API 응답이 {success: true, data: [...]} 형태인 경우
      if (response.data is Map && response.data['success'] == true) {
        print('API Response: ${response.data}');
        final data = response.data['data'] as List;
        print('Data count: ${data.length}');
        
        final spots = <SignalSpot>[];
        for (var i = 0; i < data.length; i++) {
          try {
            print('Parsing spot $i: ${data[i]}');
            // Map backend response to Flutter model
            final spotData = data[i] as Map<String, dynamic>;
            final mappedData = {
              'id': spotData['id'],
              'userId': spotData['creatorId'] ?? spotData['userId'],
              'creatorId': spotData['creatorId'],
              'creatorUsername': spotData['creatorUsername'],
              'creatorAvatar': spotData['creatorAvatar'],
              'content': spotData['message'] ?? spotData['content'],
              'message': spotData['message'],
              'title': spotData['title'],
              'latitude': spotData['location']?['latitude'] ?? spotData['latitude'],
              'longitude': spotData['location']?['longitude'] ?? spotData['longitude'],
              'createdAt': spotData['timing']?['createdAt'] ?? spotData['createdAt'],
              'expiresAt': spotData['timing']?['expiresAt'] ?? spotData['expiresAt'],
              'interactionCount': spotData['engagement']?['engagementScore'] ?? 0,
              'viewCount': spotData['engagement']?['viewCount'] ?? 0,
              'status': spotData['status'] ?? 'active',
              'mediaUrls': spotData['mediaUrls'],
              'tags': spotData['tags'],
              'isPinned': spotData['isPinned'] ?? false,
              'isReported': spotData['isReported'] ?? false,
              'metadata': spotData['metadata'],
              'location': spotData['location'],
              'engagement': spotData['engagement'],  // 중요: engagement 객체 전체를 전달
              'timing': spotData['timing'],
            };
            spots.add(SignalSpot.fromJson(mappedData));
          } catch (e, stack) {
            print('Error parsing spot at index $i: $e');
            print('Stack trace: $stack');
            print('Raw data: ${data[i]}');
          }
        }
        
        return SignalSpotListResponse(
          data: spots,
          count: spots.length,
          success: true,
          message: response.data['message']?.toString() ?? '',
        );
      }
      
      // 기존 형식 지원 (하위 호환성)
      return SignalSpotListResponse.fromJson(response.data);
    } catch (e, stackTrace) {
      print('❌ getNearbySignalSpots error: $e');
      print('Stack trace: $stackTrace');
      
      if (e is DioException) {
        throw _handleError(e);
      } else if (e is Exception) {
        throw e;
      } else {
        throw Exception('Error loading nearby spots: $e');
      }
    }
  }
  
  // 트렌딩 Signal Spots 가져오기
  Future<SignalSpotListResponse> getTrendingSignalSpots({
    int limit = 20,
    int offset = 0,
    String timeframe = 'day',
  }) async {
    try {
      final response = await _apiClient.dio.get(
        '/signal-spots/trending',
        queryParameters: {
          'limit': limit,
          'timeframe': timeframe,
          // offset은 trending API에서 지원하지 않음
        },
      );
      
      // API 응답이 {success: true, data: [...]} 형태인 경우
      if (response.data is Map && response.data['success'] == true) {
        print('API Response: ${response.data}');
        final data = response.data['data'] as List;
        print('Data count: ${data.length}');
        print("trending");
        
        final spots = <SignalSpot>[];
        for (var i = 0; i < data.length; i++) {
          try {
            print('Parsing spot $i: ${data[i]}');
            // Map backend response to Flutter model
            final spotData = data[i] as Map<String, dynamic>;
            final mappedData = {
              'id': spotData['id'],
              'userId': spotData['creatorId'] ?? spotData['userId'],
              'creatorId': spotData['creatorId'],
              'creatorUsername': spotData['creatorUsername'],
              'creatorAvatar': spotData['creatorAvatar'],
              'content': spotData['message'] ?? spotData['content'],
              'message': spotData['message'],
              'title': spotData['title'],
              'latitude': spotData['location']?['latitude'] ?? spotData['latitude'],
              'longitude': spotData['location']?['longitude'] ?? spotData['longitude'],
              'createdAt': spotData['timing']?['createdAt'] ?? spotData['createdAt'],
              'expiresAt': spotData['timing']?['expiresAt'] ?? spotData['expiresAt'],
              'interactionCount': spotData['engagement']?['engagementScore'] ?? 0,
              'viewCount': spotData['engagement']?['viewCount'] ?? 0,
              'status': spotData['status'] ?? 'active',
              'mediaUrls': spotData['mediaUrls'],
              'tags': spotData['tags'],
              'isPinned': spotData['isPinned'] ?? false,
              'isReported': spotData['isReported'] ?? false,
              'metadata': spotData['metadata'],
              'location': spotData['location'],
              'engagement': spotData['engagement'],  // 중요: engagement 객체 전체를 전달
              'timing': spotData['timing'],
            };
            spots.add(SignalSpot.fromJson(mappedData));
          } catch (e, stack) {
            print('Error parsing spot at index $i: $e');
            print('Stack trace: $stack');
            print('Raw data: ${data[i]}');
          }
        }
        
        return SignalSpotListResponse(
          data: spots,
          count: spots.length,
          success: true,
          message: response.data['message']?.toString() ?? '',
        );
      }
      
      // 기존 형식 지원 (하위 호환성)
      return SignalSpotListResponse.fromJson(response.data);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 인기 Signal Spots 가져오기
  Future<SignalSpotListResponse> getPopularSignalSpots({
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final response = await _apiClient.dio.get(
        '/signal-spots/popular',
        queryParameters: {
          'limit': limit,
          // offset 파라미터 제거 - API에서 지원하지 않음
        },
      );

      print("popular response");
      print(response.toString());
      
      // API 응답이 {success: true, data: [...]} 형태인 경우
      if (response.data is Map && response.data['success'] == true) {
        print('API Response: ${response.data}');
        final data = response.data['data'] as List;
        print('Data count: ${data.length}');
        
        final spots = <SignalSpot>[];
        for (var i = 0; i < data.length; i++) {
          try {
            print('Parsing spot $i: ${data[i]}');
            // Map backend response to Flutter model
            final spotData = data[i] as Map<String, dynamic>;
            final mappedData = {
              'id': spotData['id'],
              'userId': spotData['creatorId'] ?? spotData['userId'],
              'creatorId': spotData['creatorId'],
              'creatorUsername': spotData['creatorUsername'],
              'creatorAvatar': spotData['creatorAvatar'],
              'content': spotData['message'] ?? spotData['content'],
              'message': spotData['message'],
              'title': spotData['title'],
              'latitude': spotData['location']?['latitude'] ?? spotData['latitude'],
              'longitude': spotData['location']?['longitude'] ?? spotData['longitude'],
              'createdAt': spotData['timing']?['createdAt'] ?? spotData['createdAt'],
              'expiresAt': spotData['timing']?['expiresAt'] ?? spotData['expiresAt'],
              'interactionCount': spotData['engagement']?['engagementScore'] ?? 0,
              'viewCount': spotData['engagement']?['viewCount'] ?? 0,
              'status': spotData['status'] ?? 'active',
              'mediaUrls': spotData['mediaUrls'],
              'tags': spotData['tags'],
              'isPinned': spotData['isPinned'] ?? false,
              'isReported': spotData['isReported'] ?? false,
              'metadata': spotData['metadata'],
              'location': spotData['location'],
              'engagement': spotData['engagement'],  // 중요: engagement 객체 전체를 전달
              'timing': spotData['timing'],
            };
            spots.add(SignalSpot.fromJson(mappedData));
          } catch (e, stack) {
            print('Error parsing spot at index $i: $e');
            print('Stack trace: $stack');
            print('Raw data: ${data[i]}');
          }
        }
        
        return SignalSpotListResponse(
          data: spots,
          count: spots.length,
          success: true,
          message: response.data['message']?.toString() ?? '',
        );
      }
      
      // 기존 형식 지원 (하위 호환성)
      return SignalSpotListResponse.fromJson(response.data);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Signal Spot 검색
  Future<SignalSpotListResponse> searchSignalSpots({
    required String query,
    double? latitude,
    double? longitude,
    double radiusKm = 10.0,
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final response = await _apiClient.dio.get(
        '/signal-spots/search',
        queryParameters: {
          'q': query,
          if (latitude != null) 'latitude': latitude,
          if (longitude != null) 'longitude': longitude,
          'radiusKm': radiusKm,
          'limit': limit,
          'offset': offset,
        },
      );
      
      // API 응답이 {success: true, data: [...]} 형태인 경우
      if (response.data is Map && response.data['success'] == true) {
        print('API Response: ${response.data}');
        final data = response.data['data'] as List;
        print('Data count: ${data.length}');
        
        final spots = <SignalSpot>[];
        for (var i = 0; i < data.length; i++) {
          try {
            print('Parsing spot $i: ${data[i]}');
            // Map backend response to Flutter model
            final spotData = data[i] as Map<String, dynamic>;
            final mappedData = {
              'id': spotData['id'],
              'userId': spotData['creatorId'] ?? spotData['userId'],
              'creatorId': spotData['creatorId'],
              'creatorUsername': spotData['creatorUsername'],
              'creatorAvatar': spotData['creatorAvatar'],
              'content': spotData['message'] ?? spotData['content'],
              'message': spotData['message'],
              'title': spotData['title'],
              'latitude': spotData['location']?['latitude'] ?? spotData['latitude'],
              'longitude': spotData['location']?['longitude'] ?? spotData['longitude'],
              'createdAt': spotData['timing']?['createdAt'] ?? spotData['createdAt'],
              'expiresAt': spotData['timing']?['expiresAt'] ?? spotData['expiresAt'],
              'interactionCount': spotData['engagement']?['engagementScore'] ?? 0,
              'viewCount': spotData['engagement']?['viewCount'] ?? 0,
              'status': spotData['status'] ?? 'active',
              'mediaUrls': spotData['mediaUrls'],
              'tags': spotData['tags'],
              'isPinned': spotData['isPinned'] ?? false,
              'isReported': spotData['isReported'] ?? false,
              'metadata': spotData['metadata'],
              'location': spotData['location'],
              'engagement': spotData['engagement'],  // 중요: engagement 객체 전체를 전달
              'timing': spotData['timing'],
            };
            spots.add(SignalSpot.fromJson(mappedData));
          } catch (e, stack) {
            print('Error parsing spot at index $i: $e');
            print('Stack trace: $stack');
            print('Raw data: ${data[i]}');
          }
        }
        
        return SignalSpotListResponse(
          data: spots,
          count: spots.length,
          success: true,
          message: response.data['message']?.toString() ?? '',
        );
      }
      
      // 기존 형식 지원 (하위 호환성)
      return SignalSpotListResponse.fromJson(response.data);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 내 Signal Spots 가져오기
  Future<SignalSpotListResponse> getMySignalSpots({
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final response = await _apiClient.dio.get(
        '/signal-spots/my-spots',
        queryParameters: {
          'limit': limit,
          'offset': offset,
        },
      );
      
      // API 응답이 {success: true, data: [...]} 형태인 경우
      if (response.data is Map && response.data['success'] == true) {
        print('API Response: ${response.data}');
        final data = response.data['data'] as List;
        print('Data count: ${data.length}');
        
        final spots = <SignalSpot>[];
        for (var i = 0; i < data.length; i++) {
          try {
            print('Parsing spot $i: ${data[i]}');
            // Map backend response to Flutter model
            final spotData = data[i] as Map<String, dynamic>;
            final mappedData = {
              'id': spotData['id'],
              'userId': spotData['creatorId'] ?? spotData['userId'],
              'creatorId': spotData['creatorId'],
              'creatorUsername': spotData['creatorUsername'],
              'creatorAvatar': spotData['creatorAvatar'],
              'content': spotData['message'] ?? spotData['content'],
              'message': spotData['message'],
              'title': spotData['title'],
              'latitude': spotData['location']?['latitude'] ?? spotData['latitude'],
              'longitude': spotData['location']?['longitude'] ?? spotData['longitude'],
              'createdAt': spotData['timing']?['createdAt'] ?? spotData['createdAt'],
              'expiresAt': spotData['timing']?['expiresAt'] ?? spotData['expiresAt'],
              'interactionCount': spotData['engagement']?['engagementScore'] ?? 0,
              'viewCount': spotData['engagement']?['viewCount'] ?? 0,
              'status': spotData['status'] ?? 'active',
              'mediaUrls': spotData['mediaUrls'],
              'tags': spotData['tags'],
              'isPinned': spotData['isPinned'] ?? false,
              'isReported': spotData['isReported'] ?? false,
              'metadata': spotData['metadata'],
              'location': spotData['location'],
              'engagement': spotData['engagement'],  // 중요: engagement 객체 전체를 전달
              'timing': spotData['timing'],
            };
            spots.add(SignalSpot.fromJson(mappedData));
          } catch (e, stack) {
            print('Error parsing spot at index $i: $e');
            print('Stack trace: $stack');
            print('Raw data: ${data[i]}');
          }
        }
        
        return SignalSpotListResponse(
          data: spots,
          count: spots.length,
          success: true,
          message: response.data['message']?.toString() ?? '',
        );
      }
      
      // 기존 형식 지원 (하위 호환성)
      return SignalSpotListResponse.fromJson(response.data);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Signal Spot 상세 정보 가져오기
  Future<SignalSpot> getSignalSpotById(String id) async {
    try {
      final response = await _apiClient.dio.get('/signal-spots/$id');
      
      return SignalSpot.fromJson(response.data['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Signal Spot 생성
  Future<SignalSpot> createSignalSpot(CreateSignalSpotRequest request) async {
    try {
      final response = await _apiClient.dio.post(
        '/signal-spots',
        data: request.toJson(),
      );
      
      return SignalSpot.fromJson(response.data['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Signal Spot 상호작용 (좋아요, 보기, 공유 등)
  Future<SignalSpot?> interactWithSignalSpot(
    String spotId,
    SignalSpotInteraction interaction,
  ) async {
    try {
      // 좋아요 액션의 경우 새로운 like 엔드포인트 사용
      if (interaction.type == 'like') {
        final response = await _apiClient.dio.post('/signal-spots/$spotId/like');
        
        if (response.data['success'] == true && response.data['data'] != null) {
          // Backend returns {spotId, isLiked, likeCount} instead of full SignalSpot
          final likeData = response.data['data'] as Map<String, dynamic>;
          
          // Create a minimal SignalSpot with updated engagement data
          return SignalSpot(
            id: likeData['spotId'] as String,
            userId: '', // Will be filled by caller if needed
            content: '', // Will be filled by caller if needed
            title: '', // Will be filled by caller if needed
            latitude: 0, // Will be filled by caller if needed
            longitude: 0, // Will be filled by caller if needed
            createdAt: DateTime.now(), // Required field, actual value doesn't matter for like response
            engagement: {
              'likeCount': likeData['likeCount'] ?? 0,
              'isLiked': likeData['isLiked'] ?? false,
            },
          );
        }
        return null;
      }
      
      // 다른 상호작용은 기존 interact 엔드포인트 사용
      final response = await _apiClient.dio.post(
        '/signal-spots/$spotId/interact',
        data: interaction.toJson(),
      );
      
      if (response.data['success'] == true && response.data['data'] != null) {
        return SignalSpot.fromJson(response.data['data']);
      }
      return null;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Signal Spot 삭제
  Future<void> deleteSignalSpot(String id) async {
    try {
      await _apiClient.dio.delete('/signal-spots/$id');
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Signal Spot ID로 상세 정보 가져오기
  Future<SignalSpot?> getSpotById(String spotId) async {
    try {
      final response = await _apiClient.dio.get('/signal-spots/$spotId');
      
      if (response.data['success'] == true && response.data['data'] != null) {
        final spotData = response.data['data'] as Map<String, dynamic>;
        print('GetSpotById response data: $spotData');
        
        // isLiked 상태도 포함되어 있다면 engagement에 추가
        if (spotData['isLiked'] != null) {
          if (spotData['engagement'] == null) {
            spotData['engagement'] = {};
          }
          spotData['engagement']['isLiked'] = spotData['isLiked'];
          print('Added isLiked to engagement: ${spotData['isLiked']}');
        }
        return SignalSpot.fromJson(spotData);
      }
      return null;
    } catch (e) {
      print('Error getting spot by ID: $e');
      return null;
    }
  }
  
  // Signal Spot 상호작용 (좋아요, 신고 등) - 간단한 버전
  Future<void> interactWithSpot(String spotId, String interactionType) async {
    try {
      await _apiClient.dio.post(
        '/signal-spots/$spotId/interact',
        data: {
          'type': interactionType,
        },
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Signal Spot 좋아요 토글 (전용 메서드)
  Future<Map<String, dynamic>> toggleLike(String spotId) async {
    try {
      final response = await _apiClient.dio.post('/signal-spots/$spotId/like');
      
      if (response.data['success'] == true && response.data['data'] != null) {
        final likeData = response.data['data'] as Map<String, dynamic>;
        return {
          'isLiked': likeData['isLiked'] ?? false,
          'likeCount': likeData['likeCount'] ?? 0,
        };
      }
      return {'isLiked': false, 'likeCount': 0};
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // Signal Spot 핀 설정/해제
  Future<SignalSpot> togglePinSignalSpot(String id, bool pin) async {
    try {
      final endpoint = pin ? '/signal-spots/$id/pin' : '/signal-spots/$id/unpin';
      final response = await _apiClient.dio.post(endpoint);
      
      return SignalSpot.fromJson(response.data['data']);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 에러 처리
  Exception _handleError(dynamic error) {
    print('SignalService Error: $error');
    
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
              // message나 error 필드가 있는지 확인하고, String 타입인지 확인
              final messageField = responseData['message'];
              final errorField = responseData['error'];
              
              if (messageField is String) {
                message = messageField;
              } else if (errorField is String) {
                message = errorField;
              } else if (messageField != null) {
                message = messageField.toString();
              } else if (errorField != null) {
                message = errorField.toString();
              }
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