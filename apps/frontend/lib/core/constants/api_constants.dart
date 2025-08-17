
import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConstants {
  // Base URLs from environment - Platform-specific
  static String get baseUrl {
    try {
      // Use environment variable if available
      return dotenv.env['API_BASE_URL'] ?? 'https://lettie.co.kr/signalspot/api';
    } catch (e) {
      // Universal fallback
      return 'https://lettie.co.kr/signalspot/api';
    }
  }
  
  // WebSocket Configuration
  static String get wsUrl {
    try {
      return dotenv.env['WS_URL'] ?? 'https://lettie.co.kr:443';
    } catch (e) {
      return 'https://lettie.co.kr:443';
    }
  }
  
  static String get wsPath {
    try {
      return dotenv.env['WS_PATH'] ?? '/signalspot/socket.io/';
    } catch (e) {
      return '/signalspot/socket.io/';
    }
  }
  
  // API Endpoints
  static const String authPath = '/auth';
  static const String signalsPath = '/signals';
  static const String sparksPath = '/sparks';
  static const String usersPath = '/users';
  
  // Auth endpoints
  static const String loginEndpoint = '$authPath/login';
  static const String registerEndpoint = '$authPath/register';
  static const String refreshEndpoint = '$authPath/refresh';
  static const String logoutEndpoint = '$authPath/logout';
  static const String profileEndpoint = '$authPath/profile';
  static const String verifyEmailEndpoint = '$authPath/verify-email';
  
  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 10);
  static const Duration receiveTimeout = Duration(seconds: 10);
  
  // Feature flags
  static const bool enableLogging = true; // Should be false in production
  
  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;
}