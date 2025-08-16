import 'package:dio/dio.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/constants/api_constants.dart';
import '../models/auth_models.dart';

class AuthService {
  final ApiClient _apiClient = ApiClient();

  Future<AuthResponse> login(String email, String password) async {
    try {
      final request = LoginRequest(email: email, password: password);

      final response = await _apiClient.dio.post(
        ApiConstants.loginEndpoint,
        data: request.toJson(),
      );

      if (response.statusCode == 200) {
        print('AuthService: Login response received');
        // Backend wraps response in { success: true, data: {...} }
        final responseData = response.data['data'];
        print('AuthService: Response data: $responseData');

        final authResponse = AuthResponse.fromJson(responseData);
        print('AuthService: AuthResponse parsed successfully');

        // Save tokens securely
        await _apiClient.saveTokens(
          authResponse.accessToken,
          authResponse.refreshToken,
        );
        print('AuthService: Tokens saved successfully');

        return authResponse;
      } else {
        throw AuthException('Login failed with status: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw AuthException('Unexpected error during login: $e');
    }
  }

  Future<AuthResponse> register({
    required String email,
    required String password,
    required String username,
  }) async {
    try {
      final request = RegisterRequest(
        email: email,
        password: password,
        username: username,
      );

      final response = await _apiClient.dio.post(
        ApiConstants.registerEndpoint,
        data: request.toJson(),
      );

      if (response.statusCode == 201) {
        // Backend wraps response in { success: true, data: {...} }
        final responseData = response.data['data'];
        final authResponse = AuthResponse.fromJson(responseData);

        // Save tokens securely
        await _apiClient.saveTokens(
          authResponse.accessToken,
          authResponse.refreshToken,
        );

        return authResponse;
      } else {
        throw AuthException(
          'Registration failed with status: ${response.statusCode}',
        );
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw AuthException('Unexpected error during registration: $e');
    }
  }

  Future<User> getProfile() async {
    try {
      final response = await _apiClient.dio.get(ApiConstants.profileEndpoint);
      if (response.statusCode == 200) {
        print('Profile API Response: ${response.data}');
        
        // For profile endpoint, data might be directly returned without wrapper
        final userData = response.data.containsKey('data')
            ? response.data['data']
            : response.data;
            
        print('Profile User Data: $userData');
        print('Profile Completed field: ${userData['profileCompleted']}');
        
        return User.fromJson(userData);
      } else {
        throw AuthException('Failed to get profile: ${response.statusCode}');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      throw AuthException('Unexpected error getting profile: $e');
    }
  }

  Future<void> logout() async {
    try {
      // Call logout endpoint if user is authenticated
      if (await _apiClient.hasValidToken()) {
        await _apiClient.dio.post(ApiConstants.logoutEndpoint);
      }
    } catch (e) {
      // Continue with local logout even if server logout fails
    } finally {
      // Always clear local tokens
      await _apiClient.clearTokens();
    }
  }

  Future<void> deleteAccount() async {
    try {
      if (!await _apiClient.hasValidToken()) {
        throw AuthException('인증 토큰이 없습니다');
      }

      final response = await _apiClient.dio.delete('/auth/account');

      // 백엔드는 200 OK와 함께 message, recoveryToken, recoveryExpiresAt를 반환
      if (response.statusCode == 200 && response.data['message'] != null) {
        // Clear all local data
        await _apiClient.clearTokens();
        print('Account deleted successfully. Recovery token: ${response.data['recoveryToken']}');
      } else {
        throw AuthException('회원탈퇴에 실패했습니다');
      }
    } on DioException catch (e) {
      throw _handleDioError(e);
    } catch (e) {
      print('Delete account error: $e');
      throw AuthException('회원탈퇴 중 오류가 발생했습니다');
    }
  }

  Future<bool> isAuthenticated() async {
    return await _apiClient.hasValidToken();
  }

  Future<void> saveTokens({
    required String accessToken,
    required String refreshToken,
  }) async {
    await _apiClient.saveTokens(accessToken, refreshToken);
  }

  Future<bool> refreshToken() async {
    try {
      final refreshToken = await _apiClient.getRefreshToken();
      if (refreshToken == null) return false;

      final request = RefreshTokenRequest(refreshToken: refreshToken);
      final response = await _apiClient.dio.post(
        ApiConstants.refreshEndpoint,
        data: request.toJson(),
      );

      if (response.statusCode == 200) {
        // 백엔드 응답 구조: { success: true, data: { accessToken, refreshToken } }
        final data = response.data['data'] ?? response.data;
        final newAccessToken = data['accessToken'];
        final newRefreshToken = data['refreshToken'];
        
        if (newAccessToken != null) {
          // 새로운 토큰 저장
          if (newRefreshToken != null) {
            await _apiClient.saveTokens(newAccessToken, newRefreshToken);
          } else {
            await _apiClient.saveAccessToken(newAccessToken);
          }
          return true;
        }
      }
      return false;
    } catch (e) {
      print('Token refresh failed in auth service: $e');
      return false;
    }
  }

  AuthException _handleDioError(DioException e) {
    switch (e.type) {
      case DioExceptionType.connectionTimeout:
        return AuthException(
          'Connection timeout. Please check your internet connection.',
        );
      case DioExceptionType.receiveTimeout:
        return AuthException('Server response timeout. Please try again.');
      case DioExceptionType.badResponse:
        final statusCode = e.response?.statusCode;
        final message = e.response?.data?['message'] ?? 'Server error occurred';

        switch (statusCode) {
          case 400:
            return AuthException('Invalid request: $message');
          case 401:
            return AuthException(
              'Invalid credentials. Please check your email and password.',
            );
          case 403:
            return AuthException('Access forbidden: $message');
          case 404:
            return AuthException('Service not found. Please try again later.');
          case 409:
            return AuthException(
              'Account already exists with this email or username.',
            );
          case 429:
            return AuthException('Too many attempts. Please try again later.');
          case 500:
            return AuthException('Server error. Please try again later.');
          default:
            return AuthException('Error: $message');
        }
      case DioExceptionType.unknown:
        return AuthException(
          'Network error. Please check your internet connection.',
        );
      default:
        return AuthException('Unexpected error occurred. Please try again.');
    }
  }
}

class AuthException implements Exception {
  final String message;

  AuthException(this.message);

  @override
  String toString() => 'AuthException: $message';
}
