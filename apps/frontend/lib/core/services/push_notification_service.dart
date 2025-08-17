import 'package:flutter/foundation.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../api/api_client.dart';
// import '../models/notification_settings.dart'; // TODO: Create this file if needed

// Background message handler (must be top-level function)
@pragma('vm:entry-point')
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  print('Handling background message: ${message.messageId}');
}

// Notification settings model
class NotificationSettings {
  final bool pushEnabled;
  final bool emailEnabled;
  final bool smsEnabled;
  final bool spotCreated;
  final bool spotLiked;
  final bool spotCommented;
  final bool messageReceived;
  final bool sparkReceived;
  final bool systemAnnouncements;

  NotificationSettings({
    this.pushEnabled = true,
    this.emailEnabled = false,
    this.smsEnabled = false,
    this.spotCreated = true,
    this.spotLiked = true,
    this.spotCommented = true,
    this.messageReceived = true,
    this.sparkReceived = true,
    this.systemAnnouncements = true,
  });

  Map<String, dynamic> toJson() => {
    'pushEnabled': pushEnabled,
    'emailEnabled': emailEnabled,
    'smsEnabled': smsEnabled,
    'spotCreated': spotCreated,
    'spotLiked': spotLiked,
    'spotCommented': spotCommented,
    'messageReceived': messageReceived,
    'sparkReceived': sparkReceived,
    'systemAnnouncements': systemAnnouncements,
  };

  NotificationSettings copyWith({
    bool? pushEnabled,
    bool? emailEnabled,
    bool? smsEnabled,
    bool? spotCreated,
    bool? spotLiked,
    bool? spotCommented,
    bool? messageReceived,
    bool? sparkReceived,
    bool? systemAnnouncements,
  }) {
    return NotificationSettings(
      pushEnabled: pushEnabled ?? this.pushEnabled,
      emailEnabled: emailEnabled ?? this.emailEnabled,
      smsEnabled: smsEnabled ?? this.smsEnabled,
      spotCreated: spotCreated ?? this.spotCreated,
      spotLiked: spotLiked ?? this.spotLiked,
      spotCommented: spotCommented ?? this.spotCommented,
      messageReceived: messageReceived ?? this.messageReceived,
      sparkReceived: sparkReceived ?? this.sparkReceived,
      systemAnnouncements: systemAnnouncements ?? this.systemAnnouncements,
    );
  }
}

class PushNotificationService {
  static final PushNotificationService _instance = PushNotificationService._internal();
  factory PushNotificationService() => _instance;
  PushNotificationService._internal();

  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  
  String? _fcmToken;
  String? _apnsToken;
  NotificationSettings _settings = NotificationSettings();
  
  String? get fcmToken => _fcmToken;
  String? get apnsToken => _apnsToken;
  NotificationSettings get settings => _settings;

  // Initialize push notifications
  Future<void> initialize() async {
    try {
      // Initialize Firebase
      await Firebase.initializeApp();
      
      // Request permissions
      await _requestPermissions();
      
      // Initialize local notifications
      await _initializeLocalNotifications();
      
      // Get FCM token
      await _getToken();
      
      // Set up message handlers
      await _setupMessageHandlers();
      
      // Load saved settings
      await _loadSettings();
      
      print('Push notification service initialized successfully');
    } catch (e) {
      print('Error initializing push notifications: $e');
    }
  }

  // Request notification permissions
  Future<void> _requestPermissions() async {
    final settings = await _messaging.requestPermission(
      alert: true,
      announcement: false,
      badge: true,
      carPlay: false,
      criticalAlert: false,
      provisional: false,
      sound: true,
    );
    
    print('Notification permission status: ${settings.authorizationStatus}');
  }

  // Initialize local notifications
  Future<void> _initializeLocalNotifications() async {
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    
    const initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    
    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _handleNotificationTap,
    );
    
    // Android 채널 생성 (Android 8.0 이상)
    const androidChannel = AndroidNotificationChannel(
      'high_importance_channel',
      'SignalSpot Notifications',
      description: 'Notifications for SignalSpot app',
      importance: Importance.high,
    );
    
