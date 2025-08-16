import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/providers/notification_provider.dart';
import '../../../../shared/models/index.dart';

class NotificationsPage extends ConsumerStatefulWidget {
  const NotificationsPage({super.key});

  @override
  ConsumerState<NotificationsPage> createState() => _NotificationsPageState();
}

class _NotificationsPageState extends ConsumerState<NotificationsPage> {
  final ScrollController _scrollController = ScrollController();
  
  @override
  void initState() {
    super.initState();
    // 초기 알림 목록 로드
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(notificationListProvider.notifier).loadNotifications();
    });
  }
  
  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }
  
  Future<void> _refreshNotifications() async {
    await ref.read(notificationListProvider.notifier).refresh();
  }
  
  String _getNotificationIcon(NotificationType type) {
    switch (type) {
      case NotificationType.sparkDetected:
      case NotificationType.sparkMatched:
      case NotificationType.sparkReceived:
      case NotificationType.sparkAccepted:
      case NotificationType.sparkRejected:
        return '⚡';
      case NotificationType.messageReceived:
      case NotificationType.newMessage:
        return '💬';
      case NotificationType.profileVisited:
      case NotificationType.profileView:
        return '👀';
      case NotificationType.signalSpotNearby:
      case NotificationType.signalSpotInteraction:
        return '📍';
      case NotificationType.sacredSiteDiscovered:
      case NotificationType.sacredSiteTierUpgraded:
        return '⛩️';
      case NotificationType.friendRequest:
      case NotificationType.locationSharingRequest:
        return '👥';
      case NotificationType.achievementUnlocked:
        return '🏆';
      case NotificationType.spotLiked:
      case NotificationType.commentLiked:
        return '❤️';
      case NotificationType.spotCommented:
      case NotificationType.commentReplied:
        return '💬';
      case NotificationType.systemAnnouncement:
      case NotificationType.system:
        return '📢';
      default:
        return '🔔';
    }
  }
  
  Color _getNotificationColor(NotificationType type) {
    switch (type) {
      case NotificationType.sparkDetected:
      case NotificationType.sparkMatched:
      case NotificationType.sparkReceived:
      case NotificationType.sparkAccepted:
      case NotificationType.sparkRejected:
        return AppColors.sparkActive;
      case NotificationType.messageReceived:
      case NotificationType.newMessage:
        return AppColors.primary;
      case NotificationType.profileVisited:
      case NotificationType.profileView:
        return AppColors.secondary;
      case NotificationType.signalSpotNearby:
      case NotificationType.signalSpotInteraction:
        return AppColors.success;
      case NotificationType.sacredSiteDiscovered:
      case NotificationType.sacredSiteTierUpgraded:
        return const Color(0xFFFFA726); // Orange color for warning
      case NotificationType.friendRequest:
      case NotificationType.locationSharingRequest:
        return const Color(0xFF42A5F5); // Blue color for info
      case NotificationType.achievementUnlocked:
        return AppColors.sparkActive; // Use sparkActive (gold color) for achievements
      case NotificationType.spotLiked:
      case NotificationType.commentLiked:
        return AppColors.error;
      case NotificationType.spotCommented:
      case NotificationType.commentReplied:
        return AppColors.primary;
      case NotificationType.systemAnnouncement:
      case NotificationType.system:
      default:
        return AppColors.grey600;
    }
  }
  
  @override
  Widget build(BuildContext context) {
    final notificationList = ref.watch(notificationListProvider);
    
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('알림'),
        backgroundColor: AppColors.white,
        elevation: 0,
        actions: [
          // 모두 읽음 처리 버튼
          TextButton(
            onPressed: notificationList.maybeWhen(
              data: (response) => response.unreadCount > 0
                ? () async {
                    await ref.read(notificationListProvider.notifier).markAllAsRead();
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('모든 알림을 읽음 처리했습니다'),
                          backgroundColor: AppColors.success,
                        ),
                      );
                    }
                  }
                : null,
              orElse: () => null,
            ),
            child: Text(
              '모두 읽음',
              style: AppTextStyles.labelLarge.copyWith(
                color: notificationList.maybeWhen(
                  data: (response) => response.unreadCount > 0
                    ? AppColors.primary
                    : AppColors.grey400,
                  orElse: () => AppColors.grey400,
                ),
              ),
            ),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _refreshNotifications,
        child: notificationList.when(
          loading: () => const Center(
            child: CircularProgressIndicator(),
          ),
          error: (error, _) => Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(
                  Icons.error_outline,
                  size: 64,
                  color: AppColors.error,
                ),
                const SizedBox(height: AppSpacing.md),
                Text(
                  '알림을 불러올 수 없습니다',
                  style: AppTextStyles.titleMedium,
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  error.toString(),
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.grey600,
                  ),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: AppSpacing.lg),
                ElevatedButton(
                  onPressed: _refreshNotifications,
                  child: const Text('다시 시도'),
                ),
              ],
            ),
          ),
          data: (response) {
            if (response.notifications.isEmpty) {
              return Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.notifications_none,
                      size: 80,
                      color: AppColors.grey300,
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    Text(
                      '알림이 없습니다',
                      style: AppTextStyles.titleMedium.copyWith(
                        color: AppColors.grey600,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    Text(
                      '새로운 알림이 오면 여기에 표시됩니다',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.grey500,
                      ),
                    ),
                  ],
                ),
              );
            }
            
            return ListView.separated(
              controller: _scrollController,
              padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
              itemCount: response.notifications.length,
              separatorBuilder: (context, index) => const Divider(
                height: 1,
                color: AppColors.grey100,
              ),
              itemBuilder: (context, index) {
                final notification = response.notifications[index];
                final isUnread = !notification.isRead;
                
                return Dismissible(
                  key: Key(notification.id),
                  direction: DismissDirection.endToStart,
                  background: Container(
                    alignment: Alignment.centerRight,
                    padding: const EdgeInsets.only(right: AppSpacing.lg),
                    color: AppColors.error,
                    child: const Icon(
                      Icons.delete,
                      color: AppColors.white,
                    ),
                  ),
                  confirmDismiss: (direction) async {
                    // 삭제 확인 다이얼로그
                    return await showDialog(
                      context: context,
                      builder: (context) => AlertDialog(
                        title: const Text('알림 삭제'),
                        content: const Text('이 알림을 삭제하시겠습니까?'),
                        actions: [
                          TextButton(
                            onPressed: () => Navigator.of(context).pop(false),
                            child: const Text('취소'),
                          ),
                          ElevatedButton(
                            onPressed: () => Navigator.of(context).pop(true),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: AppColors.error,
                            ),
                            child: const Text('삭제'),
                          ),
                        ],
                      ),
                    );
                  },
                  onDismissed: (direction) async {
                    await ref.read(notificationListProvider.notifier)
                        .deleteNotification(notification.id);
                    
                    if (mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('알림이 삭제되었습니다'),
                        ),
                      );
                    }
                  },
                  child: InkWell(
                    onTap: () async {
                      // 읽지 않은 알림이면 읽음 처리
                      if (isUnread) {
                        await ref.read(notificationListProvider.notifier)
                            .markAsRead(notification.id);
                      }
                      
                      // 알림 타입에 따라 적절한 화면으로 이동
                      _handleNotificationTap(notification);
                    },
                    child: Container(
                      color: isUnread 
                        ? AppColors.primary.withOpacity(0.05)
                        : AppColors.white,
                      padding: const EdgeInsets.all(AppSpacing.md),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // 알림 아이콘
                          Container(
                            width: 48,
                            height: 48,
                            decoration: BoxDecoration(
                              color: _getNotificationColor(notification.type)
                                  .withOpacity(0.1),
                              borderRadius: BorderRadius.circular(24),
                            ),
                            child: Center(
                              child: Text(
                                _getNotificationIcon(notification.type),
                                style: const TextStyle(fontSize: 24),
                              ),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          
                          // 알림 내용
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(
                                  notification.title,
                                  style: AppTextStyles.titleSmall.copyWith(
                                    fontWeight: isUnread 
                                      ? FontWeight.w600 
                                      : FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(height: AppSpacing.xs),
                                Text(
                                  notification.body,
                                  style: AppTextStyles.bodyMedium.copyWith(
                                    color: AppColors.grey700,
                                  ),
                                  maxLines: 2,
                                  overflow: TextOverflow.ellipsis,
                                ),
                                const SizedBox(height: AppSpacing.xs),
                                Text(
                                  _formatTimeAgo(notification.createdAt),
                                  style: AppTextStyles.bodySmall.copyWith(
                                    color: AppColors.grey500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                          
                          // 읽지 않음 표시
                          if (isUnread)
                            Container(
                              width: 8,
                              height: 8,
                              margin: const EdgeInsets.only(
                                left: AppSpacing.sm,
                                top: AppSpacing.xs,
                              ),
                              decoration: const BoxDecoration(
                                color: AppColors.primary,
                                shape: BoxShape.circle,
                              ),
                            ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            );
          },
        ),
      ),
    );
  }
  
  void _handleNotificationTap(AppNotification notification) {
    // 알림 타입에 따라 적절한 화면으로 이동
    switch (notification.type) {
      case NotificationType.sparkDetected:
      case NotificationType.sparkMatched:
      case NotificationType.sparkReceived:
      case NotificationType.sparkAccepted:
      case NotificationType.sparkRejected:
        // 스파크 화면으로 이동
        Navigator.of(context).pushReplacementNamed('/home', arguments: 2);
        break;
      case NotificationType.messageReceived:
      case NotificationType.newMessage:
        // 메시지 화면으로 이동
        if (notification.data?['chatRoomId'] != null) {
          Navigator.of(context).pushNamed(
            '/chat',
            arguments: notification.data!['chatRoomId'],
          );
        }
        break;
      case NotificationType.signalSpotNearby:
      case NotificationType.signalSpotInteraction:
      case NotificationType.spotLiked:
      case NotificationType.spotCommented:
        // 지도 화면으로 이동
        Navigator.of(context).pushReplacementNamed('/home', arguments: 1);
        break;
      case NotificationType.sacredSiteDiscovered:
      case NotificationType.sacredSiteTierUpgraded:
        // Sacred Site 화면으로 이동 (있다면)
        Navigator.of(context).pushReplacementNamed('/home');
        break;
      case NotificationType.profileVisited:
      case NotificationType.profileView:
        // 프로필 화면으로 이동
        Navigator.of(context).pushReplacementNamed('/home', arguments: 3);
        break;
      case NotificationType.systemAnnouncement:
      case NotificationType.system:
      default:
        // 기본적으로 홈으로 이동
        Navigator.of(context).pushReplacementNamed('/home');
    }
  }
  
  String _formatTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inMinutes < 1) {
      return '방금 전';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}분 전';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}시간 전';
    } else if (difference.inDays < 7) {
      return '${difference.inDays}일 전';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return '${weeks}주 전';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return '${months}개월 전';
    } else {
      final years = (difference.inDays / 365).floor();
      return '${years}년 전';
    }
  }
}