import React, { createContext, useContext, useCallback, useRef } from 'react';
import { FeedItem } from '../services/feed.service';

interface FeedContextType {
  // Cache management
  invalidateCache: (pattern?: string) => void;
  preloadItem: (item: FeedItem) => void;
  
  // Interaction tracking
  trackInteraction: (itemId: string, action: 'view' | 'like' | 'comment' | 'share') => void;
  
  // Optimistic updates
  updateItemOptimistically: (itemId: string, updates: Partial<FeedItem>) => void;
  
  // Performance metrics
  getPerformanceMetrics: () => {
    cacheHitRate: number;
    avgLoadTime: number;
    totalRequests: number;
  };
}

const FeedContext = createContext<FeedContextType | null>(null);

interface FeedProviderProps {
  children: React.ReactNode;
}

export const FeedProvider: React.FC<FeedProviderProps> = ({ children }) => {
  const interactionQueueRef = useRef<Array<{
    itemId: string;
    action: string;
    timestamp: number;
  }>>([]);
  
  const metricsRef = useRef({
    cacheHits: 0,
    cacheMisses: 0,
    totalLoadTime: 0,
    loadCount: 0,
    totalRequests: 0,
  });

  const preloadedItemsRef = useRef<Map<string, FeedItem>>(new Map());

  // Invalidate cache entries matching pattern
  const invalidateCache = useCallback((pattern?: string) => {
    // Clear specific cache entries or all if no pattern
    if (pattern) {
      // Implementation would clear cache entries matching pattern
      console.log('Invalidating cache for pattern:', pattern);
    } else {
      // Clear all cache
      console.log('Invalidating all cache');
    }
  }, []);

  // Preload item data for quick access
  const preloadItem = useCallback((item: FeedItem) => {
    preloadedItemsRef.current.set(item.id, item);
    
    // Limit preloaded items to prevent memory issues
    if (preloadedItemsRef.current.size > 100) {
      const entries = Array.from(preloadedItemsRef.current.entries());
      const toKeep = entries.slice(-50); // Keep last 50
      preloadedItemsRef.current.clear();
      toKeep.forEach(([key, value]) => preloadedItemsRef.current.set(key, value));
    }
  }, []);

  // Track user interactions for analytics
  const trackInteraction = useCallback((
    itemId: string,
    action: 'view' | 'like' | 'comment' | 'share'
  ) => {
    interactionQueueRef.current.push({
      itemId,
      action,
      timestamp: Date.now(),
    });

    // Batch send interactions every 10 interactions or 30 seconds
    if (interactionQueueRef.current.length >= 10) {
      flushInteractions();
    }
  }, []);

  // Flush interaction queue to server
  const flushInteractions = useCallback(async () => {
    const interactions = [...interactionQueueRef.current];
    interactionQueueRef.current = [];

    if (interactions.length === 0) return;

    try {
      // TODO: Send interactions to analytics service
      console.log('Flushing interactions:', interactions);
      
      // Example API call:
      // await analyticsService.trackBatch(interactions);
    } catch (error) {
      console.error('Error flushing interactions:', error);
      // Re-add interactions to queue on failure
      interactionQueueRef.current.unshift(...interactions);
    }
  }, []);

  // Periodic flush of interactions
  React.useEffect(() => {
    const interval = setInterval(flushInteractions, 30000); // 30 seconds
    return () => clearInterval(interval);
  }, [flushInteractions]);

  // Optimistically update item across all consumers
  const updateItemOptimistically = useCallback((
    itemId: string,
    updates: Partial<FeedItem>
  ) => {
    // Update preloaded item if exists
    const preloadedItem = preloadedItemsRef.current.get(itemId);
    if (preloadedItem) {
      preloadedItemsRef.current.set(itemId, { ...preloadedItem, ...updates });
    }

    // Broadcast update to all feed components
    // This would typically use a state management solution like Redux
    // For now, we'll emit a custom event
    const event = new CustomEvent('feedItemUpdate', {
      detail: { itemId, updates }
    });
    window.dispatchEvent?.(event);
  }, []);

  // Get performance metrics
  const getPerformanceMetrics = useCallback(() => {
    const metrics = metricsRef.current;
    return {
      cacheHitRate: metrics.totalRequests > 0 
        ? metrics.cacheHits / metrics.totalRequests 
        : 0,
      avgLoadTime: metrics.loadCount > 0 
        ? metrics.totalLoadTime / metrics.loadCount 
        : 0,
      totalRequests: metrics.totalRequests,
    };
  }, []);

  // Update metrics
  const updateMetrics = useCallback((type: 'hit' | 'miss' | 'load', value?: number) => {
    const metrics = metricsRef.current;
    
    switch (type) {
      case 'hit':
        metrics.cacheHits++;
        metrics.totalRequests++;
        break;
      case 'miss':
        metrics.cacheMisses++;
        metrics.totalRequests++;
        break;
      case 'load':
        if (value !== undefined) {
          metrics.totalLoadTime += value;
          metrics.loadCount++;
        }
        break;
    }
  }, []);

  // Expose metrics update for external use
  React.useEffect(() => {
    const handleMetricsUpdate = (event: CustomEvent) => {
      const { type, value } = event.detail;
      updateMetrics(type, value);
    };

    window.addEventListener?.('feedMetricsUpdate', handleMetricsUpdate as EventListener);
    
    return () => {
      window.removeEventListener?.('feedMetricsUpdate', handleMetricsUpdate as EventListener);
    };
  }, [updateMetrics]);

  const contextValue: FeedContextType = {
    invalidateCache,
    preloadItem,
    trackInteraction,
    updateItemOptimistically,
    getPerformanceMetrics,
  };

  return (
    <FeedContext.Provider value={contextValue}>
      {children}
    </FeedContext.Provider>
  );
};

export const useFeedContext = (): FeedContextType => {
  const context = useContext(FeedContext);
  if (!context) {
    throw new Error('useFeedContext must be used within a FeedProvider');
  }
  return context;
};

// Hook for easy interaction tracking
export const useFeedInteractions = (itemId: string) => {
  const { trackInteraction, updateItemOptimistically } = useFeedContext();

  const trackView = useCallback(() => {
    trackInteraction(itemId, 'view');
  }, [itemId, trackInteraction]);

  const trackLike = useCallback(() => {
    trackInteraction(itemId, 'like');
  }, [itemId, trackInteraction]);

  const trackComment = useCallback(() => {
    trackInteraction(itemId, 'comment');
  }, [itemId, trackInteraction]);

  const trackShare = useCallback(() => {
    trackInteraction(itemId, 'share');
  }, [itemId, trackInteraction]);

  const updateItem = useCallback((updates: Partial<FeedItem>) => {
    updateItemOptimistically(itemId, updates);
  }, [itemId, updateItemOptimistically]);

  return {
    trackView,
    trackLike,
    trackComment,
    trackShare,
    updateItem,
  };
};