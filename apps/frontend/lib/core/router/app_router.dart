import 'dart:async';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_analytics/firebase_analytics.dart';
import '../../features/auth/presentation/pages/login_page.dart';
import '../../features/auth/presentation/pages/register_page.dart';
import '../../features/auth/presentation/pages/auth_choice_page.dart';

import '../../features/auth/presentation/pages/phone_auth_page.dart';
import '../../features/auth/presentation/pages/sms_verification_page.dart';
import '../../features/onboarding/presentation/pages/splash_page.dart' as onboarding;
import '../../features/onboarding/presentation/pages/welcome_page.dart';
import '../../features/onboarding/presentation/pages/permissions_page.dart';
import '../../features/onboarding/presentation/pages/profile_setup_page.dart';
import '../../features/onboarding/presentation/pages/signature_connection_page.dart';
import '../../features/onboarding/presentation/pages/tutorial_page.dart';
import '../../features/onboarding/presentation/pages/interests_page.dart';
import '../../features/onboarding/presentation/pages/nickname_page.dart';
import '../../features/onboarding/presentation/pages/complete_page.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';
import '../../features/auth/presentation/models/auth_state.dart';
import '../../features/main/presentation/pages/main_navigation.dart';
import '../../features/spark/presentation/pages/spark_detail_page.dart';
import '../../features/spark/presentation/pages/spark_message_detail_page.dart';
import '../../features/profile/presentation/pages/profile_edit_page.dart';
import '../../features/profile/presentation/pages/signature_connection_edit_page.dart';
import '../../features/map/presentation/pages/note_create_page.dart';
import '../../features/map/presentation/pages/note_detail_page.dart';
import '../../features/notifications/presentation/pages/notification_settings_page.dart';
import '../../features/notifications/presentation/pages/notifications_page.dart';
import '../../features/help/presentation/pages/help_insights_page.dart';
import '../services/firebase_auth_service.dart';
import '../services/analytics_service.dart';

// Create a custom ChangeNotifier that listens to auth state changes
class AuthNotifier extends ChangeNotifier {
  AuthNotifier(this.ref) {
    // Listen to auth state changes
    ref.listen(authProvider, (previous, next) {
      print('AuthNotifier: Auth state changed from $previous to $next');
      notifyListeners();
    });
  }
  
  final Ref ref;
  
  @override
  void dispose() {
    print('AuthNotifier: Disposing');
    super.dispose();
  }
}

// Separate provider for AuthNotifier to maintain single instance
final authNotifierProvider = Provider<AuthNotifier>((ref) {
  return AuthNotifier(ref);
});

