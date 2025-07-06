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

const ChatCard = styled.TouchableOpacity`
  background-color: #ffffff;
  margin: 5px 15px;
  border-radius: 12px;
  padding: 20px;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.1;
  shadow-radius: 2px;
  elevation: 2;
  flex-direction: row;
  align-items: center;
`;

const ChatAvatar = styled.View`
  width: 50px;
  height: 50px;
  border-radius: 25px;
  background-color: #ff6b6b;
  justify-content: center;
  align-items: center;
  margin-right: 15px;
`;

const ChatAvatarText = styled.Text`
  color: #ffffff;
  font-size: 18px;
  font-weight: bold;
`;

const ChatInfo = styled.View`
  flex: 1;
`;

const ChatName = styled.Text`
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 5px;
`;

const ChatLastMessage = styled.Text`
  font-size: 14px;
  color: #666;
  margin-bottom: 5px;
`;

const ChatTime = styled.Text`
  font-size: 12px;
  color: #999;
`;

const ChatMeta = styled.View`
  align-items: flex-end;
`;

const UnreadBadge = styled.View`
  background-color: #ff6b6b;
  border-radius: 10px;
  min-width: 20px;
  height: 20px;
  justify-content: center;
  align-items: center;
  margin-bottom: 5px;
`;

const UnreadText = styled.Text`
  color: #ffffff;
  font-size: 12px;
  font-weight: bold;
  padding: 0 5px;
`;

const OnlineIndicator = styled.View`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: #4caf50;
  position: absolute;
  top: 0;
  right: 0;
  border: 2px solid #ffffff;
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

const SearchContainer = styled.View`
  background-color: #ffffff;
  padding: 15px;
  border-bottom-width: 1px;
  border-bottom-color: #e0e0e0;
`;

const SearchInput = styled.TextInput`
  background-color: #f5f5f5;
  border-radius: 20px;
  padding: 10px 15px;
  font-size: 16px;
  color: #333;
`;

interface ChatRoom {
  id: string;
  participant: {
    id: string;
    nickname: string;
    avatar?: string;
    isOnline: boolean;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
  connectionType: 'spark' | 'spot' | 'direct';
}

const MessagesScreen: React.FC = () => {
  const { user } = useAuth();
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadChatRooms();
  }, []);

  const loadChatRooms = async () => {
    try {
      // TODO: Implement API call to fetch chat rooms
      // Mock data for now
      const mockChatRooms: ChatRoom[] = [
        {
          id: '1',
          participant: {
            id: '1',
            nickname: '커피러버',
            isOnline: true,
          },
          lastMessage: {
            content: '안녕하세요! 같이 커피 드실래요?',
            timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
            isRead: false,
          },
          unreadCount: 2,
          connectionType: 'spot',
        },
        {
          id: '2',
          participant: {
            id: '2',
            nickname: '신비한만남',
            isOnline: false,
          },
          lastMessage: {
            content: '스파크가 생겼네요! 반갑습니다 😊',
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
            isRead: true,
          },
          unreadCount: 0,
          connectionType: 'spark',
        },
        {
          id: '3',
          participant: {
            id: '3',
            nickname: '책벌레',
            isOnline: true,
          },
          lastMessage: {
            content: '같은 책을 읽고 있었다니 신기해요!',
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
            isRead: true,
          },
          unreadCount: 0,
          connectionType: 'spot',
        },
      ];
      setChatRooms(mockChatRooms);
    } catch (error) {
      console.error('Error loading chat rooms:', error);
      Alert.alert('오류', '채팅 목록을 불러올 수 없습니다.');
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadChatRooms();
    setRefreshing(false);
  };

  const handleChatPress = (chatRoom: ChatRoom) => {
    // TODO: Navigate to chat screen
    Alert.alert('채팅', `${chatRoom.participant.nickname}과의 채팅이 곧 구현됩니다!`);
  };

  const getFilteredChatRooms = () => {
    if (!searchQuery.trim()) return chatRooms;
    
    return chatRooms.filter(chatRoom =>
      chatRoom.participant.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chatRoom.lastMessage.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
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

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'spark':
        return '✨';
      case 'spot':
        return '💌';
      default:
        return '💬';
    }
  };

  const getInitials = (name: string) => {
    return name.charAt(0).toUpperCase();
  };

  const filteredChatRooms = getFilteredChatRooms();

  const renderChatItem = ({ item }: { item: ChatRoom }) => (
    <ChatCard onPress={() => handleChatPress(item)}>
      <View style={{ position: 'relative' }}>
        <ChatAvatar>
          <ChatAvatarText>{getInitials(item.participant.nickname)}</ChatAvatarText>
        </ChatAvatar>
        {item.participant.isOnline && <OnlineIndicator />}
      </View>
      
      <ChatInfo>
        <ChatName>
          {item.participant.nickname} {getConnectionIcon(item.connectionType)}
        </ChatName>
        <ChatLastMessage numberOfLines={1}>
          {item.lastMessage.content}
        </ChatLastMessage>
        <ChatTime>{getTimeAgo(item.lastMessage.timestamp)}</ChatTime>
      </ChatInfo>
      
      <ChatMeta>
        {item.unreadCount > 0 && (
          <UnreadBadge>
            <UnreadText>{item.unreadCount}</UnreadText>
          </UnreadBadge>
        )}
      </ChatMeta>
    </ChatCard>
  );

  return (
    <Container>
      <HeaderContainer>
        <HeaderTitle>메시지</HeaderTitle>
        <HeaderSubtitle>새로운 인연들과 대화해보세요</HeaderSubtitle>
      </HeaderContainer>

      <SearchContainer>
        <SearchInput
          placeholder="채팅 검색..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </SearchContainer>

      {filteredChatRooms.length === 0 ? (
        <EmptyStateContainer>
          <EmptyStateIcon>💬</EmptyStateIcon>
          <EmptyStateTitle>
            {searchQuery ? '검색 결과가 없어요' : '아직 메시지가 없어요'}
          </EmptyStateTitle>
          <EmptyStateSubtitle>
            {searchQuery 
              ? '다른 검색어를 입력해보세요.'
              : '시그널 스팟이나 스파크를 통해\n새로운 인연을 만나보세요!'
            }
          </EmptyStateSubtitle>
        </EmptyStateContainer>
      ) : (
        <FlatList
          data={filteredChatRooms}
          renderItem={renderChatItem}
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

export default MessagesScreen;