    await _localNotifications
        .resolvePlatformSpecificImplementation<AndroidFlutterLocalNotificationsPlugin>()
        ?.createNotificationChannel(androidChannel);
  }

  // Get FCM token
  Future<void> _getToken() async {
    try {
      // Get FCM token for Android/Web
      _fcmToken = await _messaging.getToken();
      print('FCM Token: $_fcmToken');
      
      // Get APNS token for iOS
      if (defaultTargetPlatform == TargetPlatform.iOS) {
        _apnsToken = await _messaging.getAPNSToken();
        print('APNS Token: $_apnsToken');
      }
      
      // Send token to backend
      if (_fcmToken != null) {
        await _sendTokenToBackend(_fcmToken!, 'fcm');
      }
      if (_apnsToken != null) {
        await _sendTokenToBackend(_apnsToken!, 'apns');
      }
    } catch (e) {
      print('Error getting token: $e');
    }
  }

  // Send token to backend
  Future<void> _sendTokenToBackend(String token, String platform) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final authToken = prefs.getString('auth_token');
      
      if (authToken == null) {
        print('No auth token available, skipping token registration');
        return;
      }
      
      final apiClient = ApiClient();
      final response = await apiClient.dio.post(
        '/notifications/token',
        data: {
          'token': token,
          'platform': platform,
        },
      );
      
      print('Token registered with backend: $platform');
    } catch (e) {
      print('Error sending token to backend: $e');
    }
  }

  // Set up message handlers
  Future<void> _setupMessageHandlers() async {
    // Background messages
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    
    // Foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    
    // Message opened app
    FirebaseMessaging.onMessageOpenedApp.listen(_handleMessageOpenedApp);
    
    // Check if app was opened from notification
    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      _handleMessageOpenedApp(initialMessage);
    }
  }

  // Handle foreground messages
  void _handleForegroundMessage(RemoteMessage message) {
    print('Received foreground message: ${message.messageId}');
    print('Message notification: ${message.notification?.title} - ${message.notification?.body}');
    print('Message data: ${message.data}');
    
    // Firebase Auth 내부 메시지 필터링
    // Firebase Phone Auth의 reCAPTCHA 검증 메시지는 무시
    if (message.data.containsKey('com.google.firebase.auth')) {
      print('Ignoring Firebase Auth internal message');
      return;
    }
    
    // notification이 없고 type도 없는 메시지는 무시 (시스템 메시지일 가능성)
    if (message.notification == null && !message.data.containsKey('type')) {
      print('Ignoring system message without notification or type');
      return;
    }
    
    // badge_reset 타입의 메시지는 알림을 표시하지 않음
    if (message.data['type'] == 'badge_reset') {
      print('Badge reset message received, not showing notification');
      return;
    }
    
    // Check if notification should be shown based on settings
    if (!_shouldShowNotification(message)) {
      print('Notification should not be shown based on settings');
      return;
    }
    
    print('Showing local notification...');
    // Show local notification
    _showLocalNotification(message);
  }

  // Handle message that opened the app
  void _handleMessageOpenedApp(RemoteMessage message) {
    print('Message opened app: ${message.messageId}');
    
    // Navigate based on notification type
    final data = message.data;
    final type = data['type'];
    
    switch (type) {
      case 'spot_liked':
      case 'spot_commented':
        final spotId = data['spotId'];
        if (spotId != null) {
          // Navigate to spot detail
          _navigateToSpotDetail(spotId);
        }
        break;
      case 'message_received':
        final roomId = data['roomId'];
        if (roomId != null) {
          // Navigate to chat room
          _navigateToChatRoom(roomId);
        }
        break;
      case 'spark_received':
        final sparkId = data['sparkId'];
        if (sparkId != null) {
          // Navigate to spark detail
          _navigateToSparkDetail(sparkId);
        }
        break;
      default:
        // Navigate to home
        _navigateToHome();
    }
  }

  // Handle notification tap
  void _handleNotificationTap(NotificationResponse response) {
    print('Notification tapped: ${response.payload}');
    // Parse payload and navigate accordingly
  }

  // Show local notification
  Future<void> _showLocalNotification(RemoteMessage message) async {
    try {
      print('_showLocalNotification called');
      print('Title: ${message.notification?.title ?? "SignalSpot"}');
      print('Body: ${message.notification?.body ?? "No body"}');
      
      const androidDetails = AndroidNotificationDetails(
        'high_importance_channel',
        'SignalSpot Notifications',
        channelDescription: 'Notifications for SignalSpot app',
        importance: Importance.high,
        priority: Priority.high,
        showWhen: true,
        icon: '@mipmap/ic_launcher',
        // color: Color(0xFF6750A4), // TODO: Add color if needed
      );
      
      const iosDetails = DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );
      
      const details = NotificationDetails(
        android: androidDetails,
        iOS: iosDetails,
      );
      
      await _localNotifications.show(
        message.hashCode,
        message.notification?.title ?? 'SignalSpot',
        message.notification?.body ?? '',
        details,
        payload: message.data.toString(),
      );
      
      print('Local notification shown successfully');
    } catch (e) {
      print('Error showing local notification: $e');
    }
  }

  // Check if notification should be shown
  bool _shouldShowNotification(RemoteMessage message) {
    if (!_settings.pushEnabled) return false;
    
    final type = message.data['type'];
    switch (type) {
      case 'spot_created':
        return _settings.spotCreated;
      case 'spot_liked':
        return _settings.spotLiked;
      case 'spot_commented':
        return _settings.spotCommented;
      case 'message_received':
        return _settings.messageReceived;
      case 'spark_received':
        return _settings.sparkReceived;
      case 'system_announcement':
        return _settings.systemAnnouncements;
      default:
        return true;
    }
  }

  // Update notification settings
  Future<void> updateSettings(NotificationSettings newSettings) async {
    _settings = newSettings;
    await _saveSettings();
    await _sendSettingsToBackend();
  }

  // Load settings from local storage
  Future<void> _loadSettings() async {
    final prefs = await SharedPreferences.getInstance();
    _settings = NotificationSettings(
      pushEnabled: prefs.getBool('push_enabled') ?? true,
      emailEnabled: prefs.getBool('email_enabled') ?? false,
      smsEnabled: prefs.getBool('sms_enabled') ?? false,
      spotCreated: prefs.getBool('spot_created') ?? true,
      spotLiked: prefs.getBool('spot_liked') ?? true,
      spotCommented: prefs.getBool('spot_commented') ?? true,
      messageReceived: prefs.getBool('message_received') ?? true,
      sparkReceived: prefs.getBool('spark_received') ?? true,
      systemAnnouncements: prefs.getBool('system_announcements') ?? true,
    );
  }

  // Save settings to local storage
  Future<void> _saveSettings() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setBool('push_enabled', _settings.pushEnabled);
    await prefs.setBool('email_enabled', _settings.emailEnabled);
    await prefs.setBool('sms_enabled', _settings.smsEnabled);
    await prefs.setBool('spot_created', _settings.spotCreated);
    await prefs.setBool('spot_liked', _settings.spotLiked);
    await prefs.setBool('spot_commented', _settings.spotCommented);
    await prefs.setBool('message_received', _settings.messageReceived);
    await prefs.setBool('spark_received', _settings.sparkReceived);
    await prefs.setBool('system_announcements', _settings.systemAnnouncements);
  }

  // Send settings to backend
  Future<void> _sendSettingsToBackend() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final authToken = prefs.getString('auth_token');
      
      if (authToken == null) return;
      
      final apiClient = ApiClient();
      await apiClient.dio.put(
        '/notifications/settings',
        data: _settings.toJson(),
      );
      
      print('Notification settings updated on backend');
    } catch (e) {
      print('Error updating settings on backend: $e');
    }
  }

  // Navigation methods (to be implemented with your navigation solution)
  void _navigateToSpotDetail(String spotId) {
    // TODO: Implement navigation to spot detail
    print('Navigate to spot: $spotId');
  }
  
  void _navigateToChatRoom(String roomId) {
    // TODO: Implement navigation to chat room
    print('Navigate to chat room: $roomId');
  }
  
  void _navigateToSparkDetail(String sparkId) {
    // TODO: Implement navigation to spark detail
    print('Navigate to spark: $sparkId');
  }
  
  void _navigateToHome() {
    // TODO: Implement navigation to home
    print('Navigate to home');
  }

  // Test notification
  Future<void> sendTestNotification() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final authToken = prefs.getString('auth_token');
      
      if (authToken == null) return;
      
      final apiClient = ApiClient();
      await apiClient.dio.post(
        '/notifications/test',
      );
      
      print('Test notification sent');
    } catch (e) {
      print('Error sending test notification: $e');
    }
  }
}

// Provider for push notification service
final pushNotificationServiceProvider = Provider<PushNotificationService>((ref) {
  return PushNotificationService();
});