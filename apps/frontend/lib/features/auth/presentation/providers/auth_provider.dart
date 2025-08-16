import 'dart:async';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase;
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/auth_state.dart';
import '../../data/services/auth_service.dart';
import '../../data/models/auth_models.dart';
import '../../../../core/api/api_client.dart';
import '../../../../shared/services/notification_service.dart';

// Auth service provider
final authServiceProvider = Provider<AuthService>((ref) => AuthService());

// Auth notifier
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthService _authService;
  
  AuthNotifier(this._authService) : super(const AuthState.initial()) {
    _checkAuthStatus();
    _listenToFirebaseAuth();
    // 토큰 갱신 타이머 시작
    _startTokenRefreshTimer();
  }
  
  Future<void> _checkAuthStatus() async {
    state = const AuthState.loading();
    
    try {
      // 저장된 토큰 확인
      final apiClient = ApiClient();
      final accessToken = await apiClient.getAccessToken();
      final refreshToken = await apiClient.getRefreshToken();
      
      print('Checking auth status: hasAccessToken=${accessToken != null}, hasRefreshToken=${refreshToken != null}');
      
      if (refreshToken != null) {
        // 리프레시 토큰이 있으면 일단 토큰 갱신 시도
        try {
          print('Attempting to refresh token on startup...');
          final refreshResponse = await apiClient.post('/auth/refresh', data: {
            'refreshToken': refreshToken,
          });
          
          if (refreshResponse.data['success'] == true) {
            final data = refreshResponse.data['data'];
            if (data['accessToken'] != null) {
              await apiClient.saveTokens(
                data['accessToken'],
                data['refreshToken'] ?? refreshToken,
              );
              print('Token refreshed successfully on startup');
            }
          }
        } catch (refreshError) {
          print('Token refresh failed on startup: $refreshError');
          // 리프레시 토큰이 만료된 경우
          if (refreshError.toString().contains('401')) {
            print('Refresh token expired, need to re-authenticate');
            await apiClient.clearTokens();
            
            // Firebase Auth 확인
            final firebaseUser = firebase.FirebaseAuth.instance.currentUser;
            if (firebaseUser != null && firebaseUser.phoneNumber != null) {
              print('Firebase user exists, trying to re-authenticate');
              await _syncWithBackend(firebaseUser);
              return;
            } else {
              state = const AuthState.unauthenticated();
              return;
            }
          }
        }
        
        // 프로필 정보 가져오기
        try {
          final user = await _authService.getProfile();
          print('Auth check successful: ${user.email}');
          print('Profile completed: ${user.profileCompleted}');
          
          // profileCompleted가 null이면 캐시에서 확인
          User finalUser = user;
          if (user.profileCompleted == null) {
            final prefs = await SharedPreferences.getInstance();
            final cachedProfileCompleted = prefs.getBool('profileCompleted_${user.id}');
            if (cachedProfileCompleted != null) {
              print('Using cached profileCompleted: $cachedProfileCompleted');
              final userJson = user.toJson();
              userJson['profileCompleted'] = cachedProfileCompleted;
              finalUser = User.fromJson(userJson);
            }
          } else {
            // profileCompleted가 null이 아니면 캐시에 저장
            final prefs = await SharedPreferences.getInstance();
            await prefs.setBool('profileCompleted_${user.id}', user.profileCompleted!);
            print('Cached profileCompleted: ${user.profileCompleted}');
          }
          
          state = AuthState.authenticated(finalUser);
          
          // FCM 토큰 저장 (백그라운드에서 실행)
          _saveFCMToken();
        } catch (profileError) {
          print('Failed to get profile after token refresh: $profileError');
          
          // 네트워크 에러인지 인증 에러인지 구분
          bool isNetworkError = false;
          if (profileError is DioException) {
            isNetworkError = profileError.type == DioExceptionType.connectionTimeout ||
                            profileError.type == DioExceptionType.receiveTimeout ||
                            profileError.type == DioExceptionType.connectionError ||
                            (profileError.type == DioExceptionType.unknown && 
                             profileError.error.toString().contains('SocketException'));
          }
          
          if (isNetworkError) {
            print('Network error detected, keeping current auth state if available');
            // 네트워크 에러인 경우 현재 상태가 있으면 유지
            if (state is AuthenticatedState) {
              print('Keeping existing authenticated state due to network error');
              return; // 현재 상태 유지
            }
          }
          
          // 인증 에러이거나 현재 상태가 없는 경우 Firebase로 재인증 시도
          final firebaseUser = firebase.FirebaseAuth.instance.currentUser;
          if (firebaseUser != null && firebaseUser.phoneNumber != null) {
            print('Firebase user exists, trying to re-authenticate');
            await _syncWithBackend(firebaseUser);
          } else {
            await apiClient.clearTokens();
            state = const AuthState.unauthenticated();
          }
        }
      } else {
        // 토큰이 없으면 Firebase Auth 상태 확인
        final firebaseUser = firebase.FirebaseAuth.instance.currentUser;
        if (firebaseUser != null && firebaseUser.phoneNumber != null) {
          print('No token but Firebase user exists, syncing with backend');
          await _syncWithBackend(firebaseUser);
        } else {
          state = const AuthState.unauthenticated();
        }
      }
    } catch (e) {
      print('Auth check failed: $e');
      state = const AuthState.unauthenticated();
    }
  }
  
  Future<bool> login(String email, String password) async {
    state = const AuthState.loading();
    
    try {
      print('AuthProvider: Starting login...');
      final authResponse = await _authService.login(email, password);
      print('AuthProvider: Login successful, user: ${authResponse.user.email}');
      state = AuthState.authenticated(authResponse.user);
      
      // FCM 토큰 저장 (백그라운드에서 실행)
      _saveFCMToken();
      
      return true;
    } catch (e) {
      print('AuthProvider: Login failed with error: $e');
      state = AuthState.error(e.toString());
      return false;
    }
  }
  
  Future<void> _saveFCMToken() async {
    try {
      // FCM 권한 요청
      final messaging = FirebaseMessaging.instance;
      final settings = await messaging.requestPermission(
        alert: true,
        badge: true,
        sound: true,
      );
      
      if (settings.authorizationStatus == AuthorizationStatus.authorized) {
        // FCM 토큰 가져오기
        final token = await messaging.getToken();
        if (token != null) {
          print('📱 FCM 토큰 획득: ${token.substring(0, 20)}...');
          
          // 서버에 FCM 토큰 저장
          final notificationService = NotificationService();
          await notificationService.updateFcmToken(token);
          print('✅ FCM 토큰 서버 저장 완료');
          
          // 토큰 갱신 리스너 설정
          messaging.onTokenRefresh.listen((newToken) async {
            print('🔄 FCM 토큰 갱신됨');
            await notificationService.updateFcmToken(newToken);
          });
        }
      } else {
        print('❌ FCM 권한 거부됨');
      }
    } catch (e) {
      print('❌ FCM 토큰 저장 실패: $e');
      // FCM 실패해도 로그인은 계속 진행
    }
  }
  
  Future<bool> register({
    required String email,
    required String password,
    required String username,
  }) async {
    state = const AuthState.loading();
    
    try {
      final authResponse = await _authService.register(
        email: email,
        password: password,
        username: username,
      );
      state = AuthState.authenticated(authResponse.user);
      return true;
    } catch (e) {
      state = AuthState.error(e.toString());
      return false;
    }
  }
  
  Future<void> logout() async {
    state = const AuthState.loading();
    
    try {
      // Firebase 로그아웃을 먼저 수행 (리스너가 토큰을 다시 생성하지 않도록)
      await firebase.FirebaseAuth.instance.signOut();
      print('Firebase logout successful');
    } catch (e) {
      print('Firebase logout failed: $e');
    }
    
    try {
      // 백엔드 로그아웃 및 토큰 삭제
      await _authService.logout();
      print('Backend logout and token clear successful');
    } catch (e) {
      print('Backend logout failed: $e');
      // Continue with logout even if server call fails
    }
    
    // ApiClient의 토큰도 명시적으로 삭제 (이중 확인)
    final apiClient = ApiClient();
    await apiClient.clearTokens();
    print('All tokens cleared successfully');
    
    state = const AuthState.unauthenticated();
  }
  
  Future<void> refreshUserProfile() async {
    if (state is AuthenticatedState) {
      final currentUser = (state as AuthenticatedState).user;
      try {
        final user = await _authService.getProfile();
        
        // profileCompleted가 null이면 기존 값 유지
        User finalUser = user;
        if (user.profileCompleted == null && currentUser.profileCompleted != null) {
          print('Profile refresh: profileCompleted is null, keeping existing value: ${currentUser.profileCompleted}');
          final userJson = user.toJson();
          userJson['profileCompleted'] = currentUser.profileCompleted;
          finalUser = User.fromJson(userJson);
        }
        
        state = AuthState.authenticated(finalUser);
      } catch (e) {
        print('Profile refresh failed: $e');
        
        // 네트워크 에러인지 확인
        bool isNetworkError = false;
        if (e is DioException) {
          isNetworkError = e.type == DioExceptionType.connectionTimeout ||
                          e.type == DioExceptionType.receiveTimeout ||
                          e.type == DioExceptionType.connectionError ||
                          (e.type == DioExceptionType.unknown && 
                           e.error.toString().contains('SocketException'));
        }
        
        if (isNetworkError) {
          print('Network error during profile refresh, keeping current state');
          // 네트워크 에러면 현재 상태 유지
        } else if (e is DioException && e.response?.statusCode == 401) {
          print('Authentication error during profile refresh, logging out');
          // 인증 에러면 로그아웃
          await logout();
        } else {
          print('Unknown error during profile refresh, keeping current state');
          // 기타 에러는 현재 상태 유지
        }
      }
    }
  }
  
  // 사용자 정보 업데이트 (프로필 설정 완료 후 등)
  void updateUserInfo(Map<String, dynamic> updatedData) {
    if (state is AuthenticatedState) {
      final currentUser = (state as AuthenticatedState).user;
      
      // 먼저 현재 사용자를 JSON으로 변환
      final currentUserJson = currentUser.toJson();
      
      // 업데이트된 데이터로 덮어쓰기 (null이 아닌 값만)
      updatedData.forEach((key, value) {
        if (value != null) {
          currentUserJson[key] = value;
        }
      });
      
      print('Updating user with data: $currentUserJson');
      print('Specifically profileCompleted: ${currentUserJson['profileCompleted']}');
      
      final updatedUser = User.fromJson(currentUserJson);
      print('Updated user profileCompleted: ${updatedUser.profileCompleted}');
      state = AuthState.authenticated(updatedUser);
    }
  }
  
  void clearError() {
    if (state is ErrorState) {
      state = const AuthState.unauthenticated();
    }
  }
  
  Future<void> setAuthenticatedUser(User user) async {
    print('AuthProvider: Setting authenticated user: ${user.email}');
    state = AuthState.authenticated(user);
  }
  
  // Firebase 사용자와 백엔드 동기화
  Future<void> _syncWithBackend(firebase.User firebaseUser) async {
    try {
      // Firebase ID 토큰 가져오기
      final idToken = await firebaseUser.getIdToken();
      if (idToken == null) {
        print('Failed to get Firebase ID token');
        state = const AuthState.unauthenticated();
        return;
      }
      
      print('Got Firebase ID token: ${idToken.substring(0, 20)}...');
      
      final apiClient = ApiClient();
      final response = await apiClient.post(
        '/auth/phone/authenticate',
        data: {
          'phoneNumber': firebaseUser.phoneNumber,
          'firebaseToken': idToken, // 실제 Firebase ID 토큰 사용
        },
      );
      
      final responseData = response.data['data'];
      final userData = responseData?['user'];
      
      if (userData != null) {
        // profileCompleted 처리 - responseData에 있으면 userData에 추가
        if (responseData?['profileCompleted'] != null) {
          userData['profileCompleted'] = responseData['profileCompleted'];
          print('Sync: profileCompleted from response: ${responseData['profileCompleted']}');
        } else {
          // profileCompleted가 없으면 SharedPreferences에서 가져오거나 기본값 사용
          final prefs = await SharedPreferences.getInstance();
          final cachedProfileCompleted = prefs.getBool('profileCompleted_${userData['id']}');
          userData['profileCompleted'] = cachedProfileCompleted ?? false;
          print('Sync: profileCompleted from cache/default: ${userData['profileCompleted']}');
        }
        
        // 토큰 저장
        if (responseData?['accessToken'] != null) {
          await apiClient.saveTokens(
            responseData['accessToken'],
            responseData['refreshToken'] ?? '',
          );
          print('Tokens saved during sync');
        }
        
        final user = User.fromJson(userData);
        
        // profileCompleted 값을 SharedPreferences에 캐시
        if (user.profileCompleted != null) {
          final prefs = await SharedPreferences.getInstance();
          await prefs.setBool('profileCompleted_${user.id}', user.profileCompleted!);
          print('Cached profileCompleted: ${user.profileCompleted}');
        }
        
        state = AuthState.authenticated(user);
        print('Successfully synced with backend');
        
        // FCM 토큰 저장 (백그라운드에서 실행)
        _saveFCMToken();
      } else {
        state = const AuthState.unauthenticated();
      }
    } catch (e) {
      print('Failed to sync with backend: $e');
      state = const AuthState.unauthenticated();
    }
  }
  
  // 토큰 갱신 타이머
  Timer? _tokenRefreshTimer;
  
  void _startTokenRefreshTimer() {
    _tokenRefreshTimer?.cancel();
    // 25분마다 토큰 갱신 (30분 만료 전에 미리 갱신)
    _tokenRefreshTimer = Timer.periodic(const Duration(minutes: 25), (_) async {
      if (state is AuthenticatedState) {
        try {
          print('Auto-refreshing token (25 min timer)...');
          final apiClient = ApiClient();
          final refreshToken = await apiClient.getRefreshToken();
          
          if (refreshToken != null) {
            final response = await apiClient.post('/auth/refresh', data: {
              'refreshToken': refreshToken,
            });
            
            if (response.data['success'] == true) {
              final data = response.data['data'];
              if (data['accessToken'] != null) {
                await apiClient.saveTokens(
                  data['accessToken'],
                  data['refreshToken'] ?? refreshToken,
                );
                print('Token auto-refreshed successfully (25 min timer)');
              }
            }
          }
        } catch (e) {
          print('Token auto-refresh failed (25 min timer): $e');
          // 타이머 갱신 실패는 무시 (401 에러 시 자동 갱신됨)
          // 사용자가 실제로 API 호출할 때 401 처리로 갱신
        }
      }
    });
  }
  
  @override
  void dispose() {
    _tokenRefreshTimer?.cancel();
    super.dispose();
  }
  
  // Firebase Auth 상태 리스너
  void _listenToFirebaseAuth() {
    firebase.FirebaseAuth.instance.authStateChanges().listen((firebaseUser) async {
      print('Firebase auth state changed: ${firebaseUser?.phoneNumber}');
      
      if (firebaseUser != null && firebaseUser.phoneNumber != null) {
        // Firebase로 인증된 사용자가 있으면 백엔드와 동기화
        try {
          // Firebase ID 토큰 가져오기
          final idToken = await firebaseUser.getIdToken();
          if (idToken == null) {
            print('Failed to get Firebase ID token in auth listener');
            state = const AuthState.unauthenticated();
            return;
          }
          
          print('Got Firebase ID token in auth listener: ${idToken.substring(0, 20)}...');
          
          final apiClient = ApiClient();
          final response = await apiClient.post(
            '/auth/phone/authenticate',
            data: {
              'phoneNumber': firebaseUser.phoneNumber,
              'firebaseToken': idToken, // 실제 Firebase ID 토큰 사용
            },
          );
          
          // 백엔드 응답 구조: { success: true, data: { user: {...}, profileCompleted: true, accessToken: ... } }
          final responseData = response.data['data'];
          final userData = responseData?['user'];
          
          if (userData != null) {
            // profileCompleted 처리 - responseData 레벨에 있는 값을 userData에 추가
            if (responseData?['profileCompleted'] != null) {
              userData['profileCompleted'] = responseData['profileCompleted'];
              print('Auth listener: profileCompleted from response: ${responseData['profileCompleted']}');
            } else {
              // profileCompleted가 없으면 SharedPreferences에서 가져오거나 기본값 사용
              final prefs = await SharedPreferences.getInstance();
              final cachedProfileCompleted = prefs.getBool('profileCompleted_${userData['id']}');
              userData['profileCompleted'] = cachedProfileCompleted ?? false;
              print('Auth listener: profileCompleted from cache/default: ${userData['profileCompleted']}');
            }
            
            // 토큰 저장 - ApiClient의 saveTokens를 직접 호출
            if (responseData?['accessToken'] != null) {
              await apiClient.saveTokens(
                responseData['accessToken'],
                responseData['refreshToken'] ?? '',
              );
              print('Tokens saved to secure storage');
            }
            
            final user = User.fromJson(userData);
            
            // profileCompleted 값을 SharedPreferences에 캐시
            if (user.profileCompleted != null) {
              final prefs = await SharedPreferences.getInstance();
              await prefs.setBool('profileCompleted_${user.id}', user.profileCompleted!);
              print('Cached profileCompleted: ${user.profileCompleted}');
            }
            
            await setAuthenticatedUser(user);
            print('Firebase auth synced with backend successfully - profileCompleted: ${user.profileCompleted}');
            
            // FCM 토큰 저장 (백그라운드에서 실행)
            _saveFCMToken();
          } else {
            print('No user data in response: ${response.data}');
            state = const AuthState.unauthenticated();
          }
        } catch (e) {
          print('Failed to sync Firebase auth with backend: $e');
          // Firebase는 인증되었지만 백엔드 동기화 실패
          // 사용자를 인증 화면으로 다시 보내기
          state = const AuthState.unauthenticated();
        }
      }
    });
  }
}

// Auth state provider
final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final authService = ref.watch(authServiceProvider);
  return AuthNotifier(authService);
});

// Computed providers
final isAuthenticatedProvider = Provider<bool>((ref) {
  final authState = ref.watch(authProvider);
  return authState is AuthenticatedState;
});

final currentUserProvider = Provider<User?>((ref) {
  final authState = ref.watch(authProvider);
  return authState is AuthenticatedState ? authState.user : null;
});

final isLoadingProvider = Provider<bool>((ref) {
  final authState = ref.watch(authProvider);
  return authState is LoadingState;
});

final authErrorProvider = Provider<String?>((ref) {
  final authState = ref.watch(authProvider);
  return authState is ErrorState ? authState.message : null;
});