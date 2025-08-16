import 'dart:io';
import 'package:dio/dio.dart';
import 'package:dio_cache_interceptor/dio_cache_interceptor.dart';
// Certificate pinning removed - not available in current Flutter version
import 'package:flutter/foundation.dart';
import 'package:connectivity_plus/connectivity_plus.dart';
import '../config/environment.dart';
import '../security/encryption_service.dart';
import '../utils/logger.dart';

class EnhancedApiClient {
  static EnhancedApiClient? _instance;
  static EnhancedApiClient get instance => _instance ??= EnhancedApiClient._();
  
  late final Dio _dio;
  late final CacheOptions _cacheOptions;
  final _connectivity = Connectivity();
  bool _isOffline = false;
  
  EnhancedApiClient._() {
    _initializeDio();
    _setupConnectivityListener();
  }
  
  void _initializeDio() {
    // Cache configuration
    _cacheOptions = CacheOptions(
      store: MemCacheStore(),
      policy: CachePolicy.forceCache,
      hitCacheOnErrorExcept: [401, 403],
      maxStale: const Duration(days: 7),
      priority: CachePriority.normal,
      keyBuilder: CacheOptions.defaultCacheKeyBuilder,
    );
    
    _dio = Dio(BaseOptions(
      baseUrl: Environment.apiBaseUrl,
      connectTimeout: Duration(milliseconds: Environment.apiTimeout),
      receiveTimeout: Duration(milliseconds: Environment.apiTimeout),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Platform': _getPlatform(),
        'X-App-Version': _getAppVersion(),
      },
    ));
    
    // Add interceptors
    _dio.interceptors.addAll([
      _AuthInterceptor(),
      _ErrorInterceptor(),
      _RetryInterceptor(),
      DioCacheInterceptor(options: _cacheOptions),
    ]);
    
    // Certificate pinning can be added later if needed
    
    // Add logging interceptor for non-production
    if (!Environment.isProduction) {
      _dio.interceptors.add(
        LogInterceptor(
          requestBody: true,
          responseBody: true,
          error: true,
          requestHeader: true,
          responseHeader: false,
        ),
      );
    }
  }
  
  void _setupConnectivityListener() {
    _connectivity.onConnectivityChanged.listen((List<ConnectivityResult> results) {
      _isOffline = results.contains(ConnectivityResult.none) || results.isEmpty;
      Logger.debug('Connectivity changed: ${results.map((r) => r.name).join(', ')}, Offline: $_isOffline');
    });
  }
  
  String _getPlatform() {
    if (kIsWeb) return 'web';
    if (Platform.isIOS) return 'ios';
    if (Platform.isAndroid) return 'android';
    return 'unknown';
  }
  
  String _getAppVersion() {
    // This should be replaced with actual app version from package_info_plus
    return '1.0.0';
  }
  
  // HTTP Methods
  Future<T> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    bool useCache = true,
  }) async {
    try {
      final response = await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: _configureOptions(options, useCache),
      );
      return response.data!;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  Future<T> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data!;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  Future<T> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data!;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  Future<T> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data!;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  Future<T> patch<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
  }) async {
    try {
      final response = await _dio.patch<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
      );
      return response.data!;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  // File upload
  Future<T> uploadFile<T>(
    String path,
    File file, {
    String fieldName = 'file',
    Map<String, dynamic>? additionalData,
    ProgressCallback? onSendProgress,
  }) async {
    try {
      final fileName = file.path.split('/').last;
      final formData = FormData.fromMap({
        fieldName: await MultipartFile.fromFile(
          file.path,
          filename: fileName,
        ),
        ...?additionalData,
      });
      
      final response = await _dio.post<T>(
        path,
        data: formData,
        onSendProgress: onSendProgress,
      );
      
      return response.data!;
    } catch (e) {
      throw _handleError(e);
    }
  }
  
  Options _configureOptions(Options? options, bool useCache) {
    final opts = options ?? Options();
    
    if (!useCache) {
      opts.extra = {
        ...?opts.extra,
        'dio_cache.force_refresh': true,
      };
    }
    
    return opts;
  }
  
  Exception _handleError(dynamic error) {
    if (error is DioException) {
      switch (error.type) {
        case DioExceptionType.connectionTimeout:
        case DioExceptionType.sendTimeout:
        case DioExceptionType.receiveTimeout:
          return TimeoutException('Request timed out');
          
        case DioExceptionType.connectionError:
          return NetworkException('No internet connection');
          
        case DioExceptionType.badResponse:
          return _handleBadResponse(error.response);
          
        case DioExceptionType.cancel:
          return RequestCancelledException('Request was cancelled');
          
        default:
          return UnknownException('An unknown error occurred');
      }
    }
    
    return UnknownException(error.toString());
  }
  
  Exception _handleBadResponse(Response? response) {
    if (response == null) {
      return ServerException('No response from server');
    }
    
    final statusCode = response.statusCode ?? 0;
    final data = response.data;
    String message = 'Server error';
    
    if (data is Map<String, dynamic>) {
      message = data['message'] ?? data['error'] ?? message;
    }
    
    switch (statusCode) {
      case 400:
        return BadRequestException(message);
      case 401:
        return UnauthorizedException(message);
      case 403:
        return ForbiddenException(message);
      case 404:
        return NotFoundException(message);
      case 429:
        return RateLimitException(message);
      case >= 500:
        return ServerException(message);
      default:
        return ApiException(message, statusCode);
    }
  }
  
  // Clear cache
  Future<void> clearCache() async {
    await _cacheOptions.store?.clean();
  }
  
  // Cancel all requests
  void cancelAllRequests() {
    _dio.close(force: true);
  }
}

