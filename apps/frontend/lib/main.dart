import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import 'package:flutter_native_splash/flutter_native_splash.dart';
import 'firebase_options.dart';
// Google Maps 사용 (네이티브 플러그인)
import 'core/router/app_router.dart';
import 'core/theme/app_theme.dart';
import 'core/services/firebase_auth_service.dart';
import 'core/services/push_notification_service.dart';
import 'core/services/analytics_service.dart';

// Global Firebase Analytics instance
late final FirebaseAnalytics analytics;

void main() async {
  WidgetsBinding widgetsBinding = WidgetsFlutterBinding.ensureInitialized();
  
  // 스플래시 스크린 유지
  FlutterNativeSplash.preserve(widgetsBinding: widgetsBinding);
  
  // .env 파일 로드 (선택적)
  try {
    await dotenv.load(fileName: ".env");
  } catch (e) {
    print('Warning: .env file not found or could not be loaded: $e');
  }
  
  // Firebase 초기화
  try {
    if (Firebase.apps.isEmpty) {
      await Firebase.initializeApp(
        options: DefaultFirebaseOptions.currentPlatform,
      );
      print('✓ Firebase initialized successfully');
    } else {
      print('✓ Firebase already initialized');
    }
    
    // FirebaseAuthService 초기화 (Firebase 인스턴스 설정)
    await FirebaseAuthService.initialize();
    
    // Push Notification 서비스 초기화
    final pushService = PushNotificationService();
    await pushService.initialize();
    print('✓ Push Notification service initialized');
    
    // Firebase Analytics 초기화
    analytics = FirebaseAnalytics.instance;
    await analytics.setAnalyticsCollectionEnabled(true);
    
    // Analytics 서비스 초기화
    await AnalyticsService.initialize(analytics);
    print('✓ Firebase Analytics initialized');
  } catch (e, stackTrace) {
    print('❌ Firebase initialization failed: $e');
    print('Stack trace: $stackTrace');
    // Firebase 초기화 실패 시 앱 종료하지 않고 계속 진행
    // 일부 기능(전화번호 인증)은 작동하지 않을 수 있음
  }
  
  // Firebase Auth 상태 확인 및 처리
  try {
    // Firebase Auth가 이미 인증된 상태인지 확인
    final currentUser = FirebaseAuth.instance.currentUser;
    if (currentUser != null) {
      print('✓ Firebase Auth: User already authenticated - ${currentUser.phoneNumber}');
      // AuthProvider의 리스너가 자동으로 처리할 것임
    } else {
      print('✓ Firebase Auth: No authenticated user');
    }
    
    // Firebase Auth 상태 변경 리스너 (디버깅용)
    FirebaseAuth.instance.authStateChanges().listen((User? user) {
      if (user != null) {
        print('✓ Firebase Auth state changed: User signed in - ${user.phoneNumber}');
      } else {
        print('✓ Firebase Auth state changed: User signed out');
      }
    });
  } catch (e) {
    print('Warning: Firebase Auth check failed: $e');
  }
  
  // Google Maps 초기화 완료
  print('✓ Google Maps ready');
  
  // 모든 초기화 완료 후 스플래시 스크린 제거
  FlutterNativeSplash.remove();
  
  runApp(
    const ProviderScope(
      child: SignalSpotApp(),
    ),
  );
}

class SignalSpotApp extends ConsumerWidget {
  const SignalSpotApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    print('🚀 SignalSpotApp: build() started');
    try {
      final GoRouter router = ref.watch(routerProvider);
      print('🚀 SignalSpotApp: GoRouter obtained');
      
      print('🚀 SignalSpotApp: Creating MaterialApp.router');
      return MaterialApp.router(
        title: 'SignalSpot',
        theme: AppTheme.lightTheme,
        darkTheme: AppTheme.lightTheme,  // 다크모드에서도 라이트 테마 사용
        themeMode: ThemeMode.light,  // 항상 라이트 모드 사용
        routerConfig: router,
        debugShowCheckedModeBanner: false,
        builder: (context, child) {
          return GestureDetector(
            onTap: () {
              // 바깥 클릭 시 키보드 닫기
              FocusManager.instance.primaryFocus?.unfocus();
            },
            child: child,
          );
        },
      );
    } catch (e, stackTrace) {
      print('❌ SignalSpotApp: ERROR in build()');
      print('❌ Error: $e');
      print('❌ StackTrace: $stackTrace');
      rethrow;
    }
  }
}