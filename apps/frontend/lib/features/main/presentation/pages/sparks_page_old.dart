import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'dart:async';
import 'dart:math';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/models/chat.dart';
import '../../../chat/presentation/pages/chat_room_page.dart';

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
  final Random _random = Random();

  // 임시 스파크 데이터
  List<SparkItem> _newSparks = [
    SparkItem(
      id: '1',
      location: '강남역 스타벅스',
      time: '5분 전',
      matchingRate: 87,
      commonInterests: ['영화감상', '카페탐방'],
      distance: '10m',
      duration: '30초',
    ),
    SparkItem(
      id: '2',
      location: '홍대 걷고싶은거리',
      time: '23분 전',
      matchingRate: 74,
      commonInterests: ['음악감상', '공연관람'],
      distance: '5m',
      duration: '1분',
    ),
  ];

  List<SparkItem> _waitingSparks = [
    SparkItem(
      id: '3',
      location: '명동역',
      time: '1시간 전',
      matchingRate: 92,
      commonInterests: ['쇼핑', '맛집탐방'],
      distance: '15m',
      duration: '45초',
      status: SparkStatus.sent,
    ),
  ];

  List<SparkItem> _matchedSparks = [
    SparkItem(
      id: '4',
      location: '코엑스몰',
      time: '어제',
      matchingRate: 89,
      commonInterests: ['독서', '전시관람'],
      distance: '8m',
      duration: '2분',
      status: SparkStatus.matched,
    ),
  ];

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
  }

  @override
  void dispose() {
    _detectionTimer?.cancel();
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
    // 위치 권한 체크 시뮬레이션
    await _checkPermissions();
    
    // 스파크 활성화
    ref.read(sparkActiveProvider.notifier).state = true;
    ref.read(lastSparkTimeProvider.notifier).state = DateTime.now();
    
    // 애니메이션 시작
    _pulseController.repeat(reverse: true);
    _rotateController.repeat();
    
    // 스파크 감지 시뮬레이션 시작
    _startSparkDetection();
    
    // 성공 피드백
    HapticFeedback.heavyImpact();
    
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.bolt, color: Colors.white, size: 20),
              const SizedBox(width: 8),
              const Text('스파크가 활성화되었습니다!'),
            ],
          ),
          backgroundColor: AppColors.success,
          duration: const Duration(seconds: 2),
        ),
      );
    }
  }
  
  Future<void> _deactivateSpark() async {
    // 스파크 비활성화
    ref.read(sparkActiveProvider.notifier).state = false;
    
    // 애니메이션 중지
    _pulseController.stop();
    _rotateController.stop();
    
    // 감지 타이머 중지
    _detectionTimer?.cancel();
    
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
  
  void _simulateSparkDetection() {
    final currentCount = ref.read(sparkDetectionCountProvider);
    ref.read(sparkDetectionCountProvider.notifier).state = currentCount + 1;
    
    // 새로운 스파크 아이템 추가 시뮬레이션
    final locations = ['강남역', '홍대입구', '명동', '신촌', '이태원', '여의도'];
    final interests = [
      ['음악', '영화'], ['카페', '독서'], ['운동', '요리'], 
      ['여행', '사진'], ['게임', '만화'], ['쇼핑', '패션']
    ];
    
    final newSpark = SparkItem(
      id: 'detected_${DateTime.now().millisecondsSinceEpoch}',
      location: '${locations[_random.nextInt(locations.length)]} 근처',
      time: '방금',
      matchingRate: 70 + _random.nextInt(30),
      commonInterests: interests[_random.nextInt(interests.length)],
      distance: '${5 + _random.nextInt(20)}m',
      duration: '${10 + _random.nextInt(50)}초',
    );
    
    setState(() {
      _newSparks.insert(0, newSpark);
    });
    
    // 햅틱 피드백
    HapticFeedback.lightImpact();
    
    // 알림
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.notifications, color: Colors.white, size: 16),
              const SizedBox(width: 8),
              Text('새로운 스파크 감지! ${newSpark.location}'),
            ],
          ),
          backgroundColor: AppColors.sparkActive,
          duration: const Duration(seconds: 3),
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

    return Scaffold(
      appBar: AppBar(
        title: const Text('스파크'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: Column(
        children: [
          // 스파크 메인 버튼 영역
          Container(
            padding: const EdgeInsets.all(AppSpacing.xxl),
            child: Column(
              children: [
                // 메인 스파크 버튼 (간소화된 버전)
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
                    child: Icon(
                      Icons.bolt,
                      size: 60,
                      color: isSparkActive
                          ? AppColors.white
                          : AppColors.grey600,
                    ),
                  ),
                ),
                
                const SizedBox(height: AppSpacing.lg),
                
                // 상태 텍스트
                Text(
                  isSparkActive ? '스파크 감지 중...' : '스파크를 시작하려면 탭하세요',
                  style: AppTextStyles.titleMedium.copyWith(
                    fontWeight: FontWeight.w600,
                    color: isSparkActive ? AppColors.primary : AppColors.grey600,
                  ),
                  textAlign: TextAlign.center,
                ),
                
                if (isSparkActive) ...[
                  const SizedBox(height: AppSpacing.sm),
                  Consumer(
                    builder: (context, ref, child) {
                      final detectionCount = ref.watch(sparkDetectionCountProvider);
                      final lastTime = ref.watch(lastSparkTimeProvider);
                      final elapsed = lastTime != null 
                          ? DateTime.now().difference(lastTime).inMinutes
                          : 0;
                      
                      return Text(
                        '활성 시간: ${elapsed}분 • 감지: ${detectionCount}회',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w500,
                        ),
                        textAlign: TextAlign.center,
                      );
                    },
                  ),
                ],
                
                const SizedBox(height: AppSpacing.sm),
                
                // 추가 정보
                if (isSparkActive) ...[
                  const SizedBox(height: AppSpacing.md),
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.grey200,
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
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceAround,
                          children: [
                            _buildStatusItem(
                              Icons.battery_std,
                              '배터리',
                              '보통',
                              AppColors.success,
                            ),
                            _buildStatusItem(
                              Icons.location_on,
                              '위치',
                              '정확',
                              AppColors.primary,
                            ),
                            _buildStatusItem(
                              Icons.signal_cellular_4_bar,
                              '신호',
                              '강함',
                              AppColors.success,
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          '백그라운드에서 근처의 사람들을 안전하게 감지합니다',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.grey600,
                            fontStyle: FontStyle.italic,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  ),
                ] else ...[
                  const SizedBox(height: AppSpacing.md),
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.grey50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.info_outline,
                              size: 16,
                              color: AppColors.grey500,
                            ),
                            const SizedBox(width: AppSpacing.xs),
                            Text(
                              '스파크를 활성화하면 자동으로 감지를 시작합니다',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.grey600,
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
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
            child: Row(
              children: [
                _buildTabButton('새로운', 0, _newSparks.length),
                _buildTabButton('대기중', 1, _waitingSparks.length),
                _buildTabButton('매칭됨', 2, _matchedSparks.length),
              ],
            ),
          ),
          
          const SizedBox(height: AppSpacing.lg),
          
          // 스파크 리스트
          Expanded(
            child: _buildSparkList(selectedTab),
          ),
        ],
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
    List<SparkItem> sparks;
    switch (tabIndex) {
      case 0:
        sparks = _newSparks;
        break;
      case 1:
        sparks = _waitingSparks;
        break;
      case 2:
        sparks = _matchedSparks;
        break;
      default:
        sparks = [];
    }

    if (sparks.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
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

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      itemCount: sparks.length,
      itemBuilder: (context, index) {
        return _SparkCard(spark: sparks[index]);
      },
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

  Widget _buildStatusItem(IconData icon, String label, String value, Color color) {
    return Column(
      children: [
        Icon(
          icon,
          size: 20,
          color: color,
        ),
        const SizedBox(height: AppSpacing.xs),
        Text(
          label,
          style: AppTextStyles.bodySmall.copyWith(
            color: AppColors.grey600,
            fontSize: 11,
          ),
        ),
        Text(
          value,
          style: AppTextStyles.labelSmall.copyWith(
            color: color,
            fontWeight: FontWeight.w600,
            fontSize: 10,
          ),
        ),
      ],
    );
  }
}

class _SparkCard extends StatelessWidget {
  final SparkItem spark;

  const _SparkCard({required this.spark});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
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
            // 헤더
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        spark.location,
                        style: AppTextStyles.titleMedium.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Text(
                        spark.time,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.grey500,
                        ),
                      ),
                    ],
                  ),
                ),
                // 매칭률
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: _getMatchingRateColor(spark.matchingRate).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppSpacing.borderRadiusXl),
                  ),
                  child: Text(
                    '${spark.matchingRate}%',
                    style: AppTextStyles.labelMedium.copyWith(
                      color: _getMatchingRateColor(spark.matchingRate),
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: AppSpacing.md),
            
            // 상세 정보
            Row(
              children: [
                Icon(
                  Icons.location_on,
                  size: 16,
                  color: AppColors.grey500,
                ),
                Text(
                  spark.distance,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.grey600,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Icon(
                  Icons.schedule,
                  size: 16,
                  color: AppColors.grey500,
                ),
                Text(
                  spark.duration,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.grey600,
                  ),
                ),
              ],
            ),
            
            const SizedBox(height: AppSpacing.sm),
            
            // 공통 관심사
            Wrap(
              spacing: AppSpacing.xs,
              children: spark.commonInterests.map((interest) {
                return Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppSpacing.borderRadiusXl),
                  ),
                  child: Text(
                    interest,
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.primary,
                    ),
                  ),
                );
              }).toList(),
            ),
            
            const SizedBox(height: AppSpacing.md),
            
            // 액션 버튼
            Row(
              children: [
                if (spark.status == SparkStatus.pending) ...[
                  Expanded(
                    child: OutlinedButton(
                      onPressed: () {
                        // 다음에 하기
                      },
                      child: const Text('다음에'),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: () {
                        // 시그널 보내기
                      },
                      child: const Text('시그널 보내기'),
                    ),
                  ),
                ] else if (spark.status == SparkStatus.sent) ...[
                  Expanded(
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: AppSpacing.sm),
                      decoration: BoxDecoration(
                        color: AppColors.grey100,
                        borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                      ),
                      child: Text(
                        '응답 대기 중... (${_getTimeLeft()})',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.grey600,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
                ] else if (spark.status == SparkStatus.matched) ...[
                  Expanded(
                    child: ElevatedButton(
                      onPressed: () {
                        // 채팅 시작
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
                    ),
                  ),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }

  Color _getMatchingRateColor(int rate) {
    if (rate >= 80) return AppColors.success;
    if (rate >= 60) return AppColors.sparkActive;
    return AppColors.grey500;
  }

  String _getTimeLeft() {
    // TODO: 실제 시간 계산
    return '71시간 23분';
  }
}

// 데이터 모델
enum SparkStatus { pending, sent, matched }

class SparkItem {
  final String id;
  final String location;
  final String time;
  final int matchingRate;
  final List<String> commonInterests;
  final String distance;
  final String duration;
  final SparkStatus status;

  SparkItem({
    required this.id,
    required this.location,
    required this.time,
    required this.matchingRate,
    required this.commonInterests,
    required this.distance,
    required this.duration,
    this.status = SparkStatus.pending,
  });
}