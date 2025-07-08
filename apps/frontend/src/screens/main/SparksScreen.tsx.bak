import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useAuth } from '../../providers/AuthProvider';
import styled from 'styled-components/native';

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

const SparkCard = styled.TouchableOpacity`
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

const SparkHeader = styled.View`
  flex-direction: row;
  align-items: center;
  margin-bottom: 15px;
`;

const SparkIcon = styled.Text`
  font-size: 24px;
  margin-right: 10px;
`;

const SparkInfo = styled.View`
  flex: 1;
`;

const SparkLocation = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 2px;
`;

const SparkTime = styled.Text`
  font-size: 12px;
  color: #666;
`;

const SparkDetails = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 15px;
`;

const SparkActions = styled.View`
  flex-direction: row;
  justify-content: space-between;
  gap: 10px;
`;

const ActionButton = styled.TouchableOpacity<{ variant?: 'primary' | 'secondary' }>`
  flex: 1;
  padding: 12px;
  border-radius: 8px;
  background-color: ${props => props.variant === 'primary' ? '#ff6b6b' : '#f0f0f0'};
  align-items: center;
`;

const ActionButtonText = styled.Text<{ variant?: 'primary' | 'secondary' }>`
  font-size: 14px;
  font-weight: bold;
  color: ${props => props.variant === 'primary' ? '#ffffff' : '#333333'};
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

const TabContainer = styled.View`
  flex-direction: row;
  background-color: #ffffff;
  padding: 15px;
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
`;

const TabButton = styled.TouchableOpacity<{ active?: boolean }>`
  flex: 1;
  padding: 10px;
  align-items: center;
  border-bottom-width: 2px;
  border-bottom-color: ${props => props.active ? '#ff6b6b' : 'transparent'};
`;

const TabButtonText = styled.Text<{ active?: boolean }>`
  font-size: 16px;
  font-weight: bold;
  color: ${props => props.active ? '#ff6b6b' : '#666'};
`;

interface Spark {
  id: string;
  type: 'potential' | 'confirmed' | 'declined';
  location: {
    name: string;
    address: string;
  };
  timestamp: string;
  distance: number;
  duration: number; // minutes spent in proximity
  mutualInterests?: string[];
  status: 'pending' | 'accepted' | 'declined' | 'expired';
}

