import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { DesignSystem } from '../../utils/designSystem';
import { Card, Badge, LoadingSpinner } from '../../components/common';

interface SparkData {
  id: string;
  title: string;
  description: string;
  location: string;
  createdAt: string;
  status: 'active' | 'expired' | 'completed';
  responseCount: number;
  isPublic: boolean;
}

interface NoteData {
  id: string;
  title: string;
  content: string;
  sender: {
    id: string;
    username: string;
    avatar?: string;
  };
  location: string;
  createdAt: string;
  isRead: boolean;
  hasResponse: boolean;
}

const MySignalsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sparks' | 'notes'>('sparks');
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Mock data - in real app, this would come from API
  const mockSparks: SparkData[] = [
    {
      id: '1',
      title: '강남역 근처 맛집 추천 받습니다!',
      description: '새로운 곳으로 이사 와서 주변 맛집을 찾고 있어요.',
      location: '강남역 2번출구',
      createdAt: '2024-01-15T10:30:00Z',
      status: 'active',
      responseCount: 3,
      isPublic: true,
    },
    {
      id: '2',
      title: '함께 운동할 사람 구해요',
      description: '헬스장에서 함께 운동할 파트너를 찾습니다.',
      location: '홍대입구역',
      createdAt: '2024-01-14T15:45:00Z',
      status: 'expired',
      responseCount: 0,
      isPublic: true,
    },
  ];

  const mockNotes: NoteData[] = [
    {
      id: '1',
      title: '맛집 추천 드려요!',
      content: '강남역 근처 정말 맛있는 일식집이 있어요. 혼자 가기엔 좀 비싸지만...',
      sender: {
        id: 'user2',
        username: '미식가123',
        avatar: 'https://example.com/avatar1.jpg',
      },
      location: '강남역 2번출구',
      createdAt: '2024-01-15T11:00:00Z',
      isRead: false,
      hasResponse: false,
    },
    {
      id: '2',
      title: '운동 파트너 구하는 글 봤어요',
      content: '저도 홍대에서 운동하고 있는데 함께 하실래요?',
      sender: {
        id: 'user3',
        username: '헬스맨',
        avatar: 'https://example.com/avatar2.jpg',
      },
      location: '홍대입구역',
      createdAt: '2024-01-14T16:00:00Z',
      isRead: true,
      hasResponse: true,
    },
  ];

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  }, []);

  const handleSparkPress = (spark: SparkData) => {
    // Navigate to spark detail or show actions
    Alert.alert(
      '스파크 관리',
      `"${spark.title}" 스파크에 대한 작업을 선택하세요.`,
      [
        { text: '상세보기', onPress: () => console.log('View spark details') },
        { text: '수정하기', onPress: () => console.log('Edit spark') },
        { text: '삭제하기', onPress: () => console.log('Delete spark'), style: 'destructive' },
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  const handleNotePress = (note: NoteData) => {
    // Navigate to note detail or chat
    Alert.alert(
      '쪽지 관리',
      `"${note.title}" 쪽지에 대한 작업을 선택하세요.`,
      [
        { text: '답장하기', onPress: () => console.log('Reply to note') },
        { text: '채팅하기', onPress: () => console.log('Start chat') },
        { text: '삭제하기', onPress: () => console.log('Delete note'), style: 'destructive' },
        { text: '취소', style: 'cancel' },
      ]
    );
  };

  const getSparkStatusColor = (status: SparkData['status']) => {
    switch (status) {
      case 'active':
        return DesignSystem.colors.success;
      case 'expired':
        return DesignSystem.colors.warning;
      case 'completed':
        return DesignSystem.colors.info;
      default:
        return DesignSystem.colors.text.secondary;
    }
  };

  const getSparkStatusText = (status: SparkData['status']) => {
    switch (status) {
      case 'active':
        return '활성';
      case 'expired':
        return '만료';
      case 'completed':
        return '완료';
      default:
        return '알 수 없음';
    }
  };

  const renderSparkCard = ({ item }: { item: SparkData }) => (
    <Card style={styles.card}>
      <TouchableOpacity onPress={() => handleSparkPress(item)}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Badge
              variant={item.status === 'active' ? 'success' : item.status === 'expired' ? 'warning' : 'info'}
              size="small"
            >
              {getSparkStatusText(item.status)}
            </Badge>
          </View>
          <View style={styles.cardLocation}>
            <Icon name="location-outline" size={14} color={DesignSystem.colors.text.secondary} />
            <Text style={styles.locationText}>{item.location}</Text>
          </View>
        </View>
        
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.cardStats}>
            <View style={styles.statItem}>
              <Icon name="chatbubble-outline" size={16} color={DesignSystem.colors.text.secondary} />
              <Text style={styles.statText}>{item.responseCount}</Text>
            </View>
            <View style={styles.statItem}>
              <Icon 
                name={item.isPublic ? 'globe-outline' : 'lock-closed-outline'} 
                size={16} 
                color={DesignSystem.colors.text.secondary} 
              />
              <Text style={styles.statText}>{item.isPublic ? '공개' : '비공개'}</Text>
            </View>
          </View>
          <Text style={styles.timeText}>
            {new Date(item.createdAt).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </TouchableOpacity>
    </Card>
  );

  const renderNoteCard = ({ item }: { item: NoteData }) => (
    <Card style={[styles.card, !item.isRead && styles.unreadCard]}>
      <TouchableOpacity onPress={() => handleNotePress(item)}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.badgeContainer}>
              {!item.isRead && (
                <Badge variant="danger" size="small">
                  새로운
                </Badge>
              )}
              {item.hasResponse && (
                <Badge variant="info" size="small">
                  답장완료
                </Badge>
              )}
            </View>
          </View>
          <View style={styles.senderInfo}>
            <Text style={styles.senderName}>{item.sender.username}</Text>
            <View style={styles.cardLocation}>
              <Icon name="location-outline" size={14} color={DesignSystem.colors.text.secondary} />
              <Text style={styles.locationText}>{item.location}</Text>
            </View>
          </View>
        </View>
        
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.content}
        </Text>
        
        <View style={styles.cardFooter}>
          <View style={styles.cardStats}>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="chatbubble-outline" size={16} color={DesignSystem.colors.primary} />
              <Text style={styles.actionText}>답장</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Icon name="person-outline" size={16} color={DesignSystem.colors.primary} />
              <Text style={styles.actionText}>채팅</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.timeText}>
            {new Date(item.createdAt).toLocaleDateString('ko-KR', {
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </TouchableOpacity>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>내 시그널</Text>
        <TouchableOpacity style={styles.settingsButton}>
          <Icon name="settings-outline" size={24} color={DesignSystem.colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'sparks' && styles.activeTab]}
          onPress={() => setActiveTab('sparks')}
        >
          <Text style={[styles.tabText, activeTab === 'sparks' && styles.activeTabText]}>
            내 스파크
          </Text>
          {mockSparks.length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>{mockSparks.length}</Text>
            </View>
          )}
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'notes' && styles.activeTab]}
          onPress={() => setActiveTab('notes')}
        >
          <Text style={[styles.tabText, activeTab === 'notes' && styles.activeTabText]}>
            내 쪽지
          </Text>
          {mockNotes.filter(note => !note.isRead).length > 0 && (
            <View style={styles.tabBadge}>
              <Text style={styles.tabBadgeText}>
                {mockNotes.filter(note => !note.isRead).length}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <LoadingSpinner />
        ) : (
          <FlatList
            data={activeTab === 'sparks' ? mockSparks : mockNotes}
            renderItem={activeTab === 'sparks' ? renderSparkCard : renderNoteCard}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Icon 
                  name={activeTab === 'sparks' ? 'flash-outline' : 'mail-outline'} 
                  size={48} 
                  color={DesignSystem.colors.text.tertiary} 
                />
                <Text style={styles.emptyStateTitle}>
                  {activeTab === 'sparks' ? '생성한 스파크가 없습니다' : '받은 쪽지가 없습니다'}
                </Text>
                <Text style={styles.emptyStateDescription}>
                  {activeTab === 'sparks' 
                    ? '지도에서 새로운 스파크를 생성해보세요!' 
                    : '다른 사용자들과 소통해보세요!'}
                </Text>
              </View>
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DesignSystem.colors.background.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: DesignSystem.spacing.md,
    paddingVertical: DesignSystem.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: DesignSystem.colors.border.light,
  },
  headerTitle: {
    ...DesignSystem.typography.title2,
    fontWeight: '700',
    color: DesignSystem.colors.text.primary,
  },
  settingsButton: {
    padding: DesignSystem.spacing.xs,
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: DesignSystem.colors.background.secondary,
    paddingHorizontal: DesignSystem.spacing.sm,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.md,
    paddingHorizontal: DesignSystem.spacing.sm,
    position: 'relative',
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: DesignSystem.colors.primary,
  },
  tabText: {
    ...DesignSystem.typography.body,
    fontWeight: '600',
    color: DesignSystem.colors.text.secondary,
  },
  activeTabText: {
    color: DesignSystem.colors.primary,
  },
  tabBadge: {
    backgroundColor: DesignSystem.colors.danger,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: DesignSystem.spacing.xs,
  },
  tabBadgeText: {
    ...DesignSystem.typography.caption2,
    color: DesignSystem.colors.text.inverse,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  listContainer: {
    padding: DesignSystem.spacing.md,
  },
  card: {
    marginBottom: DesignSystem.spacing.md,
    padding: DesignSystem.spacing.md,
  },
  unreadCard: {
    borderLeftWidth: 4,
    borderLeftColor: DesignSystem.colors.primary,
  },
  cardHeader: {
    marginBottom: DesignSystem.spacing.sm,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: DesignSystem.spacing.xs,
  },
  cardTitle: {
    ...DesignSystem.typography.headline,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
    flex: 1,
    marginRight: DesignSystem.spacing.sm,
  },
  badgeContainer: {
    flexDirection: 'row',
    gap: DesignSystem.spacing.xs,
  },
  cardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
  },
  locationText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
  },
  senderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  senderName: {
    ...DesignSystem.typography.subheadline,
    fontWeight: '600',
    color: DesignSystem.colors.text.primary,
  },
  cardDescription: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.secondary,
    lineHeight: 20,
    marginBottom: DesignSystem.spacing.sm,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.md,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
  },
  statText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.secondary,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: DesignSystem.spacing.xs,
    paddingHorizontal: DesignSystem.spacing.sm,
    paddingVertical: DesignSystem.spacing.xs,
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: 16,
  },
  actionText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.primary,
    fontWeight: '600',
  },
  timeText: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.tertiary,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: DesignSystem.spacing.xl * 2,
  },
  emptyStateTitle: {
    ...DesignSystem.typography.headline,
    fontWeight: '600',
    color: DesignSystem.colors.text.secondary,
    marginTop: DesignSystem.spacing.md,
    marginBottom: DesignSystem.spacing.sm,
  },
  emptyStateDescription: {
    ...DesignSystem.typography.body,
    color: DesignSystem.colors.text.tertiary,
    textAlign: 'center',
  },
});

export default MySignalsScreen;