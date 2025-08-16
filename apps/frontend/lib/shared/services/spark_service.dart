import 'package:dio/dio.dart';
import '../../core/api/api_client.dart';
import '../models/index.dart';

class SparkService {
  final ApiClient _apiClient = ApiClient();
  final String? userId;
  
  SparkService({this.userId});
  
  // 내 스파크 목록 가져오기
  Future<SparkListResponse> getMySparks() async {
    try {
      final response = await _apiClient.dio.get('/sparks');
      
      print('Spark API Response: ${response.data}');
      
      // 백엔드가 {success: true, data: [...]} 형태로 응답
      if (response.data is Map && response.data['data'] is List) {
        final List<dynamic> sparkDataList = response.data['data'];
        
        final List<Spark> sparks = sparkDataList.map((json) {
          final Map<String, dynamic> sparkJson = Map<String, dynamic>.from(json);
          
          // direction 필드 추가 (user1Id가 현재 사용자인지에 따라 결정)
          if (!sparkJson.containsKey('direction')) {
            // 현재 사용자가 user1Id이면 sent, user2Id이면 received
            if (userId != null && sparkJson['user1Id'] == userId) {
              sparkJson['direction'] = 'sent';
            } else {
              sparkJson['direction'] = 'received';
            }
          }
          
          // expiresAt 필드 추가 (72시간 후)
          if (!sparkJson.containsKey('expiresAt')) {
            final createdAt = DateTime.parse(sparkJson['createdAt']);
            sparkJson['expiresAt'] = createdAt.add(const Duration(hours: 72)).toIso8601String();
          }
          
          // 위치 정보 처리
          // location 필드를 locationName으로 매핑
          if (sparkJson.containsKey('location') && !sparkJson.containsKey('locationName')) {
            sparkJson['locationName'] = sparkJson['location'];
          }
          
          // 좌표 정보 확인 및 기본 위치 텍스트 설정
          if (sparkJson['latitude'] != null && sparkJson['longitude'] != null) {
            // locationName이 없거나 '알 수 없는 위치'인 경우 '근처 위치'로 설정
            if (sparkJson['locationName'] == null || sparkJson['locationName'] == '알 수 없는 위치') {
              sparkJson['locationName'] = '근처 위치';
            }
          }
          
          print('Spark location data: lat=${sparkJson['latitude']}, lng=${sparkJson['longitude']}, locationName=${sparkJson['locationName']}');
          
          return Spark.fromJson(sparkJson);
        }).toList();
        
        return SparkListResponse(
          success: response.data['success'] ?? true,
          data: sparks,
          message: response.data['message'],
        );
      }
      
      // 응답이 이미 SparkListResponse 형태인 경우
      return SparkListResponse.fromJson(response.data);
    } catch (e) {
      print('Error fetching sparks: $e');
      throw _handleError(e);
    }
  }
  
  // 스파크 보내기
  Future<SparkResponse> sendSpark(CreateSparkRequest request) async {
    try {
      final response = await _apiClient.dio.post(
        '/sparks',
        data: {
          'user2Id': request.targetUserId,
          'message': request.message,
          'sparkType': request.sparkType,
          'spotId': request.spotId,
        },
      );
      
      print('Spark send response status: ${response.statusCode}');
      print('Response Text: \n${response.data}');
      
      // 백엔드 응답이 {success: true, data: {...}} 형태인 경우
      if (response.data is Map && response.data['success'] == true) {
        final sparkData = response.data['data'];
        
        // 추가 필드들 처리
        final otherUserId = sparkData['otherUserId'] ?? sparkData['user2Id'];
        final otherUserNickname = sparkData['otherUserNickname'] ?? 'Unknown';
        final otherUserAvatar = sparkData['otherUserAvatar'];
        
        // 위치 정보 처리
        String? locationName = sparkData['locationName'] ?? sparkData['location'];
        if ((locationName == null || locationName == '알 수 없는 위치') &&
            sparkData['latitude'] != null && sparkData['longitude'] != null) {
          locationName = '근처 위치';
        }
        
        return SparkResponse(
          success: true,
          data: Spark(
            id: sparkData['id'],
            user1Id: sparkData['user1Id'],
            user2Id: sparkData['user2Id'],
            status: _parseSparkStatus(sparkData['status'] ?? 'pending'),
            createdAt: DateTime.parse(sparkData['createdAt'] ?? DateTime.now().toIso8601String()),
            message: sparkData['message'],
            direction: sparkData['direction'] == 'sent' ? SparkDirection.sent : SparkDirection.received,
            expiresAt: DateTime.now().add(const Duration(hours: 72)),
            latitude: sparkData['latitude']?.toDouble(),
            longitude: sparkData['longitude']?.toDouble(),
            locationName: locationName,
            distance: sparkData['distance']?.toDouble(),
            otherUserId: otherUserId,
            otherUserNickname: otherUserNickname,
            otherUserAvatar: otherUserAvatar,
            type: _parseSparkType(sparkData['type'] ?? 'automatic'),
          ),
          message: response.data['message'] ?? 'Spark sent successfully',
        );
      }
      
      // 성공 응답이지만 data가 없는 경우 - 빈 Spark 객체 생성
      if (response.statusCode == 201 || response.statusCode == 200) {
        return SparkResponse(
          success: true,
          data: Spark(
            id: DateTime.now().millisecondsSinceEpoch.toString(),
            user1Id: userId ?? '',
            user2Id: request.targetUserId,
            type: SparkType.manual,
            status: SparkStatus.pending,
            createdAt: DateTime.now(),
            direction: SparkDirection.sent,
          ),
          message: 'Spark sent successfully',
        );
      }
      
      // 실패 응답 - 던지기
      throw Exception(response.data?['message'] ?? '스파크 전송에 실패했습니다');
    } catch (e) {
      print('Error in sendSpark: $e');
      throw _handleError(e);
    }
  }
  
