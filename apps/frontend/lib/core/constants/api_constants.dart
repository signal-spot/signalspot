
class ApiConstants {
  // Base URLs from environment - Platform-specific
  static String get baseUrl {
    try {
      // ngrok URL for development - works for both simulator and real device
      const String ngrokUrl = 'http://3.39.206.100:3000/api';

      // Use ngrok URL for universal access
      return ngrokUrl;
      
      // Original platform-specific logic (uncomment when not using ngrok)
      /*
      // Check if we're running on web
      if (kIsWeb) {
        return dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api';
      }
      
      // For iOS simulator, use localhost
      if (defaultTargetPlatform == TargetPlatform.iOS) {
        return dotenv.env['API_BASE_URL_IOS'] ?? 'http://localhost:3000/api';
      }
      
      // For Android emulator, use 10.0.2.2
      if (defaultTargetPlatform == TargetPlatform.android) {
        return dotenv.env['API_BASE_URL'] ?? 'http://10.0.2.2:3000/api';
      }
      
      // Default fallback
      return dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api';
      */
    } catch (e) {
      // Universal fallback - using local network URL
      return 'http://192.168.45.77:3000/api';
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