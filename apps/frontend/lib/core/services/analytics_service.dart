import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter/foundation.dart';

class AnalyticsService {
  static FirebaseAnalytics? _analytics;
  static FirebaseAnalyticsObserver? _observer;
  static bool _isInitialized = false;
  
  static FirebaseAnalytics? get analytics => _analytics;
  static FirebaseAnalyticsObserver? get observer => _observer;
  static bool get isInitialized => _isInitialized;
  
  static Future<void> initialize(FirebaseAnalytics analytics) async {
    _analytics = analytics;
    _observer = FirebaseAnalyticsObserver(analytics: analytics);
    _isInitialized = true;
    
    // 기본 사용자 속성 설정
    await _setDefaultUserProperties();
  }
  
  static Future<void> _setDefaultUserProperties() async {
    if (_analytics == null) return;
    
    try {
      // 플랫폼 정보 설정
      if (defaultTargetPlatform == TargetPlatform.iOS) {
        await _analytics!.setUserProperty(name: 'platform', value: 'iOS');
      } else if (defaultTargetPlatform == TargetPlatform.android) {
        await _analytics!.setUserProperty(name: 'platform', value: 'Android');
      }
      
      // 앱 버전 설정 (필요시 PackageInfo 사용)
      await _analytics!.setUserProperty(name: 'app_version', value: '1.0.0');
    } catch (e) {
      debugPrint('Failed to set user properties: $e');
    }
  }
  
  // 사용자 로그인 이벤트
  static Future<void> logLogin({required String method}) async {
    if (_analytics == null) return;
    
    try {
      await _analytics!.logLogin(loginMethod: method);
    } catch (e) {
      debugPrint('Failed to log login event: $e');
    }
  }
  
  // 사용자 회원가입 이벤트
  static Future<void> logSignUp({required String method}) async {
    if (_analytics == null) return;
    
    try {
      await _analytics!.logSignUp(signUpMethod: method);
    } catch (e) {
      debugPrint('Failed to log sign up event: $e');
    }
  }
  
  // 화면 전환 이벤트 (GoRouter에서 자동으로 처리되지만 수동으로도 가능)
  static Future<void> logScreenView({
    required String screenName,
    String? screenClass,
  }) async {
    if (_analytics == null) return;
    
    try {
      await _analytics!.logScreenView(
        screenName: screenName,
        screenClass: screenClass ?? screenName,
      );
    } catch (e) {
      debugPrint('Failed to log screen view: $e');
    }
  }
  
  // Signal Spot 관련 이벤트들
  static Future<void> logSignalSpotCreated({
    required String spotId,
    required double latitude,
    required double longitude,
    String? message,
  }) async {
    if (_analytics == null) return;
    
    try {
      final Map<String, Object> params = {
        'spot_id': spotId,
        'latitude': latitude,
        'longitude': longitude,
        if (message != null) 'has_message': true,
      };
      
      await _analytics!.logEvent(
        name: 'signal_spot_created',
        parameters: params,
      );
    } catch (e) {
      debugPrint('Failed to log signal spot created: $e');
    }
  }
  
  static Future<void> logSignalSpotViewed({
    required String spotId,
    required String viewSource,
  }) async {
    if (_analytics == null) return;
    
    try {
      final Map<String, Object> params = {
        'spot_id': spotId,
        'view_source': viewSource, // 'map', 'list', 'search', etc.
      };
      
      await _analytics!.logEvent(
        name: 'signal_spot_viewed',
        parameters: params,
      );
    } catch (e) {
      debugPrint('Failed to log signal spot viewed: $e');
    }
  }
  
  static Future<void> logSignalSpotLiked({
    required String spotId,
    required bool isLiked,
  }) async {
    if (_analytics == null) return;
    
    try {
      final Map<String, Object> params = {
        'spot_id': spotId,
      };
      
      await _analytics!.logEvent(
        name: isLiked ? 'signal_spot_liked' : 'signal_spot_unliked',
        parameters: params,
      );
    } catch (e) {
      debugPrint('Failed to log signal spot like: $e');
    }
  }
  
  // Spark 관련 이벤트들
  static Future<void> logSparkSent({
    required String sparkId,
    required String receiverId,
    String? message,
  }) async {
    if (_analytics == null) return;
    
    try {
      final Map<String, Object> params = {
        'spark_id': sparkId,
        'receiver_id': receiverId,
        'has_message': message != null,
      };
      
      await _analytics!.logEvent(
        name: 'spark_sent',
        parameters: params,
      );
    } catch (e) {
      debugPrint('Failed to log spark sent: $e');
    }
  }
  
