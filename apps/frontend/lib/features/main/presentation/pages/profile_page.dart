import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/providers/profile_provider.dart';
import '../../../../shared/providers/theme_provider.dart';
import '../../../../shared/models/index.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../auth/data/services/auth_service.dart';
import '../../../profile/presentation/pages/profile_edit_page.dart';
import '../../../profile/presentation/pages/notification_settings_page.dart';
import '../../../profile/presentation/pages/privacy_settings_page.dart';
import '../../../../shared/widgets/spark_icon.dart';

class ProfilePage extends ConsumerStatefulWidget {
  const ProfilePage({super.key});

  @override
  ConsumerState<ProfilePage> createState() => _ProfilePageState();
}

class _ProfilePageState extends ConsumerState<ProfilePage>
    with TickerProviderStateMixin {
  late AnimationController _slideController;
  late AnimationController _scaleController;
  late Animation<Offset> _slideAnimation;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _loadUserData();
    _slideController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _scaleController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _slideController,
      curve: Curves.easeOutCubic,
    ));
    
    _scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _scaleController,
      curve: Curves.elasticOut,
    ));
    
    _slideController.forward();
    _scaleController.forward();
  }
  
  void _loadUserData() {
    // API에서 실제 사용자 데이터 로드
    WidgetsBinding.instance.addPostFrameCallback((_) async {
      if (!mounted) return;  // mounted 체크 추가
      
      ref.read(myProfileProvider.notifier).loadProfile();
      
      // analytics 로드 및 디버깅
      try {
        await ref.read(profileAnalyticsProvider.notifier).loadAnalytics();
        if (!mounted) return;  // 비동기 작업 후 mounted 체크
        print('[ProfilePage] Analytics loaded successfully');
      } catch (e) {
        print('[ProfilePage] Error loading analytics: $e');
      }
      
      if (!mounted) return;  // 마지막 ref 사용 전 mounted 체크
      ref.read(signatureConnectionPreferencesProvider.notifier).loadPreferences();
    });
  }

  @override
  void dispose() {
    _slideController.dispose();
    _scaleController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final profile = ref.watch(myProfileProvider);
    final analytics = ref.watch(profileAnalyticsProvider);
    final signaturePrefs = ref.watch(signatureConnectionPreferencesProvider);
    final timeBasedGradient = ref.watch(timeBasedGradientProvider);
    
    return Scaffold(
      backgroundColor: AppColors.white,
      body: RefreshIndicator(
        onRefresh: () async {
          print('[ProfilePage] Refreshing data...');
          try {
            await Future.wait([
              ref.read(myProfileProvider.notifier).loadProfile(),
              ref.read(profileAnalyticsProvider.notifier).loadAnalytics(),
              ref.read(signatureConnectionPreferencesProvider.notifier).loadPreferences(),
            ]);
            print('[ProfilePage] Refresh completed');
          } catch (e) {
            print('[ProfilePage] Refresh error: $e');
          }
        },
        child: CustomScrollView(
          slivers: [
          // 커스텀 앱바
          SliverAppBar(
            expandedHeight: 280,
            floating: false,
            pinned: true,
            backgroundColor: Colors.transparent,
            title: const Text(
              '프로필',
              style: TextStyle(
                color: AppColors.white,
                fontWeight: FontWeight.w600,
              ),
            ),
            centerTitle: true,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: BoxDecoration(
                  gradient: timeBasedGradient,
                ),
                child: SafeArea(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const SizedBox(height: 60), // 타이틀 공간 확보를 위해 증가
                      // 프로필 이미지
                      ScaleTransition(
                        scale: _scaleAnimation,
                        child: Hero(
                          tag: 'profile_image',
                          child: profile.when(
                            loading: () => Container(
                              width: 100,
                              height: 100,
                              decoration: BoxDecoration(
                                color: AppColors.white.withOpacity(0.3),
                                shape: BoxShape.circle,
                              ),
                              child: const CircularProgressIndicator(
                                color: AppColors.white,
                                strokeWidth: 2,
                              ),
                            ),
                            error: (_, __) => _buildProfileImage(null),
                            data: (userProfile) => _buildProfileImage(userProfile.avatarUrl),
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      // 닉네임
                      SlideTransition(
                        position: _slideAnimation,
                        child: profile.when(
                          loading: () => Container(
                            width: 120,
                            height: 24,
                            decoration: BoxDecoration(
                              color: AppColors.white.withOpacity(0.3),
                              borderRadius: BorderRadius.circular(12),
                            ),
                          ),
                          error: (error, _) => Text(
                            '사용자',
                            style: AppTextStyles.headlineSmall.copyWith(
                              color: AppColors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          data: (userProfile) => Text(
                            userProfile.displayName ?? '시그널러버',
                            style: AppTextStyles.headlineSmall.copyWith(
                              color: AppColors.white,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      // 한줄소개
                      SlideTransition(
                        position: _slideAnimation,
                        child: profile.when(
                          loading: () => Container(
                            width: 200,
                            height: 32,
                            decoration: BoxDecoration(
                              color: AppColors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                          ),
                          error: (error, _) => Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.md,
                              vertical: AppSpacing.xs,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              '새로운 인연을 찾는 중이에요 ✨',
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: AppColors.white,
                              ),
                            ),
                          ),
                          data: (userProfile) => Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.md,
                              vertical: AppSpacing.xs,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.white.withOpacity(0.2),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              userProfile.bio ?? '새로운 인연을 찾는 중이에요 ✨',
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: AppColors.white,
                              ),
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          
          // 통계 카드
          SliverToBoxAdapter(
            child: SlideTransition(
              position: _slideAnimation,
              child: Container(
                margin: const EdgeInsets.all(AppSpacing.lg),
                child: _buildStatsCard(analytics),
              ),
            ),
          ),
          
          // 시그니처 커넥션
          SliverToBoxAdapter(
            child: SlideTransition(
              position: _slideAnimation,
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: _buildSignatureConnectionCard(signaturePrefs),
              ),
            ),
          ),
          
          // 메뉴 리스트
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '설정',
                    style: AppTextStyles.titleMedium.copyWith(
                      fontWeight: FontWeight.w600,
                      color: AppColors.grey700,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  _buildMenuCard(),
                ],
              ),
            ),
          ),
          
          // 로그아웃 및 회원탈퇴 버튼
          SliverToBoxAdapter(
            child: Container(
              margin: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                children: [
                  _buildLogoutButton(),
                  const SizedBox(height: AppSpacing.md),
                  _buildDeleteAccountButton(),
                ],
              ),
            ),
          ),
          ],
        ),
      ),
    );
  }
  
  Widget _buildStatsCard(AsyncValue<Map<String, dynamic>> analytics) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withOpacity(0.05),
            blurRadius: 15,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: analytics.when(
        loading: () => Column(
          children: [
            Row(
              children: [
                Icon(Icons.analytics, color: AppColors.primary),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  '나의 활동',
                  style: AppTextStyles.titleMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
            const Center(child: CircularProgressIndicator()),
          ],
        ),
        error: (error, stackTrace) {
          print('[ProfilePage] Analytics error: $error');
          print('[ProfilePage] Stack trace: $stackTrace');
          
          return Column(
            children: [
              Row(
                children: [
                  Icon(Icons.analytics, color: AppColors.primary),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    '나의 활동',
                    style: AppTextStyles.titleMedium.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.lg),
              // 에러 상태에서도 기본값 표시
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  _buildStatItem(
                    icon: null,
                    customIcon: const SparkIcon(size: 24),
                    value: '0',
                    label: '스파크',
                    color: AppColors.sparkActive,
                  ),
                  _buildStatItem(
                    icon: Icons.message,
                    value: '0',
                    label: '쪽지',
                    color: AppColors.primary,
                  ),
                  _buildStatItem(
                    icon: Icons.favorite,
                    value: '0',
                    label: '매칭',
                    color: AppColors.grey600,
                  ),
                  _buildStatItem(
                    icon: Icons.location_on,
                    value: '0',
                    label: '스팟',
                    color: AppColors.success,
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Text(
                '통계를 불러올 수 없습니다',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.grey600,
                ),
              ),
            ],
          );
        },
        data: (stats) {
          print('[ProfilePage] Analytics data loaded: $stats');
          return Column(
          children: [
            Row(
              children: [
                Icon(Icons.analytics, color: AppColors.primary),
                const SizedBox(width: AppSpacing.sm),
                Text(
                  '나의 활동',
                  style: AppTextStyles.titleMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ],
            ),
            const SizedBox(height: AppSpacing.lg),
            // 주요 통계 표시
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _buildStatItem(
                  icon: null,
                  customIcon: const SparkIcon(size: 24),
                  value: '${stats['totalSparks'] ?? 0}',
                  label: '스파크',
                  color: AppColors.sparkActive,
                ),
                _buildStatItem(
                  icon: Icons.message,
                  value: '${stats['totalMessages'] ?? 0}',
                  label: '쪽지',
                  color: AppColors.primary,
                ),
                _buildStatItem(
                  icon: Icons.favorite,
                  value: '${stats['totalMatches'] ?? 0}',
                  label: '매칭',
                  color: AppColors.grey600,
                ),
                _buildStatItem(
                  icon: Icons.location_on,
                  value: '${stats['totalSpots'] ?? 0}',
                  label: '스팟',
                  color: AppColors.success,
                ),
              ],
            ),
            // 추가 통계 표시 (activeSignalSpots, totalSpotLikes, totalSpotViews가 있는 경우)
            if (stats['activeSignalSpots'] != null || 
                stats['totalSpotLikes'] != null || 
                stats['totalSpotViews'] != null) ...[
              const SizedBox(height: AppSpacing.lg),
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.grey50,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '스팟 통계',
                      style: AppTextStyles.labelLarge.copyWith(
                        color: AppColors.grey700,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceAround,
                      children: [
                        _buildMiniStatItem(
                          icon: Icons.radio_button_checked,
                          value: '${stats['activeSignalSpots'] ?? 0}',
                          label: '활성 스팟',
                        ),
                        _buildMiniStatItem(
                          icon: Icons.thumb_up,
                          value: '${stats['totalSpotLikes'] ?? 0}',
                          label: '받은 좋아요',
                        ),
                        _buildMiniStatItem(
                          icon: Icons.visibility,
                          value: '${stats['totalSpotViews'] ?? 0}',
                          label: '조회수',
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ],
        );
        },
      ),
    );
  }
  
  Widget _buildStatItem({
    IconData? icon,
    Widget? customIcon,
    required String value,
    required String label,
    required Color color,
  }) {
    return TweenAnimationBuilder<double>(
      duration: const Duration(milliseconds: 1000),
      tween: Tween(begin: 0, end: 1),
      builder: (context, animationValue, child) {
        return Column(
          children: [
            Container(
              width: 50,
              height: 50,
              decoration: BoxDecoration(
                color: color.withOpacity(0.1),
                shape: BoxShape.circle,
              ),
              child: customIcon ?? Icon(
                icon!,
                color: color,
                size: 24,
              ),
            ),
            const SizedBox(height: AppSpacing.sm),
            Text(
              (int.parse(value) * animationValue).toInt().toString(),
              style: AppTextStyles.titleLarge.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.grey900,
              ),
            ),
            Text(
              label,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.grey600,
              ),
            ),
          ],
        );
      },
    );
  }
  
  Widget _buildMiniStatItem({
    required IconData icon,
    required String value,
    required String label,
  }) {
    return Column(
      children: [
        Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Icon(
              icon,
              color: AppColors.primary,
              size: 16,
            ),
            const SizedBox(width: 4),
            Text(
              value,
              style: AppTextStyles.titleSmall.copyWith(
                fontWeight: FontWeight.bold,
                color: AppColors.grey900,
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: AppTextStyles.labelSmall.copyWith(
            color: AppColors.grey600,
            fontSize: 11,
          ),
        ),
      ],
    );
  }
  
  Widget _buildSignatureConnectionCard(AsyncValue<SignatureConnectionPreferences?> signaturePrefs) {
    return Container(
      padding: const EdgeInsets.all(AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.grey200,
        ),
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withOpacity(0.03),
            blurRadius: 10,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(AppSpacing.sm),
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppColors.primary, AppColors.secondary],
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(
                  Icons.auto_awesome,
                  color: AppColors.white,
                  size: 20,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '시그니처 커넥션',
                      style: AppTextStyles.titleMedium.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      '당신만의 특별한 매칭 기준',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.grey600,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: AppSpacing.lg),
          // API 데이터 표시
          signaturePrefs.when(
            loading: () => Column(
              children: [
                Container(
                  height: 32,
                  width: double.infinity,
                  decoration: BoxDecoration(
                    color: AppColors.grey200,
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Container(
                  height: 32,
                  width: 200,
                  decoration: BoxDecoration(
                    color: AppColors.grey200,
                    borderRadius: BorderRadius.circular(16),
                  ),
                ),
              ],
            ),
            error: (error, _) => Column(
              children: [
                Icon(Icons.error_outline, color: AppColors.grey600),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  '시그니처 커넥션 정보를 불러올 수 없습니다',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.grey600,
                  ),
                ),
              ],
            ),
            data: (preferences) {
              if (preferences == null) {
                return Column(
                  children: [
                    Icon(Icons.info_outline, color: AppColors.grey500, size: 48),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      '아직 시그니처 커넥션을 설정하지 않았습니다',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.grey600,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    ElevatedButton.icon(
                      onPressed: () {
                        // 시그니처 커넥션 설정 페이지로 이동
                        Navigator.push(
                          context,
                          MaterialPageRoute(
                            builder: (context) => const ProfileEditPage(),
                          ),
                        );
                      },
                      icon: const Icon(Icons.add),
                      label: const Text('설정하기'),
                    ),
                  ],
                );
              }
              
              return Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // MBTI 표시
                  if (preferences.mbti != null) ...[
                    _buildSectionTitle('MBTI'),
                    const SizedBox(height: AppSpacing.sm),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.lg,
                        vertical: AppSpacing.sm,
                      ),
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.primary.withOpacity(0.1),
                            AppColors.secondary.withOpacity(0.1),
                          ],
                        ),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: AppColors.primary.withOpacity(0.3),
                        ),
                      ),
                      child: Text(
                        preferences.mbti!,
                        style: AppTextStyles.titleMedium.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                  ],
                  
                  // 관심사 표시
                  if (preferences.interests != null && preferences.interests!.isNotEmpty) ...[
                    _buildSectionTitle('관심사'),
                    const SizedBox(height: AppSpacing.sm),
                    Wrap(
                      spacing: AppSpacing.sm,
                      runSpacing: AppSpacing.sm,
                      children: preferences.interests!
                          .map((interest) => _buildInterestChip(interest))
                          .toList(),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                  ],
                  
                  // 개인 이야기 표시
                  if (preferences.memorablePlace != null || 
                      preferences.childhoodMemory != null ||
                      preferences.turningPoint != null) ...[
                    _buildSectionTitle('나의 이야기'),
                    const SizedBox(height: AppSpacing.sm),
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.md),
                      decoration: BoxDecoration(
                        color: AppColors.grey50,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (preferences.memorablePlace != null)
                            _buildStoryItem('📍', '기억에 남는 장소', preferences.memorablePlace!),
                          if (preferences.childhoodMemory != null)
                            _buildStoryItem('🧸', '어린 시절 추억', preferences.childhoodMemory!),
                          if (preferences.turningPoint != null)
                            _buildStoryItem('🔄', '인생의 터닝포인트', preferences.turningPoint!),
                          if (preferences.proudestMoment != null)
                            _buildStoryItem('🏆', '가장 자랑스러운 순간', preferences.proudestMoment!),
                          if (preferences.bucketList != null)
                            _buildStoryItem('🎯', '버킷리스트', preferences.bucketList!),
                          if (preferences.lifeLesson != null)
                            _buildStoryItem('💡', '인생의 교훈', preferences.lifeLesson!),
                        ],
                      ),
                    ),
                  ],
                ],
              );
            },
          ),
        ],
      ),
    );
  }
  
  Widget _buildProfileImage(String? avatarUrl) {
    return Container(
      width: 100,
      height: 100,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppColors.white.withOpacity(0.9),
            AppColors.white.withOpacity(0.7),
          ],
        ),
        shape: BoxShape.circle,
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withOpacity(0.2),
            blurRadius: 20,
            offset: const Offset(0, 10),
          ),
        ],
      ),
      child: ClipOval(
        child: avatarUrl != null && avatarUrl.isNotEmpty
            ? Image.network(
                avatarUrl,
                fit: BoxFit.cover,
                errorBuilder: (context, error, stackTrace) => const Icon(
                  Icons.person,
                  size: 50,
                  color: AppColors.primary,
                ),
              )
            : const Icon(
                Icons.person,
                size: 50,
                color: AppColors.primary,
              ),
      ),
    );
  }
  
  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.labelLarge.copyWith(
        color: AppColors.grey700,
        fontWeight: FontWeight.w600,
      ),
    );
  }
  
  Widget _buildInterestChip(String interest) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.xs,
      ),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: AppColors.primary.withOpacity(0.3),
        ),
      ),
      child: Text(
        interest,
        style: AppTextStyles.labelMedium.copyWith(
          color: AppColors.primary,
        ),
      ),
    );
  }
  
  Widget _buildStoryItem(String emoji, String title, String content) {
    return Padding(
      padding: const EdgeInsets.only(bottom: AppSpacing.md),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(emoji, style: TextStyle(fontSize: 20)),
          const SizedBox(width: AppSpacing.sm),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: AppTextStyles.labelSmall.copyWith(
                    color: AppColors.grey600,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  content,
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.grey900,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
  
  
  Widget _buildMenuCard() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Column(
        children: [
          _buildMenuItem(
            icon: Icons.person,
            title: '프로필 편집',
            subtitle: '사진, 소개 수정',
            onTap: () {
              HapticFeedback.lightImpact();
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => const ProfileEditPage(),
                ),
              );
            },
          ),
          _buildDivider(),
          _buildMenuItem(
            icon: Icons.notifications,
            title: '알림 설정',
            subtitle: '알림 관리',
            onTap: () {
              HapticFeedback.lightImpact();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('준비중입니다'),
                  backgroundColor: AppColors.primary,
                  duration: Duration(seconds: 2),
                ),
              );
            },
          ),
          _buildDivider(),
          _buildMenuItem(
            icon: Icons.help,
            title: '도움말',
            subtitle: 'FAQ, 문의하기',
            onTap: () {
              HapticFeedback.lightImpact();
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('준비중입니다'),
                  backgroundColor: AppColors.primary,
                  duration: Duration(seconds: 2),
                ),
              );
            },
          ),
          _buildDivider(),
          _buildMenuItem(
            icon: Icons.description,
            title: '서비스 이용약관',
            subtitle: '서비스 이용 약관 확인',
            onTap: () async {
              HapticFeedback.lightImpact();
              final url = Uri.parse('https://relic-baboon-412.notion.site/250766a8bb4680419472d283a09bf8c6');
              try {
                await launchUrl(url, mode: LaunchMode.externalApplication);
              } catch (e) {
                print('Could not launch URL: $e');
                // 에러 발생 시 스낵바 표시
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('링크를 열 수 없습니다'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              }
            },
          ),
          _buildDivider(),
          _buildMenuItem(
            icon: Icons.privacy_tip,
            title: '개인정보처리방침',
            subtitle: '개인정보 처리 방침 확인',
            onTap: () async {
              HapticFeedback.lightImpact();
              final url = Uri.parse('https://relic-baboon-412.notion.site/250766a8bb4680f19a28d843992ff9ff');
              try {
                await launchUrl(url, mode: LaunchMode.externalApplication);
              } catch (e) {
                print('Could not launch URL: $e');
                // 에러 발생 시 스낵바 표시
                if (context.mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(
                      content: Text('링크를 열 수 없습니다'),
                      backgroundColor: AppColors.error,
                    ),
                  );
                }
              }
            },
          ),
        ],
      ),
    );
  }
  
  Widget _buildMenuItem({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(20),
        child: Padding(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: AppColors.primary.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  icon,
                  color: AppColors.primary,
                  size: 20,
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: AppTextStyles.titleSmall.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    Text(
                      subtitle,
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.grey600,
                      ),
                    ),
                  ],
                ),
              ),
              Icon(
                Icons.arrow_forward_ios,
                size: 16,
                color: AppColors.grey400,
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Widget _buildDivider() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
      child: Divider(
        height: 1,
        color: AppColors.grey100,
      ),
    );
  }
  
  Widget _buildLogoutButton() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.grey600,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.grey600.withOpacity(0.2),
            blurRadius: 8,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            HapticFeedback.mediumImpact();
            _showLogoutDialog();
          },
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.xl,
              vertical: AppSpacing.lg,
            ),
            child: Center(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.logout,
                    color: AppColors.white,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    '로그아웃',
                    style: AppTextStyles.titleMedium.copyWith(
                      color: AppColors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
  
  void _showLogoutDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text('로그아웃'),
        content: const Text('정말 로그아웃 하시겠습니까?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('취소'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              
              // 로그아웃 처리
              try {
                // AuthProvider 로그아웃 (Firebase 로그아웃과 토큰 삭제 모두 처리)
                await ref.read(authProvider.notifier).logout();
                
                // 스플래시 화면으로 이동
                if (mounted) {
                  context.go('/splash');
                }
              } catch (e) {
                print('Logout error: $e');
                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text('로그아웃 실패: $e'),
                      backgroundColor: AppColors.grey600,
                    ),
                  );
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.grey600,
            ),
            child: const Text('로그아웃'),
          ),
        ],
      ),
    );
  }

  Widget _buildDeleteAccountButton() {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: AppColors.grey300,
          width: 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            HapticFeedback.mediumImpact();
            _showDeleteAccountDialog();
          },
          borderRadius: BorderRadius.circular(16),
          child: Padding(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.xl,
              vertical: AppSpacing.lg,
            ),
            child: Center(
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.person_remove,
                    color: AppColors.grey600,
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    '회원탈퇴',
                    style: AppTextStyles.titleMedium.copyWith(
                      color: AppColors.grey600,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
        ),
        title: const Text('회원탈퇴'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('정말로 회원탈퇴를 하시겠습니까?'),
            const SizedBox(height: AppSpacing.sm),
            Text(
              '• 모든 데이터가 삭제됩니다\n• 복구가 불가능합니다\n• 동일한 계정으로 재가입이 가능합니다',
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.grey600,
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('취소'),
          ),
          ElevatedButton(
            onPressed: () async {
              Navigator.pop(context);
              
              // 재확인 다이얼로그
              final confirmed = await showDialog<bool>(
                context: context,
                builder: (context) => AlertDialog(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                  title: const Text('마지막 확인'),
                  content: const Text('정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text('취소'),
                    ),
                    ElevatedButton(
                      onPressed: () => Navigator.pop(context, true),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.grey600,
                      ),
                      child: const Text('탈퇴하기'),
                    ),
                  ],
                ),
              );

              if (confirmed == true) {
                try {
                  // Show loading indicator
                  showDialog(
                    context: context,
                    barrierDismissible: false,
                    builder: (context) => const Center(
                      child: CircularProgressIndicator(),
                    ),
                  );

                  // Call delete account API
                  final AuthService authService = AuthService();
                  await authService.deleteAccount();

                  // Close loading dialog
                  if (mounted) {
                    Navigator.pop(context);
                  }

                  // Clear auth state
                  await ref.read(authProvider.notifier).logout();

                  // Navigate to splash
                  if (mounted) {
                    context.go('/splash');
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('회원탈퇴가 완료되었습니다'),
                        backgroundColor: AppColors.grey600,
                      ),
                    );
                  }
                } catch (e) {
                  // Close loading dialog
                  if (mounted) {
                    Navigator.pop(context);
                  }

                  print('Delete account error: $e');
                  if (mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        content: Text('회원탈퇴 실패: $e'),
                        backgroundColor: AppColors.grey600,
                      ),
                    );
                  }
                }
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.grey600,
            ),
            child: const Text('회원탈퇴'),
          ),
        ],
      ),
    );
  }
}