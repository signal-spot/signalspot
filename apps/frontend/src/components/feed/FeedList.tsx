import React, { useState, useCallback, useRef } from 'react';
import {
  FlatList,
  RefreshControl,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { FeedItem, FeedQuery, feedService } from '../../services/feed.service';
import { FeedCard } from './FeedCard';
import { FeedSkeleton } from './FeedSkeleton';
import { DesignSystem } from '../../utils/designSystem';

interface FeedListProps {
  query?: FeedQuery;
  onItemPress: (item: FeedItem) => void;
  onAuthorPress?: (authorId: string) => void;
  header?: React.ReactNode;
  emptyMessage?: string;
  errorMessage?: string;
  showTrending?: boolean;
}

export const FeedList: React.FC<FeedListProps> = ({
  query = {},
  onItemPress,
  onAuthorPress,
  header,
  emptyMessage = '표시할 콘텐츠가 없습니다.',
  errorMessage = '피드를 불러오는 중 오류가 발생했습니다.',
  showTrending = false,
}) => {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  
  const flatListRef = useRef<FlatList>(null);

  // Load initial feed data
  const loadFeed = useCallback(async (isRefresh = false) => {
    try {
      const currentOffset = isRefresh ? 0 : offset;
      const response = showTrending 
        ? await feedService.getTrendingContent({ ...query, offset: currentOffset })
        : await feedService.getFeed({ ...query, offset: currentOffset });

      if (response.success && response.data) {
        const newItems = response.data.items;
        
        if (isRefresh) {
          setItems(newItems);
          setOffset(newItems.length);
        } else {
          setItems(prev => [...prev, ...newItems]);
          setOffset(prev => prev + newItems.length);
        }
        
        setHasMore(response.data.pagination.hasMore);
        setError(null);
      } else {
        setError(response.error || errorMessage);
      }
    } catch (err) {
      setError(errorMessage);
      console.error('Error loading feed:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [query, offset, showTrending, errorMessage]);

  // Initial load
  React.useEffect(() => {
    setLoading(true);
    setOffset(0);
    loadFeed(true);
  }, [query, showTrending]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setOffset(0);
    loadFeed(true);
  }, [loadFeed]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      loadFeed(false);
    }
  }, [loadingMore, hasMore, loading, loadFeed]);

  // Handle item interactions
  const handleLike = useCallback(async (item: FeedItem) => {
    try {
      // TODO: Implement like API call
      
      // Optimistically update UI
      setItems(prev => prev.map(i => 
        i.id === item.id 
          ? {
              ...i,
              stats: {
                ...i.stats,
                likes: i.interactionData?.hasLiked 
                  ? i.stats.likes - 1 
                  : i.stats.likes + 1,
              },
              interactionData: {
                ...i.interactionData,
                hasLiked: !i.interactionData?.hasLiked,
              },
            }
          : i
      ));
    } catch (error) {
      console.error('Error liking item:', error);
      Alert.alert('오류', '좋아요 처리 중 오류가 발생했습니다.');
    }
  }, []);

  const handleComment = useCallback((item: FeedItem) => {
    // Navigate to item detail for commenting
    onItemPress(item);
  }, [onItemPress]);

  const handleShare = useCallback(async (item: FeedItem) => {
    try {
      // TODO: Implement share functionality
      Alert.alert('공유', '공유 기능을 구현 중입니다.');
    } catch (error) {
      console.error('Error sharing item:', error);
      Alert.alert('오류', '공유 중 오류가 발생했습니다.');
    }
  }, []);

  // Render item
  const renderItem = useCallback(({ item }: { item: FeedItem }) => (
    <FeedCard
      item={item}
      onPress={onItemPress}
      onLike={handleLike}
      onComment={handleComment}
      onShare={handleShare}
      onAuthorPress={onAuthorPress}
    />
  ), [onItemPress, onAuthorPress, handleLike, handleComment, handleShare]);

  // Render loading skeleton
  const renderSkeleton = () => (
    <View>
      {Array.from({ length: 5 }).map((_, index) => (
        <FeedSkeleton key={index} />
      ))}
    </View>
  );

  // Render loading footer
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={DesignSystem.colors.primary} />
        <Text style={styles.footerText}>더 많은 콘텐츠 로딩 중...</Text>
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading) {
      return renderSkeleton();
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>😕</Text>
          <Text style={styles.emptyTitle}>오류가 발생했습니다</Text>
          <Text style={styles.emptyMessage}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
            <Text style={styles.retryButtonText}>다시 시도</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>📭</Text>
        <Text style={styles.emptyTitle}>콘텐츠가 없습니다</Text>
        <Text style={styles.emptyMessage}>{emptyMessage}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleRefresh}>
          <Text style={styles.retryButtonText}>새로고침</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <FlatList
      ref={flatListRef}
      data={items}
      renderItem={renderItem}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={header}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          colors={[DesignSystem.colors.primary]}
          tintColor={DesignSystem.colors.primary}
        />
      }
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[
        styles.container,
        items.length === 0 && styles.emptyContentContainer,
      ]}
      removeClippedSubviews={true}
      maxToRenderPerBatch={10}
      windowSize={10}
      initialNumToRender={5}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: DesignSystem.spacing.md,
  },
  emptyContentContainer: {
    flexGrow: 1,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.lg,
  },
  footerText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
    marginLeft: DesignSystem.spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.xl,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: DesignSystem.spacing.lg,
  },
  emptyTitle: {
    ...DesignSystem.typography.title2,
    color: DesignSystem.colors.text.primary,
    textAlign: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  emptyMessage: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: DesignSystem.spacing.lg,
  },
  retryButton: {
    backgroundColor: DesignSystem.colors.primary,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    borderRadius: 8,
  },
  retryButtonText: {
    ...DesignSystem.typography.headline,
    color: '#FFFFFF',
    fontWeight: '600',
  },
});