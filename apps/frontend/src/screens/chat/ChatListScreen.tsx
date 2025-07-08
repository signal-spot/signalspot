import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useAuth } from '../../providers/AuthProvider';
import { DesignSystem } from '../../utils/designSystem';
import { Card, Avatar, Badge } from '../../components/common';
import { chatService, ChatSummary } from '../../services/chat.service';

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'active' | 'archived'>('active');

  const loadChats = useCallback(async (query?: string) => {
    try {
      setLoading(true);
      const result = await chatService.getUserChats(
        query,
        1,
        50,
        filter === 'archived'
      );
      setChats(result.chats);
    } catch (error) {
      console.error('Failed to load chats:', error);
      Alert.alert('오류', '채팅 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadChats(searchQuery);
    setRefreshing(false);
  }, [loadChats, searchQuery]);

  const handleSearch = useCallback(
    debounce((query: string) => {
      loadChats(query);
    }, 300),
    [loadChats]
  );

  const handleChatPress = (chat: ChatSummary) => {
    navigation.navigate('ChatDetail', {
      chatId: chat.id,
      otherUser: chat.otherParticipant,
    });
  };

  const formatLastMessageTime = (date: Date) => {
    const now = new Date();
    const messageDate = new Date(date);
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(diffInHours * 60);
      return `${diffInMinutes}분 전`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}시간 전`;
    } else if (diffInHours < 48) {
      return '어제';
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}일 전`;
    }
  };

  const getLastMessagePreview = (chat: ChatSummary) => {
    if (!chat.lastMessage) {
      return '아직 메시지가 없습니다.';
    }

    const { content, type, senderId } = chat.lastMessage;
    const isMyMessage = senderId === user?.id;
    const prefix = isMyMessage ? '나: ' : '';

    switch (type) {
      case 'image':
        return `${prefix}📷 사진`;
      case 'audio':
        return `${prefix}🎵 음성 메시지`;
      case 'location':
        return `${prefix}📍 위치`;
      default:
        return `${prefix}${content}`;
    }
  };

  // Socket event listeners
  useEffect(() => {
    const initializeChat = async () => {
      const connected = await chatService.initialize();
      if (connected) {
        // Listen for new messages to update chat list
        chatService.on('new_message', (data) => {
          setChats(prevChats => {
            const updatedChats = [...prevChats];
            const chatIndex = updatedChats.findIndex(c => c.id === data.chatId);
            
            if (chatIndex !== -1) {
              // Update existing chat
              const chat = updatedChats[chatIndex];
              chat.lastMessage = {
                id: data.message.id,
                content: data.message.content,
                type: data.message.type,
                senderId: data.message.senderId,
                createdAt: data.message.createdAt,
                isRead: false,
              };
              chat.lastActivity = new Date(data.message.createdAt);
              
              if (data.message.senderId !== user?.id) {
                chat.unreadCount += 1;
              }

              // Move to top
              updatedChats.splice(chatIndex, 1);
              updatedChats.unshift(chat);
            }
            
            return updatedChats;
          });
        });

        chatService.on('new_chat', (data) => {
          // Reload chats when a new chat is created
          loadChats(searchQuery);
        });
      }
    };

    initializeChat();

    return () => {
      chatService.off('new_message');
      chatService.off('new_chat');
    };
  }, [loadChats, searchQuery, user?.id]);

  useFocusEffect(
    useCallback(() => {
      loadChats(searchQuery);
    }, [loadChats, searchQuery])
  );

  const renderChatItem = ({ item }: { item: ChatSummary }) => (
    <TouchableOpacity onPress={() => handleChatPress(item)}>
      <Card style={styles.chatCard}>
        <View style={styles.chatHeader}>
          <View style={styles.avatarContainer}>
            <Avatar
              name={item.otherParticipant.username}
              size="large"
              imageUrl={item.otherParticipant.avatarUrl}
              showBorder
            />
            {item.otherParticipant.isOnline && (
              <View style={styles.onlineIndicator} />
            )}
          </View>
          
          <View style={styles.chatContent}>
            <View style={styles.chatTitleRow}>
              <Text style={styles.chatTitle}>
                {item.otherParticipant.username}
              </Text>
              <Text style={styles.chatTime}>
                {formatLastMessageTime(item.lastActivity)}
              </Text>
            </View>
            
            <View style={styles.chatMessageRow}>
              <Text
                style={[
                  styles.lastMessage,
                  item.unreadCount > 0 && styles.unreadMessage,
                ]}
                numberOfLines={1}
              >
                {getLastMessagePreview(item)}
              </Text>
              {item.unreadCount > 0 && (
                <Badge variant="primary" size="small">
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Badge>
              )}
            </View>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={DesignSystem.colors.primary} />
        <Text style={styles.loadingText}>채팅 목록을 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>💬 메시지</Text>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="대화 상대 검색..."
            placeholderTextColor={DesignSystem.colors.text.tertiary}
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              handleSearch(text);
            }}
          />
        </View>

        {/* Filter Tabs */}
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'active' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('active')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'active' && styles.filterTabTextActive,
              ]}
            >
              활성
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.filterTab,
              filter === 'archived' && styles.filterTabActive,
            ]}
            onPress={() => setFilter('archived')}
          >
            <Text
              style={[
                styles.filterTabText,
                filter === 'archived' && styles.filterTabTextActive,
              ]}
            >
              보관함
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Chat List */}
      {chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>
            {filter === 'archived' ? '보관된 채팅이 없어요' : '아직 채팅이 없어요'}
          </Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'archived' 
              ? '보관된 채팅이 여기에 표시됩니다.'
              : '스파크를 통해 새로운 인연과 대화를 시작해보세요!'
            }
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
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

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

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
    marginBottom: DesignSystem.spacing.lg,
  },
  searchContainer: {
    marginBottom: DesignSystem.spacing.lg,
  },
  searchInput: {
    ...DesignSystem.typography.body,
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.borderRadius.lg,
    paddingHorizontal: DesignSystem.spacing.lg,
    paddingVertical: DesignSystem.spacing.md,
    color: DesignSystem.colors.text.primary,
  },
  filterContainer: {
    flexDirection: 'row',
    backgroundColor: DesignSystem.colors.background.secondary,
    borderRadius: DesignSystem.borderRadius.md,
    padding: DesignSystem.spacing.xs,
  },
  filterTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: DesignSystem.spacing.sm,
    borderRadius: DesignSystem.borderRadius.sm,
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
  chatCard: {
    marginBottom: DesignSystem.spacing.md,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginRight: DesignSystem.spacing.md,
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: DesignSystem.colors.success,
    borderWidth: 2,
    borderColor: DesignSystem.colors.background.primary,
  },
  chatContent: {
    flex: 1,
  },
  chatTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: DesignSystem.spacing.xs,
  },
  chatTitle: {
    ...DesignSystem.typography.headline,
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
  },
  chatTime: {
    ...DesignSystem.typography.caption1,
    color: DesignSystem.colors.text.tertiary,
  },
  chatMessageRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    ...DesignSystem.typography.subheadline,
    color: DesignSystem.colors.text.secondary,
    flex: 1,
    marginRight: DesignSystem.spacing.md,
  },
  unreadMessage: {
    color: DesignSystem.colors.text.primary,
    fontWeight: '600',
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
});

export default ChatListScreen;