// Provider for GoRouter with auth listening
final routerProvider = Provider<GoRouter>((ref) {
  final authNotifier = ref.watch(authNotifierProvider);
  
  return GoRouter(
    initialLocation: '/splash',
    refreshListenable: authNotifier,
    observers: AnalyticsService.observer != null ? [AnalyticsService.observer!] : [],
    redirect: (context, state) {
      // 매번 최신 authState를 읽음
      final currentAuthState = ref.read(authProvider);
      final isAuthenticated = currentAuthState is AuthenticatedState;
      final isLoading = currentAuthState is LoadingState || currentAuthState is InitialState;
      final location = state.matchedLocation;
      
      // 로딩 중일 때는 profileCompleted 체크를 하지 않음
      bool profileCompleted = false; // 기본값을 false로 변경 (안전한 기본값)
      if (currentAuthState is AuthenticatedState) {
        // 인증된 상태일 때만 profileCompleted 체크
        final user = currentAuthState.user;
        print('Router: User data - id=${user.id}, email=${user.email}, profileCompleted=${user.profileCompleted}');
        print('Router: User JSON - ${user.toJson()}');
        // profileCompleted가 명시적으로 true인 경우만 true로 설정
        profileCompleted = user.profileCompleted == true;  // null이거나 false면 false
        print('Router: Final profileCompleted value = $profileCompleted (from ${user.profileCompleted})');
      }
      
      print('Router redirect: location=$location, isAuthenticated=$isAuthenticated, profileCompleted=$profileCompleted, isLoading=$isLoading, authState=$currentAuthState');
      
      // 허용된 경로 목록
      final authRoutes = ['/auth/phone', '/auth/sms-verification', '/link'];
      final onboardingRoutes = [
        '/onboarding/welcome', 
        '/onboarding/interests', 
        '/onboarding/nickname', 
        '/onboarding/permissions',
        '/onboarding/profile',
        '/onboarding/signature-connection',
        '/onboarding/complete'
      ];
      
      // 인증 프로세스 중이거나 온보딩 중에는 리다이렉트 하지 않음
      if (authRoutes.contains(location) || onboardingRoutes.contains(location)) {
        print('Router: Skipping redirect for auth/onboarding route: $location');
        return null;
      }
      
      // If still loading, stay where we are
      if (isLoading) {
        return null;
      }
      
      // If authenticated
      if (isAuthenticated) {
        // 프로필이 완성되지 않은 경우 온보딩 1단계부터 시작
        // 홈이나 다른 메인 화면으로 가려고 할 때도 체크
        final mainRoutes = ['/home', '/map', '/signals', '/sparks', '/profile'];
        if (!profileCompleted && 
            (!onboardingRoutes.contains(location) || mainRoutes.contains(location))) {
          print('Router redirect: profile not completed (profileCompleted=$profileCompleted), redirecting to /onboarding/welcome from $location');
          return '/onboarding/welcome';
        }
        
        // 프로필이 완성된 사용자가 splash에 있으면 홈으로
        if (profileCompleted && location == '/splash') {
          print('Router redirect: authenticated user at splash, redirecting to /home');
          return '/home';
        }
        
        // 프로필이 완성된 사용자가 온보딩 페이지에 있으면 홈으로
        if (profileCompleted && onboardingRoutes.contains(location)) {
          print('Router redirect: profile already completed, redirecting to /home from onboarding');
          return '/home';
        }
        
        return null;
      }
      
      // If not authenticated and trying to access protected routes, go to splash
      if (!isAuthenticated) {
        // Firebase auth links should not cause redirects
        if (location == '/link' || 
            location.startsWith('/link?') || 
            location.startsWith('/__/auth') ||
            location.contains('firebaseapp.com')) {
          print('Router: Firebase auth link detected ($location), no redirect');
          return null;
        }
        
        if (location != '/splash' && 
            !authRoutes.contains(location) && 
            !onboardingRoutes.contains(location)) {
          print('Router redirect: unauthenticated user accessing protected route, redirecting to /splash');
          return '/splash';
        }
      }
      
      return null;
    },
    routes: [
      // Splash Screen
      GoRoute(
        path: '/splash',
        name: 'splash',
        builder: (context, state) => const onboarding.SplashPage(),
      ),
      
      // Onboarding Routes
      GoRoute(
        path: '/onboarding/welcome',
        name: 'onboarding-welcome',
        builder: (context, state) => const WelcomePage(),
      ),
      GoRoute(
        path: '/onboarding/interests',
        name: 'onboarding-interests',
        builder: (context, state) => const InterestsPage(),
      ),
      GoRoute(
        path: '/onboarding/nickname',
        name: 'onboarding-nickname',
        builder: (context, state) => const NicknamePage(),
      ),
      GoRoute(
        path: '/onboarding/permissions',
        name: 'onboarding-permissions',
        builder: (context, state) => const PermissionsPage(),
      ),
      GoRoute(
        path: '/onboarding/complete',
        name: 'onboarding-complete',
        builder: (context, state) => const CompletePage(),
      ),
      GoRoute(
        path: '/onboarding/profile',
        name: 'onboarding-profile',
        builder: (context, state) => const ProfileSetupPage(),
      ),
      GoRoute(
        path: '/onboarding/signature-connection',
        name: 'onboarding-signature-connection',
        builder: (context, state) => const SignatureConnectionPage(),
      ),
      GoRoute(
        path: '/onboarding/tutorial',
        name: 'onboarding-tutorial',
        builder: (context, state) => const TutorialPage(),
      ),
      
      // Auth Choice Route
      GoRoute(
        path: '/auth-choice',
        name: 'auth-choice',
        builder: (context, state) => const AuthChoicePage(),
      ),
      
      // Auth Routes
      GoRoute(
        path: '/login',
        name: 'login',
        builder: (context, state) => const LoginPage(),
      ),
      GoRoute(
        path: '/register',
        name: 'register',
        builder: (context, state) => const RegisterPage(),
      ),
      GoRoute(
        path: '/auth/phone',
        name: 'phone-auth',
        builder: (context, state) => const PhoneAuthPage(),
      ),
      GoRoute(
        path: '/auth/sms-verification',
        name: 'sms-verification',
        builder: (context, state) {
          final extra = state.extra as Map<String, dynamic>?;
          final phoneNumber = extra?['phoneNumber'] ?? '';
          final verificationId = extra?['verificationId'];
          final autoVerified = extra?['autoVerified'] ?? false;
          return SmsVerificationPage(
            phoneNumber: phoneNumber,
            verificationId: verificationId,
            autoVerified: autoVerified,
          );
        },
      ),
      
      // Main App Routes
      GoRoute(
        path: '/home',
        name: 'home',
        builder: (context, state) => const MainNavigation(),
      ),
      
      // Signal Routes
      GoRoute(
        path: '/signal/create',
        name: 'signal-create',
        builder: (context, state) => const Scaffold(
          body: Center(
            child: Text('Create Signal Page'),
          ),
        ),
      ),
      
      // Profile Routes
      GoRoute(
        path: '/profile/:userId',
        name: 'profile',
        builder: (context, state) {
          final userId = state.pathParameters['userId']!;
          return Scaffold(
            appBar: AppBar(title: const Text('Profile')),
            body: Center(
              child: Text('Profile Page for User: $userId'),
            ),
          );
        },
      ),
      GoRoute(
        path: '/profile/edit',
        name: 'profile-edit',
        builder: (context, state) => const ProfileEditPage(),
      ),
      GoRoute(
        path: '/profile/signature-connection',
        name: 'signature-connection-edit',
        builder: (context, state) => const SignatureConnectionEditPage(),
      ),
      
      // Chat Routes
      GoRoute(
        path: '/chat/:chatId',
        name: 'chat',
        builder: (context, state) {
          final chatId = state.pathParameters['chatId']!;
          return Scaffold(
            appBar: AppBar(title: const Text('Chat')),
            body: Center(
              child: Text('Chat Page for Chat: $chatId'),
            ),
          );
        },
      ),
      
      // Spark Routes
      GoRoute(
        path: '/spark/:sparkId',
        name: 'spark-detail',
        builder: (context, state) {
          final sparkId = state.pathParameters['sparkId']!;
          return SparkDetailPage(sparkId: sparkId);
        },
      ),
      
      // Spark Message Detail Route
      GoRoute(
        path: '/spark-message/:sparkId',
        name: 'spark-message-detail',
        builder: (context, state) {
          final sparkId = state.pathParameters['sparkId']!;
          return SparkMessageDetailPage(sparkId: sparkId);
        },
      ),
      
      // Map Routes
      GoRoute(
        path: '/map/note/create',
        name: 'note-create',
        builder: (context, state) {
          final latitude = double.parse(state.uri.queryParameters['lat'] ?? '0.0');
          final longitude = double.parse(state.uri.queryParameters['lng'] ?? '0.0');
          final locationName = state.uri.queryParameters['location'];
          return NoteCreatePage(
            latitude: latitude,
            longitude: longitude,
            locationName: locationName,
          );
        },
      ),
      GoRoute(
        path: '/map/note/:noteId',
        name: 'note-detail',
        builder: (context, state) {
          final noteId = state.pathParameters['noteId']!;
          return NoteDetailPage(noteId: noteId);
        },
      ),
      
      // Notifications Routes
      GoRoute(
        path: '/notifications',
        name: 'notifications',
        builder: (context, state) => const NotificationsPage(),
      ),
      
      // Settings Routes
      GoRoute(
        path: '/settings/notifications',
        name: 'notification-settings',
        builder: (context, state) => const NotificationSettingsPage(),
      ),
      GoRoute(
        path: '/help',
        name: 'help-insights',
        builder: (context, state) => const HelpInsightsPage(),
      ),
      
      // Firebase Auth Link Handler (이 경로는 Firebase가 내부적으로 사용)
      GoRoute(
        path: '/link',
        name: 'firebase-link',
        builder: (context, state) {
          print('Firebase link route accessed - handling internally');
          print('Query params: ${state.uri.queryParameters}');
          
          // Phone Auth reCAPTCHA 콜백 처리
          if (state.uri.queryParameters.containsKey('deep_link_id')) {
            final deepLink = state.uri.queryParameters['deep_link_id'] ?? '';
            if (deepLink.contains('authType=verifyApp') && deepLink.contains('recaptchaToken')) {
              print('Phone Auth reCAPTCHA callback detected');
              return const _ReCaptchaCallbackPage();
            }
          }
          
          return Scaffold(
            backgroundColor: Colors.white,
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const CircularProgressIndicator(),
                  const SizedBox(height: 24),
                  const Text(
                    '인증 처리 중...',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    '잠시만 기다려주세요',
                    style: TextStyle(
                      fontSize: 14,
                      color: Colors.grey,
                    ),
                  ),
                  const SizedBox(height: 32),
                  TextButton(
                    onPressed: () {
                      // 수동으로 스플래시로 이동
                      context.go('/splash');
                    },
                    child: const Text('취소'),
                  ),
                ],
              ),
            ),
          );
        },
      ),
      
      // Firebase Auth Handler Path
      GoRoute(
        path: '/__/auth/handler',
        name: 'firebase-auth-handler',
        builder: (context, state) {
          print('Firebase auth handler route accessed');
          // Navigate to home after brief delay to allow Firebase to process
          WidgetsBinding.instance.addPostFrameCallback((_) {
            Future.delayed(const Duration(milliseconds: 500), () {
              if (context.mounted) {
                context.go('/home');
              }
            });
          });
          return const Scaffold(
            backgroundColor: Colors.white,
            body: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircularProgressIndicator(),
                  SizedBox(height: 16),
                  Text(
                    '인증 처리 중...',
                    style: TextStyle(fontSize: 16),
                  ),
                ],
              ),
            ),
          );
        },
      ),
    ],
    
    // Error page
    errorBuilder: (context, state) => Scaffold(
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(
              Icons.error_outline,
              size: 48,
              color: Colors.red,
            ),
            const SizedBox(height: 16),
            Text(
              'Page not found',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            const SizedBox(height: 8),
            Text(
              state.error.toString(),
              style: Theme.of(context).textTheme.bodyMedium,
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () => context.go('/home'),
              child: const Text('Go Home'),
            ),
          ],
        ),
      ),
    ),
  );
});

