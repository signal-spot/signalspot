import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Modal,
  Alert,
} from 'react-native';
import { FeedQuery, TrendingTag, feedService } from '../../services/feed.service';
import { DesignSystem } from '../../utils/designSystem';

interface FeedHeaderProps {
  query: FeedQuery;
  onQueryChange: (query: FeedQuery) => void;
  trendingTags?: TrendingTag[];
  onRefresh?: () => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  query,
  onQueryChange,
  trendingTags = [],
  onRefresh,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  const handleContentTypeChange = useCallback((contentType: 'spot' | 'spark' | 'mixed') => {
    onQueryChange({ ...query, contentType, offset: 0 });
  }, [query, onQueryChange]);

  const handleSortChange = useCallback((sortBy: 'recent' | 'popular' | 'relevant' | 'nearby') => {
    onQueryChange({ ...query, sortBy, offset: 0 });
  }, [query, onQueryChange]);

  const handleTimeFilterChange = useCallback((hoursAgo: number) => {
    onQueryChange({ ...query, hoursAgo, offset: 0 });
  }, [query, onQueryChange]);

  const handleTagPress = useCallback((tag: string) => {
    // Add tag to query or replace existing tags
    const currentTags = query.tags ? query.tags.split(',') : [];
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag].join(',');
      onQueryChange({ ...query, tags: newTags, offset: 0 });
    }
  }, [query, onQueryChange]);

  const clearTags = useCallback(() => {
    onQueryChange({ ...query, tags: undefined, offset: 0 });
  }, [query, onQueryChange]);

  const renderContentTypeSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>콘텐츠 유형</Text>
      <View style={styles.selectorButtons}>
        {[
          { key: 'mixed', label: '전체', icon: '🌐' },
          { key: 'spot', label: '스팟', icon: '📍' },
          { key: 'spark', label: '스파크', icon: '✨' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.selectorButton,
              query.contentType === item.key && styles.selectorButtonActive,
            ]}
            onPress={() => handleContentTypeChange(item.key as any)}
          >
            <Text style={styles.selectorButtonIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.selectorButtonText,
                query.contentType === item.key && styles.selectorButtonTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderSortSelector = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>정렬 방식</Text>
      <View style={styles.selectorButtons}>
        {[
          { key: 'relevant', label: '관련도순', icon: '🎯' },
          { key: 'recent', label: '최신순', icon: '🕐' },
          { key: 'popular', label: '인기순', icon: '🔥' },
          { key: 'nearby', label: '거리순', icon: '📍' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.selectorButton,
              query.sortBy === item.key && styles.selectorButtonActive,
            ]}
            onPress={() => handleSortChange(item.key as any)}
          >
            <Text style={styles.selectorButtonIcon}>{item.icon}</Text>
            <Text
              style={[
                styles.selectorButtonText,
                query.sortBy === item.key && styles.selectorButtonTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTimeFilter = () => (
    <View style={styles.selectorContainer}>
      <Text style={styles.selectorTitle}>시간 범위</Text>
      <View style={styles.selectorButtons}>
        {[
          { key: 1, label: '1시간' },
          { key: 6, label: '6시간' },
          { key: 24, label: '1일' },
          { key: 72, label: '3일' },
          { key: 168, label: '1주' },
        ].map((item) => (
          <TouchableOpacity
            key={item.key}
            style={[
              styles.selectorButton,
              query.hoursAgo === item.key && styles.selectorButtonActive,
            ]}
            onPress={() => handleTimeFilterChange(item.key)}
          >
            <Text
              style={[
                styles.selectorButtonText,
                query.hoursAgo === item.key && styles.selectorButtonTextActive,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTrendingTags = () => (
    <View style={styles.trendingContainer}>
      <View style={styles.trendingHeader}>
        <Text style={styles.trendingTitle}>🔥 트렌딩 태그</Text>
        {query.tags && (
          <TouchableOpacity onPress={clearTags} style={styles.clearButton}>
            <Text style={styles.clearButtonText}>지우기</Text>
          </TouchableOpacity>
        )}
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tagsScrollContainer}
      >
        {trendingTags.map((tag, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.trendingTag,
              query.tags?.includes(tag.tag) && styles.trendingTagActive,
            ]}
            onPress={() => handleTagPress(tag.tag)}
          >
            <Text
              style={[
                styles.trendingTagText,
                query.tags?.includes(tag.tag) && styles.trendingTagTextActive,
              ]}
            >
              #{tag.tag}
            </Text>
            <Text style={styles.trendingTagCount}>{tag.count}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  const renderActiveFilters = () => {
    const filters: string[] = [];
    
    if (query.contentType && query.contentType !== 'mixed') {
      filters.push(query.contentType === 'spot' ? '📍 스팟' : '✨ 스파크');
    }
    
    if (query.sortBy && query.sortBy !== 'relevant') {
      const sortLabels = {
        recent: '🕐 최신순',
        popular: '🔥 인기순',
        nearby: '📍 거리순',
      };
      filters.push(sortLabels[query.sortBy]);
    }
    
    if (query.hoursAgo && query.hoursAgo !== 24) {
      const timeLabels = {
        1: '1시간',
        6: '6시간',
        72: '3일',
        168: '1주',
      };
      filters.push(`⏰ ${timeLabels[query.hoursAgo] || `${query.hoursAgo}시간`}`);
    }
    
    if (query.tags) {
      const tagCount = query.tags.split(',').length;
      filters.push(`🏷️ 태그 ${tagCount}개`);
    }

    if (filters.length === 0) return null;

    return (
      <View style={styles.activeFiltersContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.activeFiltersScroll}
        >
          {filters.map((filter, index) => (
            <View key={index} style={styles.activeFilter}>
              <Text style={styles.activeFilterText}>{filter}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderFiltersModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Text style={styles.modalCloseButton}>취소</Text>
          </TouchableOpacity>
          <Text style={styles.modalTitle}>필터 설정</Text>
          <TouchableOpacity onPress={() => setShowFilters(false)}>
            <Text style={styles.modalDoneButton}>완료</Text>
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.modalContent}>
          {renderContentTypeSelector()}
          {renderSortSelector()}
          {renderTimeFilter()}
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {/* Main Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => setShowFilters(true)}
        >
          <Text style={styles.actionButtonIcon}>⚙️</Text>
          <Text style={styles.actionButtonText}>필터</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.actionButton}
          onPress={onRefresh}
        >
          <Text style={styles.actionButtonIcon}>🔄</Text>
          <Text style={styles.actionButtonText}>새로고침</Text>
        </TouchableOpacity>
      </View>

      {/* Active Filters */}
      {renderActiveFilters()}

      {/* Trending Tags */}
      {trendingTags.length > 0 && renderTrendingTags()}

      {/* Filters Modal */}
      {renderFiltersModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: DesignSystem.colors.background.primary,
    paddingBottom: DesignSystem.spacing.md,
  },
  actionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    gap: DesignSystem.spacing.md,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: 8,
  },
  actionButtonIcon: {
    fontSize: 16,
    marginRight: DesignSystem.spacing.xs,
  },
  actionButtonText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  activeFiltersContainer: {
    paddingHorizontal: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.sm,
  },
  activeFiltersScroll: {
    gap: DesignSystem.spacing.xs,
  },
  activeFilter: {
    backgroundColor: DesignSystem.colors.primary + '20',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.xs,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary,
  },
  activeFilterText: {
    ...DesignSystem.typography.caption2,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
  },
  trendingContainer: {
    paddingHorizontal: DesignSystem.spacing.md,
  },
  trendingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  trendingTitle: {
    ...DesignSystem.typography.headline,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  clearButton: {
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
  },
  clearButtonText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
  },
  tagsScrollContainer: {
    gap: DesignSystem.spacing.xs,
  },
  trendingTag: {
    backgroundColor: DesignSystem.colors.background.secondary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendingTagActive: {
    backgroundColor: DesignSystem.colors.primary + '20',
    borderWidth: 1,
    borderColor: DesignSystem.colors.primary,
  },
  trendingTagText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginRight: DesignSystem.spacing.xs,
  },
  trendingTagTextActive: {
    color: DesignSystem.colors.primary,
  },
  trendingTagCount: {
    ...DesignSystem.typography.caption2,
    color: DesignSystem.colors.text.secondary,
    backgroundColor: DesignSystem.colors.background.primary,
    paddingHorizontal: DesignSystem.spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    fontSize: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.background.secondary,
  },
  modalCloseButton: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
  },
  modalTitle: {
    ...DesignSystem.typography.title3,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  modalDoneButton: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  selectorContainer: {
    marginVertical: DesignSystem.spacing.lg,
  },
  selectorTitle: {
    ...DesignSystem.typography.headline,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
    marginBottom: DesignSystem.spacing.md,
  },
  selectorButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: DesignSystem.spacing.sm,
  },
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.secondary,
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectorButtonActive: {
    backgroundColor: DesignSystem.colors.primary + '20',
    borderColor: DesignSystem.colors.primary,
  },
  selectorButtonIcon: {
    fontSize: 16,
    marginRight: DesignSystem.spacing.xs,
  },
  selectorButtonText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.primary,
    fontWeight: '500',
  },
  selectorButtonTextActive: {
    color: DesignSystem.colors.primary,
    fontWeight: '600',
  },
});