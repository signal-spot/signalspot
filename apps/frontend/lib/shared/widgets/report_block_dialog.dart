import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/theme/app_text_styles.dart';
import '../services/report_service.dart';

// Report Service Provider
final reportServiceProvider = Provider<ReportService>((ref) => ReportService());

// 직접 신고 다이얼로그 표시
void showReportDialog({
  required BuildContext context,
  required WidgetRef ref,
  required String userId,
  required String userName,
  String? contextType,
  String? contextId,
  VoidCallback? onReported,
}) {
  ReportReason? selectedReason;
  final TextEditingController descriptionController = TextEditingController();
  
  showDialog(
    context: context,
    builder: (dialogContext) => StatefulBuilder(
      builder: (dialogContext, setState) => AlertDialog(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
        ),
        title: const Text('신고 사유 선택'),
        content: Container(
          width: double.maxFinite,
          constraints: BoxConstraints(
            maxHeight: MediaQuery.of(context).size.height * 0.6, // 화면 높이의 60%로 제한
          ),
          child: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                // RadioListTile 대신 컴팩트한 디자인 사용
                Container(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(AppSpacing.borderRadiusSm),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Icon(
                            Icons.info_outline,
                            size: 16,
                            color: AppColors.primary,
                          ),
                          const SizedBox(width: AppSpacing.xs),
                          Text(
                            '신고 처리 안내',
                            style: AppTextStyles.labelSmall.copyWith(
                              fontWeight: FontWeight.w600,
                              color: AppColors.primary,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        '• 부적절한 콘텐츠는 검토 후 삭제됩니다\n'
                            '• 문의: ggprgrkjh@naver.com',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.primary,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                Container(
                  decoration: BoxDecoration(
                    border: Border.all(color: AppColors.grey200),
                    borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                  ),
                  child: Column(
                    children: ReportReason.values.map((reason) => InkWell(
                      onTap: () {
                        setState(() {
                          selectedReason = reason;
                        });
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.sm,
                        ),
                        decoration: BoxDecoration(
                          border: reason != ReportReason.values.last
                              ? Border(
                                  bottom: BorderSide(
                                    color: AppColors.grey200,
                                    width: 0.5,
                                  ),
                                )
                              : null,
                        ),
                        child: Row(
                          children: [
                            Container(
                              width: 20,
                              height: 20,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                border: Border.all(
                                  color: selectedReason == reason
                                      ? AppColors.primary
                                      : AppColors.grey400,
                                  width: 2,
                                ),
                              ),
                              child: selectedReason == reason
                                  ? Center(
                                      child: Container(
                                        width: 10,
                                        height: 10,
                                        decoration: BoxDecoration(
                                          shape: BoxShape.circle,
                                          color: AppColors.primary,
                                        ),
                                      ),
                                    )
                                  : null,
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: Text(
                                reason.label,
                                style: AppTextStyles.bodyMedium.copyWith(
                                  color: selectedReason == reason
                                      ? AppColors.primary
                                      : AppColors.textPrimary,
                                  fontWeight: selectedReason == reason
                                      ? FontWeight.w600
                                      : FontWeight.normal,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    )).toList(),
                  ),
                ),
              const SizedBox(height: AppSpacing.md),
              TextField(
                controller: descriptionController,
                maxLines: 3,
                decoration: InputDecoration(
                  hintText: '추가 설명 (선택사항)',
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                  ),
                ),
              ),

              ],
            ),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(dialogContext).pop(),
            child: const Text('취소'),
          ),
          ElevatedButton(
            onPressed: selectedReason == null ? null : () async {
              final navigator = Navigator.of(dialogContext);
              final messenger = ScaffoldMessenger.of(context);
              
              final reportService = ref.read(reportServiceProvider);
              final result = await reportService.reportUser(
                userId: userId,
                reason: selectedReason!,
                description: descriptionController.text.isEmpty 
                  ? null 
                  : descriptionController.text,
              );
              
              if (navigator.canPop()) {
                navigator.pop();
              }
              
              if (result['success'] == true) {
                onReported?.call();
                messenger.showSnackBar(
                  SnackBar(
                    content: Text(result['message'] ?? '신고가 접수되었습니다'),
                    backgroundColor: AppColors.success,
                  ),
                );
              } else {
                messenger.showSnackBar(
                  SnackBar(
                    content: Text(result['message'] ?? '신고 처리 중 오류가 발생했습니다'),
                    backgroundColor: result['message'] == '본인을 신고할 수 없습니다' 
                      ? Colors.orange 
                      : AppColors.error,
                  ),
                );
              }
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.sparkActive,
            ),
            child: const Text('신고하기'),
          ),
        ],
      ),
    ),
  );
}

// 직접 차단 다이얼로그 표시
void showBlockDialog({
  required BuildContext context,
  required WidgetRef ref,
  required String userId,
  required String userName,
  VoidCallback? onBlocked,
}) {
  showDialog(
    context: context,
    builder: (dialogContext) => AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
      ),
      title: const Text('사용자 차단'),
      content: Text(
        '$userName님을 차단하시겠습니까?\n\n'
        '차단하면:\n'
        '• 서로의 프로필을 볼 수 없습니다\n'
        '• 메시지를 주고받을 수 없습니다\n'
        '• 스파크가 발생하지 않습니다\n\n',
        style: AppTextStyles.bodyMedium,
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(dialogContext).pop(),
          child: const Text('취소'),
        ),
        ElevatedButton(
          onPressed: () async {
            final navigator = Navigator.of(dialogContext);
            final messenger = ScaffoldMessenger.of(context);
            
            final reportService = ref.read(reportServiceProvider);
            final result = await reportService.blockUser(userId);
            
            if (navigator.canPop()) {
              navigator.pop();
            }
            
            if (result['success'] == true) {
              onBlocked?.call();
              messenger.showSnackBar(
                SnackBar(
                  content: Text(result['message'] ?? '$userName님을 차단했습니다'),
                  backgroundColor: AppColors.success,
                ),
              );
              
              // 이전 화면으로 돌아가기
              Future.delayed(const Duration(milliseconds: 100), () {
                if (navigator.canPop()) {
                  navigator.pop();
                }
              });
            } else {
              messenger.showSnackBar(
                SnackBar(
                  content: Text(result['message'] ?? '차단 처리 중 오류가 발생했습니다'),
                  backgroundColor: result['message'] == '본인을 차단할 수 없습니다' 
                    ? Colors.orange 
                    : AppColors.error,
                ),
              );
            }
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.error,
          ),
          child: const Text('차단하기'),
        ),
      ],
    ),
  );
}

