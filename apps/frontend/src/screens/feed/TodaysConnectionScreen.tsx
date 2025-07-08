import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { FeedList } from '../../components/feed/FeedList';
import { FeedHeader } from '../../components/feed/FeedHeader';
import { FeedItem, FeedQuery, TrendingTag, feedService } from '../../services/feed.service';
import { useLocation } from '../../hooks/useLocation';
import { useAuth } from '../../providers/AuthProvider';
import { DesignSystem } from '../../utils/designSystem';

export const TodaysConnectionScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const { location } = useLocation();
  
  const [query, setQuery] = useState<FeedQuery>({
    limit: 20,
    offset: 0,
    contentType: 'mixed',
    sortBy: 'relevant',
    radiusMeters: 5000,
    hoursAgo: 24,
  });
  
  const [trendingTags, setTrendingTags] = useState<TrendingTag[]>([]);
  const [feedKey, setFeedKey] = useState(0); // Force feed refresh

  // Update query with location when available
  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      setQuery(prev => ({
        ...prev,
        latitude: location.latitude,
        longitude: location.longitude,
      }));
    }
  }, [location]);

  // Load trending tags
  const loadTrendingTags = useCallback(async () => {
    try {
      const response = await feedService.getTrendingTags(10);
      if (response.success && response.data) {
        setTrendingTags(response.data);
      }
    } catch (error) {
      console.error('Error loading trending tags:', error);
    }
  }, []);

  // Load trending tags on screen focus
  useFocusEffect(
    useCallback(() => {
      loadTrendingTags();
    }, [loadTrendingTags])
  );

  // Handle query changes
  const handleQueryChange = useCallback((newQuery: FeedQuery) => {
    setQuery(newQuery);
    setFeedKey(prev => prev + 1); // Force feed refresh
  }, []);

  // Handle feed refresh
  const handleRefresh = useCallback(() => {
    setFeedKey(prev => prev + 1);
    loadTrendingTags();
  }, [loadTrendingTags]);

  // Handle item press (navigate to detail)
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

  // Handle author press (navigate to profile)
  const handleAuthorPress = useCallback((authorId: string) => {
    if (authorId === user?.id) {
      // Navigate to own profile
      navigation.navigate('Profile' as never);
    } else {
      // Navigate to other user's profile
      navigation.navigate('UserProfile' as never, { userId: authorId } as never);
    }
  }, [navigation, user?.id]);

  // Render header component
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
        emptyMessage="아직 표시할 콘텐츠가 없습니다. 주변을 둘러보거나 직접 스팟을 만들어보세요!"
        errorMessage="피드를 불러오는 중 오류가 발생했습니다. 네트워크 연결을 확인해주세요."
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