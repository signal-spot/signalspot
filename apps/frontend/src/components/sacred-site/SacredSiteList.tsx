import React, { useState, useCallback, useRef } from 'react';
import {
  FlatList,
  RefreshControl,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { SacredSite, SiteQuery, sacredSiteService } from '../../services/sacred-site.service';
import { SacredSiteCard } from './SacredSiteCard';
import { DesignSystem } from '../../utils/designSystem';

interface SacredSiteListProps {
  query?: SiteQuery;
  onSitePress: (site: SacredSite) => void;
  onSiteVisit?: (site: SacredSite) => void;
  header?: React.ReactNode;
  emptyMessage?: string;
  errorMessage?: string;
  variant?: 'default' | 'compact' | 'leaderboard';
  showRanking?: boolean;
}

export const SacredSiteList: React.FC<SacredSiteListProps> = ({
  query = {},
  onSitePress,
  onSiteVisit,
  header,
  emptyMessage = '표시할 성소가 없습니다.',
  errorMessage = '성소 목록을 불러오는 중 오류가 발생했습니다.',
  variant = 'default',
  showRanking = false,
}) => {
  const [sites, setSites] = useState<SacredSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  const flatListRef = useRef<FlatList>(null);

  // Load sacred sites data
  const loadSites = useCallback(async (isRefresh = false) => {
    try {
      const currentOffset = isRefresh ? 0 : offset;
      const response = await sacredSiteService.getSacredSites({
        ...query,
        offset: currentOffset,
      });

      if (response.success && response.data) {
        const newSites = response.data.sites;
        
        if (isRefresh) {
          setSites(newSites);
          setOffset(newSites.length);
        } else {
          setSites(prev => [...prev, ...newSites]);
          setOffset(prev => prev + newSites.length);
        }
        
        setHasMore(response.data.pagination.hasMore);
        setError(null);
      } else {
        setError(response.error || errorMessage);
      }
    } catch (err) {
      setError(errorMessage);
      console.error('Error loading sacred sites:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [query, offset, errorMessage]);

  // Initial load
  React.useEffect(() => {
    setLoading(true);
    setOffset(0);
    loadSites(true);
  }, [query]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setOffset(0);
    loadSites(true);
  }, [loadSites]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      setLoadingMore(true);
      loadSites(false);
    }
  }, [loadingMore, hasMore, loading, loadSites]);

  // Render site item
  const renderSiteItem = useCallback(({ item, index }: { item: SacredSite; index: number }) => (
    <SacredSiteCard
      site={item}
      onPress={onSitePress}
      onVisit={onSiteVisit}
      rank={showRanking ? index + 1 : undefined}
      variant={variant}
      showDistance={!!query.latitude && !!query.longitude}
    />
  ), [onSitePress, onSiteVisit, showRanking, variant, query]);

  // Render loading footer
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={DesignSystem.colors.primary} />
        <Text style={styles.footerText}>더 많은 성소 로딩 중...</Text>
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
          <Text style={styles.loadingText}>성소 목록 로딩 중...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>⚠️</Text>
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
        <Text style={styles.emptyIcon}>🏛️</Text>
        <Text style={styles.emptyTitle}>성소가 없습니다</Text>
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
      data={sites}
      renderItem={renderSiteItem}
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
        sites.length === 0 && styles.emptyContentContainer,
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.xl,
  },
  loadingText: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.md,
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