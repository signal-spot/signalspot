/// SignalSpot 앱의 스페이싱 시스템을 정의하는 클래스
/// DESIGN_SYSTEM.md 파일의 스페이싱 정의를 기반으로 구현
class AppSpacing {
  AppSpacing._();

  // Base Spacing Units
  static const double xs = 4.0;    // 최소 간격
  static const double sm = 8.0;    // 작은 간격
  static const double md = 16.0;   // 기본 간격
  static const double lg = 24.0;   // 큰 간격
  static const double xl = 32.0;   // 최대 간격
  static const double xxl = 48.0;  // 섹션 간 간격

  // Component Specific Spacing
  static const double buttonPadding = md;
  static const double cardPadding = md;
  static const double screenPadding = lg;
  static const double listItemSpacing = sm;
  static const double sectionSpacing = xxl;

  // Icon Sizes
  static const double iconXs = 16.0;
  static const double iconSm = 20.0;
  static const double iconMd = 24.0;
  static const double iconLg = 32.0;
  static const double iconXl = 48.0;

  // Touch Targets (접근성 가이드라인)
  static const double minTouchTarget = 44.0;
  
  // Border Radius
  static const double borderRadiusXs = 4.0;
  static const double borderRadiusSm = 8.0;
  static const double borderRadiusMd = 12.0;
  static const double borderRadiusLg = 16.0;
  static const double borderRadiusXl = 24.0;
}