const SparksScreen: React.FC = () => {
  const { user } = useAuth();
  const [sparks, setSparks] = useState<Spark[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<'pending' | 'matched' | 'history'>('pending');

  useEffect(() => {
    loadSparks();
  }, []);

  const loadSparks = async () => {
    try {
      // TODO: Implement API call to fetch sparks
      // Mock data for now
      const mockSparks: Spark[] = [
        {
          id: '1',
          type: 'potential',
          location: {
            name: '스타벅스 강남점',
            address: '서울시 강남구 테헤란로',
          },
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          distance: 5,
          duration: 15,
          mutualInterests: ['커피', '독서', '음악'],
          status: 'pending',
        },
        {
          id: '2',
          type: 'confirmed',
          location: {
            name: '홍대 걷고싶은거리',
            address: '서울시 마포구 홍대',
          },
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          distance: 3,
          duration: 25,
          mutualInterests: ['음악', '예술', '영화'],
          status: 'accepted',
        },
        {
          id: '3',
          type: 'potential',
          location: {
            name: '국립중앙도서관',
            address: '서울시 서초구 반포대로',
          },
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
          distance: 8,
          duration: 45,
          mutualInterests: ['독서', '학습', '조용한 공간'],
          status: 'pending',
        },
      ];
      setSparks(mockSparks);
    } catch (error) {
      console.error('Error loading sparks:', error);
      Alert.alert('오류', '스파크 데이터를 불러올 수 없습니다.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSparks();
    setRefreshing(false);
  };

  const handleSparkAction = (sparkId: string, action: 'accept' | 'decline') => {
    setSparks(prev => prev.map(spark => 
      spark.id === sparkId 
        ? { ...spark, status: action === 'accept' ? 'accepted' : 'declined' }
        : spark
    ));
    
    const actionText = action === 'accept' ? '수락했습니다' : '거절했습니다';
    Alert.alert('스파크', `스파크를 ${actionText}.`);
  };

  const getFilteredSparks = () => {
    switch (activeTab) {
      case 'pending':
        return sparks.filter(spark => spark.status === 'pending');
      case 'matched':
        return sparks.filter(spark => spark.status === 'accepted');
      case 'history':
        return sparks.filter(spark => spark.status === 'declined' || spark.status === 'expired');
      default:
        return sparks;
    }
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

  const getSparkIcon = (type: string) => {
    switch (type) {
      case 'potential':
        return '✨';
      case 'confirmed':
        return '🎯';
      default:
        return '💫';
    }
  };

  const filteredSparks = getFilteredSparks();

  const renderSparkItem = ({ item }: { item: Spark }) => (
    <SparkCard>
      <SparkHeader>
        <SparkIcon>{getSparkIcon(item.type)}</SparkIcon>
        <SparkInfo>
          <SparkLocation>{item.location.name}</SparkLocation>
          <SparkTime>{getTimeAgo(item.timestamp)}</SparkTime>
        </SparkInfo>
      </SparkHeader>
      
      <SparkDetails>
        📍 {item.location.address}{'\n'}
        🕐 {item.duration}분 동안 근처에 있었음 • {item.distance}m 거리{'\n'}
        {item.mutualInterests && `💫 공통 관심사: ${item.mutualInterests.join(', ')}`}
      </SparkDetails>
      
      {item.status === 'pending' && (
        <SparkActions>
          <ActionButton variant="secondary" onPress={() => handleSparkAction(item.id, 'decline')}>
            <ActionButtonText variant="secondary">거절</ActionButtonText>
          </ActionButton>
          <ActionButton variant="primary" onPress={() => handleSparkAction(item.id, 'accept')}>
            <ActionButtonText variant="primary">수락</ActionButtonText>
          </ActionButton>
        </SparkActions>
      )}
      
      {item.status === 'accepted' && (
        <SparkActions>
          <ActionButton variant="primary" onPress={() => Alert.alert('채팅', '채팅 기능이 곧 구현됩니다!')}>
            <ActionButtonText variant="primary">채팅하기</ActionButtonText>
          </ActionButton>
        </SparkActions>
      )}
    </SparkCard>
  );

  return (
    <Container>
      <HeaderContainer>
        <HeaderTitle>스파크</HeaderTitle>
        <HeaderSubtitle>근처에서 만난 특별한 연결들</HeaderSubtitle>
      </HeaderContainer>

      <TabContainer>
        <TabButton 
          active={activeTab === 'pending'}
          onPress={() => setActiveTab('pending')}
        >
          <TabButtonText active={activeTab === 'pending'}>대기 중</TabButtonText>
        </TabButton>
        <TabButton 
          active={activeTab === 'matched'}
          onPress={() => setActiveTab('matched')}
        >
          <TabButtonText active={activeTab === 'matched'}>매칭됨</TabButtonText>
        </TabButton>
        <TabButton 
          active={activeTab === 'history'}
          onPress={() => setActiveTab('history')}
        >
          <TabButtonText active={activeTab === 'history'}>히스토리</TabButtonText>
        </TabButton>
      </TabContainer>

      {filteredSparks.length === 0 ? (
        <EmptyStateContainer>
          <EmptyStateIcon>✨</EmptyStateIcon>
          <EmptyStateTitle>
            {activeTab === 'pending' && '대기 중인 스파크가 없어요'}
            {activeTab === 'matched' && '매칭된 스파크가 없어요'}
            {activeTab === 'history' && '히스토리가 없어요'}
          </EmptyStateTitle>
          <EmptyStateSubtitle>
            {activeTab === 'pending' && '근처를 돌아다니면서 새로운 스파크를 만나보세요!'}
            {activeTab === 'matched' && '스파크를 수락해서 새로운 인연을 만들어보세요!'}
            {activeTab === 'history' && '스파크를 경험하면 여기에 기록됩니다.'}
          </EmptyStateSubtitle>
        </EmptyStateContainer>
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
    </Container>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingBottom: 20,
  },
});

export default SparksScreen;