import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../providers/AuthProvider';
import { DesignSystem } from '../../utils/designSystem';
import { Card, Avatar, Badge, Button } from '../../components/common';

interface SparkLog {
  id: string;
  type: 'proximity' | 'interest' | 'location' | 'activity';
  otherUser: {
    id: string;
    username: string;
    avatarUrl?: string;
    age?: number;
  };
  strength: number;
  distance?: number;
  metadata: {
    sharedInterests?: string[];
    duration?: number;
    detectionTime?: string;
    location?: {
      name: string;
      address: string;
    };
    activityType?: string;
  };
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'matched';
  createdAt: string;
  expiresAt: string;
  isExpired: boolean;
  matchedAt?: string;
  declinedAt?: string;
}

interface SparkStats {
  total: number;
  matched: number;
  pending: number;
  declined: number;
  expired: number;
  averageStrength: number;
  thisWeek: number;
  thisMonth: number;
  byType: {
    proximity: number;
    interest: number;
    location: number;
    activity: number;
  };
}

const SparkTypeInfo = {
  proximity: { icon: '👋', name: '근접', color: '#4CAF50' },
  interest: { icon: '💭', name: '관심사', color: '#2196F3' },
  location: { icon: '📍', name: '장소', color: '#FF9800' },
  activity: { icon: '🎯', name: '활동', color: '#9C27B0' },
};

const SparkStatusInfo = {
  pending: { icon: '⏳', name: '대기중', color: '#FFC107' },
  matched: { icon: '💖', name: '매칭됨', color: '#4CAF50' },
  declined: { icon: '❌', name: '거절됨', color: '#F44336' },
  expired: { icon: '⏰', name: '만료됨', color: '#9E9E9E' },
  accepted: { icon: '✅', name: '수락됨', color: '#4CAF50' },
};

