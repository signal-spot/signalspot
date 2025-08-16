import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';

// 프라이버시 설정 데이터 관리용 Provider
final privacySettingsProvider = StateProvider<PrivacySettings>((ref) {
  return PrivacySettings(
    profileVisibility: ProfileVisibility.nearby,
    locationSharing: LocationSharing.approximate,
    sparkRange: 50.0, // 미터 단위
    showOnlineStatus: true,
    allowMessageFromStrangers: true,
    shareCommonInterests: true,
    shareAge: true,
    shareLocation: false,
    dataAnalyticsConsent: true,
    marketingConsent: false,
  );
});

class PrivacySettingsPage extends ConsumerWidget {
  const PrivacySettingsPage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(privacySettingsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('프라이버시 설정'),
        backgroundColor: AppColors.surface,
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(AppSpacing.lg),
        children: [
          // 프로필 공개 범위 섹션
          _SectionHeader(title: '프로필 공개 범위'),
          const SizedBox(height: AppSpacing.md),

          _OptionCard(
            title: '프로필 표시 범위',
            subtitle: _getProfileVisibilityDescription(settings.profileVisibility),
            child: Column(
              children: ProfileVisibility.values.map((visibility) {
                return RadioListTile<ProfileVisibility>(
                  title: Text(_getProfileVisibilityTitle(visibility)),
                  subtitle: Text(
                    _getProfileVisibilityDescription(visibility),
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.grey600,
                    ),
                  ),
                  value: visibility,
                  groupValue: settings.profileVisibility,
                  activeColor: AppColors.primary,
                  onChanged: (value) {
                    if (value != null) {
                      _updateSettings(ref, settings.copyWith(profileVisibility: value));
                    }
                  },
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: AppSpacing.lg),

          // 위치 공유 설정
          _SectionHeader(title: '위치 설정'),
          const SizedBox(height: AppSpacing.md),

          _OptionCard(
            title: '위치 공유 방식',
            subtitle: _getLocationSharingDescription(settings.locationSharing),
            child: Column(
              children: LocationSharing.values.map((sharing) {
                return RadioListTile<LocationSharing>(
                  title: Text(_getLocationSharingTitle(sharing)),
                  subtitle: Text(
                    _getLocationSharingDescription(sharing),
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.grey600,
                    ),
                  ),
                  value: sharing,
                  groupValue: settings.locationSharing,
                  activeColor: AppColors.primary,
                  onChanged: (value) {
                    if (value != null) {
                      _updateSettings(ref, settings.copyWith(locationSharing: value));
                    }
                  },
                );
              }).toList(),
            ),
          ),

          const SizedBox(height: AppSpacing.md),

          // 스파크 범위 설정
          _OptionCard(
            title: '스파크 감지 범위',
            subtitle: '${settings.sparkRange.round()}m 반경 내에서 스파크 감지',
            child: Column(
              children: [
                Slider(
                  value: settings.sparkRange,
                  min: 10.0,
                  max: 200.0,
                  divisions: 19,
                  activeColor: AppColors.primary,
                  label: '${settings.sparkRange.round()}m',
                  onChanged: (value) {
                    _updateSettings(ref, settings.copyWith(sparkRange: value));
                  },
                ),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '10m',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.grey600,
                      ),
                    ),
                    Text(
                      '200m',
                      style: AppTextStyles.bodySmall.copyWith(
                        color: AppColors.grey600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
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
                          '범위가 넓을수록 더 많은 스파크를 감지하지만 배터리 소모가 증가할 수 있습니다',
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

          const SizedBox(height: AppSpacing.lg),

          // 개인정보 표시 설정
          _SectionHeader(title: '개인정보 표시'),
          const SizedBox(height: AppSpacing.md),

          _SwitchTile(
            title: '온라인 상태',
            subtitle: '다른 사용자에게 접속 상태 표시',
            icon: Icons.online_prediction,
            iconColor: AppColors.success,
            value: settings.showOnlineStatus,
            onChanged: (value) {
              _updateSettings(ref, settings.copyWith(showOnlineStatus: value));
            },
          ),

          _SwitchTile(
            title: '공통 관심사 공유',
            subtitle: '매칭 시 공통 관심사 표시',
            icon: Icons.interests,
            iconColor: AppColors.secondary,
            value: settings.shareCommonInterests,
            onChanged: (value) {
              _updateSettings(ref, settings.copyWith(shareCommonInterests: value));
            },
          ),

          _SwitchTile(
            title: '나이 공개',
            subtitle: '프로필에 나이 표시',
            icon: Icons.cake,
            iconColor: AppColors.sparkActive,
            value: settings.shareAge,
            onChanged: (value) {
              _updateSettings(ref, settings.copyWith(shareAge: value));
            },
          ),

          _SwitchTile(
            title: '위치 정보 공개',
            subtitle: '대략적인 지역 정보 표시',
            icon: Icons.location_city,
            iconColor: AppColors.error,
            value: settings.shareLocation,
            onChanged: (value) {
              _updateSettings(ref, settings.copyWith(shareLocation: value));
            },
          ),

          const SizedBox(height: AppSpacing.lg),

          // 메시지 설정
          _SectionHeader(title: '메시지 설정'),
          const SizedBox(height: AppSpacing.md),

          _SwitchTile(
            title: '낯선 사람의 메시지 허용',
            subtitle: '매칭되지 않은 사용자의 메시지 허용',
            icon: Icons.message,
            iconColor: AppColors.primary,
            value: settings.allowMessageFromStrangers,
            onChanged: (value) {
              _updateSettings(ref, settings.copyWith(allowMessageFromStrangers: value));
            },
          ),

          const SizedBox(height: AppSpacing.lg),

          // 데이터 및 분석
          _SectionHeader(title: '데이터 및 분석'),
          const SizedBox(height: AppSpacing.md),

          _SwitchTile(
            title: '데이터 분석 동의',
            subtitle: '앱 개선을 위한 익명화된 데이터 수집',
            icon: Icons.analytics,
            iconColor: AppColors.secondary,
            value: settings.dataAnalyticsConsent,
            onChanged: (value) {
              _updateSettings(ref, settings.copyWith(dataAnalyticsConsent: value));
            },
          ),

          _SwitchTile(
            title: '마케팅 정보 수신',
            subtitle: '개인화된 추천 및 이벤트 정보',
            icon: Icons.campaign,
            iconColor: AppColors.grey500,
            value: settings.marketingConsent,
            onChanged: (value) {
              _updateSettings(ref, settings.copyWith(marketingConsent: value));
            },
          ),

          const SizedBox(height: AppSpacing.xxl),

          // 데이터 관리 버튼들
          Column(
            children: [
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => _showDataExportDialog(context),
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
                      const Icon(Icons.download),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        '내 데이터 다운로드',
                        style: AppTextStyles.titleMedium.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: AppSpacing.md),

              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => _showAccountDeletionDialog(context),
                  style: OutlinedButton.styleFrom(
                    foregroundColor: AppColors.error,
                    side: const BorderSide(color: AppColors.error),
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.delete_forever),
                      const SizedBox(width: AppSpacing.sm),
                      Text(
                        '계정 삭제',
                        style: AppTextStyles.titleMedium.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: AppSpacing.lg),

          // 개인정보 처리방침 링크
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.grey50,
              borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '개인정보 보호',
                  style: AppTextStyles.titleSmall.copyWith(
                    fontWeight: FontWeight.w600,
                    color: AppColors.grey700,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  'SignalSpot은 사용자의 개인정보를 안전하게 보호합니다.',
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.grey600,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    TextButton(
                      onPressed: () {
                        // 개인정보 처리방침 페이지로 이동
                      },
                      child: Text(
                        '개인정보 처리방침',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    TextButton(
                      onPressed: () {
                        // 서비스 이용약관 페이지로 이동
                      },
                      child: Text(
                        '서비스 이용약관',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.primary,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  void _updateSettings(WidgetRef ref, PrivacySettings newSettings) {
    ref.read(privacySettingsProvider.notifier).state = newSettings;
    HapticFeedback.lightImpact();
  }

  String _getProfileVisibilityTitle(ProfileVisibility visibility) {
    switch (visibility) {
      case ProfileVisibility.everyone:
        return '모든 사용자';
      case ProfileVisibility.nearby:
        return '근처 사용자만';
      case ProfileVisibility.matched:
        return '매칭된 사용자만';
    }
  }

  String _getProfileVisibilityDescription(ProfileVisibility visibility) {
    switch (visibility) {
      case ProfileVisibility.everyone:
        return '모든 SignalSpot 사용자에게 표시';
      case ProfileVisibility.nearby:
        return '근처에 있는 사용자에게만 표시';
      case ProfileVisibility.matched:
        return '매칭이 성사된 사용자에게만 표시';
    }
  }

  String _getLocationSharingTitle(LocationSharing sharing) {
    switch (sharing) {
      case LocationSharing.precise:
        return '정확한 위치';
      case LocationSharing.approximate:
        return '대략적인 위치';
      case LocationSharing.disabled:
        return '위치 공유 안함';
    }
  }

  String _getLocationSharingDescription(LocationSharing sharing) {
    switch (sharing) {
      case LocationSharing.precise:
        return '정확한 GPS 위치 공유 (±10m)';
      case LocationSharing.approximate:
        return '대략적인 지역만 공유 (±1km)';
      case LocationSharing.disabled:
        return '위치 정보를 공유하지 않음';
    }
  }

  void _showDataExportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('데이터 다운로드'),
        content: const Text(
          '계정 정보, 메시지 기록, 스파크 이력 등 개인 데이터를 다운로드할 수 있습니다.\n\n처리에는 최대 7일이 소요되며, 완료 시 이메일로 알려드립니다.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(
                  content: Text('데이터 다운로드 요청이 접수되었습니다.'),
                ),
              );
            },
            child: const Text('요청'),
          ),
        ],
      ),
    );
  }

  void _showAccountDeletionDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text(
          '계정 삭제',
          style: TextStyle(color: AppColors.error),
        ),
        content: const Text(
          '계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.\n\n정말로 계정을 삭제하시겠습니까?',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(context);
              // 실제로는 계정 삭제 확인 페이지로 이동
              ScaffoldMessenger.of(context).showSnackBar(
                SnackBar(
                  content: const Text('계정 삭제는 고객센터를 통해 진행해주세요.'),
                  backgroundColor: AppColors.error,
                ),
              );
            },
            child: Text(
              '삭제',
              style: TextStyle(color: AppColors.error),
            ),
          ),
        ],
      ),
    );
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

class _OptionCard extends StatelessWidget {
  final String title;
  final String subtitle;
  final Widget child;

  const _OptionCard({
    required this.title,
    required this.subtitle,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
        border: Border.all(color: AppColors.grey200),
        boxShadow: [
          BoxShadow(
            color: AppColors.black.withOpacity(0.05),
            blurRadius: 4,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ExpansionTile(
        title: Text(
          title,
          style: AppTextStyles.titleMedium.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: AppTextStyles.bodySmall.copyWith(
            color: AppColors.grey600,
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(AppSpacing.md),
            child: child,
          ),
        ],
      ),
    );
  }
}

class _SwitchTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final IconData icon;
  final Color iconColor;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _SwitchTile({
    required this.title,
    required this.subtitle,
    required this.icon,
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
        border: Border.all(color: AppColors.grey200),
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
          child: Icon(
            icon,
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

// 열거형 정의
enum ProfileVisibility { everyone, nearby, matched }
enum LocationSharing { precise, approximate, disabled }

// 프라이버시 설정 데이터 모델
class PrivacySettings {
  final ProfileVisibility profileVisibility;
  final LocationSharing locationSharing;
  final double sparkRange;
  final bool showOnlineStatus;
  final bool allowMessageFromStrangers;
  final bool shareCommonInterests;
  final bool shareAge;
  final bool shareLocation;
  final bool dataAnalyticsConsent;
  final bool marketingConsent;

  PrivacySettings({
    required this.profileVisibility,
    required this.locationSharing,
    required this.sparkRange,
    required this.showOnlineStatus,
    required this.allowMessageFromStrangers,
    required this.shareCommonInterests,
    required this.shareAge,
    required this.shareLocation,
    required this.dataAnalyticsConsent,
    required this.marketingConsent,
  });

  PrivacySettings copyWith({
    ProfileVisibility? profileVisibility,
    LocationSharing? locationSharing,
    double? sparkRange,
    bool? showOnlineStatus,
    bool? allowMessageFromStrangers,
    bool? shareCommonInterests,
    bool? shareAge,
    bool? shareLocation,
    bool? dataAnalyticsConsent,
    bool? marketingConsent,
  }) {
    return PrivacySettings(
      profileVisibility: profileVisibility ?? this.profileVisibility,
      locationSharing: locationSharing ?? this.locationSharing,
      sparkRange: sparkRange ?? this.sparkRange,
      showOnlineStatus: showOnlineStatus ?? this.showOnlineStatus,
      allowMessageFromStrangers: allowMessageFromStrangers ?? this.allowMessageFromStrangers,
      shareCommonInterests: shareCommonInterests ?? this.shareCommonInterests,
      shareAge: shareAge ?? this.shareAge,
      shareLocation: shareLocation ?? this.shareLocation,
      dataAnalyticsConsent: dataAnalyticsConsent ?? this.dataAnalyticsConsent,
      marketingConsent: marketingConsent ?? this.marketingConsent,
    );
  }
}