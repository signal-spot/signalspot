import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:geolocator/geolocator.dart';
import '../services/index.dart';
import '../models/index.dart';

// Location Service Provider
final locationServiceProvider = Provider<LocationService>((ref) {
  return LocationService();
});

// 현재 위치 상태
final currentPositionProvider = StateNotifierProvider<CurrentPositionNotifier, AsyncValue<Position>>((ref) {
  return CurrentPositionNotifier(ref.read(locationServiceProvider));
});

class CurrentPositionNotifier extends StateNotifier<AsyncValue<Position>> {
  final LocationService _locationService;
  
  CurrentPositionNotifier(this._locationService) : super(const AsyncValue.loading());
  
  Future<void> getCurrentPosition() async {
    state = const AsyncValue.loading();
    
    try {
      final position = await _locationService.getCurrentPosition();
      state = AsyncValue.data(position);
      
      // 위치를 서버에 자동 업데이트
      _locationService.updateCurrentLocation();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> refresh() async {
    await getCurrentPosition();
  }
}

// 서버 저장 위치 상태
final serverLocationProvider = StateNotifierProvider<ServerLocationNotifier, AsyncValue<Location?>>((ref) {
  return ServerLocationNotifier(ref.read(locationServiceProvider));
});

class ServerLocationNotifier extends StateNotifier<AsyncValue<Location?>> {
  final LocationService _locationService;
  
  ServerLocationNotifier(this._locationService) : super(const AsyncValue.loading());
  
  Future<void> loadServerLocation() async {
    state = const AsyncValue.loading();
    
    try {
      final location = await _locationService.getServerCurrentLocation();
      state = AsyncValue.data(location);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> recordLocation(CreateLocationRequest request) async {
    try {
      final location = await _locationService.recordLocation(request);
      state = AsyncValue.data(location);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// 위치 히스토리 상태
final locationHistoryProvider = StateNotifierProvider<LocationHistoryNotifier, AsyncValue<List<Location>>>((ref) {
  return LocationHistoryNotifier(ref.read(locationServiceProvider));
});

class LocationHistoryNotifier extends StateNotifier<AsyncValue<List<Location>>> {
  final LocationService _locationService;
  
  LocationHistoryNotifier(this._locationService) : super(const AsyncValue.loading());
  
  Future<void> loadHistory({int limit = 50, int offset = 0}) async {
    state = const AsyncValue.loading();
    
    try {
      final history = await _locationService.getLocationHistory(
        limit: limit,
        offset: offset,
      );
      state = AsyncValue.data(history);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> loadMore({int limit = 50}) async {
    final current = state.value ?? [];
    
    try {
      final more = await _locationService.getLocationHistory(
        limit: limit,
        offset: current.length,
      );
      
      state = AsyncValue.data([...current, ...more]);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// 주변 위치 상태
final nearbyLocationsProvider = StateNotifierProvider<NearbyLocationsNotifier, AsyncValue<List<Location>>>((ref) {
  return NearbyLocationsNotifier(ref.read(locationServiceProvider));
});

class NearbyLocationsNotifier extends StateNotifier<AsyncValue<List<Location>>> {
  final LocationService _locationService;
  
  NearbyLocationsNotifier(this._locationService) : super(const AsyncValue.data([]));
  
  Future<void> loadNearbyLocations({
    required double latitude,
    required double longitude,
    double radiusMeters = 1000,
    int limit = 20,
  }) async {
    state = const AsyncValue.loading();
    
    try {
      final locations = await _locationService.getNearbyLocations(
        latitude: latitude,
        longitude: longitude,
        radiusMeters: radiusMeters,
        limit: limit,
      );
      
      state = AsyncValue.data(locations);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  void clearLocations() {
    state = const AsyncValue.data([]);
  }
}

// 주변 사용자 상태
final nearbyUsersProvider = StateNotifierProvider<NearbyUsersNotifier, AsyncValue<List<dynamic>>>((ref) {
  return NearbyUsersNotifier(ref.read(locationServiceProvider));
});

class NearbyUsersNotifier extends StateNotifier<AsyncValue<List<dynamic>>> {
  final LocationService _locationService;
  
  NearbyUsersNotifier(this._locationService) : super(const AsyncValue.data([]));
  
  Future<void> loadNearbyUsers(NearbyUsersQuery query) async {
    state = const AsyncValue.loading();
    
    try {
      final users = await _locationService.getNearbyUsers(query);
      state = AsyncValue.data(users);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  void clearUsers() {
    state = const AsyncValue.data([]);
  }
}

// 위치 통계 상태
final locationStatsProvider = StateNotifierProvider<LocationStatsNotifier, AsyncValue<LocationStats>>((ref) {
  return LocationStatsNotifier(ref.read(locationServiceProvider));
});

class LocationStatsNotifier extends StateNotifier<AsyncValue<LocationStats>> {
  final LocationService _locationService;
  
  LocationStatsNotifier(this._locationService) : super(const AsyncValue.loading());
  
  Future<void> loadStats() async {
    state = const AsyncValue.loading();
    
    try {
      final stats = await _locationService.getLocationStats();
      state = AsyncValue.data(stats);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// 위치 권한 상태
final locationPermissionProvider = StateNotifierProvider<LocationPermissionNotifier, AsyncValue<bool>>((ref) {
  return LocationPermissionNotifier(ref.read(locationServiceProvider));
});

class LocationPermissionNotifier extends StateNotifier<AsyncValue<bool>> {
  final LocationService _locationService;
  
  LocationPermissionNotifier(this._locationService) : super(const AsyncValue.loading()) {
    checkPermission();
  }
  
  Future<void> checkPermission() async {
    state = const AsyncValue.loading();
    
    try {
      final hasPermission = await _locationService.requestLocationPermission();
      state = AsyncValue.data(hasPermission);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> requestPermission() async {
    state = const AsyncValue.loading();
    
    try {
      final hasPermission = await _locationService.requestLocationPermission();
      state = AsyncValue.data(hasPermission);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// 실시간 위치 스트림 Provider
final positionStreamProvider = StreamProvider<Position>((ref) {
  final locationService = ref.read(locationServiceProvider);
  return locationService.getPositionStream();
});

// 위치 기반 유틸리티 Provider
final locationUtilsProvider = Provider<LocationUtils>((ref) {
  return LocationUtils(ref.read(locationServiceProvider));
});

class LocationUtils {
  final LocationService _locationService;
  
  LocationUtils(this._locationService);
  
  Future<double> calculateDistance({
    required double lat1,
    required double lon1,
    required double lat2,
    required double lon2,
  }) async {
    return await _locationService.calculateDistance(
      lat1: lat1,
      lon1: lon1,
      lat2: lat2,
      lon2: lon2,
    );
  }
  
  String formatDistance(double meters) {
    if (meters < 1000) {
      return '${meters.round()}m';
    } else {
      return '${(meters / 1000).toStringAsFixed(1)}km';
    }
  }
  
  String getLocationDescription(double lat, double lng) {
    // 간단한 위치 설명 생성 (실제로는 Geocoding 서비스 사용)
    return '${lat.toStringAsFixed(4)}, ${lng.toStringAsFixed(4)}';
  }
}

// 위치 자동 업데이트 설정
final locationAutoUpdateProvider = StateProvider<bool>((ref) => true);

// 간단한 현재 위치 Provider (Position 대신 간단한 Map 사용)
final currentLocationProvider = Provider<Map<String, double>?>((ref) {
  final positionAsync = ref.watch(currentPositionProvider);
  
  return positionAsync.when(
    data: (position) => {
      'latitude': position.latitude,
      'longitude': position.longitude,
    },
    loading: () => null,  // 로딩 중에는 null 반환
    error: (_, __) => null,  // 에러 시에도 null 반환 (기본값 사용 방지)
  );
});

// 위치 자동 업데이트 리스너
final locationAutoUpdateListenerProvider = Provider<void>((ref) {
  final autoUpdate = ref.watch(locationAutoUpdateProvider);
  final positionStream = ref.watch(positionStreamProvider);
  final locationService = ref.read(locationServiceProvider);
  
  if (autoUpdate) {
    positionStream.whenData((position) {
      // 위치가 변경될 때마다 서버에 업데이트
      locationService.recordLocation(CreateLocationRequest(
        latitude: position.latitude,
        longitude: position.longitude,
        accuracy: position.accuracy,
        altitude: position.altitude,
        speed: position.speed,
      ));
    });
  }
  
  return;
});