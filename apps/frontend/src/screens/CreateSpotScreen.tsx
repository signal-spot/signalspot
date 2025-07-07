import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

type CreateSpotScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateSpot'>;

interface CreateSpotScreenProps {
  navigation: CreateSpotScreenNavigationProp;
}

const CreateSpotScreen: React.FC<CreateSpotScreenProps> = ({ navigation }) => {
  const [spotName, setSpotName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [tags, setTags] = React.useState('');

  const handleCreateSpot = () => {
    // TODO: Implement spot creation logic
    console.log('Creating spot:', { spotName, description, category, tags });
    navigation.goBack();
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1 px-4">
        <View className="py-6">
          <Text className="text-2xl font-bold mb-6">새로운 스팟 만들기</Text>
          
          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">스팟 이름</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3"
              placeholder="스팟 이름을 입력하세요"
              value={spotName}
              onChangeText={setSpotName}
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">설명</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3"
              placeholder="스팟에 대한 설명을 입력하세요"
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">카테고리</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3"
              placeholder="카테고리를 선택하세요"
              value={category}
              onChangeText={setCategory}
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">태그</Text>
            <TextInput
              className="border border-gray-300 rounded-lg px-4 py-3"
              placeholder="태그를 입력하세요 (쉼표로 구분)"
              value={tags}
              onChangeText={setTags}
            />
          </View>

          <View className="mb-6">
            <Text className="text-gray-700 font-medium mb-2">사진 추가</Text>
            <TouchableOpacity className="border border-dashed border-gray-300 rounded-lg p-8 items-center">
              <Text className="text-gray-500">사진을 추가하려면 탭하세요</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View className="px-4 pb-4">
        <TouchableOpacity
          onPress={handleCreateSpot}
          className="bg-blue-500 rounded-lg py-4 items-center"
          disabled={!spotName.trim()}
        >
          <Text className="text-white font-semibold text-lg">스팟 만들기</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CreateSpotScreen;