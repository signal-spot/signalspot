import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../services/index.dart';
import '../models/index.dart';
import '../../features/auth/presentation/providers/auth_provider.dart';

// Spark Service Provider
final sparkServiceProvider = Provider<SparkService>((ref) {
  final currentUser = ref.watch(currentUserProvider);
  return SparkService(userId: currentUser?.id);
});

// 내 스파크 목록 상태
final mySparkListProvider = StateNotifierProvider<MySparkListNotifier, AsyncValue<List<Spark>>>((ref) {
  return MySparkListNotifier(ref.read(sparkServiceProvider));
});

class MySparkListNotifier extends StateNotifier<AsyncValue<List<Spark>>> {
  final SparkService _sparkService;
  
  MySparkListNotifier(this._sparkService) : super(const AsyncValue.loading());
  
  Future<void> loadSparks() async {
    state = const AsyncValue.loading();
    
    try {
      print('Loading sparks...');
      final response = await _sparkService.getMySparks();
      print('Loaded ${response.data.length} sparks');
      
      // 디버깅을 위한 로그
      for (var spark in response.data) {
        print('Spark: id=${spark.id}, status=${spark.status}, direction=${spark.direction}');
      }
      
      state = AsyncValue.data(response.data);
    } catch (error, stackTrace) {
      print('Error loading sparks: $error');
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> refresh() async {
    await loadSparks();
  }
  
  Future<void> sendSpark(CreateSparkRequest request) async {
    try {
      await _sparkService.sendSpark(request);
      // 스파크 전송 후 목록 새로고침
      await loadSparks();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> acceptSpark(String sparkId) async {
    try {
      // 수락 후 업데이트된 spark 객체 받기
      final updatedSpark = await _sparkService.acceptSpark(sparkId);
      
      // 현재 리스트 업데이트 (즉시 UI 반영)
      state = state.whenData((sparks) {
        final updatedList = sparks.map((spark) {
          if (spark.id == sparkId) {
            return updatedSpark;
          }
          return spark;
        }).toList();
        return updatedList;
      });
      
      // 백그라운드에서 전체 목록 새로고침
      loadSparks();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> rejectSpark(String sparkId) async {
    try {
      // 거절 후 업데이트된 spark 객체 받기
      final updatedSpark = await _sparkService.rejectSpark(sparkId);
      
      // 현재 리스트 업데이트 (즉시 UI 반영)
      state = state.whenData((sparks) {
        final updatedList = sparks.map((spark) {
          if (spark.id == sparkId) {
            return updatedSpark;
          }
          return spark;
        }).toList();
        return updatedList;
      });
      
      // 백그라운드에서 전체 목록 새로고침  
      loadSparks();
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
}

// 스파크 통계 - 클라이언트 사이드에서 계산
final sparkStatsProvider = Provider<Map<String, dynamic>>((ref) {
  final sparksAsync = ref.watch(mySparkListProvider);
  
  return sparksAsync.when(
    data: (sparks) {
      // 클라이언트 사이드에서 통계 계산
      final now = DateTime.now();
      final todayStart = DateTime(now.year, now.month, now.day);
      final weekStart = now.subtract(Duration(days: now.weekday - 1));
      
      final pendingSparks = sparks.where((s) => s.status == SparkStatus.pending).length;
      final acceptedSparks = sparks.where((s) => s.status == SparkStatus.accepted).length;
      final rejectedSparks = sparks.where((s) => s.status == SparkStatus.rejected).length;
      final matchedSparks = sparks.where((s) => s.status == SparkStatus.matched).length;
      
      final todaySparks = sparks.where((s) => s.createdAt.isAfter(todayStart)).length;
      final thisWeekSparks = sparks.where((s) => s.createdAt.isAfter(weekStart)).length;
      
      return {
        'totalSparks': sparks.length,
        'pendingSparks': pendingSparks,
        'acceptedSparks': acceptedSparks,
        'rejectedSparks': rejectedSparks,
        'matchedSparks': matchedSparks,
        'todaySparks': todaySparks,
        'thisWeekSparks': thisWeekSparks,
      };
    },
    loading: () => {
      'totalSparks': 0,
      'pendingSparks': 0,
      'acceptedSparks': 0,
      'rejectedSparks': 0,
      'matchedSparks': 0,
      'todaySparks': 0,
      'thisWeekSparks': 0,
    },
    error: (_, __) => {
      'totalSparks': 0,
      'pendingSparks': 0,
      'acceptedSparks': 0,
      'rejectedSparks': 0,
      'matchedSparks': 0,
      'todaySparks': 0,
      'thisWeekSparks': 0,
    },
  );
});

// 백엔드 스파크 통계 (필요한 경우에만 사용)
final sparkStatsFromBackendProvider = StateNotifierProvider<SparkStatsFromBackendNotifier, AsyncValue<Map<String, dynamic>>>((ref) {
  return SparkStatsFromBackendNotifier(ref.read(sparkServiceProvider));
});

class SparkStatsFromBackendNotifier extends StateNotifier<AsyncValue<Map<String, dynamic>>> {
  final SparkService _sparkService;
  
  SparkStatsFromBackendNotifier(this._sparkService) : super(const AsyncValue.loading());
  
  Future<void> loadStats() async {
    state = const AsyncValue.loading();
    
    try {
      final stats = await _sparkService.getSparkStats();
      state = AsyncValue.data(stats);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> refresh() async {
    await loadStats();
  }
}

// 스파크 상세 정보 상태
final sparkDetailProvider = StateNotifierProvider.family<SparkDetailNotifier, AsyncValue<SparkDetail>, String>((ref, sparkId) {
  return SparkDetailNotifier(ref.read(sparkServiceProvider), sparkId);
});

class SparkDetailNotifier extends StateNotifier<AsyncValue<SparkDetail>> {
  final SparkService _sparkService;
  final String sparkId;
  
  SparkDetailNotifier(this._sparkService, this.sparkId) : super(const AsyncValue.loading()) {
    loadSparkDetail();
  }
  
  Future<void> loadSparkDetail() async {
    state = const AsyncValue.loading();
    
    try {
      final detail = await _sparkService.getSparkDetail(sparkId);
      state = AsyncValue.data(detail);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  Future<void> refresh() async {
    await loadSparkDetail();
  }
}

// 잠재적 스파크 대상 상태 (위치 기반)
final potentialSparksProvider = StateNotifierProvider<PotentialSparksNotifier, AsyncValue<List<Map<String, dynamic>>>>((ref) {
  return PotentialSparksNotifier(ref.read(sparkServiceProvider));
});

class PotentialSparksNotifier extends StateNotifier<AsyncValue<List<Map<String, dynamic>>>> {
  final SparkService _sparkService;
  
  PotentialSparksNotifier(this._sparkService) : super(const AsyncValue.data([]));
  
  Future<void> loadPotentialSparks({
    required double latitude,
    required double longitude,
    double radiusMeters = 100,
  }) async {
    state = const AsyncValue.loading();
    
    try {
      final potentials = await _sparkService.getPotentialSparks(
        latitude: latitude,
        longitude: longitude,
        radiusMeters: radiusMeters,
      );
      
      state = AsyncValue.data(potentials);
    } catch (error, stackTrace) {
      state = AsyncValue.error(error, stackTrace);
    }
  }
  
  void clearPotentials() {
    state = const AsyncValue.data([]);
  }
}

// 스파크 필터 상태 (UI용)
final sparkFilterProvider = StateNotifierProvider<SparkFilterNotifier, SparkFilter>((ref) {
  return SparkFilterNotifier();
});

class SparkFilter {
  final SparkStatus? status;
  final DateTime? dateFrom;
  final DateTime? dateTo;
  final String? searchQuery;
  
  const SparkFilter({
    this.status,
    this.dateFrom,
    this.dateTo,
    this.searchQuery,
  });
  
  SparkFilter copyWith({
    SparkStatus? status,
    DateTime? dateFrom,
    DateTime? dateTo,
    String? searchQuery,
  }) {
    return SparkFilter(
      status: status ?? this.status,
      dateFrom: dateFrom ?? this.dateFrom,
      dateTo: dateTo ?? this.dateTo,
      searchQuery: searchQuery ?? this.searchQuery,
    );
  }
}

class SparkFilterNotifier extends StateNotifier<SparkFilter> {
  SparkFilterNotifier() : super(const SparkFilter());
  
  void updateStatus(SparkStatus? status) {
    state = state.copyWith(status: status);
  }
  
  void updateDateRange(DateTime? from, DateTime? to) {
    state = state.copyWith(dateFrom: from, dateTo: to);
  }
  
  void updateSearchQuery(String? query) {
    state = state.copyWith(searchQuery: query);
  }
  
  void reset() {
    state = const SparkFilter();
  }
}

// 필터링된 스파크 목록 (computed)
final filteredSparkListProvider = Provider<AsyncValue<List<Spark>>>((ref) {
  final sparkList = ref.watch(mySparkListProvider);
  final filter = ref.watch(sparkFilterProvider);
  
  return sparkList.when(
    data: (sparks) {
      var filtered = sparks;
      
      // 상태 필터링
      if (filter.status != null) {
        filtered = filtered.where((spark) => spark.status == filter.status).toList();
      }
      
      // 날짜 범위 필터링
      if (filter.dateFrom != null) {
        filtered = filtered.where((spark) => 
          spark.createdAt.isAfter(filter.dateFrom!)).toList();
      }
      if (filter.dateTo != null) {
        filtered = filtered.where((spark) => 
          spark.createdAt.isBefore(filter.dateTo!.add(const Duration(days: 1)))).toList();
      }
      
      // 검색어 필터링
      if (filter.searchQuery != null && filter.searchQuery!.isNotEmpty) {
        final query = filter.searchQuery!.toLowerCase();
        filtered = filtered.where((spark) =>
          spark.message?.toLowerCase().contains(query) == true ||
          spark.locationName?.toLowerCase().contains(query) == true
        ).toList();
      }
      
      return AsyncValue.data(filtered);
    },
    loading: () => const AsyncValue.loading(),
    error: (error, stackTrace) => AsyncValue.error(error, stackTrace),
  );
});

// 스파크 송신 상태 (UI 피드백용)
final sparkSendingProvider = StateProvider<bool>((ref) => false);

// 스파크 액션 헬퍼 함수들
final sparkActionsProvider = Provider<SparkActions>((ref) {
  return SparkActions(ref);
});

class SparkActions {
  final Ref _ref;
  
  SparkActions(this._ref);
  
  Future<bool> sendSpark(CreateSparkRequest request) async {
    _ref.read(sparkSendingProvider.notifier).state = true;
    
    try {
      await _ref.read(mySparkListProvider.notifier).sendSpark(request);
      return true;
    } catch (e) {
      return false;
    } finally {
      _ref.read(sparkSendingProvider.notifier).state = false;
    }
  }
  
  Future<bool> acceptSpark(String sparkId) async {
    try {
      await _ref.read(mySparkListProvider.notifier).acceptSpark(sparkId);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  Future<bool> rejectSpark(String sparkId) async {
    try {
      await _ref.read(mySparkListProvider.notifier).rejectSpark(sparkId);
      return true;
    } catch (e) {
      return false;
    }
  }
}