// Interceptors
class _AuthInterceptor extends Interceptor {
  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    final tokens = await EncryptionService.getTokens();
    final accessToken = tokens['accessToken'];
    
    if (accessToken != null && accessToken.isNotEmpty) {
      options.headers['Authorization'] = 'Bearer $accessToken';
    }
    
    handler.next(options);
  }
  
  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (err.response?.statusCode == 401) {
      // Try to refresh token
      final refreshed = await _refreshToken();
      if (refreshed) {
        // Retry the request
        final options = err.requestOptions;
        final tokens = await EncryptionService.getTokens();
        options.headers['Authorization'] = 'Bearer ${tokens['accessToken']}';
        
        try {
          final response = await Dio().fetch(options);
          handler.resolve(response);
          return;
        } catch (e) {
          handler.next(err);
        }
      }
    }
    
    handler.next(err);
  }
  
  Future<bool> _refreshToken() async {
    try {
      final tokens = await EncryptionService.getTokens();
      final refreshToken = tokens['refreshToken'];
      
      if (refreshToken == null) return false;
      
      final response = await Dio().post(
        '${Environment.apiBaseUrl}/auth/refresh',
        data: {'refreshToken': refreshToken},
      );
      
      if (response.statusCode == 200) {
        final data = response.data;
        await EncryptionService.storeTokens(
          accessToken: data['accessToken'],
          refreshToken: data['refreshToken'],
        );
        return true;
      }
    } catch (e) {
      Logger.error('Token refresh failed', e);
    }
    
    return false;
  }
}

class _ErrorInterceptor extends Interceptor {
  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    Logger.error('API Error', err);
    handler.next(err);
  }
}

class _RetryInterceptor extends Interceptor {
  final int maxRetries = 3;
  final int retryDelay = 1000; // milliseconds
  
  @override
  Future<void> onError(
    DioException err,
    ErrorInterceptorHandler handler,
  ) async {
    if (_shouldRetry(err)) {
      final options = err.requestOptions;
      final retryCount = options.extra['retryCount'] ?? 0;
      
      if (retryCount < maxRetries) {
        options.extra['retryCount'] = retryCount + 1;
        
        await Future.delayed(
          Duration(milliseconds: retryDelay * (retryCount + 1) as int),
        );
        
        try {
          final response = await Dio().fetch(options);
          handler.resolve(response);
          return;
        } catch (e) {
          handler.next(err);
        }
      }
    }
    
    handler.next(err);
  }
  
  bool _shouldRetry(DioException err) {
    return err.type == DioExceptionType.connectionError ||
           err.type == DioExceptionType.connectionTimeout ||
           (err.response?.statusCode ?? 0) >= 500;
  }
}

// Custom Exceptions
class ApiException implements Exception {
  final String message;
  final int? statusCode;
  
  ApiException(this.message, [this.statusCode]);
  
  @override
  String toString() => 'ApiException: $message (Status: $statusCode)';
}

class NetworkException extends ApiException {
  NetworkException(String message) : super(message);
}

class TimeoutException extends ApiException {
  TimeoutException(String message) : super(message);
}

class BadRequestException extends ApiException {
  BadRequestException(String message) : super(message, 400);
}

class UnauthorizedException extends ApiException {
  UnauthorizedException(String message) : super(message, 401);
}

class ForbiddenException extends ApiException {
  ForbiddenException(String message) : super(message, 403);
}

class NotFoundException extends ApiException {
  NotFoundException(String message) : super(message, 404);
}

class RateLimitException extends ApiException {
  RateLimitException(String message) : super(message, 429);
}

class ServerException extends ApiException {
  ServerException(String message) : super(message, 500);
}

class RequestCancelledException extends ApiException {
  RequestCancelledException(String message) : super(message);
}

class UnknownException extends ApiException {
  UnknownException(String message) : super(message);
}