// 기존 ReportBlockDialog 위젯 (선택 다이얼로그)
class ReportBlockDialog extends ConsumerStatefulWidget {
  final String userId;
  final String userName;
  final String? context;
  final String? contextId;
  final VoidCallback? onBlocked;
  final VoidCallback? onReported;
  
  const ReportBlockDialog({
    super.key,
    required this.userId,
    required this.userName,
    this.context,
    this.contextId,
    this.onBlocked,
    this.onReported,
  });
  
  @override
  ConsumerState<ReportBlockDialog> createState() => _ReportBlockDialogState();
}

class _ReportBlockDialogState extends ConsumerState<ReportBlockDialog> {
  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
      ),
      title: Text(
        '${widget.userName}님',
        style: AppTextStyles.titleMedium,
      ),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            '이 사용자와 관련하여 어떤 조치를 취하시겠습니까?',
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.of(context).pop(),
          child: Text(
            '취소',
            style: AppTextStyles.labelLarge.copyWith(
              color: AppColors.textSecondary,
            ),
          ),
        ),
        TextButton(
          onPressed: () {
            Navigator.of(context).pop();
            showReportDialog(
              context: context,
              ref: ref,
              userId: widget.userId,
              userName: widget.userName,
              contextType: widget.context,
              contextId: widget.contextId,
              onReported: widget.onReported,
            );
          },
          child: Text(
            '신고하기',
            style: AppTextStyles.labelLarge.copyWith(
              color: AppColors.sparkActive,
            ),
          ),
        ),
        ElevatedButton(
          onPressed: () {
            Navigator.of(context).pop();
            showBlockDialog(
              context: context,
              ref: ref,
              userId: widget.userId,
              userName: widget.userName,
              onBlocked: widget.onBlocked,
            );
          },
          style: ElevatedButton.styleFrom(
            backgroundColor: AppColors.error,
          ),
          child: const Text('차단하기'),
        ),
      ],
    );
  }
}

// 간단한 신고/차단 버튼 위젯
class ReportBlockButton extends ConsumerWidget {
  final String userId;
  final String userName;
  final String? context;
  final String? contextId;
  final VoidCallback? onAction;
  
  const ReportBlockButton({
    super.key,
    required this.userId,
    required this.userName,
    this.context,
    this.contextId,
    this.onAction,
  });
  
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return IconButton(
      icon: const Icon(Icons.more_vert),
      onPressed: () {
        showDialog(
          context: context,
          builder: (_) => ReportBlockDialog(
            userId: userId,
            userName: userName,
            context: this.context,
            contextId: contextId,
            onBlocked: onAction,
            onReported: onAction,
          ),
        );
      },
    );
  }
}