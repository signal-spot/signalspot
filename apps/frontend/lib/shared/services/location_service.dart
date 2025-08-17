import 'dart:io' show Platform;
import 'package:dio/dio.dart';
import 'package:geolocator/geolocator.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../core/api/api_client.dart';
import '../models/index.dart';

class LocationService {
  final ApiClient _apiClient = ApiClient();
  
  // 위치 권한 확인 및 요청
  Future<bool> requestLocationPermission() async {
    try {
      // 먼저 위치 서비스가 활성화되어 있는지 확인
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        print('⚠️ 위치 서비스가 비활성화되어 있습니다.');
        // 사용자에게 위치 서비스를 켜도록 요청
        return false;
      }
      
      // 기본 위치 권한 확인
      LocationPermission permission = await Geolocator.checkPermission();
      print('📍 현재 위치 권한 상태: $permission');
      
      if (permission == LocationPermission.denied) {
        print('📍 위치 권한 요청 중...');
        permission = await Geolocator.requestPermission();
        print('📍 위치 권한 요청 결과: $permission');
      }
      
      // iOS에서는 "Always" 권한도 요청
      if (Platform.isIOS && permission == LocationPermission.whileInUse) {
        // iOS에서는 앱 사용 중 권한을 먼저 받고,
        // 나중에 설정에서 항상 허용으로 변경할 수 있음
        print('📍 iOS: 위치 권한이 "앱 사용 중"으로 설정됨. 백그라운드 추적을 위해 설정에서 "항상 허용"으로 변경해주세요.');
        
        // permission_handler를 사용하여 추가 권한 요청
        final status = await Permission.locationAlways.request();
        print('📍 iOS Always 권한 요청 결과: $status');
      }
      
      // Android 13+ 에서 백그라운드 위치 권한 별도 요청
      if (Platform.isAndroid) {
        final androidInfo = await Permission.location.status;
        print('📍 Android 위치 권한 상태: $androidInfo');
        
        if (androidInfo.isGranted) {
          // 백그라운드 위치 권한도 요청
          final bgStatus = await Permission.locationAlways.request();
          print('📍 Android 백그라운드 위치 권한 결과: $bgStatus');
        }
      }
      
      if (permission == LocationPermission.deniedForever) {
        print('❌ 위치 권한이 영구적으로 거부됨. 설정으로 이동합니다.');
        // 시스템 설정으로 이동하도록 안내
        await openAppSettings(); // permission_handler 패키지의 함수
        return false;
      }
      
      final result = permission == LocationPermission.whileInUse || 
                    permission == LocationPermission.always;
      print('📍 최종 위치 권한 상태: $result (permission: $permission)');
      return result;
    } catch (e) {
      print('❌ 위치 권한 요청 중 오류: $e');
      return false;
    }
  }
  
  // 현재 위치 가져오기
  Future<Position> getCurrentPosition() async {
    // 개발 모드에서는 서울시청 좌표 반환
    const bool isDevelopment = true; // 개발 모드: 서울시청 위치 사용
    if (isDevelopment) {
      print('🗺️ LocationService: 개발 모드 - 서울시청 좌표 사용');
      return Position(
        latitude: 37.5665,
        longitude: 126.9780,
        timestamp: DateTime.now(),
        accuracy: 5.0,
        altitude: 0.0,
        altitudeAccuracy: 0.0,
        heading: 0.0,
        headingAccuracy: 0.0,
        speed: 0.0,
        speedAccuracy: 0.0,
      );
    }
    
    final hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      throw Exception('위치 권한이 필요합니다.');
    }
    
    try {
      // 먼저 낮은 정확도로 빠르게 위치 가져오기 시도
      print('📍 위치 가져오기 시도 중...');
      
      // 위치 서비스 활성화 확인
      bool serviceEnabled = await Geolocator.isLocationServiceEnabled();
      if (!serviceEnabled) {
        throw Exception('위치 서비스가 비활성화되어 있습니다. 설정에서 활성화해주세요.');
      }
      
      // 마지막 알려진 위치 먼저 시도
      Position? lastPosition = await Geolocator.getLastKnownPosition();
      if (lastPosition != null && 
          DateTime.now().difference(lastPosition.timestamp).inMinutes < 5) {
        print('📍 마지막 알려진 위치 사용: ${lastPosition.latitude}, ${lastPosition.longitude}');
        return lastPosition;
      }
      
      // 새로운 위치 가져오기 (타임아웃 증가, 정확도 낮춤)
      return await Geolocator.getCurrentPosition(
        desiredAccuracy: LocationAccuracy.medium, // high -> medium으로 변경
        timeLimit: const Duration(seconds: 30), // 10초 -> 30초로 증가
      );
    } catch (e) {
      print('❌ 위치 가져오기 실패, 대체 방법 시도: $e');
      
      // 타임아웃시 낮은 정확도로 재시도
      try {
        return await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.low,
          timeLimit: const Duration(seconds: 5),
        );
      } catch (e2) {
        // 최종 실패시 마지막 알려진 위치라도 반환
        Position? lastPosition = await Geolocator.getLastKnownPosition();
        if (lastPosition != null) {
          print('📍 최종 대안: 마지막 알려진 위치 사용');
          return lastPosition;
        }
        throw Exception('현재 위치를 가져올 수 없습니다: $e2');
      }
    }
  }
  
  // 위치 정보를 서버에 전송
  Future<Location> recordLocation(CreateLocationRequest request) async {
    try {
      final response = await _apiClient.dio.post(
        '/location',
        data: request.toJson(),
      );
      
      // 응답 데이터 구조 확인 및 안전한 파싱
      if (response.data != null && response.data['data'] != null) {
        // 백엔드가 data 필드로 감싸서 반환하는 경우
        final locationData = response.data['data'];
        // user 객체 안의 entity 객체만 Location으로 파싱
        if (locationData['user'] != null && locationData['user']['entity'] != null) {
          // Location 객체는 간단한 위치 정보만 포함해야 함
          final userEntity = locationData['user']['entity'];
          return Location(
            id: DateTime.now().millisecondsSinceEpoch.toString(), // 임시 ID 생성
            userId: userEntity['id'] ?? 'unknown',
            latitude: userEntity['lastKnownLatitude'] ?? request.latitude,
            longitude: userEntity['lastKnownLongitude'] ?? request.longitude,
            accuracy: request.accuracy,
            altitude: request.altitude,
            speed: request.speed,
            timestamp: DateTime.now(),
          );
        }
      }
      
      // 기본값 반환
      return Location(
        id: DateTime.now().millisecondsSinceEpoch.toString(), // 임시 ID 생성
        userId: 'unknown', // 서버에서 자동으로 현재 인증된 사용자 ID 사용
        latitude: request.latitude,
        longitude: request.longitude,
        accuracy: request.accuracy,
        altitude: request.altitude,
        speed: request.speed,
        timestamp: DateTime.now(),
      );
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 현재 위치 업데이트 (자동)
  Future<void> updateCurrentLocation() async {
    try {
      final position = await getCurrentPosition();
      
      print('📡 위치 업데이트 시작');
      print('  📍 위도: ${position.latitude}');
      print('  📍 경도: ${position.longitude}');
      print('  🎯 정확도: ${position.accuracy}m');
      print('  🕰 시간: ${position.timestamp}');
      
      await recordLocation(CreateLocationRequest(
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        altitude: position.altitude,
        speed: position.speed,
      ));
      
      print('✅ 위치 업데이트 성공: ${position.latitude}, ${position.longitude}');
    } catch (e) {
      print('❌ 위치 업데이트 실패: $e');
    }
  }
  
  // 서버에서 현재 위치 가져오기
  Future<Location?> getServerCurrentLocation() async {
    try {
      final response = await _apiClient.dio.get('/location/current');
      
      if (response.data != null) {
        return Location.fromJson(response.data);
      }
      return null;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 위치 히스토리 가져오기
  Future<List<Location>> getLocationHistory({
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final response = await _apiClient.dio.get(
        '/location/history',
        queryParameters: {
          'limit': limit,
          'offset': offset,
        },
      );
      
      return (response.data as List)
          .map((json) => Location.fromJson(json))
          .toList();
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 주변 위치 찾기
  Future<List<Location>> getNearbyLocations({
    required double latitude,
    required double longitude,
    double radiusMeters = 1000,
    int limit = 20,
  }) async {
    try {
      final response = await _apiClient.dio.get(
        '/location/nearby',
        queryParameters: {
          'latitude': latitude,
          'longitude': longitude,
          'radiusMeters': radiusMeters,
          'limit': limit,
        },
      );
      
      return (response.data as List)
          .map((json) => Location.fromJson(json))
          .toList();
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 주변 사용자 찾기
  Future<List<dynamic>> getNearbyUsers(NearbyUsersQuery query) async {
    try {
      final response = await _apiClient.dio.get(
        '/location/nearby/users',
        queryParameters: query.toJson(),
      );
      
      return response.data as List;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 두 좌표 간 거리 계산
  Future<double> calculateDistance({
    required double lat1,
    required double lon1,
    required double lat2,
    required double lon2,
  }) async {
    try {
      final response = await _apiClient.dio.post(
        '/location/calculate-distance',
        data: {
          'lat1': lat1,
          'lon1': lon1,
          'lat2': lat2,
          'lon2': lon2,
        },
      );
      
      return response.data['distance'].toDouble();
    } catch (e) {
      // 서버 오류시 로컬 계산 사용
      return Geolocator.distanceBetween(lat1, lon1, lat2, lon2);
    }
  }
  
  // 위치 통계 가져오기
  Future<LocationStats> getLocationStats() async {
    try {
      final response = await _apiClient.dio.get('/location/stats');
      
      return LocationStats.fromJson(response.data);
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 위치 삭제
  Future<void> deleteLocation(String locationId) async {
    try {
      await _apiClient.dio.delete('/location/$locationId');
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // 위치 스트림 (실시간 위치 추적)
  Stream<Position> getPositionStream() {
    // iOS와 Android에 따라 다른 설정 사용
    final androidSettings = AndroidSettings(
      accuracy: LocationAccuracy.medium,
      distanceFilter: 20,
      intervalDuration: const Duration(seconds: 30), // 30초마다 업데이트
      forceLocationManager: false, // GPS 사용
      foregroundNotificationConfig: const ForegroundNotificationConfig(
        notificationText: "스파크 감지가 활성화되어 주변 사람들과 연결하고 있습니다.",
        notificationTitle: "SignalSpot",
        enableWakeLock: false, // 화면이 꺼지면 배터리 절약
        notificationIcon: AndroidResource(
          name: 'ic_notification',
          defType: 'drawable',
        ),
        setOngoing: false, // 앱 종료 시 알림도 함께 제거 (앱 완전 종료 시 추적 중지)
      ),
    );
    
    final iosSettings = AppleSettings(
      accuracy: LocationAccuracy.medium,
      distanceFilter: 20,
      pauseLocationUpdatesAutomatically: true, // 자동 일시정지 활성화 (배터리 절약)
      showBackgroundLocationIndicator: true, // 백그라운드에서 위치 사용 표시
      activityType: ActivityType.other, // 일반 앱 활동
    );
    
    // 플랫폼별 설정 적용
    final LocationSettings locationSettings;
    if (Platform.isAndroid) {
      locationSettings = androidSettings;
    } else if (Platform.isIOS) {
      locationSettings = iosSettings;
    } else {
      // 기본 설정 (웹 등)
      locationSettings = const LocationSettings(
        accuracy: LocationAccuracy.medium,
        distanceFilter: 20,
      );
    }
    
    return Geolocator.getPositionStream(locationSettings: locationSettings);
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