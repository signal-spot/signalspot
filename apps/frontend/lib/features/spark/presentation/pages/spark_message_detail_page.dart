import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/models/spark.dart';
import '../../../../shared/providers/spark_provider.dart';
import '../../../../shared/services/spark_service.dart';
import '../../../../shared/widgets/spark_send_modal.dart';
import '../../../../shared/widgets/report_block_dialog.dart';
import '../../../../shared/services/profile_service.dart';
import '../../../../shared/services/user_service.dart';

class SparkMessageDetailPage extends ConsumerStatefulWidget {
  final String sparkId;

  const SparkMessageDetailPage({
    super.key,
    required this.sparkId,
  });

  @override
  ConsumerState<SparkMessageDetailPage> createState() => _SparkMessageDetailPageState();
}

class _SparkMessageDetailPageState extends ConsumerState<SparkMessageDetailPage> {
  final ScrollController _scrollController = ScrollController();
  Spark? _spark;
  SparkDetail? _sparkDetail;
  bool _isLoadingDetail = false;

  @override
  void initState() {
    super.initState();
    _loadSparkInfo();
  }

  void _loadSparkInfo() {
    // mySparkListProvider에서 스파크 정보 찾기
    final sparksAsync = ref.read(mySparkListProvider);
    sparksAsync.whenData((sparks) {
      final spark = sparks.firstWhere(
        (s) => s.id == widget.sparkId,
        orElse: () => throw Exception('Spark not found'),
      );
      setState(() {
        _spark = spark;
      });
      // 상세 정보 로드
      _loadSparkDetail();
    });
  }
  
