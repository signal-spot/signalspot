import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import '../../firebase_options.dart';

class FirebaseAuthService {
  static final FirebaseAuthService _instance = FirebaseAuthService._internal();
  factory FirebaseAuthService() => _instance;
  FirebaseAuthService._internal();

  FirebaseAuth? _auth;
  String? _verificationId;
  
  // Phone Auth 상태 저장
  static String? pendingVerificationId;
  static String? pendingPhoneNumber;

  // Initialize Firebase
  static Future<void> initialize() async {
    try {
      // Firebase가 이미 초기화되었는지 확인
      if (Firebase.apps.isEmpty) {
        print('FirebaseAuthService: Firebase not initialized, initializing now...');
        await Firebase.initializeApp(
          options: DefaultFirebaseOptions.currentPlatform,
        );
      }
      
      // Auth 인스턴스 초기화
      _instance._auth = FirebaseAuth.instance;
      
      // iOS에서 APNs를 통한 자동 검증 활성화 (웹뷰 방지)
      // setSettings는 iOS에서만 작동하므로 플랫폼 체크
      try {
        await _instance._auth!.setSettings(
          appVerificationDisabledForTesting: false,
          forceRecaptchaFlow: false,
        );
        print('FirebaseAuthService: Auth settings configured for APNs');
      } catch (e) {
        print('FirebaseAuthService: Could not set auth settings: $e');
        // Settings 실패는 무시하고 계속 진행
      }
      
      print('FirebaseAuthService: Auth instance initialized successfully');
    } catch (e) {
      print('FirebaseAuthService: Failed to initialize - $e');
      rethrow;
    }
  }

  // Send SMS verification code
  Future<void> sendVerificationCode({
    required String phoneNumber,
    required Function(String verificationId) onCodeSent,
    required Function(String error) onError,
    Function(PhoneAuthCredential credential)? onAutoVerify,
  }) async {
    try {
      // 개발 환경에서만 테스트 번호 우회 (프로덕션에서는 제거 필요)
      const bool isDebugMode = true; // TODO: kDebugMode 또는 환경변수로 변경
      if (isDebugMode && (
          phoneNumber == '+821012345678' ||
          phoneNumber == '+821011111111')) {
        print('FirebaseAuth: [DEBUG] Test number detected, skipping Firebase');
        onCodeSent('test-verification-id');
        return;
      }
      
      await (_auth ?? FirebaseAuth.instance).verifyPhoneNumber(
        phoneNumber: phoneNumber,
        verificationCompleted: (PhoneAuthCredential credential) {
          print('FirebaseAuth: Auto verification completed');
          onAutoVerify?.call(credential);
        },
        verificationFailed: (FirebaseAuthException e) {
          print('FirebaseAuth: Verification failed: ${e.message}');
          print('FirebaseAuth: Error code: ${e.code}');
          onError(e.message ?? 'Verification failed');
        },
        codeSent: (String verificationId, int? resendToken) {
          print('FirebaseAuth: Code sent, verificationId: $verificationId');
          _verificationId = verificationId;
          onCodeSent(verificationId);
        },
        codeAutoRetrievalTimeout: (String verificationId) {
          print('FirebaseAuth: Code auto retrieval timeout');
          _verificationId = verificationId;
        },
        timeout: const Duration(seconds: 180), // 3분으로 늘림
      );
    } catch (e) {
      print('FirebaseAuth: Exception during phone verification: $e');
      onError(e.toString());
    }
  }

  // Verify SMS code
  Future<String?> verifyCode({
    required String verificationId,
    required String smsCode,
  }) async {
    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: smsCode,
      );

      final userCredential = await (_auth ?? FirebaseAuth.instance).signInWithCredential(credential);
      final phoneNumber = userCredential.user?.phoneNumber;
      
      print('FirebaseAuth: SMS verification successful, phone: $phoneNumber');
      
