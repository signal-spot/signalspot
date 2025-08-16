import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:permission_handler/permission_handler.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';

class PermissionsPage extends ConsumerStatefulWidget {
  const PermissionsPage({super.key});

  @override
  ConsumerState<PermissionsPage> createState() => _PermissionsPageState();
}

class _PermissionsPageState extends ConsumerState<PermissionsPage> {
  final PageController _pageController = PageController();
  int _currentStep = 0;
  bool _isRequestingPermission = false;

  final List<PermissionStep> _permissionSteps = [
    PermissionStep(
      title: '주변의 인연을 찾아드려요',
      description: '근처에 있는 다른 시그널 사용자를 감지합니다',
      details: [
        '위치 정보는 암호화되어 안전하게 보호됩니다',
        '언제든 설정에서 변경 가능합니다',
        '정확한 위치가 아닌 대략적인 영역만 사용됩니다',
      ],
      icon: Icons.location_on_outlined,
      permission: Permission.location,
      primaryButtonText: '위치 권한 허용',
      secondaryButtonText: '건너뛰기',
    ),
    PermissionStep(
      title: '새로운 인연을 놓치지 마세요',
      description: '스파크 발생 시 실시간 알림을 받아보세요',
      details: [
        '스파크 발생 시 실시간 알림',
        '받은 쪽지와 시그널 알림',
        '방해 금지 시간 설정 가능',
      ],
      icon: Icons.notifications_outlined,
      permission: Permission.notification,
      primaryButtonText: '알림 권한 허용',
      secondaryButtonText: '건너뛰기',
    ),
  ];

  Future<void> _requestPermission(Permission permission) async {
    setState(() {
      _isRequestingPermission = true;
    });

    try {
      print('Requesting permission: $permission');
      
      // 먼저 권한 상태 확인
      var status = await permission.status;
      print('Current permission status: $status');
      
      // permanentlyDenied나 restricted인 경우 설정 앱으로 이동
      if (status.isPermanentlyDenied || status.isRestricted) {
        // 사용자에게 설정으로 이동할 것인지 물어보기
        if (mounted) {
          final shouldOpenSettings = await showDialog<bool>(
            context: context,
            builder: (context) => AlertDialog(
              title: const Text('권한 설정 필요'),
              content: const Text('이 권한을 사용하려면 설정에서 직접 허용해주세요.'),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(context, false),
                  child: const Text('건너뛰기'),
                ),
                TextButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: const Text('설정으로 이동'),
                ),
              ],
            ),
          );
          
          if (shouldOpenSettings == true) {
            await openAppSettings();
            // 설정에서 돌아온 후 다시 권한 상태 확인
            await Future.delayed(const Duration(milliseconds: 500));
            status = await permission.status;
          }
        }
      } else if (!status.isGranted) {
        // 권한 요청
        status = await permission.request();
        print('Permission result: $status');
      }
      
      // 결과에 관계없이 다음 단계로 진행
      await Future.delayed(const Duration(milliseconds: 500));
      _nextStep();
      
    } catch (e) {
      print('Permission request error: $e');
      // 오류가 발생해도 다음 단계로 진행
      _nextStep();
    } finally {
      setState(() {
        _isRequestingPermission = false;
      });
    }
  }

  void _nextStep() {
    if (_currentStep < _permissionSteps.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
      setState(() {
        _currentStep++;
      });
    } else {
      // 권한 설정 완료 후 프로필 설정 페이지로 이동
      context.go('/onboarding/profile');
    }
  }

  void _skipPermission() {
    _nextStep();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Column(
          children: [
            // 상단 진행 바
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '단계 ${_currentStep + 1} / ${_permissionSteps.length}',
                    style: AppTextStyles.labelMedium.copyWith(
                      color: AppColors.grey600,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  LinearProgressIndicator(
                    value: (_currentStep + 1) / _permissionSteps.length,
                    backgroundColor: AppColors.grey200,
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),

            // PageView
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _permissionSteps.length,
                itemBuilder: (context, index) {
                  final step = _permissionSteps[index];
                  
                  return _PermissionStepContent(
                    step: step,
                    isLoading: _isRequestingPermission,
                    onPrimaryPressed: () => _requestPermission(step.permission),
                    onSecondaryPressed: _skipPermission,
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _PermissionStepContent extends StatelessWidget {
  final PermissionStep step;
  final bool isLoading;
  final VoidCallback onPrimaryPressed;
  final VoidCallback onSecondaryPressed;

  const _PermissionStepContent({
    required this.step,
    required this.isLoading,
    required this.onPrimaryPressed,
    required this.onSecondaryPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        children: [
          const Spacer(),

          // 아이콘
          Container(
            width: 100,
            height: 100,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(50),
            ),
            child: Icon(
              step.icon,
              size: 50,
              color: AppColors.primary,
            ),
          ),

          const SizedBox(height: AppSpacing.xl),

          // 타이틀
          Text(
            step.title,
            style: AppTextStyles.headlineMedium.copyWith(
              fontWeight: FontWeight.w600,
            ),
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: AppSpacing.md),

          // 설명
          Text(
            step.description,
            style: AppTextStyles.bodyLarge.copyWith(
              color: AppColors.grey700,
            ),
            textAlign: TextAlign.center,
          ),

          const SizedBox(height: AppSpacing.xl),

          // 상세 설명 리스트
          Column(
            children: step.details.map((detail) {
              return Padding(
                padding: const EdgeInsets.symmetric(
                  vertical: AppSpacing.xs,
                ),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      margin: const EdgeInsets.only(
                        top: AppSpacing.xs,
                        right: AppSpacing.sm,
                      ),
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                    Expanded(
                      child: Text(
                        detail,
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.grey600,
                        ),
                      ),
                    ),
                  ],
                ),
              );
            }).toList(),
          ),

          const Spacer(flex: 2),

          // 버튼들
          Column(
            children: [
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: isLoading ? null : onPrimaryPressed,
                  child: isLoading
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(
                              AppColors.white,
                            ),
                          ),
                        )
                      : Text(step.primaryButtonText),
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: isLoading ? null : onSecondaryPressed,
                  child: Text(step.secondaryButtonText),
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.lg),
        ],
      ),
    );
  }
}

class PermissionStep {
  final String title;
  final String description;
  final List<String> details;
  final IconData icon;
  final Permission permission;
  final String primaryButtonText;
  final String secondaryButtonText;

  PermissionStep({
    required this.title,
    required this.description,
    required this.details,
    required this.icon,
    required this.permission,
    required this.primaryButtonText,
    required this.secondaryButtonText,
  });
}