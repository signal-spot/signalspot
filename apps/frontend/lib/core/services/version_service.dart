import 'dart:io';
import 'package:dio/dio.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../api/api_client.dart';

class VersionCheckResult {
  final bool needsUpdate;
  final bool forceUpdate;
  final String latestVersion;
  final String minRequiredVersion;
  final String updateUrl;
  final String? releaseNotes;
  final String currentVersion;

  VersionCheckResult({
    required this.needsUpdate,
    required this.forceUpdate,
    required this.latestVersion,
    required this.minRequiredVersion,
    required this.updateUrl,
    this.releaseNotes,
    required this.currentVersion,
  });

  factory VersionCheckResult.fromJson(Map<String, dynamic> json, String currentVersion) {
    return VersionCheckResult(
      needsUpdate: json['needsUpdate'] ?? false,
      forceUpdate: json['forceUpdate'] ?? false,
      latestVersion: json['latestVersion'] ?? '',
      minRequiredVersion: json['minRequiredVersion'] ?? '',
      updateUrl: json['updateUrl'] ?? '',
      releaseNotes: json['releaseNotes'],
      currentVersion: currentVersion,
    );
  }
}

class VersionService {
  static final VersionService _instance = VersionService._internal();
  factory VersionService() => _instance;
  VersionService._internal();

  final ApiClient _apiClient = ApiClient();

  /// Check if app needs update
  Future<VersionCheckResult?> checkVersion() async {
    try {
      // Get current app version
      final packageInfo = await PackageInfo.fromPlatform();
      final currentVersion = packageInfo.version;
      
      // Determine platform
      final platform = Platform.isIOS ? 'ios' : 'android';
      
      print('🔄 Checking app version: $currentVersion on $platform');

      // Call version check API
      final response = await _apiClient.dio.get(
        '/app-version/check',
        queryParameters: {
          'platform': platform,
          'currentVersion': currentVersion,
        },
      );

      if (response.statusCode == 200) {
        final data = response.data['data'] ?? response.data;
        final result = VersionCheckResult.fromJson(data, currentVersion);
        
        print('✅ Version check complete:');
        print('  - Current: $currentVersion');
        print('  - Latest: ${result.latestVersion}');
        print('  - Needs update: ${result.needsUpdate}');
        print('  - Force update: ${result.forceUpdate}');
        
        return result;
      }

      return null;
    } catch (e) {
      print('❌ Version check failed: $e');
      // Don't block app startup if version check fails
      return null;
    }
  }

  /// Compare two version strings
  /// Returns: 1 if v1 > v2, -1 if v1 < v2, 0 if equal
  static int compareVersions(String v1, String v2) {
    final parts1 = v1.split('.').map(int.parse).toList();
    final parts2 = v2.split('.').map(int.parse).toList();
    
    for (int i = 0; i < 3; i++) {
      final part1 = i < parts1.length ? parts1[i] : 0;
      final part2 = i < parts2.length ? parts2[i] : 0;
      
      if (part1 > part2) return 1;
      if (part1 < part2) return -1;
    }
    
    return 0;
  }
}