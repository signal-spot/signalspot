import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../constants/api_constants.dart';

class ApiClient {
  static const String _accessTokenKey = 'access_token';
  static const String _refreshTokenKey = 'refresh_token';
  
  late final Dio _dio;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();
  
  static final ApiClient _instance = ApiClient._internal();
  factory ApiClient() => _instance;
  
  ApiClient._internal() {
    _dio = Dio(BaseOptions(
      baseUrl: ApiConstants.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true', // ngrok 브라우저 경고 스킵
      },
    ));
    
    _setupInterceptors();
  }
  
  Dio get dio => _dio;
  
  void _setupInterceptors() {
    // Request interceptor - Add auth token
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await getAccessToken();
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
          print('🔑 Request with token to: ${options.path}');
        } else {
          print('⚠️ No token available for request to: ${options.path}');
        }
        handler.next(options);
      },
      onError: (error, handler) async {
        // Handle 401 unauthorized - try to refresh token
        if (error.response?.statusCode == 401) {
          // Avoid infinite loop - don't retry refresh endpoint
          if (error.requestOptions.path.contains('/auth/refresh')) {
            handler.next(error);
            return;
          }
          
          print('🔄 401 error detected for ${error.requestOptions.path}, attempting to refresh token...');
          final refreshed = await _refreshToken();
          if (refreshed) {
            print('✅ Token refreshed successfully, retrying original request');
            
            // Clone the request with new token
            final token = await getAccessToken();
            final opts = Options(
              method: error.requestOptions.method,
              headers: {
                ...error.requestOptions.headers,
                'Authorization': 'Bearer $token',
              },
            );
            
            try {
              final clonedRequest = await _dio.request(
                error.requestOptions.path,
                options: opts,
                data: error.requestOptions.data,
                queryParameters: error.requestOptions.queryParameters,
              );
              handler.resolve(clonedRequest);
              return;
            } catch (e) {
              print('Retry request failed: $e');
              handler.next(error);
              return;
            }
          } else {
            print('❌ Token refresh failed, clearing tokens and redirecting to login');
            // Refresh failed, clear tokens
            await clearTokens();
            // Let the error propagate to trigger re-authentication
            handler.next(error);
            return;
          }
        }
        handler.next(error);
      },
    ));
    
    // Logging interceptor for debug mode
    if (ApiConstants.enableLogging) {
      _dio.interceptors.add(LogInterceptor(
        requestBody: true,
        responseBody: true,
        requestHeader: true,
        responseHeader: false,
        error: true,
      ));
    }
  }
  
  Future<bool> _refreshToken() async {
    try {
      final refreshToken = await getRefreshToken();
      if (refreshToken == null) {
        print('⚠️ No refresh token available');
        return false;
      }
      
      print('🔄 Attempting to refresh token with refreshToken: ${refreshToken.substring(0, 10)}...');
      
      // 타임아웃 설정을 짧게 하여 빠른 실패 처리
      final response = await _dio.post(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
        options: Options(
          headers: {'Authorization': null}, // Don't send access token for refresh
          receiveTimeout: const Duration(seconds: 5),
          sendTimeout: const Duration(seconds: 5),
        ),
      );
      
      if (response.statusCode == 200) {
        // 백엔드 응답 구조에 맞게 수정
        final data = response.data['data'] ?? response.data;
        final newAccessToken = data['accessToken'];
        final newRefreshToken = data['refreshToken'];
        
        if (newAccessToken != null) {
          // 새로운 토큰 저장
          if (newRefreshToken != null) {
            await saveTokens(newAccessToken, newRefreshToken);
          } else {
            await saveAccessToken(newAccessToken);
          }
          print('✅ Token refresh successful - new tokens saved');
          return true;
        }
      }
      return false;
    } catch (e) {
      print('Token refresh failed: $e');
      return false;
    }
  }
  
  // Token management methods
  Future<void> saveTokens(String accessToken, String refreshToken) async {
    await Future.wait([
      _storage.write(key: _accessTokenKey, value: accessToken),
      _storage.write(key: _refreshTokenKey, value: refreshToken),
    ]);
  }
  
  Future<void> saveAccessToken(String accessToken) async {
    await _storage.write(key: _accessTokenKey, value: accessToken);
  }
  
  Future<String?> getAccessToken() async {
    return await _storage.read(key: _accessTokenKey);
  }
  
  Future<String?> getRefreshToken() async {
    return await _storage.read(key: _refreshTokenKey);
  }
  
  Future<void> clearTokens() async {
    await Future.wait([
      _storage.delete(key: _accessTokenKey),
      _storage.delete(key: _refreshTokenKey),
    ]);
  }
  
  Future<bool> hasValidToken() async {
    final token = await getAccessToken();
    return token != null && token.isNotEmpty;
  }
  
  // HTTP method helpers
  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onReceiveProgress,
  }) {
    return _dio.get<T>(
      path,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
      onReceiveProgress: onReceiveProgress,
    );
  }
  
  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) {
    return _dio.post<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );
  }
  
  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
    ProgressCallback? onSendProgress,
    ProgressCallback? onReceiveProgress,
  }) {
    return _dio.put<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
      onSendProgress: onSendProgress,
      onReceiveProgress: onReceiveProgress,
    );
  }
  
  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) {
    return _dio.delete<T>(
      path,
      data: data,
      queryParameters: queryParameters,
      options: options,
      cancelToken: cancelToken,
    );
  }
}