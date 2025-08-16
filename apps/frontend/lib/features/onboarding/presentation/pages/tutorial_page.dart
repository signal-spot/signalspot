import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/widgets/spark_icon.dart';

class TutorialPage extends StatefulWidget {
  const TutorialPage({super.key});

  @override
  State<TutorialPage> createState() => _TutorialPageState();
}

class _TutorialPageState extends State<TutorialPage>
    with TickerProviderStateMixin {
  late PageController _pageController;
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  
  int _currentPage = 0;
  final int _totalPages = 4;
  
  final List<Map<String, dynamic>> _tutorialData = [
    {
      'icon': Icons.location_on,
      'title': '위치 기반 매칭',
      'description': '내 주변의 특별한 사람들을 찾아보세요.\n실시간 위치를 기반으로 가까운 거리의\n사용자들과 연결됩니다.',
      'color': AppColors.primary,
    },
    {
      'icon': null,
      'customIcon': true,
      'title': '스파크로 소통하기',
      'description': '마음에 드는 사람에게 스파크를 보내보세요.\n서로 스파크를 보내면 채팅을 시작할 수 있어요.\n첫 만남의 설렘을 경험해보세요.',
      'color': AppColors.sparkActive,
    },
    {
      'icon': Icons.note_add,
      'title': '쪽지로 마음 전하기',
      'description': '특별한 장소에 나만의 쪽지를 남겨보세요.\n다른 사람들이 그 장소에 방문했을 때\n당신의 이야기를 읽을 수 있어요.',
      'color': AppColors.secondary,
    },
    {
      'icon': Icons.favorite,
      'title': '안전한 만남',
      'description': '모든 사용자는 인증을 거쳐 가입합니다.\n부적절한 행동은 즉시 신고할 수 있고\n안전한 소통 환경을 제공합니다.',
      'color': AppColors.error,
    },
  ];

  @override
  void initState() {
    super.initState();
    
    _pageController = PageController();
    
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeInOut,
    ));
    
    _animationController.forward();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _nextPage() {
    if (_currentPage < _totalPages - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    } else {
      _finishTutorial();
    }
  }

  void _previousPage() {
    if (_currentPage > 0) {
      _pageController.previousPage(
        duration: const Duration(milliseconds: 300),
        curve: Curves.easeInOut,
      );
    }
  }

  void _finishTutorial() {
    HapticFeedback.lightImpact();
    
    // 튜토리얼 완료를 로컬 저장소에 저장
    // TODO: SharedPreferences에 튜토리얼 완료 상태 저장
    
    // 바로 온보딩 시작
    context.go('/onboarding/welcome');
  }

  void _skipTutorial() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('튜토리얼 건너뛰기'),
        content: const Text('튜토리얼을 건너뛰고 바로 시작하시겠습니까?\n나중에 설정에서 다시 볼 수 있습니다.'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              _finishTutorial();
            },
            child: Text(
              '건너뛰기',
              style: TextStyle(color: AppColors.primary),
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        actions: [
          TextButton(
            onPressed: _skipTutorial,
            child: Text(
              '건너뛰기',
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
              ),
            ),
          ),
        ],
      ),
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: Column(
          children: [
            // Page Indicator
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(
                  _totalPages,
                  (index) => AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: _currentPage == index ? 24 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color: _currentPage == index
                          ? AppColors.primary
                          : AppColors.grey300,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                ),
              ),
            ),
            
            const SizedBox(height: AppSpacing.xl),
            
            // Tutorial Content
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: (index) {
                  setState(() => _currentPage = index);
                  HapticFeedback.selectionClick();
                },
                itemCount: _totalPages,
                itemBuilder: (context, index) {
                  final tutorial = _tutorialData[index];
                  
                  return Padding(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Icon
                        Container(
                          width: 120,
                          height: 120,
                          decoration: BoxDecoration(
                            color: tutorial['color'].withOpacity(0.1),
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: tutorial['color'].withOpacity(0.3),
                              width: 2,
                            ),
                          ),
                          child: tutorial['customIcon'] == true
                              ? const SparkIcon(
                                  size: 60,
                                )
                              : Icon(
                                  tutorial['icon'],
                                  size: 60,
                                  color: tutorial['color'],
                                ),
                        ),
                        
                        const SizedBox(height: AppSpacing.xxl),
                        
                        // Title
                        Text(
                          tutorial['title'],
                          style: AppTextStyles.headlineMedium.copyWith(
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        
                        const SizedBox(height: AppSpacing.lg),
                        
                        // Description
                        Text(
                          tutorial['description'],
                          style: AppTextStyles.bodyLarge.copyWith(
                            color: AppColors.textSecondary,
                            height: 1.6,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            
            // Navigation Buttons
            Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Row(
                children: [
                  // Previous Button
                  if (_currentPage > 0)
                    Expanded(
                      child: OutlinedButton(
                        onPressed: _previousPage,
                        style: OutlinedButton.styleFrom(
                          side: BorderSide(color: AppColors.grey300),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                          padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                        ),
                        child: Text(
                          '이전',
                          style: AppTextStyles.titleSmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),
                    )
                  else
                    const Expanded(child: SizedBox()),
                  
                  const SizedBox(width: AppSpacing.md),
                  
                  // Next/Finish Button
                  Expanded(
                    flex: 2,
                    child: ElevatedButton(
                      onPressed: _nextPage,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        elevation: 4,
                        shadowColor: AppColors.primary.withOpacity(0.3),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                      ),
                      child: Text(
                        _currentPage == _totalPages - 1 ? '시작하기' : '다음',
                        style: AppTextStyles.titleSmall.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            
            // Safe Area Bottom
            SizedBox(height: MediaQuery.of(context).padding.bottom),
          ],
        ),
      ),
    );
  }
}