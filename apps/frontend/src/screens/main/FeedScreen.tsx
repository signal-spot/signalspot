import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import { useLocation } from '../../hooks/useLocation';
import styled from 'styled-components/native';

const { width } = Dimensions.get('window');

// Styled components
const Container = styled.View`
  flex: 1;
  background-color: #f5f5f5;
`;

const HeaderContainer = styled.View`
  background-color: #ffffff;
  padding: 50px 20px 20px;
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
`;

const HeaderTitle = styled.Text`
  font-size: 24px;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-bottom: 5px;
`;

const HeaderSubtitle = styled.Text`
  font-size: 14px;
  color: #666;
  text-align: center;
`;

const FeedCard = styled.TouchableOpacity`
  background-color: #ffffff;
  margin: 10px 15px;
  border-radius: 12px;
  padding: 20px;
  shadow-color: #000;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.1;
  shadow-radius: 3.84px;
  elevation: 3;
`;

const FeedCardHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;

const FeedCardAvatar = styled.View`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background-color: #ff6b6b;
  justify-content: center;
  align-items: center;
  margin-right: 12px;
`;

const FeedCardAvatarText = styled.Text`
  color: #ffffff;
  font-size: 16px;
  font-weight: bold;
`;

const FeedCardUserInfo = styled.View`
  flex: 1;
`;

const FeedCardUsername = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
`;

const FeedCardTime = styled.Text`
  font-size: 12px;
  color: #666;
`;

const FeedCardContent = styled.Text`
  font-size: 16px;
  color: #333;
  line-height: 22px;
  margin-bottom: 15px;
`;

const FeedCardLocation = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
`;

const FeedCardActions = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: 15px;
  border-top-width: 1px;
  border-top-color: #f0f0f0;
`;

const ActionButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  padding: 8px 16px;
  border-radius: 20px;
  background-color: #f8f8f8;
`;

const ActionButtonText = styled.Text`
  font-size: 14px;
  color: #666;
  margin-left: 5px;
`;

const EmptyStateContainer = styled.View`
  flex: 1;
  justify-content: center;
  align-items: center;
  padding: 40px;
`;

const EmptyStateIcon = styled.Text`
  font-size: 60px;
  margin-bottom: 20px;
`;

const EmptyStateTitle = styled.Text`
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  text-align: center;
`;

const EmptyStateSubtitle = styled.Text`
  font-size: 14px;
  color: #666;
  text-align: center;
  line-height: 20px;
`;

const FilterContainer = styled.View`
  flex-direction: row;
  padding: 15px;
  background-color: #ffffff;
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
`;

const FilterButton = styled.TouchableOpacity<{ active?: boolean }>`
  padding: 8px 16px;
  border-radius: 20px;
  background-color: ${props => props.active ? '#ff6b6b' : '#f0f0f0'};
  margin-right: 10px;
`;

const FilterButtonText = styled.Text<{ active?: boolean }>`
  font-size: 14px;
  font-weight: bold;
  color: ${props => props.active ? '#ffffff' : '#666'};
`;

