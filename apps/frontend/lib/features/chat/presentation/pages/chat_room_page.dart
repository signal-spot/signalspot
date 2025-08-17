import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/models/chat.dart';
import '../../../../shared/providers/chat_provider.dart';
import '../../../../shared/services/websocket_service.dart';
import '../../../../features/auth/presentation/providers/auth_provider.dart';
import '../../../../core/api/api_client.dart';
import '../../../../shared/widgets/report_block_dialog.dart';
import '../../../../shared/widgets/spark_icon.dart';
import '../../../../shared/widgets/spark_send_modal.dart';
import '../../../../shared/services/profile_service.dart';
import '../../../../shared/services/report_service.dart';
import '../../../../shared/services/spark_service.dart';

class ChatRoomPage extends ConsumerStatefulWidget {
  final String roomId;
  final String roomName;
  final ChatParticipant otherParticipant;

  const ChatRoomPage({
    super.key,
    required this.roomId,
    required this.roomName,
    required this.otherParticipant,
  });

  @override
  ConsumerState<ChatRoomPage> createState() => _ChatRoomPageState();
}

class _ChatRoomPageState extends ConsumerState<ChatRoomPage> {
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final FocusNode _messageFocusNode = FocusNode();
  WebSocketService? _websocketService;

  @override
  void initState() {
    super.initState();
    
    // 메시지 로드 및 읽음 처리
    WidgetsBinding.instance.addPostFrameCallback((_) {
      ref.read(messagesProvider(widget.roomId).notifier).loadMessages();
      ref.read(messagesProvider(widget.roomId).notifier).markAsRead();
      ref.read(chatRoomsProvider.notifier).resetUnreadCount(widget.roomId);
      
      // 웹소켓 채팅방 구독
      _subscribeToWebSocket();
    });
  }
  
  void _subscribeToWebSocket() async {
    // 웹소켓 서비스 인스턴스 저장
    _websocketService = ref.read(websocketServiceProvider);
    
    if (_websocketService == null) return;
    
    // 웹소켓이 연결되어 있지 않으면 연결
    if (!_websocketService!.isConnected) {
      final apiClient = ApiClient();
      final token = await apiClient.getAccessToken();
      if (token != null) {
        _websocketService!.connect(token);
        // 연결 완료 대기
        await Future.delayed(const Duration(milliseconds: 500));
      }
    }
    
    // 채팅방 구독
    _websocketService!.subscribeToChatRoom(widget.roomId);
    
    // 기존 리스너 제거 후 새로 등록 (중복 방지)
    _websocketService!.removeEventListener('messageReceived', _handleNewMessage);
    _websocketService!.addEventListener('messageReceived', _handleNewMessage);
    
    print('WebSocket subscribed to room: ${widget.roomId}');
  }
  
