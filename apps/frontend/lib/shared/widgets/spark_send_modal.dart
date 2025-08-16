import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/theme/app_spacing.dart';
import '../services/spark_service.dart';

class SparkSendModal extends StatefulWidget {
  final String targetUserId;
  final String targetUsername;
  final String? spotId;
  final String? spotTitle;
  
  const SparkSendModal({
    super.key,
    required this.targetUserId,
    required this.targetUsername,
    this.spotId,
    this.spotTitle,
  });

  @override
  State<SparkSendModal> createState() => _SparkSendModalState();
}

class _SparkSendModalState extends State<SparkSendModal> 
    with SingleTickerProviderStateMixin {
  final TextEditingController _messageController = TextEditingController();
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;
  late SparkService _sparkService;
  
  String _selectedSparkType = 'interest';
  bool _isSending = false;
  bool _isSuccess = false;
  
  final List<Map<String, dynamic>> _sparkTypes = [
    {
      'id': 'interest',
      'icon': '✨',
      'title': '관심 표현',
      'description': '이 사람에게 관심이 있어요',
      'color': Colors.purple,
    },
    {
      'id': 'like',
      'icon': '❤️',
      'title': '좋아요',
      'description': '이 글이 마음에 들어요',
      'color': Colors.red,
    },
    {
      'id': 'meet',
      'icon': '🤝',
      'title': '만남 요청',
      'description': '실제로 만나고 싶어요',
      'color': Colors.blue,
    },
    {
      'id': 'comment',
      'icon': '💬',
      'title': '대화 시작',
      'description': '대화를 나누고 싶어요',
      'color': Colors.green,
    },
  ];

  @override
  void initState() {
    super.initState();
    _sparkService = SparkService();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(
      begin: 0.8,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: Curves.elasticOut,
    ));
    _animationController.forward();
  }

  @override
  void dispose() {
    _animationController.dispose();
    _messageController.dispose();
    super.dispose();
  }

  void _sendSpark() async {
    if (_isSending) return;
    
    setState(() => _isSending = true);
    HapticFeedback.mediumImpact();
    
    try {
      print('Sending spark to user: ${widget.targetUserId}');
      print('Selected spark type: $_selectedSparkType');
      print('Message: ${_messageController.text.trim()}');
      
      final response = await _sparkService.sendSparkToUser(
        targetUserId: widget.targetUserId,
        message: _messageController.text.trim().isEmpty ? null : _messageController.text.trim(),
        sparkType: _selectedSparkType,
        spotId: widget.spotId,
      );
      
      print('Spark send response: ${response.success}, message: ${response.message}');
      
      if (response.success) {
        // 성공 시
        if (mounted) {
          setState(() {
            _isSending = false;
            _isSuccess = true;
          });
        }
        
        // Show success animation
        HapticFeedback.heavyImpact();
        await Future.delayed(const Duration(milliseconds: 1500));
        
        if (mounted) {
          Navigator.of(context).pop(true);
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: const Text('스파크를 성공적으로 보냈습니다!'),
              backgroundColor: AppColors.success,
            ),
          );
        }
      } else {
        // 실패 시 - 오류 메시지 표시
        if (mounted) {
          setState(() => _isSending = false);
          
          String errorMessage = '스파크 전송에 실패했습니다';
          
          // 상황별 메시지 처리
          if (response.message?.contains('already sent') == true) {
            errorMessage = '이미 이 사용자에게 스파크를 보냈습니다';
          } else if (response.message?.contains('blocked') == true) {
            errorMessage = '차단된 사용자에게는 스파크를 보낼 수 없습니다';
          } else if (response.message?.contains('limit') == true) {
            errorMessage = '스파크 전송 제한에 도달했습니다. 잠시 후 다시 시도해주세요';
          } else if (response.message != null) {
            errorMessage = response.message!;
          }
          
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(errorMessage),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      print('Error sending spark: $e');
      
      if (mounted) {
        setState(() => _isSending = false);
        
        String errorMessage = '스파크 전송 중 오류가 발생했습니다';
        
        // DioException에서 에러 메시지 추출
        if (e.toString().contains('already exists') || e.toString().contains('이미 이 사용자에게')) {
          errorMessage = '이미 이 사용자와의 스파크가 있습니다';
        } else if (e.toString().contains('blocked')) {
          errorMessage = '차단된 사용자에게는 스파크를 보낼 수 없습니다';
        } else if (e.toString().contains('Network')) {
          errorMessage = '네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요';
        }
        
        // 모달 닫기
        Navigator.of(context).pop(false);
        
        // 에러 메시지 표시
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _scaleAnimation,
      builder: (context, child) {
        return Transform.scale(
          scale: _scaleAnimation.value,
          child: Container(
            height: MediaQuery.of(context).size.height * 0.85,
            decoration: const BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
            ),
            child: _isSuccess ? _buildSuccessView() : _buildMainView(),
          ),
        );
      },
    );
  }

  Widget _buildSuccessView() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Container(
            width: 120,
            height: 120,
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Icon(
                Icons.check_circle,
                size: 64,
                color: AppColors.primary,
              ),
            ),
          ),
          const SizedBox(height: AppSpacing.xl),
          Text(
            '스파크를 보냈어요!',
            style: AppTextStyles.headlineMedium.copyWith(
              fontWeight: FontWeight.bold,
              color: AppColors.textPrimary,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            '상대방이 수락하면 채팅을 시작할 수 있어요',
            style: AppTextStyles.bodyLarge.copyWith(
              color: AppColors.textSecondary,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildMainView() {
    return Column(
      children: [
        // Handle
        Container(
          margin: const EdgeInsets.only(top: AppSpacing.sm),
          width: 40,
          height: 4,
          decoration: BoxDecoration(
            color: AppColors.grey300,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        
        // Header
        Container(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.electric_bolt,
                    color: AppColors.primary,
                    size: 28,
                  ),
                  const SizedBox(width: AppSpacing.xs),
                  Text(
                    '스파크 보내기',
                    style: AppTextStyles.headlineSmall.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: AppSpacing.sm),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: AppColors.primary.withValues(alpha: 0.2),
                    child: Text(
                      widget.targetUsername[0].toUpperCase(),
                      style: TextStyle(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  Text(
                    widget.targetUsername,
                    style: AppTextStyles.titleMedium.copyWith(
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
              if (widget.spotTitle != null) ...[
                const SizedBox(height: AppSpacing.xs),
                Text(
                  widget.spotTitle!,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.textSecondary,
                  ),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                ),
              ],
            ],
          ),
        ),
        
        // Spark Types
        Expanded(
          child: SingleChildScrollView(
            padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.primary.withValues(alpha: 0.08),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.primary.withValues(alpha: 0.2),
                    ),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.tips_and_updates,
                        color: AppColors.primary,
                        size: 20,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Text(
                          '스파크 타입을 선택하고 메시지를 추가하세요',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: AppSpacing.lg),
                Text(
                  '스파크 타입 선택',
                  style: AppTextStyles.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                
                // Spark Type Grid
                ...List.generate(
                  (_sparkTypes.length / 2).ceil(),
                  (rowIndex) {
                    final startIndex = rowIndex * 2;
                    final endIndex = (startIndex + 2).clamp(0, _sparkTypes.length);
                    final rowTypes = _sparkTypes.sublist(startIndex, endIndex);
                    
                    return Padding(
                      padding: const EdgeInsets.only(bottom: AppSpacing.md),
                      child: Row(
                        children: rowTypes.map((type) {
                          final isSelected = _selectedSparkType == type['id'];
                          return Expanded(
                            child: GestureDetector(
                              onTap: () {
                                setState(() => _selectedSparkType = type['id']);
                                HapticFeedback.selectionClick();
                              },
                              child: AnimatedContainer(
                                duration: const Duration(milliseconds: 200),
                                margin: EdgeInsets.only(
                                  right: type == rowTypes.last && rowTypes.length == 2 
                                      ? 0 : AppSpacing.sm,
                                ),
                                padding: const EdgeInsets.all(AppSpacing.md),
                                decoration: BoxDecoration(
                                  color: isSelected
                                      ? (type['color'] as Color).withValues(alpha: 0.1)
                                      : AppColors.surface,
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: isSelected
                                        ? type['color'] as Color
                                        : AppColors.grey200,
                                    width: isSelected ? 2 : 1,
                                  ),
                                ),
                                child: Column(
                                  children: [
                                    Text(
                                      type['icon'],
                                      style: const TextStyle(fontSize: 32),
                                    ),
                                    const SizedBox(height: AppSpacing.sm),
                                    Text(
                                      type['title'],
                                      style: AppTextStyles.bodyMedium.copyWith(
                                        fontWeight: FontWeight.w600,
                                        color: isSelected
                                            ? type['color'] as Color
                                            : AppColors.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: AppSpacing.xs),
                                    Text(
                                      type['description'],
                                      style: AppTextStyles.bodySmall.copyWith(
                                        color: AppColors.textSecondary,
                                      ),
                                      textAlign: TextAlign.center,
                                      maxLines: 2,
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          );
                        }).toList(),
                      ),
                    );
                  },
                ),
                
                const SizedBox(height: AppSpacing.lg),
                
                // Message Input
                Text(
                  '메시지 (선택사항)',
                  style: AppTextStyles.titleMedium.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                TextField(
                  controller: _messageController,
                  maxLines: 4,
                  maxLength: 200,
                  decoration: InputDecoration(
                    hintText: '상대방에게 전하고 싶은 메시지를 입력하세요...',
                    hintStyle: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                    filled: true,
                    fillColor: AppColors.surface,
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.grey200),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.grey200),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(color: AppColors.primary, width: 2),
                    ),
                    contentPadding: const EdgeInsets.all(AppSpacing.md),
                  ),
                ),
                
                const SizedBox(height: AppSpacing.xl),
              ],
            ),
          ),
        ),
        
        // Action Buttons
        Container(
          padding: EdgeInsets.only(
            left: AppSpacing.lg,
            right: AppSpacing.lg,
            top: AppSpacing.md,
            bottom: MediaQuery.of(context).padding.bottom + AppSpacing.lg,
          ),
          decoration: BoxDecoration(
            color: AppColors.surface,
            border: Border(
              top: BorderSide(color: AppColors.grey200),
            ),
          ),
          child: Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: _isSending ? null : () => Navigator.of(context).pop(),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    side: BorderSide(color: AppColors.grey300),
                  ),
                  child: Text(
                    '취소',
                    style: AppTextStyles.bodyLarge.copyWith(
                      color: AppColors.textSecondary,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: AppSpacing.md),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  onPressed: _isSending ? null : _sendSpark,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                  ),
                  child: _isSending
                      ? const SizedBox(
                          height: 20,
                          width: 20,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                          ),
                        )
                      : Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(
                              Icons.electric_bolt,
                              color: Colors.white,
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Text(
                              '스파크 보내기',
                              style: AppTextStyles.bodyLarge.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}