  static Future<void> logSparkReceived({
    required String sparkId,
    required String senderId,
  }) async {
    if (_analytics == null) return;
    
    try {
      final Map<String, Object> params = {
        'spark_id': sparkId,
        'sender_id': senderId,
      };
      
      await _analytics!.logEvent(
        name: 'spark_received',
        parameters: params,
      );
    } catch (e) {
      debugPrint('Failed to log spark received: $e');
    }
  }
  
  static Future<void> logSparkAccepted({
    required String sparkId,
  }) async {
    if (_analytics == null) return;
    
    try {
      final Map<String, Object> params = {
        'spark_id': sparkId,
      };
      
      await _analytics!.logEvent(
        name: 'spark_accepted',
        parameters: params,
      );
    } catch (e) {
      debugPrint('Failed to log spark accepted: $e');
    }
  }
  
  static Future<void> logSparkRejected({
    required String sparkId,
  }) async {
    if (_analytics == null) return;
    
    try {
      final Map<String, Object> params = {
        'spark_id': sparkId,
      };
      
      await _analytics!.logEvent(
        name: 'spark_rejected',
        parameters: params,
      );
    } catch (e) {
      debugPrint('Failed to log spark rejected: $e');
    }
  }
  
  // 검색 이벤트
  static Future<void> logSearch({
    required String searchTerm,
    required String searchType,
    int? resultsCount,
  }) async {
    if (_analytics == null) return;
    
    try {
      final Map<String, Object> params = {
        'search_type': searchType, // 'signal_spots', 'users', 'locations'
      };
      if (resultsCount != null) {
        params['results_count'] = resultsCount;
      }
      
      await _analytics!.logSearch(
        searchTerm: searchTerm,
        parameters: params,
      );
    } catch (e) {
      debugPrint('Failed to log search: $e');
    }
  }
  
  // 위치 권한 이벤트
  static Future<void> logLocationPermission({
    required bool granted,
  }) async {
    if (_analytics == null) return;
    
    try {
      await _analytics!.logEvent(
        name: granted ? 'location_permission_granted' : 'location_permission_denied',
      );
    } catch (e) {
      debugPrint('Failed to log location permission: $e');
    }
  }
  
  // 알림 권한 이벤트
  static Future<void> logNotificationPermission({
    required bool granted,
  }) async {
    if (_analytics == null) return;
    
    try {
      await _analytics!.logEvent(
        name: granted ? 'notification_permission_granted' : 'notification_permission_denied',
      );
    } catch (e) {
      debugPrint('Failed to log notification permission: $e');
    }
  }
  
  // 프로필 완성도 이벤트
  static Future<void> logProfileCompleted({
    required int completionPercentage,
  }) async {
    if (_analytics == null) return;
    
    try {
      final Map<String, Object> params = {
        'completion_percentage': completionPercentage,
      };
      
      await _analytics!.logEvent(
        name: 'profile_completed',
        parameters: params,
      );
    } catch (e) {
      debugPrint('Failed to log profile completed: $e');
    }
  }
  
  // 공유 이벤트
  static Future<void> logShare({
    required String contentType,
    required String method,
    required String itemId,
  }) async {
    if (_analytics == null) return;
    
    try {
      await _analytics!.logShare(
        contentType: contentType,
        itemId: itemId,
        method: method,
      );
    } catch (e) {
      debugPrint('Failed to log share: $e');
    }
  }
  
  // 커스텀 이벤트
  static Future<void> logEvent({
    required String name,
    Map<String, dynamic>? parameters,
  }) async {
    if (_analytics == null) return;
    
    try {
      // Convert Map<String, dynamic> to Map<String, Object>
      // Filter out null values
      final Map<String, Object>? convertedParams = parameters?.entries
        .where((entry) => entry.value != null)
        .fold<Map<String, Object>>({}, (map, entry) {
          map[entry.key] = entry.value as Object;
          return map;
        });
      
      await _analytics!.logEvent(
        name: name,
        parameters: convertedParams,
      );
    } catch (e) {
      debugPrint('Failed to log custom event: $e');
    }
  }
  
  // 사용자 ID 설정 (로그인 후)
  static Future<void> setUserId(String? userId) async {
    if (_analytics == null) return;
    
    try {
      await _analytics!.setUserId(id: userId);
    } catch (e) {
      debugPrint('Failed to set user ID: $e');
    }
  }
  
  // 사용자 속성 설정
  static Future<void> setUserProperty({
    required String name,
    required String? value,
  }) async {
    if (_analytics == null) return;
    
    try {
      await _analytics!.setUserProperty(name: name, value: value);
    } catch (e) {
      debugPrint('Failed to set user property: $e');
    }
  }
}