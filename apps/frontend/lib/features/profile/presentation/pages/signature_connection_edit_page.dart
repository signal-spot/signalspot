import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';
import '../../../../shared/providers/signature_connection_provider.dart';
import '../../../../shared/models/signature_connection.dart';

class SignatureConnectionEditPage extends ConsumerStatefulWidget {
  const SignatureConnectionEditPage({super.key});

  @override
  ConsumerState<SignatureConnectionEditPage> createState() => _SignatureConnectionEditPageState();
}

class _SignatureConnectionEditPageState extends ConsumerState<SignatureConnectionEditPage> 
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _movieController = TextEditingController();
  final _artistController = TextEditingController();
  final _movieFocusNode = FocusNode();
  final _artistFocusNode = FocusNode();
  
  // 기본 정보
  String? _selectedMovie;
  String? _selectedArtist;
  String? _selectedMBTI;
  final List<String> _selectedInterests = [];
  
  // 개인 이야기 (온보딩과 동일)
  String? _memorablePlace;      // 가장 기억에 남는 장소
  String? _childhoodMemory;     // 어린 시절 추억
  String? _turningPoint;        // 인생의 터닝포인트
  String? _proudestMoment;      // 가장 자랑스러웠던 순간
  String? _bucketList;          // 버킷리스트
  String? _lifeLesson;          // 인생에서 배운 교훈
  
  // 검색 관련
  final List<Movie> _movieSuggestions = [];
  final List<Artist> _artistSuggestions = [];
  bool _isSearchingMovies = false;
  bool _isSearchingArtists = false;

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
  
  // 추가 매칭 설정
  RangeValues _ageRange = const RangeValues(25, 35);
  double _maxDistance = 10.0;
  String _connectionType = '새로운 친구';
  final List<String> _connectionTypes = [
    '새로운 친구', 
    '연인 관계', 
    '취미 친구', 
    '스터디 메이트',
    '비즈니스 네트워킹',
    '모든 종류'
  ];
  
  bool _isLoading = false;
  bool _hasChanges = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _movieController.addListener(_searchMovies);
    _artistController.addListener(_searchArtists);
    _loadCurrentSettings();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _movieController.dispose();
    _artistController.dispose();
    _movieFocusNode.dispose();
    _artistFocusNode.dispose();
    super.dispose();
  }

  Future<void> _loadCurrentSettings() async {
    // API에서 실제 데이터 로드
    final preferencesAsync = ref.watch(signatureConnectionPreferencesProvider);
    
    preferencesAsync.whenData((preferences) {
      if (preferences != null && mounted) {
        setState(() {
          // 기본 취향 정보
          if (preferences.movie != null) {
            _movieController.text = preferences.movie!;
            _selectedMovie = preferences.movie;
          }
          if (preferences.artist != null) {
            _artistController.text = preferences.artist!;
            _selectedArtist = preferences.artist;
          }
          _selectedMBTI = preferences.mbti;
          if (preferences.interests != null) {
            _selectedInterests.clear();
            _selectedInterests.addAll(preferences.interests!);
          }
          
          // 개인 이야기
          _memorablePlace = preferences.memorablePlace;
          _childhoodMemory = preferences.childhoodMemory;
          _turningPoint = preferences.turningPoint;
          _proudestMoment = preferences.proudestMoment;
          _bucketList = preferences.bucketList;
          _lifeLesson = preferences.lifeLesson;
          
          // 매칭 설정
          if (preferences.ageRangeMin != null && preferences.ageRangeMax != null) {
            _ageRange = RangeValues(
              preferences.ageRangeMin!.toDouble(),
              preferences.ageRangeMax!.toDouble(),
            );
          }
          _maxDistance = preferences.maxDistance ?? 10.0;
          
          // Connection type 처리 - enum을 string으로 변환
          if (preferences.connectionTypes != null && preferences.connectionTypes!.isNotEmpty) {
            final firstType = preferences.connectionTypes!.first;
            switch (firstType) {
              case ConnectionType.collaboration:
                _connectionType = '새로운 친구';
                break;
              case ConnectionType.networking:
                _connectionType = '비즈니스 네트워킹';
                break;
              case ConnectionType.friendship:
                _connectionType = '새로운 친구';
                break;
              case ConnectionType.mentorship:
                _connectionType = '스터디 메이트';
                break;
              case ConnectionType.romantic:
                _connectionType = '연인 관계';
                break;
            }
          }
          
          _hasChanges = false;
        });
      }
    });
  }

  void _onSettingChanged() {
    if (!_hasChanges) {
      setState(() => _hasChanges = true);
    }
  }

  void _toggleInterest(String interest) {
    setState(() {
      if (_selectedInterests.contains(interest)) {
        _selectedInterests.remove(interest);
      } else if (_selectedInterests.length < 10) {
        _selectedInterests.add(interest);
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('최대 10개까지 선택할 수 있습니다.'),
          ),
        );
      }
      _onSettingChanged();
    });
  }

  Future<void> _searchMovies() async {
    final query = _movieController.text.trim();
    if (query.isEmpty) {
      setState(() {
        _movieSuggestions.clear();
        _isSearchingMovies = false;
      });
      return;
    }

    setState(() {
      _isSearchingMovies = true;
    });

    // TODO: 실제 영화 API 연동
    await Future.delayed(const Duration(milliseconds: 300));

    // 임시 데이터
    final mockMovies = [
      Movie('어벤져스: 엔드게임', 2019, 'https://example.com/poster1.jpg'),
      Movie('기생충', 2019, 'https://example.com/poster2.jpg'),
      Movie('인터스텔라', 2014, 'https://example.com/poster3.jpg'),
      Movie('타이타닉', 1997, 'https://example.com/poster4.jpg'),
      Movie('라라랜드', 2016, 'https://example.com/poster5.jpg'),
    ].where((movie) => 
        movie.title.toLowerCase().contains(query.toLowerCase())
    ).toList();

    if (mounted) {
      setState(() {
        _movieSuggestions.clear();
        _movieSuggestions.addAll(mockMovies);
        _isSearchingMovies = false;
      });
    }
  }

  Future<void> _searchArtists() async {
    final query = _artistController.text.trim();
    if (query.isEmpty) {
      setState(() {
        _artistSuggestions.clear();
        _isSearchingArtists = false;
      });
      return;
    }

    setState(() {
      _isSearchingArtists = true;
    });

    // TODO: 실제 음악 API 연동
    await Future.delayed(const Duration(milliseconds: 300));

    // 임시 데이터
    final mockArtists = [
      Artist('BTS', 'K-Pop', 'https://example.com/artist1.jpg'),
      Artist('아이유', 'K-Pop', 'https://example.com/artist2.jpg'),
      Artist('Ed Sheeran', 'Pop', 'https://example.com/artist3.jpg'),
      Artist('Taylor Swift', 'Pop', 'https://example.com/artist4.jpg'),
      Artist('방탄소년단', 'K-Pop', 'https://example.com/artist5.jpg'),
    ].where((artist) => 
        artist.name.toLowerCase().contains(query.toLowerCase())
    ).toList();

    if (mounted) {
      setState(() {
        _artistSuggestions.clear();
        _artistSuggestions.addAll(mockArtists);
        _isSearchingArtists = false;
      });
    }
  }

  void _selectMovie(Movie movie) {
    setState(() {
      _selectedMovie = movie.title;
      _movieController.text = movie.title;
      _movieSuggestions.clear();
    });
    _movieFocusNode.unfocus();
  }

  void _selectArtist(Artist artist) {
    setState(() {
      _selectedArtist = artist.name;
      _artistController.text = artist.name;
      _artistSuggestions.clear();
    });
    _artistFocusNode.unfocus();
  }

  Future<void> _saveSettings() async {
    setState(() => _isLoading = true);
    
    try {
      // Connection type string을 enum으로 변환
      final connectionTypes = <ConnectionType>[];
      switch (_connectionType) {
        case '새로운 친구':
          connectionTypes.add(ConnectionType.friendship);
          break;
        case '연인 관계':
          connectionTypes.add(ConnectionType.romantic);
          break;
        case '취미 친구':
          connectionTypes.add(ConnectionType.friendship);
          break;
        case '스터디 메이트':
          connectionTypes.add(ConnectionType.mentorship);
          break;
        case '비즈니스 네트워킹':
          connectionTypes.add(ConnectionType.networking);
          break;
        case '모든 종류':
          connectionTypes.addAll(ConnectionType.values);
          break;
      }
      
      // 시그니처 커넥션 데이터 생성
      final preferences = SignatureConnectionPreferences(
        movie: _selectedMovie,
        artist: _selectedArtist,
        mbti: _selectedMBTI,
        interests: _selectedInterests,
        memorablePlace: _memorablePlace,
        childhoodMemory: _childhoodMemory,
        turningPoint: _turningPoint,
        proudestMoment: _proudestMoment,
        bucketList: _bucketList,
        lifeLesson: _lifeLesson,
        ageRangeMin: _ageRange.start.round(),
        ageRangeMax: _ageRange.end.round(),
        maxDistance: _maxDistance,
        connectionTypes: connectionTypes,
      );
      
      // API 호출
      await ref.read(signatureConnectionPreferencesProvider.notifier)
          .updatePreferences(preferences);
      
      HapticFeedback.mediumImpact();
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('✅ 시그니처 커넥션 설정이 저장되었습니다!'),
            backgroundColor: AppColors.success,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        );
        
        setState(() => _hasChanges = false);
        context.pop();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('설정 저장 실패: $e'),
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
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          onPressed: () => context.pop(),
          icon: Icon(Icons.arrow_back_ios, color: AppColors.textPrimary),
        ),
        title: Text(
          '시그니처 커넥션 설정',
          style: AppTextStyles.titleLarge.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
        actions: [
          if (_hasChanges)
            TextButton(
              onPressed: _isLoading ? null : _saveSettings,
              child: _isLoading
                  ? SizedBox(
                      width: 16,
                      height: 16,
                      child: CircularProgressIndicator(strokeWidth: 2),
                    )
                  : Text(
                      '저장',
                      style: AppTextStyles.titleSmall.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
            ),
        ],
      ),
      body: Column(
        children: [
          // Header Description
          Container(
            margin: const EdgeInsets.all(AppSpacing.lg),
            width: double.infinity,
            padding: EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.primary.withOpacity(0.1),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.primary.withOpacity(0.2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.auto_awesome,
                      color: AppColors.primary,
                      size: 24,
                    ),
                    SizedBox(width: AppSpacing.sm),
                    Text(
                      '시그니처 커넥션',
                      style: AppTextStyles.titleMedium.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                SizedBox(height: AppSpacing.sm),
                Text(
                  '당신만의 특별한 취향과 매칭 조건을 설정하세요',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                    height: 1.5,
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
                Tab(text: '기본 취향'),
                Tab(text: '개인 이야기'),
                Tab(text: '매칭 설정'),
              ],
            ),
          ),
          
          // 탭 콘텐츠
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                // 기본 취향 탭
                _buildBasicPreferences(),
                
                // 재미있는 질문 탭
                _buildFunQuestions(),
                
                // 매칭 설정 탭
                _buildMatchingSettings(),
              ],
            ),
          ),
          
          // 하단 버튼
          Container(
            padding: const EdgeInsets.all(AppSpacing.lg),
            child: SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _hasChanges && !_isLoading ? _saveSettings : null,
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  elevation: _hasChanges ? 4 : 0,
                  shadowColor: AppColors.primary.withOpacity(0.3),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  padding: EdgeInsets.symmetric(vertical: AppSpacing.md),
                ),
                child: _isLoading
                    ? SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(
                          strokeWidth: 2,
                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : const Text(
                        '설정 저장',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildBasicPreferences() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // 인생 영화
          _buildSectionTitle('인생 영화'),
          const SizedBox(height: AppSpacing.sm),
          TextFormField(
            controller: _movieController,
            focusNode: _movieFocusNode,
            decoration: InputDecoration(
              hintText: '영화 제목을 검색하세요',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _isSearchingMovies
                  ? const Padding(
                      padding: EdgeInsets.all(AppSpacing.sm),
                      child: SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    )
                  : _selectedMovie != null
                      ? const Icon(Icons.check_circle, color: AppColors.success)
                      : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            onChanged: (_) => _onSettingChanged(),
          ),

          // 영화 검색 결과
          if (_movieSuggestions.isNotEmpty)
            Container(
              margin: const EdgeInsets.only(top: AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.black.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _movieSuggestions.length,
                itemBuilder: (context, index) {
                  final movie = _movieSuggestions[index];
                  return ListTile(
                    leading: Container(
                      width: 40,
                      height: 60,
                      decoration: BoxDecoration(
                        color: AppColors.grey200,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: const Icon(Icons.movie, color: AppColors.grey500),
                    ),
                    title: Text(movie.title),
                    subtitle: Text('${movie.year}년'),
                    onTap: () => _selectMovie(movie),
                  );
                },
              ),
            ),

          const SizedBox(height: AppSpacing.xl),

          // 최애 아티스트
          _buildSectionTitle('최애 아티스트'),
          const SizedBox(height: AppSpacing.sm),
          TextFormField(
            controller: _artistController,
            focusNode: _artistFocusNode,
            decoration: InputDecoration(
              hintText: '아티스트 이름을 검색하세요',
              prefixIcon: const Icon(Icons.search),
              suffixIcon: _isSearchingArtists
                  ? const Padding(
                      padding: EdgeInsets.all(AppSpacing.sm),
                      child: SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      ),
                    )
                  : _selectedArtist != null
                      ? const Icon(Icons.check_circle, color: AppColors.success)
                      : null,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            onChanged: (_) => _onSettingChanged(),
          ),

          // 아티스트 검색 결과
          if (_artistSuggestions.isNotEmpty)
            Container(
              margin: const EdgeInsets.only(top: AppSpacing.sm),
              decoration: BoxDecoration(
                color: AppColors.surface,
                borderRadius: BorderRadius.circular(12),
                boxShadow: [
                  BoxShadow(
                    color: AppColors.black.withOpacity(0.1),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _artistSuggestions.length,
                itemBuilder: (context, index) {
                  final artist = _artistSuggestions[index];
                  return ListTile(
                    leading: Container(
                      width: 40,
                      height: 40,
                      decoration: BoxDecoration(
                        color: AppColors.grey200,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Icon(Icons.person, color: AppColors.grey500),
                    ),
                    title: Text(artist.name),
                    subtitle: Text(artist.genre),
                    onTap: () => _selectArtist(artist),
                  );
                },
              ),
            ),

          const SizedBox(height: AppSpacing.xl),
          
          // MBTI
          _buildSectionTitle('MBTI'),
          const SizedBox(height: AppSpacing.md),
          GridView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 4,
              childAspectRatio: 2.0,
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
                    _onSettingChanged();
                  });
                },
                child: Container(
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
          
          // 관심사
          _buildSectionTitle('관심사'),
          Text(
            '최대 10개까지 선택 가능',
            style: AppTextStyles.bodySmall.copyWith(
              color: AppColors.grey500,
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
                    horizontal: AppSpacing.md,
                    vertical: AppSpacing.sm,
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

  Widget _buildFunQuestions() {
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
            onChanged: (value) {
              setState(() {
                _memorablePlace = value;
                _onSettingChanged();
              });
            },
          ),

          const SizedBox(height: AppSpacing.xl),

          // 어린 시절 추억
          _buildTextQuestion(
            icon: Icons.child_care,
            title: '어린 시절 가장 소중한 추억은?',
            subtitle: '따뜻한 어린 시절의 기억을 공유해주세요',
            hintText: '예: 할머니와 함께 만들던 송편',
            value: _childhoodMemory,
            onChanged: (value) {
              setState(() {
                _childhoodMemory = value;
                _onSettingChanged();
              });
            },
          ),

          const SizedBox(height: AppSpacing.xl),

          // 인생의 터닝포인트
          _buildTextQuestion(
            icon: Icons.change_circle,
            title: '인생의 터닝포인트가 된 순간은?',
            subtitle: '당신을 변화시킨 특별한 순간을 알려주세요',
            hintText: '예: 처음으로 해외에서 일하게 된 날',
            value: _turningPoint,
            onChanged: (value) {
              setState(() {
                _turningPoint = value;
                _onSettingChanged();
              });
            },
          ),

          const SizedBox(height: AppSpacing.xl),

          // 가장 자랑스러웠던 순간
          _buildTextQuestion(
            icon: Icons.emoji_events,
            title: '가장 자랑스러웠던 순간은?',
            subtitle: '성취감을 느꼈던 특별한 경험을 공유해주세요',
            hintText: '예: 마라톤 완주했을 때',
            value: _proudestMoment,
            onChanged: (value) {
              setState(() {
                _proudestMoment = value;
                _onSettingChanged();
              });
            },
          ),

          const SizedBox(height: AppSpacing.xl),

          // 버킷리스트
          _buildTextQuestion(
            icon: Icons.checklist,
            title: '꼭 이루고 싶은 버킷리스트는?',
            subtitle: '언젠가 꼭 해보고 싶은 일을 알려주세요',
            hintText: '예: 오로라 보기, 책 출간하기',
            value: _bucketList,
            onChanged: (value) {
              setState(() {
                _bucketList = value;
                _onSettingChanged();
              });
            },
          ),

          const SizedBox(height: AppSpacing.xl),

          // 인생에서 배운 교훈
          _buildTextQuestion(
            icon: Icons.school,
            title: '인생에서 배운 가장 중요한 교훈은?',
            subtitle: '삶을 통해 깨달은 지혜를 공유해주세요',
            hintText: '예: 실패도 성장의 일부라는 것',
            value: _lifeLesson,
            onChanged: (value) {
              setState(() {
                _lifeLesson = value;
                _onSettingChanged();
              });
            },
          ),
        ],
      ),
    );
  }

  Widget _buildMatchingSettings() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Age Range
          Container(
            padding: EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.grey200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '선호하는 연령대',
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: AppSpacing.md),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '${_ageRange.start.round()}세',
                      style: AppTextStyles.titleMedium.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    Text(
                      '${_ageRange.end.round()}세',
                      style: AppTextStyles.titleMedium.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                RangeSlider(
                  values: _ageRange,
                  min: 18,
                  max: 60,
                  divisions: 42,
                  activeColor: AppColors.primary,
                  inactiveColor: AppColors.grey300,
                  onChanged: (RangeValues values) {
                    setState(() {
                      _ageRange = values;
                      _onSettingChanged();
                    });
                  },
                ),
              ],
            ),
          ),
          
          SizedBox(height: AppSpacing.md),
          
          // Distance
          Container(
            padding: EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.grey200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '최대 거리',
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: AppSpacing.md),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      '반경',
                      style: AppTextStyles.bodyMedium.copyWith(
                        color: AppColors.textSecondary,
                      ),
                    ),
                    Text(
                      '${_maxDistance.round()}km',
                      style: AppTextStyles.titleMedium.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                Slider(
                  value: _maxDistance,
                  min: 1,
                  max: 50,
                  divisions: 49,
                  activeColor: AppColors.primary,
                  inactiveColor: AppColors.grey300,
                  onChanged: (double value) {
                    setState(() {
                      _maxDistance = value;
                      _onSettingChanged();
                    });
                  },
                ),
              ],
            ),
          ),
          
          SizedBox(height: AppSpacing.md),
          
          // Connection Type
          Container(
            padding: EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.grey200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  '원하는 관계',
                  style: AppTextStyles.bodyMedium.copyWith(
                    fontWeight: FontWeight.w600,
                  ),
                ),
                SizedBox(height: AppSpacing.md),
                DropdownButtonFormField<String>(
                  value: _connectionType,
                  decoration: const InputDecoration(
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.zero,
                  ),
                  items: _connectionTypes.map((type) {
                    return DropdownMenuItem<String>(
                      value: type,
                      child: Text(type),
                    );
                  }).toList(),
                  onChanged: (value) {
                    if (value != null) {
                      setState(() {
                        _connectionType = value;
                        _onSettingChanged();
                      });
                    }
                  },
                ),
              ],
            ),
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
        Row(
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

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: AppTextStyles.titleMedium.copyWith(
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
      ),
    );
  }
}

class Movie {
  final String title;
  final int year;
  final String posterUrl;

  Movie(this.title, this.year, this.posterUrl);
}

class Artist {
  final String name;
  final String genre;
  final String imageUrl;

  Artist(this.name, this.genre, this.imageUrl);
}