  void _handleNewMessage(dynamic data) {
    // 위젯이 dispose되었는지 확인
    if (!mounted) return;
    
    print('🔔 Received websocket message for room ${widget.roomId}');
    print('📨 Message data: $data');
    
    // 메시지 데이터 검증
    if (data == null || data is! Map) {
      print('❌ Invalid message data format');
      return;
    }
    
    // 이 채팅방의 메시지인지 확인
    final messageRoomId = data['roomId'] ?? data['chatRoomId'] ?? data['room_id'];
    print('📍 Message room ID: $messageRoomId, Current room ID: ${widget.roomId}');
    
    if (messageRoomId != widget.roomId) {
      print('⚠️ Message is for different room, ignoring');
      return;
    }
    
    try {
      // 백엔드 응답 구조에 맞게 파싱
      final messageData = data['message'] ?? data;
      
      // 웹소켓 데이터를 Message 객체로 변환
      final message = Message(
        id: messageData['id']?.toString() ?? 
            messageData['messageId']?.toString() ?? 
            DateTime.now().millisecondsSinceEpoch.toString(),
        content: messageData['content'] ?? 
                messageData['message'] ?? 
                messageData['text'] ?? '',
        type: _parseMessageType(messageData['type']),
        status: MessageStatus.sent,
        sender: ChatParticipant(
          id: messageData['senderId']?.toString() ?? 
              messageData['userId']?.toString() ?? 
              messageData['sender']?['id']?.toString() ?? '',
          nickname: messageData['senderNickname'] ?? 
                   messageData['username'] ?? 
                   messageData['sender']?['nickname'] ?? 
                   messageData['sender']?['username'] ?? '알 수 없음',
          avatarUrl: messageData['senderProfileImageUrl'] ?? 
                     messageData['avatarUrl'] ??
                     messageData['sender']?['profileImageUrl'] ??
                     messageData['sender']?['avatarUrl'],
        ),
        createdAt: _parseDateTime(messageData['createdAt']),
        updatedAt: _parseDateTime(messageData['updatedAt']),
        readAt: messageData['readAt'] != null ? _parseDateTime(messageData['readAt']) : null,
      );
      
      print('✅ Parsed message: ${message.content} from ${message.sender.nickname}');
      
      // 자신이 보낸 메시지가 아닌 경우에만 추가
      if (!mounted) return;
      
      final currentUserId = ref.read(currentUserProvider)?.id;
      print('👤 Current user ID: $currentUserId, Sender ID: ${message.sender.id}');
      
      if (message.sender.id != currentUserId) {
        print('➕ Adding new message to chat');
        // 새 메시지만 추가 (전체 리로드 없음)
        ref.read(messagesProvider(widget.roomId).notifier).addNewMessage(message);
        
        // 스크롤 및 읽음 처리
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (mounted) {
            _scrollToBottom();
            ref.read(messagesProvider(widget.roomId).notifier).markAsRead();
          }
        });
      } else {
        print('⏭️ Skipping own message');
      }
    } catch (e, stack) {
      print('❌ Error parsing websocket message: $e');
      print('Stack trace: $stack');
      
      // 파싱 실패 시 전체 리로드 (fallback)
      if (mounted) {
        print('🔄 Falling back to full reload');
        ref.read(messagesProvider(widget.roomId).notifier).loadMessages();
      }
    }
  }
  
  DateTime _parseDateTime(dynamic value) {
    if (value == null) return DateTime.now();
    if (value is DateTime) return value;
    if (value is String) {
      try {
        return DateTime.parse(value);
      } catch (e) {
        return DateTime.now();
      }
    }
    return DateTime.now();
  }
  
  MessageType _parseMessageType(dynamic type) {
    if (type == null) return MessageType.text;
    if (type is MessageType) return type;
    
    final typeStr = type.toString().toLowerCase();
    switch (typeStr) {
      case 'image':
        return MessageType.image;
      default:
        return MessageType.text;
    }
  }

  
  @override
  void dispose() {
    // 컨트롤러들 먼저 dispose
    _messageController.dispose();
    _scrollController.dispose();
    _messageFocusNode.dispose();
    
    // 웹소켓 정리 (ref 사용하지 않고 저장된 인스턴스 사용)
    try {
      _websocketService?.unsubscribeFromChatRoom(widget.roomId);
      _websocketService?.removeEventListener('messageReceived', _handleNewMessage);
    } catch (e) {
      print('Error during websocket cleanup: $e');
    }
    
    super.dispose();
  }

  void _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;

    _messageController.clear();
    
    // 키보드 닫기
    FocusScope.of(context).unfocus();
    
    _scrollToBottom();

    // 햅틱 피드백
    HapticFeedback.lightImpact();

    try {
      await ref.read(messagesProvider(widget.roomId).notifier).sendMessage(text);
      _scrollToBottom();
    } catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('메시지 전송에 실패했습니다: $error'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  void _scrollToBottom() {
    if (!mounted) return;
    
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted && _scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final messagesAsync = ref.watch(messagesProvider(widget.roomId));

    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        backgroundColor: AppColors.surface,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              widget.otherParticipant.nickname ?? '알 수 없는 사용자',
              style: AppTextStyles.titleMedium.copyWith(
                fontWeight: FontWeight.w600,
              ),
            ),
            Text(
              '스파크 매칭으로 연결된 인연',
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.grey600,
              ),
            ),
          ],
        ),
        actions: [
          PopupMenuButton<String>(
            onSelected: (value) {
              switch (value) {
                case 'profile':
                  // 상대방 프로필 보기
                  _showProfileDialog();
                  break;
                case 'report':
                  // 바로 신고 다이얼로그 표시
                  showReportDialog(
                    context: context,
                    ref: ref,
                    userId: widget.otherParticipant.id,
                    userName: widget.otherParticipant.nickname ?? '알 수 없는 사용자',
                    contextType: 'chat',
                    contextId: widget.roomId,
                  );
                  break;
                case 'block':
                  // 바로 차단 다이얼로그 표시
                  showBlockDialog(
                    context: context,
                    ref: ref,
                    userId: widget.otherParticipant.id,
                    userName: widget.otherParticipant.nickname ?? '알 수 없는 사용자',
                    onBlocked: () {
                      // 차단 후 채팅 목록으로 돌아가기
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
          // 매칭 정보 헤더
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.md),
            margin: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.primary.withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
              border: Border.all(
                color: AppColors.primary.withValues(alpha: 0.2),
              ),
            ),
            child: Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(AppSpacing.sm),
                  decoration: BoxDecoration(
                    color: AppColors.sparkActive.withValues(alpha: 0.2),
                    borderRadius: BorderRadius.circular(AppSpacing.borderRadiusSm),
                  ),
                  child: const SparkIcon(
                    size: 20,
                  ),
                ),
                const SizedBox(width: AppSpacing.md),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        '스파크 매칭 성공!',
                        style: AppTextStyles.titleSmall.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.primary,
                        ),
                      ),
                      Text(
                        '새로운 인연이 시작되었습니다',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.grey600,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // 메시지 리스트
          Expanded(
            child: messagesAsync.when(
              data: (messages) => messages.isEmpty
                  ? _buildEmptyState()
                  : RefreshIndicator(
                      onRefresh: () => ref.read(messagesProvider(widget.roomId).notifier).loadMessages(),
                      child: ListView.builder(
                        controller: _scrollController,
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.sm,
                        ),
                        itemCount: messages.length,
                        itemBuilder: (context, index) {
                          return _MessageBubble(
                            message: messages[index],
                            onRetry: messages[index].status == MessageStatus.failed
                                ? () => ref.read(messagesProvider(widget.roomId).notifier)
                                    .retryMessage(messages[index].id)
                                : null,
                            onDelete: () => _showDeleteMessageDialog(messages[index].id),
                          );
                        },
                      ),
                    ),
              loading: () => const Center(
                child: CircularProgressIndicator(),
              ),
              error: (error, stackTrace) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.error_outline,
                      size: 64,
                      color: AppColors.error,
                    ),
                    const SizedBox(height: AppSpacing.md),
                    Text(
                      '메시지를 불러올 수 없습니다',
                      style: AppTextStyles.titleMedium.copyWith(
                        color: AppColors.error,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    ElevatedButton(
                      onPressed: () => ref.read(messagesProvider(widget.roomId).notifier).loadMessages(),
                      child: const Text('다시 시도'),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 메시지 입력 영역
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.surface,
              border: Border(
                top: BorderSide(
                  color: AppColors.grey200,
                  width: 1,
                ),
              ),
            ),
            child: SafeArea(
              child: Row(
                children: [
                  // 추가 옵션 버튼
                  // IconButton(
                  //   onPressed: () {
                  //     _showMessageOptions();
                  //   },
                  //   icon: const Icon(
                  //     Icons.add_circle_outline,
                  //     color: AppColors.grey500,
                  //   ),
                  // ),
                  //
                  // 메시지 입력 필드
                  Expanded(
                    child: Container(
                      decoration: BoxDecoration(
                        color: AppColors.grey100,
                        borderRadius: BorderRadius.circular(AppSpacing.borderRadiusXl),
                      ),
                      child: TextField(
                        controller: _messageController,
                        focusNode: _messageFocusNode,
                        decoration: const InputDecoration(
                          hintText: '메시지를 입력하세요...',
                          border: InputBorder.none,
                          contentPadding: EdgeInsets.symmetric(
                            horizontal: AppSpacing.md,
                            vertical: AppSpacing.sm,
                          ),
                        ),
                        maxLines: null,
                        textInputAction: TextInputAction.send,
                        onSubmitted: (_) => _sendMessage(),
                      ),
                    ),
                  ),
                  
                  const SizedBox(width: AppSpacing.sm),
                  
                  // 전송 버튼
                  GestureDetector(
                    onTap: _sendMessage,
                    child: Container(
                      padding: const EdgeInsets.all(AppSpacing.sm),
                      decoration: BoxDecoration(
                        color: AppColors.primary,
                        borderRadius: BorderRadius.circular(AppSpacing.borderRadiusXl),
                      ),
                      child: const Icon(
                        Icons.send,
                        color: AppColors.white,
                        size: 20,
                      ),
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

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.chat_bubble_outline,
            size: 64,
            color: AppColors.grey400,
          ),
          const SizedBox(height: AppSpacing.md),
          Text(
            '첫 메시지를 보내보세요!',
            style: AppTextStyles.bodyLarge.copyWith(
              color: AppColors.grey600,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            '새로운 인연의 시작입니다 ✨',
            style: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.grey500,
            ),
          ),
        ],
      ),
    );
  }

  void _showMessageOptions() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('메시지 옵션'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_camera),
              title: const Text('사진 촬영'),
              onTap: () {
                Navigator.pop(context);
                // TODO: 사진 촬영 기능 구현
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('갤러리'),
              onTap: () {
                Navigator.pop(context);
                // TODO: 갤러리 선택 기능 구현
              },
            ),
            ListTile(
              leading: const Icon(Icons.emoji_emotions),
              title: const Text('이모티콘'),
              onTap: () {
                Navigator.pop(context);
                // TODO: 이모티콘 선택 기능 구현
              },
            ),
            ListTile(
              leading: const Icon(Icons.location_on),
              title: const Text('위치 공유'),
              onTap: () {
                Navigator.pop(context);
                // TODO: 위치 공유 기능 구현
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('취소'),
          ),
        ],
      ),
    );
  }

  void _showDeleteMessageDialog(String messageId) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('메시지 삭제'),
        content: const Text('이 메시지를 삭제하시겠습니까?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('취소'),
          ),
          TextButton(
            onPressed: () async {
              // 먼저 컨텍스트 참조 저장
              final navigator = Navigator.of(context);
              final messenger = ScaffoldMessenger.of(context);
              
              navigator.pop();
              
              try {
                await ref.read(messagesProvider(widget.roomId).notifier).deleteMessage(messageId);
              } catch (error) {
                messenger.showSnackBar(
                  SnackBar(
                    content: Text('메시지 삭제에 실패했습니다: $error'),
                    backgroundColor: AppColors.error,
                  ),
                );
              }
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

  void _showReportDialog() {
    ReportReason? selectedReason;
    String? description;
    
    final reportReasons = [
      ReportReason.spam,
      ReportReason.harassment,
      ReportReason.hateSeech,
      ReportReason.violence,
      ReportReason.sexualContent,
      ReportReason.falseInformation,
      ReportReason.privacyViolation,
      ReportReason.other,
    ];
    
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('사용자 신고'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('신고 사유를 선택해주세요:'),
                const SizedBox(height: 16),
                ...reportReasons.map((reason) => RadioListTile<ReportReason>(
                  title: Text(reason.label),
                  value: reason,
                  groupValue: selectedReason,
                  onChanged: (value) {
                    setState(() {
                      selectedReason = value;
                    });
                  },
                )),
                const SizedBox(height: 16),
                TextField(
                  decoration: const InputDecoration(
                    labelText: '추가 설명 (선택사항)',
                    hintText: '신고 사유를 자세히 설명해주세요',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 3,
                  onChanged: (value) {
                    description = value;
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('취소'),
            ),
            TextButton(
            onPressed: selectedReason == null ? null : () async {
            // 먼저 컨텍스트 참조 저장
            final navigator = Navigator.of(context);
            final messenger = ScaffoldMessenger.of(context);
            
            navigator.pop();
            
            try {
            final reportService = ReportService();
            final result = await reportService.reportUser(
              userId: widget.otherParticipant.id,
              reason: selectedReason!,
            description: description,
            );
            
            if (result['success'] == true) {
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
            } catch (e) {
            print('Error reporting user: $e');
            messenger.showSnackBar(
            const SnackBar(
              content: Text('신고 처리 중 오류가 발생했습니다'),
                backgroundColor: AppColors.error,
                ),
                );
              }
            },
              child: Text(
                '신고',
                style: TextStyle(color: selectedReason == null ? AppColors.grey400 : AppColors.error),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showBlockDialog() {
    String? blockReason;
    
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('사용자 차단'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('${widget.otherParticipant.nickname ?? '알 수 없는 사용자'} 님을 차단하시겠습니까?\n\n차단 후에는 메시지를 주고받을 수 없습니다.'),
                const SizedBox(height: 16),
                TextField(
                  decoration: const InputDecoration(
                    labelText: '차단 사유 (선택사항)',
                    hintText: '차단 사유를 입력해주세요',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 2,
                  onChanged: (value) {
                    blockReason = value;
                  },
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('취소'),
            ),
            TextButton(
            onPressed: () async {
            // 먼저 컨텍스트 참조 저장
            final navigator = Navigator.of(context);
            final messenger = ScaffoldMessenger.of(context);
            final reportService = ReportService();
            
            navigator.pop(); // 다이얼로그 닫기
            
            try {
            final result = await reportService.blockUser(
              widget.otherParticipant.id,
            reason: blockReason,
            );
            
            if (result['success'] == true) {
            // SnackBar 먼저 표시
            messenger.showSnackBar(
            SnackBar(
            content: Text(result['message'] ?? '${widget.otherParticipant.nickname ?? '사용자'}가 차단되었습니다'),
            backgroundColor: AppColors.success,
            action: SnackBarAction(
            label: '실행 취소',
            onPressed: () async {
            try {
            await reportService.unblockUser(widget.otherParticipant.id);
            // 새로운 SnackBar를 위해 messenger 다시 가져오기
              if (mounted) {
              ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                      content: Text('차단이 해제되었습니다'),
                      ),
                      );
                      // 차단 해제 후 새로고침은 사용자가 수동으로
                      }
                      } catch (e) {
                          print('Error unblocking user: $e');
                      }
                    },
                ),
            ),
            );
            
            // 차단 후 새로고침은 사용자가 수동으로
            
            // 약간의 지연 후 채팅방에서 나가기
            Future.delayed(const Duration(milliseconds: 100), () {
                if (navigator.canPop()) {
                    navigator.pop(); // 채팅방에서 나가기
                    }
                  });
                } else {
                  // 차단 실패
                  messenger.showSnackBar(
                    SnackBar(
                      content: Text(result['message'] ?? '차단 처리 중 오류가 발생했습니다'),
                      backgroundColor: result['message'] == '본인을 차단할 수 없습니다' 
                        ? Colors.orange 
                        : AppColors.error,
                    ),
                  );
                }
              } catch (e) {
                print('Error blocking user: $e');
                messenger.showSnackBar(
                  const SnackBar(
                    content: Text('차단 처리 중 오류가 발생했습니다'),
                    backgroundColor: AppColors.error,
                  ),
                );
              }
            },
              child: Text(
                '차단',
                style: TextStyle(color: AppColors.error),
              ),
            ),
          ],
        ),
      ),
    );
  }

  void _showProfileDialog() async {
    // 로딩 다이얼로그 표시
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => const Center(
        child: CircularProgressIndicator(),
      ),
    );
    
    try {
      // ProfileService import 필요
      final profileService = ProfileService();
      final profile = await profileService.getUserProfile(widget.otherParticipant.id);
      
      // 디버깅용 로그
      print('프로필 조회 성공: ${profile.displayName}');
      print('signatureConnection: ${profile.signatureConnection}');
      if (profile.signatureConnection != null) {
        print('MBTI: ${profile.signatureConnection!.mbti}');
        print('interests: ${profile.signatureConnection!.interests}');
      }
      
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
                    
                    // 시그니처 커넥션 정보 (항상 표시)
                    _buildProfileSection(
                      title: '시그니처 커넥션',
                      children: [
                        // MBTI (항상 표시)
                        _buildInfoRow(
                          'MBTI', 
                          profile.signatureConnection?.mbti,
                          emptyText: 'MBTI가 설정되지 않았습니다',
                        ),
                        // 관심사 (항상 표시)
                        _buildInfoRow(
                          '관심사', 
                          profile.signatureConnection?.interests != null && 
                              profile.signatureConnection!.interests!.isNotEmpty
                              ? profile.signatureConnection!.interests!.join(', ')
                              : null,
                          emptyText: '관심사가 설정되지 않았습니다',
                        ),
                        // 나의 이야기 섹션
                        const SizedBox(height: AppSpacing.sm),
                        Text(
                          '나의 이야기',
                          style: AppTextStyles.labelMedium.copyWith(
                            color: AppColors.grey700,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        _buildInfoRow(
                          '📍 기억에 남는 장소', 
                          profile.signatureConnection?.memorablePlace,
                          emptyText: '아직 작성되지 않았습니다',
                        ),
                        _buildInfoRow(
                          '🧸 어린 시절 추억', 
                          profile.signatureConnection?.childhoodMemory,
                          emptyText: '아직 작성되지 않았습니다',
                        ),
                        _buildInfoRow(
                          '🔄 인생의 전환점', 
                          profile.signatureConnection?.turningPoint,
                          emptyText: '아직 작성되지 않았습니다',
                        ),
                        _buildInfoRow(
                          '🏆 가장 자랑스러운 순간', 
                          profile.signatureConnection?.proudestMoment,
                          emptyText: '아직 작성되지 않았습니다',
                        ),
                        _buildInfoRow(
                          '🎯 버킷리스트', 
                          profile.signatureConnection?.bucketList,
                          emptyText: '아직 작성되지 않았습니다',
                        ),
                        _buildInfoRow(
                          '💡 인생 교훈', 
                          profile.signatureConnection?.lifeLesson,
                          emptyText: '아직 작성되지 않았습니다',
                        ),
                      ],
                    ),
                    const SizedBox(height: AppSpacing.lg),
                    
                    // 닫기 버튼
                    SizedBox(
                      width: double.infinity,
                      child: TextButton(
                        onPressed: () => Navigator.pop(context),
                        style: TextButton.styleFrom(
                          padding: const EdgeInsets.symmetric(
                            vertical: AppSpacing.md,
                          ),
                        ),
                        child: Text(
                          '닫기',
                          style: AppTextStyles.bodyMedium.copyWith(
                            color: AppColors.grey600,
                          ),
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
      
      // 에러 다이얼로그 표시
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
  
  Widget _buildInfoRow(String label, String? value, {String emptyText = '정보 없음'}) {
    final hasValue = value != null && value.isNotEmpty;
    
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
                color: hasValue ? AppColors.grey600 : AppColors.grey500,
              ),
            ),
          ),
          Expanded(
            child: hasValue
              ? Text(
                  value,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.grey800,
                    fontWeight: FontWeight.w500,
                  ),
                )
              : Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.sm,
                    vertical: 2,
                  ),
                  decoration: BoxDecoration(
                    color: AppColors.grey100,
                    borderRadius: BorderRadius.circular(6),
                  ),
                  child: Text(
                    emptyText,
                    style: AppTextStyles.bodySmall.copyWith(
                      color: AppColors.grey500,
                      fontStyle: FontStyle.italic,
                      fontSize: 11,
                    ),
                  ),
                ),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends ConsumerWidget {
  final Message message;
  final VoidCallback? onRetry;
  final VoidCallback? onDelete;

  const _MessageBubble({
    required this.message,
    this.onRetry,
    this.onDelete,
  });

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // 현재 사용자 ID 가져오기
    final currentUserId = ref.watch(currentUserProvider)?.id ?? 'me';
    final isFromMe = message.sender.id == currentUserId;

    return Padding(
      padding: const EdgeInsets.symmetric(vertical: AppSpacing.xs),
      child: Row(
        mainAxisAlignment: isFromMe
            ? MainAxisAlignment.end
            : MainAxisAlignment.start,
        children: [
          if (!isFromMe) ...[
            // 상대방 아바타
            GestureDetector(
              onTap: () => _showProfileImage(context, message.sender.avatarUrl, message.sender.nickname),
              child: Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    AppColors.primary.withValues(alpha: 0.8),
                    AppColors.secondary.withValues(alpha: 0.8),
                  ],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: message.sender.avatarUrl != null
                  ? ClipOval(
                      child: Image.network(
                        message.sender.avatarUrl!,
                        width: 32,
                        height: 32,
                        fit: BoxFit.cover,
                        errorBuilder: (context, error, stackTrace) => const Icon(
                          Icons.person,
                          color: AppColors.white,
                          size: 16,
                        ),
                      ),
                    )
                  : const Icon(
                      Icons.person,
                      color: AppColors.white,
                      size: 16,
                    ),
              ),
            ),
            const SizedBox(width: AppSpacing.sm),
          ],
          
          // 메시지 버블
          Flexible(
            child: GestureDetector(
              onLongPress: isFromMe ? onDelete : null,
              child: Column(
                crossAxisAlignment: isFromMe
                    ? CrossAxisAlignment.end
                    : CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: AppSpacing.md,
                      vertical: AppSpacing.sm,
                    ),
                    decoration: BoxDecoration(
                      color: _getMessageBubbleColor(isFromMe),
                      borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg)
                          .copyWith(
                        bottomLeft: isFromMe
                            ? const Radius.circular(AppSpacing.borderRadiusLg)
                            : const Radius.circular(4),
                        bottomRight: isFromMe
                            ? const Radius.circular(4)
                            : const Radius.circular(AppSpacing.borderRadiusLg),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (message.isDeleted)
                          Text(
                            '삭제된 메시지입니다',
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.grey500,
                              fontStyle: FontStyle.italic,
                            ),
                          )
                        else
                          Text(
                            message.content,
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: isFromMe
                                  ? AppColors.white
                                  : AppColors.black,
                            ),
                          ),
                        if (message.editedAt != null) ...[
                          const SizedBox(height: 2),
                          Text(
                            '편집됨',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: isFromMe
                                  ? AppColors.white.withValues(alpha: 0.7)
                                  : AppColors.grey500,
                              fontSize: 10,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                  const SizedBox(height: AppSpacing.xs),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _formatTime(message.createdAt),
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.grey500,
                          fontSize: 11,
                        ),
                      ),
                      if (isFromMe) ...[
                        const SizedBox(width: AppSpacing.xs),
                        _buildMessageStatusIcon(),
                      ],
                      if (message.status == MessageStatus.failed && onRetry != null) ...[
                        const SizedBox(width: AppSpacing.xs),
                        GestureDetector(
                          onTap: onRetry,
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                              horizontal: AppSpacing.xs,
                              vertical: 2,
                            ),
                            decoration: BoxDecoration(
                              color: AppColors.error,
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: Text(
                              '재전송',
                              style: AppTextStyles.bodySmall.copyWith(
                                color: AppColors.white,
                                fontSize: 10,
                              ),
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ),
          
          if (isFromMe) ...[
            const SizedBox(width: AppSpacing.sm),
            // 내 아바타
            GestureDetector(
              onTap: () => _showProfileImage(context, message.sender.avatarUrl, message.sender.nickname),
              child: Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: [
                      AppColors.sparkActive.withValues(alpha: 0.8),
                      AppColors.primary.withValues(alpha: 0.8),
                    ],
                  ),
                  borderRadius: BorderRadius.circular(16),
                ),
                child: message.sender.avatarUrl != null
                    ? ClipOval(
                        child: Image.network(
                          message.sender.avatarUrl!,
                          width: 32,
                          height: 32,
                          fit: BoxFit.cover,
                          errorBuilder: (context, error, stackTrace) => const Icon(
                            Icons.person,
                            color: AppColors.white,
                            size: 16,
                          ),
                        ),
                      )
                    : const Icon(
                        Icons.person,
                        color: AppColors.white,
                        size: 16,
                      ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  void _showProfileImage(BuildContext context, String? imageUrl, String? nickname) {
    if (imageUrl == null) return;
    
    showDialog(
      context: context,
      barrierColor: Colors.black87,
      builder: (context) => Stack(
        children: [
          // 배경 클릭 시 닫기
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: Container(
              color: Colors.transparent,
              child: Center(
                child: Hero(
                  tag: 'profile_image_$imageUrl',
                  child: InteractiveViewer(
                    minScale: 0.5,
                    maxScale: 3.0,
                    child: Image.network(
                      imageUrl,
                      fit: BoxFit.contain,
                      errorBuilder: (context, error, stackTrace) => Container(
                        width: 200,
                        height: 200,
                        decoration: BoxDecoration(
                          color: AppColors.grey300,
                          borderRadius: BorderRadius.circular(100),
                        ),
                        child: const Icon(
                          Icons.person,
                          size: 100,
                          color: AppColors.white,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
          // X 버튼
          Positioned(
            top: MediaQuery.of(context).padding.top + 10,
            right: 10,
            child: IconButton(
              onPressed: () => Navigator.pop(context),
              icon: Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: Colors.black54,
                  borderRadius: BorderRadius.circular(20),
                ),
                child: const Icon(
                  Icons.close,
                  color: Colors.white,
                  size: 24,
                ),
              ),
            ),
          ),
          // 닉네임 표시
          if (nickname != null)
            Positioned(
              bottom: MediaQuery.of(context).padding.bottom + 20,
              left: 20,
              right: 20,
              child: Text(
                nickname,
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.w600,
                ),
                textAlign: TextAlign.center,
              ),
            ),
        ],
      ),
    );
  }
  
  Color _getMessageBubbleColor(bool isFromMe) {
    if (message.status == MessageStatus.failed) {
      return AppColors.error.withValues(alpha: 0.1);
    }
    return isFromMe ? AppColors.primary : AppColors.grey100;
  }

  Widget _buildMessageStatusIcon() {
    switch (message.status) {
      case MessageStatus.sending:
        return const SizedBox(
          width: 12,
          height: 12,
          child: CircularProgressIndicator(
            strokeWidth: 2,
            valueColor: AlwaysStoppedAnimation<Color>(AppColors.grey500),
          ),
        );
      case MessageStatus.sent:
        return const Icon(
          Icons.check,
          size: 12,
          color: AppColors.grey500,
        );
      case MessageStatus.delivered:
        return const Icon(
          Icons.done_all,
          size: 12,
          color: AppColors.grey500,
        );
      case MessageStatus.read:
        return const Icon(
          Icons.done_all,
          size: 12,
          color: AppColors.primary,
        );
      case MessageStatus.failed:
        return const Icon(
          Icons.error_outline,
          size: 12,
          color: AppColors.error,
        );
    }
  }

  String _formatTime(DateTime time) {
    final now = DateTime.now();
    final difference = now.difference(time);

    if (difference.inMinutes < 1) {
      return '방금';
    } else if (difference.inHours < 1) {
      return '${difference.inMinutes}분 전';
    } else if (difference.inDays < 1) {
      return '${time.hour}:${time.minute.toString().padLeft(2, '0')}';
    } else {
      return '${time.month}/${time.day}';
    }
  }
}