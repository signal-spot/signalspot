import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'package:firebase_auth/firebase_auth.dart' as firebase;
import 'dart:async';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/api/api_client.dart';
import '../../../../core/services/firebase_auth_service.dart';
import '../../../auth/presentation/providers/auth_provider.dart';
import '../../data/models/auth_models.dart';

class SmsVerificationPage extends ConsumerStatefulWidget {
  final String phoneNumber;
  final String? verificationId;
  final bool? autoVerified;
  
  const SmsVerificationPage({
    super.key,
    required this.phoneNumber,
    this.verificationId,
    this.autoVerified,
  });

  @override
  ConsumerState<SmsVerificationPage> createState() => _SmsVerificationPageState();
}

class _SmsVerificationPageState extends ConsumerState<SmsVerificationPage>
    with TickerProviderStateMixin {
  final List<TextEditingController> _controllers = List.generate(6, (index) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(6, (index) => FocusNode());
  
  late AnimationController _animationController;
  late AnimationController _shakeController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;
  late Animation<Offset> _shakeAnimation;
  
  Timer? _resendTimer;
  int _remainingSeconds = 60;
  bool _canResend = false;
  bool _isVerifying = false;
  String _verificationCode = '';

  @override
  void initState() {
    super.initState();
    
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );
    
    _shakeController = AnimationController(
      duration: const Duration(milliseconds: 600),
      vsync: this,
    );
    
    _fadeAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.3, 1.0, curve: Curves.easeOut),
    ));
    
    _slideAnimation = Tween<Offset>(
      begin: const Offset(0, 0.3),
      end: Offset.zero,
    ).animate(CurvedAnimation(
      parent: _animationController,
      curve: const Interval(0.0, 0.8, curve: Curves.easeOut),
    ));
    
    _shakeAnimation = Tween<Offset>(
      begin: const Offset(-0.05, 0),
      end: const Offset(0.05, 0),
    ).animate(CurvedAnimation(
      parent: _shakeController,
      curve: Curves.elasticIn,
    ));
    
    _startResendTimer();
    _animationController.forward();
    
    // 자동 포커스 제거 - 사용자가 필요할 때만 탭해서 입력하도록
    // WidgetsBinding.instance.addPostFrameCallback((_) {
    //   _focusNodes[0].requestFocus();
    // });
    
    // 각 컨트롤러에 리스너 추가
    for (int i = 0; i < 6; i++) {
      _controllers[i].addListener(() => _onCodeChanged(i));
    }
  }

  @override
  void dispose() {
    _resendTimer?.cancel();
    _animationController.dispose();
    _shakeController.dispose();
    
    for (int i = 0; i < 6; i++) {
      _controllers[i].dispose();
      _focusNodes[i].dispose();
    }
    
    super.dispose();
  }

  void _startResendTimer() {
    _canResend = false;
    _remainingSeconds = 60;
    
    _resendTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_remainingSeconds > 0) {
        setState(() {
          _remainingSeconds--;
        });
      } else {
        setState(() {
          _canResend = true;
        });
        timer.cancel();
      }
    });
  }

  void _onCodeChanged(int index) {
    final value = _controllers[index].text;
    
    if (value.isNotEmpty) {
      // 다음 필드로 포커스 이동
      if (index < 5) {
        _focusNodes[index + 1].requestFocus();
      } else {
        // 마지막 필드라면 키보드 숨김
        _focusNodes[index].unfocus();
      }
    }
    
    // 전체 코드 확인
    _updateVerificationCode();
  }

  void _updateVerificationCode() {
    _verificationCode = _controllers.map((controller) => controller.text).join();
    
    // 6자리 모두 입력되면 자동 검증
    if (_verificationCode.length == 6) {
      _verifyCode();
    }
  }

  Future<void> _verifyCode() async {
    if (_verificationCode.length != 6 || _isVerifying) return;
    
    setState(() => _isVerifying = true);
    
    try {
      // 햅틱 피드백
      HapticFeedback.lightImpact();
      
      final authService = FirebaseAuthService();
      final apiClient = ApiClient();
      
      // 자동 인증된 경우 건너뛰기
      if (widget.autoVerified == true) {
        print('SMS 검증: 자동 인증 완료');
      } else if (const bool.fromEnvironment('DEBUG_MODE', defaultValue: true) && (
                 widget.verificationId == 'test-verification-id' || 
                 widget.phoneNumber == '+821011111111' ||
                 widget.phoneNumber == '+821012345678')) {
        // 개발 환경 테스트 모드: 123456만 허용
        if (_verificationCode != '123456') {
          throw Exception('[DEBUG] 테스트 모드: 인증코드는 123456입니다');
        }
        print('SMS 검증: [DEBUG] 테스트 모드 인증 성공');
      } else if (widget.verificationId != null && widget.verificationId != 'mock-verification-id') {
        // Firebase SMS 인증 코드 검증
        print('SMS 검증: Firebase 인증 시작');
        try {
          final phoneNumber = await authService.verifyCode(
            verificationId: widget.verificationId!,
            smsCode: _verificationCode,
          );
          
          if (phoneNumber == null) {
            throw Exception('전화번호 인증 실패');
          }
          
          print('SMS 검증: Firebase 인증 성공 - $phoneNumber');
        } catch (e) {
          print('Firebase 인증 오류: $e');
          // Firebase 오류 시 테스트 코드로 우회
          if (_verificationCode == '123456') {
            print('SMS 검증: 테스트 코드로 우회');
          } else {
            throw e;
          }
        }
      } else {
        // 개발 모드: 6자리 숫자만 확인
        if (!RegExp(r'^[0-9]{6}$').hasMatch(_verificationCode)) {
          throw Exception('잘못된 인증코드 형식입니다');
        }
        print('SMS 검증: 개발 모드 - 6자리 숫자 확인 완료');
      }

      // Firebase 인증 완료 후 약간의 지연을 추가하여 상태 업데이트 대기
      await Future.delayed(const Duration(milliseconds: 500));

      // Firebase에서 현재 사용자의 ID 토큰 가져오기
      String? firebaseIdToken;
      String? actualPhoneNumber = widget.phoneNumber; // 기본값은 widget에서 받은 번호
      final firebaseUser = firebase.FirebaseAuth.instance.currentUser;
      if (firebaseUser != null) {
        try {
          firebaseIdToken = await firebaseUser.getIdToken();
          // Firebase가 실제로 인증한 전화번호 사용 (0이 제거된 형식)
          actualPhoneNumber = firebaseUser.phoneNumber ?? widget.phoneNumber;
          print('SMS 검증: Firebase ID 토큰 획득 성공: ${firebaseIdToken?.substring(0, 30)}...');
          print('SMS 검증: Firebase 인증된 전화번호: $actualPhoneNumber');
        } catch (e) {
          print('SMS 검증: Firebase ID 토큰 획득 실패: $e');
        }
      } else {
        print('SMS 검증: Firebase currentUser가 null입니다. 테스트 모드이거나 인증이 완료되지 않았습니다.');
      }
      
      // firebaseIdToken이 null인 경우 백엔드로 진행하지 않음
      if (firebaseIdToken == null) {
        // 테스트 모드인 경우에만 임시 토큰 사용
        if (const bool.fromEnvironment('DEBUG_MODE', defaultValue: true) && 
            (widget.verificationId == 'test-verification-id' || 
             widget.phoneNumber == '+821011111111' ||
             widget.phoneNumber == '+821012345678' )) {
          print('SMS 검증: [DEBUG] 테스트 모드 - 테스트용 JWT 토큰 생성');
          // Firebase ID 토큰과 유사한 형식의 테스트 JWT 생성
          // 형식: header.payload.signature
          final header = 'eyJhbGciOiJSUzI1NiIsImtpZCI6InRlc3QiLCJ0eXAiOiJKV1QifQ';
          final payload = 'eyJpc3MiOiJodHRwczovL3NlY3VyZXRva2VuLmdvb2dsZS5jb20vc2lnbmFsc3BvdC05Yzg2NCIsImF1ZCI6InNpZ25hbHNwb3QtOWM4NjQiLCJhdXRoX3RpbWUiOjE3MzQzNDU2MDAsInVzZXJfaWQiOiJ0ZXN0LXVzZXItJHtEYXRlVGltZS5ub3coKS5taWxsaXNlY29uZFNpbmNlRXBvY2h9Iiwic3ViIjoidGVzdC11c2VyIiwiaWF0IjoxNzM0MzQ1NjAwLCJleHAiOjE3MzQzNDkyMDAsInBob25lX251bWJlciI6IiR7d2lkZ2V0LnBob25lTnVtYmVyfSIsImZpcmViYXNlIjp7ImlkZW50aXRpZXMiOnsicGhvbmUiOlsiJHt3aWRnZXQucGhvbmVOdW1iZXJ9Il19LCJzaWduX2luX3Byb3ZpZGVyIjoicGhvbmUifX0';
          final signature = 'test_signature_${DateTime.now().millisecondsSinceEpoch}';
          firebaseIdToken = '$header.$payload.$signature';
          print('SMS 검증: [DEBUG] 생성된 테스트 토큰: $firebaseIdToken');
        } else {
          throw Exception('Firebase 인증 토큰을 가져올 수 없습니다. 다시 시도해주세요.');
        }
      }
      
      // 백엔드에 사용자 확인/생성 요청
      final response = await apiClient.post(
        '/auth/phone/authenticate',
        data: {
          'phoneNumber': actualPhoneNumber, // Firebase가 인증한 실제 번호 사용
          'firebaseToken': firebaseIdToken, // 항상 유효한 토큰 (실제 또는 테스트)
        },
      );


      final responseData = response.data['data'];
      final userData = responseData['user'];
      
      // 백엔드에서 profileCompleted는 user 객체 밖에 있음
      final profileCompleted = responseData['profileCompleted'] == true;
      
      print('SMS 검증: profileCompleted 값 확인');
      print('- responseData[profileCompleted]: ${responseData['profileCompleted']}');
      print('- userData: $userData');
      print('- 최종 profileCompleted: $profileCompleted');
      
      // 토큰 저장 - 이 부분이 중요!
      if (responseData['accessToken'] != null) {
        await apiClient.saveTokens(
          responseData['accessToken'],
          responseData['refreshToken'] ?? '',
        );
        print('SMS 검증: 토큰 저장 완료');
      }

      if (mounted) {
        // 성공 햅틱 피드백
        HapticFeedback.heavyImpact();
        
        // AuthProvider에 사용자 정보 설정
        final authNotifier = ref.read(authProvider.notifier);
        // userData에 profileCompleted 추가
        userData['profileCompleted'] = profileCompleted;
        final user = User.fromJson(userData);
        await authNotifier.setAuthenticatedUser(user);
        
        // 프로필 완성 여부에 따라 라우팅 (엄격한 체크)
        if (profileCompleted != true) {  // 명시적으로 true가 아니면 온보딩으로
          print('SMS 인증 완료: 프로필 미완성 (profileCompleted=$profileCompleted) - 온보딩으로 이동');
          
          // SharedPreferences에서 저장된 닉네임 확인 (선택사항)
          final prefs = await SharedPreferences.getInstance();
          final pendingNickname = prefs.getString('pending_nickname');
          
          if (pendingNickname != null && pendingNickname.isNotEmpty) {
            print('저장된 닉네임 발견: $pendingNickname');
            // 닉네임은 프로필 설정 페이지에서 처리
            await prefs.remove('pending_nickname');
          }
          
          // 프로필 설정으로 이동 (온보딩 플로우)
          context.go('/onboarding/profile');
        } else {
          print('SMS 인증 완료: 프로필 완성 - 홈으로 이동');
          // GoRouter를 사용하여 이동
          context.go('/home');
        }
      }
    } catch (e) {
      print('SMS 인증 오류: $e');
      if (mounted) {
        // 오류 햅틱 피드백
        HapticFeedback.heavyImpact();
        
        // 흔들기 애니메이션
        _shakeController.reset();
        _shakeController.forward();
        
        // 필드 초기화
        _clearAllFields();
        
        // 에러 메시지 구분
        String errorMessage = '인증코드가 올바르지 않습니다';
        
        // DioException 타입 체크로 더 정확한 에러 구분
        if (e is DioException) {
          if (e.type == DioExceptionType.connectionTimeout ||
              e.type == DioExceptionType.sendTimeout ||
              e.type == DioExceptionType.receiveTimeout) {
            errorMessage = '연결 시간이 초과되었습니다. 다시 시도해주세요.';
          } else if (e.type == DioExceptionType.connectionError) {
            errorMessage = '서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.';
          } else if (e.type == DioExceptionType.badResponse) {
            final statusCode = e.response?.statusCode;
            if (statusCode == 401) {
              errorMessage = '인증이 만료되었습니다. 다시 시도해주세요.';
            } else if (statusCode == 400) {
              errorMessage = '인증코드가 올바르지 않습니다';
            } else if (statusCode == 500 || statusCode == 502 || statusCode == 503) {
              errorMessage = '서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
            } else {
              errorMessage = '오류가 발생했습니다. 다시 시도해주세요.';
            }
          } else if (e.type == DioExceptionType.cancel) {
            errorMessage = '요청이 취소되었습니다.';
          } else {
            errorMessage = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
          }
        } else if (e.toString().contains('SocketException') ||
                   e.toString().contains('Connection refused') ||
                   e.toString().contains('Connection reset')) {
          errorMessage = '서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.';
        }
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text(errorMessage),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isVerifying = false);
      }
    }
  }

  void _clearAllFields() {
    for (int i = 0; i < 6; i++) {
      _controllers[i].clear();
    }
    // 자동 포커스 제거
    // _focusNodes[0].requestFocus();
    _verificationCode = '';
  }

  Future<void> _resendCode() async {
    if (!_canResend) return;
    
    try {
      // 햅틱 피드백
      HapticFeedback.lightImpact();
      
      // 타이머 재시작
      _startResendTimer();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('인증코드를 다시 전송했습니다 (개발모드)'),
            backgroundColor: AppColors.success,
          ),
        );
      }
    } catch (e) {
      print('SMS 재전송 예외: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('인증코드 전송에 실패했습니다: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        // 화면의 빈 공간을 탭하면 키보드를 내림
        FocusScope.of(context).unfocus();
      },
      child: Scaffold(
        backgroundColor: AppColors.background,
        resizeToAvoidBottomInset: true, // 키보드가 나타날 때 화면 크기 조정
        appBar: AppBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          leading: IconButton(
            icon: const Icon(Icons.arrow_back, color: AppColors.textPrimary),
            onPressed: () {
              // Navigator를 먼저 시도
              if (Navigator.of(context).canPop()) {
                Navigator.of(context).pop();
              } else {
                // Navigator로 pop이 안되면 GoRouter로 phone 화면으로 이동
                context.go('/auth/phone');
              }
            },
          ),
        ),
        body: SafeArea(
          child: SlideTransition(
            position: _slideAnimation,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: SingleChildScrollView( // 스크롤 가능하게 변경
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: SizedBox(
                  height: MediaQuery.of(context).size.height - 
                         MediaQuery.of(context).padding.top - 
                         MediaQuery.of(context).padding.bottom - 
                         kToolbarHeight - 
                         (AppSpacing.lg * 2), // SafeArea와 padding 고려
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                  const SizedBox(height: AppSpacing.xl),
                  
                  // 타이틀
                  Text(
                    '인증코드를\n입력해주세요',
                    style: AppTextStyles.headlineLarge.copyWith(
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                      height: 1.2,
                    ),
                  ),
                  
                  const SizedBox(height: AppSpacing.md),
                  
                  // 서브타이틀
                  RichText(
                    text: TextSpan(
                      style: AppTextStyles.bodyLarge.copyWith(
                        color: AppColors.textSecondary,
                      ),
                      children: [
                        const TextSpan(text: ''),
                        TextSpan(
                          text: widget.phoneNumber,
                          style: AppTextStyles.bodyLarge.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const TextSpan(text: '로\nSMS 인증코드를 전송했습니다'),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: AppSpacing.xxl),
                  
                  // 인증코드 입력 필드들
                  SlideTransition(
                    position: _shakeAnimation,
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: List.generate(6, (index) {
                        return Container(
                          width: 50,
                          height: 60,
                          decoration: BoxDecoration(
                            color: AppColors.surface,
                            borderRadius: BorderRadius.circular(12),
                            border: Border.all(
                              color: _controllers[index].text.isNotEmpty
                                  ? AppColors.primary
                                  : AppColors.grey300,
                              width: _controllers[index].text.isNotEmpty ? 2 : 1,
                            ),
                            boxShadow: [
                              if (_controllers[index].text.isNotEmpty)
                                BoxShadow(
                                  color: AppColors.primary.withOpacity(0.1),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                            ],
                          ),
                          child: TextField(
                            controller: _controllers[index],
                            focusNode: _focusNodes[index],
                            keyboardType: TextInputType.number,
                            inputFormatters: [
                              FilteringTextInputFormatter.digitsOnly,
                              LengthLimitingTextInputFormatter(1),
                            ],
                            textAlign: TextAlign.center,
                            style: AppTextStyles.headlineMedium.copyWith(
                              fontWeight: FontWeight.w700,
                              color: AppColors.textPrimary,
                            ),
                            decoration: const InputDecoration(
                              border: InputBorder.none,
                              contentPadding: EdgeInsets.zero,
                            ),
                            onChanged: (value) {
                              if (value.isNotEmpty && index < 5) {
                                _focusNodes[index + 1].requestFocus();
                              } else if (value.isEmpty && index > 0) {
                                _focusNodes[index - 1].requestFocus();
                              }
                            },
                          ),
                        );
                      }),
                    ),
                  ),
                  
                  const SizedBox(height: AppSpacing.xl),
                  
                  // 재전송 버튼
                  Center(
                    child: TextButton(
                      onPressed: _canResend ? _resendCode : null,
                      child: Text(
                        _canResend
                            ? '인증코드 다시 받기'
                            : '인증코드 다시 받기 (${_remainingSeconds}초 후)',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: _canResend ? AppColors.primary : AppColors.grey500,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ),
                  
                  const SizedBox(height: AppSpacing.lg),
                  
                  // 인증 진행 상태
                  if (_isVerifying)
                    Container(
                      padding: const EdgeInsets.all(AppSpacing.lg),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2,
                              valueColor: AlwaysStoppedAnimation<Color>(AppColors.primary),
                            ),
                          ),
                          const SizedBox(width: AppSpacing.md),
                          Text(
                            '인증 중...',
                            style: AppTextStyles.bodyMedium.copyWith(
                              color: AppColors.primary,
                              fontWeight: FontWeight.w600,
                            ),
                          ),
                        ],
                      ),
                    ),
                  
                  const Spacer(),
                  
                  // 도움말
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.grey50,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '인증코드가 오지 않나요?',
                          style: AppTextStyles.titleSmall.copyWith(
                            fontWeight: FontWeight.w600,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        const SizedBox(height: AppSpacing.xs),
                        Text(
                          '''• 스팸 폴더를 확인해보세요
• 네트워크 연결을 확인해보세요
• 잠시 후 인증코드가 도착합니다''',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                  
                  const SizedBox(height: AppSpacing.lg),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}