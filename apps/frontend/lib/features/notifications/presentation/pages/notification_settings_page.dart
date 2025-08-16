import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/widgets/spark_icon.dart';

class NotificationSettingsPage extends StatefulWidget {
  const NotificationSettingsPage({super.key});

  @override
  State<NotificationSettingsPage> createState() => _NotificationSettingsPageState();
}

class _NotificationSettingsPageState extends State<NotificationSettingsPage> {
  // Notification Settings
  bool _pushNotifications = true;
  bool _sparkNotifications = true;
  bool _messageNotifications = true;
  bool _newNoteNotifications = false;
  bool _proximityNotifications = true;
  bool _soundEnabled = true;
  bool _vibrationEnabled = true;
  
  // Quiet Hours
  bool _quietHoursEnabled = false;
  TimeOfDay _quietStartTime = const TimeOfDay(hour: 22, minute: 0);
  TimeOfDay _quietEndTime = const TimeOfDay(hour: 8, minute: 0);
  
  // Location Settings
  bool _locationBasedNotifications = true;
  double _notificationRadius = 1.0; // km
  
  bool _isLoading = false;
  bool _hasChanges = false;

  void _onSettingChanged() {
    if (!_hasChanges) {
      setState(() => _hasChanges = true);
    }
  }

  Future<void> _selectTime(BuildContext context, bool isStartTime) async {
    final TimeOfDay? picked = await showTimePicker(
      context: context,
      initialTime: isStartTime ? _quietStartTime : _quietEndTime,
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
      setState(() {
        if (isStartTime) {
          _quietStartTime = picked;
        } else {
          _quietEndTime = picked;
        }
        _onSettingChanged();
      });
    }
  }

  Future<void> _saveSettings() async {
    setState(() => _isLoading = true);
    
    try {
      // Simulate network delay
      await Future.delayed(const Duration(seconds: 1));
      
      // TODO: Implement actual settings save API call
      
      HapticFeedback.mediumImpact();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('✅ 알림 설정이 저장되었습니다!'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        
        setState(() => _hasChanges = false);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('설정 저장 실패: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  String _formatTime(TimeOfDay time) {
    final hour = time.hour.toString().padLeft(2, '0');
    final minute = time.minute.toString().padLeft(2, '0');
    return '$hour:$minute';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios, color: AppColors.textPrimary),
        ),
        title: Text(
          '알림 설정',
          style: AppTextStyles.titleLarge.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          if (_hasChanges)
            TextButton(
              onPressed: _isLoading ? null : _saveSettings,
              child: _isLoading
                  ? const SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(
                      '저장',
                      style: AppTextStyles.titleSmall.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // General Notifications
            _buildSectionTitle('일반 알림'),
            const SizedBox(height: AppSpacing.md),
            
            _buildNotificationTile(
              title: '푸시 알림',
              subtitle: '모든 알림의 기본 설정입니다',
              value: _pushNotifications,
              onChanged: (value) {
                setState(() {
                  _pushNotifications = value;
                  if (!value) {
                    // Turn off all other notifications if push is disabled
                    _sparkNotifications = false;
                    _messageNotifications = false;
                    _newNoteNotifications = false;
                    _proximityNotifications = false;
                  }
                  _onSettingChanged();
                });
              },
              icon: Icons.notifications,
            ),
            
            const SizedBox(height: AppSpacing.lg),
            
            // Content Notifications
            _buildSectionTitle('콘텐츠 알림'),
            const SizedBox(height: AppSpacing.md),
            
            _buildNotificationTile(
              title: '스파크 알림',
              subtitle: '새로운 스파크 매칭 시 알림',
              value: _sparkNotifications && _pushNotifications,
              onChanged: _pushNotifications ? (value) {
                setState(() {
                  _sparkNotifications = value;
                  _onSettingChanged();
                });
              } : null,
              customIcon: const SparkIcon(
                size: 24,
              ),
            ),
            
            _buildNotificationTile(
              title: '메시지 알림',
              subtitle: '새로운 채팅 메시지 알림',
              value: _messageNotifications && _pushNotifications,
              onChanged: _pushNotifications ? (value) {
                setState(() {
                  _messageNotifications = value;
                  _onSettingChanged();
                });
              } : null,
              icon: Icons.message,
            ),
            
            _buildNotificationTile(
              title: '새 쪽지 알림',
              subtitle: '내 주변에 새로운 쪽지가 생겼을 때',
              value: _newNoteNotifications && _pushNotifications,
              onChanged: _pushNotifications ? (value) {
                setState(() {
                  _newNoteNotifications = value;
                  _onSettingChanged();
                });
              } : null,
              icon: Icons.note_add,
            ),
            
            _buildNotificationTile(
              title: '근접 알림',
              subtitle: '관심 있는 사람이 근처에 있을 때',
              value: _proximityNotifications && _pushNotifications,
              onChanged: _pushNotifications ? (value) {
                setState(() {
                  _proximityNotifications = value;
                  _onSettingChanged();
                });
              } : null,
              icon: Icons.location_on,
            ),
            
            const SizedBox(height: AppSpacing.lg),
            
            // Sound & Vibration
            _buildSectionTitle('소리 및 진동'),
            const SizedBox(height: AppSpacing.md),
            
            _buildNotificationTile(
              title: '알림 소리',
              subtitle: '알림 발생 시 소리 재생',
              value: _soundEnabled && _pushNotifications,
              onChanged: _pushNotifications ? (value) {
                setState(() {
                  _soundEnabled = value;
                  _onSettingChanged();
                });
              } : null,
              icon: Icons.volume_up,
            ),
            
            _buildNotificationTile(
              title: '진동',
              subtitle: '알림 발생 시 진동',
              value: _vibrationEnabled && _pushNotifications,
              onChanged: _pushNotifications ? (value) {
                setState(() {
                  _vibrationEnabled = value;
                  _onSettingChanged();
                });
              } : null,
              icon: Icons.vibration,
            ),
            
            const SizedBox(height: AppSpacing.lg),
            
            // Quiet Hours
            _buildSectionTitle('방해 금지 시간'),
            const SizedBox(height: AppSpacing.md),
            
            Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.grey200),
              ),
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text('방해 금지 시간 설정'),
                    subtitle: Text(
                      '설정한 시간에는 알림을 받지 않습니다',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    value: _quietHoursEnabled && _pushNotifications,
                    activeColor: AppColors.primary,
                    onChanged: _pushNotifications ? (value) {
                      setState(() {
                        _quietHoursEnabled = value;
                        _onSettingChanged();
                      });
                    } : null,
                    secondary: const Icon(Icons.do_not_disturb),
                  ),
                  
                  if (_quietHoursEnabled && _pushNotifications) ...[
                    Divider(color: AppColors.grey200, height: 1),
                    ListTile(
                      title: const Text('시작 시간'),
                      subtitle: Text(_formatTime(_quietStartTime)),
                      trailing: const Icon(Icons.access_time),
                      onTap: () => _selectTime(context, true),
                    ),
                    Divider(color: AppColors.grey200, height: 1),
                    ListTile(
                      title: const Text('종료 시간'),
                      subtitle: Text(_formatTime(_quietEndTime)),
                      trailing: const Icon(Icons.access_time),
                      onTap: () => _selectTime(context, false),
                    ),
                  ],
                ],
              ),
            ),
            
