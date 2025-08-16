import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';

class SparkDetailPage extends ConsumerStatefulWidget {
  final String sparkId;

  const SparkDetailPage({
    super.key,
    required this.sparkId,
  });

  @override
  ConsumerState<SparkDetailPage> createState() => _SparkDetailPageState();
}

class _SparkDetailPageState extends ConsumerState<SparkDetailPage>
    with TickerProviderStateMixin {
  late AnimationController _revealController;
  late AnimationController _matchingController;
  late Animation<double> _revealAnimation;
  late Animation<double> _matchingAnimation;
  bool _hasInteracted = false;

  // 임시 스파크 데이터
  final SparkDetail _sparkDetail = SparkDetail(
    id: '1',
    location: '강남역 스타벅스',
    time: '오늘 오후 2:30',
    duration: '약 30초간 머물렀어요',
    distance: '10m 이내',
    matchingRate: 87,
    commonInterests: ['영화감상', '카페탐방', '독서'],
    signatureConnection: SignatureConnection(
      movie: '기생충',
      artist: '아이유',
      isMovieMatch: true,
      isArtistMatch: false,
    ),
    additionalHints: [
      '비슷한 나이대',
      '창가 자리 선호',
      '오후 시간대 활동',
    ],
    isPremium: false,
  );

  @override
  void initState() {
    super.initState();
    
    _revealController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    _revealAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _revealController,
      curve: Curves.easeInOut,
    ));

    _matchingController = AnimationController(
      duration: const Duration(milliseconds: 2000),
      vsync: this,
    );
    _matchingAnimation = Tween<double>(
      begin: 0.0,
      end: _sparkDetail.matchingRate / 100,
    ).animate(CurvedAnimation(
      parent: _matchingController,
      curve: Curves.elasticOut,
    ));

    _matchingController.forward();
  }

  @override
  void dispose() {
    _revealController.dispose();
    _matchingController.dispose();
    super.dispose();
  }

  void _sendSignal() {
    setState(() {
      _hasInteracted = true;
    });
    _revealController.forward();
    
    // 성공 다이얼로그 표시
    Future.delayed(const Duration(milliseconds: 500), () {
      _showSuccessDialog();
    });
  }

  void _passForNow() {
    context.pop();
  }

  void _showSuccessDialog() {
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppColors.success.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: const Icon(
                Icons.favorite,
                size: 40,
                color: AppColors.success,
              ),
            ),
            const SizedBox(height: AppSpacing.lg),
            Text(
              '시그널을 보냈어요! 💫',
              style: AppTextStyles.titleLarge.copyWith(
                fontWeight: FontWeight.w600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              '상대방이 72시간 내에 응답하면\n매칭이 성사됩니다',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.grey600,
              ),
              textAlign: TextAlign.center,
            ),
            const SizedBox(height: AppSpacing.xl),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () {
                  Navigator.pop(context); // 다이얼로그 닫기
                  context.pop(); // 상세 페이지 닫기
                },
                child: const Text('확인'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        title: Text(
          '스파크 상세',
          style: TextStyle(
            color: AppColors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: AppColors.getTimeBasedGradient(),
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(
          color: AppColors.white,
        ),
        actions: [
          IconButton(
            icon: Icon(
              Icons.more_vert,
              color: AppColors.white,
            ),
            onPressed: () {
              _showMoreOptions();
            },
          ),
        ],
      ),
      body: SafeArea(
        child: Column(
          children: [
            // 상단 블러 처리된 프로필 영역
            Expanded(
              flex: 2,
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      AppColors.primary.withOpacity(0.8),
                      AppColors.secondary.withOpacity(0.6),
                      AppColors.white,
                    ],
                    stops: const [0.0, 0.4, 1.0],
                  ),
                ),
                child: _buildProfileSection(),
              ),
            ),
            
            // 하단 정보 및 액션 영역
            Expanded(
              flex: 3,
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(AppSpacing.lg),
                decoration: const BoxDecoration(
                  color: AppColors.white,
                  borderRadius: BorderRadius.vertical(
                    top: Radius.circular(AppSpacing.borderRadiusXl),
                  ),
                ),
                child: _buildInfoSection(),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileSection() {
    return Stack(
      alignment: Alignment.center,
      children: [
        // 블러 처리된 실루엣
        AnimatedBuilder(
          animation: _revealAnimation,
          builder: (context, child) {
            return Container(
              width: 150,
              height: 150,
              decoration: BoxDecoration(
                color: AppColors.white.withOpacity(0.3),
                shape: BoxShape.circle,
                border: Border.all(
                  color: AppColors.white.withOpacity(0.5),
                  width: 3,
                ),
              ),
              child: ClipOval(
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    // 블러 배경
                    Container(
                      width: double.infinity,
                      height: double.infinity,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.primary.withOpacity(0.6),
                            AppColors.secondary.withOpacity(0.6),
                          ],
                        ),
                      ),
                    ),
                    // 점진적 공개 효과
                    AnimatedContainer(
                      duration: const Duration(milliseconds: 500),
                      width: double.infinity,
                      height: double.infinity,
                      decoration: BoxDecoration(
                        color: AppColors.black.withOpacity(
                          _hasInteracted ? 0.3 : 0.7,
                        ),
                      ),
                    ),
                    // 사람 아이콘
                    Icon(
                      Icons.person,
                      size: 60,
                      color: AppColors.white.withOpacity(
                        _hasInteracted ? 0.8 : 0.4,
                      ),
                    ),
                  ],
                ),
              ),
            );
          },
        ),
        
        // 매칭률 원형 인디케이터
        Positioned(
          bottom: -10,
          child: AnimatedBuilder(
            animation: _matchingAnimation,
            builder: (context, child) {
              return Stack(
                alignment: Alignment.center,
                children: [
                  SizedBox(
                    width: 80,
                    height: 80,
                    child: CircularProgressIndicator(
                      value: _matchingAnimation.value,
                      strokeWidth: 6,
                      backgroundColor: AppColors.white.withOpacity(0.3),
                      valueColor: AlwaysStoppedAnimation<Color>(
                        _getMatchingRateColor(_sparkDetail.matchingRate),
                      ),
                    ),
                  ),
                  Container(
                    width: 60,
                    height: 60,
                    decoration: const BoxDecoration(
                      color: AppColors.white,
                      shape: BoxShape.circle,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          '${(_matchingAnimation.value * 100).toInt()}%',
                          style: AppTextStyles.titleMedium.copyWith(
                            fontWeight: FontWeight.w700,
                            color: _getMatchingRateColor(_sparkDetail.matchingRate),
                          ),
                        ),
                        Text(
                          'MATCH',
                          style: AppTextStyles.labelSmall.copyWith(
                            color: AppColors.grey600,
                            fontSize: 8,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildInfoSection() {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 만남 정보
          _InfoCard(
            title: '만남 정보',
            children: [
              _InfoItem(
                icon: Icons.location_on,
                label: '장소',
                value: _sparkDetail.location,
              ),
              _InfoItem(
                icon: Icons.access_time,
                label: '시간',
                value: _sparkDetail.time,
              ),
              _InfoItem(
                icon: Icons.timer,
                label: '머문 시간',
                value: _sparkDetail.duration,
              ),
              _InfoItem(
                icon: Icons.social_distance,
                label: '거리',
                value: _sparkDetail.distance,
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.lg),

          // 공통 관심사
          _InfoCard(
            title: '공통 관심사',
            children: [
              Wrap(
                spacing: AppSpacing.sm,
                runSpacing: AppSpacing.sm,
                children: _sparkDetail.commonInterests.map((interest) {
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
                      style: AppTextStyles.labelMedium.copyWith(
                        color: AppColors.primary,
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.lg),

          // 시그니처 커넥션
          _InfoCard(
            title: '시그니처 커넥션',
            children: [
              Row(
                children: [
                  Expanded(
                    child: _SignatureItem(
                      icon: Icons.movie,
                      label: '인생 영화',
                      value: _sparkDetail.signatureConnection.movie ?? '비공개',
                      isMatch: _sparkDetail.signatureConnection.isMovieMatch,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: _SignatureItem(
                      icon: Icons.music_note,
                      label: '최애 아티스트',
                      value: _sparkDetail.signatureConnection.artist ?? '비공개',
                      isMatch: _sparkDetail.signatureConnection.isArtistMatch,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.md),
              Row(
                children: [
                  Expanded(
                    child: _SignatureItem(
                      icon: Icons.psychology,
                      label: 'MBTI',
                      value: _sparkDetail.signatureConnection.mbti ?? '비공개',
                      isMatch: _sparkDetail.signatureConnection.isMbtiMatch,
                    ),
                  ),
                  const SizedBox(width: AppSpacing.md),
                  Expanded(
                    child: Container(), // 공간 유지용
                  ),
                ],
              ),
            ],
          ),

          if (_sparkDetail.isPremium) ...[
            const SizedBox(height: AppSpacing.lg),
            _InfoCard(
              title: '추가 힌트',
              subtitle: '프리미엄 정보',
              children: [
                Column(
                  children: _sparkDetail.additionalHints.map((hint) {
                    return Padding(
                      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
                      child: Row(
                        children: [
                          Container(
                            width: 6,
                            height: 6,
                            decoration: const BoxDecoration(
                              color: AppColors.sparkActive,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Text(
                            hint,
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.textPrimary,
                            ),
                          ),
                        ],
                      ),
                    );
                  }).toList(),
                ),
              ],
            ),
          ],

          const SizedBox(height: AppSpacing.xl),

          // 액션 버튼들
          if (!_hasInteracted) ...[
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _passForNow,
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                    ),
                    child: const Text('다음에'),
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  flex: 2,
                  child: ElevatedButton(
                    onPressed: _sendSignal,
                    style: ElevatedButton.styleFrom(
                      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                      backgroundColor: AppColors.primary,
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.favorite, size: 20),
                        const SizedBox(width: AppSpacing.xs),
                        const Text('시그널 보내기'),
                      ],
                    ),
                  ),
                ),
              ],
            ),
          ] else ...[
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.success.withOpacity(0.1),
                borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(
                    Icons.favorite,
                    color: AppColors.success,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    '시그널을 보냈습니다!',
                    style: AppTextStyles.titleMedium.copyWith(
                      color: AppColors.success,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: AppSpacing.lg),
        ],
      ),
    );
  }

  Color _getMatchingRateColor(int rate) {
    if (rate >= 80) return AppColors.success;
    if (rate >= 60) return AppColors.sparkActive;
    return AppColors.grey500;
  }

  void _showMoreOptions() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('옵션'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
            children: [
            ListTile(
              leading: const Icon(Icons.block),
              title: const Text('관심 없음'),
              subtitle: const Text('다시 보지 않기'),
              onTap: () {
                Navigator.pop(context);
                context.pop();
              },
            ),
            ListTile(
              leading: const Icon(Icons.report),
              title: const Text('신고하기'),
              onTap: () {
                Navigator.pop(context);
                // 신고 처리
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('취소'),
          ),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final String title;
  final String? subtitle;
  final List<Widget> children;

  const _InfoCard({
    required this.title,
    this.subtitle,
    required this.children,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                title,
                style: AppTextStyles.titleMedium.copyWith(
                  fontWeight: FontWeight.w600,
                  color: AppColors.textPrimary,
                ),
              ),
              if (subtitle != null)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.sparkActive.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(AppSpacing.borderRadiusXl),
                  ),
                  child: Text(
                    subtitle!,
                    style: AppTextStyles.labelSmall.copyWith(
                      color: AppColors.sparkActive,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.md),
          ...children,
        ],
      ),
    );
  }
}

class _InfoItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _InfoItem({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      child: Row(
        children: [
          Icon(
            icon,
            size: 20,
            color: AppColors.primary,
          ),
          const SizedBox(width: AppSpacing.sm),
          Text(
            label,
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
          const Spacer(),
          Text(
            value,
            style: AppTextStyles.bodyMedium.copyWith(
              fontWeight: FontWeight.w500,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}

class _SignatureItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final bool isMatch;

  const _SignatureItem({
    required this.icon,
    required this.label,
    required this.value,
    required this.isMatch,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.sm),
      decoration: BoxDecoration(
        color: isMatch 
            ? AppColors.success.withOpacity(0.1)
            : AppColors.grey50,
        borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
        border: isMatch
            ? Border.all(color: AppColors.success.withOpacity(0.3))
            : null,
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(
                icon,
                size: 16,
                color: isMatch ? AppColors.success : AppColors.grey500,
              ),
              const SizedBox(width: AppSpacing.xs),
              Expanded(
                child: Text(
                  label,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
              ),
              if (isMatch)
                Container(
                  width: 16,
                  height: 16,
                  decoration: const BoxDecoration(
                    color: AppColors.success,
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.check,
                    size: 12,
                    color: AppColors.white,
                  ),
                ),
            ],
          ),
          const SizedBox(height: AppSpacing.xs),
          Text(
            value,
            style: AppTextStyles.bodyMedium.copyWith(
              fontWeight: FontWeight.w500,
              color: isMatch ? AppColors.success : AppColors.textPrimary,
            ),
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}

// 데이터 모델들
class SparkDetail {
  final String id;
  final String location;
  final String time;
  final String duration;
  final String distance;
  final int matchingRate;
  final List<String> commonInterests;
  final SignatureConnection signatureConnection;
  final List<String> additionalHints;
  final bool isPremium;

  SparkDetail({
    required this.id,
    required this.location,
    required this.time,
    required this.duration,
    required this.distance,
    required this.matchingRate,
    required this.commonInterests,
    required this.signatureConnection,
    required this.additionalHints,
    required this.isPremium,
  });
}

class SignatureConnection {
  final String? movie;
  final String? artist;
  final String? mbti;
  final bool isMovieMatch;
  final bool isArtistMatch;
  final bool isMbtiMatch;

  SignatureConnection({
    this.movie,
    this.artist,
    this.mbti,
    required this.isMovieMatch,
    required this.isArtistMatch,
    this.isMbtiMatch = false,
  });
}