import React from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type ChatRoomScreenRouteProp = RouteProp<RootStackParamList, 'ChatRoom'>;
type ChatRoomScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'ChatRoom'>;

interface ChatRoomScreenProps {
  route: ChatRoomScreenRouteProp;
  navigation: ChatRoomScreenNavigationProp;
}

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: Date;
  isMe: boolean;
}

const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({ route, navigation }) => {
  const { roomId, roomName } = route.params;
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [inputText, setInputText] = React.useState('');

  React.useLayoutEffect(() => {
    navigation.setOptions({
      title: roomName || '채팅',
    });
  }, [navigation, roomName]);

  const sendMessage = () => {
    if (inputText.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputText,
        userId: 'currentUser',
        userName: '나',
        timestamp: new Date(),
        isMe: true,
      };
      setMessages([...messages, newMessage]);
      setInputText('');
    }
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View className={`mb-3 ${item.isMe ? 'items-end' : 'items-start'}`}>
      {!item.isMe && (
        <Text className="text-xs text-gray-500 mb-1 ml-2">{item.userName}</Text>
      )}
      <View
        className={`max-w-[80%] px-4 py-2 rounded-2xl ${
          item.isMe ? 'bg-blue-500' : 'bg-gray-200'
        }`}
      >
        <Text className={`${item.isMe ? 'text-white' : 'text-gray-900'}`}>
          {item.text}
        </Text>
      </View>
      <Text className="text-xs text-gray-400 mt-1 mx-2">
        {item.timestamp.toLocaleTimeString('ko-KR', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <FlatList
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16 }}
          inverted={false}
          showsVerticalScrollIndicator={false}
        />
        
        <View className="flex-row items-center p-4 border-t border-gray-200">
          <TextInput
            className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
            placeholder="메시지를 입력하세요..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={sendMessage}
            returnKeyType="send"
          />
          <TouchableOpacity
            onPress={sendMessage}
            className="bg-blue-500 rounded-full p-3"
          >
            <Text className="text-white font-medium">전송</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default ChatRoomScreen;