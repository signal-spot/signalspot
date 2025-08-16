import 'package:flutter/material.dart';

/// SignalSpot 앱의 컬러 팔레트를 정의하는 클래스
/// DESIGN_SYSTEM.md 파일의 컬러 정의를 기반으로 구현
class AppColors {
  AppColors._();

  // Primary Colors
  static const Color primary = Color(0xFF6750A4);
  static const Color secondary = Color(0xFF625B71);
  
  // Surface Colors
  static const Color surface = Color(0xFFFFFBFE);
  static const Color background = Color(0xFFF5F5F5);
  
  // Semantic Colors
  static const Color error = Color(0xFFBA1A1A);
  static const Color success = Color(0xFF31A354);
  static const Color sparkActive = Color(0xFFFFD700);
  
  // Grayscale
  static const Color white = Color(0xFFFFFFFF);
  static const Color black = Color(0xFF000000);
  static const Color grey50 = Color(0xFFFAFAFA);
  static const Color grey100 = Color(0xFFF5F5F5);
  static const Color grey200 = Color(0xFFEEEEEE);
  static const Color grey300 = Color(0xFFE0E0E0);
  static const Color grey400 = Color(0xFFBDBDBD);
  static const Color grey500 = Color(0xFF9E9E9E);
  static const Color grey600 = Color(0xFF757575);
  static const Color grey700 = Color(0xFF616161);
  static const Color grey800 = Color(0xFF424242);
  static const Color grey900 = Color(0xFF212121);
  
  // Text Colors
  static const Color textPrimary = Color(0xFF1C1B1F);
  static const Color textSecondary = Color(0xFF49454F);
  
  // Dark Mode Colors
  static const Color darkPrimary = Color(0xFF7B68EE);
  static const Color darkSurface = Color(0xFF121212);
  static const Color darkBackground = Color(0xFF000000);
  
  // Gradient Colors
  static const LinearGradient morningGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFFFE0B2), Color(0xFFFFCC02)],
  );
  
  static const LinearGradient eveningGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF6750A4), Color(0xFF9C27B0)],
  );
  
  static const LinearGradient nightGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF1A1A2E), Color(0xFF16213E)],
  );
  
  // 시간대별 그라데이션 반환 (보라색으로 고정)
  static LinearGradient getTimeBasedGradient() {
    // 모든 시간대에서 보라색 그라데이션 사용
    return eveningGradient;
  }
}