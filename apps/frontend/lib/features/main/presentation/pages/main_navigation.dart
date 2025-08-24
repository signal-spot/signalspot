import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/providers/chat_provider.dart';
import '../../../../shared/providers/location_provider.dart';
import '../../../../shared/providers/signal_provider.dart';
import '../../../../shared/providers/theme_provider.dart';
import '../../../../core/widgets/version_update_dialog.dart';
import '../../../../main.dart';  // For globalVersionInfo
import 'home_page.dart';
import '../../../map/presentation/pages/map_page.dart';
import 'sparks_page.dart';
import 'chat_page.dart';
import 'profile_page.dart';
import '../../../../shared/widgets/spark_icon.dart';

// 현재 선택된 탭을 관리하는 Provider
final selectedTabProvider = StateProvider<int>((ref) => 0);

class MainNavigation extends ConsumerStatefulWidget {
  const MainNavigation({super.key});

  @override
  ConsumerState<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends ConsumerState<MainNavigation> {
  static bool _hasCheckedVersion = false;
  
  @override
  void initState() {
    super.initState();
    
    // Show version update dialog if needed
    if (!_hasCheckedVersion) {
      _hasCheckedVersion = true;
      WidgetsBinding.instance.addPostFrameCallback((_) {
        _checkForUpdate();
      });
    }
  }
  
  Future<void> _checkForUpdate() async {
    if (globalVersionInfo != null && globalVersionInfo!.needsUpdate) {
      print('📱 Showing update dialog from MainNavigation...');
      try {
        await VersionUpdateDialog.show(context, globalVersionInfo!);
      } catch (e) {
        print('⚠️ Failed to show update dialog: $e');
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    print('🏠 MainNavigation: Starting build');
    
    try {
      final selectedTab = ref.watch(selectedTabProvider);
      final unreadCount = ref.watch(totalUnreadCountProvider);
      print('🏠 MainNavigation: Selected tab = $selectedTab');
      
      // 탭 변경 시 데이터 초기 로드
      ref.listen(selectedTabProvider, (previous, next) {
        print('📱 Tab changed from $previous to $next');
        
        if (next == 1) { // 지도 탭 선택시
          print('🗺️ Map tab selected');
          // 지도 탭에서 권한 확인 후 위치를 가져오도록 변경
          // MainNavigation에서는 자동으로 위치를 가져오지 않음
        } else if (next == 3) { // 채팅 탭 선택시
          ref.read(chatRoomsProvider.notifier).loadChatRooms();
        }
      });

      // 각 탭의 페이지들 - 실제 구현된 페이지들 사용
      print('🏠 MainNavigation: Creating pages array');
      final pages = [
        const HomePage(),         // 홈 (실제 구현된 버전)
        const MapPage(),         // 지도 (실제 구현된 버전)
        const SparksPage(),      // 스파크 (실제 구현된 버전) 
        const ChatPage(),        // 채팅 (실제 구현된 버전)
        const ProfilePage(),     // 프로필 (실제 구현된 버전)
      ];
      
      print('🏠 MainNavigation: Pages array created with ${pages.length} pages');
      print('🏠 MainNavigation: Creating Scaffold with IndexedStack');

      return Scaffold(
        body: IndexedStack(
          index: selectedTab,
          children: pages,
        ),
        bottomNavigationBar: _CustomBottomNavigationBar(
          currentIndex: selectedTab,
          unreadCount: unreadCount,
          onTap: (index) {
            print('🏠 MainNavigation: Tab tapped = $index');
            ref.read(selectedTabProvider.notifier).state = index;
          },
        ),
      );
    } catch (e, stackTrace) {
      print('❌ MainNavigation: ERROR in build method');
      print('❌ Error: $e');
      print('❌ StackTrace: $stackTrace');
      rethrow;
    }
  }
}

class _CustomBottomNavigationBar extends ConsumerWidget {
  final int currentIndex;
  final int unreadCount;
  final Function(int) onTap;

  const _CustomBottomNavigationBar({
    required this.currentIndex,
    required this.unreadCount,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final timeBasedGradient = ref.watch(timeBasedGradientProvider);
    
    return Container(
      decoration: BoxDecoration(
        gradient: timeBasedGradient,
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withOpacity(0.1),
            blurRadius: 10,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(
            horizontal: AppSpacing.sm,
            vertical: AppSpacing.xs,
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: [
              _buildNavItem(
                context: context,
                index: 0,
                icon: Icons.home_outlined,
                selectedIcon: Icons.home,
                label: '홈',
              ),
              _buildNavItem(
                context: context,
                index: 1,
                icon: Icons.location_on_outlined,
                selectedIcon: Icons.location_on,
                label: '스팟',
              ),
              _buildSparkButton(context),
              _buildNavItem(
                context: context,
                index: 3,
                icon: Icons.chat_bubble_outline,
                selectedIcon: Icons.chat_bubble,
                label: '채팅',
                showBadge: unreadCount > 0,
                badgeCount: unreadCount,
              ),
              _buildNavItem(
                context: context,
                index: 4,
                icon: Icons.person_outline,
                selectedIcon: Icons.person,
                label: '프로필',
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildNavItem({
    required BuildContext context,
    required int index,
    required IconData icon,
    required IconData selectedIcon,
    required String label,
    bool showBadge = false,
    int badgeCount = 0,
  }) {
    final isSelected = currentIndex == index;
    
    return GestureDetector(
      onTap: () => onTap(index),
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(
          horizontal: AppSpacing.sm,
          vertical: AppSpacing.xs,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Stack(
              children: [
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.all(AppSpacing.xs),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.white.withOpacity(0.2)
                        : Colors.transparent,
                    borderRadius: BorderRadius.circular(AppSpacing.borderRadiusSm),
                  ),
                  child: Icon(
                    isSelected ? selectedIcon : icon,
                    size: AppSpacing.iconMd,
                    color: isSelected
                        ? AppColors.sparkActive
                        : AppColors.white.withOpacity(0.7),
                  ),
                ),
                if (showBadge && badgeCount > 0)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: AppColors.error,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        badgeCount > 99 ? '99+' : badgeCount.toString(),
                        style: AppTextStyles.labelSmall.copyWith(
                          color: AppColors.white,
                          fontSize: 10,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
            const SizedBox(height: AppSpacing.xs),
            AnimatedDefaultTextStyle(
              duration: const Duration(milliseconds: 200),
              style: AppTextStyles.labelSmall.copyWith(
                color: isSelected
                    ? AppColors.sparkActive
                    : AppColors.white.withOpacity(0.7),
                fontWeight: isSelected
                    ? FontWeight.w600
                    : FontWeight.w400,
              ),
              child: Text(label),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildSparkButton(BuildContext context) {
    final isSelected = currentIndex == 2;
    
    return GestureDetector(
      onTap: () => onTap(2),
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 300),
        width: 60,
        height: 60,
        decoration: BoxDecoration(
          gradient: isSelected
              ? const LinearGradient(
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                  colors: [
                    AppColors.sparkActive,
                    Color(0xFFFFB000),
                  ],
                )
              : LinearGradient(
                  colors: [
                    AppColors.grey400,
                    AppColors.grey500,
                  ],
                ),
          shape: BoxShape.circle,
          boxShadow: isSelected
              ? [
                  BoxShadow(
                    color: AppColors.sparkActive.withOpacity(0.4),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ]
              : [
                  BoxShadow(
                    color: AppColors.black.withOpacity(0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
        ),
        child: Stack(
          alignment: Alignment.center,
          children: [
            // 펄스 효과 (선택된 상태일 때)
            if (isSelected)
              AnimatedContainer(
                duration: const Duration(seconds: 1),
                width: 70,
                height: 70,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: AppColors.sparkActive.withOpacity(0.3),
                    width: 2,
                  ),
                ),
              ),
            // 번개 아이콘
            isSelected
                ? const SparkIcon(
                    size: 28,
                  )
                : const Icon(
                    Icons.bolt,
                    size: 28,
                    color: AppColors.white,
                  ),
          ],
        ),
      ),
    );
  }
}

