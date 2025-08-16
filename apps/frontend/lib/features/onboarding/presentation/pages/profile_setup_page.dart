import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:image_picker/image_picker.dart';
import 'package:image_cropper/image_cropper.dart';
import 'package:dio/dio.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/api/api_client.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class ProfileSetupPage extends ConsumerStatefulWidget {
  const ProfileSetupPage({super.key});

  @override
  ConsumerState<ProfileSetupPage> createState() => _ProfileSetupPageState();
}

class _ProfileSetupPageState extends ConsumerState<ProfileSetupPage>
    with TickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _nicknameController = TextEditingController();
  final _bioController = TextEditingController();
  final ImagePicker _imagePicker = ImagePicker();
  
  File? _profileImage;
  bool _isCheckingNickname = false;
  bool _isNicknameValid = false;
  String? _nicknameError;
  late AnimationController _profileImageController;
  late Animation<double> _profileImageAnimation;

  @override
  void initState() {
    super.initState();
    
    _profileImageController = AnimationController(
      duration: const Duration(milliseconds: 300),
      vsync: this,
    );
    _profileImageAnimation = Tween<double>(
      begin: 0.0,
      end: 1.0,
    ).animate(CurvedAnimation(
      parent: _profileImageController,
      curve: Curves.easeInOut,
    ));

    // 닉네임 실시간 검증 제거 - 읽기 전용이므로 불필요
    // _nicknameController.addListener(_validateNickname);
    
    // SharedPreferences에서 저장된 닉네임 가져오기
    _loadPendingNickname();
  }
  
  Future<void> _loadPendingNickname() async {
    final prefs = await SharedPreferences.getInstance();
    final pendingNickname = prefs.getString('pending_nickname');
    
    if (pendingNickname != null && pendingNickname.isNotEmpty) {
      print('ProfileSetupPage: Loading pending nickname: $pendingNickname');
      setState(() {
        _nicknameController.text = pendingNickname;
        _isNicknameValid = true; // 이미 검증된 닉네임
      });
    }
  }

  @override
  void dispose() {
    _nicknameController.dispose();
    _bioController.dispose();
    _profileImageController.dispose();
    super.dispose();
  }

  Future<void> _validateNickname() async {
    final nickname = _nicknameController.text.trim();
    
    if (nickname.isEmpty) {
      setState(() {
        _isNicknameValid = false;
        _nicknameError = null;
      });
      return;
    }

    if (nickname.length < 2 || nickname.length > 15) {
      setState(() {
        _isNicknameValid = false;
        _nicknameError = '닉네임은 2-15자여야 합니다';
      });
      return;
    }

    // 특수문자 검증
    if (!RegExp(r'^[가-힣a-zA-Z0-9_]+$').hasMatch(nickname)) {
      setState(() {
        _isNicknameValid = false;
        _nicknameError = '한글, 영문, 숫자, _만 사용 가능합니다';
      });
      return;
    }

    // 중복 확인 (디바운싱)
    setState(() {
      _isCheckingNickname = true;
      _nicknameError = null;
    });

    await Future.delayed(const Duration(milliseconds: 500));

    // 실제 API 호출로 중복 확인
    try {
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
          
          if (!isAvailable) {
            _isNicknameValid = false;
            _nicknameError = '이미 사용 중인 닉네임입니다';
          } else {
            _isNicknameValid = true;
            _nicknameError = null;
          }
        });
      }
    } catch (e) {
      print('닉네임 중복 확인 오류: $e');
      if (mounted) {
        setState(() {
          _isCheckingNickname = false;
          _isNicknameValid = false;
          _nicknameError = '네트워크 오류가 발생했습니다';
        });
      }
    }
  }

  Future<void> _pickImage() async {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('프로필 사진 추가'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt_outlined),
              title: const Text('카메라'),
              onTap: () {
                Navigator.of(context).pop();
                _selectImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library_outlined),
              title: const Text('갤러리'),
              onTap: () {
                Navigator.of(context).pop();
                _selectImage(ImageSource.gallery);
              },
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('취소'),
          ),
        ],
      ),
    );
  }

  Future<void> _selectImage(ImageSource source) async {
    // Navigator.of(context).pop(); 제거 - 이미 dialog에서 pop됨
    
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: source,
        maxWidth: 1024,
        maxHeight: 1024,
        imageQuality: 90,
      );

      if (image != null) {
        // 이미지 크롭
        final croppedFile = await _cropImage(image.path);
        
        if (croppedFile != null) {
          setState(() {
            _profileImage = File(croppedFile.path);
          });
          _profileImageController.forward();
        }
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('이미지를 불러올 수 없습니다: ${e.toString()}'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }
  
  Future<CroppedFile?> _cropImage(String imagePath) async {
    return await ImageCropper().cropImage(
      sourcePath: imagePath,
      aspectRatio: const CropAspectRatio(
        ratioX: 1,
        ratioY: 1,
      ),
      aspectRatioPresets: [
        CropAspectRatioPreset.square,
      ],
      uiSettings: [
        AndroidUiSettings(
          toolbarTitle: '프로필 사진 편집',
          toolbarColor: AppColors.primary,
          toolbarWidgetColor: Colors.white,
          activeControlsWidgetColor: AppColors.primary,
          initAspectRatio: CropAspectRatioPreset.square,
          lockAspectRatio: true,
          hideBottomControls: false,
          dimmedLayerColor: Colors.black.withOpacity(0.8),
          cropFrameColor: AppColors.primary,
          cropGridColor: AppColors.primary.withOpacity(0.3),
          cropFrameStrokeWidth: 3,
          cropGridStrokeWidth: 1,
          backgroundColor: Colors.black,
        ),
        IOSUiSettings(
          title: '프로필 사진 편집',
          cancelButtonTitle: '취소',
          doneButtonTitle: '완료',
          aspectRatioLockEnabled: true,
          aspectRatioPickerButtonHidden: true,
          resetButtonHidden: false,
          rotateButtonsHidden: false,
          minimumAspectRatio: 1.0,
        ),
      ],
    );
  }

  void _removeImage() {
    setState(() {
      _profileImage = null;
    });
    _profileImageController.reverse();
  }

  Future<void> _continueSetup() async {
    if (_formKey.currentState!.validate() && _isNicknameValid) {
      try {
        // 로딩 표시
        showDialog(
          context: context,
          barrierDismissible: false,
          builder: (context) => const Center(
            child: CircularProgressIndicator(),
          ),
        );

        // SharedPreferences에 프로필 데이터 임시 저장
        final prefs = await SharedPreferences.getInstance();
        
        // 프로필 정보를 임시로 저장 (나중에 시그니처 커넥션 완료 후 한 번에 전송)
        await prefs.setString('pending_bio', _bioController.text.trim());
        
        // 프로필 이미지가 있다면 경로를 임시 저장
        if (_profileImage != null) {
          await prefs.setString('pending_profile_image_path', _profileImage!.path);
          print('프로필 이미지 경로 임시 저장: ${_profileImage!.path}');
        }
        
        print('프로필 정보 임시 저장 완료 - nickname: ${_nicknameController.text}, bio: ${_bioController.text}');

        if (mounted) {
          // 로딩 다이얼로그 닫기
          Navigator.of(context).pop();
          
          // 시그니처 커넥션 페이지로 이동
          print('시그니처 커넥션 페이지로 이동');
          context.go('/onboarding/signature-connection');
        }
      } catch (e) {
        print('프로필 저장 오류: $e');
        if (mounted) {
          // 로딩 다이얼로그 닫기
          Navigator.of(context).pop();
          
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text('프로필 저장 중 오류가 발생했습니다: $e'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final canContinue = _isNicknameValid && 
                       _nicknameController.text.trim().isNotEmpty;

    return Scaffold(
      backgroundColor: AppColors.white,
      body: SafeArea(
        child: Column(
          children: [
            // 상단 진행 바
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '단계 3 / 5',
                    style: AppTextStyles.labelMedium.copyWith(
                      color: AppColors.textSecondary,
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  LinearProgressIndicator(
                    value: 3 / 5,
                    backgroundColor: AppColors.grey200,
                    valueColor: const AlwaysStoppedAnimation<Color>(
                      AppColors.primary,
                    ),
                  ),
                ],
              ),
            ),

            // 스크롤 가능한 콘텐츠
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(AppSpacing.lg),
                child: Form(
                  key: _formKey,
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // 타이틀
                      Text(
                        '프로필을 설정해주세요',
                        style: AppTextStyles.headlineMedium.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Text(
                        '나중에 언제든 변경할 수 있어요',
                        style: AppTextStyles.bodyMedium.copyWith(
                          color: AppColors.textSecondary,
                        ),
                      ),

                      const SizedBox(height: AppSpacing.xxl),

                      // 프로필 사진 영역
                      Center(
                        child: GestureDetector(
                          onTap: _pickImage,
                          child: Stack(
                            children: [
                              AnimatedBuilder(
                                animation: _profileImageAnimation,
                                builder: (context, child) {
                                  return Container(
                                    width: 120,
                                    height: 120,
                                    decoration: BoxDecoration(
                                      color: _profileImage != null
                                          ? Colors.transparent
                                          : AppColors.grey100,
                                      borderRadius: BorderRadius.circular(60),
                                      border: Border.all(
                                        color: AppColors.grey300,
                                        width: 2,
                                      ),
                                      image: _profileImage != null
                                          ? DecorationImage(
                                              image: FileImage(_profileImage!),
                                              fit: BoxFit.cover,
                                            )
                                          : null,
                                    ),
                                    child: _profileImage == null
                                        ? const Icon(
                                            Icons.camera_alt_outlined,
                                            size: 40,
                                            color: AppColors.grey500,
                                          )
                                        : null,
                                  );
                                },
                              ),
                              if (_profileImage != null)
                                Positioned(
                                  top: 0,
                                  right: 0,
                                  child: GestureDetector(
                                    onTap: _removeImage,
                                    child: Container(
                                      width: 32,
                                      height: 32,
                                      decoration: const BoxDecoration(
                                        color: AppColors.error,
                                        shape: BoxShape.circle,
                                      ),
                                      child: const Icon(
                                        Icons.close,
                                        size: 20,
                                        color: AppColors.white,
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                      
                      const SizedBox(height: AppSpacing.sm),
                      
                      Center(
                        child: Text(
                          '탭하여 프로필 사진 추가 (선택사항)',
                          style: AppTextStyles.bodySmall.copyWith(
                            color: AppColors.textSecondary,
                          ),
                        ),
                      ),

                      const SizedBox(height: AppSpacing.xxl),

                      // 닉네임 표시 (읽기 전용)
                      Text(
                        '닉네임',
                        style: AppTextStyles.titleMedium.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.md,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.grey100,
                          borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                          border: Border.all(
                            color: AppColors.grey300,
                            width: 1,
                          ),
                        ),
                        child: Row(
                          children: [
                            const Icon(
                              Icons.lock_outline,
                              size: 20,
                              color: AppColors.grey500,
                            ),
                            const SizedBox(width: AppSpacing.sm),
                            Expanded(
                              child: Text(
                                _nicknameController.text.isEmpty 
                                    ? '닉네임을 불러오는 중...' 
                                    : _nicknameController.text,
                                style: AppTextStyles.bodyLarge.copyWith(
                                  color: _nicknameController.text.isEmpty 
                                      ? AppColors.grey500 
                                      : AppColors.textPrimary,
                                ),
                              ),
                            ),
                            const Icon(
                              Icons.check_circle,
                              size: 20,
                              color: AppColors.success,
                            ),
                          ],
                        ),
                      ),
                      const SizedBox(height: AppSpacing.xs),
                      Text(
                        '닉네임은 이전 단계에서 설정되었습니다',
                        style: AppTextStyles.bodySmall.copyWith(
                          color: AppColors.grey600,
                          fontWeight: FontWeight.w500,
                        ),
                      ),

                      const SizedBox(height: AppSpacing.xl),

                      // 한 줄 소개 (선택사항)
                      Text(
                        '한 줄 소개 (선택사항)',
                        style: AppTextStyles.titleMedium.copyWith(
                          fontWeight: FontWeight.w600,
                          color: AppColors.textPrimary,
                        ),
                      ),
                      const SizedBox(height: AppSpacing.sm),
                      TextFormField(
                        controller: _bioController,
                        maxLength: 50,
                        style: TextStyle(
                          color: AppColors.textPrimary,
                          fontSize: 16,
                        ),
                        decoration: InputDecoration(
                          hintText: '나를 한 줄로 표현한다면?',
                          hintStyle: TextStyle(
                            color: AppColors.textSecondary,
                          ),
                          filled: true,
                          fillColor: AppColors.grey50,
                          border: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                            borderSide: BorderSide(color: AppColors.grey300),
                          ),
                          enabledBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                            borderSide: BorderSide(color: AppColors.grey300),
                          ),
                          focusedBorder: OutlineInputBorder(
                            borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                            borderSide: BorderSide(color: AppColors.primary, width: 2),
                          ),
                          contentPadding: const EdgeInsets.all(AppSpacing.md),
                        ),
                      ),

                      const SizedBox(height: AppSpacing.xxl),
                    ],
                  ),
                ),
              ),
            ),

            // 하단 버튼
            Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: canContinue ? _continueSetup : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: canContinue ? AppColors.primary : AppColors.grey300,
                    foregroundColor: Colors.white,
                    elevation: canContinue ? 4 : 0,
                    shadowColor: canContinue ? AppColors.primary.withOpacity(0.3) : null,
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
            ),
          ],
        ),
      ),
    );
  }
}

class _ImagePickerOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final VoidCallback onTap;

  const _ImagePickerOption({
    required this.icon,
    required this.label,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(40),
            ),
            child: Icon(
              icon,
              size: 32,
              color: AppColors.primary,
            ),
          ),
          const SizedBox(height: AppSpacing.sm),
          Text(
            label,
            style: AppTextStyles.bodyMedium.copyWith(
              fontWeight: FontWeight.w500,
              color: AppColors.textPrimary,
            ),
          ),
        ],
      ),
    );
  }
}