  // 스파크 타입별로 보내기
  Future<SparkResponse> sendSparkToUser({
    required String targetUserId,
    String? message,
    String sparkType = 'interest',
    String? spotId,
  }) async {
    final request = CreateSparkRequest(
      targetUserId: targetUserId,
      message: message,
      sparkType: sparkType,
      spotId: spotId,
    );
    
    return sendSpark(request);
  }
  
  // 스파크 수락
  Future<Spark> acceptSpark(String sparkId) async {
    try {
      final response = await _apiClient.dio.put('/sparks/$sparkId/accept');
      
      // 백엔드가 {success: true, data: spark} 형태로 응답
      if (response.data is Map && response.data['success'] == true) {
        final sparkData = response.data['data'];
        
        // Spark 객체로 변환
        final Map<String, dynamic> sparkJson = Map<String, dynamic>.from(sparkData);
        
        // 위치 정보 처리
        if (sparkJson.containsKey('location') && !sparkJson.containsKey('locationName')) {
          sparkJson['locationName'] = sparkJson['location'];
        }
        
        // 좌표 정보 확인 및 기본 위치 텍스트 설정
        if (sparkJson['latitude'] != null && sparkJson['longitude'] != null) {
          if (sparkJson['locationName'] == null || sparkJson['locationName'] == '알 수 없는 위치') {
            sparkJson['locationName'] = '근처 위치';
          }
        }
        
        return Spark.fromJson(sparkJson);
      }
      
      throw Exception('Invalid response from accept spark');
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 스파크 거절
  Future<Spark> rejectSpark(String sparkId) async {
    try {
      final response = await _apiClient.dio.put('/sparks/$sparkId/reject');
      
      // 백엔드가 {success: true, data: spark} 형태로 응답
      if (response.data is Map && response.data['success'] == true) {
        final sparkData = response.data['data'];
        
        // Spark 객체로 변환
        final Map<String, dynamic> sparkJson = Map<String, dynamic>.from(sparkData);
        
        // 위치 정보 처리
        if (sparkJson.containsKey('location') && !sparkJson.containsKey('locationName')) {
          sparkJson['locationName'] = sparkJson['location'];
        }
        
        // 좌표 정보 확인 및 기본 위치 텍스트 설정
        if (sparkJson['latitude'] != null && sparkJson['longitude'] != null) {
          if (sparkJson['locationName'] == null || sparkJson['locationName'] == '알 수 없는 위치') {
            sparkJson['locationName'] = '근처 위치';
          }
        }
        
        return Spark.fromJson(sparkJson);
      }
      
      throw Exception('Invalid response from reject spark');
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 스파크 상세 정보
  Future<SparkDetail> getSparkDetail(String sparkId) async {
    try {
      print('=== Fetching spark detail from backend for ID: $sparkId');
      final response = await _apiClient.dio.get('/sparks/$sparkId');
      
      print('=== Backend response status: ${response.statusCode}');
      print('=== Backend response data: ${response.data}');
      
      if (response.data != null && response.data['data'] != null) {
        final data = response.data['data'];
        print('=== Spark detail data: $data');
        
        // 상대방 프로필 정보 파싱
        SparkUserProfile? otherUser;
        if (data['otherUser'] != null) {
          print('=== Found otherUser in response: ${data['otherUser']}');
          final userData = data['otherUser'];
          otherUser = SparkUserProfile(
            id: userData['id'] ?? '',
            nickname: userData['nickname'] ?? '익명',
            avatarUrl: userData['avatarUrl'],
            bio: userData['bio'],
            occupation: userData['occupation'],
            location: userData['location'],
            interests: userData['interests'] != null
              ? List<String>.from(userData['interests'])
              : [],
            skills: userData['skills'] != null
              ? List<String>.from(userData['skills'])
              : [],
            languages: userData['languages'] != null
              ? List<String>.from(userData['languages'])
              : [],
          );
          print('=== Created SparkUserProfile: $otherUser');
        } else {
          print('=== No otherUser found in response');
        }
        
        // 위치 정보 처리 - latitude/longitude가 있으면 사용
        String locationText = data['location'] ?? '알 수 없는 위치';
        if (locationText == '알 수 없는 위치' && 
            data['latitude'] != null && 
            data['longitude'] != null) {
          // 좌표가 있으면 간단한 형식으로 표시
          final lat = data['latitude'];
          final lng = data['longitude'];
          locationText = '근처 위치'; // 또는 역지오코딩 서비스 호출
        }
        
        return SparkDetail(
          id: data['id'] ?? sparkId,
          location: locationText,
          time: data['time'] ?? '알 수 없음',
          duration: data['duration'] ?? '알 수 없음',
          distance: data['distance']?.toString() ?? '0m',
          matchingRate: data['matchingRate'] ?? 0,
          commonInterests: data['commonInterests'] != null 
            ? List<String>.from(data['commonInterests'])
            : [],
          signatureConnection: data['signatureConnection'] != null
            ? SignatureConnection(
                movie: data['signatureConnection']['movie'],
                artist: data['signatureConnection']['artist'],
                mbti: data['signatureConnection']['mbti'],
                isMovieMatch: data['signatureConnection']['isMovieMatch'] ?? false,
                isArtistMatch: data['signatureConnection']['isArtistMatch'] ?? false,
                isMbtiMatch: data['signatureConnection']['isMbtiMatch'] ?? false,
              )
            : const SignatureConnection(
                movie: null,
                artist: null,
                mbti: null,
                isMovieMatch: false,
                isArtistMatch: false,
                isMbtiMatch: false,
              ),
          additionalHints: data['additionalHints'] != null
            ? List<String>.from(data['additionalHints'])
            : [],
          isPremium: data['isPremium'] ?? false,
          otherUser: otherUser, // 상대방 프로필 정보 추가
        );
      }
      
      throw Exception('Invalid spark detail response');
    } catch (e) {
      print('Error fetching spark detail: $e');
      throw _handleError(e);
    }
  }
  
  // 주변 잠재적 스파크 대상 가져오기 (위치 기반)
  Future<List<Map<String, dynamic>>> getPotentialSparks({
    required double latitude,
    required double longitude,
    double radiusMeters = 100,
  }) async {
    try {
      // 실제로는 location service와 연동하여 주변 사용자를 찾고
      // 스파크 가능성을 계산하는 로직이 필요
      // 임시로 빈 리스트 반환
      return [];
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 스파크 통계 가져오기
  Future<Map<String, dynamic>> getSparkStats() async {
    try {
      final response = await _apiClient.dio.get('/sparks/stats');
      
      // API 응답이 { success: true, data: {...} } 형태인 경우
      if (response.data != null && response.data['data'] != null) {
        return response.data['data'];
      }
      
      // 기본값 반환
      return {
        'totalSparks': 0,
        'pendingSparks': 0,
        'acceptedSparks': 0,
        'rejectedSparks': 0,
        'todaySparks': 0,
        'thisWeekSparks': 0,
      };
    } catch (e) {
      throw _handleError(e);
    }
  }
  

  // SparkType 파싱 헬퍼
  SparkType _parseSparkType(String? type) {
    switch (type?.toLowerCase()) {
      case 'manual':
        return SparkType.manual;
      case 'proximity':
        return SparkType.proximity;
      case 'automatic':
      default:
        return SparkType.automatic;
    }
  }

  // SparkStatus 파싱 헬퍼
  SparkStatus _parseSparkStatus(String status) {
    switch (status.toLowerCase()) {
      case 'pending':
        return SparkStatus.pending;
      case 'accepted':
        return SparkStatus.accepted;
      case 'rejected':
        return SparkStatus.rejected;
      case 'expired':
        return SparkStatus.expired;
      case 'matched':
        return SparkStatus.matched;
      default:
        return SparkStatus.pending;
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
          // 백엔드 에러 응답 구조: { error: { message: "..." } } 또는 { message: "..." }
          String message = '알 수 없는 오류가 발생했습니다.';
          
          if (error.response?.data != null) {
            final data = error.response!.data;
            if (data['error'] != null && data['error']['message'] != null) {
              message = data['error']['message'];
            } else if (data['message'] != null) {
              message = data['message'];
            }
          }
          
          // 특정 에러 메시지에 대한 한글 변환
          if (message.contains('already exists')) {
            message = '이미 이 사용자에게 스파크를 보냈습니다';
          } else if (message.contains('blocked')) {
            message = '차단된 사용자에게는 스파크를 보낼 수 없습니다';
          } else if (message.contains('limit')) {
            message = '스파크 전송 제한에 도달했습니다';
          }
          
          return Exception(message);
        case DioExceptionType.cancel:
          return Exception('요청이 취소되었습니다.');
        default:
          return Exception('네트워크 오류가 발생했습니다.');
      }
    }
    return Exception('알 수 없는 오류가 발생했습니다.');
  }
}