interface FeedItem {
  id: string;
  type: 'spot' | 'spark' | 'connection';
  content: string;
  author: {
    id: string;
    nickname: string;
    avatar?: string;
  };
  location: {
    name: string;
    distance: number;
  };
  createdAt: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

const FeedScreen: React.FC = () => {
  const { user } = useAuth();
  const { location } = useLocation();
  const [feedItems, setFeedItems] = useState<FeedItem[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'spots' | 'sparks' | 'connections'>('all');

  useEffect(() => {
    loadFeedData();
  }, []);

  const loadFeedData = async () => {
    try {
      // TODO: Implement API call to fetch feed data
      // Mock data for now
      const mockFeedItems: FeedItem[] = [
        {
          id: '1',
          type: 'spot',
          content: '혼자 커피 마시고 있어요. 같이 이야기 나누실 분?',
          author: {
            id: '1',
            nickname: '커피러버',
          },
          location: {
            name: '스타벅스 강남점',
            distance: 150,
          },
          createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          likes: 3,
          comments: 1,
          isLiked: false,
        },
        {
          id: '2',
          type: 'spark',
          content: '지금 같은 장소에 있었던 누군가와 스파크가 생겼어요!',
          author: {
            id: '2',
            nickname: '신비한만남',
          },
          location: {
            name: '홍대 걷고싶은거리',
            distance: 1200,
          },
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          likes: 8,
          comments: 2,
          isLiked: true,
        },
        {
          id: '3',
          type: 'connection',
          content: '도서관에서 같은 책을 읽고 있던 분과 연결되었어요!',
          author: {
            id: '3',
            nickname: '책벌레',
          },
          location: {
            name: '국립중앙도서관',
            distance: 800,
          },
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          likes: 12,
          comments: 5,
          isLiked: false,
        },
      ];
      setFeedItems(mockFeedItems);
    } catch (error) {
      console.error('Error loading feed data:', error);
      Alert.alert('오류', '피드 데이터를 불러올 수 없습니다.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadFeedData();
    setRefreshing(false);
  };

  const handleLike = (itemId: string) => {
    setFeedItems(prev => prev.map(item => 
      item.id === itemId 
        ? { 
            ...item, 
            isLiked: !item.isLiked, 
            likes: item.isLiked ? item.likes - 1 : item.likes + 1 
          }
        : item
    ));
  };

  const handleComment = (itemId: string) => {
    Alert.alert('댓글', '댓글 기능이 곧 구현됩니다!');
  };

  const handleShare = (itemId: string) => {
    Alert.alert('공유', '공유 기능이 곧 구현됩니다!');
  };

  const getFilteredItems = () => {
    if (activeFilter === 'all') return feedItems;
    return feedItems.filter(item => {
      switch (activeFilter) {
        case 'spots':
          return item.type === 'spot';
        case 'sparks':
          return item.type === 'spark';
        case 'connections':
          return item.type === 'connection';
        default:
          return true;
      }
    });
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return '방금 전';
    if (diffInMinutes < 60) return `${diffInMinutes}분 전`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}시간 전`;
    return `${Math.floor(diffInMinutes / 1440)}일 전`;
  };

  const getTypeEmoji = (type: string) => {
    switch (type) {
      case 'spot':
        return '💌';
      case 'spark':
        return '✨';
      case 'connection':
        return '🤝';
      default:
        return '💭';
    }
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const filteredItems = getFilteredItems();

  const renderFeedItem = ({ item }: { item: FeedItem }) => (
    <FeedCard>
      <FeedCardHeader>
        <FeedCardAvatar>
          <FeedCardAvatarText>{getInitials(item.author.nickname)}</FeedCardAvatarText>
        </FeedCardAvatar>
        <FeedCardUserInfo>
          <FeedCardUsername>{item.author.nickname}</FeedCardUsername>
          <FeedCardTime>{getTimeAgo(item.createdAt)}</FeedCardTime>
        </FeedCardUserInfo>
        <Text style={{ fontSize: 20 }}>{getTypeEmoji(item.type)}</Text>
      </FeedCardHeader>
      
      <FeedCardContent>{item.content}</FeedCardContent>
      
      <FeedCardLocation>
        📍 {item.location.name} • {item.location.distance}m
      </FeedCardLocation>
      
      <FeedCardActions>
        <ActionButton onPress={() => handleLike(item.id)}>
          <Text style={{ color: item.isLiked ? '#ff6b6b' : '#666' }}>
            {item.isLiked ? '❤️' : '🤍'}
          </Text>
          <ActionButtonText style={{ color: item.isLiked ? '#ff6b6b' : '#666' }}>
            {item.likes}
          </ActionButtonText>
        </ActionButton>
        
        <ActionButton onPress={() => handleComment(item.id)}>
          <Text>💬</Text>
          <ActionButtonText>{item.comments}</ActionButtonText>
        </ActionButton>
        
        <ActionButton onPress={() => handleShare(item.id)}>
          <Text>📤</Text>
          <ActionButtonText>공유</ActionButtonText>
        </ActionButton>
      </FeedCardActions>
    </FeedCard>
  );

  return (
    <Container>
      <HeaderContainer>
        <HeaderTitle>오늘의 인연</HeaderTitle>
        <HeaderSubtitle>근처에서 일어나는 새로운 연결들을 확인해보세요</HeaderSubtitle>
      </HeaderContainer>

      <FilterContainer>
        <FilterButton 
          active={activeFilter === 'all'}
          onPress={() => setActiveFilter('all')}
        >
          <FilterButtonText active={activeFilter === 'all'}>전체</FilterButtonText>
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'spots'}
          onPress={() => setActiveFilter('spots')}
        >
          <FilterButtonText active={activeFilter === 'spots'}>시그널 스팟</FilterButtonText>
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'sparks'}
          onPress={() => setActiveFilter('sparks')}
        >
          <FilterButtonText active={activeFilter === 'sparks'}>스파크</FilterButtonText>
        </FilterButton>
        <FilterButton 
          active={activeFilter === 'connections'}
          onPress={() => setActiveFilter('connections')}
        >
          <FilterButtonText active={activeFilter === 'connections'}>연결</FilterButtonText>
        </FilterButton>
      </FilterContainer>

      {filteredItems.length === 0 ? (
        <EmptyStateContainer>
          <EmptyStateIcon>🌟</EmptyStateIcon>
          <EmptyStateTitle>아직 새로운 인연이 없어요</EmptyStateTitle>
          <EmptyStateSubtitle>
            지도에서 시그널 스팟을 만들어보거나{'\n'}
            근처를 돌아다니면서 새로운 스파크를 만나보세요!
          </EmptyStateSubtitle>
        </EmptyStateContainer>
      ) : (
        <FlatList
          data={filteredItems}
          renderItem={renderFeedItem}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
});

export default FeedScreen;