import React, { useState, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { FeedList } from '../../components/feed/FeedList';
import { FeedHeader } from '../../components/feed/FeedHeader';
import { FeedItem, FeedQuery, TrendingTag, feedService } from '../../services/feed.service';
import { useLocation } from '../../hooks/useLocation';
import { useAuth } from '../../providers/AuthProvider';
import { DesignSystem } from '../../utils/designSystem';

export const TrendingScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { location } = useLocation();
  
  const [query, setQuery] = useState<FeedQuery>({
    limit: 20,
    offset: 0,
    contentType: 'mixed',
    sortBy: 'popular', // Default to popular for trending
    radiusMeters: 10000, // Wider radius for trending
    hoursAgo: 168, // Last week for trending
    latitude: location?.latitude,
    longitude: location?.longitude,
  });
  
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [feedKey, setFeedKey] = useState(0);

  // Load trending tags
  const loadTrendingTags = useCallback(async () => {
    try {
      const response = await feedService.getTrendingTags(15); // More tags for trending
      if (response.success && response.data) {
        setTrendingTags(response.data);
      }
    } catch (error) {
      console.error('Error loading trending tags:', error);
    }
  }, []);

  // Load trending tags on mount
  React.useEffect(() => {
    loadTrendingTags();
  }, [loadTrendingTags]);

  // Handle query changes
  const handleQueryChange = useCallback((newQuery: FeedQuery) => {
    setQuery(newQuery);
    setFeedKey(prev => prev + 1);
  }, []);

  // Handle feed refresh
  const handleRefresh = useCallback(() => {
    setFeedKey(prev => prev + 1);
    loadTrendingTags();
  }, [loadTrendingTags]);

  // Handle item press
  const handleItemPress = useCallback((item: FeedItem) => {
    switch (item.type) {
      case 'spot':
        navigation.navigate('SpotDetail' as never, { spotId: item.id } as never);
        break;
      case 'spark':
        navigation.navigate('SparkDetail' as never, { sparkId: item.id } as never);
        break;
      default:
        console.warn('Unknown item type:', item.type);
    }
  }, [navigation]);

  // Handle author press
  const handleAuthorPress = useCallback((authorId: string) => {
    if (authorId === user?.id) {
      navigation.navigate('Profile' as never);
    } else {
      navigation.navigate('UserProfile' as never, { userId: authorId } as never);
    }
  }, [navigation, user?.id]);

  // Render header
  const renderHeader = useCallback(() => (
    <FeedHeader
      query={query}
      onQueryChange={handleQueryChange}
      trendingTags={trendingTags}
      onRefresh={handleRefresh}
    />
  ), [query, handleQueryChange, trendingTags, handleRefresh]);

  return (
    <SafeAreaView style={styles.container}>
      <FeedList
        key={feedKey}
        query={query}
        onItemPress={handleItemPress}
        onAuthorPress={handleAuthorPress}
        header={renderHeader()}
        emptyMessage="현재 트렌딩 콘텐츠가 없습니다. 새로운 스팟을 만들어 트렌드를 시작해보세요!"
        errorMessage="트렌딩 콘텐츠를 불러오는 중 오류가 발생했습니다."
        showTrending={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.secondary,
  },
});