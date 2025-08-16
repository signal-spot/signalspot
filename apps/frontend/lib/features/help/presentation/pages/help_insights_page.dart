import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../../../core/theme/app_colors.dart';
import '../../../../core/theme/app_text_styles.dart';
import '../../../../core/theme/app_spacing.dart';

class HelpInsightsPage extends StatefulWidget {
  const HelpInsightsPage({super.key});

  @override
  State<HelpInsightsPage> createState() => _HelpInsightsPageState();
}

class _HelpInsightsPageState extends State<HelpInsightsPage>
    with TickerProviderStateMixin {
  late TabController _tabController;
  
  final List<Map<String, dynamic>> _faqItems = [
    {
      'question': '스파크는 어떻게 작동하나요?',
      'answer': '스파크는 같은 지역에 있는 사용자들 간의 매칭 시스템입니다. 서로에게 관심이 있을 때 스파크를 보내고, 상대방이 수락하면 채팅을 시작할 수 있습니다.',
      'category': 'spark',
    },
    {
      'question': '쪽지는 누구나 볼 수 있나요?',
      'answer': '쪽지는 공개 설정에 따라 다릅니다. 익명으로 설정하거나 특정 범위의 사용자에게만 공개할 수 있습니다.',
      'category': 'note',
    },
    {
      'question': '내 위치 정보는 안전한가요?',
      'answer': '네, 정확한 위치는 저장되지 않으며 대략적인 지역 정보만 사용됩니다. 언제든지 위치 공유를 끌 수 있습니다.',
      'category': 'privacy',
    },
    {
      'question': '스파크 매칭이 잘 안 돼요',
      'answer': '프로필을 완성하고, 관심사를 추가하며, 활동 시간대를 설정해보세요. 더 많은 정보가 있을수록 매칭률이 높아집니다.',
      'category': 'spark',
    },
    {
      'question': '부적절한 사용자를 신고하려면?',
      'answer': '사용자 프로필이나 채팅에서 신고 버튼을 눌러주세요. 24시간 내에 검토 후 조치됩니다.',
      'category': 'safety',
    },
  ];

  final List<Map<String, dynamic>> _insightItems = [
    {
      'title': '스파크 성공률 높이기',
      'subtitle': '매칭 성공률을 2배 높이는 프로필 작성법',
      'content': '1. 프로필 사진은 얼굴이 잘 보이는 자연스러운 사진을 사용하세요.\n\n2. 자기소개는 구체적이고 긍정적으로 작성하세요. 취미나 관심사를 포함하는 것이 좋습니다.\n\n3. 관심사는 다양하게 선택하되, 너무 많지는 않게 (5-8개 권장) 선택하세요.\n\n4. 정기적으로 앱을 사용하고 쪽지를 남기는 것이 매칭률 향상에 도움이 됩니다.',
      'icon': Icons.trending_up,
      'color': AppColors.success,
    },
    {
      'title': '안전한 만남을 위한 가이드',
      'subtitle': '첫 만남에서 주의해야 할 점들',
      'content': '1. 첫 만남은 사람이 많은 공공장소에서 진행하세요.\n\n2. 개인정보(주소, 직장 등)는 충분히 신뢰 관계가 형성된 후 공유하세요.\n\n3. 불편한 상황이 발생하면 즉시 자리를 뜨고 앱 내 신고 기능을 활용하세요.\n\n4. 만남 계획을 가족이나 친구에게 미리 알려두세요.',
      'icon': Icons.security,
      'color': AppColors.primary,
    },
    {
      'title': '의미 있는 대화 시작하기',
      'subtitle': '첫 메시지부터 깊이 있는 대화까지',
      'content': '1. 상대방의 프로필을 자세히 읽고 공통 관심사를 찾아보세요.\n\n2. "안녕하세요"보다는 구체적인 질문이나 관심사에 대한 언급으로 시작하세요.\n\n3. 개방형 질문을 통해 상대방이 자신에 대해 이야기할 수 있도록 하세요.\n\n4. 적절한 유머와 긍정적인 태도를 유지하세요.',
      'icon': Icons.chat_bubble_outline,
      'color': AppColors.secondary,
    },
  ];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
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
          icon: const Icon(Icons.arrow_back_ios, color: AppColors.textPrimary),
        ),
        title: Text(
          '도움말 & 인사이트',
          style: AppTextStyles.titleLarge.copyWith(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.w600,
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.textSecondary,
          indicatorColor: AppColors.primary,
          tabs: const [
            Tab(text: '자주 묻는 질문'),
            Tab(text: '인사이트'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildFAQTab(),
          _buildInsightsTab(),
        ],
      ),
    );
  }

  Widget _buildFAQTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Search Bar
          Container(
            margin: const EdgeInsets.only(bottom: AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: AppColors.grey200),
            ),
            child: TextField(
              decoration: InputDecoration(
                hintText: '궁금한 내용을 검색해보세요',
                prefixIcon: Icon(Icons.search, color: AppColors.textSecondary),
                border: InputBorder.none,
                contentPadding: const EdgeInsets.all(AppSpacing.md),
              ),
            ),
          ),
          
          // FAQ Categories
          Row(
            children: [
              _buildCategoryChip('전체', true),
              const SizedBox(width: AppSpacing.sm),
              _buildCategoryChip('스파크', false),
              const SizedBox(width: AppSpacing.sm),
              _buildCategoryChip('쪽지', false),
              const SizedBox(width: AppSpacing.sm),
              _buildCategoryChip('안전', false),
            ],
          ),
          
          const SizedBox(height: AppSpacing.lg),
          
          // FAQ Items
          ..._faqItems.map((item) => _buildFAQItem(item)).toList(),
        ],
      ),
    );
  }

  Widget _buildInsightsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(AppSpacing.lg),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
                colors: [
                  AppColors.primary.withOpacity(0.1),
                  AppColors.secondary.withOpacity(0.1),
                ],
              ),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.lightbulb,
                      color: AppColors.primary,
                      size: 24,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Text(
                      '인사이트',
                      style: AppTextStyles.titleMedium.copyWith(
                        color: AppColors.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  'SignalSpot을 더 효과적으로 사용하기 위한 팁과 인사이트를 제공합니다.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                    height: 1.4,
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: AppSpacing.lg),
          
          // Insight Items
          ..._insightItems.map((item) => _buildInsightItem(item)).toList(),
          
          const SizedBox(height: AppSpacing.lg),
          
          // Contact Support
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(AppSpacing.lg),
            decoration: BoxDecoration(
              color: AppColors.surface,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: AppColors.grey200),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      Icons.support_agent,
                      color: AppColors.primary,
                      size: 24,
                    ),
                    const SizedBox(width: AppSpacing.sm),
                    Text(
                      '문의하기',
                      style: AppTextStyles.titleMedium.copyWith(
                        fontWeight: FontWeight.bold,
                        color: AppColors.textPrimary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: AppSpacing.sm),
                Text(
                  '궁금한 점이나 문제가 있으시면 언제든지 문의해주세요.',
                  style: AppTextStyles.bodyMedium.copyWith(
                    color: AppColors.textSecondary,
                  ),
                ),
                const SizedBox(height: AppSpacing.md),
                Row(
                  children: [
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('이메일 앱을 여는 중...')),
                          );
                        },
                        icon: const Icon(Icons.email),
                        label: const Text('이메일'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.primary,
                          side: BorderSide(color: AppColors.primary),
                        ),
                      ),
                    ),
                    const SizedBox(width: AppSpacing.md),
                    Expanded(
                      child: OutlinedButton.icon(
                        onPressed: () {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('채팅 상담을 준비 중입니다')),
                          );
                        },
                        icon: const Icon(Icons.chat),
                        label: const Text('채팅 상담'),
                        style: OutlinedButton.styleFrom(
                          foregroundColor: AppColors.primary,
                          side: BorderSide(color: AppColors.primary),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildCategoryChip(String label, bool isSelected) {
    return Container(
      padding: const EdgeInsets.symmetric(
        horizontal: AppSpacing.md,
        vertical: AppSpacing.sm,
      ),
      decoration: BoxDecoration(
        color: isSelected
            ? AppColors.primary
            : AppColors.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
          color: isSelected 
              ? AppColors.primary 
              : AppColors.grey300,
        ),
      ),
      child: Text(
        label,
        style: AppTextStyles.bodySmall.copyWith(
          color: isSelected
              ? Colors.white
              : AppColors.textPrimary,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  Widget _buildFAQItem(Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.md),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppColors.grey200),
      ),
      child: ExpansionTile(
        title: Text(
          item['question'],
          style: AppTextStyles.bodyMedium.copyWith(
            fontWeight: FontWeight.w500,
            color: AppColors.textPrimary,
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              0,
              AppSpacing.lg,
              AppSpacing.lg,
            ),
            child: Text(
              item['answer'],
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textSecondary,
                height: 1.5,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInsightItem(Map<String, dynamic> item) {
    return Container(
      margin: const EdgeInsets.only(bottom: AppSpacing.lg),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: AppColors.grey200),
      ),
      child: ExpansionTile(
        leading: Container(
          width: 48,
          height: 48,
          decoration: BoxDecoration(
            color: item['color'].withOpacity(0.1),
            shape: BoxShape.circle,
          ),
          child: Icon(
            item['icon'],
            color: item['color'],
            size: 24,
          ),
        ),
        title: Text(
          item['title'],
          style: AppTextStyles.titleSmall.copyWith(
            fontWeight: FontWeight.bold,
            color: AppColors.textPrimary,
          ),
        ),
        subtitle: Text(
          item['subtitle'],
          style: AppTextStyles.bodySmall.copyWith(
            color: AppColors.textSecondary,
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(
              AppSpacing.lg,
              0,
              AppSpacing.lg,
              AppSpacing.lg,
            ),
            child: Text(
              item['content'],
              style: AppTextStyles.bodyMedium.copyWith(
                color: AppColors.textPrimary,
                height: 1.6,
              ),
            ),
          ),
        ],
      ),
    );
  }
}