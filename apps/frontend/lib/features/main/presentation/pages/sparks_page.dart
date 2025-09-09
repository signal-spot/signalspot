import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'dart:async';
import 'dart:math';
import 'package:geolocator/geolocator.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/providers/spark_provider.dart';
import '../../../../shared/providers/location_provider.dart';
import '../../../../shared/providers/theme_provider.dart';
import '../../../../shared/services/location_service.dart';
import '../../../../shared/models/index.dart';
import '../../../../shared/models/spark.dart';
import '../../../../shared/models/chat.dart';
import '../../../chat/presentation/pages/chat_room_page.dart';
import '../../../../core/router/app_router.dart';
import '../../../../shared/widgets/report_block_dialog.dart';
import '../../../../shared/widgets/spark_icon.dart';
import '../../../../shared/services/profile_service.dart';
import '../../../../shared/services/user_service.dart';

// 스파크 상태를 관리하는 Provider
final sparkActiveProvider = StateProvider<bool>((ref) => false);
final selectedSparkTabProvider = StateProvider<int>((ref) => 0);
final sparkDetectionCountProvider = StateProvider<int>((ref) => 0);
final lastSparkTimeProvider = StateProvider<DateTime?>((ref) => null);

class SparksPage extends ConsumerStatefulWidget {
  const SparksPage({super.key});

  @override
  ConsumerState<SparksPage> createState() => _SparksPageState();
}

