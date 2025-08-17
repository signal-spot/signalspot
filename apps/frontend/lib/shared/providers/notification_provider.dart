import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/notification_service.dart';
import '../models/index.dart';

// Notification Service Provider
final notificationServiceProvider = Provider<NotificationService>((ref) {
  return NotificationService();
});

// 알림 목록 상태
final notificationListProvider = StateNotifierProvider<NotificationListNotifier, AsyncValue<NotificationListResponse>>((ref) {
  return NotificationListNotifier(ref.read(notificationServiceProvider));
});

class NotificationListNotifier extends StateNotifier<AsyncValue<NotificationListResponse>> {
  final NotificationService _notificationService;
  
  NotificationListNotifier(this._notificationService) : super(const AsyncValue.loading());
  
  Future<void> loadNotifications({
    int limit = 20,
    int offset = 0,
    bool unreadOnly = false,
  }) async {
    print('[DEBUG] NotificationListNotifier.loadNotifications - Starting...');
    print('[DEBUG] NotificationListNotifier.loadNotifications - limit: $limit, offset: $offset, unreadOnly: $unreadOnly');
    
    state = const AsyncValue.loading();
    
    try {
      final response = await _notificationService.getNotifications(
        limit: limit,
        offset: offset,
        unreadOnly: unreadOnly,
      );
      
      print('[DEBUG] NotificationListNotifier.loadNotifications - Response received');
      print('[DEBUG] NotificationListNotifier.loadNotifications - unreadCount: ${response.unreadCount}');
      print('[DEBUG] NotificationListNotifier.loadNotifications - notifications.length: ${response.notifications.length}');
      print('[DEBUG] NotificationListNotifier.loadNotifications - totalCount: ${response.totalCount}');
      
      state = AsyncValue.data(response);
      print('[DEBUG] NotificationListNotifier.loadNotifications - State updated to data');
    } catch (error, stackTrace) {
      print('[DEBUG] NotificationListNotifier.loadNotifications - Error: $error');
      print('[DEBUG] NotificationListNotifier.loadNotifications - StackTrace: $stackTrace');
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> refresh() async {
    await loadNotifications();
  }
  
  Future<void> markAsRead(String notificationId) async {
    try {
      await _notificationService.markAsRead(notificationId);
      // 알림 읽음 처리 후 목록 새로고침
      await loadNotifications();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> markAllAsRead() async {
    try {
      await _notificationService.markAllAsRead();
      // 모두 읽음 처리 후 목록 새로고침
      await loadNotifications();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> deleteNotification(String notificationId) async {
    try {
      await _notificationService.deleteNotification(notificationId);
      // 삭제 후 목록 새로고침
      await loadNotifications();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// 읽지 않은 알림 개수 Provider
final unreadNotificationCountProvider = Provider<AsyncValue<int>>((ref) {
  final notificationList = ref.watch(notificationListProvider);
  
  print('[DEBUG] unreadNotificationCountProvider - notificationList state: $notificationList');
  
  return notificationList.when(
    data: (response) {
      // unreadCount를 직접 사용 (NotificationListResponse에 정의됨)
      print('[DEBUG] unreadNotificationCountProvider - response.unreadCount: ${response.unreadCount}');
      print('[DEBUG] unreadNotificationCountProvider - response.notifications.length: ${response.notifications.length}');
      return AsyncValue.data(response.unreadCount);
    },
    loading: () {
      print('[DEBUG] unreadNotificationCountProvider - Loading...');
      return const AsyncValue.loading();
    },
    error: (error, stackTrace) {
      print('[DEBUG] unreadNotificationCountProvider - Error: $error');
      return AsyncValue.error(error, stackTrace);
    },
  );
});

// 알림 설정 상태
final notificationSettingsProvider = StateNotifierProvider<NotificationSettingsNotifier, AsyncValue<NotificationSettings>>((ref) {
  return NotificationSettingsNotifier(ref.read(notificationServiceProvider));
});

class NotificationSettingsNotifier extends StateNotifier<AsyncValue<NotificationSettings>> {
  final NotificationService _notificationService;
  
  NotificationSettingsNotifier(this._notificationService) : super(const AsyncValue.loading()) {
    loadSettings();
  }
  
  Future<void> loadSettings() async {
    state = const AsyncValue.loading();
    
    try {
      final settings = await _notificationService.getNotificationSettings();
      state = AsyncValue.data(settings);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> updateSettings(NotificationSettings settings) async {
    try {
      await _notificationService.updateNotificationSettings(settings);
      state = AsyncValue.data(settings);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  void togglePushNotifications() {
    state.whenData((settings) {
      final newSettings = settings.copyWith(pushEnabled: !settings.pushEnabled);
      updateSettings(newSettings);
    });
  }
  
  void toggleSparkNotifications() {
    state.whenData((settings) {
      final newSettings = settings.copyWith(sparkNotifications: !settings.sparkNotifications);
      updateSettings(newSettings);
    });
  }
  
  void toggleMessageNotifications() {
    state.whenData((settings) {
      final newSettings = settings.copyWith(messageNotifications: !settings.messageNotifications);
      updateSettings(newSettings);
    });
  }
  
  void toggleProfileViewNotifications() {
    state.whenData((settings) {
      final newSettings = settings.copyWith(profileViewNotifications: !settings.profileViewNotifications);
      updateSettings(newSettings);
    });
  }
  
  void toggleMarketingNotifications() {
    state.whenData((settings) {
      final newSettings = settings.copyWith(marketingNotifications: !settings.marketingNotifications);
      updateSettings(newSettings);
    });
  }
}

// 알림 뱃지 표시 여부 Provider
final showNotificationBadgeProvider = Provider<bool>((ref) {
  final unreadCount = ref.watch(unreadNotificationCountProvider);
  
  print('[DEBUG] showNotificationBadgeProvider - unreadCount state: $unreadCount');
  
  final result = unreadCount.when(
    data: (count) {
      print('[DEBUG] showNotificationBadgeProvider - count: $count, returning: ${count > 0}');
      return count > 0;
    },
    loading: () {
      print('[DEBUG] showNotificationBadgeProvider - Loading, returning: false');
      return false;
    },
    error: (error, _) {
      print('[DEBUG] showNotificationBadgeProvider - Error: $error, returning: false');
      return false;
    },
  );
  
  print('[DEBUG] showNotificationBadgeProvider - Final result: $result');
  return result;
});

// FCM 토큰 관리
final fcmTokenProvider = StateNotifierProvider<FcmTokenNotifier, String?>((ref) {
  return FcmTokenNotifier(ref.read(notificationServiceProvider));
});

class FcmTokenNotifier extends StateNotifier<String?> {
  final NotificationService _notificationService;
  
  FcmTokenNotifier(this._notificationService) : super(null);
  
  Future<void> updateToken(String token) async {
    try {
      await _notificationService.updateFcmToken(token);
      state = token;
    } catch (e) {
      // 토큰 업데이트 실패 시 처리 (실제 환경에서는 로깅 서비스 사용)
      // TODO: Use proper logging service instead of print in production
    }
  }
  
  Future<void> removeToken() async {
    try {
      await _notificationService.removeFcmToken();
      state = null;
    } catch (e) {
      // 토큰 제거 실패 시 처리 (실제 환경에서는 로깅 서비스 사용)
      // TODO: Use proper logging service instead of print in production
    }
  }
}