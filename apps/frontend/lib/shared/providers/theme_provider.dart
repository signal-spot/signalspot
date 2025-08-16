import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';

// 시간 기반 그라데이션을 실시간으로 관리하는 Provider
final timeBasedGradientProvider = StateNotifierProvider<TimeBasedGradientNotifier, LinearGradient>((ref) {
  return TimeBasedGradientNotifier();
});

class TimeBasedGradientNotifier extends StateNotifier<LinearGradient> {
  Timer? _timer;
  
  TimeBasedGradientNotifier() : super(AppColors.getTimeBasedGradient()) {
    // 매분마다 그라데이션 업데이트 체크
    _startTimer();
  }
  
  void _startTimer() {
    // 즉시 한 번 업데이트
    _updateGradient();
    
    // 매분마다 업데이트 (정시에 맞춰서)
    final now = DateTime.now();
    final nextMinute = DateTime(now.year, now.month, now.day, now.hour, now.minute + 1);
    final initialDelay = nextMinute.difference(now);
    
    // 다음 분까지 대기 후 시작
    Future.delayed(initialDelay, () {
      _updateGradient();
      // 이후 매분마다 업데이트
      _timer = Timer.periodic(const Duration(minutes: 1), (_) {
        _updateGradient();
      });
    });
  }
  
  void _updateGradient() {
    final newGradient = AppColors.getTimeBasedGradient();
    // 그라데이션이 실제로 변경되었을 때만 상태 업데이트
    if (state != newGradient) {
      state = newGradient;
      print('Gradient updated at ${DateTime.now().hour}:${DateTime.now().minute}');
    }
  }
  
  // 수동으로 업데이트 강제
  void refresh() {
    _updateGradient();
  }
  
  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }
}