      // Firebase Auth \uc0c1\ud0dc\ub97c \uc720\uc9c0\ud558\uc5ec authStateChanges \ub9ac\uc2a4\ub108\uac00 \uac10\uc9c0\ud560 \uc218 \uc788\ub3c4\ub85d \ud568
      // \ubc31\uc5d4\ub4dc\uc640\uc758 \ub3d9\uae30\ud654\ub294 AuthProvider\uc5d0\uc11c \ucc98\ub9ac
      
      return phoneNumber;
    } on FirebaseAuthException catch (e) {
      print('FirebaseAuth: SMS verification failed: ${e.message}');
      throw Exception(_getReadableError(e.code));
    } catch (e) {
      print('FirebaseAuth: Exception during SMS verification: $e');
      throw Exception('Verification failed');
    }
  }
  
  // Verify phone code and return credential
  Future<PhoneAuthCredential?> verifyPhoneCode({
    required String verificationId,
    required String smsCode,
  }) async {
    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: smsCode,
      );

      final userCredential = await (_auth ?? FirebaseAuth.instance).signInWithCredential(credential);
      final user = userCredential.user;
      
      if (user != null) {
        print('FirebaseAuth: Phone verification successful, uid: ${user.uid}');
        return credential;
      } else {
        throw Exception('사용자 정보를 가져올 수 없습니다');
      }
    } on FirebaseAuthException catch (e) {
      print('FirebaseAuth: Phone verification failed: ${e.message}');
      throw Exception(_getReadableError(e.code));
    } catch (e) {
      print('FirebaseAuth: Exception during phone verification: $e');
      throw Exception('인증 실패');
    }
  }

  // Get readable error messages
  String _getReadableError(String errorCode) {
    switch (errorCode) {
      case 'invalid-verification-code':
        return '인증번호가 올바르지 않습니다.';
      case 'invalid-verification-id':
        return '인증 세션이 만료되었습니다. 다시 시도해주세요.';
      case 'session-expired':
        return '인증 세션이 만료되었습니다.';
      case 'too-many-requests':
        return '너무 많은 요청이 발생했습니다. 잠시 후 다시 시도해주세요.';
      case 'invalid-phone-number':
        return '올바르지 않은 전화번호입니다.';
      case 'missing-phone-number':
        return '전화번호를 입력해주세요.';
      case 'quota-exceeded':
        return '일일 SMS 한도를 초과했습니다.';
      default:
        return '인증 중 오류가 발생했습니다.';
    }
  }

  // Check if phone number is valid format
  bool isValidPhoneNumber(String phoneNumber) {
    // Korean phone number validation
    final koreanPhoneRegex = RegExp(r'^\+82[0-9]{9,10}$');
    return koreanPhoneRegex.hasMatch(phoneNumber);
  }

  // Format phone number for display
  String formatPhoneNumber(String phoneNumber) {
    if (phoneNumber.startsWith('+82')) {
      final number = phoneNumber.substring(3);
      if (number.length == 10) {
        return '${number.substring(0, 3)}-${number.substring(3, 7)}-${number.substring(7)}';
      } else if (number.length == 9) {
        return '${number.substring(0, 2)}-${number.substring(2, 5)}-${number.substring(5)}';
      }
    }
    return phoneNumber;
  }

  // Convert display format to international format
  String toInternationalFormat(String phoneNumber, String countryCode) {
    // Remove all non-digits
    final digitsOnly = phoneNumber.replaceAll(RegExp(r'[^0-9]'), '');
    
    if (countryCode == '+82') {
      // Korean phone number
      if (digitsOnly.startsWith('010') || digitsOnly.startsWith('011') || 
          digitsOnly.startsWith('016') || digitsOnly.startsWith('017') ||
          digitsOnly.startsWith('018') || digitsOnly.startsWith('019')) {
        return '+82${digitsOnly.substring(1)}';
      }
    }
    
    return '$countryCode$digitsOnly';
  }
}