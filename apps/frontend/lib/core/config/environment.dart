import 'package:flutter/foundation.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

enum EnvironmentType {
  development,
  staging,
  production,
}

class Environment {
  static late EnvironmentType _environment;
  static late Map<String, dynamic> _config;
  
  static EnvironmentType get current => _environment;
  static bool get isDevelopment => _environment == EnvironmentType.development;
  static bool get isStaging => _environment == EnvironmentType.staging;
  static bool get isProduction => _environment == EnvironmentType.production;
  
  static Future<void> initialize() async {
    // Load environment file based on flavor or default
    String envFile = '.env';
    
    if (const String.fromEnvironment('FLAVOR') == 'production') {
      envFile = '.env.production';
      _environment = EnvironmentType.production;
    } else if (const String.fromEnvironment('FLAVOR') == 'staging') {
      envFile = '.env.staging';
      _environment = EnvironmentType.staging;
    } else {
      envFile = '.env.development';
      _environment = EnvironmentType.development;
    }
    
    try {
      await dotenv.load(fileName: envFile);
    } catch (e) {
      // Fallback to default .env if specific file not found
      await dotenv.load(fileName: '.env');
      _environment = EnvironmentType.development;
    }
    
    _validateEnvironment();
    _loadConfiguration();
  }
  
  static void _validateEnvironment() {
    final requiredVars = [
      'API_BASE_URL',
      'SENTRY_DSN',
      'ENCRYPTION_KEY',
    ];
    
    if (isProduction) {
      requiredVars.addAll([
        'GOOGLE_MAPS_API_KEY_ANDROID',
        'GOOGLE_MAPS_API_KEY_IOS',
        'FCM_SERVER_KEY',
        'APPLE_SIGN_IN_SERVICE_ID',
      ]);
    }
    
    for (final varName in requiredVars) {
      if (dotenv.env[varName] == null || dotenv.env[varName]!.isEmpty) {
        if (!kDebugMode || isProduction) {
          throw Exception('Missing required environment variable: $varName');
        }
      }
    }
  }
  
  static void _loadConfiguration() {
    _config = {
      'api': {
        'baseUrl': _getApiBaseUrl(),
        'timeout': isProduction ? 30000 : 60000,
        'maxRetries': isProduction ? 3 : 1,
        'enableLogging': !isProduction,
      },
      'security': {
        'encryptionKey': dotenv.env['ENCRYPTION_KEY'] ?? '',
        'enableCertificatePinning': isProduction,
        'allowSelfSignedCerts': isDevelopment,
      },
      'features': {
        'enableAnalytics': !isDevelopment,
        'enableCrashReporting': !isDevelopment,
        'enablePerformanceMonitoring': isProduction,
        'enableOfflineMode': true,
        'enableBiometricAuth': isProduction,
      },
      'cache': {
        'maxAge': isProduction ? 3600 : 60, // seconds
        'maxSize': 50 * 1024 * 1024, // 50MB
        'enablePersistence': true,
      },
      'logging': {
        'level': isDevelopment ? 'debug' : (isStaging ? 'info' : 'error'),
        'enableConsoleLog': !isProduction,
        'enableFileLog': isProduction,
        'enableRemoteLog': !isDevelopment,
      },
    };
  }
  
  static String _getApiBaseUrl() {
    if (kIsWeb) {
      return dotenv.env['API_BASE_URL_WEB'] ?? 
             dotenv.env['API_BASE_URL'] ?? 
             'http://localhost:3000/api';
    }
    
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      return dotenv.env['API_BASE_URL_IOS'] ?? 
             dotenv.env['API_BASE_URL'] ?? 
             'http://localhost:3000/api';
    }
    
    if (defaultTargetPlatform == TargetPlatform.android) {
      return dotenv.env['API_BASE_URL_ANDROID'] ?? 
             dotenv.env['API_BASE_URL'] ?? 
             'http://10.0.2.2:3000/api';
    }
    
    return dotenv.env['API_BASE_URL'] ?? 'http://localhost:3000/api';
  }
  
  static T? getValue<T>(String key) {
    final keys = key.split('.');
    dynamic value = _config;
    
    for (final k in keys) {
      if (value is Map) {
        value = value[k];
      } else {
        return null;
      }
    }
    
    return value as T?;
  }
  
  static String get apiBaseUrl => getValue<String>('api.baseUrl') ?? '';
  static int get apiTimeout => getValue<int>('api.timeout') ?? 30000;
  static bool get enableLogging => getValue<bool>('api.enableLogging') ?? false;
  static bool get enableAnalytics => getValue<bool>('features.enableAnalytics') ?? false;
  static bool get enableOfflineMode => getValue<bool>('features.enableOfflineMode') ?? true;
  static String get encryptionKey => getValue<String>('security.encryptionKey') ?? '';
  static String get sentryDsn => dotenv.env['SENTRY_DSN'] ?? '';
  static String get googleMapsApiKey {
    if (defaultTargetPlatform == TargetPlatform.iOS) {
      return dotenv.env['GOOGLE_MAPS_API_KEY_IOS'] ?? '';
    }
    return dotenv.env['GOOGLE_MAPS_API_KEY_ANDROID'] ?? '';
  }
}