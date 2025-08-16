import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/providers/signal_provider.dart';
import '../../../../shared/providers/spark_provider.dart';
import '../../../../shared/providers/location_provider.dart';
import '../../../../shared/providers/notification_provider.dart';
import '../../../../shared/providers/theme_provider.dart';
import '../../../../shared/models/index.dart';
import 'main_navigation.dart';
import '../../../../shared/widgets/spark_icon.dart';

class HomePage extends ConsumerStatefulWidget {
  const HomePage({super.key});

  @override
  ConsumerState<HomePage> createState() => _HomePageState();
}

class _HomePageState extends ConsumerState<HomePage> {
  final ScrollController _scrollController = ScrollController();

  @override
  void initState() {
    super.initState();
    // 초기 데이터 로드
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadInitialData();
    });
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _loadInitialData() async {
    try {
      // 현재 위치 가져오기
      await ref.read(currentPositionProvider.notifier).getCurrentPosition();
      
      // 위치를 가져온 후 주변 데이터 로드
      final position = ref.read(currentPositionProvider).value;
      print('Current position: ${position?.latitude}, ${position?.longitude}');
      
      if (position != null) {
        print('Loading nearby spots with position: ${position.latitude}, ${position.longitude}');
        // 주변 Signal Spots 로드
        ref.read(nearbySignalSpotsProvider.notifier).loadNearbySpots(
          latitude: position.latitude,
          longitude: position.longitude,
        );
      } else {
        print('No position available, using default Seoul location');
        // 위치가 없으면 서울 시청을 기본 위치로 사용
        ref.read(nearbySignalSpotsProvider.notifier).loadNearbySpots(
          latitude: 37.5665,
          longitude: 126.9780,
        );
      }
      
      // 인기 Signal Spots 로드
      ref.read(popularSignalSpotsProvider.notifier).loadPopularSpots();
      
      // 스파크 데이터 로드
      ref.read(mySparkListProvider.notifier).loadSparks();
      // sparkStatsProvider는 이제 자동 계산되므로 loadStats 호출 불필요
      // ref.read(sparkStatsProvider.notifier).loadStats();
      
      // 알림 데이터 로드
      ref.read(notificationListProvider.notifier).loadNotifications();
    } catch (e) {
      print('초기 데이터 로드 실패: $e');
      print('Stack trace: ${StackTrace.current}');
    }
  }

  Future<void> _refreshData() async {
    await _loadInitialData();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      body: RefreshIndicator(
        onRefresh: _refreshData,
        child: Column(
          children: [
            // 헤더
            _buildHeader(),
            
            // 스크롤 가능한 콘텐츠
            Expanded(
              child: SingleChildScrollView(
                controller: _scrollController,
                child: Column(
                  children: [
                    const SizedBox(height: AppSpacing.md),
                    
                    // 오늘의 스파크 요약
                    _buildTodaysSparkSection(),
                    
                    const SizedBox(height: AppSpacing.xl),
                    
                    // HOT 시그널 스팟
                    _buildHotSpotsSection(),
                    
                    const SizedBox(height: AppSpacing.xl),
                    
                    // 내 주변 새 쪽지
                    _buildNearbyMessagesSection(),
                    
                    const SizedBox(height: AppSpacing.xxl),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    final timeBasedGradient = ref.watch(timeBasedGradientProvider);
    return Container(
      decoration: BoxDecoration(
        gradient: timeBasedGradient,
      ),
      child: SafeArea(
        bottom: false,
        child: Container(
          height: 100,
          padding: const EdgeInsets.fromLTRB(
            AppSpacing.lg,
            AppSpacing.md,
            AppSpacing.lg,
            AppSpacing.md,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
                  Text(
                    _getGreetingMessage(),
                    style: AppTextStyles.headlineMedium.copyWith(
                      color: AppColors.white,
                      fontWeight: FontWeight.w700,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    '새로운 인연이 기다리고 있어요',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.white.withOpacity(0.9),
                    ),
                  ),
                ],
              ),
              GestureDetector(
                onTap: () {
                  // 알림 페이지로 이동
                  if (mounted) {
                    context.push('/notifications');
                  }
                },
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: AppColors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(
                      AppSpacing.borderRadiusMd,
                    ),
                  ),
                  child: Stack(
                    children: [
                      const Icon(
                        Icons.notifications_outlined,
                        color: AppColors.white,
                        size: AppSpacing.iconMd,
                      ),
                      // 알림 뱃지 - 읽지 않은 알림이 있을 때만 표시
                      Consumer(
                        builder: (context, ref, _) {
                          final showBadge = ref.watch(showNotificationBadgeProvider);
                          final unreadCount = ref.watch(unreadNotificationCountProvider);
                          
                          if (!showBadge) return const SizedBox.shrink();
                          
                          return Positioned(
                            right: 0,
                            top: 0,
                            child: Container(
                              width: unreadCount.maybeWhen(
                                data: (count) => count > 9 ? 16 : 8,
                                orElse: () => 8,
                              ),
                              height: 8,
                              decoration: const BoxDecoration(
                                color: AppColors.error,
                                shape: BoxShape.circle,
                              ),
                              child: unreadCount.maybeWhen(
                                data: (count) => count > 9
                                    ? Center(
                                        child: Text(
                                          '9+',
                                          style: AppTextStyles.labelSmall.copyWith(
                                            color: AppColors.white,
                                            fontSize: 6,
                                          ),
                                        ),
                                      )
                                    : null,
                                orElse: () => null,
                              ),
                            ),
                          );
                        },
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTodaysSparkSection() {
    final sparkStats = ref.watch(sparkStatsProvider);
    final sparksAsync = ref.watch(mySparkListProvider);
    final sparkList = ref.watch(mySparkListProvider);
    
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '오늘의 스파크',
                style: AppTextStyles.titleLarge.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              TextButton(
                onPressed: () {
                  // 스파크 탭으로 전환
                  if (mounted) {
                    ref.read(selectedTabProvider.notifier).state = 2;
                  }
                },
                child: const Text('전체보기'),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.white,
              borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
              border: Border.all(color: AppColors.grey200),
              boxShadow: [
                BoxShadow(
                  color: AppColors.black.withOpacity(0.04),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: sparksAsync.when(
              loading: () => const Center(
                child: CircularProgressIndicator(),
              ),
              error: (error, _) => Column(
                children: [
                  const Icon(Icons.error_outline, color: AppColors.error),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    '스파크 정보를 불러올 수 없습니다',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.grey600,
                    ),
                  ),
                ],
              ),
              data: (_) => Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SparkIcon(
                        size: 32,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        '오늘 ${sparkStats['todaySparks'] ?? 0}개의 스파크',
                        style: AppTextStyles.titleMedium.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  
                  // 스파크 통계 표시
                  _buildSparkStats(sparkStats),
                  
                  const SizedBox(height: AppSpacing.md),
                  ElevatedButton(
                    onPressed: () {
                      // 스파크 탭으로 이동
                      if (mounted) {
                        ref.read(selectedTabProvider.notifier).state = 2;
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      minimumSize: const Size(double.infinity, 44),
                    ),
                    child: const Text('스파크 확인하기'),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSparkStats(Map<String, dynamic> stats) {
    return Container(
      height: 80,
      decoration: BoxDecoration(
        color: AppColors.grey50,
        borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
        border: Border.all(color: AppColors.grey200),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceEvenly,
        children: [
          _buildStatItem(
            '전체',
            '${stats['totalSparks'] ?? 0}',
            AppColors.primary,
          ),
          _buildStatItem(
            '대기중',
            '${stats['pendingSparks'] ?? 0}',
            AppColors.sparkActive,
          ),
          _buildStatItem(
            '매칭',
            '${stats['matchedSparks'] ?? 0}',
            AppColors.success,
          ),
        ],
      ),
    );
  }

  Widget _buildStatItem(String label, String value, Color color) {
    return Column(
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        Container(
          width: 32,
          height: 32,
          decoration: BoxDecoration(
            color: color,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: color.withOpacity(0.3),
                blurRadius: 8,
                offset: const Offset(0, 2),
              ),
            ],
          ),
          child: Center(
            child: Text(
              value,
              style: AppTextStyles.labelSmall.copyWith(
                color: AppColors.white,
                fontWeight: FontWeight.w600,
                fontSize: 10,
              ),
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          label,
          style: AppTextStyles.labelSmall.copyWith(
            fontSize: 10,
            color: AppColors.grey600,
          ),
        ),
      ],
    );
  }

  Widget _buildHotSpotsSection() {
    final popularSpots = ref.watch(popularSignalSpotsProvider);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: Text(
            'HOT 시그널 스팟 🔥',
            style: AppTextStyles.titleLarge.copyWith(
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),
        
        popularSpots.when(
          loading: () => const SizedBox(
            height: 200,
            child: Center(child: CircularProgressIndicator()),
          ),
          error: (error, _) => Container(
            height: 200,
            margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.error_outline, color: AppColors.error),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    'HOT 스팟을 불러올 수 없습니다',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.grey600,
                    ),
                  ),
                ],
              ),
            ),
          ),
          data: (response) => SizedBox(
            height: 200,
            child: response.data.isEmpty
                ? Container(
                    margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                    child: Center(
                      child: Text(
                        '아직 HOT 스팟이 없습니다',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.grey600,
                        ),
                      ),
                    ),
                  )
                : ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                    itemCount: response.data.length,
                    itemBuilder: (context, index) {
                      final spot = response.data[index];
                      return _buildHotSpotCard(spot);
                    },
                  ),
          ),
        ),
      ],
    );
  }

  Widget _buildHotSpotCard(SignalSpot spot) {
    return GestureDetector(
      onTap: () {
        // 상세 화면으로 이동
        // 조회수는 Signal Spot 상세 정보를 볼 때 백엔드에서 자동 증가
        if (mounted) {
          context.push('/map/note/${spot.id}');
        }
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        width: 280,
        margin: const EdgeInsets.only(right: AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.surface,
          borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
          border: Border.all(
            color: AppColors.grey100,
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.black.withOpacity(0.05),
              blurRadius: 12,
              offset: const Offset(0, 3),
            ),
          ],
        ),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.md),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Expanded(
                    child: Text(
                      spot.title ?? '시그널 스팟',
                      style: AppTextStyles.titleMedium.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  Row(
                    children: List.generate(
                      3,
                      (i) => Icon(
                        Icons.local_fire_department,
                        size: 16,
                        color: i < ((spot.engagement?['likeCount'] ?? 0) > 20 ? 3 : 
                                   (spot.engagement?['likeCount'] ?? 0) > 10 ? 2 : 1)
                            ? AppColors.error
                            : AppColors.grey300,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                children: [
                  const Icon(
                    Icons.location_on,
                    size: 16,
                    color: AppColors.grey500,
                  ),
                  Expanded(
                    child: Text(
                      '${spot.latitude.toStringAsFixed(4)}, ${spot.longitude.toStringAsFixed(4)}',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.grey600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  const Icon(
                    Icons.message,
                    size: 16,
                    color: AppColors.grey500,
                  ),
                  Flexible(
                    child: Text(
                      '좋아요 ${spot.engagement?['likeCount'] ?? 0} · 조회 ${spot.viewCount}',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.grey600,
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Expanded(
                child: Container(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: AppColors.grey50,
                    borderRadius: BorderRadius.circular(
                      AppSpacing.borderRadiusSm,
                    ),
                  ),
                  child: Text(
                    spot.displayContent,
                    style: AppTextStyles.bodySmall.copyWith(
                      fontStyle: FontStyle.italic,
                      color: AppColors.grey700,
                    ),
                    maxLines: 3,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              ),
              const SizedBox(height: AppSpacing.sm),
              ElevatedButton(
                onPressed: () {
                  // 상세 화면으로 이동
                  if (mounted) {
                    context.push('/map/note/${spot.id}');
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary.withOpacity(0.1),
                  foregroundColor: AppColors.primary,
                  elevation: 0,
                  minimumSize: const Size(double.infinity, 36),
                ),
                child: const Text('둘러보기'),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNearbyMessagesSection() {
    final nearbySpots = ref.watch(nearbySignalSpotsProvider);
    
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
          child: Text(
            '내 주변 새 쪽지',
            style: AppTextStyles.titleLarge.copyWith(
              fontWeight: FontWeight.w600,
              color: AppColors.textPrimary,
            ),
          ),
        ),
        const SizedBox(height: AppSpacing.md),

        nearbySpots.when(
          loading: () => Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Column(
              children: [
                const Center(child: CircularProgressIndicator()),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  '주변 쪽지를 불러오는 중...',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.grey600,
                  ),
                ),
              ],
            ),
          ),
          error: (error, stack) => Padding(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Center(
              child: Column(
                children: [
                  const Icon(Icons.error_outline, color: AppColors.error),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    '주변 쪽지를 불러올 수 없습니다',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.grey600,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    '에러: ${error.toString()}',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.grey500,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  TextButton(
                    onPressed: () async {
                      final position = ref.read(currentPositionProvider).value;
                      if (position != null) {
                        ref.read(nearbySignalSpotsProvider.notifier).loadNearbySpots(
                          latitude: position.latitude,
                          longitude: position.longitude,
                        );
                      } else {
                        ref.read(nearbySignalSpotsProvider.notifier).loadNearbySpots(
                          latitude: 37.5665,
                          longitude: 126.9780,
                        );
                      }
                    },
                    child: const Text('다시 시도'),
                  ),
                ],
              ),
            ),
          ),
          data: (response) {
            if (response.data.isEmpty) {
              return Padding(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: Center(
                  child: Text(
                    '주변에 새로운 쪽지가 없습니다',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.grey600,
                    ),
                  ),
                ),
              );
            }
            
            // Column으로 직접 렌더링하여 불필요한 간격 제거
            return Column(
              children: response.data.take(3).map((spot) {
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: _buildNearbyMessageCard(spot),
                );
              }).toList(),
            );
          },
        ),
      ],
    );
  }

  Widget _buildNearbyMessageCard(SignalSpot spot) {
    return GestureDetector(
      onTap: () {
        // 상세 화면으로 이동
        // 조회수는 Signal Spot 상세 정보를 볼 때 백엔드에서 자동 증가
        if (mounted) {
          context.push('/map/note/${spot.id}');
        }
      },
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(bottom: AppSpacing.md),
        padding: const EdgeInsets.all(AppSpacing.md),
        decoration: BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
          border: Border.all(
            color: AppColors.grey100,
            width: 1,
          ),
          boxShadow: [
            BoxShadow(
              color: AppColors.black.withOpacity(0.03),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              spot.displayContent,
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textPrimary,
              ),
              maxLines: 3,
              overflow: TextOverflow.ellipsis,
            ),
            const SizedBox(height: AppSpacing.sm),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Row(
                  children: [
                    const Icon(
                      Icons.location_on,
                      size: 14,
                      color: AppColors.grey500,
                    ),
                    Text(
                      '100m', // 실제로는 거리 계산 필요
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.grey600,
                      ),
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Text(
                      _formatTimeAgo(spot.createdAt),
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.grey500,
                      ),
                    ),
                  ],
                ),
                GestureDetector(
                  onTap: () async {
                    final signalService = ref.read(signalServiceProvider);
                    final updatedSpot = await signalService.interactWithSignalSpot(
                      spot.id,
                      const SignalSpotInteraction(type: 'like'),
                    );
                    if (updatedSpot != null) {
                      // Refresh the spots list
                      ref.invalidate(nearbySignalSpotsProvider);
                      ref.invalidate(trendingSignalSpotsProvider);
                    }
                  },
                  child: Row(
                    children: [
                      Icon(
                        (spot.engagement?['isLiked'] ?? false) ? Icons.favorite : Icons.favorite_outline,
                        size: 16,
                        color: (spot.engagement?['isLiked'] ?? false) ? AppColors.error : AppColors.grey500,
                      ),
                      const SizedBox(width: AppSpacing.xs),
                      Text(
                        '${spot.engagement?['likeCount'] ?? 0}',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.grey600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  String _getGreetingMessage() {
    // 색상을 고정했으므로 인사말도 앱 이름으로 고정
    return 'SignalSpot';
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
}