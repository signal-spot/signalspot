import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../shared/services/notification_service.dart';

class AppLifecycleObserver extends ConsumerStatefulWidget {
  final Widget child;
  
  const AppLifecycleObserver({
    super.key,
    required this.child,
  });

  @override
  ConsumerState<AppLifecycleObserver> createState() => _AppLifecycleObserverState();
}

class _AppLifecycleObserverState extends ConsumerState<AppLifecycleObserver>
    with WidgetsBindingObserver {
  final NotificationService _notificationService = NotificationService();
  
  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    super.dispose();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    super.didChangeAppLifecycleState(state);
    
    switch (state) {
      case AppLifecycleState.resumed:
        // 앱이 포그라운드로 돌아왔을 때
        print('App resumed - resetting FCM badge');
        _resetBadge();
        break;
      case AppLifecycleState.inactive:
        // 앱이 비활성화 상태 (전환 중)
        print('App inactive');
        break;
      case AppLifecycleState.paused:
        // 앱이 백그라운드로 들어갔을 때
        print('App paused');
        break;
      case AppLifecycleState.detached:
        // 앱이 종료될 때
        print('App detached');
        break;
      case AppLifecycleState.hidden:
        // 앱이 숨겨졌을 때 (iOS)
        print('App hidden');
        break;
    }
  }
  
  Future<void> _resetBadge() async {
    try {
      await _notificationService.resetBadge();
    } catch (e) {
      print('Error resetting badge: $e');
    }
  }

  @override
  Widget build(BuildContext context) {
    return widget.child;
  }
}