  Future<void> _loadSparkDetail() async {
    print('=== Loading spark detail for ID: ${widget.sparkId}');
    setState(() {
      _isLoadingDetail = true;
    });
    
    try {
      final sparkService = ref.read(sparkServiceProvider);
      final detail = await sparkService.getSparkDetail(widget.sparkId);
      print('=== Spark detail loaded successfully');
      print('=== otherUser: ${detail.otherUser}');
      if (detail.otherUser != null) {
        print('=== otherUser nickname: ${detail.otherUser!.nickname}');
        print('=== otherUser bio: ${detail.otherUser!.bio}');
        print('=== otherUser occupation: ${detail.otherUser!.occupation}');
      }
      if (mounted) {
        setState(() {
          _sparkDetail = detail;
          _isLoadingDetail = false;
        });
      }
    } catch (e, stackTrace) {
      print('=== Error loading spark detail: $e');
      print('=== Stack trace: $stackTrace');
      if (mounted) {
        setState(() {
          _isLoadingDetail = false;
        });
      }
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  Future<void> _acceptSpark() async {
    try {
      await ref.read(sparkActionsProvider).acceptSpark(widget.sparkId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('스파크를 수락했습니다!')),
        );
        // 목록 새로고침
        await ref.read(mySparkListProvider.notifier).loadSparks();
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('오류가 발생했습니다: $e')),
        );
      }
    }
  }

  Future<void> _rejectSpark() async {
    try {
      await ref.read(sparkActionsProvider).rejectSpark(widget.sparkId);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('스파크를 거절했습니다')),
        );
        // 목록 새로고침
        await ref.read(mySparkListProvider.notifier).loadSparks();
        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('오류가 발생했습니다: $e')),
        );
      }
    }
  }

  
  // 프로필 보기 다이얼로그
  void _showProfileDialog(String userId, String userName) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return _ProfileViewDialog(
          userId: userId,
          userName: userName,
        );
      },
    );
  }


  Widget _buildProfileItem({
    required IconData icon,
    required String label,
    required String value,
  }) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 20,
          color: AppColors.grey600,
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                label,
                style: AppTextStyles.labelSmall.copyWith(
                  color: AppColors.grey500,
                ),
              ),
              Text(
                value,
                style: AppTextStyles.bodyMedium.copyWith(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
        ),
      ],
    );
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
    } else {
      return '${difference.inDays}일 전';
    }
  }

  String _getRemainingTime(DateTime expiresAt) {
    final remaining = expiresAt.difference(DateTime.now());
    if (remaining.isNegative) {
      return '만료됨';
    } else if (remaining.inHours > 24) {
      return '${remaining.inDays}일';
    } else if (remaining.inHours > 0) {
      return '${remaining.inHours}시간';
    } else {
      return '${remaining.inMinutes}분';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_spark == null) {
      // 스파크 정보 로딩 중
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    final spark = _spark!;
    final userName = spark.otherUserNickname ?? '익명';
    final isManual = spark.type == SparkType.manual;

    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        title: Text(
          '스파크 상세',
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
        actions: [
          PopupMenuButton<String>(
            icon: Icon(
              Icons.more_vert,
              color: AppColors.white,
            ),
            onSelected: (value) {
              final otherUserId = _spark?.direction == SparkDirection.sent
                  ? _spark?.user2Id
                  : _spark?.user1Id;
              final otherUserName = _spark?.otherUserNickname ?? '사용자';
              
              switch (value) {
                case 'profile':
                  _showProfileDialog(otherUserId ?? '', otherUserName);
                  break;
                case 'report':
                  showReportDialog(
                    context: context,
                    ref: ref,
                    userId: otherUserId ?? '',
                    userName: otherUserName,
                    contextType: 'spark',
                    contextId: widget.sparkId,
                  );
                  break;
                case 'block':
                  showBlockDialog(
                    context: context,
                    ref: ref,
                    userId: otherUserId ?? '',
                    userName: otherUserName,
                    onBlocked: () {
                      Navigator.of(context).pop(); // 차단 후 이전 화면으로
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
                    Icon(Icons.person_outline),
                    SizedBox(width: 8),
                    Text('프로필 보기'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'report',
                child: Row(
                  children: [
                    Icon(Icons.report_outlined),
                    SizedBox(width: 8),
                    Text('신고하기'),
                  ],
                ),
              ),
              const PopupMenuItem(
                value: 'block',
                child: Row(
                  children: [
                    Icon(Icons.block_outlined),
                    SizedBox(width: 8),
                    Text('차단하기'),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
      body: Column(
        children: [
          Expanded(
            child: SingleChildScrollView(
              controller: _scrollController,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // 스파크 메시지 카드
                  Container(
                    margin: const EdgeInsets.all(AppSpacing.lg),
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.black.withOpacity(0.05),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        // 사용자 정보
                        Row(
                          children: [
                            CircleAvatar(
                              radius: 24,
                              backgroundColor: AppColors.primary.withOpacity(0.1),
                              backgroundImage: _sparkDetail?.otherUser?.avatarUrl != null
                                ? NetworkImage(_sparkDetail!.otherUser!.avatarUrl!)
                                : null,
                              child: _sparkDetail?.otherUser?.avatarUrl == null
                                ? Text(
                                    userName[0],
                                    style: AppTextStyles.titleMedium.copyWith(
                                      color: AppColors.primary,
                                    ),
                                  )
                                : null,
                            ),
                            const SizedBox(width: AppSpacing.md),
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    _sparkDetail?.otherUser?.nickname ?? userName,
                                    style: AppTextStyles.titleMedium.copyWith(
                                      fontWeight: FontWeight.w600,
                                    ),
                                  ),
                                  if (_sparkDetail?.otherUser?.bio != null)
                                    Text(
                                      _sparkDetail!.otherUser!.bio!,
                                      style: AppTextStyles.bodySmall.copyWith(
                                        color: AppColors.grey600,
                                      ),
                                      maxLines: 1,
                                      overflow: TextOverflow.ellipsis,
                                    )
                                  else
                                    Text(
                                      _formatTimeAgo(spark.createdAt),
                                      style: AppTextStyles.bodySmall.copyWith(
                                        color: AppColors.grey500,
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            if (!isManual && spark.distance != null) ...[
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppSpacing.sm,
                                  vertical: AppSpacing.xs,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.sparkActive.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(AppSpacing.borderRadiusXl),
                                ),
                                child: Row(
                                  mainAxisSize: MainAxisSize.min,
                                  children: [
                                    Icon(
                                      Icons.location_on,
                                      size: 14,
                                      color: AppColors.sparkActive,
                                    ),
                                    const SizedBox(width: AppSpacing.xs),
                                    Text(
                                      '${spark.distance?.toStringAsFixed(0) ?? 0}m',
                                      style: AppTextStyles.labelSmall.copyWith(
                                        color: AppColors.sparkActive,
                                        fontWeight: FontWeight.w600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ],
                        ),
                        
                        const SizedBox(height: AppSpacing.lg),
                        
                        // 위치 정보 또는 수동 스파크 표시
                        Container(
                          padding: const EdgeInsets.all(AppSpacing.sm),
                          decoration: BoxDecoration(
                            color: AppColors.grey50,
                            borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                          ),
                          child: Row(
                            children: [
                              Icon(
                                isManual ? Icons.send : Icons.place,
                                size: 20,
                                color: AppColors.primary,
                              ),
                              const SizedBox(width: AppSpacing.sm),
                              Expanded(
                                child: Text(
                                  isManual 
                                    ? (spark.direction == SparkDirection.sent 
                                        ? '직접 보낸 스파크' 
                                        : '직접 받은 스파크')
                                    : (spark.locationName ?? '알 수 없는 위치'),
                                  style: AppTextStyles.bodyMedium.copyWith(
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                        
                        const SizedBox(height: AppSpacing.lg),
                        
                        // 메시지 내용
                        if (spark.message != null && spark.message!.isNotEmpty) ...[
                          Text(
                            spark.message!,
                            style: AppTextStyles.bodyLarge,
                          ),
                          const SizedBox(height: AppSpacing.lg),
                        ],
                        
                        // 남은 시간
                        if (spark.expiresAt != null) ...[
                          Container(
                            padding: const EdgeInsets.all(AppSpacing.sm),
                            decoration: BoxDecoration(
                              color: AppColors.sparkActive.withOpacity(0.1),
                              borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                            ),
                            child: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Icon(
                                  Icons.timer,
                                  size: 16,
                                  color: AppColors.sparkActive,
                                ),
                                const SizedBox(width: AppSpacing.xs),
                                Text(
                                  '${_getRemainingTime(spark.expiresAt!)} 후 만료',
                                  style: AppTextStyles.bodySmall.copyWith(
                                    color: AppColors.sparkActive,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  
                  // 프로필 정보 섹션 (항상 표시하고 디버깅)
                  Container(
                    margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.black.withOpacity(0.05),
                          blurRadius: 8,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '프로필 정보',
                          style: AppTextStyles.titleMedium.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.md),
                        
                        // 디버깅 정보
                        if (_isLoadingDetail) 
                          Text('프로필 정보를 불러오는 중...', style: AppTextStyles.bodyMedium),
                        if (!_isLoadingDetail && _sparkDetail == null)
                          Text('프로필 정보를 불러올 수 없습니다', style: AppTextStyles.bodyMedium),
                        if (!_isLoadingDetail && _sparkDetail != null && _sparkDetail!.otherUser == null)
                          Text('상대방 프로필 정보가 없습니다', style: AppTextStyles.bodyMedium),
                        
                        if (_sparkDetail?.otherUser != null) ...[
                          
                          // 직업
                          if (_sparkDetail!.otherUser!.occupation != null) ...[
                            _buildProfileItem(
                              icon: Icons.work_outline,
                              label: '직업',
                              value: _sparkDetail!.otherUser!.occupation!,
                            ),
                            const SizedBox(height: AppSpacing.sm),
                          ],
                          
                          // 지역
                          if (_sparkDetail!.otherUser!.location != null) ...[
                            _buildProfileItem(
                              icon: Icons.location_city,
                              label: '지역',
                              value: _sparkDetail!.otherUser!.location!,
                            ),
                            const SizedBox(height: AppSpacing.sm),
                          ],
                          
                          // 관심사
                          if (_sparkDetail!.otherUser!.interests.isNotEmpty) ...[
                            _buildProfileItem(
                              icon: Icons.favorite_outline,
                              label: '관심사',
                              value: _sparkDetail!.otherUser!.interests.join(', '),
                            ),
                            const SizedBox(height: AppSpacing.sm),
                          ],
                          
                          // 기술
                          if (_sparkDetail!.otherUser!.skills.isNotEmpty) ...[
                            _buildProfileItem(
                              icon: Icons.psychology_outlined,
                              label: '기술',
                              value: _sparkDetail!.otherUser!.skills.join(', '),
                            ),
                            const SizedBox(height: AppSpacing.sm),
                          ],
                          
                          // 언어
                          if (_sparkDetail!.otherUser!.languages.isNotEmpty) ...[
                            _buildProfileItem(
                              icon: Icons.language,
                              label: '언어',
                              value: _sparkDetail!.otherUser!.languages.join(', '),
                            ),
                          ],
                        ],
                      ],
                    ),
                  ),
                  
                  // 매칭 정보 섹션 (sparkDetail 있을 때만)
                  if (_sparkDetail != null) ...[
                    Container(
                      margin: const EdgeInsets.all(AppSpacing.lg),
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      decoration: BoxDecoration(
                        color: AppColors.surface,
                        borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.black.withOpacity(0.05),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            children: [
                              Text(
                                '매칭 정보',
                                style: AppTextStyles.titleMedium.copyWith(
                                  fontWeight: FontWeight.w600,
                                ),
                              ),
                              const Spacer(),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: AppSpacing.sm,
                                  vertical: AppSpacing.xs,
                                ),
                                decoration: BoxDecoration(
                                  color: AppColors.sparkActive.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(AppSpacing.borderRadiusXl),
                                ),
                                child: Text(
                                  '${_sparkDetail!.matchingRate}%',
                                  style: AppTextStyles.labelSmall.copyWith(
                                    color: AppColors.sparkActive,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: AppSpacing.md),
                          
                          // 공통 관심사
                          if (_sparkDetail!.commonInterests.isNotEmpty) ...[
                            Text(
                              '공통 관심사',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.grey600,
                                fontWeight: FontWeight.w500,
                              ),
                            ),
                            const SizedBox(height: AppSpacing.xs),
                            Wrap(
                              spacing: AppSpacing.xs,
                              runSpacing: AppSpacing.xs,
                              children: _sparkDetail!.commonInterests.map((interest) {
                                return Container(
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: AppSpacing.sm,
                                    vertical: AppSpacing.xs,
                                  ),
                                  decoration: BoxDecoration(
                                    color: AppColors.primary.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(AppSpacing.borderRadiusXl),
                                  ),
                                  child: Text(
                                    interest,
                                    style: AppTextStyles.labelSmall.copyWith(
                                      color: AppColors.primary,
                                    ),
                                  ),
                                );
                              }).toList(),
                            ),
                          ],
                        ],
                      ),
                    ),
                  ],
                  
                  const SizedBox(height: AppSpacing.xxl),
                ],
              ),
            ),
          ),
          
          // 하단 액션 버튼
          if (spark.status == SparkStatus.pending) ...[
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
              child: spark.direction == SparkDirection.received
                ? Row(
                    children: [
                      Expanded(
                        child: OutlinedButton(
                          onPressed: _rejectSpark,
                          child: const Text('거절'),
                        ),
                      ),
                      const SizedBox(width: AppSpacing.md),
                      Expanded(
                        flex: 2,
                        child: ElevatedButton(
                          onPressed: _acceptSpark,
                          style: ElevatedButton.styleFrom(
                            backgroundColor: AppColors.primary,
                          ),
                          child: const Text('수락'),
                        ),
                      ),
                    ],
                  )
                : Center(
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.xl,
                        vertical: AppSpacing.md,
                      ),
                      decoration: BoxDecoration(
                        color: AppColors.grey100,
                        borderRadius: BorderRadius.circular(AppSpacing.borderRadiusXl),
                      ),
                      child: Text(
                        '응답 대기 중...',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.grey600,
                        ),
                      ),
                    ),
                  ),
            ),
          ] else if (spark.status == SparkStatus.accepted) ...[
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
              child: ElevatedButton(
                onPressed: () {
                  // TODO: 채팅 화면으로 이동
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.success,
                ),
                child: const Text('채팅 시작하기'),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// 프로필 보기 다이얼로그
class _ProfileViewDialog extends StatefulWidget {
  final String userId;
  final String userName;

  const _ProfileViewDialog({
    required this.userId,
    required this.userName,
  });

  @override
  State<_ProfileViewDialog> createState() => _ProfileViewDialogState();
}

class _ProfileViewDialogState extends State<_ProfileViewDialog> {
  final ProfileService _profileService = ProfileService();
  Map<String, dynamic>? _profile;
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadProfile();
  }

  Future<void> _loadProfile() async {
    try {
      final profile = await _profileService.getUserProfile(widget.userId);
      if (mounted) {
        setState(() {
          _profile = {
            'nickname': profile.displayName ?? widget.userName,
            'bio': profile.bio,
            'avatarUrl': profile.avatarUrl,
            'signatureConnection': profile.signatureConnection,
          };
          _isLoading = false;
        });
      }
    } catch (e) {
      print('Error loading profile: $e');
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Dialog(
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
      ),
      child: Container(
        padding: const EdgeInsets.all(AppSpacing.lg),
        constraints: const BoxConstraints(maxWidth: 400),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            // 헤더
            Row(
              children: [
                // 프로필 이미지
                CircleAvatar(
                  radius: 30,
                  backgroundColor: AppColors.primary.withOpacity(0.1),
                  backgroundImage: _profile?['avatarUrl'] != null 
                    ? NetworkImage(_profile!['avatarUrl']!)
                    : null,
                  child: _profile?['avatarUrl'] == null
                    ? Text(
                        widget.userName.isNotEmpty ? widget.userName[0].toUpperCase() : '?',
                        style: AppTextStyles.headlineMedium.copyWith(
                          color: AppColors.primary,
                        ),
                      )
                    : null,
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        _profile?['nickname'] ?? widget.userName,
                        style: AppTextStyles.titleLarge.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (_profile?['bio'] != null && _profile!['bio']!.isNotEmpty)
                        Text(
                          _profile!['bio']!,
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.grey600,
                          ),
                          maxLines: 2,
                          overflow: TextOverflow.ellipsis,
                        ),
                    ],
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.close),
                  onPressed: () => Navigator.of(context).pop(),
                ),
              ],
            ),
            
            const SizedBox(height: AppSpacing.lg),
            
            // 로딩 중
            if (_isLoading)
              const Center(
                child: CircularProgressIndicator(),
              )
            // 프로필 정보
            else if (_profile != null && _profile!['signatureConnection'] != null) ...[
              // 시그니처 커넥션 정보
              Container(
                decoration: BoxDecoration(
                  color: AppColors.grey50,
                  borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                ),
                padding: const EdgeInsets.all(AppSpacing.md),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      '시그니처 커넥션',
                      style: AppTextStyles.titleMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.primary,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    
                    // MBTI
                    if (_profile!['signatureConnection'].mbti != null) ...[
                      _buildInfoRow(Icons.psychology, 'MBTI', _profile!['signatureConnection'].mbti!),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 관심사
                    if (_profile!['signatureConnection'].interests != null && 
                        _profile!['signatureConnection'].interests!.isNotEmpty) ...[
                      _buildInfoRow(
                        Icons.interests, 
                        '관심사', 
                        _profile!['signatureConnection'].interests!.join(', ')
                      ),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 인생 영화
                    if (_profile!['signatureConnection'].lifeMovie != null) ...[
                      _buildInfoRow(Icons.movie, '인생 영화', _profile!['signatureConnection'].lifeMovie!),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 좋아하는 아티스트
                    if (_profile!['signatureConnection'].favoriteArtist != null) ...[
                      _buildInfoRow(Icons.music_note, '좋아하는 아티스트', _profile!['signatureConnection'].favoriteArtist!),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 기억에 남는 장소
                    if (_profile!['signatureConnection'].memorablePlace != null) ...[
                      _buildInfoRow(
                        Icons.place, 
                        '기억에 남는 장소', 
                        _profile!['signatureConnection'].memorablePlace!
                      ),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 어린 시절 추억
                    if (_profile!['signatureConnection'].childhoodMemory != null) ...[
                      _buildInfoRow(
                        Icons.child_care, 
                        '어린 시절 추억', 
                        _profile!['signatureConnection'].childhoodMemory!
                      ),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 인생의 전환점
                    if (_profile!['signatureConnection'].turningPoint != null) ...[
                      _buildInfoRow(Icons.change_circle, '인생의 전환점', _profile!['signatureConnection'].turningPoint!),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 가장 자랑스러운 순간
                    if (_profile!['signatureConnection'].proudestMoment != null) ...[
                      _buildInfoRow(Icons.star, '가장 자랑스러운 순간', _profile!['signatureConnection'].proudestMoment!),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 버킷리스트
                    if (_profile!['signatureConnection'].bucketList != null) ...[
                      _buildInfoRow(Icons.checklist, '버킷리스트', _profile!['signatureConnection'].bucketList!),
                      const SizedBox(height: AppSpacing.xs),
                    ],
                    
                    // 인생 교훈
                    if (_profile!['signatureConnection'].lifeLesson != null) ...[
                      _buildInfoRow(
                        Icons.school, 
                        '인생 교훈', 
                        _profile!['signatureConnection'].lifeLesson!
                      ),
                    ],
                  ],
                ),
              ),
            ]
            // 프로필 정보 없음
            else
              Center(
                child: Text(
                  '프로필 정보를 불러올 수 없습니다',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.grey600,
                  ),
                ),
              ),
            
            const SizedBox(height: AppSpacing.lg),
            
            // 닫기 버튼
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: () => Navigator.of(context).pop(),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                  ),
                ),
                child: const Text('닫기'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(
          icon,
          size: 16,
          color: AppColors.grey600,
        ),
        const SizedBox(width: AppSpacing.xs),
        Expanded(
          child: RichText(
            text: TextSpan(
              style: AppTextStyles.bodySmall,
              children: [
                TextSpan(
                  text: '$label: ',
                  style: const TextStyle(
                    fontWeight: FontWeight.w600,
                    color: AppColors.textSecondary,
                  ),
                ),
                TextSpan(
                  text: value,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}