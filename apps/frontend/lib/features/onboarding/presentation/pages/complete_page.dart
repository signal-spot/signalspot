import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/widgets/spark_icon.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../auth/presentation/models/auth_state.dart';
import '../../../auth/data/models/auth_models.dart';

class CompletePage extends ConsumerStatefulWidget {
  const CompletePage({super.key});

  @override
  ConsumerState<CompletePage> createState() => _CompletePageState();
}

class _CompletePageState extends ConsumerState<CompletePage>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late AnimationController _confettiController;
  late Animation<double> _fadeAnimation;
  late Animation<double> _scaleAnimation;
  late Animation<double> _confettiAnimation;
  
  bool _isRegistering = false;

  @override
  void initState() {
    super.initState();
    
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 1000),
      vsync: this,
    );
    
    _confettiController = AnimationController(
      duration: const Duration(milliseconds: 1500),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
    ));
    
    _scaleAnimation = Tween<double>(
      begin: 0.5,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.3, 0.8, curve: Curves.elasticOut),
    ));
    
    _confettiAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _confettiController,
      curve: Curves.easeOut,
    ));
    
    _animationController.forward();
    
    // 1초 후 confetti 애니메이션 시작
    Future.delayed(const Duration(milliseconds: 600), () {
      if (mounted) {
        _confettiController.forward();
      }
    });
  }

  @override
  void dispose() {
    _animationController.dispose();
    _confettiController.dispose();
    super.dispose();
  }

  Future<void> _completeRegistration() async {
    setState(() => _isRegistering = true);
    
    try {
      HapticFeedback.mediumImpact();
      
      print('CompletePage: 온보딩 완료 처리 시작');
      
      // 프로필 완료 상태를 확실하게 업데이트
      final authNotifier = ref.read(authProvider.notifier);
      authNotifier.updateUserInfo({
        'profileCompleted': true,
      });
      
      print('CompletePage: profileCompleted를 true로 업데이트 완료');
      
      // 프로필 정보 다시 로드하여 확실히 반영
      await authNotifier.refreshUserProfile();
      
      // 성공 햅틱 피드백
      HapticFeedback.heavyImpact();
      
      // 애니메이션을 위한 짧은 대기
      await Future.delayed(const Duration(milliseconds: 500));
      
      print('CompletePage: 메인 화면으로 이동');
      
      if (mounted) {
        // 메인 화면으로 이동
        context.go('/home');
      }
    } catch (e) {
      print('CompletePage: 오류 발생: $e');
      if (mounted) {
        setState(() => _isRegistering = false);
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('오류가 발생했습니다: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      body: Stack(
        children: [
          // Confetti Background
          AnimatedBuilder(
            animation: _confettiAnimation,
            builder: (context, child) {
              return CustomPaint(
                painter: ConfettiPainter(_confettiAnimation.value),
                size: Size.infinite,
              );
            },
          ),
          
          // Main Content
          SafeArea(
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: Padding(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  children: [
                    const Spacer(flex: 2),
                    
                    // Success Icon
                    ScaleTransition(
                      scale: _scaleAnimation,
                      child: Container(
                        width: 120,
                        height: 120,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                            colors: [
                              AppColors.primary,
                              AppColors.secondary,
                            ],
                          ),
                          shape: BoxShape.circle,
                          boxShadow: [
                            BoxShadow(
                              color: AppColors.primary.withOpacity(0.4),
                              blurRadius: 20,
                              offset: const Offset(0, 8),
                            ),
                          ],
                        ),
                        child: const Icon(
                          Icons.check,
                          size: 60,
                          color: Colors.white,
                        ),
                      ),
                    ),
                    
                    const SizedBox(height: AppSpacing.xxl),
                    
                    // Title
                    Text(
                      '설정 완료!',
                      style: AppTextStyles.headlineLarge.copyWith(
                        fontWeight: FontWeight.w800,
                        color: AppColors.textPrimary,
                      ),
                    ),
                    
                    const SizedBox(height: AppSpacing.md),
                    
                    // Subtitle
                    Text(
                      '이제 SignalSpot에서\n특별한 만남을 시작해보세요!',
                      style: AppTextStyles.bodyLarge.copyWith(
                        color: AppColors.textSecondary,
                        height: 1.5,
                      ),
                      textAlign: TextAlign.center,
                    ),
                    
                    const SizedBox(height: AppSpacing.xxl),
                    
                    // Features Preview
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(color: AppColors.grey200),
                      ),
                      child: Column(
                        children: [
                          _buildFeatureItem(
                            Icons.location_on,
                            '주변 탐색',
                            '가까운 거리의 사람들을 찾아보세요',
                            AppColors.primary,
                          ),
                          const SizedBox(height: AppSpacing.lg),
                          _buildFeatureItem(
                            const SparkIcon(size: 24),
                            '스파크 보내기',
                            '마음에 드는 사람에게 관심 표현하기',
                            AppColors.sparkActive,
                          ),
                          const SizedBox(height: AppSpacing.lg),
                          _buildFeatureItem(
                            Icons.note_add,
                            '쪽지 남기기',
                            '특별한 장소에 나만의 이야기 남기기',
                            AppColors.secondary,
                          ),
                        ],
                      ),
                    ),
                    
                    const Spacer(flex: 3),
                    
                    // Start Button
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: _isRegistering ? null : _completeRegistration,
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          foregroundColor: Colors.white,
                          elevation: 8,
                          shadowColor: AppColors.primary.withOpacity(0.4),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(16),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
                        ),
                        child: _isRegistering
                            ? Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(
                                      strokeWidth: 2,
                                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                    ),
                                  ),
                                  const SizedBox(width: AppSpacing.md),
                                  Text(
                                    '시작하는 중...',
                                    style: AppTextStyles.titleMedium.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              )
                            : Row(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const Icon(Icons.rocket_launch, size: 24),
                                  const SizedBox(width: AppSpacing.sm),
                                  Text(
                                    'SignalSpot 시작하기',
                                    style: AppTextStyles.titleMedium.copyWith(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                ],
                              ),
                      ),
                    ),
                    
                    const SizedBox(height: AppSpacing.lg),
                  ],
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildFeatureItem(dynamic icon, String title, String description, Color color) {
    return Row(
      children: [
        Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(12),
          ),
          child: icon is IconData
              ? Icon(
                  icon,
                  color: color,
                  size: 24,
                )
              : icon,
        ),
        const SizedBox(width: AppSpacing.md),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTextStyles.titleSmall.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              Text(
                description,
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.textSecondary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class ConfettiPainter extends CustomPainter {
  final double animation;
  
  ConfettiPainter(this.animation);

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint();
    final colors = [
      AppColors.primary,
      AppColors.secondary,
      AppColors.sparkActive,
      AppColors.success,
      AppColors.sparkActive,
    ];
    
    for (int i = 0; i < 20; i++) {
      paint.color = colors[i % colors.length].withOpacity(0.7);
      
      final x = (size.width * (i * 0.1 + 0.05)) + 
                (50 * (i.isEven ? 1 : -1) * animation);
      final y = size.height * animation * (0.5 + i * 0.05);
      
      canvas.drawCircle(
        Offset(x, y),
        4 + (i % 3),
        paint,
      );
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}