            const SizedBox(height: AppSpacing.lg),
            
            // Location-based Notifications
            _buildSectionTitle('위치 기반 알림'),
            const SizedBox(height: AppSpacing.md),
            
            Container(
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppColors.grey200),
              ),
              child: Column(
                children: [
                  SwitchListTile(
                    title: const Text('위치 기반 알림'),
                    subtitle: Text(
                      '내 위치를 기반으로 관련 알림을 받습니다',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    value: _locationBasedNotifications && _pushNotifications,
                    activeColor: AppColors.primary,
                    onChanged: _pushNotifications ? (value) {
                      setState(() {
                        _locationBasedNotifications = value;
                        _onSettingChanged();
                      });
                    } : null,
                    secondary: const Icon(Icons.my_location),
                  ),
                  
                  if (_locationBasedNotifications && _pushNotifications) ...[
                    Divider(color: AppColors.grey200, height: 1),
                    Padding(
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      child: Column(
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                '알림 반경',
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              Text(
                                '${_notificationRadius.toStringAsFixed(1)}km',
                                style: AppTextStyles.titleSmall.copyWith(
                                  color: AppColors.primary,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                          Slider(
                            value: _notificationRadius,
                            min: 0.1,
                            max: 10.0,
                            divisions: 99,
                            activeColor: AppColors.primary,
                            inactiveColor: AppColors.grey300,
                            onChanged: (double value) {
                              setState(() {
                                _notificationRadius = value;
                                _onSettingChanged();
                              });
                            },
                          ),
                        ],
                      ),
                    ),
                  ],
                ],
              ),
            ),
            
            const SizedBox(height: AppSpacing.lg),
            
            // Privacy Notice
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              decoration: BoxDecoration(
                color: AppColors.grey100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Icon(
                        Icons.privacy_tip,
                        color: AppColors.textSecondary,
                        size: 20,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        '개인정보 보호',
                        style: AppTextStyles.titleSmall.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    '위치 기반 알림은 사용자의 동의하에 제공되며, 개인 위치 정보는 안전하게 보호됩니다. 언제든지 설정을 변경할 수 있습니다.',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
            
            const SizedBox(height: AppSpacing.xxl),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.titleMedium.copyWith(
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
      ),
    );
  }

  Widget _buildNotificationTile({
    required String title,
    required String subtitle,
    required bool value,
    required ValueChanged<bool>? onChanged,
    IconData? icon,
    Widget? customIcon,
  }) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.sm),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.grey200),
      ),
      child: SwitchListTile(
        title: Text(
          title,
          style: AppTextStyles.bodyMedium.copyWith(
            color: onChanged != null ? AppColors.textPrimary : AppColors.grey400,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: AppTextStyles.bodySmall.copyWith(
            color: onChanged != null ? AppColors.textSecondary : AppColors.grey400,
          ),
        ),
        value: value,
        activeColor: AppColors.primary,
        onChanged: onChanged,
        secondary: customIcon ?? Icon(
          icon!,
          color: onChanged != null ? AppColors.textSecondary : AppColors.grey400,
        ),
      ),
    );
  }
}