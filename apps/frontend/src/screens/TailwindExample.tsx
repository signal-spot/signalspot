import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';

// NativeWind를 사용한 Tailwind 예제
export const TailwindExample: React.FC = () => {
  return (
    <ScrollView className="flex-1 bg-white">
      {/* 헤더 섹션 */}
      <View className="px-6 py-4 bg-blue-500">
        <Text className="text-2xl font-bold text-white">Tailwind in React Native</Text>
        <Text className="text-white opacity-80">NativeWind 예제</Text>
      </View>

      {/* 카드 섹션 */}
      <View className="p-6">
        <View className="bg-gray-100 rounded-lg p-4 mb-4">
          <Text className="text-lg font-semibold mb-2">카드 제목</Text>
          <Text className="text-gray-600">
            이것은 Tailwind 클래스를 사용한 카드 컴포넌트입니다.
          </Text>
        </View>

        {/* 버튼들 */}
        <View className="flex-row gap-4 mb-6">
          <TouchableOpacity className="flex-1 bg-blue-500 py-3 rounded-lg">
            <Text className="text-white text-center font-medium">Primary</Text>
          </TouchableOpacity>
          <TouchableOpacity className="flex-1 bg-gray-300 py-3 rounded-lg">
            <Text className="text-gray-700 text-center font-medium">Secondary</Text>
          </TouchableOpacity>
        </View>

        {/* 리스트 아이템들 */}
        <View className="space-y-2">
          {[1, 2, 3].map((item) => (
            <View key={item} className="bg-white border border-gray-200 rounded-lg p-4">
              <Text className="font-medium">리스트 아이템 {item}</Text>
              <Text className="text-sm text-gray-500">설명 텍스트</Text>
            </View>
          ))}
        </View>
      </View>

      {/* 팁 섹션 */}
      <View className="mx-6 mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <Text className="text-yellow-800 font-medium mb-1">💡 팁</Text>
        <Text className="text-yellow-700 text-sm">
          NativeWind는 Tailwind CSS 클래스를 React Native 스타일로 변환합니다.
          웹과 동일한 방식으로 className을 사용할 수 있습니다.
        </Text>
      </View>
    </ScrollView>
  );
};

// Tailwind 클래스 사용 예시:
// - 레이아웃: flex-1, flex-row, justify-center, items-center
// - 간격: p-4, px-6, py-2, m-4, mx-auto, gap-4
// - 배경: bg-white, bg-blue-500, bg-gray-100
// - 텍스트: text-lg, text-2xl, font-bold, text-white, text-center
// - 테두리: border, border-gray-200, rounded-lg, rounded-full
// - 그림자: shadow-sm, shadow-md (iOS만 지원)
// - 반응형: sm:p-4, md:text-lg (크기별 스타일링)