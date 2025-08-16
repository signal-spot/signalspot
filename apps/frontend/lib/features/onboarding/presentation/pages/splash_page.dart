import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../../auth/presentation/models/auth_state.dart';

class SplashPage extends ConsumerStatefulWidget {
  const SplashPage({super.key});

  @override
  ConsumerState<SplashPage> createState() => _SplashPageState();
}

class _SplashPageState extends ConsumerState<SplashPage>
    with TickerProviderStateMixin {
  late AnimationController _pulseController;
  late AnimationController _gradientController;
  late Animation<double> _pulseAnimation;
  late Animation<double> _gradientAnimation;

  @override
  void initState() {
    super.initState();
    
    // 펄스 애니메이션 초기화
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

    // 그라데이션 애니메이션 초기화
    _gradientController = AnimationController(
      duration: const Duration(seconds: 3),
      vsync: this,
    );
    _gradientAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _gradientController,
      curve: Curves.easeInOut,
    ));

    // 애니메이션 시작
    _pulseController.repeat(reverse: true);
    _gradientController.forward();

    // 초기화 및 자동 로그인 체크
    _initializeApp();
  }

  Future<void> _initializeApp() async {
    // 최소 2초 대기 (스플래시 화면 노출)
    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;

    // 자동 로그인 체크
    final authState = ref.read(authProvider);
    
    print('Splash - Auth state: ${authState.runtimeType}');
    
    // 사용자 상태에 따른 라우팅
    if (authState is AuthenticatedState) {
      final user = authState.user;
      print('Splash - User is authenticated, profileCompleted: ${user.profileCompleted}');
      
      // profileCompleted 체크
      if (user.profileCompleted == true) {
        print('Splash - Profile completed, going to home');
        context.go('/home');
      } else {
        print('Splash - Profile not completed, going to onboarding');
        context.go('/onboarding/welcome');
      }
    } else {
      print('Splash - User not authenticated, going to phone auth');
      // 틴더 스타일: 전화번호 인증부터 시작
      context.go('/auth/phone');
    }
  }

  @override
  void dispose() {
    _pulseController.dispose();
    _gradientController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: AnimatedBuilder(
        animation: _gradientAnimation,
        builder: (context, child) {
          return Container(
            width: double.infinity,
            height: double.infinity,
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  Color.lerp(
                    AppColors.primary,
                    const Color(0xFF9C27B0),
                    _gradientAnimation.value,
                  )!,
                  Color.lerp(
                    const Color(0xFF9C27B0),
                    AppColors.primary,
                    _gradientAnimation.value,
                  )!,
                ],
              ),
            ),
            child: SafeArea(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                crossAxisAlignment: CrossAxisAlignment.center,
                children: [
                  const Spacer(flex: 2),
                  
                  // 로고 및 펄스 애니메이션
                  AnimatedBuilder(
                    animation: _pulseAnimation,
                    builder: (context, child) {
                      return Transform.scale(
                        scale: _pulseAnimation.value,
                        child: Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            color: AppColors.white.withOpacity(0.9),
                            borderRadius: BorderRadius.circular(60),
                            boxShadow: [
                              BoxShadow(
                                color: AppColors.white.withOpacity(0.3),
                                blurRadius: 20,
                                spreadRadius: 5,
                              ),
                            ],
                          ),
                          child: const Icon(
                            Icons.location_on,
                            size: 60,
                            color: AppColors.primary,
                          ),
                        ),
                      );
                    },
                  ),
                  
                  const SizedBox(height: AppSpacing.xl),
                  
                  // 앱 타이틀
                  Text(
                    'SignalSpot',
                    style: AppTextStyles.headlineLarge.copyWith(
                      color: AppColors.white,
                      fontWeight: FontWeight.w800,
                      letterSpacing: 1.2,
                    ),
                  ),
                  
                  const SizedBox(height: AppSpacing.sm),
                  
                  // 서브타이틀
                  Text(
                    '우연을 필연으로',
                    style: AppTextStyles.bodyLarge.copyWith(
                      color: AppColors.white.withOpacity(0.9),
                      letterSpacing: 0.8,
                    ),
                  ),
                  
                  const Spacer(flex: 3),
                  
                  // 로딩 인디케이터
                  SizedBox(
                    width: 200,
                    child: LinearProgressIndicator(
                      backgroundColor: AppColors.white.withOpacity(0.3),
                      valueColor: AlwaysStoppedAnimation<Color>(
                        AppColors.white.withOpacity(0.8),
                      ),
                      minHeight: 2,
                    ),
                  ),
                  
                  const SizedBox(height: AppSpacing.xl),
                  
                  // 로딩 텍스트
                  Text(
                    '인연을 찾는 중...',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.white.withOpacity(0.8),
                    ),
                  ),
                  
                  const SizedBox(height: AppSpacing.xxl),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}