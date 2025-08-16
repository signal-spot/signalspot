import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/widgets/spark_icon.dart';

// 알림 설정 데이터 관리용 Provider
final notificationSettingsProvider = StateProvider<NotificationSettings>((ref) {
  return NotificationSettings(
    sparkNotifications: true,
    messageNotifications: true,
    matchNotifications: true,
    nearbySignalNotifications: true,
    promotionalNotifications: false,
    soundEnabled: true,
    vibrationEnabled: true,
    quietHoursEnabled: true,
    quietHoursStart: const TimeOfDay(hour: 22, minute: 0),
    quietHoursEnd: const TimeOfDay(hour: 8, minute: 0),
  );
});

class NotificationSettingsPage extends ConsumerWidget {
  const NotificationSettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(notificationSettingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('알림 설정'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          // 알림 유형 섹션
          _SectionHeader(title: '알림 유형'),
          const SizedBox(height: AppSpacing.md),

          _NotificationTile(
            title: '스파크 알림',
            subtitle: '새로운 스파크가 감지되었을 때',
            customIcon: const SparkIcon(size: 24),
            iconColor: AppColors.sparkActive,
            value: settings.sparkNotifications,
            onChanged: (value) {
              _updateSettings(ref, settings.copyWith(sparkNotifications: value));
            },
          ),

          _NotificationTile(
            title: '메시지 알림',
            subtitle: '새로운 메시지가 도착했을 때',
            icon: Icons.message,
            iconColor: AppColors.primary,
            value: settings.messageNotifications,
            onChanged: (value) {
              _updateSettings(ref, settings.copyWith(messageNotifications: value));
            },
          ),

          _NotificationTile(
            title: '매칭 알림',
            subtitle: '새로운 매칭이 성사되었을 때',
            icon: Icons.favorite,
            iconColor: AppColors.error,
            value: settings.matchNotifications,
            onChanged: (value) {
              _updateSettings(ref, settings.copyWith(matchNotifications: value));
            },
          ),

          _NotificationTile(
            title: '주변 시그널 알림',
            subtitle: '근처에 새로운 시그널이 있을 때',
            icon: Icons.location_on,
            iconColor: AppColors.secondary,
            value: settings.nearbySignalNotifications,
            onChanged: (value) {
              _updateSettings(ref, settings.copyWith(nearbySignalNotifications: value));
            },
          ),

          _NotificationTile(
            title: '이벤트 및 프로모션',
            subtitle: '앱 업데이트 및 이벤트 정보',
            icon: Icons.campaign,
            iconColor: AppColors.grey500,
            value: settings.promotionalNotifications,
            onChanged: (value) {
              _updateSettings(ref, settings.copyWith(promotionalNotifications: value));
            },
          ),

          const SizedBox(height: AppSpacing.xxl),

          // 알림 방식 섹션
          _SectionHeader(title: '알림 방식'),
          const SizedBox(height: AppSpacing.md),

          _NotificationTile(
            title: '소리',
            subtitle: '알림음 재생',
            icon: Icons.volume_up,
            iconColor: AppColors.primary,
            value: settings.soundEnabled,
            onChanged: (value) {
              _updateSettings(ref, settings.copyWith(soundEnabled: value));
            },
          ),

          _NotificationTile(
            title: '진동',
            subtitle: '알림 시 진동',
            icon: Icons.vibration,
            iconColor: AppColors.primary,
            value: settings.vibrationEnabled,
            onChanged: (value) {
              _updateSettings(ref, settings.copyWith(vibrationEnabled: value));
            },
          ),

          const SizedBox(height: AppSpacing.xxl),

          // 방해금지 시간 섹션
          _SectionHeader(title: '방해금지 시간'),
          const SizedBox(height: AppSpacing.md),

          _NotificationTile(
            title: '방해금지 시간 설정',
            subtitle: settings.quietHoursEnabled
                ? '${_formatTime(settings.quietHoursStart)} - ${_formatTime(settings.quietHoursEnd)}'
                : '사용 안함',
            icon: Icons.bedtime,
            iconColor: AppColors.secondary,
            value: settings.quietHoursEnabled,
            onChanged: (value) {
              _updateSettings(ref, settings.copyWith(quietHoursEnabled: value));
            },
          ),

          if (settings.quietHoursEnabled) ...[
            const SizedBox(height: AppSpacing.md),
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: AppColors.grey50,
                borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
                border: Border.all(color: AppColors.grey200),
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '시작 시간',
                            style: AppTextStyles.titleSmall.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: AppSpacing.xs),
                          GestureDetector(
                            onTap: () => _selectTime(
                              context,
                              ref,
                              settings.quietHoursStart,
                              (time) => settings.copyWith(quietHoursStart: time),
                            ),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.md,
                                vertical: AppSpacing.sm,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.white,
                                borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                                border: Border.all(color: AppColors.grey300),
                              ),
                              child: Text(
                                _formatTime(settings.quietHoursStart),
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            '종료 시간',
                            style: AppTextStyles.titleSmall.copyWith(
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                          const SizedBox(height: AppSpacing.xs),
                          GestureDetector(
                            onTap: () => _selectTime(
                              context,
                              ref,
                              settings.quietHoursEnd,
                              (time) => settings.copyWith(quietHoursEnd: time),
                            ),
                            child: Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.md,
                                vertical: AppSpacing.sm,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.white,
                                borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                                border: Border.all(color: AppColors.grey300),
                              ),
                              child: Text(
                                _formatTime(settings.quietHoursEnd),
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.md),
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.info_outline,
                          color: AppColors.primary,
                          size: 16,
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Text(
                            '방해금지 시간에는 소리와 진동 없이 알림만 표시됩니다',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: AppSpacing.xxl),

          // 테스트 알림 버튼
          Container(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () => _sendTestNotification(context),
              style: OutlinedButton.styleFrom(
                foregroundColor: AppColors.primary,
                side: const BorderSide(color: AppColors.primary),
                padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
                ),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.notifications_active),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    '테스트 알림 보내기',
                    style: AppTextStyles.titleMedium.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
          ),

          const SizedBox(height: AppSpacing.lg),

          // 권한 설정 안내
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.grey50,
              borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.settings,
                      color: AppColors.grey600,
                      size: 20,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Text(
                      '알림 권한 설정',
                      style: AppTextStyles.titleSmall.copyWith(
                        fontWeight: FontWeight.w600,
                        color: AppColors.grey700,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  '알림이 오지 않는다면 기기의 설정에서 SignalSpot 앱의 알림 권한을 확인해주세요.',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.grey600,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                TextButton(
                  onPressed: () {
                    // 시스템 설정으로 이동
                    _openAppSettings();
                  },
                  child: Text(
                    '앱 설정 열기',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.primary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _updateSettings(WidgetRef ref, NotificationSettings newSettings) {
    ref.read(notificationSettingsProvider.notifier).state = newSettings;
    HapticFeedback.lightImpact();
  }

  String _formatTime(TimeOfDay time) {
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  Future<void> _selectTime(
    BuildContext context,
    WidgetRef ref,
    TimeOfDay initialTime,
    NotificationSettings Function(TimeOfDay) updateFunction,
  ) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: initialTime,
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: Theme.of(context).colorScheme.copyWith(
              primary: AppColors.primary,
            ),
          ),
          child: child!,
        );
      },
    );

    if (picked != null) {
      _updateSettings(ref, updateFunction(picked));
    }
  }

  void _sendTestNotification(BuildContext context) {
    HapticFeedback.mediumImpact();
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const SparkIcon(size: 20),
            const SizedBox(width: 8),
            const Text('테스트 알림이 전송되었습니다!'),
          ],
        ),
        backgroundColor: AppColors.sparkActive,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  void _openAppSettings() {
    // 실제 구현에서는 app_settings 패키지 사용
    // AppSettings.openAppSettings();
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;

  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: AppTextStyles.titleLarge.copyWith(
        fontWeight: FontWeight.w600,
      ),
    );
  }
}

class _NotificationTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData? icon;
  final Widget? customIcon;
  final Color iconColor;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _NotificationTile({
    required this.title,
    required this.subtitle,
    this.icon,
    this.customIcon,
    required this.iconColor,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
        border: Border.all(
          color: AppColors.grey200,
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.all(AppSpacing.md),
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: iconColor.withOpacity(0.1),
            borderRadius: BorderRadius.circular(20),
          ),
          child: customIcon ?? Icon(
            icon!,
            color: iconColor,
            size: 20,
          ),
        ),
        title: Text(
          title,
          style: AppTextStyles.bodyLarge.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: AppTextStyles.bodySmall.copyWith(
            color: AppColors.grey600,
          ),
        ),
        trailing: Switch(
          value: value,
          onChanged: onChanged,
          activeColor: AppColors.primary,
        ),
      ),
    );
  }
}

