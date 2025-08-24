import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/api/api_client.dart';

class NicknamePage extends StatefulWidget {
  const NicknamePage({super.key});

  @override
  State<NicknamePage> createState() => _NicknamePageState();
}

class _NicknamePageState extends State<NicknamePage>
    with TickerProviderStateMixin {
  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  
  final TextEditingController _nicknameController = TextEditingController();
  final FocusNode _nicknameFocus = FocusNode();
  
  bool _isNicknameValid = false;
  bool _isCheckingNickname = false;
  String? _nicknameError;
  Timer? _debounceTimer;

  @override
  void initState() {
    super.initState();
    
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.0, 0.6, curve: Curves.easeOut),
    ));
    
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.3, 1.0, curve: Curves.easeOut),
    ));
    
    _animationController.forward();
  }
  

  @override
  void dispose() {
    _debounceTimer?.cancel();
    _animationController.dispose();
    _nicknameController.dispose();
    _nicknameFocus.dispose();
    super.dispose();
  }

  void _validateNickname(String nickname) {
    if (nickname.length < 2) {
      setState(() {
        _nicknameError = '2글자 이상 입력해주세요';
        _isNicknameValid = false;
      });
      return;
    }
    
    if (nickname.length > 12) {
      setState(() {
        _nicknameError = '12글자 이하로 입력해주세요';
        _isNicknameValid = false;
      });
      return;
    }
    
    // 특수문자 검사
    final regex = RegExp(r'^[가-힣a-zA-Z0-9_]+$');
    if (!regex.hasMatch(nickname)) {
      setState(() {
        _nicknameError = '한글, 영문, 숫자, _만 사용 가능합니다';
        _isNicknameValid = false;
      });
      return;
    }
    
    _checkNicknameAvailability(nickname);
  }

  Future<void> _checkNicknameAvailability(String nickname) async {
    setState(() {
      _isCheckingNickname = true;
    });
    
    try {
      // 실제 API 호출로 닉네임 중복 체크
      final apiClient = ApiClient();
      final response = await apiClient.get('/profile/check-username', queryParameters: {
        'username': nickname,
      });
      
      if (mounted) {
        setState(() {
          _isCheckingNickname = false;
          // response.data는 전체 응답이고, data 필드 안에 available이 있음
          final responseData = response.data['data'];
          final isAvailable = responseData?['available'] ?? false;
          
          print('닉네임 중복 확인 결과: available=$isAvailable');
          
          if (isAvailable) {
            _isNicknameValid = true;
            _nicknameError = null;
          } else {
            _nicknameError = '이미 사용 중인 닉네임입니다';
            _isNicknameValid = false;
          }
        });
      }
    } catch (e) {
      print('닉네임 중복 확인 오류: $e');
      if (mounted) {
        setState(() {
          _isCheckingNickname = false;
          _nicknameError = '닉네임 확인 중 오류가 발생했습니다';
          _isNicknameValid = false;
        });
      }
    }
  }

  void _continue() async {
    if (_isNicknameValid) {
      HapticFeedback.mediumImpact();
      
      final nickname = _nicknameController.text.trim();
      print('Selected nickname: $nickname');
      
      // 닉네임을 임시로 저장 (나중에 권한 설정 후 백엔드에 전송)
      // SharedPreferences나 Provider에 저장
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('pending_nickname', nickname);
      
      // 권한 설정 페이지로 이동
      context.go('/onboarding/permissions');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: const Icon(Icons.arrow_back_ios, color: AppColors.textPrimary),
        ),
      ),
      body: FadeTransition(
        opacity: _fadeAnimation,
        child: SlideTransition(
          position: _slideAnimation,
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Text(
                  '닉네임을 설정해주세요',
                  style: AppTextStyles.headlineMedium.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  '다른 사용자들이 보게 될 이름이에요\n언제든지 변경할 수 있습니다',
                  style: AppTextStyles.bodyLarge.copyWith(
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),
                
                const SizedBox(height: AppSpacing.xxl),
                
                // Profile Preview
                Center(
                  child: Column(
                    children: [
                      Container(
                        width: 100,
                        height: 100,
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          shape: BoxShape.circle,
                          border: Border.all(
                            color: AppColors.primary.withOpacity(0.3),
                            width: 2,
                          ),
                        ),
                        child: Icon(
                          Icons.person,
                          size: 50,
                          color: AppColors.primary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.md),
                      Text(
                        '@${_nicknameController.text.isEmpty ? 'nickname' : _nicknameController.text}',
                        style: AppTextStyles.titleLarge.copyWith(
                          color: _isNicknameValid ? AppColors.primary : AppColors.grey600,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ],
                  ),
                ),
                
                const SizedBox(height: AppSpacing.xxl),
                
                // Nickname Input
                Text(
                  '닉네임',
                  style: AppTextStyles.titleSmall.copyWith(
                    fontWeight: FontWeight.bold,
                    color: AppColors.textPrimary,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                
                // TextField with validation - Korean input support
                TextField(
                  controller: _nicknameController,
                  focusNode: _nicknameFocus,
                  keyboardType: TextInputType.text,
                  textInputAction: TextInputAction.done,
                  style: const TextStyle(
                    color: AppColors.textPrimary,
                    fontSize: 16,
                  ),
                  onChanged: (value) {
                    // 디바운싱을 사용한 검증
                    _debounceTimer?.cancel();
                    
                    // 즉시 길이 체크 (UI 피드백용)
                    if (value.length > 12) {
                      // 12자 초과시 자르기
                      final truncated = value.substring(0, 12);
                      _nicknameController.text = truncated;
                      _nicknameController.selection = TextSelection.fromPosition(
                        TextPosition(offset: truncated.length),
                      );
                      return;
                    }
                    
                    // 빈 값일 때 즉시 초기화
                    if (value.isEmpty) {
                      setState(() {
                        _nicknameError = null;
                        _isNicknameValid = false;
                        _isCheckingNickname = false;
                      });
                      return;
                    }
                    
                    // 검증은 디바운싱 후 실행 (한글 조합 완성 대기)
                    _debounceTimer = Timer(const Duration(milliseconds: 1200), () {
                      final trimmed = value.trim();
                      if (trimmed.isNotEmpty) {
                        _validateNickname(trimmed);
                      }
                    });
                  },
                  decoration: InputDecoration(
                    hintText: '2-12글자로 입력해주세요',
                    hintStyle: const TextStyle(
                      color: AppColors.textSecondary,
                    ),
                    filled: true,
                    fillColor: AppColors.grey50,
                    counterText: '${_nicknameController.text.length}/12',
                    counterStyle: TextStyle(
                      color: _nicknameController.text.length > 12 
                          ? AppColors.error 
                          : AppColors.textSecondary,
                      fontSize: 12,
                    ),
                    border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.grey300),
                    ),
                    enabledBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.grey300),
                    ),
                    focusedBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: BorderSide(
                        color: _nicknameError != null 
                            ? AppColors.error 
                            : AppColors.primary,
                        width: 2,
                      ),
                    ),
                    errorBorder: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12),
                      borderSide: const BorderSide(color: AppColors.error, width: 2),
                    ),
                    prefixIcon: const Icon(
                      Icons.alternate_email, 
                      size: 20, 
                      color: AppColors.grey600,
                    ),
                    suffixIcon: _isCheckingNickname
                        ? const Padding(
                            padding: EdgeInsets.all(12),
                            child: SizedBox(
                              width: 20,
                              height: 20,
                              child: CircularProgressIndicator(strokeWidth: 2),
                            ),
                          )
                        : _isNicknameValid
                            ? const Icon(Icons.check_circle, color: AppColors.success, size: 20)
                            : _nicknameError != null
                                ? const Icon(Icons.error, color: AppColors.error, size: 20)
                                : null,
                    errorText: _nicknameError,
                  ),
                ),
                
                const SizedBox(height: AppSpacing.md),
                
                // Guidelines - 중앙 정렬 및 너비 조정
                Center(
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.grey50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: AppColors.grey200,
                        width: 1,
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
                              color: AppColors.textSecondary,
                            ),
                            const SizedBox(width: AppSpacing.xs),
                            Text(
                              '닉네임 규칙',
                              style: AppTextStyles.bodySmall.copyWith(
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: AppSpacing.sm),
                        ...[
                          '• 2-12글자로 설정',
                          '• 한글, 영문, 숫자, _만 사용 가능',
                          '• 중복된 닉네임은 사용 불가',
                        ].map((rule) => Padding(
                          padding: const EdgeInsets.only(bottom: 4),
                          child: Text(
                            rule,
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.textSecondary,
                              height: 1.3,
                            ),
                          ),
                        )),
                      ],
                    ),
                  ),
                ),
                
                const SizedBox(height: AppSpacing.xxl * 2),
                
                // Continue Button
                SizedBox(
                  width: double.infinity,
                  child: ElevatedButton(
                    onPressed: _isNicknameValid ? _continue : null,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: _isNicknameValid 
                          ? AppColors.primary 
                          : AppColors.grey300,
                      foregroundColor: Colors.white,
                      elevation: _isNicknameValid ? 4 : 0,
                      shadowColor: _isNicknameValid 
                          ? AppColors.primary.withOpacity(0.3) 
                          : null,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                    ),
                    child: Text(
                      '다음',
                      style: AppTextStyles.titleMedium.copyWith(
                        color: Colors.white,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ),
                
                const SizedBox(height: AppSpacing.lg),
                const SizedBox(height: AppSpacing.xxl * 2), // 하단 여백 추가
              ],
            ),
          ),
        ),
      ),
    );
  }
}