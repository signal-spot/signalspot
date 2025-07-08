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
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../providers/AuthProvider';
import { DesignSystem } from '../../utils/designSystem';
import { Card, Avatar, Badge, Button } from '../../components/common';
import { notificationService, NotificationType } from '../../services/notification.service';

const SparkTypeInfo = {
  proximity: { icon: '👋', name: '근접', color: '#4CAF50' },
  interest: { icon: '💭', name: '관심사', color: '#2196F3' },
  location: { icon: '📍', name: '장소', color: '#FF9800' },
  activity: { icon: '🎯', name: '활동', color: '#9C27B0' },
};

interface Spark {
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
  };
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'matched';
  createdAt: string;
  expiresAt: string;
  userResponded: boolean;
  isExpired: boolean;
}

const SparksScreen: React.FC = () => {
  const { user } = useAuth();
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'matched'>('all');

  const loadSparks = useCallback(async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // const response = await apiService.get('/sparks/my-sparks');
      
      // Mock data for development
      const mockSparks: Spark[] = [
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
            detectionTime: new Date().toISOString(),
          },
          status: 'pending',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(),
          userResponded: false,
          isExpired: false,
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
            sharedInterests: ['코딩', '여행', '카페'],
          },
          status: 'matched',
          createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
          expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(),
          userResponded: true,
          isExpired: false,
        },
      ];
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSparks(mockSparks);
    } catch (error) {
      console.error('Failed to load sparks:', error);
      Alert.alert('오류', '스파크를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadSparks();
    setRefreshing(false);
  }, [loadSparks]);

  const handleSparkResponse = async (sparkId: string, accepted: boolean) => {
    try {
      // In a real app, this would be an API call
      // await apiService.post(`/sparks/${sparkId}/respond`, { accepted });
      
      setSparks(prev => 
        prev.map(spark => 
          spark.id === sparkId 
            ? { 
                ...spark, 
                status: accepted ? 'matched' : 'declined',
                userResponded: true 
              }
            : spark
        )
      );

      if (accepted) {
        Alert.alert(
          '🎉 매칭 성공!',
          '축하합니다! 새로운 매칭이 성사되었어요. 메시지를 보내보세요!',
          [
            { text: '나중에', style: 'cancel' },
            { text: '메시지 보내기', onPress: () => {/* Navigate to chat */} },
          ]
        );
      }
    } catch (error) {
      Alert.alert('오류', '응답 처리에 실패했습니다.');
    }
  };

  const getFilteredSparks = () => {
    switch (filter) {
      case 'pending':
        return sparks.filter(spark => spark.status === 'pending');
      case 'matched':
        return sparks.filter(spark => spark.status === 'matched');
      default:
        return sparks;
    }
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

  const simulateNewSpark = () => {
    notificationService.simulateNotification(NotificationType.SPARK_DETECTED, {
      sparkId: 'new-spark',
      otherUserId: 'user4',
    });
  };

  useFocusEffect(
    useCallback(() => {
      loadSparks();
    }, [loadSparks])
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
        <Text style={styles.loadingText}>스파크를 불러오는 중...</Text>
      </View>
    );
  }

  const filteredSparks = getFilteredSparks();

  const renderSparkItem = ({ item }: { item: Spark }) => (
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
      </View>

      {/* Actions */}
      {item.status === 'pending' && !item.userResponded && (
        <View style={styles.sparkActions}>
          <Button
            variant="outline"
            style={styles.actionButton}
            onPress={() => handleSparkResponse(item.id, false)}
          >
            거절
          </Button>
          <Button
            variant="primary"
            style={styles.actionButton}
            onPress={() => handleSparkResponse(item.id, true)}
          >
            수락
          </Button>
        </View>
      )}

      {item.status === 'matched' && (
        <View style={styles.matchedActions}>
          <Button
            variant="primary"
            fullWidth
            onPress={() => {/* Navigate to chat */}}
          >
            💬 메시지 보내기
          </Button>
        </View>
      )}

      {/* Timestamp */}
      <Text style={styles.sparkTimestamp}>
        {getTimeAgo(item.createdAt)}
      </Text>
    </Card>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>✨ 스파크</Text>
        <Text style={styles.subtitle}>새로운 인연의 시작</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {(['all', 'pending', 'matched'] as const).map((filterType) => (
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
              {filterType === 'pending' && '대기중'}
              {filterType === 'matched' && '매칭됨'}
            </Text>
            {filterType === 'pending' && (
              <Badge variant="danger" size="small">
                {sparks.filter(s => s.status === 'pending').length}
              </Badge>
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Sparks List */}
      {filteredSparks.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>✨</Text>
          <Text style={styles.emptyTitle}>
            {filter === 'pending' && '대기중인 스파크가 없어요'}
            {filter === 'matched' && '매칭된 스파크가 없어요'}
            {filter === 'all' && '아직 스파크가 없어요'}
          </Text>
          <Text style={styles.emptySubtitle}>
            근처를 돌아다니며 새로운 인연을 만들어보세요!
          </Text>
          <Button 
            onPress={simulateNewSpark}
            variant="outline"
            style={styles.simulateButton}
          >
            테스트 스파크 생성
          </Button>
        </View>
      ) : (
        <FlatList
          data={filteredSparks}
          renderItem={renderSparkItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
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
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: DesignSystem.spacing.lg,
    marginBottom: DesignSystem.spacing.md,
  },
  filterTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.md,
    backgroundColor: DesignSystem.colors.background.secondary,
    marginHorizontal: DesignSystem.spacing.xs,
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
  sparkActions: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.md,
  },
  actionButton: {
    flex: 1,
  },
  matchedActions: {
    marginBottom: DesignSystem.spacing.md,
  },
  sparkTimestamp: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.tertiary,
    textAlign: 'right',
  },
  emptyContainer: {
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
    marginBottom: DesignSystem.spacing.lg,
  },
  simulateButton: {
    marginTop: DesignSystem.spacing.md,
  },
});

export default SparksScreen;