// reCAPTCHA 콜백 처리 페이지
class _ReCaptchaCallbackPage extends StatefulWidget {
  const _ReCaptchaCallbackPage({Key? key}) : super(key: key);

  @override
  State<_ReCaptchaCallbackPage> createState() => _ReCaptchaCallbackPageState();
}

class _ReCaptchaCallbackPageState extends State<_ReCaptchaCallbackPage> {
  Timer? _timer;
  int _attemptCount = 0;
  static const int _maxAttempts = 100; // 10초 (100ms * 100)
  
  @override
  void initState() {
    super.initState();
    print('ReCaptchaCallbackPage: Starting verification monitoring');
    _startMonitoring();
  }
  
  void _startMonitoring() {
    _timer = Timer.periodic(const Duration(milliseconds: 100), (timer) {
      _attemptCount++;
      
      final verificationId = FirebaseAuthService.pendingVerificationId;
      final phoneNumber = FirebaseAuthService.pendingPhoneNumber;
      
      print('ReCaptchaCallbackPage: Checking (attempt $_attemptCount): verificationId=$verificationId, phoneNumber=$phoneNumber');
      
      if (verificationId != null && phoneNumber != null) {
        // verificationId가 설정되면 SMS 페이지로 이동
        print('ReCaptchaCallbackPage: Navigating to SMS verification');
        timer.cancel();
        
        if (mounted) {
          context.go('/auth/sms-verification', extra: {
            'phoneNumber': phoneNumber,
            'verificationId': verificationId,
            'isTestNumber': false,
          });
        }
      } else if (_attemptCount >= _maxAttempts) {
        // 타임아웃 - 전화번호 입력 페이지로 돌아가기
        print('ReCaptchaCallbackPage: Timeout, returning to phone auth');
        timer.cancel();
        
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('인증 시간이 초과되었습니다. 다시 시도해주세요.'),
              backgroundColor: Colors.red,
            ),
          );
          context.go('/auth/phone');
        }
      }
    });
  }
  
  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircularProgressIndicator(),
            const SizedBox(height: 24),
            Text(
              '인증 처리 중...',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 8),
            Text(
              '잠시만 기다려주세요',
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                color: Colors.grey[600],
              ),
            ),
            const SizedBox(height: 32),
            TextButton(
              onPressed: () {
                _timer?.cancel();
                context.go('/auth/phone');
              },
              child: const Text('취소'),
            ),
          ],
        ),
      ),
    );
  }
}

// Router helper class
class AppRouter {
  static const String splash = '/splash';
  static const String login = '/login';
  static const String register = '/register';
  static const String home = '/home';
  static const String signalCreate = '/signal/create';
  
  static String profile(String userId) => '/profile/$userId';
  static String chat(String chatId) => '/chat/$chatId';
  static String sparkDetail(String sparkId) => '/spark/$sparkId';
  static String sparkMessageDetail(String sparkId) => '/spark-message/$sparkId';
  static const String profileEdit = '/profile/edit';
  static const String signatureConnectionEdit = '/profile/signature-connection';
  static String noteCreate({required double lat, required double lng, String? location}) => 
      '/map/note/create?lat=$lat&lng=$lng${location != null ? '&location=$location' : ''}';
  static String noteDetail(String noteId) => '/map/note/$noteId';
  static const String notifications = '/notifications';
  static const String notificationSettings = '/settings/notifications';
  static const String helpInsights = '/help';
}