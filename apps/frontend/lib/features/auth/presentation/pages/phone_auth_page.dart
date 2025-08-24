import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:url_launcher/url_launcher.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/services/firebase_auth_service.dart';
import '../../../../core/services/analytics_service.dart';

class PhoneAuthPage extends ConsumerStatefulWidget {
  const PhoneAuthPage({super.key});

  @override
  ConsumerState<PhoneAuthPage> createState() => _PhoneAuthPageState();
}

class _PhoneAuthPageState extends ConsumerState<PhoneAuthPage>
    with TickerProviderStateMixin {
  final TextEditingController _phoneController = TextEditingController();
  final FocusNode _phoneFocusNode = FocusNode();

  late AnimationController _animationController;
  late Animation<double> _fadeAnimation;
  late Animation<Offset> _slideAnimation;

  String _countryCode = '+82';
  String _phoneNumber = '';
  bool _isValid = false;
  bool _isLoading = false;
  bool _agreedToPrivacyPolicy = false; // 개인정보처리방침 동의 여부
  bool _agreedToTermsOfService = false; // 서비스 이용약관 동의 여부

  @override
  void initState() {
    super.initState();

    _animationController = AnimationController(
      duration: const Duration(milliseconds: 800),
      vsync: this,
    );

    _fadeAnimation = Tween<double>(begin: 0.0, end: 1.0).animate(
      CurvedAnimation(
        parent: _animationController,
        curve: const Interval(0.3, 1.0, curve: Curves.easeOut),
      ),
    );

    _slideAnimation =
        Tween<Offset>(begin: const Offset(0, 0.3), end: Offset.zero).animate(
          CurvedAnimation(
            parent: _animationController,
            curve: const Interval(0.0, 0.8, curve: Curves.easeOut),
          ),
        );

    _phoneController.addListener(_onPhoneChanged);
    _animationController.forward();

    // 자동 포커스 제거 - 사용자가 필요할 때만 탭해서 입력하도록
    // WidgetsBinding.instance.addPostFrameCallback((_) {
    //   _phoneFocusNode.requestFocus();
    // });
  }

  @override
  void dispose() {
    _phoneController.dispose();
    _phoneFocusNode.dispose();
    _animationController.dispose();
    super.dispose();
  }

  void _onPhoneChanged() {
    final phone = _phoneController.text.replaceAll('-', '').replaceAll(' ', '');
    setState(() {
      _phoneNumber = phone;
      _isValid =
          phone.length >= 10 &&
          phone.length <= 11 &&
          RegExp(r'^[0-9]+$').hasMatch(phone);
    });

    // 자동 포맷팅
    _formatPhoneNumber();
  }

  void _formatPhoneNumber() {
    final text = _phoneController.text.replaceAll('-', '').replaceAll(' ', '');
    String formatted = '';

    if (text.length > 0) {
      if (text.length <= 3) {
        formatted = text;
      } else if (text.length <= 7) {
        formatted = '${text.substring(0, 3)}-${text.substring(3)}';
      } else if (text.length <= 11) {
        formatted =
            '${text.substring(0, 3)}-${text.substring(3, 7)}-${text.substring(7)}';
      }
    }

    if (formatted != _phoneController.text) {
      _phoneController.value = TextEditingValue(
        text: formatted,
        selection: TextSelection.collapsed(offset: formatted.length),
      );
    }
  }

  Future<void> _sendVerificationCode() async {
    if (!_isValid || _isLoading) return;
    
    // 개인정보처리방침 동의 확인
    if (!_agreedToPrivacyPolicy) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('개인정보처리방침에 동의해주세요'),
          backgroundColor: AppColors.error,
        ),
      );
      return;
    }

    setState(() => _isLoading = true);
    
    // Analytics: 전화번호 인증 시작 이벤트
    await AnalyticsService.logEvent(
      name: 'phone_auth_started',
      parameters: {'country_code': _countryCode},
    );

    try {
      HapticFeedback.mediumImpact();

      // Firebase 형식으로 전화번호 변환 (010 -> 10)
      String formattedPhone = _phoneNumber;
      if (_phoneNumber.startsWith('0')) {
        formattedPhone = _phoneNumber.substring(1); // 앞의 0 제거
      }
      final fullPhoneNumber = '$_countryCode$formattedPhone';

      print('PhoneAuth: Sending verification code to $fullPhoneNumber');

      // 개발 환경에서만 테스트 번호 우회 (프로덕션에서는 제거 필요)
      const bool isDebugMode = true; // TODO: kDebugMode 또는 환경변수로 변경
      if (isDebugMode && (
          fullPhoneNumber == '+821011111111')) {
        print(
          'PhoneAuth: [DEBUG] Test number detected, navigating to SMS verification',
        );

        // 약간의 지연을 추가하여 UI 업데이트 완료를 보장
        await Future.delayed(const Duration(milliseconds: 100));

        if (mounted) {
          setState(() => _isLoading = false);

          // go를 사용하여 직접 이동
          context.go(
            '/auth/sms-verification',
            extra: {
              'phoneNumber': fullPhoneNumber,
              'verificationId': 'test-verification-id',
              'isTestNumber': true, // 테스트 번호 플래그 추가
            },
          );
        }
        return;
      }

      final authService = FirebaseAuthService();

      // reCAPTCHA 콜백을 위해 미리 전화번호 저장
      FirebaseAuthService.pendingPhoneNumber = fullPhoneNumber;

      // Firebase Phone Auth 사용
      await authService.sendVerificationCode(
        phoneNumber: fullPhoneNumber,
        onCodeSent: (String verificationId) {
          print(
            'PhoneAuth: Code sent successfully, verificationId: $verificationId',
          );

          // FirebaseAuthService에 verificationId 저장
          FirebaseAuthService.pendingVerificationId = verificationId;
          
          // mounted 체크 후 상태 업데이트
          if (mounted) {
            setState(() => _isLoading = false);
            
            print('PhoneAuth: Navigating to SMS verification page');
            // go를 사용하여 직접 이동 (reCAPTCHA 콜백과 충돌 방지)
            context.go(
              '/auth/sms-verification',
              extra: {
                'phoneNumber': fullPhoneNumber,
                'verificationId': verificationId,
                'isTestNumber': false,
              },
            );
            print('PhoneAuth: Navigation to SMS verification triggered');
          }
        },
        onError: (String error) {
          print('PhoneAuth: Error sending code: $error');
          if (mounted) {
            setState(() => _isLoading = false);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('인증번호 전송 실패: $error'),
                backgroundColor: AppColors.error,
              ),
            );
          }
        },
        onAutoVerify: (credential) async {
          print('PhoneAuth: Auto verification completed');
          // 자동 인증된 경우 Firebase credential로 바로 로그인
          try {
            final userCredential = await FirebaseAuth.instance
                .signInWithCredential(credential);
            if (userCredential.user != null && mounted) {
              print(
                'Auto sign-in successful: ${userCredential.user!.phoneNumber}',
              );
              setState(() => _isLoading = false);
              // 자동 인증 완료 시 바로 다음 단계로
              context.go(
                '/auth/sms-verification',
                extra: {
                  'phoneNumber': fullPhoneNumber,
                  'verificationId': 'auto-verified',
                  'autoVerified': true,
                },
              );
            }
          } catch (e) {
            print('Auto sign-in failed: $e');
            if (mounted) {
              setState(() => _isLoading = false);
            }
          }
        },
      );
    } catch (e) {
      print('PhoneAuth: Exception during verification: $e');
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('인증번호 전송 실패: $e'),
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
            onPressed: () => context.pop(),
          ),
        ),
        body: SafeArea(
          child: SlideTransition(
            position: _slideAnimation,
            child: FadeTransition(
              opacity: _fadeAnimation,
              child: SingleChildScrollView( // 스크롤 가능하게 변경
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                  const SizedBox(height: AppSpacing.xl),

                  // 타이틀
                  Text(
                    '전화번호를\n입력해주세요',
                    style: AppTextStyles.headlineLarge.copyWith(
                      fontWeight: FontWeight.w800,
                      color: AppColors.textPrimary,
                      height: 1.2,
                    ),
                  ),

                  const SizedBox(height: AppSpacing.md),

                  // 서브타이틀
                  Text(
                    'SMS로 인증코드를 보내드릴게요',
                    style: AppTextStyles.bodyLarge.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),

                  const SizedBox(height: AppSpacing.xxl),

                  // 전화번호 입력 섹션
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.lg),
                    decoration: BoxDecoration(
                      color: AppColors.surface,
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(color: AppColors.grey200),
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.black.withOpacity(0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '전화번호',
                          style: AppTextStyles.labelMedium.copyWith(
                            color: AppColors.textSecondary,
                            fontWeight: FontWeight.w600,
                          ),
                        ),

                        const SizedBox(height: AppSpacing.md),

                        // 국가 코드 + 전화번호 입력
                        Row(
                          children: [
                            // 국가 코드 선택
                            Container(
                              padding: const EdgeInsets.symmetric(
                                horizontal: AppSpacing.md,
                                vertical: AppSpacing.sm,
                              ),
                              decoration: BoxDecoration(
                                color: AppColors.grey100,
                                borderRadius: BorderRadius.circular(12),
                              ),
                              child: Row(
                                children: [
                                  Text(
                                    '🇰🇷',
                                    style: AppTextStyles.titleMedium,
                                  ),
                                  const SizedBox(width: AppSpacing.xs),
                                  Text(
                                    _countryCode,
                                    style: AppTextStyles.titleMedium.copyWith(
                                      fontWeight: FontWeight.w600,
                                      color: AppColors.textPrimary,
                                    ),
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(width: AppSpacing.md),

                            // 전화번호 입력 필드
                            Expanded(
                              child: TextField(
                                controller: _phoneController,
                                focusNode: _phoneFocusNode,
                                keyboardType: TextInputType.phone,
                                inputFormatters: [
                                  FilteringTextInputFormatter.allow(
                                    RegExp(r'[0-9-]'),
                                  ),
                                  LengthLimitingTextInputFormatter(13),
                                  // 000-0000-0000
                                ],
                                style: AppTextStyles.titleLarge.copyWith(
                                  fontWeight: FontWeight.w600,
                                  color: AppColors.textPrimary,
                                ),
                                decoration: InputDecoration(
                                  hintText: '010-0000-0000',
                                  hintStyle: AppTextStyles.titleLarge.copyWith(
                                    color: AppColors.grey400,
                                  ),
                                  border: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(
                                      color: AppColors.grey300,
                                    ),
                                  ),
                                  enabledBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(
                                      color: AppColors.grey300,
                                    ),
                                  ),
                                  focusedBorder: OutlineInputBorder(
                                    borderRadius: BorderRadius.circular(12),
                                    borderSide: BorderSide(
                                      color: AppColors.primary,
                                      width: 2,
                                    ),
                                  ),
                                  contentPadding: const EdgeInsets.symmetric(
                                    horizontal: AppSpacing.md,
                                    vertical: AppSpacing.md,
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ),

                        if (_phoneNumber.isNotEmpty && !_isValid) ...[
                          const SizedBox(height: AppSpacing.sm),
                          Text(
                            '올바른 전화번호를 입력해주세요',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.error,
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: AppSpacing.xl),

                  // 개인정보 처리 안내
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withOpacity(0.05),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Icon(
                          Icons.info_outline,
                          color: AppColors.primary,
                          size: 20,
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: Text(
                            '전화번호는 본인 확인 용도로만 사용되며,\n다른 사용자에게 공개되지 않습니다.',
                            style: AppTextStyles.bodySmall.copyWith(
                              color: AppColors.primary,
                              height: 1.4,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppSpacing.lg),
                  
                  // 개인정보처리방침 동의 체크박스
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.grey50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _agreedToPrivacyPolicy 
                            ? AppColors.primary.withOpacity(0.3)
                            : AppColors.grey200,
                      ),
                    ),
                    child: Row(
                      children: [
                        SizedBox(
                          width: 24,
                          height: 24,
                          child: Checkbox(
                            value: _agreedToPrivacyPolicy,
                            onChanged: (value) {
                              setState(() {
                                _agreedToPrivacyPolicy = value ?? false;
                              });
                            },
                            activeColor: AppColors.primary,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: GestureDetector(
                            onTap: () {
                              setState(() {
                                _agreedToPrivacyPolicy = !_agreedToPrivacyPolicy;
                              });
                            },
                            child: RichText(
                              text: TextSpan(
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                                children: [
                                  const TextSpan(text: '인증번호 전송을 위해 '),
                                  WidgetSpan(
                                    child: GestureDetector(
                                      onTap: () async {
                                        final url = Uri.parse('https://relic-baboon-412.notion.site/250766a8bb4680f19a28d843992ff9ff');
                                        try {
                                          await launchUrl(url, mode: LaunchMode.externalApplication);
                                        } catch (e) {
                                          print('Could not launch URL: $e');
                                          // 에러 발생 시 스낵바 표시
                                          if (context.mounted) {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              const SnackBar(
                                                content: Text('링크를 열 수 없습니다'),
                                                backgroundColor: AppColors.error,
                                              ),
                                            );
                                          }
                                        }
                                      },
                                      child: Text(
                                        '개인정보처리방침',
                                        style: AppTextStyles.bodySmall.copyWith(
                                          color: AppColors.primary,
                                          fontWeight: FontWeight.w600,
                                          decoration: TextDecoration.underline,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const TextSpan(text: '에 동의합니다'),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppSpacing.md),
                  
                  // 서비스 이용약관 동의 체크박스
                  Container(
                    padding: const EdgeInsets.all(AppSpacing.md),
                    decoration: BoxDecoration(
                      color: AppColors.grey50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _agreedToTermsOfService 
                            ? AppColors.primary.withOpacity(0.3)
                            : AppColors.grey200,
                      ),
                    ),
                    child: Row(
                      children: [
                        SizedBox(
                          width: 24,
                          height: 24,
                          child: Checkbox(
                            value: _agreedToTermsOfService,
                            onChanged: (value) {
                              setState(() {
                                _agreedToTermsOfService = value ?? false;
                              });
                            },
                            activeColor: AppColors.primary,
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(4),
                            ),
                          ),
                        ),
                        const SizedBox(width: AppSpacing.sm),
                        Expanded(
                          child: GestureDetector(
                            onTap: () {
                              setState(() {
                                _agreedToTermsOfService = !_agreedToTermsOfService;
                              });
                            },
                            child: RichText(
                              text: TextSpan(
                                style: AppTextStyles.bodySmall.copyWith(
                                  color: AppColors.textSecondary,
                                ),
                                children: [
                                  const TextSpan(text: '시그널스팟 '),
                                  WidgetSpan(
                                    child: GestureDetector(
                                      onTap: () async {
                                        final url = Uri.parse('https://relic-baboon-412.notion.site/250766a8bb4680419472d283a09bf8c6');
                                        try {
                                          await launchUrl(url, mode: LaunchMode.externalApplication);
                                        } catch (e) {
                                          print('Could not launch URL: $e');
                                          // 에러 발생 시 스낵바 표시
                                          if (context.mounted) {
                                            ScaffoldMessenger.of(context).showSnackBar(
                                              const SnackBar(
                                                content: Text('링크를 열 수 없습니다'),
                                              ),
                                            );
                                          }
                                        }
                                      },
                                      child: Text(
                                        '서비스 이용약관',
                                        style: AppTextStyles.bodySmall.copyWith(
                                          color: AppColors.primary,
                                          fontWeight: FontWeight.w600,
                                          decoration: TextDecoration.underline,
                                        ),
                                      ),
                                    ),
                                  ),
                                  const TextSpan(text: '에 동의합니다'),
                                ],
                              ),
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: AppSpacing.xxl),

                  // 인증코드 받기 버튼
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: _isValid && !_isLoading && _agreedToPrivacyPolicy && _agreedToTermsOfService
                          ? _sendVerificationCode
                          : null,
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _isValid && _agreedToPrivacyPolicy && _agreedToTermsOfService
                            ? AppColors.primary
                            : AppColors.grey300,
                        foregroundColor: Colors.white,
                        elevation: _isValid ? 8 : 0,
                        shadowColor: AppColors.primary.withOpacity(0.4),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        padding: const EdgeInsets.symmetric(
                          vertical: AppSpacing.lg,
                        ),
                      ),
                      child: _isLoading
                          ? Row(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                const SizedBox(
                                  width: 20,
                                  height: 20,
                                  child: CircularProgressIndicator(
                                    strokeWidth: 2,
                                    valueColor: AlwaysStoppedAnimation<Color>(
                                      Colors.white,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: AppSpacing.md),
                                Text(
                                  '전송 중...',
                                  style: AppTextStyles.titleMedium.copyWith(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w600,
                                  ),
                                ),
                              ],
                            )
                          : Text(
                              '인증코드 받기',
                              style: AppTextStyles.titleMedium.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
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
    );
  }
}
