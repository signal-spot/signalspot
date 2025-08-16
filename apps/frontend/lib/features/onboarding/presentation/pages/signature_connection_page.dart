import 'dart:io';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:dio/dio.dart';
import 'package:http_parser/http_parser.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../core/api/api_client.dart';
import '../../../../shared/providers/signature_connection_provider.dart';
import '../../../../shared/models/signature_connection.dart';
import '../../../auth/presentation/providers/auth_provider.dart';

class SignatureConnectionPage extends ConsumerStatefulWidget {
  const SignatureConnectionPage({super.key});

  @override
  ConsumerState<SignatureConnectionPage> createState() => _SignatureConnectionPageState();
}

class _SignatureConnectionPageState extends ConsumerState<SignatureConnectionPage> 
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  
  // 기본 정보
  String? _selectedMBTI;
  final List<String> _selectedInterests = [];
  
  // 개인 이야기
  String? _memorablePlace;      // 가장 기억에 남는 장소
  String? _childhoodMemory;     // 어린 시절 추억
  String? _turningPoint;        // 인생의 터닝포인트
  String? _proudestMoment;      // 가장 자랑스러웠던 순간
  String? _bucketList;          // 버킷리스트
  String? _lifeLesson;          // 인생에서 배운 교훈

  // 관심사 태그
  final List<String> _interestTags = [
    '영화감상', '음악감상', '독서', '운동', '요리', '여행',
    '사진촬영', '게임', '카페탐방', '맛집탐방', '전시관람', '공연관람',
    '반려동물', '등산', '요가', '와인', '미술', '쇼핑',
    '명상', '드라이브', '캠핑', '서핑', '스케이트보드', '자전거',
  ];
  
  // MBTI 옵션
  final List<String> _mbtiTypes = [
    'INTJ', 'INTP', 'ENTJ', 'ENTP',
    'INFJ', 'INFP', 'ENFJ', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
    'ISTP', 'ISFP', 'ESTP', 'ESFP',
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _toggleInterest(String interest) {
    setState(() {
      if (_selectedInterests.contains(interest)) {
        _selectedInterests.remove(interest);
      } else if (_selectedInterests.length < 10) {
        _selectedInterests.add(interest);
      }
    });
  }

  Future<void> _skipSignatureConnection() async {
    try {
      // 로딩 표시
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(),
        ),
      );

      final apiClient = ApiClient();
      final prefs = await SharedPreferences.getInstance();
      
      // SharedPreferences에서 저장된 데이터 가져오기
      final nickname = prefs.getString('pending_nickname') ?? '';
      final bio = prefs.getString('pending_bio') ?? '';
      final profileImagePath = prefs.getString('pending_profile_image_path');
      
      print('시그니처 커넥션 건너뛰기 - 기본 프로필만 저장');
      print('Nickname: $nickname');
      print('Bio: $bio');
      print('Profile Image Path: $profileImagePath');
      
      // 프로필 이미지가 있다면 먼저 업로드 (이미 DB에 저장됨)
      if (profileImagePath != null && File(profileImagePath).existsSync()) {
        try {
          // 파일 확장자에 따라 MIME 타입 결정
          String contentType = 'image/jpeg';
          String extension = profileImagePath.toLowerCase();
          if (extension.endsWith('.png')) {
            contentType = 'image/png';
          } else if (extension.endsWith('.gif')) {
            contentType = 'image/gif';
          } else if (extension.endsWith('.webp')) {
            contentType = 'image/webp';
          }
          
          final formData = FormData.fromMap({
            'avatar': await MultipartFile.fromFile(
              profileImagePath,
              filename: 'profile_${DateTime.now().millisecondsSinceEpoch}.jpg',
              contentType: MediaType.parse(contentType),
            ),
          });
          
          // 이미지 업로드 - 백엔드에서 자동으로 avatarUrl 저장
          final uploadResponse = await apiClient.dio.post('/profile/avatar', data: formData);
          print('프로필 이미지 업로드 및 저장 완료');
        } catch (e) {
          print('프로필 이미지 업로드 실패: $e');
          // 이미지 업로드 실패해도 계속 진행
        }
      }
      
      // 프로필 설정 API 호출 (시그니처 커넥션은 건너뛰기, avatarUrl은 이미 저장됨)
      final profileData = <String, dynamic>{
        'username': nickname,
        'displayName': nickname,
      };
      
      if (bio.isNotEmpty) {
        profileData['bio'] = bio;
      }
      
      // avatarUrl은 이미 /profile/avatar에서 저장했으므로 전송하지 않음
      
      final profileResponse = await apiClient.post('/profile/setup', data: profileData);
      
      if (mounted) {
        // 로딩 다이얼로그 닫기
        Navigator.of(context).pop();
        
        if (profileResponse.data['success'] == true) {
          // SharedPreferences에서 임시 데이터 삭제
          await prefs.remove('pending_nickname');
          await prefs.remove('pending_bio');
          await prefs.remove('pending_profile_image_path');
          
          print('프로필 설정 완료 (시그니처 커넥션은 건너뜀)');
          
          // AuthProvider 업데이트 - 프로필 완료 상태를 true로 설정
          ref.read(authProvider.notifier).updateUserInfo({
            'username': nickname,
            'profileCompleted': true,
          });
          
          // 온보딩 완료 페이지로 이동
          context.go('/onboarding/complete');
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(profileResponse.data['message'] ?? '프로필 저장에 실패했습니다'),
              backgroundColor: AppColors.error,
            ),
          );
        }
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

  Future<void> _continueSetup() async {
    try {
      // 로딩 표시
      showDialog(
        context: context,
        barrierDismissible: false,
        builder: (context) => const Center(
          child: CircularProgressIndicator(),
        ),
      );

      final apiClient = ApiClient();
      final prefs = await SharedPreferences.getInstance();
      
      // SharedPreferences에서 저장된 데이터 가져오기
      final nickname = prefs.getString('pending_nickname') ?? '';
      final bio = prefs.getString('pending_bio') ?? '';
      final profileImagePath = prefs.getString('pending_profile_image_path');
      
      print('온보딩 완료 - 모든 데이터 전송');
      print('Nickname: $nickname');
      print('Bio: $bio');
      print('Profile Image Path: $profileImagePath');
      print('MBTI: $_selectedMBTI');
      print('Interests: $_selectedInterests');
      
      // 프로필 이미지가 있다면 먼저 업로드 (이미 DB에 저장됨)
      if (profileImagePath != null && File(profileImagePath).existsSync()) {
        try {
          // 파일 확장자에 따라 MIME 타입 결정
          String contentType = 'image/jpeg';
          String extension = profileImagePath.toLowerCase();
          if (extension.endsWith('.png')) {
            contentType = 'image/png';
          } else if (extension.endsWith('.gif')) {
            contentType = 'image/gif';
          } else if (extension.endsWith('.webp')) {
            contentType = 'image/webp';
          }
          
          final formData = FormData.fromMap({
            'avatar': await MultipartFile.fromFile(
              profileImagePath,
              filename: 'profile_${DateTime.now().millisecondsSinceEpoch}.jpg',
              contentType: MediaType.parse(contentType),
            ),
          });
          
          // 이미지 업로드 - 백엔드에서 자동으로 avatarUrl 저장
          final uploadResponse = await apiClient.dio.post('/profile/avatar', data: formData);
          print('프로필 이미지 업로드 및 저장 완료');
        } catch (e) {
          print('프로필 이미지 업로드 실패: $e');
          // 이미지 업로드 실패해도 계속 진행
        }
      }
      
      // 1단계: 프로필 설정 API 호출 (avatarUrl은 이미 저장됨)
      final profileResponse = await apiClient.post('/profile/setup', data: {
        'username': nickname,
        'displayName': nickname,
        'bio': bio.isNotEmpty ? bio : null,
      });
      
      if (profileResponse.data['success'] != true) {
        throw Exception(profileResponse.data['message'] ?? '프로필 설정 실패');
      }
      
      print('프로필 설정 완료');
      
      // 2단계: 시그니처 커넥션 설정 API 호출
      final signatureResponse = await apiClient.post('/profile/signature-connection/preferences', data: {
        'mbti': _selectedMBTI,
        'interests': _selectedInterests,
        'memorablePlace': _memorablePlace,
        'childhoodMemory': _childhoodMemory,
        'turningPoint': _turningPoint,
        'proudestMoment': _proudestMoment,
        'bucketList': _bucketList,
        'lifeLesson': _lifeLesson,
      });

      if (mounted) {
        // 로딩 다이얼로그 닫기
        Navigator.of(context).pop();
        
        if (signatureResponse.data['success'] == true) {
          // SharedPreferences에서 임시 데이터 삭제
          await prefs.remove('pending_nickname');
          await prefs.remove('pending_bio');
          await prefs.remove('pending_profile_image_path');
          
          print('시그니처 커넥션 설정 완료');
          
          // AuthProvider 업데이트 - 프로필 완료 상태를 true로 설정
          ref.read(authProvider.notifier).updateUserInfo({
            'username': nickname,
            'profileCompleted': true,
          });
          
          // 온보딩 완료 페이지로 이동
          context.go('/onboarding/complete');
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
              content: Text(signatureResponse.data['message'] ?? '설정 저장에 실패했습니다'),
              backgroundColor: AppColors.error,
            ),
          );
        }
      }
    } catch (e) {
      print('시그니처 커넥션 설정 오류: $e');
      if (mounted) {
        // 로딩 다이얼로그 닫기
        Navigator.of(context).pop();
        
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('저장 중 오류가 발생했습니다: $e'),
            backgroundColor: AppColors.error,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    // 최소 하나는 입력해야 계속 진행 가능
    final canContinue = _selectedMBTI != null ||
                       _selectedInterests.isNotEmpty ||
                       _memorablePlace != null ||
                       _childhoodMemory != null ||
                       _turningPoint != null ||
                       _proudestMoment != null ||
                       _bucketList != null ||
                       _lifeLesson != null;

    return Scaffold(
      backgroundColor: AppColors.surface,
      body: SafeArea(
        child: Column(
          children: [
            // 상단 헤더
            Container(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        '시그니처 커넥션',
                        style: AppTextStyles.headlineMedium.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: AppSpacing.md,
                          vertical: AppSpacing.xs,
                        ),
                        decoration: BoxDecoration(
                          color: AppColors.primary.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          '선택사항',
                          style: AppTextStyles.labelMedium.copyWith(
                            color: AppColors.primary,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  Text(
                    '당신만의 특별한 취향을 알려주세요!\n같은 취향을 가진 사람과 더 강한 스파크가 일어나요 ✨',
                    style: AppTextStyles.bodyMedium.copyWith(
                      color: AppColors.grey600,
                      height: 1.4,
                    ),
                  ),
                ],
              ),
            ),

            // 탭바
            Container(
              margin: const EdgeInsets.symmetric(horizontal: AppSpacing.lg),
              decoration: BoxDecoration(
                color: AppColors.grey100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: TabBar(
                controller: _tabController,
                indicator: BoxDecoration(
                  color: AppColors.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                labelColor: AppColors.white,
                unselectedLabelColor: AppColors.grey600,
                labelStyle: AppTextStyles.labelLarge,
                tabs: const [
                  Tab(text: 'MBTI'),
                  Tab(text: '개인 이야기'),
                  Tab(text: '관심사'),
                ],
              ),
            ),

            // 탭 콘텐츠
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  // MBTI 탭
                  _buildMBTI(),
                  
                  // 개인 이야기 탭
                  _buildPersonalStory(),
                  
                  // 관심사 탭
                  _buildInterests(),
                ],
              ),
            ),

            // 하단 버튼
            Padding(
              padding: const EdgeInsets.all(AppSpacing.lg),
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton(
                      onPressed: canContinue ? _continueSetup : null,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(vertical: AppSpacing.md),
                      ),
                      child: Text(canContinue ? '다음' : '최소 하나는 선택해주세요'),
                    ),
                  ),
                  const SizedBox(height: AppSpacing.sm),
                  TextButton(
                    onPressed: _skipSignatureConnection,
                    child: const Text('건너뛰기'),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMBTI() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(
            icon: Icons.psychology,
            title: 'MBTI',
            subtitle: '당신의 성격 유형을 선택해주세요',
          ),
          const SizedBox(height: AppSpacing.md),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              childAspectRatio: 2.5,
              crossAxisSpacing: 8,
              mainAxisSpacing: 8,
            ),
            itemCount: _mbtiTypes.length,
            itemBuilder: (context, index) {
              final mbti = _mbtiTypes[index];
              final isSelected = _selectedMBTI == mbti;
              
              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedMBTI = isSelected ? null : mbti;
                  });
                },
                child: Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.xs,
                    vertical: AppSpacing.xs,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected ? AppColors.primary : AppColors.grey100,
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: isSelected ? AppColors.primary : AppColors.grey300,
                    ),
                  ),
                  child: Center(
                    child: Text(
                      mbti,
                      style: AppTextStyles.labelMedium.copyWith(
                        color: isSelected ? AppColors.white : AppColors.grey700,
                        fontWeight: isSelected ? FontWeight.w600 : FontWeight.w400,
                      ),
                    ),
                  ),
                ),
              );
            },
          ),
          
          const SizedBox(height: AppSpacing.xl),
          
          // MBTI 설명
          Container(
            padding: const EdgeInsets.all(AppSpacing.md),
            decoration: BoxDecoration(
              color: AppColors.grey50,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.grey200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(Icons.info_outline, size: 16, color: AppColors.grey600),
                    const SizedBox(width: AppSpacing.xs),
                    Text(
                      'MBTI란?',
                      style: AppTextStyles.bodySmall.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.xs),
                Text(
                  '성격 유형을 16가지로 분류한 지표입니다.\n같은 MBTI를 가진 사람과 더 잘 통할 수 있어요!',
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
    );
  }

  Widget _buildPersonalStory() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 가장 기억에 남는 장소
          _buildTextQuestion(
            icon: Icons.place,
            title: '가장 기억에 남는 장소는?',
            subtitle: '특별한 추억이 있는 장소를 알려주세요',
            hintText: '예: 처음 혼자 여행 갔던 제주도의 작은 카페',
            value: _memorablePlace,
            onChanged: (value) => setState(() => _memorablePlace = value),
          ),

          const SizedBox(height: AppSpacing.xl),

          // 어린 시절 추억
          _buildTextQuestion(
            icon: Icons.child_care,
            title: '어린 시절 가장 소중한 추억은?',
            subtitle: '따뜻한 어린 시절의 기억을 공유해주세요',
            hintText: '예: 할머니와 함께 만들던 송편',
            value: _childhoodMemory,
            onChanged: (value) => setState(() => _childhoodMemory = value),
          ),

          const SizedBox(height: AppSpacing.xl),

          // 인생의 터닝포인트
          _buildTextQuestion(
            icon: Icons.change_circle,
            title: '인생의 터닝포인트가 된 순간은?',
            subtitle: '당신을 변화시킨 특별한 순간을 알려주세요',
            hintText: '예: 처음으로 해외에서 일하게 된 날',
            value: _turningPoint,
            onChanged: (value) => setState(() => _turningPoint = value),
          ),

          const SizedBox(height: AppSpacing.xl),

          // 가장 자랑스러웠던 순간
          _buildTextQuestion(
            icon: Icons.emoji_events,
            title: '가장 자랑스러웠던 순간은?',
            subtitle: '성취감을 느꼈던 특별한 경험을 공유해주세요',
            hintText: '예: 마라톤 완주했을 때',
            value: _proudestMoment,
            onChanged: (value) => setState(() => _proudestMoment = value),
          ),

          const SizedBox(height: AppSpacing.xl),

          // 버킷리스트
          _buildTextQuestion(
            icon: Icons.checklist,
            title: '꼭 이루고 싶은 버킷리스트는?',
            subtitle: '언젠가 꼭 해보고 싶은 일을 알려주세요',
            hintText: '예: 오로라 보기, 책 출간하기',
            value: _bucketList,
            onChanged: (value) => setState(() => _bucketList = value),
          ),

          const SizedBox(height: AppSpacing.xl),

          // 인생에서 배운 교훈
          _buildTextQuestion(
            icon: Icons.school,
            title: '인생에서 배운 가장 중요한 교훈은?',
            subtitle: '삶을 통해 깨달은 지혜를 공유해주세요',
            hintText: '예: 실패도 성장의 일부라는 것',
            value: _lifeLesson,
            onChanged: (value) => setState(() => _lifeLesson = value),
          ),
        ],
      ),
    );
  }

  Widget _buildInterests() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionTitle(
            icon: Icons.interests,
            title: '관심사',
            subtitle: '최대 10개까지 선택 가능합니다',
          ),
          const SizedBox(height: AppSpacing.sm),
          
          Container(
            padding: const EdgeInsets.symmetric(
              horizontal: AppSpacing.md,
              vertical: AppSpacing.xs,
            ),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Text(
              '${_selectedInterests.length}/10개 선택됨',
              style: AppTextStyles.bodySmall.copyWith(
                color: AppColors.primary,
                fontWeight: FontWeight.w600,
              ),
            ),
          ),
          
          const SizedBox(height: AppSpacing.md),
          
          Wrap(
            spacing: AppSpacing.sm,
            runSpacing: AppSpacing.sm,
            children: _interestTags.map((interest) {
              final isSelected = _selectedInterests.contains(interest);
              final canSelect = _selectedInterests.length < 10;
              
              return GestureDetector(
                onTap: canSelect || isSelected 
                    ? () => _toggleInterest(interest)
                    : null,
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  padding: const EdgeInsets.symmetric(
                    horizontal: AppSpacing.md + 4,
                    vertical: AppSpacing.xs + 2,
                  ),
                  decoration: BoxDecoration(
                    color: isSelected
                        ? AppColors.primary
                        : canSelect
                            ? AppColors.grey100
                            : AppColors.grey200,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: isSelected
                          ? AppColors.primary
                          : AppColors.grey300,
                    ),
                  ),
                  child: Text(
                    interest,
                    style: AppTextStyles.labelMedium.copyWith(
                      color: isSelected
                          ? AppColors.white
                          : canSelect
                              ? AppColors.grey700
                              : AppColors.grey400,
                      fontWeight: isSelected
                          ? FontWeight.w600
                          : FontWeight.w400,
                    ),
                  ),
                ),
              );
            }).toList(),
          ),
        ],
      ),
    );
  }

  Widget _buildTextQuestion({
    required IconData icon,
    required String title,
    required String subtitle,
    required String hintText,
    required String? value,
    required Function(String) onChanged,
  }) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _SectionTitle(
          icon: icon,
          title: title,
          subtitle: subtitle,
        ),
        const SizedBox(height: AppSpacing.md),
        TextFormField(
          initialValue: value,
          onChanged: onChanged,
          maxLines: 3,
          decoration: InputDecoration(
            hintText: hintText,
            hintStyle: AppTextStyles.bodyMedium.copyWith(
              color: AppColors.grey400,
            ),
            filled: true,
            fillColor: AppColors.grey50,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: AppColors.grey300),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: AppColors.grey300),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: BorderSide(color: AppColors.primary, width: 2),
            ),
          ),
        ),
      ],
    );
  }
}

class _SectionTitle extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _SectionTitle({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(AppSpacing.xs),
          decoration: BoxDecoration(
            color: AppColors.primary.withOpacity(0.1),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(
            icon,
            color: AppColors.primary,
            size: 20,
          ),
        ),
        const SizedBox(width: AppSpacing.sm),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: AppTextStyles.titleMedium.copyWith(
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (subtitle.isNotEmpty)
                Text(
                  subtitle,
                  style: AppTextStyles.bodySmall.copyWith(
                    color: AppColors.grey500,
                  ),
                ),
            ],
          ),
        ),
      ],
    );
  }
}