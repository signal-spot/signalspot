import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:http/http.dart' as http;
import 'dart:convert';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/widgets/spark_send_modal.dart';
import '../../../../shared/widgets/report_block_dialog.dart';
import '../../../../core/api/api_client.dart';
import '../../../../shared/services/signal_service.dart';
import '../../../../shared/services/comment_service.dart';
import '../../../../shared/services/user_service.dart';
import '../../../../shared/services/report_service.dart';
import '../../../../shared/services/profile_service.dart';
import '../../../../shared/models/signal_spot.dart';
import '../../../../features/auth/presentation/providers/auth_provider.dart';
import '../../../../features/auth/presentation/models/auth_state.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class NoteDetailPage extends ConsumerStatefulWidget {
  final String noteId;
  
  const NoteDetailPage({
    super.key,
    required this.noteId,
  });

  @override
  ConsumerState<NoteDetailPage> createState() => _NoteDetailPageState();
}

class _NoteDetailPageState extends ConsumerState<NoteDetailPage>
    with TickerProviderStateMixin {
  late AnimationController _likeController;
  late Animation<double> _likeAnimation;
  late SignalService _signalService;
  late CommentService _commentService;
  late UserService _userService;
  
  final TextEditingController _commentController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _commentFocusNode = FocusNode();
  
  bool _isLiked = false;
  int _likeCount = 0;
  int _commentCount = 0;
  bool _isLoading = true;
  bool _hasError = false;
  bool _isLoadingComments = false;
  bool _isSendingComment = false;
  String _errorMessage = '';
  String _locationAddress = '위치 확인 중...';
  
  List<Comment> _comments = [];
  Map<String, dynamic> _noteData = {};

  @override
  void initState() {
    super.initState();
    
    _signalService = SignalService();
    _commentService = CommentService(ApiClient());
    _userService = UserService();
    
    _likeController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    
    _likeAnimation = Tween<double>(
      begin: 1.0,
      end: 1.3,
    ).animate(CurvedAnimation(
      parent: _likeController,
      curve: Curves.elasticOut,
    ));
    
    _loadNoteDetails();
    _loadComments();
  }
  
  Future<void> _loadNoteDetails() async {
    try {
      // 타임아웃 설정 (5초)
      final spot = await _signalService.getSpotById(widget.noteId)
          .timeout(
            const Duration(seconds: 5),
            onTimeout: () {
              print('Timeout loading spot details');
              return null;
            },
          );
      
      if (spot != null && mounted) {
        // getSpotById를 호출하면 백엔드에서 자동으로 조회수 증가
        // 별도의 view interaction 호출 불필요
        
        // 좌표에서 주소 가져오기
        _getAddressFromCoordinates(spot.latitude, spot.longitude).then((address) {
          if (mounted) {
            setState(() {
              _locationAddress = address;
            });
          }
        });
        
        // 백엔드 응답 디버깅
        print('=== SignalSpot 응답 데이터 ===');
        print('spot.id: ${spot.id}');
        print('spot.userId: ${spot.userId}');
        print('spot.creatorId: ${spot.creatorId}');
        print('spot.creatorUsername: ${spot.creatorUsername}');
        print('spot.creatorAvatar: ${spot.creatorAvatar}');
        print('spot.metadata: ${spot.metadata}');
        print('===========================');
        
        setState(() {
          _noteData = {
            'id': spot.id,
            'authorId': spot.userId ?? spot.creatorId,
            'title': spot.title ?? '무제',
            'content': spot.content,
            'author': spot.creatorUsername ?? '익명',
            'authorAvatar': spot.creatorAvatar,
            'category': spot.tags?.isNotEmpty == true ? spot.tags!.first : '일상',
            'tags': spot.tags ?? [],
            'mood': _getMoodEmoji(spot.metadata?['type'] ?? 'moment'),
            'latitude': spot.latitude,
            'longitude': spot.longitude,
            'createdAt': _getTimeAgo(spot.createdAt),
            'isAnonymous': spot.metadata?['isAnonymous'] ?? true,
            'likes': spot.engagement?['likeCount'] ?? 0,
            'comments': spot.engagement?['replyCount'] ?? 0,
            'views': spot.viewCount,
          };
          _likeCount = spot.engagement?['likeCount'] ?? 0;
          _isLiked = spot.engagement?['isLiked'] ?? false;
          print('SignalSpot loaded - isLiked: $_isLiked, likeCount: $_likeCount');
          print('Engagement data: ${spot.engagement}');
          _isLoading = false;
          _hasError = false;
        });
      } else {
        // spot이 null인 경우 (타임아웃 또는 404)
        if (mounted) {
          setState(() {
            _isLoading = false;
            _hasError = true;
            _errorMessage = '쪽지를 찾을 수 없습니다.';
          });
        }
      }
    } catch (e) {
      print('Error loading note details: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
          _hasError = true;
          _errorMessage = '쪽지를 불러오는데 실패했습니다.';
        });
        
        // 에러 스낵바 표시
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('오류가 발생했습니다. 다시 시도해주세요.'),
            action: SnackBarAction(
              label: '다시 시도',
              onPressed: _loadNoteDetails,
            ),
          ),
        );
      }
    }
  }
  
  String _getMoodEmoji(String spotType) {
    switch (spotType) {
      case 'moment':
        return '😊';
      case 'event':
        return '🎉';
      case 'recommendation':
        return '💡';
      case 'question':
        return '🤔';
      case 'meetup':
        return '🤝';
      default:
        return '😊';
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
  
  Future<String> _getAddressFromCoordinates(double latitude, double longitude) async {
    try {
      // Google Geocoding API 키 (나중에 환경변수로 이동 필요)
      const apiKey = 'YOUR_GOOGLE_MAPS_API_KEY';
      
      // 일단 Nominatim (OpenStreetMap) 무료 API 사용
      final url = Uri.parse(
        'https://nominatim.openstreetmap.org/reverse?'
        'lat=$latitude&lon=$longitude&format=json&accept-language=ko'
      );
      
      final response = await http.get(
        url,
        headers: {'User-Agent': 'SignalSpot/1.0'},
      );
      
      if (response.statusCode == 200) {
        final data = json.decode(response.body);
        final displayName = data['display_name'] ?? '';
        
        // 주소를 간단하게 파싱
        if (displayName.isNotEmpty) {
          final parts = displayName.split(',');
          if (parts.length >= 3) {
            // 대략적인 동네명 + 구/시 정보만 반환
            return '${parts[0].trim()}, ${parts[1].trim()}';
          }
          return parts[0].trim();
        }
      }
    } catch (e) {
      print('Error getting address: $e');
    }
    
    // 실패시 대략적인 위치 표시
    return '위도 ${latitude.toStringAsFixed(4)}, 경도 ${longitude.toStringAsFixed(4)}';
  }

  @override
  void dispose() {
    _likeController.dispose();
    _commentController.dispose();
    _scrollController.dispose();
    _commentFocusNode.dispose();
    super.dispose();
  }

  void _toggleLike() async {
    setState(() {
      _isLiked = !_isLiked;
      _likeCount += _isLiked ? 1 : -1;
    });
    
    if (_isLiked) {
      _likeController.forward().then((_) {
        _likeController.reverse();
      });
      HapticFeedback.lightImpact();
    }
    
    try {
      final result = await _signalService.toggleLike(widget.noteId);
      print('Like toggle result: $result');
      
      if (mounted) {
        setState(() {
          _likeCount = result['likeCount'] ?? _likeCount;
          _isLiked = result['isLiked'] ?? _isLiked;
        });
        print('Updated state - isLiked: $_isLiked, likeCount: $_likeCount');
      }
    } catch (e) {
      // Revert on error
      if (mounted) {
        setState(() {
          _isLiked = !_isLiked;
          _likeCount += _isLiked ? 1 : -1;
        });
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('좋아요 처리 중 오류가 발생했습니다')),
        );
      }
    }
  }



  Future<void> _loadComments() async {
    setState(() => _isLoadingComments = true);
    
    try {
      final comments = await _commentService.getComments(widget.noteId);
      if (mounted) {
        setState(() {
          _comments = comments;
          _commentCount = comments.length;
          _isLoadingComments = false;
        });
      }
    } catch (e) {
      print('Error loading comments: $e');
      if (mounted) {
        setState(() => _isLoadingComments = false);
      }
    }
  }
  
  Future<void> _sendSpark() async {

    // 스파크 기능 설명 다이얼로그 먼저 표시 (처음 사용자를 위해)
    final shouldProceed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: Row(
          children: [
            Icon(
              Icons.flash_on,
              color: AppColors.primary,
              size: 28,
            ),
            const SizedBox(width: AppSpacing.sm),
            const Text('스파크 보내기'),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              '${_noteData['author']}님에게 스파크를 보내시겠습니까?',
              style: AppTextStyles.bodyLarge.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            const SizedBox(height: AppSpacing.md),
            Container(
              padding: const EdgeInsets.all(AppSpacing.md),
              decoration: BoxDecoration(
                color: AppColors.primary.withOpacity(0.1),
                borderRadius: BorderRadius.circular(8),
                border: Border.all(
                  color: AppColors.primary.withOpacity(0.3),
                ),
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
                        '스파크란?',
                        style: AppTextStyles.bodySmall.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.primary,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Text(
                    '• 상대방에게 관심을 표현하는 특별한 방법\n'
                    '• 다양한 타입 선택 가능 (관심, 좋아요, 만남 등)\n'
                    '• 메시지를 함께 보낼 수 있음\n'
                    '• 상대방이 수락하면 채팅으로 매칭\n'
                    '• 위치가 겹치면 자동으로 스파크 매칭 가능',
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.textSecondary,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(false),
            child: Text(
              '취소',
              style: TextStyle(color: AppColors.textSecondary),
            ),
          ),
          ElevatedButton(
            onPressed: () => Navigator.of(context).pop(true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppColors.primary,
              foregroundColor: Colors.white,
            ),
            child: const Text('계속하기'),
          ),
        ],
      ),
    );

    if (shouldProceed != true) return;

    // 스파크 보내기 모달 표시
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => SparkSendModal(
        targetUserId: _noteData['authorId'] ?? '',
        targetUsername: _noteData['author'] ?? '사용자',
        spotId: widget.noteId,
        spotTitle: _noteData['title'] ?? '무제',
      ),
    ).then((result) {
      if (result == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(
                  Icons.check_circle,
                  color: Colors.white,
                  size: 20,
                ),
                const SizedBox(width: AppSpacing.sm),
                const Text('스파크를 성공적으로 보냈습니다!'),
              ],
            ),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        );
      }
    });
  }

  Future<void> _sendComment() async {
    if (_commentController.text.trim().isEmpty) return;
    
    setState(() => _isSendingComment = true);
    HapticFeedback.lightImpact();
    
    try {
      final newComment = await _commentService.addComment(
        widget.noteId,
        _commentController.text.trim(),
      );
      
      if (newComment != null && mounted) {
        setState(() {
          _comments.insert(0, newComment);
          _commentCount = _comments.length;
          _commentController.clear();
          _isSendingComment = false;
        });
        
        // 스크롤을 최상단으로
        _scrollController.animateTo(
          0,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    } catch (e) {
      print('Error sending comment: $e');
      if (mounted) {
        setState(() => _isSendingComment = false);
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('댓글 작성에 실패했습니다')),
        );
      }
    }
  }
  
  Future<void> _toggleCommentLike(String commentId) async {
    try {
      await _commentService.toggleCommentLike(widget.noteId, commentId);
      // 옵티미스틱 업데이트
      setState(() {
        final index = _comments.indexWhere((c) => c.id == commentId);
        if (index != -1) {
          final comment = _comments[index];
          comment.isLiked = !comment.isLiked;
          comment.likes = comment.likes + (comment.isLiked ? 1 : -1);
        }
      });
    } catch (e) {
      print('Error toggling comment like: $e');
    }
  }


  @override
  Widget build(BuildContext context) {
    // 로딩 상태
    if (_isLoading) {
      return Scaffold(
        backgroundColor: AppColors.white,
        appBar: AppBar(
          flexibleSpace: Container(
            decoration: BoxDecoration(
              gradient: AppColors.getTimeBasedGradient(),
            ),
          ),
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            onPressed: () => context.pop(),
            icon: const Icon(Icons.arrow_back_ios, color: AppColors.white),
          ),
        ),
        body: const Center(
          child: CircularProgressIndicator(
            color: AppColors.primary,
          ),
        ),
      );
    }
    
    // 에러 상태
    if (_hasError) {
      return Scaffold(
        backgroundColor: AppColors.white,
        appBar: AppBar(
          flexibleSpace: Container(
            decoration: BoxDecoration(
              gradient: AppColors.getTimeBasedGradient(),
            ),
          ),
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            onPressed: () => context.pop(),
            icon: const Icon(Icons.arrow_back_ios, color: AppColors.white),
          ),
        ),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                Icons.error_outline,
                size: 64,
                color: AppColors.grey400,
              ),
              const SizedBox(height: AppSpacing.md),
              Text(
                _errorMessage,
                style: AppTextStyles.bodyLarge.copyWith(
                  color: AppColors.textSecondary,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: AppSpacing.lg),
              ElevatedButton(
                onPressed: () {
                  setState(() {
                    _isLoading = true;
                    _hasError = false;
                  });
                  _loadNoteDetails();
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.xl,
                    vertical: AppSpacing.md,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(24),
                  ),
                ),
                child: Text(
                  '다시 시도',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: Colors.white,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
        ),
      );
    }
    
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        title: Text(
          '쪽지 상세',
          style: TextStyle(
            color: AppColors.white,
            fontWeight: FontWeight.w600,
          ),
        ),
        flexibleSpace: Container(
          decoration: BoxDecoration(
            gradient: AppColors.getTimeBasedGradient(),
          ),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: IconThemeData(
          color: AppColors.white,
        ),
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios, color: AppColors.white),
        ),
        actions: [
          PopupMenuButton<String>(
            icon: const Icon(Icons.more_vert, color: AppColors.white),
            onSelected: (value) {
              switch (value) {
                case 'profile':
                  _showProfileDialog();
                  break;
                case 'report':
                  // 바로 신고 다이얼로그 표시
                  final authorId = _noteData['authorId'] ?? _noteData['creatorId'] ?? _noteData['userId'];
                  final authorName = _noteData['author'] ?? '익명';
                  
                  if (authorId == null) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('사용자 정보를 찾을 수 없습니다'),
                        backgroundColor: AppColors.error,
                      ),
                    );
                    return;
                  }
                  
                  showReportDialog(
                    context: context,
                    ref: ref,
                    userId: authorId,
                    userName: authorName,
                    contextType: 'signal_spot',
                    contextId: widget.noteId,
                  );
                  break;
                case 'block':
                  // 바로 차단 다이얼로그 표시
                  final authorId = _noteData['authorId'] ?? _noteData['creatorId'] ?? _noteData['userId'];
                  final authorName = _noteData['author'] ?? '익명';
                  
                  if (authorId == null) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        content: Text('사용자 정보를 찾을 수 없습니다'),
                        backgroundColor: AppColors.error,
                      ),
                    );
                    return;
                  }
                  
                  showBlockDialog(
                    context: context,
                    ref: ref,
                    userId: authorId,
                    userName: authorName,
                    onBlocked: () {
                      // 차단 후 이전 화면으로 돌아가기
                      Navigator.of(context).pop();
                    },
                  );
                  break;
              }
            },
            itemBuilder: (context) => [
              const PopupMenuItem(
                value: 'profile',
                child: Row(
                  children: [
                    Icon(Icons.person_outline, size: 20),
                    SizedBox(width: 8),
                    Text('프로필 보기'),
                  ],
                ),
              ),
              const PopupMenuDivider(),
              const PopupMenuItem(
                value: 'report',
                child: Row(
                  children: [
                    Icon(Icons.report, size: 20),
                    SizedBox(width: 8),
                    Text('신고하기'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'block',
                child: Row(
                  children: [
                    Icon(Icons.block, size: 20, color: Colors.red),
                    SizedBox(width: 8),
                    Text('차단하기', style: TextStyle(color: Colors.red)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: Stack(
        children: [
          SingleChildScrollView(
            controller: _scrollController,
            padding: const EdgeInsets.only(bottom: 80),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Note Header
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // Category, Tags and Mood
                      Wrap(
                        spacing: AppSpacing.xs,
                        runSpacing: AppSpacing.xs,
                        children: [
                          Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.md,
                              vertical: AppSpacing.xs,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(16),
                              border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                            ),
                            child: Text(
                              _noteData['category'] ?? '일상',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.primary,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                          ),
                          // 태그 표시
                          if (_noteData['tags'] != null && (_noteData['tags'] as List).isNotEmpty)
                            ...(_noteData['tags'] as List).map((tag) => Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.sm,
                                vertical: AppSpacing.xs,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.grey100,
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(color: AppColors.grey300),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  Icon(
                                    Icons.tag,
                                    size: 12,
                                    color: AppColors.grey600,
                                  ),
                                  const SizedBox(width: 2),
                                  Text(
                                    tag.toString(),
                                    style: AppTextStyles.caption.copyWith(
                                      color: AppColors.textSecondary,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            )).toList(),
                          const SizedBox(width: AppSpacing.xs),
                          Text(
                            _noteData['mood'] ?? '😊',
                            style: const TextStyle(fontSize: 20),
                          ),
                        ],
                      ),
                      
                      const SizedBox(height: AppSpacing.md),
                      
                      // Title
                      Text(
                        _noteData['title'] ?? '무제',
                        style: AppTextStyles.headlineMedium.copyWith(
                          fontWeight: FontWeight.bold,
                          color: AppColors.textPrimary,
                          height: 1.3,
                        ),
                      ),
                      
                      const SizedBox(height: AppSpacing.md),
                      
                      // Author and Time
                      Row(
                        children: [
                          CircleAvatar(
                            radius: 16,
                            backgroundColor: AppColors.grey300,
                            backgroundImage: _noteData['authorAvatar'] != null && _noteData['authorAvatar'].isNotEmpty
                                ? NetworkImage(_noteData['authorAvatar'])
                                : null,
                            child: _noteData['authorAvatar'] == null || _noteData['authorAvatar'].isEmpty
                                ? Icon(
                                    (_noteData['isAnonymous'] ?? true) ? Icons.person : Icons.account_circle,
                                    size: 20,
                                    color: AppColors.grey600,
                                  )
                                : null,
                          ),
                          const SizedBox(width: AppSpacing.sm),
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                _noteData['author'] ?? '익명',
                                style: AppTextStyles.bodyMedium.copyWith(
                                  fontWeight: FontWeight.w500,
                                  color: AppColors.textPrimary,
                                ),
                              ),
                              Text(
                                _noteData['createdAt'] ?? '',
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
                
                // Location Info
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.grey200),
                  ),
                  child: Row(
                    children: [
                      Icon(
                        Icons.location_on,
                        color: AppColors.primary,
                        size: 20,
                      ),
                      const SizedBox(width: AppSpacing.sm),
                      Expanded(
                        child: Text(
                          _locationAddress,
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.textPrimary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: AppSpacing.lg),
                
                // Content
                Container(
                  width: double.infinity,
                  margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  padding: const EdgeInsets.all(AppSpacing.lg),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: AppColors.grey200),
                  ),
                  child: Text(
                    _noteData['content'] ?? '',
                    style: AppTextStyles.bodyLarge.copyWith(
                      color: AppColors.textPrimary,
                      height: 1.6,
                    ),
                  ),
                ),
                
                const SizedBox(height: AppSpacing.lg),
                
                // Actions
                Container(
                  margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  padding: const EdgeInsets.all(AppSpacing.md),
                  decoration: BoxDecoration(
                    color: AppColors.surface,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: AppColors.grey200),
                  ),
                  child: Row(
                    children: [
                      // Like Button
                      GestureDetector(
                        onTap: _toggleLike,
                        child: AnimatedBuilder(
                          animation: _likeAnimation,
                          builder: (context, child) {
                            return Transform.scale(
                              scale: _likeAnimation.value,
                              child: Row(
                                children: [
                                  Icon(
                                    _isLiked ? Icons.favorite : Icons.favorite_border,
                                    color: _isLiked ? AppColors.error : AppColors.grey500,
                                    size: 24,
                                  ),
                                  const SizedBox(width: AppSpacing.xs),
                                  Text(
                                    _likeCount.toString(),
                                    style: AppTextStyles.bodyMedium.copyWith(
                                      color: _isLiked ? AppColors.error : AppColors.textSecondary,
                                      fontWeight: FontWeight.w500,
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                      
                      const SizedBox(width: AppSpacing.lg),
                      
                      // View Count
                      Row(
                        children: [
                          Icon(
                            Icons.visibility_outlined,
                            color: AppColors.grey500,
                            size: 24,
                          ),
                          const SizedBox(width: AppSpacing.xs),
                          Text(
                            '${_noteData['views'] ?? 0}',
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      
                      const SizedBox(width: AppSpacing.lg),
                      
                      // Comment Count (not clickable)
                      Row(
                        children: [
                          Icon(
                            Icons.chat_bubble_outline,
                            color: AppColors.grey500,
                            size: 24,
                          ),
                          const SizedBox(width: AppSpacing.xs),
                          Text(
                            '$_commentCount',
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.textSecondary,
                              fontWeight: FontWeight.w500,
                            ),
                          ),
                        ],
                      ),
                      
                      const Spacer(),
                    ],
                  ),
                ),
                
                const SizedBox(height: AppSpacing.lg),
                
                // Spark Sending Section
                // 본인 게시물이면 비활성화, 다른 사람이면 활성화  
                  Builder(
                    builder: (context) {
                      final authState = ref.watch(authProvider);
                      final currentUserId = authState is AuthenticatedState ? authState.user.id : null;
                      final isOwnPost = currentUserId != null && currentUserId == _noteData['authorId'];
                      
                      return Container(
                    margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [
                          AppColors.primary.withOpacity(0.1),
                          AppColors.secondary.withOpacity(0.05),
                        ],
                      ),
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(
                        color: AppColors.primary.withOpacity(0.2),
                        width: 1.5,
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(AppSpacing.sm),
                              decoration: BoxDecoration(
                                color: AppColors.primary.withOpacity(0.15),
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Icon(
                                Icons.flash_on,
                                color: AppColors.primary,
                                size: 24,
                              ),
                            ),
                            const SizedBox(width: AppSpacing.md),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    '스파크 보내기',
                                    style: AppTextStyles.titleMedium.copyWith(
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                  const SizedBox(height: 2),
                                  Text(
                                    isOwnPost 
                                      ? '내 쪽지에는 스파크를 보낼 수 없습니다'
                                      : '${_noteData['author']}님과 연결하고 싶으신가요?',
                                    style: AppTextStyles.bodySmall.copyWith(
                                      color: isOwnPost ? AppColors.grey500 : AppColors.textSecondary,
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.md),
                        Text(
                          isOwnPost
                            ? '내가 작성한 쪽지입니다. 다른 사람들의 스파크를 기다려보세요!'
                            : '스파크는 상대방에게 관심을 표현하는 특별한 기능입니다. '
                              '상대방이 수락하면 채팅으로 연결됩니다. '
                              '또한 위치가 겹치면 자동으로 스파크 매칭이 이루어집니다!',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: isOwnPost ? AppColors.grey500 : AppColors.textSecondary,
                            height: 1.4,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        SizedBox(
                          width: double.infinity,
                          child: ElevatedButton(
                            onPressed: isOwnPost ? null : _sendSpark,
                            style: ElevatedButton.styleFrom(
                              backgroundColor: isOwnPost ? AppColors.grey300 : AppColors.primary,
                              foregroundColor: isOwnPost ? AppColors.grey600 : Colors.white,
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.xl,
                                vertical: AppSpacing.md,
                              ),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(12),
                              ),
                              elevation: isOwnPost ? 0 : 2,
                            ),
                            child: Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Icon(
                                  Icons.electric_bolt,
                                  size: 20,
                                  color: isOwnPost ? AppColors.grey500 : Colors.white,
                                ),
                                const SizedBox(width: AppSpacing.sm),
                                Text(
                                  isOwnPost ? '내 쪽지입니다' : '스파크 보내기',
                                  style: AppTextStyles.bodyLarge.copyWith(
                                    fontWeight: FontWeight.w600,
                                    color: isOwnPost ? AppColors.grey500 : Colors.white,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      ],
                    ),
                  );
                    },
                  ),
                  const SizedBox(height: AppSpacing.lg),
                
                // Comments Section Title
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                  child: Text(
                    '댓글 $_commentCount개',
                    style: AppTextStyles.titleMedium.copyWith(
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                ),
                
                const SizedBox(height: AppSpacing.md),
                
                // Comments List
                if (_isLoadingComments)
                  const Center(
                    child: Padding(
                      padding: EdgeInsets.all(AppSpacing.lg),
                      child: CircularProgressIndicator(
                        color: AppColors.primary,
                      ),
                    ),
                  )
                else if (_comments.isEmpty)
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                    padding: const EdgeInsets.all(AppSpacing.xl),
                    child: Center(
                      child: Column(
                        children: [
                          Icon(
                            Icons.chat_bubble_outline,
                            size: 48,
                            color: AppColors.grey400,
                          ),
                          const SizedBox(height: AppSpacing.md),
                          Text(
                            '아직 댓글이 없습니다',
                            style: AppTextStyles.bodyLarge.copyWith(
                              color: AppColors.textSecondary,
                            ),
                          ),
                          const SizedBox(height: AppSpacing.xs),
                          Text(
                            '첫 번째 댓글을 남겨보세요!',
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.grey500,
                            ),
                          ),
                        ],
                      ),
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    padding: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                    itemCount: _comments.length,
                    itemBuilder: (context, index) {
                      final comment = _comments[index];
                      return Container(
                        margin: const EdgeInsets.only(bottom: AppSpacing.md),
                        padding: const EdgeInsets.all(AppSpacing.md),
                        decoration: BoxDecoration(
                          color: AppColors.surface,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: AppColors.grey200),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                CircleAvatar(
                                  radius: 14,
                                  backgroundColor: AppColors.grey300,
                                  backgroundImage: comment.authorAvatar != null && comment.authorAvatar!.isNotEmpty
                                      ? NetworkImage(comment.authorAvatar!)
                                      : null,
                                  child: comment.authorAvatar == null || comment.authorAvatar!.isEmpty
                                      ? Icon(
                                          Icons.person,
                                          size: 16,
                                          color: AppColors.grey600,
                                        )
                                      : null,
                                ),
                                const SizedBox(width: AppSpacing.sm),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        comment.author,
                                        style: AppTextStyles.bodySmall.copyWith(
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.textPrimary,
                                        ),
                                      ),
                                      Text(
                                        _getTimeAgo(comment.createdAt),
                                        style: AppTextStyles.caption.copyWith(
                                          color: AppColors.grey500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                                GestureDetector(
                                  onTap: () => _toggleCommentLike(comment.id),
                                  child: Row(
                                    children: [
                                      Icon(
                                        comment.isLiked 
                                          ? Icons.favorite 
                                          : Icons.favorite_border,
                                        size: 16,
                                        color: comment.isLiked
                                          ? AppColors.error
                                          : AppColors.grey500,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        '${comment.likes}',
                                        style: AppTextStyles.caption.copyWith(
                                          color: comment.isLiked 
                                            ? AppColors.error 
                                            : AppColors.grey500,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: AppSpacing.sm),
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
                
                const SizedBox(height: AppSpacing.xxl),
              ],
            ),
          ),
          
          // Fixed Comment Input at Bottom
          Positioned(
            left: 0,
            right: 0,
            bottom: 0,
            child: Container(
              padding: EdgeInsets.only(
                left: AppSpacing.md,
                right: AppSpacing.md,
                top: AppSpacing.sm,
                bottom: MediaQuery.of(context).padding.bottom + AppSpacing.sm,
              ),
              decoration: BoxDecoration(
                color: AppColors.background,
                border: Border(
                  top: BorderSide(color: AppColors.grey200),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.05),
                    blurRadius: 10,
                    offset: const Offset(0, -2),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _commentController,
                      focusNode: _commentFocusNode,
                      maxLines: null,
                      minLines: 1,
                      maxLength: 500,
                      buildCounter: (context, {required currentLength, required isFocused, maxLength}) => null,
                      decoration: InputDecoration(
                        hintText: '댓글을 입력하세요...',
                        hintStyle: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.grey500,
                        ),
                        filled: true,
                        fillColor: AppColors.surface,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.sm,
                        ),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide(color: AppColors.grey200),
                        ),
                        enabledBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide(color: AppColors.grey200),
                        ),
                        focusedBorder: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide(color: AppColors.primary),
                        ),
                      ),
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ),
                  const SizedBox(width: AppSpacing.sm),
                  IconButton(
                    onPressed: _isSendingComment ? null : _sendComment,
                    icon: _isSendingComment
                      ? SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(
                            strokeWidth: 2,
                            color: AppColors.primary,
                          ),
                        )
                      : Icon(
                          Icons.send,
                          color: AppColors.primary,
                        ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showProfileDialog() async {
    final creatorId = _noteData['creatorId'] ?? _noteData['userId'] ?? _noteData['authorId'];
    
    if (creatorId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('작성자 정보를 찾을 수 없습니다'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }
    
    // 로딩 다이얼로그 표시
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(),
      ),
    );
    
    try {
      final profileService = ProfileService();
      final profile = await profileService.getUserProfile(creatorId);
      
      // 로딩 다이얼로그 닫기
      if (mounted) Navigator.pop(context);
      
      // 프로필 다이얼로그 표시
      if (mounted) {
        showDialog(
          context: context,
          builder: (context) => Dialog(
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(AppSpacing.borderRadiusXl),
            ),
            child: Container(
              padding: const EdgeInsets.all(AppSpacing.xl),
              constraints: const BoxConstraints(maxWidth: 400, maxHeight: 600),
              child: SingleChildScrollView(
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // 닉네임을 최상단에 표시
                    Text(
                      profile.displayName ?? '알 수 없는 사용자',
                      style: AppTextStyles.headlineSmall.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    
                    // 프로필 이미지
                    Container(
                      width: 100,
                      height: 100,
                      decoration: BoxDecoration(
                        gradient: LinearGradient(
                          colors: [
                            AppColors.primary.withValues(alpha: 0.8),
                            AppColors.secondary.withValues(alpha: 0.8),
                          ],
                        ),
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.primary.withValues(alpha: 0.3),
                            blurRadius: 20,
                            offset: const Offset(0, 10),
                          ),
                        ],
                      ),
                      child: profile.avatarUrl != null
                          ? ClipOval(
                              child: Image.network(
                                profile.avatarUrl!,
                                width: 100,
                                height: 100,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) => const Icon(
                                  Icons.person,
                                  color: AppColors.white,
                                  size: 50,
                                ),
                              ),
                            )
                          : const Icon(
                              Icons.person,
                              color: AppColors.white,
                              size: 50,
                            ),
                    ),
                    const SizedBox(height: AppSpacing.md),
                    
                    // Bio가 있으면 표시
                    if (profile.bio != null && profile.bio!.isNotEmpty) ...[
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.lg,
                          vertical: AppSpacing.sm,
                        ),
                        child: Text(
                          profile.bio!,
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.grey600,
                          ),
                          textAlign: TextAlign.center,
                          maxLines: 3,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                    ],
                    
                    const SizedBox(height: AppSpacing.lg),
                    
                    // 시그니처 커넥션 정보
                    if (profile.signatureConnection != null) ...[
                      _buildProfileSection(
                        title: '시그니처 커넥션',
                        children: [
                          if (profile.signatureConnection!.mbti != null)
                            _buildInfoRow('MBTI', profile.signatureConnection!.mbti!),
                          if (profile.signatureConnection!.interests != null && 
                              profile.signatureConnection!.interests!.isNotEmpty)
                            _buildInfoRow('관심사', profile.signatureConnection!.interests!.join(', ')),
                          if (profile.signatureConnection!.memorablePlace != null)
                            _buildInfoRow('기억에 남는 장소', profile.signatureConnection!.memorablePlace!),
                          if (profile.signatureConnection!.childhoodMemory != null)
                            _buildInfoRow('어린 시절 추억', profile.signatureConnection!.childhoodMemory!),
                          if (profile.signatureConnection!.turningPoint != null)
                            _buildInfoRow('인생의 전환점', profile.signatureConnection!.turningPoint!),
                          if (profile.signatureConnection!.proudestMoment != null)
                            _buildInfoRow('가장 자랑스러운 순간', profile.signatureConnection!.proudestMoment!),
                          if (profile.signatureConnection!.bucketList != null)
                            _buildInfoRow('버킷리스트', profile.signatureConnection!.bucketList!),
                          if (profile.signatureConnection!.lifeLesson != null)
                            _buildInfoRow('인생 교훈', profile.signatureConnection!.lifeLesson!),
                        ],
                      ),
                      const SizedBox(height: AppSpacing.lg),
                    ],
                    
                    const SizedBox(height: AppSpacing.lg),
                    
                    // 닫기 버튼
                    SizedBox(
                      width: double.infinity,
                      child: ElevatedButton(
                        onPressed: () => Navigator.pop(context),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primary,
                          padding: const EdgeInsets.symmetric(
                            vertical: AppSpacing.md,
                          ),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          '닫기',
                          style: TextStyle(color: Colors.white),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        );
      }
    } catch (e) {
      // 로딩 다이얼로그 닫기
      if (mounted) Navigator.pop(context);
      
      // 에러 처리
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('프로필을 불러올 수 없습니다: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }
  
  Widget _buildProfileSection({required String title, required List<Widget> children}) {
    if (children.isEmpty) return const SizedBox.shrink();
    
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.grey100,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: AppTextStyles.labelLarge.copyWith(
              color: AppColors.grey700,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          ...children,
        ],
      ),
    );
  }
  
  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              label,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.grey600,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.grey800,
                fontWeight: FontWeight.w500,
              ),
            ),
          ),
        ],
      ),
    );
  }
}