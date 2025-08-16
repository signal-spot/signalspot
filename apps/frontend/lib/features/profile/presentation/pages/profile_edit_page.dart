import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/api/api_client.dart';
import '../../../../shared/providers/profile_provider.dart';
import '../../../../shared/models/index.dart';
import '../../../../shared/services/profile_service.dart';

// 프로필 편집용 로컬 상태 관리 - 실제 프로필 데이터 기반
final profileEditStateProvider = StateProvider<Map<String, dynamic>>((ref) {
  return {
    'displayName': '',
    'bio': '',
    'location': '',
    'interests': <String>[],
  };
});

class ProfileEditPage extends ConsumerStatefulWidget {
  const ProfileEditPage({super.key});

  @override
  ConsumerState<ProfileEditPage> createState() => _ProfileEditPageState();
}

class _ProfileEditPageState extends ConsumerState<ProfileEditPage> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nicknameController;
  late TextEditingController _bioController;
  
  // 시그니처 커넥션 컨트롤러들
  late TextEditingController _mbtiController;
  late TextEditingController _memorablePlaceController;
  late TextEditingController _childhoodMemoryController;
  late TextEditingController _turningPointController;
  late TextEditingController _proudestMomentController;
  late TextEditingController _bucketListController;
  late TextEditingController _lifeLessonController;
  
  String? _selectedMbti;

  final List<String> _availableInterests = [
    '영화감상', '음악감상', '독서', '운동', '요리', '여행',
    '사진촬영', '게임', '쇼핑', '카페탐방', '전시관람', '공연관람',
    '스포츠관람', '드라이브', '등산', '수영', '요가', '댄스',
    '그림그리기', '악기연주', '봉사활동', '언어학습'
  ];
  
  final List<String> _mbtiTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP',
  ];

  bool _isLoading = false;
  String? _currentAvatarUrl;
  File? _selectedImage; // 선택된 이미지 파일 (아직 업로드 전)

  @override
  void initState() {
    super.initState();
    
    _nicknameController = TextEditingController();
    _bioController = TextEditingController();
    
    // 시그니처 커넥션 컨트롤러 초기화
    _mbtiController = TextEditingController();
    _memorablePlaceController = TextEditingController();
    _childhoodMemoryController = TextEditingController();
    _turningPointController = TextEditingController();
    _proudestMomentController = TextEditingController();
    _bucketListController = TextEditingController();
    _lifeLessonController = TextEditingController();
    
    // 실제 프로필 데이터로 폼 초기화
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final profileState = ref.read(myProfileProvider);
      profileState.whenData((profile) {
        _nicknameController.text = profile.displayName ?? '';
        _bioController.text = profile.bio ?? '';
        _currentAvatarUrl = profile.avatarUrl;

        // 편집 상태 업데이트
        ref.read(profileEditStateProvider.notifier).state = {
          'displayName': profile.displayName ?? '',
          'bio': profile.bio ?? '',
          'location': profile.location ?? '',
          'interests': profile.interests ?? <String>[],
          'avatarUrl': profile.avatarUrl,
        };
      });
      
      // 시그니처 커넥션 데이터 로드
      final signaturePrefs = ref.read(signatureConnectionPreferencesProvider);
      signaturePrefs.whenData((prefs) {
        if (prefs != null) {
          _selectedMbti = prefs.mbti;
          _mbtiController.text = prefs.mbti ?? '';
          _memorablePlaceController.text = prefs.memorablePlace ?? '';
          _childhoodMemoryController.text = prefs.childhoodMemory ?? '';
          _turningPointController.text = prefs.turningPoint ?? '';
          _proudestMomentController.text = prefs.proudestMoment ?? '';
          _bucketListController.text = prefs.bucketList ?? '';
          _lifeLessonController.text = prefs.lifeLesson ?? '';
          
          // 관심사 업데이트
          if (prefs.interests != null) {
            final currentState = ref.read(profileEditStateProvider);
            ref.read(profileEditStateProvider.notifier).state = {
              ...currentState,
              'interests': prefs.interests!,
            };
          }
        }
      });
    });
  }

  @override
  void dispose() {
    _nicknameController.dispose();
    _bioController.dispose();
    _mbtiController.dispose();
    _memorablePlaceController.dispose();
    _childhoodMemoryController.dispose();
    _turningPointController.dispose();
    _proudestMomentController.dispose();
    _bucketListController.dispose();
    _lifeLessonController.dispose();
    super.dispose();
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isLoading = true);

    try {
      // 햅틱 피드백
      HapticFeedback.mediumImpact();

      // 현재 편집 상태에서 관심사 가져오기
      final currentEditState = ref.read(profileEditStateProvider);
      final selectedInterests = List<String>.from(currentEditState['interests'] ?? <String>[]);

      // 프로필과 시그니처 커넥션을 한번에 업데이트
      // 백엔드 PUT /profile/me 엔드포인트로 전송
      final profileData = {
        // 기본 프로필 필드
        'username': _nicknameController.text.trim().isEmpty ? null : _nicknameController.text.trim(),
        'bio': _bioController.text.trim().isEmpty ? null : _bioController.text.trim(),
        
        // 시그니처 커넥션 필드
        'mbti': _selectedMbti,
        'interests': selectedInterests.isEmpty ? null : selectedInterests,
        'memorablePlace': _memorablePlaceController.text.trim().isEmpty ? null : _memorablePlaceController.text.trim(),
        'childhoodMemory': _childhoodMemoryController.text.trim().isEmpty ? null : _childhoodMemoryController.text.trim(),
        'turningPoint': _turningPointController.text.trim().isEmpty ? null : _turningPointController.text.trim(),
        'proudestMoment': _proudestMomentController.text.trim().isEmpty ? null : _proudestMomentController.text.trim(),
        'bucketList': _bucketListController.text.trim().isEmpty ? null : _bucketListController.text.trim(),
        'lifeLesson': _lifeLessonController.text.trim().isEmpty ? null : _lifeLessonController.text.trim(),
      };

      // 직접 API 호출
      final apiClient = ApiClient();
      final response = await apiClient.dio.put('/profile/me', data: profileData);
      
      // 프로필 데이터 새로고침
      await ref.read(myProfileProvider.notifier).loadProfile();
      await ref.read(signatureConnectionPreferencesProvider.notifier).loadPreferences();

      if (mounted) {
        // 성공 피드백
        HapticFeedback.heavyImpact();
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white),
                const SizedBox(width: 8),
                const Text('프로필이 저장되었습니다!'),
              ],
            ),
            backgroundColor: AppColors.success,
            duration: const Duration(seconds: 2),
          ),
        );

        Navigator.of(context).pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('저장 중 오류가 발생했습니다: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.white,
      appBar: AppBar(
        title: Text(
          '프로필 편집',
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
          TextButton(
            onPressed: _isLoading ? null : _saveProfile,
            child: _isLoading
                ? const SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                    ),
                  )
                : Text(
                    '저장',
                    style: AppTextStyles.titleSmall.copyWith(
                      color: AppColors.white,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(AppSpacing.lg),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // 프로필 사진 영역
              Center(
                child: Stack(
                  children: [
                    Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        gradient: _currentAvatarUrl == null || _currentAvatarUrl!.isEmpty
                            ? LinearGradient(
                                colors: [
                                  AppColors.primary.withOpacity(0.8),
                                  AppColors.secondary.withOpacity(0.8),
                                ],
                              )
                            : null,
                        borderRadius: BorderRadius.circular(60),
                        border: Border.all(
                          color: AppColors.white,
                          width: 4,
                        ),
                        boxShadow: [
                          BoxShadow(
                            color: AppColors.black.withOpacity(0.1),
                            blurRadius: 10,
                            offset: const Offset(0, 4),
                          ),
                        ],
                      ),
                      child: ClipOval(
                        child: _selectedImage != null
                            ? Image.file(
                                _selectedImage!,
                                width: 120,
                                height: 120,
                                fit: BoxFit.cover,
                              )
                            : _currentAvatarUrl != null && _currentAvatarUrl!.isNotEmpty
                                ? Image.network(
                                    _currentAvatarUrl!,
                                    width: 120,
                                    height: 120,
                                    fit: BoxFit.cover,
                                    errorBuilder: (context, error, stackTrace) => const Icon(
                                      Icons.person,
                                      size: 60,
                                      color: AppColors.white,
                                    ),
                                  )
                                : const Icon(
                                    Icons.person,
                                    size: 60,
                                    color: AppColors.white,
                                  ),
                      ),
                    ),
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: GestureDetector(
                        onTap: () {
                          _showImagePickerOptions();
                        },
                        child: Container(
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: AppColors.primary,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(
                              color: AppColors.white,
                              width: 2,
                            ),
                          ),
                          child: const Icon(
                            Icons.camera_alt,
                            color: AppColors.white,
                            size: 20,
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: AppSpacing.xxl),

              // 기본 정보 섹션
              _SectionHeader(title: '기본 정보', textColor: AppColors.textPrimary),
              const SizedBox(height: AppSpacing.md),

              _FormField(
                label: '닉네임',
                controller: _nicknameController,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return '닉네임을 입력해주세요';
                  }
                  if (value.trim().length < 2) {
                    return '닉네임은 2글자 이상이어야 합니다';
                  }
                  return null;
                },
              ),

              const SizedBox(height: AppSpacing.md),

              _FormField(
                label: '한줄소개',
                controller: _bioController,
                maxLines: 3,
                maxLength: 100,
                hintText: '자신을 소개하는 한줄을 작성해보세요',
              ),

              const SizedBox(height: AppSpacing.md),


              const SizedBox(height: AppSpacing.xxl),

              // 관심사 섹션
              _SectionHeader(title: '관심사', textColor: AppColors.textPrimary),
              const SizedBox(height: AppSpacing.sm),
              Text(
                '관심 있는 분야를 선택해주세요 (최대 8개)',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.grey600,
                ),
              ),
              const SizedBox(height: AppSpacing.md),

              Consumer(
                builder: (context, ref, child) {
                  final currentEditState = ref.watch(profileEditStateProvider);
                  final selectedInterests = List<String>.from(currentEditState['interests'] ?? <String>[]);
                  
                  return Wrap(
                    spacing: AppSpacing.sm,
                    runSpacing: AppSpacing.sm,
                    children: _availableInterests.map((interest) {
                      final isSelected = selectedInterests.contains(interest);
                  return GestureDetector(
                    onTap: () {
                      _toggleInterest(interest);
                    },
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: AppSpacing.md,
                        vertical: AppSpacing.sm,
                      ),
                      decoration: BoxDecoration(
                        color: isSelected
                            ? AppColors.primary
                            : AppColors.grey100,
                        borderRadius: BorderRadius.circular(AppSpacing.borderRadiusXl),
                        border: isSelected
                            ? null
                            : Border.all(color: AppColors.grey300),
                      ),
                      child: Text(
                        interest,
                        style: AppTextStyles.labelMedium.copyWith(
                          color: isSelected
                              ? AppColors.white
                              : AppColors.grey700,
                          fontWeight: isSelected
                              ? FontWeight.w600
                              : FontWeight.w400,
                        ),
                      ),
                    ),
                  );
                    }).toList(),
                  );
                },
              ),

              const SizedBox(height: AppSpacing.xxl),
              
              // 시그니처 커넥션 섹션
              _SectionHeader(title: '시그니처 커넥션', textColor: AppColors.textPrimary),
              const SizedBox(height: AppSpacing.md),
              
              // MBTI 선택
              Container(
                padding: const EdgeInsets.all(AppSpacing.md),
                decoration: BoxDecoration(
                  color: AppColors.grey50,
                  borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                  border: Border.all(color: AppColors.grey200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'MBTI',
                      style: AppTextStyles.titleSmall.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                    const SizedBox(height: AppSpacing.sm),
                    DropdownButtonFormField<String>(
                      value: _selectedMbti,
                      decoration: InputDecoration(
                        hintText: 'MBTI를 선택해주세요',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(AppSpacing.borderRadiusMd),
                        ),
                      ),
                      items: _mbtiTypes.map((mbti) {
                        return DropdownMenuItem(
                          value: mbti,
                          child: Text(mbti),
                        );
                      }).toList(),
                      onChanged: (value) {
                        setState(() {
                          _selectedMbti = value;
                        });
                      },
                    ),
                  ],
                ),
              ),
              
              const SizedBox(height: AppSpacing.lg),
              
              // 개인 이야기 섹션
              _SectionHeader(title: '나의 이야기', textColor: AppColors.textPrimary),
              const SizedBox(height: AppSpacing.sm),
              Text(
                '당신만의 특별한 이야기를 들려주세요',
                style: AppTextStyles.bodySmall.copyWith(
                  color: AppColors.grey600,
                ),
              ),
              const SizedBox(height: AppSpacing.md),
              
              _FormField(
                label: '📍 기억에 남는 장소',
                controller: _memorablePlaceController,
                hintText: '특별한 추억이 있는 장소를 알려주세요',
                maxLines: 2,
              ),
              
              const SizedBox(height: AppSpacing.md),
              
              _FormField(
                label: '🧸 어린 시절 추억',
                controller: _childhoodMemoryController,
                hintText: '가장 기억에 남는 어린 시절 추억은?',
                maxLines: 2,
              ),
              
              const SizedBox(height: AppSpacing.md),
              
              _FormField(
                label: '🔄 인생의 터닝포인트',
                controller: _turningPointController,
                hintText: '당신의 삶을 바꾼 순간이 있다면?',
                maxLines: 2,
              ),
              
              const SizedBox(height: AppSpacing.md),
              
              _FormField(
                label: '🏆 가장 자랑스러운 순간',
                controller: _proudestMomentController,
                hintText: '가장 자랑스러웠던 순간을 공유해주세요',
                maxLines: 2,
              ),
              
              const SizedBox(height: AppSpacing.md),
              
              _FormField(
                label: '🎯 버킷리스트',
                controller: _bucketListController,
                hintText: '꼭 이루고 싶은 목표나 꿈이 있나요?',
                maxLines: 2,
              ),
              
              const SizedBox(height: AppSpacing.md),
              
              _FormField(
                label: '💡 인생의 교훈',
                controller: _lifeLessonController,
                hintText: '삶에서 배운 가장 중요한 교훈은?',
                maxLines: 2,
              ),

              const SizedBox(height: AppSpacing.xxl),

              // 저장 버튼
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _saveProfile,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: AppSpacing.lg),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(AppSpacing.borderRadiusLg),
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
                                valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                              ),
                            ),
                            const SizedBox(width: AppSpacing.md),
                            Text(
                              '저장 중...',
                              style: AppTextStyles.titleMedium.copyWith(
                                color: Colors.white,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        )
                      : Text(
                          '프로필 저장',
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
    );
  }

  void _toggleInterest(String interest) {
    final currentEditState = ref.read(profileEditStateProvider);
    final currentInterests = List<String>.from(currentEditState['interests'] ?? <String>[]);

    if (currentInterests.contains(interest)) {
      currentInterests.remove(interest);
    } else {
      if (currentInterests.length < 8) {
        currentInterests.add(interest);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('관심사는 최대 8개까지 선택할 수 있습니다'),
          ),
        );
        return;
      }
    }

    // 편집 상태 업데이트
    final currentState = ref.read(profileEditStateProvider);
    ref.read(profileEditStateProvider.notifier).state = {
      ...currentState,
      'interests': currentInterests,
    };

    // 햅틱 피드백
    HapticFeedback.lightImpact();
  }

  void _showImagePickerOptions() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('프로필 사진 변경'),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.photo_camera),
              title: const Text('카메라로 촬영'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.camera);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('갤러리에서 선택'),
              onTap: () {
                Navigator.pop(context);
                _pickImage(ImageSource.gallery);
              },
            ),
            if (_currentAvatarUrl != null && _currentAvatarUrl!.isNotEmpty)
              ListTile(
                leading: const Icon(Icons.delete_outline),
                title: const Text('프로필 사진 삭제'),
                onTap: () {
                  Navigator.pop(context);
                  _removeAvatar();
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
  
  Future<void> _pickImage(ImageSource source) async {
    try {
      final ImagePicker picker = ImagePicker();
      final XFile? image = await picker.pickImage(
        source: source,
        imageQuality: 80, // 이미지 품질 설정 (0-100)
        maxWidth: 1024, // 최대 너비 제한
        maxHeight: 1024, // 최대 높이 제한
      );
      
      if (image != null) {
        setState(() => _isLoading = true);
        
        try {
          // ProfileService를 통해 아바타 업로드
          final profileService = ref.read(profileServiceProvider);
          final updatedProfile = await profileService.uploadAvatar(image.path);
          
          // 성공 시 UI 업데이트
          setState(() {
            _currentAvatarUrl = updatedProfile.avatarUrl;
            _isLoading = false;
          });
          
          // 프로필 새로고침
          await ref.read(myProfileProvider.notifier).loadProfile();
          
          // 성공 피드백
          HapticFeedback.mediumImpact();
          
          if (mounted) {
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Row(
                  children: [
                    const Icon(Icons.check_circle, color: Colors.white),
                    const SizedBox(width: 8),
                    const Text('프로필 사진이 업데이트되었습니다!'),
                  ],
                ),
                backgroundColor: AppColors.success,
                duration: const Duration(seconds: 2),
              ),
            );
          }
        } catch (e) {
          if (mounted) {
            setState(() => _isLoading = false);
            ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                content: Text('사진 업로드 실패: $e'),
                backgroundColor: AppColors.error,
              ),
            );
          }
        }
      }
    } catch (e) {
      print('Error picking image: $e');
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('이미지 선택 중 오류가 발생했습니다'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }
  
  Future<void> _removeAvatar() async {
    try {
      setState(() => _isLoading = true);
      
      // ProfileService를 통해 아바타 삭제
      final profileService = ref.read(profileServiceProvider);
      final updatedProfile = await profileService.removeAvatar();
      
      // 성공 시 UI 업데이트
      setState(() {
        _currentAvatarUrl = null;
        _isLoading = false;
      });
      
      // 프로필 새로고침
      await ref.read(myProfileProvider.notifier).loadProfile();
      
      // 성공 피드백
      HapticFeedback.mediumImpact();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Row(
              children: [
                const Icon(Icons.check_circle, color: Colors.white),
                const SizedBox(width: 8),
                const Text('프로필 사진이 삭제되었습니다'),
              ],
            ),
            backgroundColor: AppColors.success,
            duration: const Duration(seconds: 2),
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        setState(() => _isLoading = false);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('사진 삭제 실패: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

}

class _SectionHeader extends StatelessWidget {
  final String title;
  final Color? textColor;

  const _SectionHeader({required this.title, this.textColor});

  @override
  Widget build(BuildContext context) {
    return Text(
      title,
      style: AppTextStyles.titleLarge.copyWith(
        fontWeight: FontWeight.w600,
        color: textColor ?? AppColors.textPrimary,
      ),
    );
  }
}

class _FormField extends StatelessWidget {
  final String label;
  final TextEditingController controller;
  final String? hintText;
  final int maxLines;
  final int? maxLength;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;
  final String? Function(String?)? validator;
  final Widget? suffixIcon;

  const _FormField({
    required this.label,
    required this.controller,
    this.hintText,
    this.maxLines = 1,
    this.maxLength,
    this.keyboardType,
    this.inputFormatters,
    this.validator,
    this.suffixIcon,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: AppTextStyles.titleSmall.copyWith(
            fontWeight: FontWeight.w600,
            color: AppColors.textPrimary,
          ),
        ),
        const SizedBox(height: AppSpacing.sm),
        TextFormField(
          controller: controller,
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 16,
          ),
          decoration: InputDecoration(
            hintText: hintText,
            hintStyle: TextStyle(
              color: AppColors.textSecondary,
            ),
            suffixIcon: suffixIcon,
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
          maxLines: maxLines,
          maxLength: maxLength,
          keyboardType: keyboardType,
          inputFormatters: inputFormatters,
          validator: validator,
        ),
      ],
    );
  }
}



