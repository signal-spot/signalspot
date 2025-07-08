import { useState, useEffect, useCallback, useRef } from 'react';
import { FeedItem, FeedQuery, FeedResponse, feedService } from '../services/feed.service';

interface UseFeedOptions {
  initialQuery?: FeedQuery;
  autoRefresh?: boolean;
  refreshInterval?: number;
  cacheKey?: string;
  showTrending?: boolean;
}

interface UseFeedResult {
  items: FeedItem[];
  loading: boolean;
  refreshing: boolean;
  loadingMore: boolean;
  error: string | null;
  hasMore: boolean;
  totalCount: number;
  metadata?: FeedResponse['metadata'];
  
  // Actions
  refresh: () => Promise<void>;
  loadMore: () => Promise<void>;
  updateQuery: (newQuery: Partial<FeedQuery>) => void;
  clearError: () => void;
  optimisticUpdate: (itemId: string, updater: (item: FeedItem) => FeedItem) => void;
}

// Simple in-memory cache for feed data
const feedCache = new Map<string, { data: FeedResponse; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const useFeed = (options: UseFeedOptions = {}): UseFeedResult => {
  const {
    initialQuery = {},
    autoRefresh = false,
    refreshInterval = 30000,
    cacheKey,
    showTrending = false,
  } = options;

  const [items, setItems] = useState<FeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [metadata, setMetadata] = useState<FeedResponse['metadata']>();
  const [query, setQuery] = useState<FeedQuery>({ limit: 20, offset: 0, ...initialQuery });

  const abortControllerRef = useRef<AbortController | null>(null);
  const refreshIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Generate cache key
  const getCacheKey = useCallback((feedQuery: FeedQuery): string => {
    if (cacheKey) return `${cacheKey}_${JSON.stringify(feedQuery)}`;
    return `feed_${JSON.stringify(feedQuery)}_${showTrending ? 'trending' : 'personal'}`;
  }, [cacheKey, showTrending]);

  // Get cached data
  const getCachedData = useCallback((feedQuery: FeedQuery): FeedResponse | null => {
    const key = getCacheKey(feedQuery);
    const cached = feedCache.get(key);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    
    // Remove expired cache
    if (cached) {
      feedCache.delete(key);
    }
    
    return null;
  }, [getCacheKey]);

  // Set cached data
  const setCachedData = useCallback((feedQuery: FeedQuery, data: FeedResponse): void => {
    const key = getCacheKey(feedQuery);
    feedCache.set(key, { data, timestamp: Date.now() });
    
    // Cleanup old cache entries (keep only last 10)
    if (feedCache.size > 10) {
      const entries = Array.from(feedCache.entries());
      entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
      const toKeep = entries.slice(0, 10);
      feedCache.clear();
      toKeep.forEach(([key, value]) => feedCache.set(key, value));
    }
  }, [getCacheKey]);

  // Load feed data
  const loadFeed = useCallback(async (
    feedQuery: FeedQuery,
    isRefresh = false,
    isLoadMore = false
  ): Promise<void> => {
    try {
      // Check cache first for initial loads
      if (!isRefresh && !isLoadMore) {
        const cachedData = getCachedData(feedQuery);
        if (cachedData) {
          setItems(cachedData.items);
          setHasMore(cachedData.pagination.hasMore);
          setTotalCount(cachedData.pagination.total);
          setMetadata(cachedData.metadata);
          setLoading(false);
          return;
        }
      }

      // Cancel previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      abortControllerRef.current = new AbortController();

      // Set loading states
      if (isRefresh) {
        setRefreshing(true);
      } else if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      setError(null);

      // Make API call
      const response = showTrending
        ? await feedService.getTrendingContent(feedQuery)
        : await feedService.getFeed(feedQuery);

      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }

      if (response.success && response.data) {
        const newItems = response.data.items;
        
        if (isRefresh || (!isLoadMore && feedQuery.offset === 0)) {
          // Replace all items
          setItems(newItems);
        } else if (isLoadMore) {
          // Append new items
          setItems(prev => [...prev, ...newItems]);
        } else {
          // Replace all items for new query
          setItems(newItems);
        }
        
        setHasMore(response.data.pagination.hasMore);
        setTotalCount(response.data.pagination.total);
        setMetadata(response.data.metadata);
        
        // Cache the data for initial loads
        if (!isLoadMore) {
          setCachedData(feedQuery, response.data);
        }
      } else {
        setError(response.error || 'Failed to load feed');
      }
    } catch (err) {
      // Don't set error if request was aborted
      if (!abortControllerRef.current?.signal.aborted) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        console.error('Error loading feed:', err);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, [getCachedData, setCachedData, showTrending]);

  // Refresh feed
  const refresh = useCallback(async (): Promise<void> => {
    const refreshQuery = { ...query, offset: 0 };
    setQuery(refreshQuery);
    await loadFeed(refreshQuery, true);
  }, [query, loadFeed]);

  // Load more items
  const loadMore = useCallback(async (): Promise<void> => {
    if (loadingMore || !hasMore || loading) {
      return;
    }
    
    const loadMoreQuery = { ...query, offset: items.length };
    await loadFeed(loadMoreQuery, false, true);
  }, [query, items.length, loadFeed, loadingMore, hasMore, loading]);

  // Update query
  const updateQuery = useCallback((newQuery: Partial<FeedQuery>): void => {
    const updatedQuery = { ...query, ...newQuery, offset: 0 };
    setQuery(updatedQuery);
  }, [query]);

  // Clear error
  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  // Optimistic update for interactions
  const optimisticUpdate = useCallback((
    itemId: string,
    updater: (item: FeedItem) => FeedItem
  ): void => {
    setItems(prev => prev.map(item => 
      item.id === itemId ? updater(item) : item
    ));
  }, []);

  // Load initial data
  useEffect(() => {
    loadFeed(query);
  }, [query.contentType, query.sortBy, query.latitude, query.longitude, query.radiusMeters, query.hoursAgo, query.tags]);

  // Auto refresh
  useEffect(() => {
    if (autoRefresh && refreshInterval > 0) {
      refreshIntervalRef.current = setInterval(() => {
        refresh();
      }, refreshInterval);
      
      return () => {
        if (refreshIntervalRef.current) {
          clearInterval(refreshIntervalRef.current);
        }
      };
    }
  }, [autoRefresh, refreshInterval, refresh]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, []);

  return {
    items,
    loading,
    refreshing,
    loadingMore,
    error,
    hasMore,
    totalCount,
    metadata,
    refresh,
    loadMore,
    updateQuery,
    clearError,
    optimisticUpdate,
  };
};