class _SparksPageState extends ConsumerState<SparksPage>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _rotateController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _rotateAnimation;
  
  Timer? _detectionTimer;
  Timer? _activeTimeTimer; // 활성 시간 업데이트용 타이머
  final Random _random = Random();
  final LocationService _locationService = LocationService();
  StreamSubscription<Position>? _locationSubscription;
  Timer? _locationUpdateTimer;

  @override
  void initState() {
    super.initState();
    
    _pulseController = AnimationController(
      duration: const Duration(seconds: 2),
      vsync: this,
    );
    _pulseAnimation = Tween<double>(
      begin: 0.8,
      end: 1.2,
    ).animate(CurvedAnimation(
      parent: _pulseController,
      curve: Curves.easeInOut,
    ));

    _rotateController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );
    _rotateAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _rotateController,
      curve: Curves.linear,
    ));
    
    // 초기 데이터 로드
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadInitialData();
    });
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // 화면에 다시 진입할 때마다 데이터 새로고침
    _loadInitialData();
  }
  
  Future<void> _loadInitialData() async {
    try {
      print('Starting initial data load...');
      
      // 내 스파크 데이터 로드
      await ref.read(mySparkListProvider.notifier).loadSparks();
      print('Sparks loaded');
      
      // 스파크 통계 로드 제거 - 프로필 페이지에서만 통계 조회
      // 대신 로컬에서 스파크 리스트를 기반으로 통계 계산
      // try {
      //   await ref.read(sparkStatsProvider.notifier).loadStats();
      //   print('Stats loaded');
      // } catch (e) {
      //   print('Failed to load stats: $e');
      // }
      
      // 위치 정보 로드
      try {
        await ref.read(currentPositionProvider.notifier).getCurrentPosition();
        
        // 위치를 가져온 후 주변 사용자 로드
        final position = ref.read(currentPositionProvider).value;
        if (position != null) {
          await ref.read(potentialSparksProvider.notifier).loadPotentialSparks(
            latitude: position.latitude,
            longitude: position.longitude,
          );
        }
      } catch (e) {
        print('Failed to load location: $e');
      }
    } catch (e) {
      print('초기 데이터 로드 실패: $e');
      // 에러가 발생해도 화면은 표시되도록 함
    }
  }

  @override
  void dispose() {
    _detectionTimer?.cancel();
    _activeTimeTimer?.cancel(); // 활성 시간 타이머 취소
    _locationSubscription?.cancel();
    _locationUpdateTimer?.cancel();
    _pulseController.dispose();
    _rotateController.dispose();
    super.dispose();
  }

  void _toggleSpark() async {
    final isActive = ref.read(sparkActiveProvider);
    
    // 햅틱 피드백
    HapticFeedback.mediumImpact();
    
    if (!isActive) {
      // 스파크 활성화
      await _activateSpark();
    } else {
      // 스파크 비활성화
      await _deactivateSpark();
    }
  }
  
  Future<void> _activateSpark() async {
    try {
      // 위치 권한 확인
      final hasPermission = await _locationService.requestLocationPermission();
      if (!hasPermission) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('위치 권한이 필요합니다. 설정에서 권한을 허용해주세요.'),
              backgroundColor: AppColors.error,
            ),
          );
        }
        return;
      }

      // 스파크 활성화 상태 업데이트
      ref.read(sparkActiveProvider.notifier).state = true;
      ref.read(lastSparkTimeProvider.notifier).state = DateTime.now();
      
      // 애니메이션 시작
      _pulseController.repeat(reverse: true);
      _rotateController.repeat();
      
      // 활성 시간 업데이트 타이머 시작 (1초마다 UI 업데이트)
      _activeTimeTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (mounted && ref.read(sparkActiveProvider)) {
          // setState를 호출하여 UI 강제 업데이트
          setState(() {});
        } else {
          timer.cancel();
        }
      });
      
      // 즉시 현재 위치 전송
      print('🎯 스파크 활성화: 초기 위치 전송 시작');
      await _locationService.updateCurrentLocation();
      print('🎯 스파크 활성화: 초기 위치 전송 완료');
      
      // 실시간 위치 추적 시작 (포그라운드 서비스로 백그라운드에서도 동작)
      print('📡 포그라운드 서비스 위치 추적 시작...');
      _locationSubscription = _locationService.getPositionStream().listen(
        (Position position) async {
          print('📍 [포그라운드 서비스] 위치 업데이트: ${position.latitude}, ${position.longitude}');
          try {
            await _locationService.recordLocation(
              CreateLocationRequest(
                latitude: position.latitude,
                longitude: position.longitude,
                accuracy: position.accuracy,
                altitude: position.altitude,
                speed: position.speed,
              ),
            );
            print('✅ [포그라운드 서비스] 위치 기록 성공');
            
            // 포그라운드 서비스에서 스파크 리스트 갱신
            if (!mounted) {
              print('🔄 [포그라운드 서비스] 스파크 리스트 갱신 시도');
            }
          } catch (e) {
            print('❌ [포그라운드 서비스] 위치 기록 실패: $e');
          }
        },
        onError: (error) {
          print('❌ [백그라운드] 위치 추적 에러: $error');
        },
        cancelOnError: false, // 에러가 발생해도 스트림 계속 유지
      );
      
      // 앱이 포그라운드에 있을 때만 60초마다 위치 업데이트
      _locationUpdateTimer = Timer.periodic(
        const Duration(seconds: 60),
        (timer) async {
          if (ref.read(sparkActiveProvider) && mounted) {
            print('⏰ [포그라운드] 정기 위치 업데이트 시작');
            await _locationService.updateCurrentLocation();
            print('⏰ [포그라운드] 정기 위치 업데이트 완료');
            
            // 스파크 리스트 새로고침 (앱이 포그라운드에 있을 때만)
            if (mounted) {
              await ref.read(mySparkListProvider.notifier).refresh();
            }
          } else {
            // 스파크가 비활성화되면 타이머 중지
            timer.cancel();
          }
        },
      );
      
      // 스파크 감지 시뮬레이션 시작
      _startSparkDetection();
      
      // 자동 종료 없음 - 사용자가 수동으로 끄거나 앱 종료시까지 유지
      // 앱이 백그라운드로 가도 위치 추적 계속 (iOS는 별도 설정 필요)
      
      // 성공 피드백
      HapticFeedback.heavyImpact();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const SparkIcon(size: 20),
                const SizedBox(width: 8),
                const Text('스파크가 활성화되었습니다! 위치 추적 중...'),
              ],
            ),
            backgroundColor: AppColors.success,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      print('❌ 스파크 활성화 실패: $e');
      
      // 실패 시 상태 롤백
      ref.read(sparkActiveProvider.notifier).state = false;
      _pulseController.stop();
      _rotateController.stop();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('스파크 활성화 실패: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }
  
  Future<void> _deactivateSpark() async {
    // 위치 추적 중지
    _locationSubscription?.cancel();
    _locationUpdateTimer?.cancel();
    
    // 스파크 비활성화
    ref.read(sparkActiveProvider.notifier).state = false;
    
    // 애니메이션 중지
    _pulseController.stop();
    _rotateController.stop();
    
    // 타이머 중지
    _detectionTimer?.cancel();
    _activeTimeTimer?.cancel(); // 활성 시간 타이머 중지
    
    print('🛑 스파크 비활성화: 위치 추적 중지');
    
    // 피드백
    HapticFeedback.lightImpact();
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('스파크가 비활성화되었습니다'),
          backgroundColor: AppColors.grey600,
          duration: const Duration(seconds: 1),
        ),
      );
    }
  }
  
  Future<void> _checkPermissions() async {
    // 위치 권한 체크 시뮬레이션
    await Future.delayed(const Duration(milliseconds: 500));
    
    // 임시로 항상 허용된 것으로 처리
    // 실제 구현 시에는 permission_handler 패키지 사용
  }
  
  void _startSparkDetection() {
    // 10-30초마다 새로운 스파크 감지 시뮬레이션
    _detectionTimer = Timer.periodic(Duration(seconds: 15 + _random.nextInt(15)), (timer) {
      if (ref.read(sparkActiveProvider)) {
        _simulateSparkDetection();
      } else {
        timer.cancel();
      }
    });
  }
  
  void _simulateSparkDetection() async {
    // 스파크 리스트 새로고침
    await ref.read(mySparkListProvider.notifier).refresh();
    
    // 햅틱 피드백
    HapticFeedback.lightImpact();
    
    // 새로운 스파크가 있는지 확인
    final sparks = ref.read(mySparkListProvider).valueOrNull ?? [];
    final newSparks = sparks.where((s) => 
      s.direction == SparkDirection.received && 
      s.status == SparkStatus.pending
    ).toList();
    
    if (newSparks.isNotEmpty && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.notifications, color: Colors.white, size: 16),
              const SizedBox(width: 8),
              Text('${newSparks.length}개의 새로운 스파크!'),
            ],
          ),
          backgroundColor: AppColors.sparkActive,
          behavior: SnackBarBehavior.floating,
          action: SnackBarAction(
            label: '확인',
            textColor: Colors.white,
            onPressed: () {
              // 새로운 탭으로 이동
              ref.read(selectedSparkTabProvider.notifier).state = 0;
            },
          ),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final isSparkActive = ref.watch(sparkActiveProvider);
    final selectedTab = ref.watch(selectedSparkTabProvider);
    final timeBasedGradient = ref.watch(timeBasedGradientProvider);

    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: PreferredSize(
        preferredSize: const Size.fromHeight(60),
        child: Container(
          decoration: BoxDecoration(
            gradient: timeBasedGradient,
          ),
          child: SafeArea(
            child: Padding(
              padding: const EdgeInsets.symmetric(
                horizontal: AppSpacing.lg,
                vertical: AppSpacing.sm,
              ),
              child: Row(
                children: [
                  // 스파크 아이콘
                  Container(
                    width: 40,
                    height: 40,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [
                          AppColors.sparkActive,
                          AppColors.sparkActive.withOpacity(0.7),
                        ],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.sparkActive.withOpacity(0.3),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: const SparkIcon(
                      size: 24,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Flexible(
                          child: Text(
                            '스파크',
                            style: AppTextStyles.titleLarge.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppColors.white,
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        Flexible(
                          child: Text(
                            '주변 사람들과 연결하기',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.white.withOpacity(0.9),
                            ),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                      ],
                    ),
                  ),
                  // 새로고침 버튼
                  IconButton(
                    onPressed: _loadInitialData,
                    icon: Icon(
                      Icons.refresh,
                      color: AppColors.white,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: () async {
          await _loadInitialData();
        },
        child: SingleChildScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          child: Column(
            children: [
              // 스파크 메인 버튼 영역
              Container(
                padding: const EdgeInsets.all(AppSpacing.xxl),
                child: Column(
              children: [
                // 메인 스파크 버튼
                GestureDetector(
                  onTap: _toggleSpark,
                  child: Container(
                    width: 160,
                    height: 160,
                    decoration: BoxDecoration(
                      color: isSparkActive
                          ? AppColors.sparkActive
                          : AppColors.grey400,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: isSparkActive
                              ? AppColors.sparkActive.withOpacity(0.4)
                              : AppColors.black.withOpacity(0.1),
                          blurRadius: isSparkActive ? 20 : 8,
                          spreadRadius: isSparkActive ? 5 : 0,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: isSparkActive 
                        ? const SparkIcon(
                            size: 60,
                          )
                        : Icon(
                            Icons.bolt,
                            size: 60,
                            color: AppColors.grey600,
                          ),
                  ),
                ),
                
                const SizedBox(height: AppSpacing.lg),
                
                // 상태 텍스트
                Text(
                  isSparkActive ? '스파크 감지 중...' : '스파크를 시작하려면 탭하세요',
                  style: AppTextStyles.titleMedium.copyWith(
                    fontWeight: FontWeight.w600,
                    color: isSparkActive ? AppColors.sparkActive : AppColors.textSecondary,
                  ),
                  textAlign: TextAlign.center,
                ),
                
                // 스파크 설명 텍스트 (비활성화 상태일 때)
                if (!isSparkActive) ...[
                  const SizedBox(height: AppSpacing.md),
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.sparkActive.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                      border: Border.all(
                        color: AppColors.sparkActive.withOpacity(0.1),
                      ),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.info_outline,
                              size: 16,
                              color: AppColors.sparkActive.withOpacity(0.7),
                            ),
                            const SizedBox(width: AppSpacing.xs),
                            Text(
                              '스파크란?',
                              style: AppTextStyles.labelMedium.copyWith(
                                color: AppColors.sparkActive,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          '스파크를 활성화하면 주변 사용자들과\n실시간으로 매칭될 수 있습니다.\n서로 스파크를 보내면 채팅이 시작됩니다.',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                            height: 1.5,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ],
                
                if (isSparkActive) ...[
                  const SizedBox(height: AppSpacing.sm),
                  Consumer(
                    builder: (context, ref, child) {
                      final detectionCount = ref.watch(sparkDetectionCountProvider);
                      final lastTime = ref.watch(lastSparkTimeProvider);
                      
                      String timeString = '0초';
                      if (lastTime != null) {
                        final elapsed = DateTime.now().difference(lastTime);
                        final hours = elapsed.inHours;
                        final minutes = elapsed.inMinutes % 60;
                        final seconds = elapsed.inSeconds % 60;
                        
                        if (hours > 0) {
                          timeString = '${hours}시간 ${minutes}분';
                        } else if (minutes > 0) {
                          timeString = '${minutes}분 ${seconds}초';
                        } else {
                          timeString = '${seconds}초';
                        }
                      }
                      
                      return Text(
                        '활성 시간: $timeString • 감지: ${detectionCount}회',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w500,
                        ),
                        textAlign: TextAlign.center,
                      );
                    },
                  ),
                ],
                ],
              ),
            ),
            
            // 탭 구분
            Container(
              margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              decoration: BoxDecoration(
                color: AppColors.grey100,
                borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
              ),
              child: Consumer(
                builder: (context, ref, child) {
                  final mySparkList = ref.watch(mySparkListProvider);
                  
                  return Row(
                    children: [
                      _buildTabButton('새로운', 0, _getNewSparksCount(mySparkList)),
                      _buildTabButton('대기중', 1, _getPendingSparksCount(mySparkList)),
                      _buildTabButton('매칭됨', 2, _getMatchedSparksCount(mySparkList)),
                    ],
                  );
                },
              ),
            ),
            
            const SizedBox(height: AppSpacing.lg),
            
            // 스파크 리스트
            _buildSparkList(selectedTab),
            
            // 하단 여백
            const SizedBox(height: AppSpacing.xxl),
          ],
        ),
      ),
    ),
    );
  }

  Widget _buildTabButton(String title, int index, int count) {
    final selectedTab = ref.watch(selectedSparkTabProvider);
    final isSelected = selectedTab == index;
    
    return Expanded(
      child: GestureDetector(
        onTap: () {
          ref.read(selectedSparkTabProvider.notifier).state = index;
        },
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
          decoration: BoxDecoration(
            color: isSelected ? AppColors.primary : Colors.transparent,
            borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(
                title,
                style: AppTextStyles.labelLarge.copyWith(
                  color: isSelected ? AppColors.white : AppColors.grey600,
                  fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                ),
              ),
              if (count > 0) ...[
                const SizedBox(width: AppSpacing.xs),
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.xs,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected 
                        ? AppColors.white.withOpacity(0.3)
                        : AppColors.primary,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(
                    count.toString(),
                    style: AppTextStyles.labelSmall.copyWith(
                      color: isSelected ? AppColors.white : AppColors.white,
                      fontSize: 10,
                    ),
                  ),
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSparkList(int tabIndex) {
    return Consumer(
      builder: (context, ref, child) {
        final mySparkList = ref.watch(mySparkListProvider);
        
        return mySparkList.when(
          loading: () => Container(
            height: 200,
            alignment: Alignment.center,
            child: const CircularProgressIndicator(),
          ),
          error: (error, _) => Container(
            padding: const EdgeInsets.all(AppSpacing.xl),
            child: Column(
              children: [
                const Icon(Icons.error_outline, color: AppColors.error, size: 64),
                const SizedBox(height: AppSpacing.md),
                Text(
                  '데이터를 불러올 수 없습니다',
                  style: TextStyle(
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                ElevatedButton(
                  onPressed: () => _loadInitialData(),
                  child: const Text('다시 시도'),
                ),
              ],
            ),
          ),
          data: (sparks) {
            final filteredSparks = _filterSparksByTab(sparks, tabIndex);
            
            if (filteredSparks.isEmpty) {
              return Container(
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.xxl),
                child: Column(
                  children: [
                    Icon(
                      Icons.bolt_outlined,
                      size: 64,
                      color: AppColors.grey400,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      _getEmptyMessage(tabIndex),
                      style: AppTextStyles.bodyLarge.copyWith(
                        color: AppColors.grey500,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              );
            }
            
            return ListView.separated(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              itemCount: filteredSparks.length,
              separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.md),
              itemBuilder: (context, index) {
                return _SparkRealCard(spark: filteredSparks[index]);
              },
            );
          },
        );
      },
    );
  }
  
  List<Spark> _filterSparksByTab(List<Spark> sparks, int tabIndex) {
    switch (tabIndex) {
      case 0: // 새로운
        return sparks.where((spark) => 
          spark.status == SparkStatus.pending && 
          spark.direction == SparkDirection.received
        ).toList();
      case 1: // 대기중
        return sparks.where((spark) => 
          spark.status == SparkStatus.pending && 
          spark.direction == SparkDirection.sent
        ).toList();
      case 2: // 매칭됨
        return sparks.where((spark) => 
          spark.status == SparkStatus.accepted
        ).toList();
      default:
        return [];
    }
  }
  
  int _getNewSparksCount(AsyncValue<List<Spark>> sparkList) {
    return sparkList.when(
      data: (sparks) => _filterSparksByTab(sparks, 0).length,
      loading: () => 0,
      error: (_, __) => 0,
    );
  }
  
  int _getPendingSparksCount(AsyncValue<List<Spark>> sparkList) {
    return sparkList.when(
      data: (sparks) => _filterSparksByTab(sparks, 1).length,
      loading: () => 0,
      error: (_, __) => 0,
    );
  }
  
  int _getMatchedSparksCount(AsyncValue<List<Spark>> sparkList) {
    return sparkList.when(
      data: (sparks) => _filterSparksByTab(sparks, 2).length,
      loading: () => 0,
      error: (_, __) => 0,
    );
  }

  String _getEmptyMessage(int tabIndex) {
    switch (tabIndex) {
      case 0:
        return '아직 새로운 스파크가 없어요\n스파크를 활성화해보세요!';
      case 1:
        return '대기 중인 스파크가 없어요';
      case 2:
        return '매칭된 스파크가 없어요\n새로운 인연을 만들어보세요!';
      default:
        return '';
    }
  }
}

// 실제 Spark 데이터를 사용하는 카드
class _SparkRealCard extends ConsumerWidget {
  final Spark spark;

  const _SparkRealCard({required this.spark});

  @override
  Widget build(BuildContext context, WidgetRef ref) {

    print("other user nickname");
    print(spark.otherUserNickname);

    return GestureDetector(
      onTap: () {
        context.push(AppRouter.sparkMessageDetail(spark.id));
      },
      child: Container(
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
          boxShadow: [
            BoxShadow(
              color: AppColors.black.withOpacity(0.05),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Padding(
        padding: const EdgeInsets.all(AppSpacing.md),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 헤더 - 프로필 정보 추가
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Row(
                    children: [
                      // 프로필 이미지
                      CircleAvatar(
                        radius: 24,
                        backgroundColor: AppColors.primary.withOpacity(0.1),
                        backgroundImage: spark.otherUserAvatar != null && spark.otherUserAvatar!.isNotEmpty
                          ? NetworkImage(spark.otherUserAvatar!)
                          : null,
                        child: spark.otherUserAvatar == null || spark.otherUserAvatar!.isEmpty
                          ? Text(
                              (spark.otherUserNickname ?? '?')[0].toUpperCase(),
                              style: AppTextStyles.titleMedium.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.bold,
                              ),
                            )
                          : null,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      // 닉네임과 스파크 정보
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              spark.otherUserNickname ?? "익명",
                              style: AppTextStyles.titleMedium.copyWith(
                                fontWeight: FontWeight.w600,
                                color: AppColors.textPrimary,
                              ),
                            ),
                            Text(
                              spark.type == SparkType.manual 
                                ? (spark.direction == SparkDirection.sent 
                                    ? '직접 보낸 스파크'
                                    : '직접 받은 스파크')
                                : spark.type == SparkType.proximity
                                    ? '${_getLocationText(spark)}에서 만남'
                                    : _getSparkTypeText(spark.type),
                              style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.grey500,
                              ),
                            ),
                            Text(
                              _formatTimeAgo(spark.createdAt),
                              style: AppTextStyles.labelSmall.copyWith(
                                color: AppColors.grey400,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                // 상태 표시 및 메뉴 버튼
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.sm,
                        vertical: AppSpacing.xs,
                      ),
                      decoration: BoxDecoration(
                        color: _getStatusColor(spark.status).withOpacity(0.1),
                        borderRadius: BorderRadius.circular(AppSpacing.borderRadiusXl),
                      ),
                      child: Text(
                        _getStatusText(spark.status),
                        style: AppTextStyles.labelMedium.copyWith(
                          color: _getStatusColor(spark.status),
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    // 더보기 메뉴 (프로필 보기, 신고, 차단)
                    PopupMenuButton<String>(
                      icon: const Icon(Icons.more_vert, size: 20),
                      padding: EdgeInsets.zero,
                      constraints: const BoxConstraints(),
                      onSelected: (value) {
                        // 상대방 ID 가져오기
                        final otherUserId = spark.direction == SparkDirection.sent 
                          ? spark.user2Id 
                          : spark.user1Id;
                        
                        switch (value) {
                          case 'profile':
                            // 프로필 보기 다이얼로그
                            showDialog(
                              context: context,
                              builder: (BuildContext context) {
                                return _ProfileViewDialog(
                                  userId: otherUserId ?? '',
                                  userName: spark.otherUserNickname ?? '사용자',
                                );
                              },
                            );
                            break;
                          case 'report':
                            // 바로 신고 다이얼로그 표시
                            showReportDialog(
                              context: context,
                              ref: ref,
                              userId: otherUserId ?? '',
                              userName: spark.otherUserNickname ?? '사용자',
                              contextType: 'spark',
                              contextId: spark.id,
                            );
                            break;
                          case 'block':
                            // 바로 차단 다이얼로그 표시
                            showBlockDialog(
                              context: context,
                              ref: ref,
                              userId: otherUserId ?? '',
                              userName: spark.otherUserNickname ?? '사용자',
                            );
                            break;
                        }
                      },
                      itemBuilder: (BuildContext context) => [
                        const PopupMenuItem<String>(
                          value: 'profile',
                          child: Row(
                            children: [
                              Icon(Icons.person, size: 18),
                              SizedBox(width: 8),
                              Text('프로필 보기'),
                            ],
                          ),
                        ),
                        const PopupMenuItem<String>(
                          value: 'report',
                          child: Row(
                            children: [
                              Icon(Icons.flag, size: 18, color: Colors.orange),
                              SizedBox(width: 8),
                              Text('신고하기'),
                            ],
                          ),
                        ),
                        const PopupMenuItem<String>(
                          value: 'block',
                          child: Row(
                            children: [
                              Icon(Icons.block, size: 18, color: Colors.red),
                              SizedBox(width: 8),
                              Text('차단하기'),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ],
            ),
            
            const SizedBox(height: AppSpacing.md),
            
            // 상세 정보
            Row(
              children: [
                // 스파크 타입 아이콘
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.xs,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: _getSparkTypeColor(spark.type).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppSpacing.borderRadiusSm),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(
                        _getSparkTypeIcon(spark.type),
                        size: 14,
                        color: _getSparkTypeColor(spark.type),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        spark.type == SparkType.proximity && spark.distance != null
                          ? '${spark.distance!.toStringAsFixed(0)}m'
                          : _getSparkTypeLabel(spark.type),
                        style: AppTextStyles.labelSmall.copyWith(
                          color: _getSparkTypeColor(spark.type),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                // 시간 정보
                Icon(
                  Icons.schedule,
                  size: 14,
                  color: AppColors.grey400,
                ),
                const SizedBox(width: 4),
                Text(
                  _getSparkDuration(spark),
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.grey500,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: AppSpacing.sm),
            
            // 메시지 및 추가 정보
            if (spark.message != null && spark.message!.isNotEmpty) ...[
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  color: AppColors.grey50,
                  borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                ),
                child: Text(
                  spark.message!,
                  style: AppTextStyles.bodySmall.copyWith(
                    fontStyle: FontStyle.italic,
                    color: AppColors.textPrimary,
                  ),
                ),
              ),
            ],
            
            const SizedBox(height: AppSpacing.md),
            
            // 액션 버튼
            _buildActionButtons(context, ref, spark),
          ],
        ),
        ),
      ),
    );
  }

  Widget _buildActionButtons(BuildContext context, WidgetRef ref, Spark spark) {
    // proximity 또는 automatic 스파크 - 양방향 수락 필요
    if (spark.type == SparkType.proximity || spark.type == SparkType.automatic) {
      if (spark.status == SparkStatus.pending) {
        // 내가 이미 수락한 경우
        if (spark.myAccepted) {
          return Container(
            padding: const EdgeInsets.all(AppSpacing.sm),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  Icons.check_circle,
                  color: AppColors.primary,
                  size: 20,
                ),
                const SizedBox(width: AppSpacing.xs),
                Text(
                  '내 수락 완료 - ${spark.otherUserNickname ?? "상대방"} 응답 대기 중',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.primary,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],
            ),
          );
        } 
        // 상대방이 수락하고 나를 기다리는 경우
        else if (spark.otherAccepted) {
          return Column(
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.xs),
                decoration: BoxDecoration(
                  color: AppColors.sparkActive.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(AppSpacing.borderRadiusSm),
                ),
                child: Text(
                  '${spark.otherUserNickname ?? "상대방"}님이 먼저 수락했어요! 💫',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.sparkActive,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.xs),
              Row(
                children: [
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () async {
                        await ref.read(sparkActionsProvider).rejectSpark(spark.id);
                      },
                      child: const Text('거절'),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: () async {
                        await ref.read(sparkActionsProvider).acceptSpark(spark.id);
                      },
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.sparkActive,
                      ),
                      child: const Text('나도 수락!'),
                    ),
                  ),
                ],
              ),
            ],
          );
        }
        // 둘 다 아직 응답하지 않은 경우
        else {
          return Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () async {
                    await ref.read(sparkActionsProvider).rejectSpark(spark.id);
                  },
                  child: const Text('거절'),
                ),
              ),
              const SizedBox(width: AppSpacing.sm),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  onPressed: () async {
                    await ref.read(sparkActionsProvider).acceptSpark(spark.id);
                  },
                  child: const Text('수락'),
                ),
              ),
            ],
          );
        }
      }
    }
    // manual 스파크 - 단방향 수락
    else if (spark.type == SparkType.manual) {
      if (spark.direction == SparkDirection.received && spark.status == SparkStatus.pending) {
        // 받은 스파크 - 수락/거절 버튼
        return Row(
          children: [
            Expanded(
              child: OutlinedButton(
                onPressed: () async {
                  await ref.read(sparkActionsProvider).rejectSpark(spark.id);
                },
                child: const Text('거절'),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
            Expanded(
              flex: 2,
              child: ElevatedButton(
                onPressed: () async {
                  await ref.read(sparkActionsProvider).acceptSpark(spark.id);
                },
                child: const Text('수락'),
              ),
            ),
          ],
        );
      } else if (spark.direction == SparkDirection.sent && spark.status == SparkStatus.pending) {
        // 보낸 스파크 - 대기 중
        return Container(
          padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
          decoration: BoxDecoration(
            color: AppColors.grey100,
            borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
          ),
          child: Text(
            '응답 대기 중...',
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.grey600,
            ),
            textAlign: TextAlign.center,
          ),
        );
      }
    }
    
    // 매칭 완료된 경우
    if (spark.status == SparkStatus.accepted || spark.status == SparkStatus.matched) {
      // 매칭됨 - 채팅 시작
      return ElevatedButton(
        onPressed: () {
          Navigator.of(context).push(
            MaterialPageRoute(
              builder: (context) => ChatRoomPage(
                roomId: 'spark_${spark.id}',
                roomName: '스파크 매칭',
                otherParticipant: ChatParticipant(
                  id: 'spark_user_${spark.id}',
                  nickname: '스파크 매칭',
                  avatarUrl: null,
                ),
              ),
            ),
          );
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: AppColors.success,
        ),
        child: const Text('채팅 시작하기'),
      );
    }
    
    return const SizedBox.shrink();
  }
  
  Color _getStatusColor(SparkStatus status) {
    switch (status) {
      case SparkStatus.pending:
        return AppColors.sparkActive;
      case SparkStatus.accepted:
        return AppColors.success;
      case SparkStatus.rejected:
        return AppColors.error;
      case SparkStatus.expired:
        return AppColors.grey500;
      case SparkStatus.matched:
        return AppColors.primary;
    }
  }
  
  String _getStatusText(SparkStatus status) {
    switch (status) {
      case SparkStatus.pending:
        return '대기중';
      case SparkStatus.accepted:
        return '수락됨';
      case SparkStatus.rejected:
        return '거절됨';
      case SparkStatus.expired:
        return '만료';
      case SparkStatus.matched:
        return '매칭됨';
    }
  }
  
  String _getLocationText(Spark spark) {
    // locationName이 있고 '알 수 없는 위치'가 아니면 사용
    if (spark.locationName != null && spark.locationName != '알 수 없는 위치') {
      return spark.locationName!;
    }
    
    // 좌표가 있으면 근처 위치로 표시
    if (spark.latitude != null && spark.longitude != null) {
      // 거리 정보가 있으면 함께 표시
      if (spark.distance != null && spark.distance! > 0) {
        final distanceText = spark.distance! < 1 
          ? '${(spark.distance! * 1000).toStringAsFixed(0)}m' 
          : '${spark.distance!.toStringAsFixed(1)}km';
        return '근처 위치 ($distanceText)';
      }
      return '근처 위치';
    }
    
    // 기본값
    return '알 수 없는 위치';
  }
  
  String _getSparkTypeText(SparkType type) {
    switch (type) {
      case SparkType.automatic:
        return '자동 스파크';
      case SparkType.proximity:
        return '근접 스파크';
      case SparkType.manual:
        return '수동 스파크';
      default:
        return '스파크';
    }
  }
  
  IconData _getSparkTypeIcon(SparkType type) {
    switch (type) {
      case SparkType.automatic:
        return Icons.auto_awesome;
      case SparkType.proximity:
        return Icons.near_me;
      case SparkType.manual:
        return Icons.send;
      default:
        return Icons.flash_on;
    }
  }
  
  Color _getSparkTypeColor(SparkType type) {
    switch (type) {
      case SparkType.automatic:
        return AppColors.primary;
      case SparkType.proximity:
        return AppColors.sparkActive;  // 근접 스파크는 활성 스파크 색상 사용
      case SparkType.manual:
        return AppColors.secondary;
      default:
        return AppColors.grey500;
    }
  }
  
  String _getSparkTypeLabel(SparkType type) {
    switch (type) {
      case SparkType.automatic:
        return '자동';
      case SparkType.proximity:
        return '근접';
      case SparkType.manual:
        return '수동';
      default:
        return '스파크';
    }
  }
  
  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inMinutes < 1) {
      return '방금 전';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}분 전';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}시간 전';
    } else {
      return '${difference.inDays}일 전';
    }
  }
  
  String _getSparkDuration(Spark spark) {
    if (spark.expiresAt != null) {
      final remaining = spark.expiresAt!.difference(DateTime.now());
      if (remaining.isNegative) {
        return '만료됨';
      } else if (remaining.inHours > 0) {
        return '${remaining.inHours}시간 남음';
      } else {
        return '${remaining.inMinutes}분 남음';
      }
    }
    return '영구';
  }

}

// 프로필 보기 다이얼로그
class _ProfileViewDialog extends StatefulWidget {
  final String userId;
  final String userName;

  const _ProfileViewDialog({
    required this.userId,
    required this.userName,
  });

  @override
  State<_ProfileViewDialog> createState() => _ProfileViewDialogState();
}

class _ProfileViewDialogState extends State<_ProfileViewDialog> {
  final ProfileService _profileService = ProfileService();
  Map<String, dynamic>? _profile;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final profile = await _profileService.getUserProfile(widget.userId);
      if (mounted) {
        setState(() {
          _profile = {
            'nickname': profile.displayName ?? widget.userName,
            'bio': profile.bio,
            'avatarUrl': profile.avatarUrl,
            'signatureConnection': profile.signatureConnection,
          };
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error loading profile: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
      ),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        constraints: const BoxConstraints(maxWidth: 400),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 헤더
            Row(
              children: [
                // 프로필 이미지
                CircleAvatar(
                  radius: 30,
                  backgroundColor: AppColors.primary.withOpacity(0.1),
                  backgroundImage: _profile?['avatarUrl'] != null 
                    ? NetworkImage(_profile!['avatarUrl'])
                    : null,
                  child: _profile?['avatarUrl'] == null
                    ? Text(
                        widget.userName.isNotEmpty ? widget.userName[0].toUpperCase() : '?',
                        style: AppTextStyles.headlineMedium.copyWith(
                          color: AppColors.primary,
                        ),
                      )
                    : null,
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _profile?['nickname'] ?? widget.userName,
                        style: AppTextStyles.titleLarge.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (_profile?['bio'] != null && _profile!['bio']!.isNotEmpty)
                        Text(
                          _profile!['bio']!,
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.grey600,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            
            const SizedBox(height: AppSpacing.lg),
            
            // 로딩 중
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(),
              )
            // 프로필 정보
            else if (_profile != null && _profile!['signatureConnection'] != null) ...[
              // 시그니처 커넥션 정보
              Container(
                decoration: BoxDecoration(
                  color: AppColors.grey50,
                  borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                ),
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '시그니처 커넥션',
                      style: AppTextStyles.titleMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    
                    // MBTI
                    if (_profile!['signatureConnection'].mbti != null) ...[
                      _buildInfoRow(Icons.psychology, 'MBTI', _profile!['signatureConnection'].mbti!),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 관심사
                    if (_profile!['signatureConnection'].interests != null && 
                        _profile!['signatureConnection'].interests!.isNotEmpty) ...[
                      _buildInfoRow(
                        Icons.interests, 
                        '관심사', 
                        _profile!['signatureConnection'].interests!.join(', ')
                      ),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 인생 영화
                    if (_profile!['signatureConnection'].lifeMovie != null) ...[
                      _buildInfoRow(Icons.movie, '인생 영화', _profile!['signatureConnection'].lifeMovie!),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 좋아하는 아티스트
                    if (_profile!['signatureConnection'].favoriteArtist != null) ...[
                      _buildInfoRow(Icons.music_note, '좋아하는 아티스트', _profile!['signatureConnection'].favoriteArtist!),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 기억에 남는 장소
                    if (_profile!['signatureConnection'].memorablePlace != null) ...[
                      _buildInfoRow(
                        Icons.place, 
                        '기억에 남는 장소', 
                        _profile!['signatureConnection'].memorablePlace!
                      ),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 어린 시절 추억
                    if (_profile!['signatureConnection'].childhoodMemory != null) ...[
                      _buildInfoRow(
                        Icons.child_care, 
                        '어린 시절 추억', 
                        _profile!['signatureConnection'].childhoodMemory!
                      ),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 인생의 전환점
                    if (_profile!['signatureConnection'].turningPoint != null) ...[
                      _buildInfoRow(Icons.change_circle, '인생의 전환점', _profile!['signatureConnection'].turningPoint!),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 가장 자랑스러운 순간
                    if (_profile!['signatureConnection'].proudestMoment != null) ...[
                      _buildInfoRow(Icons.star, '가장 자랑스러운 순간', _profile!['signatureConnection'].proudestMoment!),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 버킷리스트
                    if (_profile!['signatureConnection'].bucketList != null) ...[
                      _buildInfoRow(Icons.checklist, '버킷리스트', _profile!['signatureConnection'].bucketList!),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 인생 교훈
                    if (_profile!['signatureConnection'].lifeLesson != null) ...[
                      _buildInfoRow(
                        Icons.school, 
                        '인생 교훈', 
                        _profile!['signatureConnection'].lifeLesson!
                      ),
                    ],
                  ],
                ),
              ),
            ]
            // 프로필 정보 없음
            else
              Center(
                child: Text(
                  '프로필 정보를 불러올 수 없습니다',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.grey600,
                  ),
                ),
              ),
            
            const SizedBox(height: AppSpacing.lg),
            
            // 닫기 버튼
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                  ),
                ),
                child: const Text('닫기'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 16,
          color: AppColors.grey600,
        ),
        const SizedBox(width: AppSpacing.xs),
        Expanded(
          child: RichText(
            text: TextSpan(
              style: AppTextStyles.bodySmall,
              children: [
                TextSpan(
                  text: '$label: ',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
                TextSpan(
                  text: value,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}