// 알림 설정 데이터 모델
class NotificationSettings {
  final bool sparkNotifications;
  final bool messageNotifications;
  final bool matchNotifications;
  final bool nearbySignalNotifications;
  final bool promotionalNotifications;
  final bool soundEnabled;
  final bool vibrationEnabled;
  final bool quietHoursEnabled;
  final TimeOfDay quietHoursStart;
  final TimeOfDay quietHoursEnd;

  NotificationSettings({
    required this.sparkNotifications,
    required this.messageNotifications,
    required this.matchNotifications,
    required this.nearbySignalNotifications,
    required this.promotionalNotifications,
    required this.soundEnabled,
    required this.vibrationEnabled,
    required this.quietHoursEnabled,
    required this.quietHoursStart,
    required this.quietHoursEnd,
  });

  NotificationSettings copyWith({
    bool? sparkNotifications,
    bool? messageNotifications,
    bool? matchNotifications,
    bool? nearbySignalNotifications,
    bool? promotionalNotifications,
    bool? soundEnabled,
    bool? vibrationEnabled,
    bool? quietHoursEnabled,
    TimeOfDay? quietHoursStart,
    TimeOfDay? quietHoursEnd,
  }) {
    return NotificationSettings(
      sparkNotifications: sparkNotifications ?? this.sparkNotifications,
      messageNotifications: messageNotifications ?? this.messageNotifications,
      matchNotifications: matchNotifications ?? this.matchNotifications,
      nearbySignalNotifications: nearbySignalNotifications ?? this.nearbySignalNotifications,
      promotionalNotifications: promotionalNotifications ?? this.promotionalNotifications,
      soundEnabled: soundEnabled ?? this.soundEnabled,
      vibrationEnabled: vibrationEnabled ?? this.vibrationEnabled,
      quietHoursEnabled: quietHoursEnabled ?? this.quietHoursEnabled,
      quietHoursStart: quietHoursStart ?? this.quietHoursStart,
      quietHoursEnd: quietHoursEnd ?? this.quietHoursEnd,
    );
  }
}