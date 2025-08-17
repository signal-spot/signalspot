import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';
import '../../core/api/api_client.dart';
import '../models/index.dart';

class ProfileService {
  final ApiClient _apiClient = ApiClient();
  
  // 내 프로필 가져오기
  Future<UserProfile> getMyProfile() async {
    try {
      final response = await _apiClient.dio.get('/profile/me');
      
      // 백엔드 응답을 프론트엔드 모델에 맞게 매핑
      final data = response.data['data'] ?? response.data;
      
      // signatureConnection 매핑
      SignatureConnectionPreferences? signatureConnection;
      if (data['signatureConnection'] != null) {
        final sc = data['signatureConnection'];
        // 배열 필드 안전하게 처리
        List<String>? interestsList;
        if (sc['interests'] != null && sc['interests'] is List && (sc['interests'] as List).isNotEmpty) {
          interestsList = List<String>.from(sc['interests']);
        }
        
        signatureConnection = SignatureConnectionPreferences(
          mbti: sc['mbti'] is String ? sc['mbti'] : null,
          interests: interestsList,
          memorablePlace: sc['memorablePlace'] is String ? sc['memorablePlace'] : null,
          childhoodMemory: sc['childhoodMemory'] is String ? sc['childhoodMemory'] : null,
          turningPoint: sc['turningPoint'] is String ? sc['turningPoint'] : null,
          proudestMoment: sc['proudestMoment'] is String ? sc['proudestMoment'] : null,
          bucketList: sc['bucketList'] is String ? sc['bucketList'] : null,
          lifeLesson: sc['lifeLesson'] is String ? sc['lifeLesson'] : null,
          lifeMovie: sc['lifeMovie'] is String ? sc['lifeMovie'] : null,
          favoriteArtist: sc['favoriteArtist'] is String ? sc['favoriteArtist'] : null,
          showMovie: sc['showMovie'] ?? true,
          showArtist: sc['showArtist'] ?? true,
          showMbti: sc['showMbti'] ?? true,
        );
      }
      
      // ProfileStats 매핑
      ProfileStats? stats;
      if (data['profileViews'] != null || data['profileStats'] != null) {
        stats = ProfileStats(
          profileViews: data['profileViews'] ?? 0,
          totalSparks: data['profileStats']?['totalSparks'] ?? 0,
          totalMatches: data['profileStats']?['totalMatches'] ?? 0,
          totalSignalSpots: data['profileStats']?['totalSignalSpots'] ?? 0,
        );
      }
      
      // location 처리 - 객체인 경우 address 추출, 문자열인 경우 그대로 사용
      String? locationString;
      if (data['location'] != null) {
        if (data['location'] is Map) {
          locationString = data['location']['address'];
        } else if (data['location'] is String) {
          locationString = data['location'];
        }
      }
      
      return UserProfile(
        id: data['id'] ?? '',
        userId: data['id'] ?? '',
        displayName: data['username'] ?? data['firstName'] ?? '사용자',
        bio: data['bio'],
        avatarUrl: data['avatarUrl'],
        birthDate: data['dateOfBirth'] != null ? DateTime.parse(data['dateOfBirth']) : null,
        location: locationString,
        interests: data['interests'] != null ? List<String>.from(data['interests']) : null,
        visibility: _parseVisibility(data['profileVisibility']),
        signatureConnection: signatureConnection,
        stats: stats,
        createdAt: DateTime.parse(data['createdAt'] ?? DateTime.now().toIso8601String()),
        updatedAt: data['updatedAt'] != null 
          ? DateTime.parse(data['updatedAt']) 
          : DateTime.now(),
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 다른 사용자 프로필 가져오기
  Future<UserProfile> getUserProfile(String userId) async {
    try {
      final response = await _apiClient.dio.get('/profile/$userId');
      
      // 백엔드 응답을 프론트엔드 모델에 맞게 매핑
      final data = response.data['data'] ?? response.data;
      
      // signatureConnection 매핑
      SignatureConnectionPreferences? signatureConnection;
      if (data['signatureConnection'] != null) {
        final sc = data['signatureConnection'];
        // 배열 필드 안전하게 처리
        List<String>? interestsList;
        if (sc['interests'] != null && sc['interests'] is List && (sc['interests'] as List).isNotEmpty) {
          interestsList = List<String>.from(sc['interests']);
        }
        
        signatureConnection = SignatureConnectionPreferences(
          mbti: sc['mbti'] is String ? sc['mbti'] : null,
          interests: interestsList,
          memorablePlace: sc['memorablePlace'] is String ? sc['memorablePlace'] : null,
          childhoodMemory: sc['childhoodMemory'] is String ? sc['childhoodMemory'] : null,
          turningPoint: sc['turningPoint'] is String ? sc['turningPoint'] : null,
          proudestMoment: sc['proudestMoment'] is String ? sc['proudestMoment'] : null,
          bucketList: sc['bucketList'] is String ? sc['bucketList'] : null,
          lifeLesson: sc['lifeLesson'] is String ? sc['lifeLesson'] : null,
          lifeMovie: sc['lifeMovie'] is String ? sc['lifeMovie'] : null,
          favoriteArtist: sc['favoriteArtist'] is String ? sc['favoriteArtist'] : null,
          showMovie: sc['showMovie'] ?? true,
          showArtist: sc['showArtist'] ?? true,
          showMbti: sc['showMbti'] ?? true,
        );
      }
      
      // ProfileStats 매핑
      ProfileStats? stats;
      if (data['profileViews'] != null || data['profileStats'] != null) {
        stats = ProfileStats(
          profileViews: data['profileViews'] ?? 0,
          totalSparks: data['profileStats']?['totalSparks'] ?? 0,
          totalMatches: data['profileStats']?['totalMatches'] ?? 0,
          totalSignalSpots: data['profileStats']?['totalSignalSpots'] ?? 0,
        );
      }
      
      // location 처리 - 객체인 경우 address 추출, 문자열인 경우 그대로 사용
      String? locationString;
      if (data['location'] != null) {
        if (data['location'] is Map) {
          locationString = data['location']['address'];
        } else if (data['location'] is String) {
          locationString = data['location'];
        }
      }
      
      return UserProfile(
        id: data['id'] ?? '',
        userId: data['id'] ?? '',
        displayName: data['username'] ?? data['firstName'] ?? '사용자',
        bio: data['bio'],
        avatarUrl: data['avatarUrl'],
        birthDate: data['dateOfBirth'] != null ? DateTime.parse(data['dateOfBirth']) : null,
        location: locationString,
        interests: data['interests'] != null ? List<String>.from(data['interests']) : null,
        visibility: _parseVisibility(data['profileVisibility']),
        signatureConnection: signatureConnection,
        stats: stats,
        createdAt: DateTime.parse(data['createdAt'] ?? DateTime.now().toIso8601String()),
        updatedAt: data['updatedAt'] != null 
          ? DateTime.parse(data['updatedAt']) 
          : DateTime.now(),
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 프로필 업데이트
  Future<UserProfile> updateProfile(UpdateProfileRequest request) async {
    try {
      final response = await _apiClient.dio.put(
        '/profile/me',
        data: request.toJson(),
      );
      
      // 백엔드 응답을 프론트엔드 모델에 맞게 매핑
      final data = response.data['data'] ?? response.data;
      
      // signatureConnection 매핑
      SignatureConnectionPreferences? signatureConnection;
      if (data['signatureConnection'] != null) {
        final sc = data['signatureConnection'];
        // 배열 필드 안전하게 처리
        List<String>? interestsList;
        if (sc['interests'] != null && sc['interests'] is List && (sc['interests'] as List).isNotEmpty) {
          interestsList = List<String>.from(sc['interests']);
        }
        
        signatureConnection = SignatureConnectionPreferences(
          mbti: sc['mbti'] is String ? sc['mbti'] : null,
          interests: interestsList,
          memorablePlace: sc['memorablePlace'] is String ? sc['memorablePlace'] : null,
          childhoodMemory: sc['childhoodMemory'] is String ? sc['childhoodMemory'] : null,
          turningPoint: sc['turningPoint'] is String ? sc['turningPoint'] : null,
          proudestMoment: sc['proudestMoment'] is String ? sc['proudestMoment'] : null,
          bucketList: sc['bucketList'] is String ? sc['bucketList'] : null,
          lifeLesson: sc['lifeLesson'] is String ? sc['lifeLesson'] : null,
          lifeMovie: sc['lifeMovie'] is String ? sc['lifeMovie'] : null,
          favoriteArtist: sc['favoriteArtist'] is String ? sc['favoriteArtist'] : null,
          showMovie: sc['showMovie'] ?? true,
          showArtist: sc['showArtist'] ?? true,
          showMbti: sc['showMbti'] ?? true,
        );
      }
      
      // ProfileStats 매핑
      ProfileStats? stats;
      if (data['profileViews'] != null || data['profileStats'] != null) {
        stats = ProfileStats(
          profileViews: data['profileViews'] ?? 0,
          totalSparks: data['profileStats']?['totalSparks'] ?? 0,
          totalMatches: data['profileStats']?['totalMatches'] ?? 0,
          totalSignalSpots: data['profileStats']?['totalSignalSpots'] ?? 0,
        );
      }
      
      // location 처리 - 객체인 경우 address 추출, 문자열인 경우 그대로 사용
      String? locationString;
      if (data['location'] != null) {
        if (data['location'] is Map) {
          locationString = data['location']['address'];
        } else if (data['location'] is String) {
          locationString = data['location'];
        }
      }
      
      return UserProfile(
        id: data['id'] ?? '',
        userId: data['id'] ?? '',
        displayName: data['username'] ?? data['firstName'] ?? '사용자',
        bio: data['bio'],
        avatarUrl: data['avatarUrl'],
        birthDate: data['dateOfBirth'] != null ? DateTime.parse(data['dateOfBirth']) : null,
        location: locationString,
        interests: data['interests'] != null ? List<String>.from(data['interests']) : null,
        visibility: _parseVisibility(data['profileVisibility']),
        signatureConnection: signatureConnection,
        stats: stats,
        createdAt: DateTime.parse(data['createdAt'] ?? DateTime.now().toIso8601String()),
        updatedAt: data['updatedAt'] != null 
          ? DateTime.parse(data['updatedAt']) 
          : DateTime.now(),
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 프로필 설정 업데이트
  Future<void> updateProfileSettings(ProfileSettings settings) async {
    try {
      await _apiClient.dio.put(
        '/profile/settings',
        data: settings.toJson(),
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 프로필 가시성 변경
  Future<void> updateProfileVisibility(ProfileVisibility visibility) async {
    try {
      await _apiClient.dio.put('/profile/visibility/${visibility.name}');
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 프로필 검색
  Future<List<UserProfile>> searchProfiles({
    required String query,
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final response = await _apiClient.dio.get(
        '/profile/search',
        queryParameters: {
          'q': query,
          'limit': limit,
          'offset': offset,
        },
      );
      
      return (response.data['data'] as List)
          .map((json) => UserProfile.fromJson(json))
          .toList();
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 추천 프로필 가져오기
  Future<List<UserProfile>> getProfileSuggestions({int limit = 10}) async {
    try {
      final response = await _apiClient.dio.get(
        '/profile/suggestions',
        queryParameters: {'limit': limit},
      );
      
      return (response.data as List)
          .map((json) => UserProfile.fromJson(json))
          .toList();
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 프로필 분석 가져오기
  Future<Map<String, dynamic>> getProfileAnalytics() async {
    try {
      final response = await _apiClient.dio.get('/profile/analytics');
      
      print('Profile Analytics Response: ${response.data}');
      
      // 백엔드 응답이 {success: true, data: {...}} 형태인 경우
      if (response.data != null && response.data['data'] != null) {
        final data = response.data['data'];
        final analytics = data['analytics'] ?? {};
        final profileSummary = data['profileSummary'] ?? {};
        final recentActivity = data['recentActivity'] ?? {};
        
        // 통계 데이터 매핑 - 백엔드에서 제공하는 새로운 필드들 포함
        return {
          'totalSparks': analytics['totalSparks'] ?? 0,
          'totalMessages': analytics['totalMessages'] ?? 0,
          'totalMatches': analytics['totalMatches'] ?? 0,
          'totalSpots': analytics['totalSignalSpots'] ?? 0,
          'activeSignalSpots': analytics['activeSignalSpots'] ?? 0,
          'totalSpotLikes': analytics['totalSpotLikes'] ?? 0,
          'totalSpotViews': analytics['totalSpotViews'] ?? 0,
          'profileViews': profileSummary['profileViews'] ?? 0,
          'lastActive': recentActivity['lastLogin'],
          'accountAge': recentActivity['accountAge'],
          'isRecentlyActive': recentActivity['isRecentlyActive'] ?? false,
        };
      }
      
      // 응답이 없는 경우 기본값 반환
      return {
        'totalSparks': 0,
        'totalMessages': 0,
        'totalMatches': 0,
        'totalSpots': 0,
        'activeSignalSpots': 0,
        'totalSpotLikes': 0,
        'totalSpotViews': 0,
        'profileViews': 0,
        'lastActive': null,
        'accountAge': null,
        'isRecentlyActive': false,
      };
    } catch (e) {
      print('Error fetching profile analytics: $e');
      throw _handleError(e);
    }
  }
  
  // 아바타 업로드
  Future<UserProfile> uploadAvatar(String filePath) async {
    try {
      print('[DEBUG] ProfileService.uploadAvatar - Starting upload');
      print('[DEBUG] ProfileService.uploadAvatar - File path: $filePath');
      
      // 파일 확장자로 Content-Type 결정
      String fileName = filePath.split('/').last;
      String? mimeType;
      
      if (filePath.toLowerCase().endsWith('.jpg') || filePath.toLowerCase().endsWith('.jpeg')) {
        mimeType = 'image/jpeg';
      } else if (filePath.toLowerCase().endsWith('.png')) {
        mimeType = 'image/png';
      } else if (filePath.toLowerCase().endsWith('.gif')) {
        mimeType = 'image/gif';
      } else if (filePath.toLowerCase().endsWith('.webp')) {
        mimeType = 'image/webp';
      } else {
        // 기본값으로 jpeg 사용
        mimeType = 'image/jpeg';
      }
      
      final formData = FormData.fromMap({
        'avatar': await MultipartFile.fromFile(
          filePath,
          filename: 'profile_${DateTime.now().millisecondsSinceEpoch}.jpg',
          contentType: MediaType.parse(mimeType),
        ),
      });
      
      final response = await _apiClient.dio.post(
        '/profile/avatar',
        data: formData,
        options: Options(
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        ),
      );
      
      print('[DEBUG] ProfileService.uploadAvatar - Response status: ${response.statusCode}');
      print('[DEBUG] ProfileService.uploadAvatar - Response data: ${response.data}');
      
      // 백엔드 응답을 프론트엔드 모델에 맞게 매핑
      final data = response.data['data'] ?? response.data;
      print('[DEBUG] ProfileService.uploadAvatar - Extracted data: $data');
      print('[DEBUG] ProfileService.uploadAvatar - Avatar URL: ${data['avatarUrl']}');
      
      return UserProfile(
        id: data['id'] ?? '',
        userId: data['id'] ?? '',
        displayName: data['username'] ?? data['firstName'] ?? '사용자',
        bio: data['bio'],
        avatarUrl: data['avatarUrl'],
        birthDate: data['dateOfBirth'] != null ? DateTime.parse(data['dateOfBirth']) : null,
        location: _parseLocation(data['location']),
        interests: data['interests'] != null ? List<String>.from(data['interests']) : null,
        visibility: _parseVisibility(data['profileVisibility']),
        createdAt: DateTime.parse(data['createdAt'] ?? DateTime.now().toIso8601String()),
        updatedAt: data['updatedAt'] != null 
          ? DateTime.parse(data['updatedAt']) 
          : (data['lastProfileUpdateAt'] != null 
              ? DateTime.parse(data['lastProfileUpdateAt'])
              : DateTime.now()),
      );
    } catch (e) {
      print('[ERROR] ProfileService.uploadAvatar - Exception occurred');
      print('[ERROR] ProfileService.uploadAvatar - Error: $e');
      print('[ERROR] ProfileService.uploadAvatar - Error type: ${e.runtimeType}');
      
      if (e is DioException) {
        print('[ERROR] ProfileService.uploadAvatar - DioException type: ${e.type}');
        print('[ERROR] ProfileService.uploadAvatar - Response status: ${e.response?.statusCode}');
        print('[ERROR] ProfileService.uploadAvatar - Response data: ${e.response?.data}');
      }
      
      throw _handleError(e);
    }
  }
  
  // 아바타 삭제
  Future<UserProfile> removeAvatar() async {
    try {
      final response = await _apiClient.dio.delete('/profile/avatar');
      
      // 백엔드 응답을 프론트엔드 모델에 맞게 매핑
      final data = response.data['data'] ?? response.data;
      
      return UserProfile(
        id: data['id'] ?? '',
        userId: data['id'] ?? '',
        displayName: data['username'] ?? data['firstName'] ?? '사용자',
        bio: data['bio'],
        avatarUrl: data['avatarUrl'],
        birthDate: data['dateOfBirth'] != null ? DateTime.parse(data['dateOfBirth']) : null,
        location: _parseLocation(data['location']),
        interests: data['interests'] != null ? List<String>.from(data['interests']) : null,
        visibility: _parseVisibility(data['profileVisibility']),
        createdAt: DateTime.parse(data['createdAt'] ?? DateTime.now().toIso8601String()),
        updatedAt: data['updatedAt'] != null 
          ? DateTime.parse(data['updatedAt']) 
          : (data['lastProfileUpdateAt'] != null 
              ? DateTime.parse(data['lastProfileUpdateAt'])
              : DateTime.now()),
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 시그니처 커넥션 설정 업데이트
  Future<void> updateSignatureConnectionPreferences(
    SignatureConnectionPreferences preferences,
  ) async {
    try {
      await _apiClient.dio.put(
        '/profile/signature-connection/preferences',
        data: preferences.toJson(),
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 시그니처 커넥션 설정 가져오기
  Future<SignatureConnectionPreferences?> getSignatureConnectionPreferences() async {
    try {
      final response = await _apiClient.dio.get('/profile/signature-connection/preferences');
      
      // 백엔드 응답에서 데이터 추출
      final data = response.data['data'] ?? response.data;
      
      if (data != null) {
        // signature_connection.dart 모델이 있다면 그것을 사용, 없으면 user_profile.dart 사용
        return SignatureConnectionPreferences.fromJson(data);
      }
      return null;
    } catch (e) {
      // 404 에러인 경우 null 반환 (설정이 없는 경우)
      if (e is DioException && e.response?.statusCode == 404) {
        return null;
      }
      throw _handleError(e);
    }
  }
  
  // 시그니처 커넥션 매치 가져오기
  Future<List<dynamic>> getSignatureConnectionMatches({
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final response = await _apiClient.dio.get(
        '/profile/signature-connection/matches',
        queryParameters: {
          'limit': limit,
          'offset': offset,
        },
      );
      
      return response.data as List;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 시그니처 커넥션 통계 가져오기
  Future<Map<String, dynamic>> getSignatureConnectionStats() async {
    try {
      final response = await _apiClient.dio.get('/profile/signature-connection/stats');
      
      return response.data;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // location 필드 파싱 헬퍼 메서드
  String? _parseLocation(dynamic locationData) {
    if (locationData == null) return null;
    
    if (locationData is Map) {
      // 백엔드가 객체로 반환하는 경우
      return locationData['address'] as String?;
    } else if (locationData is String) {
      // 백엔드가 문자열로 반환하는 경우
      return locationData;
    }
    
    return null;
  }
  
  // ProfileVisibility 파싱 헬퍼 메서드
  ProfileVisibility _parseVisibility(String? visibility) {
    switch (visibility?.toLowerCase()) {
      case 'public':
        return ProfileVisibility.public;
      case 'friends':
        return ProfileVisibility.friends;
      case 'private':
        return ProfileVisibility.private;
      default:
        return ProfileVisibility.public;
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