const SparkLogScreen: React.FC = () => {
  const { user } = useAuth();
  const [sparkLogs, setSparkLogs] = useState<SparkLog[]>([]);
  const [sparkStats, setSparkStats] = useState<SparkStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'matched' | 'pending' | 'declined' | 'expired'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'stats'>('list');

  const loadSparkLogs = useCallback(async () => {
    try {
      setLoading(true);
      
      // In a real app, this would be API calls
      // const [logsResponse, statsResponse] = await Promise.all([
      //   apiService.get('/sparks/my-logs'),
      //   apiService.get('/sparks/my-stats')
      // ]);

      // Mock data for development
      const mockSparkLogs: SparkLog[] = [
        {
          id: '1',
          type: 'proximity',
          otherUser: {
            id: 'user1',
            username: '김민수',
            avatarUrl: undefined,
            age: 28,
          },
          strength: 85,
          distance: 25,
          metadata: {
            duration: 420,
            detectionTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            location: {
              name: '스타벅스 강남점',
              address: '서울시 강남구 테헤란로',
            },
          },
          status: 'matched',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
          isExpired: false,
          matchedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          type: 'interest',
          otherUser: {
            id: 'user2',
            username: '이지은',
            avatarUrl: undefined,
            age: 25,
          },
          strength: 92,
          metadata: {
            sharedInterests: ['코딩', '여행', '카페', '독서'],
          },
          status: 'pending',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(),
          isExpired: false,
        },
        {
          id: '3',
          type: 'location',
          otherUser: {
            id: 'user3',
            username: '박준호',
            avatarUrl: undefined,
            age: 30,
          },
          strength: 75,
          metadata: {
            location: {
              name: '홍대 걷고싶은거리',
              address: '서울시 마포구 홍대',
            },
          },
          status: 'declined',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          isExpired: true,
          declinedAt: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '4',
          type: 'activity',
          otherUser: {
            id: 'user4',
            username: '최유진',
            avatarUrl: undefined,
            age: 26,
          },
          strength: 88,
          metadata: {
            activityType: '운동',
          },
          status: 'expired',
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          isExpired: true,
        },
      ];

      const mockStats: SparkStats = {
        total: 12,
        matched: 3,
        pending: 2,
        declined: 4,
        expired: 3,
        averageStrength: 78,
        thisWeek: 6,
        thisMonth: 12,
        byType: {
          proximity: 5,
          interest: 4,
          location: 2,
          activity: 1,
        },
      };

      setSparkLogs(mockSparkLogs);
      setSparkStats(mockStats);
    } catch (error) {
      console.error('Failed to load spark logs:', error);
      Alert.alert('오류', '스파크 로그를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSparkLogs();
    setRefreshing(false);
  }, [loadSparkLogs]);

  const getFilteredSparks = () => {
    if (filter === 'all') return sparkLogs;
    return sparkLogs.filter(spark => spark.status === filter);
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 전`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}일 전`;
    }
  };

  const getRemainingTime = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffInMs = expiry.getTime() - now.getTime();
    
    if (diffInMs <= 0) return '만료됨';
    
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes}분 남음`;
    } else if (diffInHours < 24) {
      return `${diffInHours}시간 남음`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}일 남음`;
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadSparkLogs();
    }, [loadSparkLogs])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
        <Text style={styles.loadingText}>스파크 로그를 불러오는 중...</Text>
      </View>
    );
  }

  const filteredSparks = getFilteredSparks();

  const renderSparkLogItem = ({ item }: { item: SparkLog }) => (
    <Card style={styles.sparkCard}>
      <View style={styles.sparkHeader}>
        <View style={styles.sparkUserInfo}>
          <Avatar
            name={item.otherUser.username}
            size="large"
            showBorder
            borderColor={SparkTypeInfo[item.type].color}
          />
          <View style={styles.sparkUserDetails}>
            <Text style={styles.sparkUsername}>
              {item.otherUser.username}
            </Text>
            {item.otherUser.age && (
              <Text style={styles.sparkUserAge}>
                {item.otherUser.age}세
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.sparkMeta}>
          <Badge 
            variant={item.status === 'matched' ? 'success' : 'primary'}
            style={[
              styles.sparkTypeBadge,
              { backgroundColor: SparkTypeInfo[item.type].color }
            ]}
          >
            {SparkTypeInfo[item.type].icon} {SparkTypeInfo[item.type].name}
          </Badge>
          <Text style={styles.sparkStrength}>
            강도: {item.strength}%
          </Text>
        </View>
      </View>

      {/* Spark Details */}
      <View style={styles.sparkDetails}>
        {item.distance && (
          <Text style={styles.sparkDetailText}>
            📍 거리: {item.distance}m
          </Text>
        )}
        {item.metadata.duration && (
          <Text style={styles.sparkDetailText}>
            ⏱️ 지속시간: {Math.round(item.metadata.duration / 60)}분
          </Text>
        )}
        {item.metadata.sharedInterests && (
          <Text style={styles.sparkDetailText}>
            💭 공통 관심사: {item.metadata.sharedInterests.join(', ')}
          </Text>
        )}
        {item.metadata.location && (
          <Text style={styles.sparkDetailText}>
            🏢 장소: {item.metadata.location.name}
          </Text>
        )}
        {item.metadata.activityType && (
          <Text style={styles.sparkDetailText}>
            🎯 활동: {item.metadata.activityType}
          </Text>
        )}
      </View>

      {/* Status and Timeline */}
      <View style={styles.sparkStatusRow}>
        <Badge
          variant={item.status === 'matched' ? 'success' : 
                  item.status === 'pending' ? 'warning' : 
                  item.status === 'declined' ? 'danger' : 'secondary'}
        >
          {SparkStatusInfo[item.status]?.icon} {SparkStatusInfo[item.status]?.name}
        </Badge>
        
        <Text style={styles.sparkTime}>
          {getTimeAgo(item.createdAt)}
        </Text>
      </View>

      {/* Additional Status Info */}
      {item.status === 'pending' && !item.isExpired && (
        <Text style={styles.expiryText}>
          ⏰ {getRemainingTime(item.expiresAt)}
        </Text>
      )}
      {item.matchedAt && (
        <Text style={styles.statusText}>
          💖 매칭됨: {getTimeAgo(item.matchedAt)}
        </Text>
      )}
      {item.declinedAt && (
        <Text style={styles.statusText}>
          ❌ 거절됨: {getTimeAgo(item.declinedAt)}
        </Text>
      )}
    </Card>
  );

  const renderStatsView = () => {
    if (!sparkStats) return null;

    return (
      <ScrollView style={styles.statsContainer}>
        {/* Overall Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 전체 통계</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{sparkStats.total}</Text>
              <Text style={styles.statLabel}>총 스파크</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: DesignSystem.colors.success }]}>
                {sparkStats.matched}
              </Text>
              <Text style={styles.statLabel}>매칭 성공</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: DesignSystem.colors.warning }]}>
                {sparkStats.pending}
              </Text>
              <Text style={styles.statLabel}>대기중</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{sparkStats.averageStrength}%</Text>
              <Text style={styles.statLabel}>평균 강도</Text>
            </View>
          </View>
        </Card>

        {/* Period Stats */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>📅 기간별 통계</Text>
          <View style={styles.periodStats}>
            <View style={styles.periodItem}>
              <Text style={styles.periodNumber}>{sparkStats.thisWeek}</Text>
              <Text style={styles.periodLabel}>이번 주</Text>
            </View>
            <View style={styles.periodItem}>
              <Text style={styles.periodNumber}>{sparkStats.thisMonth}</Text>
              <Text style={styles.periodLabel}>이번 달</Text>
            </View>
          </View>
        </Card>

        {/* Type Distribution */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>🎯 유형별 분포</Text>
          <View style={styles.typeStats}>
            {Object.entries(sparkStats.byType).map(([type, count]) => (
              <View key={type} style={styles.typeStatItem}>
                <View style={styles.typeStatHeader}>
                  <Text style={styles.typeStatIcon}>
                    {SparkTypeInfo[type as keyof typeof SparkTypeInfo].icon}
                  </Text>
                  <Text style={styles.typeStatName}>
                    {SparkTypeInfo[type as keyof typeof SparkTypeInfo].name}
                  </Text>
                </View>
                <Text style={styles.typeStatCount}>{count}개</Text>
              </View>
            ))}
          </View>
        </Card>

        {/* Success Rate */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>🎯 성공률</Text>
          <View style={styles.successRate}>
            <Text style={styles.successRateNumber}>
              {sparkStats.total > 0 ? Math.round((sparkStats.matched / sparkStats.total) * 100) : 0}%
            </Text>
            <Text style={styles.successRateLabel}>
              전체 스파크 중 매칭 성공률
            </Text>
          </View>
        </Card>
      </ScrollView>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>✨ 스파크 로그</Text>
        <Text style={styles.subtitle}>나의 스파크 히스토리</Text>
      </View>

      {/* View Mode Toggle */}
      <View style={styles.viewModeContainer}>
        <TouchableOpacity
          style={[
            styles.viewModeTab,
            viewMode === 'list' && styles.viewModeTabActive,
          ]}
          onPress={() => setViewMode('list')}
        >
          <Text
            style={[
              styles.viewModeTabText,
              viewMode === 'list' && styles.viewModeTabTextActive,
            ]}
          >
            📋 리스트
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.viewModeTab,
            viewMode === 'stats' && styles.viewModeTabActive,
          ]}
          onPress={() => setViewMode('stats')}
        >
          <Text
            style={[
              styles.viewModeTabText,
              viewMode === 'stats' && styles.viewModeTabTextActive,
            ]}
          >
            📊 통계
          </Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'stats' ? (
        renderStatsView()
      ) : (
        <>
          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(['all', 'matched', 'pending', 'declined', 'expired'] as const).map((filterType) => (
                <TouchableOpacity
                  key={filterType}
                  style={[
                    styles.filterTab,
                    filter === filterType && styles.filterTabActive,
                  ]}
                  onPress={() => setFilter(filterType)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      filter === filterType && styles.filterTabTextActive,
                    ]}
                  >
                    {filterType === 'all' && '전체'}
                    {filterType === 'matched' && '💖 매칭됨'}
                    {filterType === 'pending' && '⏳ 대기중'}
                    {filterType === 'declined' && '❌ 거절됨'}
                    {filterType === 'expired' && '⏰ 만료됨'}
                  </Text>
                  {filterType !== 'all' && (
                    <Badge variant="secondary" size="small">
                      {sparkLogs.filter(s => s.status === filterType).length}
                    </Badge>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Spark List */}
          {filteredSparks.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>✨</Text>
              <Text style={styles.emptyTitle}>
                {filter === 'all' ? '아직 스파크가 없어요' : 
                 filter === 'matched' ? '매칭된 스파크가 없어요' :
                 filter === 'pending' ? '대기중인 스파크가 없어요' :
                 filter === 'declined' ? '거절된 스파크가 없어요' :
                 '만료된 스파크가 없어요'}
              </Text>
              <Text style={styles.emptySubtitle}>
                근처를 돌아다니며 새로운 스파크를 만들어보세요!
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredSparks}
              renderItem={renderSparkLogItem}
              keyExtractor={(item) => item.id}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
              }
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.listContainer}
            />
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: DesignSystem.colors.background.primary,
  },
  loadingText: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.md,
  },
  header: {
    padding: DesignSystem.spacing.lg,
    paddingTop: DesignSystem.spacing.xxl,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  title: {
    ...DesignSystem.typography.largeTitle,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.xs,
  },
  subtitle: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
  },
  viewModeContainer: {
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.md,
  },
  viewModeTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.background.secondary,
    marginHorizontal: DesignSystem.spacing.xs,
    borderRadius: DesignSystem.borderRadius.md,
  },
  viewModeTabActive: {
    backgroundColor: DesignSystem.colors.primary,
  },
  viewModeTabText: {
    ...DesignSystem.typography.subheadline,
    color: DesignSystem.colors.text.secondary,
    fontWeight: '600',
  },
  viewModeTabTextActive: {
    color: DesignSystem.colors.text.inverse,
  },
  filterContainer: {
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.md,
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.sm,
    paddingHorizontal: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.background.secondary,
    marginRight: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.md,
    gap: DesignSystem.spacing.xs,
  },
  filterTabActive: {
    backgroundColor: DesignSystem.colors.primary,
  },
  filterTabText: {
    ...DesignSystem.typography.subheadline,
    color: DesignSystem.colors.text.secondary,
    fontWeight: '600',
  },
  filterTabTextActive: {
    color: DesignSystem.colors.text.inverse,
  },
  listContainer: {
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingBottom: DesignSystem.spacing.lg,
  },
  sparkCard: {
    marginBottom: DesignSystem.spacing.md,
  },
  sparkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignSystem.spacing.md,
  },
  sparkUserInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sparkUserDetails: {
    marginLeft: DesignSystem.spacing.md,
    flex: 1,
  },
  sparkUsername: {
    ...DesignSystem.typography.headline,
    color: DesignSystem.colors.text.primary,
  },
  sparkUserAge: {
    ...DesignSystem.typography.subheadline,
    color: DesignSystem.colors.text.secondary,
  },
  sparkMeta: {
    alignItems: 'flex-end',
  },
  sparkTypeBadge: {
    marginBottom: DesignSystem.spacing.xs,
  },
  sparkStrength: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
    fontWeight: '600',
  },
  sparkDetails: {
    marginBottom: DesignSystem.spacing.md,
  },
  sparkDetailText: {
    ...DesignSystem.typography.subheadline,
    color: DesignSystem.colors.text.secondary,
    marginBottom: DesignSystem.spacing.xs,
  },
  sparkStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.sm,
  },
  sparkTime: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.tertiary,
  },
  expiryText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.warning,
    fontWeight: '600',
  },
  statusText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.xxl * 2,
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
  emptySubtitle: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    textAlign: 'center',
    paddingHorizontal: DesignSystem.spacing.xl,
  },
  // Stats View Styles
  statsContainer: {
    flex: 1,
    paddingHorizontal: DesignSystem.spacing.lg,
  },
  statsCard: {
    marginBottom: DesignSystem.spacing.lg,
  },
  statsTitle: {
    ...DesignSystem.typography.title3,
    color: DesignSystem.colors.text.primary,
    marginBottom: DesignSystem.spacing.lg,
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    alignItems: 'center',
    width: '48%',
    marginBottom: DesignSystem.spacing.lg,
  },
  statNumber: {
    ...DesignSystem.typography.largeTitle,
    color: DesignSystem.colors.primary,
    fontWeight: '700',
  },
  statLabel: {
    ...DesignSystem.typography.subheadline,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.xs,
  },
  periodStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  periodItem: {
    alignItems: 'center',
  },
  periodNumber: {
    ...DesignSystem.typography.title1,
    color: DesignSystem.colors.primary,
    fontWeight: '700',
  },
  periodLabel: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.xs,
  },
  typeStats: {
    gap: DesignSystem.spacing.md,
  },
  typeStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.sm,
  },
  typeStatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeStatIcon: {
    fontSize: 20,
    marginRight: DesignSystem.spacing.md,
  },
  typeStatName: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  typeStatCount: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.primary,
    fontWeight: '700',
  },
  successRate: {
    alignItems: 'center',
  },
  successRateNumber: {
    ...DesignSystem.typography.largeTitle,
    color: DesignSystem.colors.success,
    fontWeight: '700',
  },
  successRateLabel: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.sm,
    textAlign: 'center',
  },
});

export default SparkLogScreen;