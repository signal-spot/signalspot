import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';

class InterestsPage extends StatefulWidget {
  const InterestsPage({super.key});

  @override
  State<InterestsPage> createState() => _InterestsPageState();
}

class _InterestsPageState extends State<InterestsPage>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  
  final Set<String> _selectedInterests = {};
  final int _minSelection = 3;
  final int _maxSelection = 8;
  
  final List<Map<String, dynamic>> _interests = [
    {'name': '음악', 'icon': Icons.music_note, 'color': AppColors.primary},
    {'name': '영화', 'icon': Icons.movie, 'color': AppColors.secondary},
    {'name': '독서', 'icon': Icons.menu_book, 'color': AppColors.success},
    {'name': '여행', 'icon': Icons.flight, 'color': AppColors.sparkActive},
    {'name': '운동', 'icon': Icons.fitness_center, 'color': AppColors.error},
    {'name': '요리', 'icon': Icons.restaurant, 'color': AppColors.primary},
    {'name': '사진', 'icon': Icons.camera_alt, 'color': AppColors.secondary},
    {'name': '게임', 'icon': Icons.videogame_asset, 'color': AppColors.success},
    {'name': '카페', 'icon': Icons.local_cafe, 'color': AppColors.sparkActive},
    {'name': '반려동물', 'icon': Icons.pets, 'color': AppColors.error},
    {'name': '쇼핑', 'icon': Icons.shopping_bag, 'color': AppColors.primary},
    {'name': '드라마', 'icon': Icons.tv, 'color': AppColors.secondary},
    {'name': '미술', 'icon': Icons.palette, 'color': AppColors.success},
    {'name': '산책', 'icon': Icons.directions_walk, 'color': AppColors.sparkActive},
    {'name': '맛집탐방', 'icon': Icons.restaurant_menu, 'color': AppColors.error},
    {'name': '패션', 'icon': Icons.checkroom, 'color': AppColors.primary},
    {'name': '공연', 'icon': Icons.theater_comedy, 'color': AppColors.secondary},
    {'name': '전시회', 'icon': Icons.museum, 'color': AppColors.success},
    {'name': '스포츠관람', 'icon': Icons.stadium, 'color': AppColors.sparkActive},
    {'name': '댄스', 'icon': Icons.sports_kabaddi, 'color': AppColors.error},
  ];

  @override
  void initState() {
    super.initState();
    
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.easeOut,
    ));
    
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  void _toggleInterest(String interest) {
    setState(() {
      if (_selectedInterests.contains(interest)) {
        _selectedInterests.remove(interest);
      } else {
        if (_selectedInterests.length < _maxSelection) {
          _selectedInterests.add(interest);
        } else {
          // 최대 선택 개수 초과 시 햅틱 피드백
          HapticFeedback.lightImpact();
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('최대 $_maxSelection개까지 선택할 수 있습니다'),
              duration: const Duration(seconds: 2),
              backgroundColor: AppColors.sparkActive,
            ),
          );
        }
      }
    });
  }

  void _continue() {
    if (_selectedInterests.length >= _minSelection) {
      HapticFeedback.mediumImpact();
      
      // TODO: 선택한 관심사를 저장
      print('Selected interests: $_selectedInterests');
      
      context.push('/onboarding/nickname');
    } else {
      HapticFeedback.lightImpact();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('최소 $_minSelection개 이상 선택해주세요'),
          duration: const Duration(seconds: 2),
          backgroundColor: AppColors.error,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final canContinue = _selectedInterests.length >= _minSelection;
    
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios, color: AppColors.textPrimary),
        ),
      ),
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: Column(
          children: [
            // Header
            Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '관심사를 선택해주세요',
                    style: AppTextStyles.headlineMedium.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    '비슷한 취향을 가진 사람들과 만날 수 있어요\n($_minSelection-$_maxSelection개 선택)',
                    style: AppTextStyles.bodyLarge.copyWith(
                      color: AppColors.textSecondary,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.md),
                  
                  // Progress Indicator
                  LinearProgressIndicator(
                    value: _selectedInterests.length / _maxSelection,
                    backgroundColor: AppColors.grey200,
                    valueColor: AlwaysStoppedAnimation<Color>(
                      canContinue ? AppColors.success : AppColors.primary,
                    ),
                    minHeight: 4,
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    '${_selectedInterests.length}/$_maxSelection 선택됨',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: canContinue ? AppColors.success : AppColors.textSecondary,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ),
            
            // Interests Grid
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                child: Wrap(
                  spacing: AppSpacing.md,
                  runSpacing: AppSpacing.md,
                  children: _interests.map((interest) {
                    final isSelected = _selectedInterests.contains(interest['name']);
                    
                    return GestureDetector(
                      onTap: () => _toggleInterest(interest['name']),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.lg,
                          vertical: AppSpacing.md,
                        ),
                        decoration: BoxDecoration(
                          color: isSelected 
                              ? interest['color']
                              : AppColors.surface,
                          borderRadius: BorderRadius.circular(25),
                          border: Border.all(
                            color: isSelected 
                                ? interest['color']
                                : AppColors.grey300,
                            width: isSelected ? 2 : 1,
                          ),
                          boxShadow: isSelected ? [
                            BoxShadow(
                              color: interest['color'].withOpacity(0.3),
                              blurRadius: 8,
                              offset: const Offset(0, 2),
                            ),
                          ] : null,
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            Icon(
                              interest['icon'],
                              size: 20,
                              color: isSelected 
                                  ? Colors.white 
                                  : interest['color'],
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Text(
                              interest['name'],
                              style: AppTextStyles.bodyMedium.copyWith(
                                color: isSelected 
                                    ? Colors.white 
                                    : AppColors.textPrimary,
                                fontWeight: isSelected 
                                    ? FontWeight.w600 
                                    : FontWeight.w500,
                              ),
                            ),
                            if (isSelected) ...[
                              const SizedBox(width: AppSpacing.xs),
                              const Icon(
                                Icons.check_circle,
                                size: 16,
                                color: Colors.white,
                              ),
                            ],
                          ],
                        ),
                      ),
                    );
                  }).toList(),
                ),
              ),
            ),
            
            // Continue Button
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: AppColors.surface,
                border: Border(
                  top: BorderSide(color: AppColors.grey200, width: 1),
                ),
              ),
              child: Column(
                children: [
                  if (!canContinue)
                    Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.md),
                      child: Text(
                        '${_minSelection - _selectedInterests.length}개 더 선택해주세요',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),
                    ),
                  
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: canContinue ? _continue : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: canContinue 
                            ? AppColors.primary 
                            : AppColors.grey300,
                        foregroundColor: Colors.white,
                        elevation: canContinue ? 4 : 0,
                        shadowColor: canContinue 
                            ? AppColors.primary.withOpacity(0.3) 
                            : null,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                        padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                      ),
                      child: Text(
                        '다음',
                        style: AppTextStyles.titleMedium.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}