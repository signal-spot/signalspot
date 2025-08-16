import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/index.dart';
import '../models/index.dart';

// Signal Service Provider
final signalServiceProvider = Provider<SignalService>((ref) {
  return SignalService();
});

// 주변 Signal Spots 상태
final nearbySignalSpotsProvider = StateNotifierProvider<NearbySignalSpotsNotifier, AsyncValue<SignalSpotListResponse>>((ref) {
  return NearbySignalSpotsNotifier(ref.read(signalServiceProvider));
});

class NearbySignalSpotsNotifier extends StateNotifier<AsyncValue<SignalSpotListResponse>> {
  final SignalService _signalService;
  
  NearbySignalSpotsNotifier(this._signalService) : super(const AsyncValue.loading());
  
  Future<void> loadNearbySpots({
    required double latitude,
    required double longitude,
    double radiusKm = 5.0,
    int limit = 100,
    int offset = 0,
  }) async {
    print('loadNearbySpots called with lat=$latitude, lng=$longitude, radius=$radiusKm');
    state = const AsyncValue.loading();
    
    try {
      print('Calling _signalService.getNearbySignalSpots...');
      final response = await _signalService.getNearbySignalSpots(
        latitude: latitude,
        longitude: longitude,
        radiusKm: radiusKm,
        limit: limit,
        offset: offset,
      );
      
      print('Received response with ${response.data.length} spots');
      state = AsyncValue.data(response);
    } catch (error, stackTrace) {
      print('Error loading nearby spots: $error');
      print('Stack trace: $stackTrace');
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> refresh({
    required double latitude,
    required double longitude,
    double radiusKm = 5.0,
  }) async {
    await loadNearbySpots(
      latitude: latitude,
      longitude: longitude,
      radiusKm: radiusKm,
    );
  }
}

// 트렌딩 Signal Spots 상태
final trendingSignalSpotsProvider = StateNotifierProvider<TrendingSignalSpotsNotifier, AsyncValue<SignalSpotListResponse>>((ref) {
  return TrendingSignalSpotsNotifier(ref.read(signalServiceProvider));
});

class TrendingSignalSpotsNotifier extends StateNotifier<AsyncValue<SignalSpotListResponse>> {
  final SignalService _signalService;
  
  TrendingSignalSpotsNotifier(this._signalService) : super(const AsyncValue.loading());
  
  Future<void> loadTrendingSpots({
    int limit = 20,
    int offset = 0,
    String timeframe = 'day',
  }) async {
    state = const AsyncValue.loading();
    
    try {
      final response = await _signalService.getTrendingSignalSpots(
        limit: limit,
        offset: offset,
        timeframe: timeframe,
      );

      print("trending");
      print(response);
      
      state = AsyncValue.data(response);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// 인기 Signal Spots 상태  
final popularSignalSpotsProvider = StateNotifierProvider<PopularSignalSpotsNotifier, AsyncValue<SignalSpotListResponse>>((ref) {
  return PopularSignalSpotsNotifier(ref.read(signalServiceProvider));
});

class PopularSignalSpotsNotifier extends StateNotifier<AsyncValue<SignalSpotListResponse>> {
  final SignalService _signalService;
  
  PopularSignalSpotsNotifier(this._signalService) : super(const AsyncValue.loading());
  
  Future<void> loadPopularSpots({
    int limit = 20,
    int offset = 0,
  }) async {
    state = const AsyncValue.loading();

    print("loadpopularspots");
    
    
    try {
      final response = await _signalService.getPopularSignalSpots(
        limit: limit,
        offset: offset,
      );
      
      state = AsyncValue.data(response);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// 내 Signal Spots 상태
final mySignalSpotsProvider = StateNotifierProvider<MySignalSpotsNotifier, AsyncValue<SignalSpotListResponse>>((ref) {
  return MySignalSpotsNotifier(ref.read(signalServiceProvider));
});

class MySignalSpotsNotifier extends StateNotifier<AsyncValue<SignalSpotListResponse>> {
  final SignalService _signalService;
  
  MySignalSpotsNotifier(this._signalService) : super(const AsyncValue.loading());
  
  Future<void> loadMySpots({
    int limit = 20,
    int offset = 0,
  }) async {
    state = const AsyncValue.loading();
    
    try {
      final response = await _signalService.getMySignalSpots(
        limit: limit,
        offset: offset,
      );
      
      state = AsyncValue.data(response);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> createSpot(CreateSignalSpotRequest request) async {
    try {
      await _signalService.createSignalSpot(request);
      // 생성 후 목록 새로고침
      await loadMySpots();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> deleteSpot(String spotId) async {
    try {
      await _signalService.deleteSignalSpot(spotId);
      // 삭제 후 목록 새로고침
      await loadMySpots();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// Signal Spot 검색 상태
final signalSpotSearchProvider = StateNotifierProvider<SignalSpotSearchNotifier, AsyncValue<SignalSpotListResponse>>((ref) {
  return SignalSpotSearchNotifier(ref.read(signalServiceProvider));
});

class SignalSpotSearchNotifier extends StateNotifier<AsyncValue<SignalSpotListResponse>> {
  final SignalService _signalService;
  
  SignalSpotSearchNotifier(this._signalService) : super(const AsyncValue.data(
    SignalSpotListResponse(data: [], count: 0, success: true, message: ''),
  ));
  
  Future<void> search({
    required String query,
    double? latitude,
    double? longitude,
    double radiusKm = 10.0,
    int limit = 20,
  }) async {
    if (query.trim().isEmpty) {
      state = const AsyncValue.data(
        SignalSpotListResponse(data: [], count: 0, success: true, message: ''),
      );
      return;
    }
    
    state = const AsyncValue.loading();
    
    try {
      final response = await _signalService.searchSignalSpots(
        query: query,
        latitude: latitude,
        longitude: longitude,
        radiusKm: radiusKm,
        limit: limit,
      );
      
      state = AsyncValue.data(response);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  void clearSearch() {
    state = const AsyncValue.data(
      SignalSpotListResponse(data: [], count: 0, success: true, message: ''),
    );
  }
}

// 단일 Signal Spot 상태 (상세 페이지용)
final signalSpotDetailProvider = StateNotifierProvider.family<SignalSpotDetailNotifier, AsyncValue<SignalSpot>, String>((ref, spotId) {
  return SignalSpotDetailNotifier(ref.read(signalServiceProvider), spotId);
});

class SignalSpotDetailNotifier extends StateNotifier<AsyncValue<SignalSpot>> {
  final SignalService _signalService;
  final String spotId;
  
  SignalSpotDetailNotifier(this._signalService, this.spotId) : super(const AsyncValue.loading()) {
    loadSpot();
  }
  
  Future<void> loadSpot() async {
    state = const AsyncValue.loading();
    
    try {
      final spot = await _signalService.getSignalSpotById(spotId);
      state = AsyncValue.data(spot);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> interact(SignalSpotInteraction interaction) async {
    try {
      await _signalService.interactWithSignalSpot(spotId, interaction);
      // 상호작용 후 새로고침
      await loadSpot();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> togglePin(bool pin) async {
    try {
      final updatedSpot = await _signalService.togglePinSignalSpot(spotId, pin);
      state = AsyncValue.data(updatedSpot);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}