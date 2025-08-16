import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../core/theme/app_colors.dart';
import '../../core/theme/app_text_styles.dart';
import '../../core/theme/app_spacing.dart';
import '../../core/api/api_client.dart';
import '../services/comment_service.dart';

class CommentModal extends StatefulWidget {
  final String spotId;
  final String spotTitle;
  
  const CommentModal({
    super.key,
    required this.spotId,
    required this.spotTitle,
  });

  @override
  State<CommentModal> createState() => _CommentModalState();
}

class _CommentModalState extends State<CommentModal> {
  final TextEditingController _commentController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _focusNode = FocusNode();
  
  late CommentService _commentService;
  
  bool _isLoading = false;
  bool _isSending = false;
  
  List<Comment> _comments = [];

  @override
  void initState() {
    super.initState();
    _commentService = CommentService(ApiClient());
    _loadComments();
  }

  @override
  void dispose() {
    _commentController.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  Future<void> _loadComments() async {
    setState(() => _isLoading = true);
    
    try {
      final comments = await _commentService.getComments(widget.spotId);
      if (mounted) {
        setState(() {
          _comments = comments;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('댓글을 불러오는데 실패했습니다: $e')),
        );
      }
    }
  }

  void _sendComment() async {
    if (_commentController.text.trim().isEmpty) return;
    
    setState(() => _isSending = true);
    HapticFeedback.lightImpact();
    
    try {
      final newComment = await _commentService.addComment(
        widget.spotId, 
        _commentController.text.trim()
      );
      
      if (newComment != null && mounted) {
        setState(() {
          _comments.insert(0, newComment);
          _commentController.clear();
          _isSending = false;
        });
        
        // 키보드 닫기
        FocusScope.of(context).unfocus();
        
        // Scroll to top to show new comment
        _scrollController.animateTo(
          0,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      } else {
        setState(() => _isSending = false);
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('댓글 작성에 실패했습니다')),
          );
        }
      }
    } catch (e) {
      setState(() => _isSending = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('댓글 작성 중 오류 발생: $e')),
        );
      }
    }
  }

  void _toggleLike(String commentId) async {
    HapticFeedback.lightImpact();
    
    final commentIndex = _comments.indexWhere((c) => c.id == commentId);
    if (commentIndex == -1) return;
    
    final comment = _comments[commentIndex];
    
    // Optimistic update
    setState(() {
      comment.isLiked = !comment.isLiked;
      comment.likes += comment.isLiked ? 1 : -1;
    });
    
    try {
      final result = await _commentService.toggleCommentLike(widget.spotId, commentId);
      
      if (result != null && mounted) {
        setState(() {
          comment.isLiked = result['isLiked'] ?? comment.isLiked;
          comment.likes = result['likeCount'] ?? comment.likes;
        });
        print('✅ Comment like toggled successfully: isLiked=${result['isLiked']}, likeCount=${result['likeCount']}');
      } else {
        print('❌ Failed to toggle comment like - result is null');
      }
    } catch (e) {
      // Revert on error
      if (mounted) {
        setState(() {
          comment.isLiked = !comment.isLiked;
          comment.likes += comment.isLiked ? 1 : -1;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('좋아요 처리 중 오류가 발생했습니다')),
        );
      }
    }
  }
  
  String _getTimeAgo(DateTime dateTime) {
    final now = DateTime.now();
    final difference = now.difference(dateTime);
    
    if (difference.inSeconds < 60) {
      return '방금';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}분 전';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}시간 전';
    } else if (difference.inDays < 30) {
      return '${difference.inDays}일 전';
    } else {
      return '${dateTime.month}월 ${dateTime.day}일';
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // 바깥 클릭 시 키보드 닫기
        FocusScope.of(context).unfocus();
      },
      child: Container(
        height: MediaQuery.of(context).size.height * 0.75,
        decoration: const BoxDecoration(
          color: AppColors.background,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
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
            decoration: BoxDecoration(
              border: Border(
                bottom: BorderSide(color: AppColors.grey200),
              ),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '댓글',
                        style: AppTextStyles.titleLarge.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        widget.spotTitle,
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.textSecondary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.of(context).pop(),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
          ),
          
          // Comments List
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator())
                : _comments.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.chat_bubble_outline,
                              size: 64,
                              color: AppColors.grey300,
                            ),
                            const SizedBox(height: AppSpacing.md),
                            Text(
                              '첫 댓글을 남겨보세요',
                              style: AppTextStyles.bodyLarge.copyWith(
                                color: AppColors.textSecondary,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.separated(
                        controller: _scrollController,
                        padding: const EdgeInsets.all(AppSpacing.lg),
                        itemCount: _comments.length,
                        separatorBuilder: (context, index) => const SizedBox(height: AppSpacing.md),
                        itemBuilder: (context, index) {
                          final comment = _comments[index];
                          return Container(
                            padding: const EdgeInsets.all(AppSpacing.md),
                            decoration: BoxDecoration(
                              color: AppColors.surface,
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: AppColors.grey200),
                            ),
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                // Author and Time
                                Row(
                                  children: [
                                    CircleAvatar(
                                      radius: 16,
                                      backgroundColor: comment.author == '나'
                                          ? AppColors.primary
                                          : AppColors.grey300,
                                      child: Text(
                                        comment.author.isNotEmpty ? comment.author[0] : '?',
                                        style: TextStyle(
                                          color: comment.author == '나'
                                              ? Colors.white
                                              : AppColors.grey600,
                                          fontSize: 14,
                                          fontWeight: FontWeight.bold,
                                        ),
                                      ),
                                    ),
                                    const SizedBox(width: AppSpacing.sm),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            comment.author,
                                            style: AppTextStyles.bodyMedium.copyWith(
                                              fontWeight: FontWeight.w600,
                                              color: comment.author == '나'
                                                  ? AppColors.primary
                                                  : AppColors.textPrimary,
                                            ),
                                          ),
                                          Text(
                                            _getTimeAgo(comment.createdAt),
                                            style: AppTextStyles.bodySmall.copyWith(
                                              color: AppColors.textSecondary,
                                            ),
                                          ),
                                        ],
                                      ),
                                    ),
                                    // Like Button
                                    GestureDetector(
                                      onTap: () => _toggleLike(comment.id),
                                      child: Container(
                                        padding: const EdgeInsets.symmetric(
                                          horizontal: AppSpacing.sm,
                                          vertical: AppSpacing.xs,
                                        ),
                                        decoration: BoxDecoration(
                                          color: comment.isLiked
                                              ? AppColors.error.withValues(alpha: 0.1)
                                              : Colors.transparent,
                                          borderRadius: BorderRadius.circular(16),
                                        ),
                                        child: Row(
                                          children: [
                                            Icon(
                                              comment.isLiked ? Icons.favorite : Icons.favorite_border,
                                              size: 18,
                                              color: comment.isLiked
                                                  ? AppColors.error
                                                  : AppColors.grey500,
                                            ),
                                            const SizedBox(width: 4),
                                            Text(
                                              comment.likes.toString(),
                                              style: AppTextStyles.bodySmall.copyWith(
                                                color: comment.isLiked
                                                    ? AppColors.error
                                                    : AppColors.textSecondary,
                                                fontWeight: FontWeight.w500,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: AppSpacing.sm),
                                // Content
                                Text(
                                  comment.content,
                                  style: AppTextStyles.bodyMedium.copyWith(
                                    color: AppColors.textPrimary,
                                    height: 1.4,
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
          ),
          
          // Input Field
          Container(
            padding: EdgeInsets.only(
              left: AppSpacing.lg,
              right: AppSpacing.lg,
              top: AppSpacing.md,
              bottom: MediaQuery.of(context).viewInsets.bottom + AppSpacing.md,
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
                  child: TextField(
                    controller: _commentController,
                    focusNode: _focusNode,
                    maxLines: null,
                    keyboardType: TextInputType.multiline,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _sendComment(),
                    decoration: InputDecoration(
                      hintText: '댓글을 입력하세요...',
                      hintStyle: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      filled: true,
                      fillColor: AppColors.grey100,
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.lg,
                        vertical: AppSpacing.sm,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: AppSpacing.sm),
                AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  child: IconButton(
                    onPressed: _isSending ? null : _sendComment,
                    icon: _isSending
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2),
                          )
                        : Icon(
                            Icons.send,
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
    );
  }
}