import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/index.dart';
import '../models/index.dart';

// Profile Service Provider
final profileServiceProvider = Provider<ProfileService>((ref) {
  return ProfileService();
});

// 현재 사용자 프로필 상태
final myProfileProvider = StateNotifierProvider<MyProfileNotifier, AsyncValue<UserProfile>>((ref) {
  return MyProfileNotifier(ref.read(profileServiceProvider));
});

class MyProfileNotifier extends StateNotifier<AsyncValue<UserProfile>> {
  final ProfileService _profileService;
  
  MyProfileNotifier(this._profileService) : super(const AsyncValue.loading());
  
  Future<void> loadProfile() async {
    state = const AsyncValue.loading();
    
    try {
      final profile = await _profileService.getMyProfile();
      state = AsyncValue.data(profile);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> updateProfile(UpdateProfileRequest request) async {
    try {
      final updatedProfile = await _profileService.updateProfile(request);
      state = AsyncValue.data(updatedProfile);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> uploadAvatar(String filePath) async {
    try {
      final updatedProfile = await _profileService.uploadAvatar(filePath);
      state = AsyncValue.data(updatedProfile);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// 프로필 분석 데이터 상태
final profileAnalyticsProvider = StateNotifierProvider<ProfileAnalyticsNotifier, AsyncValue<Map<String, dynamic>>>((ref) {
  return ProfileAnalyticsNotifier(ref.read(profileServiceProvider));
});

class ProfileAnalyticsNotifier extends StateNotifier<AsyncValue<Map<String, dynamic>>> {
  final ProfileService _profileService;
  
  ProfileAnalyticsNotifier(this._profileService) : super(const AsyncValue.loading());
  
  Future<void> loadAnalytics() async {
    print('[ProfileAnalyticsNotifier] Loading analytics...');
    state = const AsyncValue.loading();
    
    try {
      final analytics = await _profileService.getProfileAnalytics();
      print('[ProfileAnalyticsNotifier] Analytics loaded: $analytics');
      state = AsyncValue.data(analytics);
    } catch (error, stackTrace) {
      print('[ProfileAnalyticsNotifier] Error loading analytics: $error');
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// 시그니처 커넥션 설정 상태
final signatureConnectionPreferencesProvider = StateNotifierProvider<SignatureConnectionPreferencesNotifier, AsyncValue<SignatureConnectionPreferences?>>((ref) {
  return SignatureConnectionPreferencesNotifier(ref.read(profileServiceProvider));
});

class SignatureConnectionPreferencesNotifier extends StateNotifier<AsyncValue<SignatureConnectionPreferences?>> {
  final ProfileService _profileService;
  
  SignatureConnectionPreferencesNotifier(this._profileService) : super(const AsyncValue.loading());
  
  Future<void> loadPreferences() async {
    state = const AsyncValue.loading();
    
    try {
      final preferences = await _profileService.getSignatureConnectionPreferences();
      state = AsyncValue.data(preferences);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> updatePreferences(SignatureConnectionPreferences preferences) async {
    try {
      await _profileService.updateSignatureConnectionPreferences(preferences);
      state = AsyncValue.data(preferences);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// 프로필 추천 상태
final profileSuggestionsProvider = StateNotifierProvider<ProfileSuggestionsNotifier, AsyncValue<List<UserProfile>>>((ref) {
  return ProfileSuggestionsNotifier(ref.read(profileServiceProvider));
});

class ProfileSuggestionsNotifier extends StateNotifier<AsyncValue<List<UserProfile>>> {
  final ProfileService _profileService;
  
  ProfileSuggestionsNotifier(this._profileService) : super(const AsyncValue.data([]));
  
  Future<void> loadSuggestions({int limit = 10}) async {
    state = const AsyncValue.loading();
    
    try {
      final suggestions = await _profileService.getProfileSuggestions(limit: limit);
      state = AsyncValue.data(suggestions);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// 시그니처 커넥션 매치 상태
final signatureConnectionMatchesProvider = StateNotifierProvider<SignatureConnectionMatchesNotifier, AsyncValue<List<dynamic>>>((ref) {
  return SignatureConnectionMatchesNotifier(ref.read(profileServiceProvider));
});

class SignatureConnectionMatchesNotifier extends StateNotifier<AsyncValue<List<dynamic>>> {
  final ProfileService _profileService;
  
  SignatureConnectionMatchesNotifier(this._profileService) : super(const AsyncValue.data([]));
  
  Future<void> loadMatches({int limit = 20, int offset = 0}) async {
    state = const AsyncValue.loading();
    
    try {
      final matches = await _profileService.getSignatureConnectionMatches(
        limit: limit,
        offset: offset,
      );
      state = AsyncValue.data(matches);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// 시그니처 커넥션 통계 상태
final signatureConnectionStatsProvider = StateNotifierProvider<SignatureConnectionStatsNotifier, AsyncValue<Map<String, dynamic>>>((ref) {
  return SignatureConnectionStatsNotifier(ref.read(profileServiceProvider));
});

class SignatureConnectionStatsNotifier extends StateNotifier<AsyncValue<Map<String, dynamic>>> {
  final ProfileService _profileService;
  
  SignatureConnectionStatsNotifier(this._profileService) : super(const AsyncValue.loading());
  
  Future<void> loadStats() async {
    state = const AsyncValue.loading();
    
    try {
      final stats = await _profileService.getSignatureConnectionStats();
      state = AsyncValue.data(stats);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// 프로필 검색 상태
final profileSearchProvider = StateNotifierProvider<ProfileSearchNotifier, AsyncValue<List<UserProfile>>>((ref) {
  return ProfileSearchNotifier(ref.read(profileServiceProvider));
});

class ProfileSearchNotifier extends StateNotifier<AsyncValue<List<UserProfile>>> {
  final ProfileService _profileService;
  
  ProfileSearchNotifier(this._profileService) : super(const AsyncValue.data([]));
  
  Future<void> searchProfiles({
    required String query,
    int limit = 20,
    int offset = 0,
  }) async {
    if (query.isEmpty) {
      state = const AsyncValue.data([]);
      return;
    }
    
    state = const AsyncValue.loading();
    
    try {
      final profiles = await _profileService.searchProfiles(
        query: query,
        limit: limit,
        offset: offset,
      );
      state = AsyncValue.data(profiles);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  void clearSearch() {
    state = const AsyncValue.data([]);
  }
}

// 프로필 설정 Provider
final profileSettingsProvider = StateProvider<Map<String, dynamic>>((ref) => {});

// 프로필 가시성 상태
final profileVisibilityProvider = StateProvider<ProfileVisibility>((ref) => ProfileVisibility.public);